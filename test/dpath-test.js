const dpack = require("@etherpacks/dpack");
const ethers = require('ethers')
const {b32, send, want} = require("./utils/helpers");
const lib = require('../dmap.js')
const {
    padRight,
    snapshot,
    revert,
    wait,
    get_signers
} = require("./utils/helpers");

const { deploy_mock_dmap } = require('../task/deploy-mock-dmap')
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
const solc_output = require('../output.json')
const ErrorWrapper_solc_output = solc_output.contracts["ErrorWrapper.sol"]["ErrorWrapper"]

describe('dpath', ()=> {
    const LOCK = '0x80'+'00'.repeat(31)
    let dmap
    let freezone
    let rootzone
    let [ali, bob, cat] = get_signers(process.env.TEST_MNEMONIC).map(
        s => s.connect(provider)
    );
    let [ALI, BOB, CAT] = [ali, bob, cat].map(x => x.address);
    const GLIMIT = 1000000


    before(async ()=>{
        await deploy_mock_dmap({name: 'nombre'}, provider, ali)
        const dapp = await dpack.load(require('../pack/dmap_full_nombre.dpack.json'), ethers, ali)
        dmap = dapp.dmap
        rootzone = dapp.rootzone
        freezone = dapp.freezone

        // ErrorWrapper with FreeZone abi
        const freewrap_type = ErrorWrapper_solc_output
        freewrap_type.bytecode = freewrap_type.evm.bytecode
        const freewrap_deployer = new ethers.ContractFactory(
            freezone.interface,
            freewrap_type.bytecode,
            ali
        )
        freewrap = await freewrap_deployer.deploy(freezone.address)
        await freewrap.deployed()

        await snapshot(provider)
    })

    after(async ()=>{
        await revert(provider)
    })

    beforeEach(async ()=>{
        await revert(provider)
    })

    describe('walk', () => {
        const test_name = b32('testname1')
        const free_name = b32('free')
        const test_data = '0x' + '01'.repeat(32)
        const OPEN = '0x' + '00'.repeat(32)

        beforeEach(async ()=>{
            await wait(provider, 60)
            await send(freezone.take, test_name, {gasLimit: GLIMIT})
            await send(freezone.set, test_name, LOCK, test_data, {gasLimit: GLIMIT})
            await wait(provider, 60)
            await send(freezone.take, free_name, {gasLimit: GLIMIT})
            await send(freezone.set, free_name, OPEN, padRight(freezone.address), {gasLimit: GLIMIT})
        })

        it('empty path', async () => {
            const res = await lib.walk(dmap, '')
            want(res.data.slice(0, 42)).eq(rootzone.address.toLowerCase(), {gasLimit: GLIMIT})
            want(res.meta).eq(LOCK)
        })

        it('optional leading rune', async()=>{
            const included = await lib.walk(dmap, ':free')
            const excluded = await lib.walk(dmap, 'free')
            const period = await lib.walk(dmap, '.free')
            want(included.data.slice(0,42)).eq(freezone.address.toLowerCase())
            want(included.meta).eq(LOCK)
            want(excluded.data.slice(0,42)).eq(freezone.address.toLowerCase())
            want(excluded.meta).eq(LOCK)
            want(period.data.slice(0,42)).eq(freezone.address.toLowerCase())
            want(period.meta).eq(LOCK)
        })

        it('unlocked always works', async()=>{
            const res = await lib.walk(dmap, '.free.free.free.testname1')
            want(res.data).eq(test_data)
            want(res.meta).eq(LOCK)
        })

        it('rejected when not locked', async()=>{
            await want(
                lib.walk(dmap, 'free:free')
            ).rejectedWith('Entry is not locked')
        })

        it('reject malformed paths', async()=>{
            await want(
                lib.walk(dmap, ':free.free:testname1')
            ).rejectedWith('Encountered \':\' in unlocked subpath')

            await want(
                lib.walk(dmap, '.free:testname1')
            ).rejectedWith('Encountered \':\' in unlocked subpath')

            await want(
                lib.walk(dmap, ':free:test_name1')
            ).rejectedWith('Cannot read properties of null')

            await want(
                lib.walk(dmap, ':Free:testname1')
            ).rejectedWith('Cannot read properties of null')

            await want(
                lib.walk(dmap, ':free;testname1')
            ).rejectedWith('Cannot read properties of null')

            await want(
                lib.walk(dmap, 'free,testname1')
            ).rejectedWith('Cannot read properties of null')
        })

        it('zero register', async()=>{
            const unset = await lib.walk(dmap, ':free.unset')
            want(unset.data).eq('0x' + '00'.repeat(32))
            want(unset.meta).eq(OPEN)

            await want(
                lib.walk(dmap, ':free.unset.unset')
            ).rejectedWith('zero register')
        })

        it('valid paths', async()=>{
            const res1 = await lib.walk(dmap, ':free:testname1')
            want(res1.data).eq(test_data)
            want(res1.meta).eq(LOCK)

            const res2 = await lib.walk(dmap, ':free.free.testname1')
            want(res2.data).eq(test_data)
            want(res2.meta).eq(LOCK)
        })
    })
})

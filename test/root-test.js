const dpack = require('@etherpacks/dpack')
const ethers = require('ethers')
const { b32, send, want} = require('./utils/helpers')

const {
    expectEvent,
    padRight,
    check_gas,
    check_entry,
    get_signers,
    snapshot,
    revert,
    wait,
    wrap_fail,
    wrap_send
} = require('./utils/helpers')
const {bounds} = require("./bounds");
const debug = require('debug')('dmap:test')
const constants = ethers.constants

const { deploy_mock_dmap } = require('../task/deploy-mock-dmap')
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
const solc_output = require('../output.json')
const ErrorWrapper_solc_output = solc_output.contracts["ErrorWrapper.sol"]["ErrorWrapper"]


describe('rootzone', ()=>{
    let dmap
    let rootzone
    let freezone
    let rootwrap

    let [ali, bob, cat] = get_signers(process.env.TEST_MNEMONIC).map(
        s => s.connect(provider)
    );
    let [ALI, BOB, CAT] = [ali, bob, cat].map(x => x.address);

    const zone1 = '0x' + '0'.repeat(38) + '11'
    const zone2 = '0x' + '0'.repeat(38) + '12'

    const delay_period = 60 * 60 * 31
    const LOCK = '0x80'+'00'.repeat(31)

    function getCommitment (name, zone, salt=b32('salt')) {
        const types = [ "bytes32", "bytes32", "address" ]
        const encoded = ethers.utils.defaultAbiCoder.encode(types, [ salt, name, zone ])
        return ethers.utils.keccak256(encoded)
    }

    const GLIMIT = 1000000

    before(async ()=>{

        await deploy_mock_dmap({name: 'nombre'}, provider, ali)
        const dapp = await dpack.load(require('../pack/dmap_full_nombre.dpack.json'), ethers, ali)
        dmap = dapp.dmap
        rootzone = dapp.rootzone
        freezone = dapp.freezone

        // ErrorWrapper with FreeZone abi
        const rootwrap_type = ErrorWrapper_solc_output
        rootwrap_type.bytecode = rootwrap_type.evm.bytecode
        const rootwrap_deployer = new ethers.ContractFactory(
            rootzone.interface,
            rootwrap_type.bytecode,
            ali
        )
        rootwrap = await rootwrap_deployer.deploy(rootzone.address)
        await rootwrap.deployed()

        await snapshot(provider)
    })

    beforeEach(async ()=>{
        await revert(provider)
    })

    it('init', async () => {
        const mark = getCommitment(b32('free'), freezone.address)
        const filters = [
            rootzone.filters.Hark(mark),
            rootzone.filters.Etch('0x' + b32('free').toString('hex'), freezone.address),
        ]
        for (const f of filters) {
            const res = await rootzone.queryFilter(f)
            want(res.length).to.eql(1)
            debug(res[0].event, res[0].args)
        }
        want(await rootzone.dmap()).to.eql(dmap.address)
        want(Number(await rootzone.last())).to.be.greaterThan(0)
        want(await rootzone.mark()).to.eql(mark)
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
        await check_entry(dmap, rootzone.address, b32('zone2'), constants.HashZero, constants.HashZero)
    })

    it('cooldown', async ()=>{
        const commitment = getCommitment(b32('zone1'), zone1)
        await wrap_fail(provider, rootwrap, 'ErrPending()', rootwrap.hark, commitment, { value: ethers.utils.parseEther('1') })
        await wait(provider, 60 * 60 * 30)
        await wrap_fail(provider, rootwrap, 'ErrPending()', rootwrap.hark, commitment, { value: ethers.utils.parseEther('1') })
        await wait(provider, 60 * 60 )
        await wrap_send(provider, rootwrap, rootwrap.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT } )
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    })

    it('fee', async ()=>{
        await wait(provider, delay_period)
        const aliStartBalance = await ali.getBalance()
        const commitment = getCommitment(b32('zone1'), zone1)
        await wrap_fail(provider, rootwrap, 'ErrPayment()', rootwrap.hark, commitment, { gasLimit: GLIMIT })
        await wrap_fail(provider, rootwrap, 'ErrPayment()', rootwrap.hark, commitment, { value: ethers.utils.parseEther('0.9') })
        await wrap_fail(provider, rootwrap, 'ErrPayment()', rootwrap.hark, commitment, { value: ethers.utils.parseEther('1.1') })
        await wrap_send(provider, rootwrap, rootwrap.hark, commitment, { value: ethers.utils.parseEther('1.0'), gasLimit: GLIMIT })
        const aliEndBalance = await ali.getBalance()
        want((aliStartBalance.sub(ethers.utils.parseEther('1.0'))).gt(aliEndBalance)).true
        want((aliStartBalance.sub(ethers.utils.parseEther('1.5'))).lt(aliEndBalance)).true
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    })

    it('etch fail wrong hash', async ()=>{
        await wait(provider, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        await wrap_send(provider, rootwrap, rootwrap.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })
        await wrap_fail(provider, rootwrap, 'ErrExpired()', rootwrap.etch, b32('wrong_salt'), b32('zone1'), zone1, {gasLimit: GLIMIT} )
        await wrap_send(provider, rootwrap, rootwrap.etch, b32('salt'), b32('zone1'), zone1, {gasLimit: GLIMIT})
        await check_entry(dmap, rootzone.address, b32('zone1'), LOCK, padRight(zone1))
    })

    it('error priority', async () => {
        await wait(provider, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        await wrap_send(provider, rootwrap, rootwrap.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })

        // pending, payment, receipt
        await wrap_fail(provider, rootwrap, 'ErrPending()', rootwrap.hark, commitment, { value: ethers.utils.parseEther('0.9'), gasLimit: GLIMIT })
        // payment, receipt
        await wait(provider, delay_period)
        await wrap_fail(provider, rootwrap, 'ErrPayment()', rootwrap.hark, commitment, { value: ethers.utils.parseEther('0.9'), gasLimit: GLIMIT })

        /* TODO set coinbase in ganache?
        // receipt
        await provider.send(
            "evm_setCoinbase", [rootzone.address] // not payable
        )
        await wrap_fail(provider, rootzone.address, 'ErrReceipt', rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
         */
    })

    it('etch fail rewrite zone', async ()=>{
        await wait(provider, delay_period)
        const commitment = getCommitment(b32('free'), zone1)
        await wrap_send(provider, rootwrap, rootwrap.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })
        await wrap_fail(provider, rootwrap, 'LOCK()', rootwrap.etch, b32('salt'), b32('free'), zone1, {gasLimit: GLIMIT})
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    })

    it('state updates', async ()=>{
        await wait(provider, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        await wrap_send(provider, rootwrap, rootwrap.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })

        await wait(provider, delay_period)
        const newCommitment = getCommitment(b32('zone2'), zone2)
        await wrap_send(provider, rootwrap, rootwrap.hark, newCommitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })

        await wrap_fail(provider, rootwrap, 'ErrExpired()', rootwrap.etch, b32('salt'), b32('zone1'), zone1, {gasLimit: GLIMIT })
        await wrap_send(provider, rootwrap, rootwrap.etch, b32('salt'), b32('zone2'), zone2, { gasLimit: GLIMIT})

        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
        await check_entry(dmap, rootzone.address, b32('zone2'), LOCK, padRight(zone2))
    })

    it('Hark event', async () => {
        await wait(provider, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        const rx = await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })
        expectEvent(rx, "Hark", [commitment])
    })

    it('Etch event', async () => {
        await wait(provider, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })
        const rx = await send(rootzone.etch, b32('salt'), b32('zone1'), zone1, {gasLimit: GLIMIT})
        expectEvent(rx, "Etch", ['0x' + b32('zone1').toString('hex'), zone1])
        await check_entry(dmap, rootzone.address, b32('zone1'), LOCK, padRight(zone1))
    })

    // TODO no setCoinbase
    /*
    it('coinbase recursive callback', async () => {
        const mc_type = await ethers.getContractFactory('RecursiveCoinbase', ali)
        const mc = await mc_type.deploy()
        await provider.send(
            "evm_setCoinbase", [mc.address]
        )

        await wait(provider, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.hark, commitment, {value: ethers.utils.parseEther('1')})
        want(await rootzone.mark()).to.eql(commitment)
    })
    */

    describe('gas', () => {
        const commitment = getCommitment(b32('zone1'), zone1)
        it('hark', async () => {
            await wait(provider, delay_period)
            const rx = await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })
            const bound = bounds.rootzone.hark
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })

        it('etch', async () => {
            await wait(provider, delay_period)
            await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1'), gasLimit: GLIMIT })
            const rx = await send(rootzone.etch, b32('salt'), b32('zone1'), zone1, {gasLimit: GLIMIT})
            const bound = bounds.rootzone.etch
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })
    })
})

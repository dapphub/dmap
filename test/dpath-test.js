const dpack = require("@etherpacks/dpack");
const hh = require("hardhat");
const {b32, revert, send, snapshot, want} = require("minihat");
const lib = require('../dmap.js')
const {padRight} = require("./utils/helpers");

describe('dpath', ()=> {
    const LOCK = '0x80'+'00'.repeat(31)
    let dmap
    let freezone

    before(async ()=>{
        await hh.run('deploy-mock-dmap')
        const dapp = await dpack.load(require('../pack/dmap_full_hardhat.dpack.json'), hh.ethers)
        dmap = dapp.dmap
        freezone = dapp.freezone
        await snapshot(hh)
    })

    after(async ()=>{
        await hh.network.provider.send("hardhat_reset")
    })

    beforeEach(async ()=>{
        await revert(hh)
    })

    describe('walk', () => {
        const test_name = b32('testname1')
        const free_name = b32('free')
        const test_data = '0x' + '01'.repeat(32)
        const OPEN = '0x' + '00'.repeat(32)

        beforeEach(async ()=>{
            await send(freezone.take, test_name)
            await send(freezone.set, test_name, LOCK, test_data)
            await send(freezone.take, free_name)
            await send(freezone.set, free_name, OPEN, padRight(freezone.address))
        })

        it('optional leading rune', async()=>{
            const included = await lib.walk(dmap, ':free')
            const excluded = await lib.walk(dmap, 'free')
            const period = await lib.walk(dmap, '.free')
            want(included.data.slice(0,42)).eq(freezone.address.toLowerCase())
            want(excluded.data.slice(0,42)).eq(freezone.address.toLowerCase())
            want(period.data.slice(0,42)).eq(freezone.address.toLowerCase())
        })

        it('unlocked always works', async()=>{
            const res = await lib.walk(dmap, '.free.free.free.testname1')
            want(res.data).eq(test_data)
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

            await want(
                lib.walk(dmap, ':free.unset.unset')
            ).rejectedWith('zero register')
        })

        it('valid paths', async()=>{
            const res1 = await lib.walk(dmap, ':free:testname1')
            want(res1.data).eq(test_data)

            const res2 = await lib.walk(dmap, ':free.free.testname1')
            want(res2.data).eq(test_data)
        })
    })
})

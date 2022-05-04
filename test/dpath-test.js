const dpack = require("@etherpacks/dpack");
const hh = require("hardhat");
const ethers = hh.ethers
const {b32, revert, send, snapshot, want} = require("minihat");
const lib = require('../dmap.js')
const {padRight} = require("./utils/helpers");

describe('dpath', ()=> {
    const LOCK = `0x${'00'.repeat(31)}01`
    let dmap
    let freezone
    let rootzone

    before(async ()=>{
        await hh.run('dmap-mock-deploy')
        const [signer] = await ethers.getSigners()
        const dapp = await dpack.load(require('../pack/dmap_full_hardhat.dpack.json'), hh.ethers, signer)
        dmap = dapp.dmap
        freezone = dapp.freezone
        rootzone = dapp.rootzone
        await snapshot(hh)
    })

    after(async ()=>{
        await hh.network.provider.send("hardhat_reset")
    })

    beforeEach(async ()=>{
        await revert(hh)
    })

    describe('walk', () => {
        const test_name = b32('testname')
        const free_name = b32('free')
        const test_data = '0x' + '01'.repeat(32)
        const OPEN = '0x' + '00'.repeat(32)

        beforeEach(async ()=>{
            await send(freezone.take, test_name)
            await send(freezone.set, test_name, LOCK, test_data)
            await send(freezone.take, free_name)
            await send(freezone.set, free_name, OPEN, padRight(freezone.address))
        })

        it('empty path', async () => {
            const res = await lib.walk(dmap, '')
            want(res.data.slice(0, 42)).eq(rootzone.address.toLowerCase())
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
            const res = await lib.walk(dmap, '.free.free.free.testname')
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
                lib.walk(dmap, ':free.free:testname')
            ).rejectedWith('Encountered \':\' in unlocked subpath')

            await want(
                lib.walk(dmap, '.free:testname')
            ).rejectedWith('Encountered \':\' in unlocked subpath')

            await want(
                lib.walk(dmap, ':free:testname1')
            ).rejectedWith('Invalid dpath')

            await want(
                lib.walk(dmap, ':free:test_name')
            ).rejectedWith('Invalid dpath')

            await want(
                lib.walk(dmap, ':Free:testname')
            ).rejectedWith('Invalid dpath')

            await want(
                lib.walk(dmap, ':free;testname')
            ).rejectedWith('Invalid dpath')

            await want(
                lib.walk(dmap, 'free,testname')
            ).rejectedWith('Invalid dpath')
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
            const res1 = await lib.walk(dmap, ':free:testname')
            want(res1.data).eq(test_data)
            want(res1.meta).eq(LOCK)

            const res2 = await lib.walk(dmap, ':free.free.testname')
            want(res2.data).eq(test_data)
            want(res2.meta).eq(LOCK)
        })
    })
})

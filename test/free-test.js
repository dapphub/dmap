const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { b32, fail, revert, send, snapshot, want } = require('minihat')

describe('freezone', ()=>{
    let dmap
    let rootzone
    let freezone

    let ali, bob, cat
    let ALI, BOB, CAT

    const key = b32('123')
    const value = b32('abc')
    const value2 = b32('def')
    const lock = '0x' + '0'.repeat(63) + '1'
    const open = '0x' + '0'.repeat(64)

    before(async ()=>{
        [ali, bob, cat] = await ethers.getSigners();
        [ALI, BOB, CAT] = [ali, bob, cat].map(x => x.address)

        await hh.run('deploy-mock-dmap')
        const dapp = await dpack.load(require('../pack/dmap_full_hardhat.dpack.json'), hh.ethers)
        dmap = dapp.dmap
        rootzone = dapp.rootzone
        freezone = dapp.freezone
        await snapshot(hh)
    })

    beforeEach(async ()=>{
        await revert(hh)
    })

    it('set without control', async ()=>{
        await fail('ERR_SET', freezone.set, key, value, lock)
    })

    it('set after take', async ()=>{
        await send(freezone.take, key)
        await send(freezone.set, key, value, open)
        const [res_value, res_flags] = await dmap.get(freezone.address, key)

        want(ethers.utils.hexlify(value)).eq(res_value)
        want(ethers.utils.hexlify(open)).eq(res_flags)

        await send(freezone.set, key, value2, lock)
        const [res_value_2, res_flags_2] = await dmap.get(freezone.address, key)

        want(ethers.utils.hexlify(value2)).eq(res_value_2)
        want(ethers.utils.hexlify(lock)).eq(res_flags_2)
    })

    it('sets after give', async ()=>{
        await send(freezone.take, key)
        await send(freezone.give, key, BOB)

        await fail('ERR_SET', freezone.set, key, value, lock)

        await send(freezone.connect(bob).set, key, value, lock)
        const [res_value, res_flags] = await dmap.connect(bob).get(freezone.address, key)

        want(ethers.utils.hexlify(value)).eq(res_value)
        want(ethers.utils.hexlify(lock)).eq(res_flags)
    })

    it('take taken', async ()=>{
        await send(freezone.take, key)

        await fail('ERR_TAKEN', freezone.take, key)
        await fail('ERR_TAKEN', freezone.connect(bob).take, key)

        await send(freezone.give, key, BOB)

        await fail('ERR_TAKEN', freezone.take, key)
        await fail('ERR_TAKEN', freezone.connect(cat).take, key)
    })

    it('give without control', async ()=>{
        await fail('ERR_GIVE', freezone.give, key, BOB)
        await fail('ERR_SET', freezone.connect(bob).set, key, value, lock)

        await send(freezone.take, key)
        await send(freezone.give, key, BOB)
        await fail('ERR_GIVE', freezone.give, key, CAT)
    })
})

const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { b32, fail, revert, send, snapshot, want } = require('minihat')
const assert = require('assert');
const lib = require('../dmap.js')

describe('freezone', ()=>{
    let dmap
    let rootzone
    let freezone

    let ali, bob, cat
    let ALI, BOB, CAT

    const key    = b32('123')
    const value1 = b32('abc')
    const value2 = b32('def')
    const lock = '0x' + '0'.repeat(63) + '1'
    const open = '0x' + '0'.repeat(64)
    const cid      = 'bafkreidsszpx34yqnshrtuszx7n77zxttk2s54kc2m5cftjutaumxe67fa'
    const cidLimit = 'bafkreidsszpx34yqnshrtuszx7n77zxttk2s54kc2m5cftjutaumxe67fa0123'
    const cidLong  = 'bafkreidsszpx34yqnshrtuszx7n77zxttk2s54kc2m5cftjutaumxe67fa01234'

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
        await fail('ERR_SET', freezone.set, key, value1, lock)
    })

    it('set after take', async ()=>{
        await send(freezone.take, key)
        await send(freezone.set, key, value1, open)
        const [res_value, res_flags] = await dmap.get(freezone.address, key)

        want(ethers.utils.hexlify(value1)).eq(res_value)
        want(ethers.utils.hexlify(open)).eq(res_flags)

        await send(freezone.set, key, value2, lock)
        const [res_value_2, res_flags_2] = await dmap.get(freezone.address, key)

        want(ethers.utils.hexlify(value2)).eq(res_value_2)
        want(ethers.utils.hexlify(lock)).eq(res_flags_2)

        await fail('LOCK', freezone.set, key, value1, lock)
        await fail('LOCK', freezone.set, key, value1, open)
    })

    it('sets after give', async ()=>{
        await send(freezone.take, key)
        await send(freezone.give, key, BOB)

        await fail('ERR_SET', freezone.set, key, value1, lock)

        await send(freezone.connect(bob).set, key, value1, lock)
        const [res_value, res_flags] = await dmap.connect(bob).get(freezone.address, key)

        want(ethers.utils.hexlify(value1)).eq(res_value)
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
        await fail('ERR_SET', freezone.connect(bob).set, key, value1, lock)

        await send(freezone.take, key)
        await send(freezone.give, key, BOB)
        await fail('ERR_GIVE', freezone.give, key, CAT)
    })

    it('store CID', async ()=>{
        await send(freezone.take, key)
        const [value, flags] = lib.prepareCID(cid, false)
        await send(freezone.set, key, value, flags)

        const [lockValue, lockFlags] = lib.prepareCID(cid, true)
        await send(freezone.set, key, lockValue, lockFlags)
        await fail('LOCK', freezone.set, key, lockValue, lockFlags)

        const [readValue, readFlags] = await dmap.get(freezone.address, key)
        const resCID = lib.unpackCID(readValue, readFlags)
        want(cid).eq(resCID)
    })

    it('CID limits', async ()=>{
        await send(freezone.take, key)

        assert.throws(() => { lib.prepareCID(cidLong, false) }, Error);
        assert.throws(() => { lib.prepareCID(value1, false) }, Error);

        const [value, flags] = lib.prepareCID(cidLimit, true)
        await send(freezone.set, key, value, flags)
        const [readValue, readFlags] = await dmap.get(freezone.address, key)
        const resCID = lib.unpackCID(readValue, readFlags)
        want(cidLimit).eq(resCID)
    })
})

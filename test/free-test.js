const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')
const assert = require('assert');

const ethers = hh.ethers
const { b32, fail, revert, send, snapshot, want } = require('minihat')
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
    const lock = '0x' + '8' + '0'.repeat(63)
    const open = '0x' + '0'.repeat(64)
    const cidDefault =    'bafkreidsszpx34yqnshrtuszx7n77zxttk2s54kc2m5cftjutaumxe67fa'
    const cidSHA3 =       'baelbmidsszpx34yqnshrtuszx7n77zxttk2s54kc2m5cftjutaumxe67fa'
    const cidV0 =         'QmbizqGE1E1rES19m9CKNkLYfbbAHNnYFwE6cMe8JVV33H'
    const cidBlake2b160 = 'bafkzjzaccro7xvz25wxmpggcqm7v755cf3jpjhpxl4'
    const cid512 =        'bafkrgqa4i3c7xsn45ajkgb3yyo52su6n766tnirxkkhx7qf4gohgb3wvrqv5uflwn5tqparnbt434kevuyh7lxwu6mxw5m55ne2l76zj5jrlg'

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
        await fail('ERR_OWNER', freezone.set, key, lock, value1)
    })

    it('set after take', async ()=>{
        await send(freezone.take, key)
        await send(freezone.set, key, open, value1)
        const [res_flags, res_value] = await dmap.get(freezone.address, key)

        want(ethers.utils.hexlify(value1)).eq(res_value)
        want(ethers.utils.hexlify(open)).eq(res_flags)

        await send(freezone.set, key, lock, value2)
        const [res_flags_2, res_value_2] = await dmap.get(freezone.address, key)

        want(ethers.utils.hexlify(value2)).eq(res_value_2)
        want(ethers.utils.hexlify(lock)).eq(res_flags_2)

        await fail('LOCK', freezone.set, key, lock, value1)
        await fail('LOCK', freezone.set, key, open, value1)
    })

    it('sets after give', async ()=>{
        await send(freezone.take, key)
        await send(freezone.give, key, BOB)

        await fail('ERR_OWNER', freezone.set, key, lock, value1)

        await send(freezone.connect(bob).set, key, lock, value1)
        const [res_flags, res_value] = await dmap.connect(bob).get(freezone.address, key)

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
        await fail('ERR_OWNER', freezone.give, key, BOB)
        await fail('ERR_OWNER', freezone.connect(bob).set, key, lock, value1)

        await send(freezone.take, key)
        await send(freezone.give, key, BOB)
        await fail('ERR_OWNER', freezone.give, key, CAT)
    })

    it('store CID variants', async ()=>{
        const cids = [cidDefault, cidSHA3, cidV0, cidBlake2b160]
        for (const [index, cid] of cids.entries()) {
            const key = b32(index.toString())
            await send(freezone.take, key)
            const [flags, value] = lib.prepareCID(cid, false)
            await send(freezone.set, key, flags, value)

            const[lockFlags, lockValue] = lib.prepareCID(cid, true)
            await send(freezone.set, key, lockFlags, lockValue)
            await fail('LOCK', freezone.set, key, lockFlags, lockValue)

            const [readFlags, readValue] = await dmap.get(freezone.address, key)
            const resCID = lib.unpackCID(readFlags, readValue)
            want(cid).eq(resCID)
        }
    })

    it('store 512 CID', async ()=>{
        assert.throws(() => { lib.prepareCID(cid512, false) }, /Hash exceeds 256 bits/);
    })
})

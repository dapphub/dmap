const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')
const assert = require('assert');

const ethers = hh.ethers
const { b32, fail, revert, send, snapshot, want, mine } = require('minihat')
const { bounds } = require('./bounds')
const lib = require('../dmap.js')
const {expectEvent, check_gas} = require("./utils/helpers");
const constants = ethers.constants

describe('freezone', ()=>{
    let dmap
    let rootzone
    let freezone

    let ali, bob, cat
    let ALI, BOB, CAT

    const name  = b32('123')
    const data1 = b32('abc')
    const data2 = b32('def')
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

    it('init', async () => {
        want(await freezone.dmap()).to.eql(dmap.address)
        want(await freezone.last()).to.eql(constants.Zero)
        want(await freezone.controllers(name)).to.eql(constants.AddressZero)
    })

    it('set without control', async ()=>{
        await fail('ERR_OWNER', freezone.set, name, lock, data1)
    })

    it('set after take', async ()=>{
        await send(freezone.take, name)
        await send(freezone.set, name, open, data1)
        const [res_meta, res_data] = await lib.get(dmap, freezone.address, name)

        want(ethers.utils.hexlify(data1)).eq(res_data)
        want(ethers.utils.hexlify(open)).eq(res_meta)

        await send(freezone.set, name, lock, data2)
        const [res_meta_2, res_data_2] = await lib.get(dmap, freezone.address, name)

        want(ethers.utils.hexlify(data2)).eq(res_data_2)
        want(ethers.utils.hexlify(lock)).eq(res_meta_2)

        await fail('LOCK', freezone.set, name, lock, data1)
        await fail('LOCK', freezone.set, name, open, data1)
    })

    it('sets after give', async ()=>{
        await send(freezone.take, name)
        await send(freezone.give, name, BOB)

        await fail('ERR_OWNER', freezone.set, name, lock, data1)

        await send(freezone.connect(bob).set, name, lock, data1)
        const [res_meta, res_data] = await lib.get(dmap.connect(bob), freezone.address, name)

        want(ethers.utils.hexlify(data1)).eq(res_data)
        want(ethers.utils.hexlify(lock)).eq(res_meta)
    })

    it('take taken', async ()=>{
        await send(freezone.take, name)

        await fail('ERR_TAKEN', freezone.take, name)
        await fail('ERR_TAKEN', freezone.connect(bob).take, name)

        await send(freezone.give, name, BOB)

        await fail('ERR_TAKEN', freezone.take, name)
        await fail('ERR_TAKEN', freezone.connect(cat).take, name)
    })

    it('give without control', async ()=>{
        await fail('ERR_OWNER', freezone.give, name, BOB)
        await fail('ERR_OWNER', freezone.connect(bob).set, name, lock, data1)

        await send(freezone.take, name)
        await send(freezone.give, name, BOB)
        await fail('ERR_OWNER', freezone.give, name, CAT)
    })

    it('take error priority + limit', async () => {
        await hh.network.provider.send("evm_setAutomine", [false]);
        await hh.network.provider.send("evm_setIntervalMining", [0]);
        // taken, limit
        await freezone.take(name)
        await fail('ERR_TAKEN', freezone.take, name)
        await mine(hh)
        // limit
        await freezone.take(b32('name2'))
        await fail('ERR_LIMIT', freezone.take, b32('name3'))

        await hh.network.provider.send("evm_setAutomine", [true]);
    })

    it('set error priority', async () => {
        // freezone errors come before dmap errors
        await send(freezone.take, name)
        await send(freezone.set, name, lock, data1)
        await fail('ERR_OWNER', freezone.connect(bob).set, name, lock, data2)
        await fail('LOCK()', freezone.set, name, lock, data1)
    })

    it('store CID variants', async ()=>{
        const cids = [cidDefault, cidSHA3, cidV0, cidBlake2b160]
        for (const [index, cid] of cids.entries()) {
            const name = b32(index.toString())
            await send(freezone.take, name)
            const [meta, data] = lib.prepareCID(cid, false)
            await send(freezone.set, name, meta, data)

            const[lock_meta, lock_data] = lib.prepareCID(cid, true)
            await send(freezone.set, name, lock_meta, lock_data)
            await fail('LOCK', freezone.set, name, lock_meta, lock_data)

            const [read_meta, read_data] = await lib.get(dmap, freezone.address, name)
            const res_cid = lib.unpackCID(read_meta, read_data)
            const helper_cid = await lib.readCID(dmap, 'free:' + index.toString())
            want(cid).eq(res_cid)
            want(cid).eq(helper_cid)
        }
    })

    it('store 512 CID', async ()=>{
        assert.throws(() => { lib.prepareCID(cid512, false) }, /Hash exceeds 256 bits/);
    })

    describe('Give event', () => {
        it('take', async () => {
            const rx = await send(freezone.take, name)
            expectEvent(rx, "Give", [constants.AddressZero, '0x'+name.toString('hex'), ALI])
        })
        it('give', async () => {
            await send(freezone.take, name)
            const rx = await send(freezone.give, name, BOB)
            expectEvent(rx, "Give", [ALI, '0x'+name.toString('hex'), BOB])
        })
    })

    describe('gas', () => {
        it('take', async () => {
            const rx = await send(freezone.take, name)
            const bound = bounds.freezone.take
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })

        it('give', async () => {
            await send(freezone.take, name)
            const rx = await send(freezone.give, name, BOB)
            const bound = bounds.freezone.give
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })

        it('set', async () => {
            // calls dmap.set, no need to test specific state changes
            await send(freezone.take, name)
            const rx = await send(freezone.set, name, b32('meta'), b32('data'))
            const bound = bounds.freezone.set
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })
    })
})

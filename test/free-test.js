const dpack = require('@etherpacks/dpack')
const assert = require('assert');
const ethers = require('ethers')

const coder = ethers.utils.defaultAbiCoder
const keccak256 = ethers.utils.keccak256
const { b32, fail, send, want } = require('./utils/helpers')
const { bounds } = require('./bounds')
const lib = require('../dmap.js')
const {
    expectEvent,
    check_gas,
    testlib,
    get_signers,
    snapshot,
    revert,
    wait,
    mine,
    wrap_send,
    wrap_fail,
    wrap_fail_str,
} = require("./utils/helpers");
const constants = ethers.constants

const { deploy_mock_dmap } = require('../task/deploy-mock-dmap')
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
const solc_output = require('../output.json')
const ErrorWrapper_solc_output = solc_output.contracts["ErrorWrapper.sol"]["ErrorWrapper"]

describe('freezone', ()=>{
    let dmap
    let rootzone
    let freezone
    let freewrap

    let [ali, bob, cat] = get_signers(process.env.TEST_MNEMONIC).map(
        s => s.connect(provider)
    );
    let [ALI, BOB, CAT] = [ali, bob, cat].map(x => x.address);

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

    beforeEach(async ()=>{
        await revert(provider)
    })

    const GLIMIT = 1000000
    it('init', async () => {
        want(await freezone.dmap()).to.eql(dmap.address)
        want(await freezone.last()).to.eql(constants.Zero)
        want(await freezone.controllers(name)).to.eql(constants.AddressZero)
    })

    it('set without control', async ()=>{
        await fail('ERR_OWNER', freezone.set, name, lock, data1)
    })

    it('set after take', async ()=>{
        await wrap_send(provider, freewrap, freewrap.take, name, {gasLimit: GLIMIT})
        await wrap_send(provider, freewrap, freewrap.set, name, open, data1, {gasLimit: GLIMIT})
        const slot = keccak256(coder.encode(["address", "bytes32"], [freezone.address, name]))
        const [res_meta, res_data] = await testlib.pair(dmap, slot)

        want(ethers.utils.hexlify(data1)).eq(res_data)
        want(ethers.utils.hexlify(open)).eq(res_meta)

        await wrap_send(provider, freewrap, freewrap.set, name, lock, data2, {gasLimit: GLIMIT})
        const [res_meta_2, res_data_2] = await testlib.pair(dmap, slot)

        want(ethers.utils.hexlify(data2)).eq(res_data_2)
        want(ethers.utils.hexlify(lock)).eq(res_meta_2)

        await wrap_fail(provider, freewrap, 'LOCK()', freewrap.set, name, lock, data1, {gasLimit: GLIMIT})
        await wrap_fail(provider, freewrap, 'LOCK()', freewrap.set, name, open, data1, {gasLimit: GLIMIT})
    })

    it('sets after give', async ()=>{
        await send(freezone.take, name)
        await send(freezone.give, name, BOB)

        await fail('ERR_OWNER', freezone.set, name, lock, data1)

        await send(freezone.connect(bob).set, name, lock, data1)
        const slot = keccak256(coder.encode(["address", "bytes32"], [freezone.address, name]))
        const [res_meta, res_data] = await testlib.pair(dmap.connect(bob), slot)

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

    /* TODO no evm_setAutomine
    it('take error priority + limit', async () => {
        await provider.send("evm_setAutomine", [false]);
        await provider.send("evm_setIntervalMining", [0]);
        // taken, limit
        await freezone.take(name)
        await fail('ERR_TAKEN', freezone.take, name)
        await mine(provider)
        // limit
        await freezone.take(b32('name2'))
        await fail('ERR_LIMIT', freezone.take, b32('name3'))

        await provider.send("evm_setAutomine", [true]);
    })
     */

    it('set error priority', async () => {
        // freezone errors come before dmap errors
        await send(freezone.take, name, {gasLimit: GLIMIT})
        await send(freezone.set, name, lock, data1, {gasLimit: GLIMIT})
        // TODO doesn't check the specific error string, just error type
        await wrap_fail_str(provider, freewrap, 'ERR_OWNER', freewrap.set, name, lock, data2, {gasLimit: GLIMIT})
        await send(freezone.give, name, freewrap.address)
        await wrap_fail(provider, freewrap, 'LOCK()', freewrap.set, name, lock, data1, {gasLimit: GLIMIT})
    })

    it('store CID variants', async ()=>{
        const cids = [cidDefault, cidSHA3, cidV0, cidBlake2b160]
        for (const [index, cid] of cids.entries()) {
            const name = b32(index.toString())
            await wait(provider, 60)
            await wrap_send(provider, freewrap, freewrap.take, name, {gasLimit: GLIMIT})
            const [meta, data] = lib.prepareCID(cid, false)
            await wrap_send(provider, freewrap, freewrap.set, name, meta, data, {gasLimit: GLIMIT})

            const[lock_meta, lock_data] = lib.prepareCID(cid, true)
            await wrap_send(provider, freewrap, freewrap.set, name, lock_meta, lock_data, {gasLimit: GLIMIT})
            await wrap_fail(provider, freewrap, 'LOCK()', freewrap.set, name, lock_meta, lock_data, {gasLimit: GLIMIT})

            const slot = keccak256(coder.encode(["address", "bytes32"], [freezone.address, name]))
            const [read_meta, read_data] = await testlib.pair(dmap, slot)
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

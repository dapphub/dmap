const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { send, want, snapshot, revert, b32, fail} = require('minihat')
const { expectEvent, padRight, check_gas} = require('./utils/helpers')
const { bounds } = require('./bounds')
const constants = ethers.constants

const lib = require('../dmap.js')

const debug = require('debug')('dmap:test')

describe('dmap', ()=>{
    let dmap
    let rootzone
    let freezone

    let ali, bob, cat
    let ALI, BOB, CAT
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

    it('deploy postconditions', async ()=>{
        const [root_flags, root_value] = await dmap.raw('0x'+'0'.repeat(64))
        const dmap_ref = await rootzone.dmap()
        want(dmap_ref).eq(dmap.address)

        const [root_self_flags, root_self] = await dmap.get(rootzone.address, b32('root'))
        want(root_self).eq(root_value)
    })

    it('address padding', async ()=> {
        const [root_self, root_self_flags] = await dmap.get(rootzone.address, b32('root'))
        const padded1 = ethers.utils.hexZeroPad(rootzone.address, 32)
        const padded2 = rootzone.address + '00'.repeat(33-rootzone.address.length/2)
        //console.log(root_self)
        //console.log(padded1)
        //console.log(padded2)
    })

    it('direct traverse', async ()=>{
        const root_free_slot = await dmap.slot(rootzone.address, b32('free'))
        const [root_free_flags, root_free_value] = await dmap.raw(root_free_slot)
        want(root_free_value).eq(padRight(freezone.address))
        const flags = Buffer.from(root_free_flags.slice(2), 'hex')[0]
        want(flags & lib.FLAG_LOCK).to.equal(lib.FLAG_LOCK)
    })

    it('basic set', async () => {
        const key = '0x'+'11'.repeat(32)
        const val = '0x'+'22'.repeat(32)
        const flags = '0x'+'1'+'0'.repeat(63)
        const rx = await send(dmap.set, key, flags, val)

        expectEvent(
            rx, undefined,
            [ethers.utils.hexZeroPad(ALI, 32).toLowerCase(), key, val, flags],
            '0x'
        )
    })

    it('walk', async()=>{
        const res = await lib.walk(dmap, ':root')
        want(res.slice(0,42)).eq(rootzone.address.toLowerCase())
        const res2 = await lib.walk(dmap, ':root.free')
        await want(
            lib.walk(dmap, ':root.free.free.free')
        ).rejectedWith('zero register')
    })

    it('lock', async () => {
        debug('first set')
        await send(dmap.set, b32("hello"), '0x'+'80'+'00'.repeat(31), b32("hello"))
        debug('second set')
        await fail('LOCK', dmap.set, b32("hello"), '0x'+'80'+'00'.repeat(31), b32("hello"))
    })

    describe('gas', () => {
        const key = b32('MyKey')
        const one = Buffer.from('10'.repeat(32), 'hex') // lock == 0
        const two = Buffer.from('20'.repeat(32), 'hex')
        describe('set', () => {

            describe('no change', () => {
                it('0->0', async () => {
                    const rx = await send(dmap.set, key, constants.HashZero, constants.HashZero)
                    const bound = bounds.dmap.set[0][0]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->1', async () => {
                    await send(dmap.set, key, one, one)
                    const rx = await send(dmap.set, key, one, one)
                    const bound = bounds.dmap.set[1][1]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
            })
            describe('change', () => {
                it('0->1', async () => {
                    const rx = await send(dmap.set, key, one, one)
                    const bound = bounds.dmap.set[0][1]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->0', async () => {
                    await send(dmap.set, key, one, one)
                    const rx = await send(dmap.set, key, constants.HashZero, constants.HashZero)
                    const bound = bounds.dmap.set[1][0]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->2', async () => {
                    await send(dmap.set, key, one, one)
                    const rx = await send(dmap.set, key, two, two)
                    const bound = bounds.dmap.set[1][2]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
            })
        })

        it('raw', async () => {
            const slot = await dmap.slot(ALI, key)
            await send(dmap.set, key, one, one)
            const gas = await dmap.estimateGas.raw(slot)
            const bound = bounds.dmap.raw
            await check_gas(gas, bound[0], bound[1])
        })

        it('get', async () => {
            await send(dmap.set, key, one, one)
            const gas = await dmap.estimateGas.get(ALI, key)
            const bound = bounds.dmap.get
            await check_gas(gas, bound[0], bound[1])
        })

        it('slot', async () => {
            const gas = await dmap.estimateGas.slot(ALI, key)
            const bound = bounds.dmap.slot
            await check_gas(gas, bound[0], bound[1])
        })
    })

})

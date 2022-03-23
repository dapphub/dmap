const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { send, want, snapshot, revert, b32, fail} = require('minihat')
const { expectEvent, check_gas} = require('./utils/helpers')
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
    const LOCK = '0x80'+'00'.repeat(31)
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

    const check_entry = async (usr, key, _meta, _data) => {
        const meta = typeof(_meta) == 'string' ? _meta : '0x'+_meta.toString('hex')
        const data = typeof(_data) == 'string' ? _data : '0x'+_data.toString('hex')
        const res = await dmap.get(usr, key)
        want(res.meta).to.eql(meta)
        want(res.data).to.eql(data)
    }

    it('deploy postconditions', async ()=>{
        const dmap_ref = await rootzone.dmap()
        want(dmap_ref).eq(dmap.address)

        const [root_self_meta, root_self] = await dmap.get(rootzone.address, b32('root'))
        want(root_self.slice(0,42)).eq(rootzone.address.toLowerCase())

        await check_entry(ALI, b32('1'), constants.HashZero, constants.HashZero)
        await check_entry(BOB, b32('1'), constants.HashZero, constants.HashZero)

        // dmap.get returns (meta, data), internal storage is (data, meta)
        const rootData = await dmap.provider.getStorageAt(dmap.address, 0)
        const rootMeta = await dmap.provider.getStorageAt(dmap.address, 1)
        want(ethers.utils.hexDataSlice(rootData, 0, 20))
            .to.eql(rootzone.address.toLowerCase())
        want(rootMeta).to.eql(LOCK)
    })

    it('address padding', async ()=> {
        const [root_self_meta, root_self] = await dmap.get(rootzone.address, b32('root'))
        const padded1 = ethers.utils.hexZeroPad(rootzone.address, 32)
        const padded2 = rootzone.address + '00'.repeat(33-rootzone.address.length/2)
        //console.log(root_self)
        //console.log(padded1)
        //console.log(padded2)
    })

    it('basic set', async () => {
        const name = '0x'+'11'.repeat(32)
        const meta = '0x'+'1'+'0'.repeat(63)
        const data = '0x'+'22'.repeat(32)
        const rx = await send(dmap.set, name, meta, data)

        expectEvent(
            rx, undefined,
            [ethers.utils.hexZeroPad(ALI, 32).toLowerCase(), name, meta, data],
            '0x'
        )
        await check_entry(ALI, name, meta, data)
    })

    it('walk', async()=>{
        const res = await lib.walk(dmap, ':root')
        want(res.slice(0,42)).eq(rootzone.address.toLowerCase())
        const res2 = await lib.walk(dmap, ':root.free')
        await want(
            lib.walk(dmap, ':root.free.free.free')
        ).rejectedWith('zero register')
    })

    describe('lock', () => {


        const check_ext_unchanged = async () => {
            const zero = constants.HashZero
            await check_entry(BOB, b32("1"), zero, zero)
            await check_entry(ALI, b32("2"), zero, zero)
        }

        it('set without data', async () => {
            // set just lock bit, nothing else
            await send(dmap.set, b32("1"), LOCK, constants.HashZero)
            await check_entry(ALI, b32("1"), LOCK, constants.HashZero)

            // should fail whether or not ali attempts to change something
            await fail('LOCK', dmap.set, b32("1"), constants.HashZero, constants.HashZero)
            await fail('LOCK', dmap.set, b32("1"), LOCK, constants.HashZero)
            await fail('LOCK', dmap.set, b32("1"), constants.HashZero, b32('hello'))
            await fail('LOCK', dmap.set, b32("1"), LOCK, b32('hello'))
            await check_ext_unchanged()
        })

        it('set with data', async () => {
            // set lock and data
            await send(dmap.set, b32("1"), LOCK, b32('hello'))
            await check_entry(ALI, b32("1"), LOCK, b32('hello'))
            await fail('LOCK', dmap.set, b32("1"), LOCK, b32('hello'))
            await check_ext_unchanged()
        })

        it("set a few times, then lock", async () => {
            await send(dmap.set, b32("1"), constants.HashZero, constants.HashZero)
            await check_entry(ALI, b32("1"), constants.HashZero, constants.HashZero)

            await send(dmap.set, b32("1"), constants.HashZero, b32('hello'))
            await check_entry(ALI, b32("1"), constants.HashZero, b32('hello'))

            await send(dmap.set, b32("1"), constants.HashZero, b32('goodbye'))
            await check_entry(ALI, b32("1"), constants.HashZero, b32('goodbye'))

            await send(dmap.set, b32("1"), LOCK, b32('goodbye'))
            await check_entry(ALI, b32("1"), LOCK, b32('goodbye'))

            await fail('LOCK', dmap.set, b32("1"), constants.HashZero, constants.HashZero)
            await check_ext_unchanged()
        })

        it("0x7ffff... doesn't lock, 0xffff... locks", async () => {
            const FLIP_LOCK = '0x7'+'f'.repeat(63)
            await send(dmap.set, b32("1"), FLIP_LOCK, constants.HashZero)

            const neg_one = '0x'+'ff'.repeat(32)
            await send(dmap.set, b32("1"), neg_one, constants.HashZero)
            await fail('LOCK', dmap.set, b32("1"), constants.HashZero, constants.HashZero)
            await check_ext_unchanged()
        })
    })

    describe('gas', () => {
        const name = b32('MyKey')
        const one  = Buffer.from('10'.repeat(32), 'hex') // lock == 0
        const two  = Buffer.from('20'.repeat(32), 'hex')
        describe('set', () => {

            describe('no change', () => {
                it('0->0', async () => {
                    const rx = await send(dmap.set, name, constants.HashZero, constants.HashZero)
                    const bound = bounds.dmap.set[0][0]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->1', async () => {
                    await send(dmap.set, name, one, one)
                    const rx = await send(dmap.set, name, one, one)
                    const bound = bounds.dmap.set[1][1]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
            })
            describe('change', () => {
                it('0->1', async () => {
                    const rx = await send(dmap.set, name, one, one)
                    const bound = bounds.dmap.set[0][1]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->0', async () => {
                    await send(dmap.set, name, one, one)
                    const rx = await send(dmap.set, name, constants.HashZero, constants.HashZero)
                    const bound = bounds.dmap.set[1][0]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->2', async () => {
                    await send(dmap.set, name, one, one)
                    const rx = await send(dmap.set, name, two, two)
                    const bound = bounds.dmap.set[1][2]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
            })
        })

        it('get', async () => {
            await send(dmap.set, name, one, one)
            const gas = await dmap.estimateGas.get(ALI, name)
            const bound = bounds.dmap.get
            await check_gas(gas, bound[0], bound[1])
        })

   })

})

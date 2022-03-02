
const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { send, want, snapshot, revert, b32, wad } = require('minihat')
const { expectEvent, test1D, check_gas} = require('./utils/helpers')

const lib = require('../dmap.js')
const {bounds} = require("./bounds");

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
        const [root_value, root_flags] = await dmap.raw('0x'+'0'.repeat(64))
        const slice_start = (256 - 160) / 4 + 2
        want('0x'.concat(root_value.slice(slice_start))).eq(rootzone.address.toLowerCase())
        const dmap_ref = await rootzone.dmap()
        want(dmap_ref).eq(dmap.address)
    })

    it('direct traverse', async ()=>{
        const root_free_slot = await dmap.slot(rootzone.address, b32('free'))
        const [root_free_value, root_free_flags] = await dmap.raw(root_free_slot)
//        want(root_free_value).eq(freezone.address)  // for this bit, we'll want to register the 'free' zone in the 'root' zone as part of the deploy sequence
    })

    it('basic set', async () => {
        const key = '0x'+'11'.repeat(32)
        const val = '0x'+'22'.repeat(32)
        const flags = '0x'+'0'.repeat(63)+'1'
        const tx = await send(dmap.set, key, val, flags)
    })

    it('basic set', async () => {
        const key = '0x'+'11'.repeat(32)
        const val = '0x'+'22'.repeat(32)
        const flags = '0x'+'0'.repeat(63)+'1'
        const rx = await send(dmap.set, key, val, flags)

        expectEvent(
            rx, undefined,
            [ethers.utils.hexZeroPad(ALI, 32).toLowerCase(), key, val, flags],
            '0x'
        )
    })

    it('walk', async()=>{
        const res = await lib.walk(dmap, ':free')
        console.log(res)
    })

    describe('gas', () => {
        const key = b32('MyKey')
        const NOP = async () => {}
        const one = Buffer.from('10'.repeat(32), 'hex') // lock == 0
        const two = Buffer.from('20'.repeat(32), 'hex')
        {
            const fill = async (prev, next) => {
               return send(dmap.set, key, next, next)
            }
            const clear = async (prev, next) => {
                await fill(prev, next)
            }
            const stay = async (prev) => {
                return fill(prev, prev)
            }
            const verify = async (prev, next) => {
                const res = await dmap.get(ALI, key)
                want(Buffer.from(res.value.slice(2), 'hex')).to.eql(next)
                want(Buffer.from(res.flags.slice(2), 'hex')).to.eql(next)
            }
            test1D('set', NOP, fill, clear, stay, one, two, bounds.dmap.set, verify)
        }
        
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


const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { send, want, snapshot, revert, b32 } = require('minihat')
const { expectEvent } = require('./utils/helpers')

const lib = require('../dmap.js')

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
        console.log('dmap slot 0', root_value)
        const dmap_ref = await rootzone.dmap()
        want(dmap_ref).eq(dmap.address)

        const [root_self, root_self_flags] = await dmap.get(rootzone.address, b32('root'))
        console.log('root.root', root_self)
        want(root_self).eq(root_value)
    })

    it('address padding', async ()=> {
        const [root_self, root_self_flags] = await dmap.get(rootzone.address, b32('root'))
        const padded1 = ethers.utils.hexZeroPad(rootzone.address, 32)
        const padded2 = rootzone.address + '00'.repeat(33-rootzone.address.length/2)
        console.log(root_self)
        console.log(padded1)
        console.log(padded2)
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
        const rx = await send(dmap.set, key, val, flags)

        expectEvent(
            rx, undefined,
            [ethers.utils.hexZeroPad(ALI, 32).toLowerCase(), key, val, flags],
            '0x'
        )
    })

    it('walk', async()=>{
        const res = await lib.walk(dmap, ':root')
        console.dir(res, {depth:null})
        const res2 = await lib.walk(dmap, ':root.free')
        console.dir(res2, {depth:null})
        want(
            lib.walk(dmap, ':root.free.free')
        ).rejectedWith('zero register')
    })
})

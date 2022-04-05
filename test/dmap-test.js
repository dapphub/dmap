const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { send, want, snapshot, revert, b32, fail} = require('minihat')
const { expectEvent, check_gas} = require('./utils/helpers')
const { bounds } = require('./bounds')
const constants = ethers.constants
const { smock } = require('@defi-wonderland/smock')

const debug = require('debug')('dmap:test')

describe('dmap', ()=>{
    let dmap
    let rootzone
    let freezone

    let ali, bob, cat
    let ALI, BOB, CAT
    const LOCK = '0x80'+'00'.repeat(31)
    let signers
    before(async ()=>{
        [ali, bob, cat] = await ethers.getSigners();
        signers = await ethers.getSigners();
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

        await check_entry(ALI, b32('1'), constants.HashZero, constants.HashZero)
        await check_entry(BOB, b32('1'), constants.HashZero, constants.HashZero)

        // dmap.get returns (meta, data), internal storage is (data, meta)
        const rootData = await dmap.provider.getStorageAt(dmap.address, 1)
        const rootMeta = await dmap.provider.getStorageAt(dmap.address, 0)
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

        const eventdata = meta + data.slice(2)
        expectEvent(
            rx, undefined,
            [ethers.utils.hexZeroPad(ALI, 32).toLowerCase(), name, meta, data]
        )

        await check_entry(ALI, name, meta, data)
    })

    describe('event data no overlap', () => {
        const keys = ['name', 'meta', 'data', 'zone']
        for (let i = 0; i < keys.length; i++) {
            let words = {}
            words.name = words.meta = words.data = constants.HashZero
            words.zone = constants.AddressZero
            words[keys[i]] = '0x' + 'ff'.repeat(keys[i] == 'zone' ? 20 : 32)
            it('set ' + keys[i], async () => {
                const fake = await smock.fake('Dmap', {address: words.zone})
                await ali.sendTransaction({to: fake.address, value: ethers.utils.parseEther('1')})
                want(fake.address).to.eql(words.zone)

                const rx = await send(dmap.connect(fake.wallet).set, words.name, words.meta, words.data)

                const eventdata = words.meta + words.data.slice(2)
                expectEvent(
                    rx, undefined,
                    [
                        ethers.utils.hexZeroPad(words.zone, 32).toLowerCase(),
                        words.name, words.meta, words.data
                    ]
                )

                await check_entry(words.zone, words.name, words.meta, words.data)
            })
        }
    })

    describe('hashing', () => {
        it("zone in hash", async () => {
            const alival = '0x' + '11'.repeat(32)
            const bobval = '0x' + 'ff'.repeat(32)
            await send(dmap.set, b32("1"), LOCK, alival)
            await send(dmap.connect(bob).set, b32("1"), LOCK, bobval)
        })

        it("name in hash", async () => {
            const val0 = '0x' + '11'.repeat(32)
            const val1 = '0x' + 'ff'.repeat(32)
            await send(dmap.set, b32("1"), LOCK, val0)
            await send(dmap.set, b32("2"), LOCK, val1)
            await check_entry(ALI, b32('1'), LOCK, val0)
            await check_entry(ALI, b32('2'), LOCK, val1)
        })

        it('name all bits in hash', async () => {
            // make sure first and last bits of name make it into the hash
            const fake = await smock.fake('Dmap', {address: constants.AddressZero})
            await ali.sendTransaction({to: fake.address, value: ethers.utils.parseEther('1')})
            want(fake.address).to.eql(constants.AddressZero)
            const names = [
                constants.HashZero,
                '0x80' + '00'.repeat(31),
                '0x' + '00'.repeat(31) + '01',
                '0x' + 'ff'.repeat(32),
                '0x' + 'ff'.repeat(31) + 'fe', // flip lsb
                '0x7f' + 'ff'.repeat(31), // flip msb
            ]
            for (let i = 0; i < names.length; i++) {
                await send(dmap.connect(fake.wallet).set, names[i], LOCK, b32(String(i)))
            }
            for (let i = 0; i < names.length; i++) {
                await check_entry(fake.address, names[i], LOCK, b32(String(i)))
            }
        })

        it('zone all bits in hash', async () => {
            // make sure first and last bits of zone make it into the hash
            const addrs = [
                constants.AddressZero,
                '0x80' + '00'.repeat(19),
                '0x' + '00'.repeat(19) + '0f', // TODO hh has a problem with very low fake addresses
                '0x' + 'ff'.repeat(20),
                '0x' + 'ff'.repeat(19) + 'fe', // flip lsb
                '0x7f' + 'ff'.repeat(19), // flip msb
            ]
            const name = b32('1')
            for (let i = 0; i < addrs.length; i++) {
                const fake = await smock.fake('Dmap', {address: addrs[i]})
                await ali.sendTransaction({to: fake.address, value: ethers.utils.parseEther('1')})
                await send(dmap.connect(fake.wallet).set, name, LOCK, b32(String(i)))
            }
            for (let i = 0; i < addrs.length; i++) {
                await check_entry(addrs[i], name, LOCK, b32(String(i)))
            }
        })
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

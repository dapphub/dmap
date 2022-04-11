const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')
const ethers = hh.ethers
const coder = ethers.utils.defaultAbiCoder
const constants = ethers.constants
const keccak256 = ethers.utils.keccak256
const { smock } = require('@defi-wonderland/smock')
const { send, want, snapshot, revert, b32, fail } = require('minihat')

const { expectEvent, check_gas, padRight, check_entry, testlib } = require('./utils/helpers')
const { bounds } = require('./bounds')
const lib = require('../dmap.js')

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

    it('deploy postconditions', async ()=>{
        const dmap_ref = await rootzone.dmap()
        want(dmap_ref).eq(dmap.address)

        await check_entry(dmap, ALI, b32('1'), constants.HashZero, constants.HashZero)
        await check_entry(dmap, BOB, b32('1'), constants.HashZero, constants.HashZero)

        // dmap.get returns (meta, data), internal storage is (data, meta)
        const rootData = await dmap.provider.getStorageAt(dmap.address, 1)
        const rootMeta = await dmap.provider.getStorageAt(dmap.address, 0)
        want(ethers.utils.hexDataSlice(rootData, 0, 20))
            .to.eql(rootzone.address.toLowerCase())
        want(rootMeta).to.eql(LOCK)
    })

    it('address padding', async ()=> {
        const [root_self_meta, root_self] = await testlib.get(dmap, rootzone.address, b32('root'))
        const padded1 = ethers.utils.hexZeroPad(rootzone.address, 32)
        const padded2 = rootzone.address + '00'.repeat(33-rootzone.address.length/2)
        //console.log(root_self)
        //console.log(padded1)
        //console.log(padded2)
    })

    const expectLog = async (dmap, eventname, caller, name, meta, data, isAnon = false) => {
        const _logs = dmap.filters[eventname](caller, name, meta, data)
        const logs = await dmap.queryFilter(_logs, 0)
        want(logs.length).to.eql(1)
        const log = logs[0]

        if (isAnon) {
            want(log.event).to.eql(undefined)
            want(log.eventSignature).to.eql(undefined)
            want(log.args).to.eql(undefined)
        }
    }

    it('basic set', async () => {
        const name = '0x'+'11'.repeat(32)
        const meta = '0x'+'1'+'0'.repeat(63)
        const data = '0x'+'22'.repeat(32)
        const rx = await send(lib.set, dmap, name, meta, data)

        const eventdata = meta + data.slice(2)
        await expectLog(dmap, "Set", ALI, name, meta, data, true)

        await check_entry(dmap, ALI, name, meta, data)
    })

    it('event filter', async () => {
        const name = '0x'+'81'.repeat(32)
        const meta = '0x'+'f3'.repeat(32)
        const data = '0x'+'33'.repeat(32)
        const rx = await send(lib.set, dmap.connect(bob), name, meta, data)

        // try to filter the Set event
        await expectLog(dmap, "Set", BOB, name, meta, data, true)
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

                await send(lib.set, dmap.connect(fake.wallet), words.name, words.meta, words.data)

                // TODO await oops
                expectLog(dmap, "Set", words.zone, words.name, words.meta, words.data, true)

                await check_entry(dmap, words.zone, words.name, words.meta, words.data)
            })
        }
    })

    describe('hashing', () => {
        it("zone in hash", async () => {
            const alival = '0x' + '11'.repeat(32)
            const bobval = '0x' + 'ff'.repeat(32)
            await send(lib.set, dmap, b32("1"), LOCK, alival)
            await send(lib.set, dmap.connect(bob), b32("1"), LOCK, bobval)
        })

        it("name in hash", async () => {
            const val0 = '0x' + '11'.repeat(32)
            const val1 = '0x' + 'ff'.repeat(32)
            await send(lib.set, dmap, b32("1"), LOCK, val0)
            await send(lib.set, dmap, b32("2"), LOCK, val1)
            await check_entry(dmap, ALI, b32('1'), LOCK, val0)
            await check_entry(dmap, ALI, b32('2'), LOCK, val1)
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
                await send(lib.set, dmap.connect(fake.wallet), names[i], LOCK, b32(String(i)))
            }
            for (let i = 0; i < names.length; i++) {
                await check_entry(dmap, fake.address, names[i], LOCK, b32(String(i)))
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
                await send(lib.set, dmap.connect(fake.wallet), name, LOCK, b32(String(i)))
            }
            for (let i = 0; i < addrs.length; i++) {
                await check_entry(dmap, addrs[i], name, LOCK, b32(String(i)))
            }
        })
    })

    describe('slot and pair', () => {
        it('root pair', async () => {
            const [rootMeta, rootData] = await lib.pair(dmap, '0x' + '00'.repeat(32))
            want(ethers.utils.hexDataSlice(rootData, 0, 20))
                .to.eql(rootzone.address.toLowerCase())
            want(rootMeta).to.eql(LOCK)
        })

        it('root slot', async () => {
            const rootMeta = await lib.slot(dmap, '0x' + '00'.repeat(32))
            want(rootMeta).to.eql(LOCK)

            const rootData = await lib.slot(dmap, '0x' + '00'.repeat(31) + '01')
            want(ethers.utils.hexDataSlice(rootData, 0, 20))
                .to.eql(rootzone.address.toLowerCase())
        })

        it('direct traverse', async ()=>{
            const root_free_slot = keccak256(coder.encode(["address", "bytes32"], [rootzone.address, b32('free')]))
            const [root_free_meta, root_free_data] = await lib.pair(dmap, root_free_slot)
            want(root_free_data).eq(padRight(freezone.address))
            const flags = Buffer.from(root_free_meta.slice(2), 'hex')[0]
            want(flags & lib.FLAG_LOCK).to.equal(lib.FLAG_LOCK)
        })
    })

    describe('lock', () => {
        const check_ext_unchanged = async () => {
            const zero = constants.HashZero
            await check_entry(dmap, BOB, b32("1"), zero, zero)
            await check_entry(dmap, ALI, b32("2"), zero, zero)
        }

        it('set without data', async () => {
            // set just lock bit, nothing else
            await send(lib.set, dmap, b32("1"), LOCK, constants.HashZero)
            await check_entry(dmap, ALI, b32("1"), LOCK, constants.HashZero)

            // should fail whether or not ali attempts to change something
            await fail('LOCK', lib.set, dmap, b32("1"), constants.HashZero, constants.HashZero)
            await fail('LOCK', lib.set, dmap, b32("1"), LOCK, constants.HashZero)
            await fail('LOCK', lib.set, dmap, b32("1"), constants.HashZero, b32('hello'))
            await fail('LOCK', lib.set, dmap, b32("1"), LOCK, b32('hello'))
            await check_ext_unchanged()
        })

        it('set with data', async () => {
            // set lock and data
            await send(lib.set, dmap, b32("1"), LOCK, b32('hello'))
            await check_entry(dmap, ALI, b32("1"), LOCK, b32('hello'))
            await fail('LOCK', lib.set, dmap, b32("1"), LOCK, b32('hello'))
            await check_ext_unchanged()
        })

        it("set a few times, then lock", async () => {
            await send(lib.set, dmap, b32("1"), constants.HashZero, constants.HashZero)
            await check_entry(dmap, ALI, b32("1"), constants.HashZero, constants.HashZero)

            await send(lib.set, dmap, b32("1"), constants.HashZero, b32('hello'))
            await check_entry(dmap, ALI, b32("1"), constants.HashZero, b32('hello'))

            await send(lib.set, dmap, b32("1"), constants.HashZero, b32('goodbye'))
            await check_entry(dmap, ALI, b32("1"), constants.HashZero, b32('goodbye'))

            await send(lib.set, dmap, b32("1"), LOCK, b32('goodbye'))
            await check_entry(dmap, ALI, b32("1"), LOCK, b32('goodbye'))

            await fail('LOCK', lib.set, dmap, b32("1"), constants.HashZero, constants.HashZero)
            await check_ext_unchanged()
        })

        it("0x7ffff... doesn't lock, 0xffff... locks", async () => {
            const FLIP_LOCK = '0x7'+'f'.repeat(63)
            await send(lib.set, dmap, b32("1"), FLIP_LOCK, constants.HashZero)

            const neg_one = '0x'+'ff'.repeat(32)
            await send(lib.set, dmap, b32("1"), neg_one, constants.HashZero)
            await fail('LOCK', lib.set, dmap, b32("1"), constants.HashZero, constants.HashZero)
            await check_ext_unchanged()
        })
    })

    describe('DmapI', () => {
        let dmapi_abi = require('../artifacts/sol/dmap.sol/DmapI.json').abi
        let dmap_i = new ethers.utils.Interface(dmapi_abi)
        it('error LOCK', async () => {
            // ethers has one error pool for all contracts, so just read it
            const errfrag = dmap_i.getError("LOCK")
            want(errfrag.inputs.length).to.eql(0)
            want(errfrag.name).to.eql("LOCK")
        })

        it('event Set', async () => {
            const eventfrag = dmap_i.getEvent("Set")
            want(eventfrag.inputs.length).to.eql(4)
            want(eventfrag.name).to.eql("Set")

            const dmap_with_abi = new ethers.Contract(dmap.address, dmapi_abi, ali)
            const name = '0x'+'88'.repeat(32)
            const meta = '0x'+'cc'.repeat(32)
            const data = '0x'+'ee'.repeat(32)
            await send(dmap_with_abi.set, name, meta, data)
            await expectLog(dmap_with_abi, "Set", ALI, name, meta, data, true)
        })
    })

    describe('gas', () => {
        const name = b32('MyKey')
        const one  = Buffer.from('10'.repeat(32), 'hex') // lock == 0
        const two  = Buffer.from('20'.repeat(32), 'hex')
        describe('set', () => {

            describe('no change', () => {
                it('0->0', async () => {
                    const rx = await send(lib.set, dmap, name, constants.HashZero, constants.HashZero)
                    const bound = bounds.dmap.set[0][0]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->1', async () => {
                    await send(lib.set, dmap, name, one, one)
                    const rx = await send(lib.set, dmap, name, one, one)
                    const bound = bounds.dmap.set[1][1]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
            })
            describe('change', () => {
                it('0->1', async () => {
                    const rx = await send(lib.set, dmap, name, one, one)
                    const bound = bounds.dmap.set[0][1]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->0', async () => {
                    await send(lib.set, dmap, name, one, one)
                    const rx = await send(lib.set, dmap, name, constants.HashZero, constants.HashZero)
                    const bound = bounds.dmap.set[1][0]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
                it('1->2', async () => {
                    await send(lib.set, dmap, name, one, one)
                    const rx = await send(lib.set, dmap, name, two, two)
                    const bound = bounds.dmap.set[1][2]
                    await check_gas(rx.gasUsed, bound[0], bound[1])
                })
            })
        })

        it('get', async () => {
            await send(lib.set, dmap, name, one, one)

            const abi = ["function get(address, bytes32) returns (bytes32, bytes32)"]
            const iface = new ethers.utils.Interface(abi)
            const calldata = iface.encodeFunctionData("get", [ALI, name])
            const tx = await dmap.signer.sendTransaction({to: dmap.address, data: calldata})
            const rx = await tx.wait()

            const bound = bounds.dmap.get
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })
   })

})

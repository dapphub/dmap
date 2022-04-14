const dpack = require('@etherpacks/dpack')
//const hh = require('hardhat')
const ethers = require('ethers')
const coder = ethers.utils.defaultAbiCoder
const constants = ethers.constants
const keccak256 = ethers.utils.keccak256
const { smock } = require('@defi-wonderland/smock')
const { send, want, b32, fail } = require('minihat')
const { snapshot, revert } = require('./utils/helpers')

const { check_gas, padRight, check_entry, get_signers} = require('./utils/helpers')
const { bounds } = require('./bounds')
const lib = require('../dmap.js')

const { deploy_mock_dmap } = require('../task/deploy-mock-dmap')

let dmapi_abi = require('../artifacts/core/dmap.sol/Dmap.json').abi
let dmap_i = new ethers.utils.Interface(dmapi_abi)

const debug = require('debug')('dmap:test')

const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

describe('dmap', ()=>{
    let dmap
    let rootzone
    let freezone

    let [ali, bob, cat] = get_signers(process.env.TEST_MNEMONIC).map(
        s => s.connect(provider)
    );
    let [ALI, BOB, CAT] = [ali, bob, cat].map(x => x.address);

    const LOCK = '0x80'+'00'.repeat(31)
    before(async ()=>{
        await deploy_mock_dmap({name: 'nombre'}, provider, ali)
        const dapp = await dpack.load(require('../pack/dmap_full_nombre.dpack.json'), ethers, ali)
        dmap = dapp.dmap
        rootzone = dapp.rootzone
        freezone = dapp.freezone
        await snapshot(provider)
    })
    beforeEach(async ()=>{
        await revert(provider)
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
        const [root_self_meta, root_self] = await lib.get(dmap, rootzone.address, b32('root'))
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
        await send(lib.set, dmap, name, meta, data)

        await expectLog(dmap, "Set", ALI, name, meta, data, true)

        await check_entry(dmap, ALI, name, meta, data)
    })

    it('event filter', async () => {
        const name = '0x'+'81'.repeat(32)
        const meta = '0x'+'f3'.repeat(32)
        const data = '0x'+'33'.repeat(32)
        await send(lib.set, dmap.connect(bob), name, meta, data)

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

    describe('DmapFace', () => {
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

        describe('calldata', () => {
            const name = b32('MyKey')
            // pair is implemented in lib, not dmap
            it('get', async () => {
                const calldata = dmap_i.encodeFunctionData("get", [ALI, name])
                await want(ali.sendTransaction(
                    {to: dmap.address, data: calldata.slice(0, calldata.length)}
                )).rejectedWith('revert')
                await want(ali.sendTransaction(
                    {to: dmap.address, data: calldata + '00'}
                )).rejectedWith('revert')
                await want(ali.sendTransaction({to: dmap.address, data: calldata})).rejectedWith('revert')
            })

            it('set', async () => {
                const calldata = dmap_i.encodeFunctionData("set", [name, name, name])
                await want(ali.sendTransaction(
                    {to: dmap.address, data: calldata.slice(0, calldata.length - 2)}
                )).rejectedWith('revert')
                await want(ali.sendTransaction(
                    {to: dmap.address, data: calldata + '00'}
                )).rejectedWith('revert')
                await ali.sendTransaction({to: dmap.address, data: calldata})
            })

            it('slot', async () => {
                // slot aliases pair
                const calldata = dmap_i.encodeFunctionData("slot", [name])
                await ali.sendTransaction({to: dmap.address, data: calldata.slice(0, calldata.length)})
            })

            it('pair', async () => {
                const calldata = dmap_i.encodeFunctionData("pair", [name])
                await want(ali.sendTransaction(
                    {to: dmap.address, data: calldata.slice(0, calldata.length - 2)}
                )).rejectedWith('revert')
                await ali.sendTransaction({to: dmap.address, data: calldata.slice(0, calldata.length)})
            })
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

        it('pair', async () => {
            await send(lib.set, dmap, name, one, one)
            const slot = keccak256(coder.encode(["address", "bytes32"], [ALI, name]))
            const calldata = dmap_i.encodeFunctionData("pair", [slot])
            const tx = await dmap.signer.sendTransaction({to: dmap.address, data: calldata})
            const rx = await tx.wait()

            const bound = bounds.dmap.pair
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })
   })

})

const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')
const ethers = hh.ethers
const { b32, fail, revert, send, snapshot, wait, want } = require('minihat')

const {expectEvent, padRight, check_gas, check_entry} = require('./utils/helpers')
const {bounds} = require("./bounds");
const debug = require('debug')('dmap:test')
const constants = ethers.constants

describe('rootzone', ()=>{
    let dmap
    let rootzone
    let freezone

    let ali, bob, cat
    let ALI, BOB, CAT

    const zone1 = '0x' + '0'.repeat(38) + '11'
    const zone2 = '0x' + '0'.repeat(38) + '12'

    const delay_period = 60 * 60 * 31
    const LOCK = '0x80'+'00'.repeat(31)

    function getCommitment (name, zone, salt=b32('salt')) {
        const types = [ "bytes32", "bytes32", "address" ]
        const encoded = ethers.utils.defaultAbiCoder.encode(types, [ salt, name, zone ])
        return hh.ethers.utils.keccak256(encoded)
    }

    before(async ()=>{
        [ali, bob, cat] = await ethers.getSigners();
        [ALI, BOB, CAT] = [ali, bob, cat].map(x => x.address)

        await hh.run('deploy-mock-dmap')
        const dapp = await dpack.load(require('../pack/dmap_full_hardhat.dpack.json'), hh.ethers, ali)
        dmap = dapp.dmap
        rootzone = dapp.rootzone
        freezone = dapp.freezone
        await snapshot(hh)
    })

    beforeEach(async ()=>{
        await revert(hh)
    })

    it('init', async () => {
        const mark = getCommitment(b32('free'), freezone.address)
        const filters = [
            rootzone.filters.Ante(ethers.utils.parseEther('0.001')),
            rootzone.filters.Hark(mark),
            rootzone.filters.Etch('0x' + b32('free').toString('hex'), freezone.address),
        ]
        for (const f of filters) {
            const res = await rootzone.queryFilter(f)
            want(res.length).to.eql(1)
            debug(res[0].event, res[0].args)
        }
        want(await rootzone.dmap()).to.eql(dmap.address)
        want(Number(await rootzone.term())).to.be.greaterThan(0)
        want(await rootzone.mark()).to.eql(mark)
        want(await rootzone.dark()).to.eql(mark)
        want(await rootzone.pile()).to.eql(constants.Zero)
        want(await rootzone.user()).to.eql(ALI)
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
        await check_entry(dmap, rootzone.address, b32('zone2'), constants.HashZero, constants.HashZero)
    })

    it('auction conclusion timing', async ()=>{
        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.1') })
        await fail('ErrPending', rootzone.hark)
        await wait(hh, 60 * 60 * 10)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.2') })
        await wait(hh, 60 * 60 * 30)
        await fail('ErrPending', rootzone.hark)
        await wait(hh, 60 * 61)
        await send(rootzone.hark)
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    })

    it('root survives after refund fails', async ()=>{
        // repeat hark
    })

    it('bids can not be placed after timeout', async ()=>{
    })

    it('multiple auctions', async ()=>{
    })

    it('', async ()=>{
    })

    // it('fee', async ()=>{
    //     await wait(hh, delay_period)
    //     const aliStartBalance = await ali.getBalance()
    //     const commitment = getCommitment(b32('zone1'), zone1)
    //     await fail('ErrPayment', rootzone.hark, commitment)
    //     await fail('ErrPayment', rootzone.hark, commitment, { value: ethers.utils.parseEther('0.9') })
    //     await fail('ErrPayment', rootzone.hark, commitment, { value: ethers.utils.parseEther('1.1') })
    //     await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
    //     const aliEndBalance = await ali.getBalance()
    //     want((aliStartBalance.sub(ethers.utils.parseEther('1.0'))).gt(aliEndBalance)).true
    //     want((aliStartBalance.sub(ethers.utils.parseEther('1.5'))).lt(aliEndBalance)).true
    //     await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    // })

    it('etch fail wrong hash', async ()=>{
        await wait(hh, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.01') })
        await wait(hh, 60 * 60 * 32)
        await send(rootzone.hark)
        await fail('ErrExpired', rootzone.etch, b32('wrong_salt'), b32('zone1'), zone1)
        await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
        await check_entry(dmap, rootzone.address, b32('zone1'), LOCK, padRight(zone1))
    })

    it('error priority', async () => {
        await wait(hh, delay_period)
        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('1') })

        // pending, payment, receipt
        await fail('ErrPending', rootzone.hark)
        // payment, receipt
        await fail('ErrPayment', rootzone.ante, commitment, { value: ethers.utils.parseEther('1') })
        await fail('ErrPayment', rootzone.ante, commitment, { value: ethers.utils.parseEther('0') })
        await fail('ErrPayment', rootzone.ante, commitment, { value: ethers.utils.parseEther('0.5') })
        // receipt
        await hh.network.provider.send(
            "hardhat_setCoinbase", [rootzone.address] // not payable
        )
        await wait(hh, delay_period)
        await fail('ErrReceipt', rootzone.hark)
    })

    it('etch fail rewrite zone', async ()=>{
        await wait(hh, delay_period)
        const commitment = getCommitment(b32('free'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('1') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await fail('revert', rootzone.etch, b32('salt'), b32('free'), zone1)
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    })

    // it('state updates', async ()=>{
    //     await wait(hh, delay_period)
    //     const commitment = getCommitment(b32('zone1'), zone1)
    //     await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
    //
    //     await wait(hh, delay_period)
    //     const newCommitment = getCommitment(b32('zone2'), zone2)
    //     await send(rootzone.hark, newCommitment, { value: ethers.utils.parseEther('1') })
    //
    //     await fail('ErrExpired', rootzone.etch, b32('salt'), b32('zone1'), zone1)
    //     await send(rootzone.etch, b32('salt'), b32('zone2'), zone2)
    //
    //     await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    //     await check_entry(dmap, rootzone.address, b32('zone2'), LOCK, padRight(zone2))
    // })

    it('Hark event', async () => {
        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.5') })
        await wait(hh, delay_period)
        const rx = await send(rootzone.hark)
        expectEvent(rx, "Hark", [commitment])
    })

    it('Etch event', async () => {
        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.5') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        const rx = await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
        expectEvent(rx, "Etch", ['0x' + b32('zone1').toString('hex'), zone1])
        await check_entry(dmap, rootzone.address, b32('zone1'), LOCK, padRight(zone1))
    })

    it('coinbase recursive callback', async () => {
        const mc_type = await ethers.getContractFactory('RecursiveCoinbase', ali)
        const mc = await mc_type.deploy()
        await hh.network.provider.send(
            "hardhat_setCoinbase", [mc.address]
        )

        const commitment = getCommitment(b32('zone1'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.5') })
        await wait(hh, delay_period)
        await fail('ErrReceipt', rootzone.hark)
    })

    describe('gas', () => {
        const commitment = getCommitment(b32('zone1'), zone1)

        it('ante', async () => {
            await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.1') })
            const rx = await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.2') })
            const bound = bounds.rootzone.ante
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })

        it('hark', async () => {
            await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.5') })
            await wait(hh, delay_period)
            const rx = await send(rootzone.hark)
            const bound = bounds.rootzone.hark
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })

        it('etch', async () => {
            await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('0.5') })
            await wait(hh, delay_period)
            await send(rootzone.hark)
            const rx = await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
            const bound = bounds.rootzone.etch
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })
    })
})

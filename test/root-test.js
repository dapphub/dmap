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
    const zone3 = '0x' + '0'.repeat(38) + '13'
    const commitment1 = getCommitment(b32('zone1'), zone1)
    const commitment2 = getCommitment(b32('zone2'), zone2)
    const commitment3 = getCommitment(b32('zone3'), zone3)

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

        await hh.run('dmap-mock-deploy')
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
        want(await rootzone.user()).to.eql(ALI)
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
        await check_entry(dmap, rootzone.address, b32('zone2'), constants.HashZero, constants.HashZero)
    })

    it('new bids must be higher', async ()=>{
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.2') })
        await fail('ErrPayment', rootzone.ante, commitment1, { value: ethers.utils.parseEther('0') })
        await fail('ErrPayment', rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await fail('ErrPayment', rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.2') })
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.25') })
    })

    it('bids can not be placed after timeout', async ()=>{
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await wait(hh, delay_period)
        await fail('ErrPending', rootzone.ante, commitment2, { value: ethers.utils.parseEther('10.0') })
    })

    it('bids refunded iff unsuccessful', async ()=>{
        const aliStartBalance = await ali.getBalance()
        const bobStartBalance = await bob.getBalance()
        const catStartBalance = await cat.getBalance()

        aliTx = await send(rootzone.connect(ali).ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        bobTx = await send(rootzone.connect(bob).ante, commitment2, { value: ethers.utils.parseEther('0.2') })
        catTx = await send(rootzone.connect(cat).ante, commitment3, { value: ethers.utils.parseEther('0.3') })

        const aliFinalBalance = await ali.getBalance()
        const bobFinalBalance = await bob.getBalance()
        const catFinalBalance = await cat.getBalance()

        want((aliStartBalance.sub(aliTx.gasUsed.mul(aliTx.effectiveGasPrice))).eq(aliFinalBalance)).true
        want((bobStartBalance.sub(bobTx.gasUsed.mul(bobTx.effectiveGasPrice))).eq(bobFinalBalance)).true
        want((catStartBalance.sub(catTx.gasUsed.mul(catTx.effectiveGasPrice))
                .sub(ethers.utils.parseEther('0.3'))).eq(catFinalBalance)).true
    })

    it('harks only possible >= 31 hours after last successful bid', async ()=>{
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await fail('ErrPending', rootzone.hark)
        await wait(hh, 60 * 60 * 10)
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.2') })
        await wait(hh, 60 * 60 * 30)
        await fail('ErrPending', rootzone.hark)
        await wait(hh, 60 * 60)
        await send(rootzone.hark)
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    })

    it('mark of the winner is set', async ()=>{
        await send(rootzone.connect(ali).ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await send(rootzone.connect(bob).ante, commitment2, { value: ethers.utils.parseEther('0.2') })
        await wait(hh, delay_period)
        await send(rootzone.connect(ali).hark)
        await fail('ErrExpired', rootzone.etch, b32('salt'), b32('zone1'), zone1)
        await send(rootzone.etch, b32('salt'), b32('zone2'), zone2)
        await check_entry(dmap, rootzone.address, b32('zone2'), LOCK, padRight(zone2))
    })

    it('winners can etch up until there is a new winner', async ()=>{
        await send(rootzone.connect(ali).ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await wait(hh, delay_period)
        await fail('ErrExpired', rootzone.etch, b32('salt'), b32('zone1'), zone1)
        await send(rootzone.hark)
        await send(rootzone.connect(bob).ante, commitment2, { value: ethers.utils.parseEther('0.1') })
        await wait(hh, delay_period)
        await send(rootzone.connect(ali).etch, b32('salt'), b32('zone1'), zone1)
        await check_entry(dmap, rootzone.address, b32('zone1'), LOCK, padRight(zone1))
        await send(rootzone.connect(ali).hark)
        await send(rootzone.etch, b32('salt'), b32('zone2'), zone2)
        await check_entry(dmap, rootzone.address, b32('zone2'), LOCK, padRight(zone2))
    })

    it('harks can not take eth from new auction', async ()=>{
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await send(rootzone.hark)
        await send(rootzone.ante, commitment2, { value: ethers.utils.parseEther('0.2') })
        await fail('ErrPending', rootzone.hark)
    })

    it('auction resets', async ()=>{
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.1') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await send(rootzone.ante, commitment2, { value: ethers.utils.parseEther('0.1') })
        await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await send(rootzone.etch, b32('salt'), b32('zone2'), zone2)
        await send(rootzone.ante, commitment3, { value: ethers.utils.parseEther('0.1') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await send(rootzone.etch, b32('salt'), b32('zone3'), zone3)
        await check_entry(dmap, rootzone.address, b32('zone1'), LOCK, padRight(zone1))
        await check_entry(dmap, rootzone.address, b32('zone2'), LOCK, padRight(zone2))
        await check_entry(dmap, rootzone.address, b32('zone3'), LOCK, padRight(zone3))
    })

    it('rootzone survives after refund fails', async ()=>{
        // The danger to avoid is bids being made from unrefundable contracts which can't be beaten. Failing to refund
        // must not revert. The bounced ether becomes part of the new bid.

        const ub1_type = await ethers.getContractFactory('UnrefundableBidder1', ali)
        const ub2_type = await ethers.getContractFactory('UnrefundableBidder2', ali)
        const ub3_type = await ethers.getContractFactory('UnrefundableBidder3', ali)
        const ub1 = await ub1_type.deploy()
        const ub2 = await ub2_type.deploy()
        const ub3 = await ub3_type.deploy()
        await send(ub1.bid, commitment1, rootzone.address, { value: ethers.utils.parseEther('0.1') })
        await send(ub2.bid, commitment1, rootzone.address, { value: ethers.utils.parseEther('0.2') })
        await send(ub3.bid, commitment1, rootzone.address, { value: ethers.utils.parseEther('0.4') })
        await send(rootzone.ante, commitment2, { value: ethers.utils.parseEther('0.8') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await send(rootzone.etch, b32('salt'), b32('zone2'), zone2)
        await check_entry(dmap, rootzone.address, b32('zone2'), LOCK, padRight(zone2))
        const rootZoneBalance = await ethers.provider.getBalance(rootzone.address)
        want(rootZoneBalance.eq(ethers.utils.parseEther('0'))).true
    })

    it('coinbase gets the pile in hark', async ()=>{
        await hh.network.provider.send(
            "hardhat_setCoinbase", [constants.AddressZero]
        )
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('10') })
        await wait(hh, delay_period)
        const valStartBalance = await ethers.provider.getBalance(constants.AddressZero)
        await send(rootzone.hark)
        const valFinalBalance = await ethers.provider.getBalance(constants.AddressZero)
        want(valFinalBalance.sub(valStartBalance).gt(ethers.utils.parseEther('10'))).true
    })

    it('etch fail wrong hash', async ()=>{
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.01') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await fail('ErrExpired', rootzone.etch, b32('wrong_salt'), b32('zone1'), zone1)
        await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
        await check_entry(dmap, rootzone.address, b32('zone1'), LOCK, padRight(zone1))
    })

    it('error priority', async () => {
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('1') })
        // pending, payment, receipt
        await fail('ErrPending', rootzone.hark)
        // payment, receipt
        await fail('ErrPayment', rootzone.ante, commitment1, { value: ethers.utils.parseEther('1') })
        await fail('ErrPayment', rootzone.ante, commitment1, { value: ethers.utils.parseEther('0') })
        await fail('ErrPayment', rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.5') })
        // receipt
        await hh.network.provider.send(
            "hardhat_setCoinbase", [rootzone.address] // not payable
        )
        await wait(hh, delay_period)
        await fail('ErrReceipt', rootzone.hark)
    })

    it('etch fail rewrite zone', async ()=>{
        const commitment = getCommitment(b32('free'), zone1)
        await send(rootzone.ante, commitment, { value: ethers.utils.parseEther('1') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        await fail('revert', rootzone.etch, b32('salt'), b32('free'), zone1)
        await check_entry(dmap, rootzone.address, b32('zone1'), constants.HashZero, constants.HashZero)
    })

    it('Ante event', async () => {
        const rx = await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.5') })
        expectEvent(rx, "Ante", [ethers.utils.parseEther('0.5')])
    })

    it('Hark event', async () => {
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.5') })
        await wait(hh, delay_period)
        const rx = await send(rootzone.hark)
        expectEvent(rx, "Hark", [commitment1])
    })

    it('Etch event', async () => {
        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.5') })
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

        await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.5') })
        await wait(hh, delay_period)
        await send(rootzone.hark)
        want(await rootzone.mark()).to.eql(commitment1)
    })

    describe('gas', () => {
        it('ante', async () => {
            const rx = await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.1') })
            const bound = bounds.rootzone.ante
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })

        it('hark', async () => {
            await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.5') })
            await wait(hh, delay_period)
            const rx = await send(rootzone.hark)
            const bound = bounds.rootzone.hark
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })

        it('etch', async () => {
            await send(rootzone.ante, commitment1, { value: ethers.utils.parseEther('0.5') })
            await wait(hh, delay_period)
            await send(rootzone.hark)
            const rx = await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
            const bound = bounds.rootzone.etch
            await check_gas(rx.gasUsed, bound[0], bound[1])
        })
    })
})

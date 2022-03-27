const dpack = require('@etherpacks/dpack')
const hh = require('hardhat')

const ethers = hh.ethers
const { b32, fail, revert, send, snapshot, wait, want } = require('minihat')
const { expectEvent } = require('./utils/helpers')
const debug = require('debug')('dmap:test')

describe('rootzone', ()=>{
    let dmap
    let rootzone
    let freezone

    let ali, bob, cat
    let ALI, BOB, CAT

    const zone1 = '0x' + '0'.repeat(38) + '11'
    const zone2 = '0x' + '0'.repeat(38) + '12'

    const delay_period = 60 * 60 * 31

    async function getCommitment (name, zone, salt=b32('salt')) {
        const types = [ "bytes32", "bytes32", "address" ]
        const encoded = ethers.utils.defaultAbiCoder.encode(types, [ salt, name, zone ])
        return hh.ethers.utils.keccak256(encoded)
    }

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

    it('init', async () => {
        const mark = await getCommitment(b32('free'), freezone.address)
        const filters = [
            rootzone.filters.Hark(mark),
            rootzone.filters.Etch('0x' + b32('free').toString('hex'), freezone.address),
        ]
        for (const f of filters) {
            const res = await rootzone.queryFilter(f)
            want(res.length).to.eql(1)
            debug(res[0].event, res[0].args)
        }
        want(await rootzone.dmap()).to.eql(dmap.address)
        want(Number(await rootzone.last())).to.be.greaterThan(0)
        want(await rootzone.mark()).to.eql(mark)
    })

    it('cooldown', async ()=>{
        const commitment = await getCommitment(b32('zone1'), zone1)
        await fail('ErrPending', rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
        await wait(hh, 60 * 60 * 30)
        await fail('ErrPending', rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
        await wait(hh, 60 * 60)
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
    })

    it('fee', async ()=>{
        await wait(hh, delay_period)
        const aliStartBalance = await ali.getBalance()
        const commitment = await getCommitment(b32('zone1'), zone1)
        await fail('ErrPayment', rootzone.hark, commitment)
        await fail('ErrPayment', rootzone.hark, commitment, { value: ethers.utils.parseEther('0.9') })
        await fail('ErrPayment', rootzone.hark, commitment, { value: ethers.utils.parseEther('1.1') })
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
        const aliEndBalance = await ali.getBalance()
        want((aliStartBalance.sub(ethers.utils.parseEther('1.0'))).gt(aliEndBalance)).true
        want((aliStartBalance.sub(ethers.utils.parseEther('1.5'))).lt(aliEndBalance)).true
    })

    it('etch fail wrong hash', async ()=>{
        await wait(hh, delay_period)
        const commitment = await getCommitment(b32('zone1'), zone1)
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
        await fail('ErrExpired', rootzone.etch, b32('wrong_salt'), b32('zone1'), zone1)
        await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
    })

    it('error priority', async () => {
        await wait(hh, delay_period)
        const commitment = await getCommitment(b32('zone1'), zone1)
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })

        // pending, payment, receipt
        await fail('ErrPending', rootzone.hark, commitment, { value: ethers.utils.parseEther('0.9') })
        // payment, receipt
        await wait(hh, delay_period)
        await fail('ErrPayment', rootzone.hark, commitment, { value: ethers.utils.parseEther('0.9') })

        // receipt
        await hh.network.provider.send(
            "hardhat_setCoinbase", [rootzone.address] // not payable
        )
        await fail('ErrReceipt', rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
    })

    it('etch fail rewrite zone', async ()=>{
        await wait(hh, delay_period)
        const commitment = await getCommitment(b32('free'), zone1)
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
        await fail('revert', rootzone.etch, b32('salt'), b32('free'), zone1)
    })

    it('state updates', async ()=>{
        await wait(hh, delay_period)
        const commitment = await getCommitment(b32('zone1'), zone1)
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })

        await wait(hh, delay_period)
        const newCommitment = await getCommitment(b32('zone2'), zone2)
        await send(rootzone.hark, newCommitment, { value: ethers.utils.parseEther('1') })

        await fail('ErrExpired', rootzone.etch, b32('salt'), b32('zone1'), zone1)
        await send(rootzone.etch, b32('salt'), b32('zone2'), zone2)
    })

    it('Hark event', async () => {
        await wait(hh, delay_period)
        const commitment = await getCommitment(b32('zone1'), zone1)
        const rx = await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
        expectEvent(rx, "Hark", [commitment])
    })

    it('Etch event', async () => {
        await wait(hh, delay_period)
        const commitment = await getCommitment(b32('zone1'), zone1)
        await send(rootzone.hark, commitment, { value: ethers.utils.parseEther('1') })
        const rx = await send(rootzone.etch, b32('salt'), b32('zone1'), zone1)
        expectEvent(rx, "Etch", ['0x' + b32('zone1').toString('hex'), zone1])
    })

    it('coinbase recursive callback', async () => {
        const mc_type = await ethers.getContractFactory('RecursiveCoinbase', ali)
        const mc = await mc_type.deploy()
        await hh.network.provider.send(
            "hardhat_setCoinbase", [mc.address]
        )

        await wait(hh, delay_period)
        const commitment = await getCommitment(b32('zone1'), zone1)
        await send(rootzone.hark, commitment, {value: ethers.utils.parseEther('1')})
        want(await rootzone.mark()).to.eql(commitment)
    })
})

// redo expectEvent to work with ethers
//     https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/src/expectEvent.js
//
// The MIT License (MIT)
// Copyright (c) 2018 OpenZeppelin
// https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/LICENSE

const { ethers } = require("hardhat");
const {expect} = require("chai");
const {send, b32, want, chai} = require('minihat')
const {hexZeroPad} = require("@ethersproject/bytes");
const lib = require('../../dmap')

// matches eventName
// matches data if defined
function expectEvent (receipt, eventName, eventArgs = {}, data = '0x') {
    const args = Object.keys(eventArgs).map((key) => {return eventArgs[key]})
    let found = false
    receipt.events.forEach(event => {
        if( event.event == eventName && data == event.data ) {
            let match = true
            Object.keys(eventArgs).forEach(key => {
                try {
                    if( eventName == undefined ) {
                        expect(eventArgs[key]).to.eql(event.topics[key])
                    } else {
                        expect(eventArgs[key]).to.eql(event.args[key])
                    }
                } catch {
                    match = false
                }
            })
            found = found || match
        }
    })

    expect(found).to.equal(true, `No '${eventName}' events found with args ${args} and data ${data}`);
}

function padRight(addrStr) {
    const numBits = 256 - 160
    const hexstr = ethers.BigNumber.from(addrStr).shl(numBits).toHexString()
    return hexZeroPad(hexstr, 32);
}

async function check_gas (gas, minGas, maxGas) {
  await want(gas.toNumber()).to.be.at.most(maxGas);
  if( gas.toNumber() < minGas ) {
    console.log("gas reduction: previous min=", minGas, " gas used=", gas.toNumber());
  }
}

// check that get, pair, and slot all return [meta, data]
const check_entry = async (dmap, usr, key, _meta, _data) => {
    const meta = typeof(_meta) == 'string' ? _meta : '0x'+_meta.toString('hex')
    const data = typeof(_data) == 'string' ? _data : '0x'+_data.toString('hex')
    const resGet = await lib.get(dmap, usr, key)
    want(resGet.meta).to.eql(meta)
    want(resGet.data).to.eql(data)
    want(resGet).to.eql([meta, data])
}

let testlib = {}
testlib.pair = async (dmap, slot) => {
    // like lib.pair, but calls dmap instead of direct storage access
    const pairabi = ["function pair(bytes32) returns (bytes32 meta, bytes32 data)"]
    const iface = new ethers.utils.Interface(pairabi)
    const calldata = iface.encodeFunctionData("pair", [slot])
    const resdata = await dmap.signer.call({to: dmap.address, data: calldata})
    const res = iface.decodeFunctionResult("pair", resdata)
    want(res).to.eql(await lib.pair(dmap, slot))
    return res
}

const get_signers = (mnemonic) => {
    const path =  `m/44'/60'/0'/0/`;
    return Array.from(Array(10).keys())
        .map(i => ethers.Wallet.fromMnemonic(
            process.env.TEST_MNEMONIC,
            path + i
    ));
}

let _snap

async function snapshot (provider) {
    _snap = await provider.send('evm_snapshot')
}

async function revert (provider) {
    await provider.send('evm_revert', [_snap])
    await snapshot(provider)
}

async function wait (provider, t) {
    await provider.send("evm_increaseTime", [t])
}

async function mine (provider, t = undefined) {
    if (t !== undefined) {
        await wait(hre, t)
    }
    await provider.request({
        method: 'evm_mine'
    })
}


const wrap_fail = async (provider, wrap, ...args) => {
    const expected = args[0]
    await send(...args.slice(1))
    const ok = await provider.getStorageAt(wrap.address, 1)
    const data = await provider.getStorageAt(wrap.address, 2)
    want(ethers.utils.hexZeroPad(ok, 32)).to.eql('0x'+'0'.repeat(64))
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(expected)).slice(0, 10)
    want(data.slice(0, 10)).to.eql(hash)
}

const wrap_fail_str = async (provider, wrap, ...args) => {
    const expected = args[0]
    await send(...args.slice(1))
    want(await provider.getStorageAt(wrap.address, 1)).to.eql('0x')
    // TODO where is the string?
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Error(string)")).slice(0, 10)
    want((await provider.getStorageAt(wrap.address, 2)).slice(0, 10)).to.eql(hash)
}

const wrap_send = async (provider, wrap, ...args) => {
    await send(...args)
    const ok = await provider.getStorageAt(wrap.address, 1)
    const data = await provider.getStorageAt(wrap.address, 2)
    want(ethers.utils.hexZeroPad(ok, 32)).to.eql('0x'+'0'.repeat(63)+'1')
    want(ethers.utils.hexZeroPad(data, 32)).to.eql('0x'+'0'.repeat(64))
}

async function fail (...args) {
    const err = args[0]
    const sargs = args.slice(1)
    await want(send(...sargs)).rejectedWith(err)
}

module.exports = {
    expectEvent,
    padRight,
    check_gas,
    check_entry,
    testlib,
    get_signers,
    snapshot,
    revert,
    wait,
    mine,
    wrap_fail,
    wrap_send,
    wrap_fail_str,
    send,
    fail,
    b32,
    chai,
    want
}

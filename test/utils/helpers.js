// redo expectEvent to work with ethers
//     https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/src/expectEvent.js
//
// The MIT License (MIT)
// Copyright (c) 2018 OpenZeppelin
// https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/LICENSE

const { ethers } = require("hardhat");
const {expect} = require("chai");
const { want } = require('minihat')
const {hexZeroPad} = require("@ethersproject/bytes");
const keccak256 = ethers.utils.keccak256
const coder = ethers.utils.defaultAbiCoder
const lib = require('../../dmap.js')

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

    const slot = keccak256(coder.encode(["address", "bytes32"], [usr, key]))
    const resPair = await dmap.pair(slot)
    want(resPair.meta).to.eql(meta)
    want(resPair.data).to.eql(data)
    want(resPair).to.eql([meta, data])

    want(await dmap.slot(slot)).to.eql(meta)
    const nextslot = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(slot).add(1).toHexString(), 32
    )
    want(await dmap.slot(nextslot)).to.eql(data)
}

module.exports = { expectEvent, padRight, check_gas, check_entry }

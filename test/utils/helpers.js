const { chai, send, want } = require('minihat')
const {expect} = require('chai');
const {BigNumber} = require('ethers')

// redo expectEvent to work with ethers
//     https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/src/expectEvent.js
//
// The MIT License (MIT)
// Copyright (c) 2018 OpenZeppelin
// https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/LICENSE
//
// matches eventName
// matches data if defined
function expectEvent (receipt, eventName, eventArgs = {}, data = undefined) {
    const args = Object.keys(eventArgs).map((key) => {return eventArgs[key]})
    let found = false
    receipt.events.forEach(event => {
        if( event.event == eventName && (data == undefined || data == event.data) ) {
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

    expect(found).to.equal(true, `No '${eventName}' events found with args ${args}`);
}

async function check_gas (gas, minGas, maxGas) {
  await want(gas.toNumber()).to.be.at.most(maxGas);
  if( gas.toNumber() < minGas ) {
    console.log("gas reduction: previous min=", minGas, " gas used=", gas.toNumber());
  }
}


// generate 1d tests
// takes three functions that manipulate state
// fill: increase value by one
// clear: decrease value by one
// stay: keep value the same, using the method being profiled
// fill, clear and stay should return undefined if they don't use the method being tested
// verify: verify the new src and dst values
function test1D(
  name, init, fill, clear, stay,
  one, two, bounds, verify = undefined
) {
  function assert_def(gas) {
    chai.assert(
      gas != undefined,
      "Testing fill/clear/stay, but it returned undefined.  This test can be removed."
    )
  }
  describe(name, () => {
    let ZERO
    if( Buffer.isBuffer(one) ) {
      ZERO = Buffer.from('00'.repeat(32), 'hex')
    } else if( typeof(one) == 'boolean' ) {
      ZERO = false
    } else if( BigNumber.isBigNumber(one) ) {
      ZERO = constants.Zero
    } else if( typeof(one) == 'number' ) {
      ZERO = 0
    }
    //let ZERO = typeof(one) == 'boolean' ? false : typeof(one) == 'Buffer' ? Buffer.from(0)
    //  : BigNumber.from(0)
    beforeEach(init)
    describe('no change', () => {
      if( bounds[0] != undefined && bounds[0][0] != undefined ) {
        it('0->0', async () => {
          const tx = await stay(ZERO)
          assert_def(tx)
          const gas = tx.gasUsed
          if( verify ) await verify(ZERO, ZERO)
          const bound = bounds[0][0]
          await check_gas(gas, bound[0], bound[1])
        })
      }
      if( bounds[1] != undefined && bounds[1][1] != undefined ) {
        it('1->1', async () => {
          await fill(ZERO, one)
          const tx = await stay(one)
          assert_def(tx)
          if( verify ) await verify(one, one)
          const gas = tx.gasUsed
          const bound = bounds[1][1]
          await check_gas(gas, bound[0], bound[1])
        })
      }
    })
    describe('change', () => {
      if( bounds[0] != undefined && bounds[0][1] != undefined ) {
        it('0->1', async () => {
          const tx = await fill(ZERO, one)
          assert_def(tx)
          const gas = tx.gasUsed
          if( verify ) await verify(ZERO, one)
          const bound = bounds[0][1]
          await check_gas(gas, bound[0], bound[1])
        })
      }
      if( bounds[1] != undefined && bounds[1][0] != undefined ) {
        it('1->0', async () => {
          await fill(ZERO, one)
          const tx = await clear(one, ZERO)
          assert_def(tx)
          const gas = tx.gasUsed
          if( verify ) await verify(one, ZERO)
          const bound = bounds[1][0]
          await check_gas(gas, bound[0], bound[1])
        })
      }
      if( bounds[1] != undefined && bounds[1][2] != undefined ) {
        it('1->2', async () => {
          // 1->2 invalid for bools
          want(one).to.not.be.a('boolean')
          await fill(ZERO, one)
          const tx = await fill(one, two)
          assert_def(tx)
          const gas = tx.gasUsed
          if( verify ) await verify(one, two)
          const bound = bounds[1][2]
          await check_gas(gas, bound[0], bound[1])
        })
      }
      if( bounds[2] != undefined && bounds[2][1] != undefined ) {
        it('2->1', async () => {
          // 1->2 invalid for bools
          want(one).to.not.be.a('boolean')
          await fill(ZERO, two)
          const tx = await clear(two, one)
          assert_def(tx)
          const gas = tx.gasUsed
          if( verify ) await verify(two, one)
          const bound = bounds[2][1]
          await check_gas(gas, bound[0], bound[1])
        })
      }
    })
  })
}

module.exports = { expectEvent, test1D, check_gas }

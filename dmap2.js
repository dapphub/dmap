import {default as detect}
  from '@metamask/detect-provider'

import {default as pack}
  from './pack/premap.dpack.json' assert { type: 'json' };

import {default as artifact}
  from './pack/Dmap.json' assert { type: 'json' };

let provider;
if (globalThis.window) {
    let _provider = await detect()
    if (provider) {
        if (_provider == window.provider) {
            provider = _provider
        } else {
            console.log('conflicting providers detected')
        }
    } else {
        console.log('no provider detected')
    }
} else {
    console.log('WARN no window object, nothing loaded')
}

export const dmap = {}

dmap.address = pack.objects.dmap.address;
dmap.abi = artifact.abi; // TODO check == pack.types.Dmap->artifact.abi

let test = ()=>{}
if (process && process.argv.includes('--test')) {
    test = require('tapzero').test
}

dmap._getStorageSlot = async (slot)=> {
    fetch(ETH_RPC_URL, {method:"", params:[]})
}

dmap.getData = async (zone,name)=> {
}
dmap.getDataByHash = async (hash)=> {
}

dmap.getMetaData = async (zone,name)=> {
}
dmap.getMetaDataByHash = async (hash)=> {
}

dmap.getPair = async (zone,name)=> {
}
dmap.getPairByHash = async (hash)=> {
}

test('meta', t=>{
    t.ok(process.argv.includes('--test'),
         `should only run when using 'node dmap.js --test`)
})

test('address', t=>{
    t.equal(dmap.address.length, 42) // 0x + 20 bytes
})

test('abi', t=>{
    t.ok(dmap.abi)
})


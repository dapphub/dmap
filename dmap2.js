

const pack = require('./pack/premap.dpack.json')
const artifact = require('./pack/Dmap.json') // TODO verify (or load via CID)

module.exports = dmap = {}

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


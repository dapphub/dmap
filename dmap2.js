const dmap = {}

const test =(s,f)=> {
    if (process && process.argv.includes('--test')) {
        require('tapzero').test(s,f)
    }
}

dmap.address = ""
dmap.abi = {}

test('address', ()=>{
    console.log('should only run when using `node dmap.js --test`')
})


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

module.exports = dmap

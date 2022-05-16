const { CID } = require('multiformats/cid')
const { sha256 } = require ('multiformats/hashes/sha2')

const dmap = require('../dmap.js')

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

const gateways = ['https://ipfs.fleek.co/ipfs/',
                  'https://gateway.pinata.cloud/ipfs/',
                  'https://cloudflare-ipfs.com/ipfs/',
                  'https://storry.tv/ipfs/',
                  'https://ipfs.io/ipfs/',
                  'https://hub.textile.io/ipfs/']
const infuraURL = 'https://mainnet.infura.io/v3/c0a739d64257448f855847c6e3d173e1'
const prefLenIndex = 30

module.exports = utils = {}

utils.prepareCID = (cidStr, lock) => {
    const cid = CID.parse(cidStr)
    need(cid.multihash.size <= 32, `Hash exceeds 256 bits`)
    const prefixLen = cid.byteLength - cid.multihash.size
    const meta = new Uint8Array(32).fill(0)
    const data = new Uint8Array(32).fill(0)

    data.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
    meta.set(cid.bytes.slice(0, prefixLen))
    if (lock) meta[31] |= dmap.FLAG_LOCK
    meta[prefLenIndex] = prefixLen
    return [meta, data]
}

utils.unpackCID = (metaStr, dataStr) => {
    const meta = dmap._hexToArrayBuffer(metaStr)
    const data = dmap._hexToArrayBuffer(dataStr)
    const prefixLen = meta[prefLenIndex]
    const specs = CID.inspectBytes(meta.slice(0, prefixLen))
    const hashLen = specs.digestSize
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(meta.slice(0, prefixLen), 0)
    cidBytes.set(data.slice(32 - hashLen), prefixLen)
    const cid = CID.decode(cidBytes)
    return cid.toString()
}

utils.readCID = async (contract, path) => {
    const packed = await dmap.walk(contract, path)
    return utils.unpackCID(packed.meta, packed.data)
}

const resolveCID = async (cid, targetDigest, nodeAddress) => {
    const verify = async bytes => {
        const hash = await sha256.digest(bytes)
        const resultDigest = JSON.stringify(hash.digest)
        return targetDigest === resultDigest
    }

    const url = nodeAddress + '/api/v0/cat?arg=' + cid
    const response = await fetch(url, { method: 'POST' })
    const catResponse = response.body.getReader();

    // initially handle only single chunk verification and sha256
    try {
        const chunk = await catResponse.read()
        if(await verify(chunk.value)) {
            return chunk.value
        }
    } catch(e) {}

    for (const gateway of gateways) {
        const url = gateway + cid
        try {
            const response = await fetch(url);
            const reader = response.body.getReader();
            let readRes = await reader.read();
            if (await verify(readRes.value)) {
                return readRes.value
            }
        } catch (e) {}
    }
    throw 'unable to resolve cid'
}

const makeRPC = async (url, method, params) => {
    let result = null
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 0
            }),
        });
        ({result} = await response.json())
    }
    catch (err) {}
    return result
}

const RPCGetStorage = async (url, address, slot) => {
    const block = await makeRPC(url, "eth_blockNumber", [])
    return await makeRPC(url, "eth_getStorageAt", [address, slot, block])
}

const windowGetStorage = async (address, slot) => {
    const block  = await window.ethereum.request({ method: 'eth_blockNumber',  params: [] });
    return await window.ethereum.request({ method: 'eth_getStorageAt', params: [address, slot, block] });
}

const getFacade = async (customURL) => {
    let storageFunction = null, description = ''

    if (await makeRPC(customURL, "eth_chainId", []) == '0x1') {
        storageFunction = RPCGetStorage.bind(null, customURL)
        description = 'custom node'
    } else if (typeof window.ethereum !== 'undefined' &&
               await window.ethereum.request({ method: 'eth_chainId',  params: [] }) == '0x1') {
        storageFunction = windowGetStorage
        description = 'window.ethereum'
    } else if (await makeRPC(infuraURL, "eth_chainId", []) == '0x1') {
        storageFunction = RPCGetStorage.bind(null, infuraURL)
        description = 'infura'
    } else {
        throw 'no ethereum connection'
    }

    return [{ provider: { getStorageAt:storageFunction },
              address: dmap.address
            }, description]
}

window.onload = async() => {
    const $ = document.querySelector.bind(document);
    const line =s=> { $('#result').textContent += s + '\n' }

    $('#btnGet').addEventListener('click', async () =>  {
        let dpath = $('#dpath').value;
        if (dpath.length && dpath[0] != ':') {
            dpath = ':' + dpath
        }
        const [dmapFacade, description] = await getFacade($('#ethNode').value)

        line('')
        line(`WALK  ${dpath} (using ${description} for eth connection)`)
        line('')

        let walkResult
        try {
            walkResult = await dmap.walk2(dmapFacade, dpath)
            for (const step of walkResult) {
                line(`step`)
                line(`  meta: ${step[0]}`)
                line(`  data: ${step[1]}`)
            }
        }
        catch (error) {
            line('')
            line(`FAIL: ${error}`)
            return
        }
        line('')
        const last = walkResult.pop()
        console.log(last)
        walkResult = { meta: last[0], data: last[1] }

        try {
            // display ipfs content from a CID if we can, otherwise display as text
            const cid = utils.unpackCID(walkResult.meta, walkResult.data)
            line(`ipfs: ${cid}`)
            const targetDigest = JSON.stringify(CID.parse(cid).multihash.digest)
            const resolved = await resolveCID(cid, targetDigest, $('#ipfsNode').value)
            let utf8decoder = new TextDecoder()
            line(utf8decoder.decode(resolved))
        }
        catch(e){
            let utf8decoder = new TextDecoder()
            const bytes = dmap._hexToArrayBuffer(walkResult.data)
            for (var i = 0; i < bytes.length; i++) {
                if (bytes[bytes.length -1 - i] !== 0) {
                    break
                }
            }
            line(`text: ${utf8decoder.decode(bytes.slice(0, -i))}`)
        }
    });

    $('#dpath').addEventListener("keyup", event => {
        if(event.key !== "Enter") return;
        $('#btnGet').click()
    });
}

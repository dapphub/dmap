const multiformats = require('multiformats')
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
const IPFS = require('ipfs-http-client')

const dmap = require('../dmap.js')

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

const gateways = ['https://ipfs.fleek.co/ipfs/',
                  'https://gateway.pinata.cloud/ipfs/',
                  'https://cloudflare-ipfs.com/ipfs/',
                  'https://storry.tv/ipfs/',
                  'https://ipfs.io/ipfs/',
                  'https://hub.textile.io/ipfs/']


const prefLenIndex = 30

const prepareCID = (cidStr, lock) => {
    const cid = multiformats.CID.parse(cidStr)
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

const unpackCID = (metaStr, dataStr) => {
    const meta = Buffer.from(metaStr.slice(2), 'hex')
    const data = Buffer.from(dataStr.slice(2), 'hex')
    const prefixLen = meta[prefLenIndex]
    const specs = multiformats.CID.inspectBytes(meta.slice(0, prefixLen))
    const hashLen = specs.digestSize
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(meta.slice(0, prefixLen), 0)
    cidBytes.set(data.slice(32 - hashLen), prefixLen)
    const cid = multiformats.CID.decode(cidBytes)
    return cid.toString()
}

const readCID = async (dmap, path) => {
    const packed = await dmap.walk(dmap, path)
    return unpackCID(packed.meta, packed.data)
}

const resolveCID = async (cid, targetDigest, nodeAddress) => {
    const verify = async bytes => {
        const hash = await sha256.digest(bytes)
        const resultDigest = JSON.stringify(hash.digest)
        return targetDigest === resultDigest
    }
    const node = IPFS.create(nodeAddress)
    const catResponse = await node.cat(cid)
    // initially handle only single chunk verification and sha256
    try {
        const chunk = await catResponse.next()
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

const getFacade = async (url) => {
    const chainId = await makeRPC(url, "eth_chainId", [])
    let storageFunction = windowGetStorage
    if (chainId == '0x1') {
        storageFunction = RPCGetStorage.bind(null, url)
    }
    return {
        provider: { getStorageAt:storageFunction },
        address: dmap.address
    }
}

window.onload = async() => {
    const $ = document.querySelector.bind(document);
    const line =s=> { $('#result').textContent += s + '\n' }

    $('#btnGet').addEventListener('click', async () =>  {
        let dpath = $('#dpath').value;
        if (dpath.length && dpath[0] != ':') {
            dpath = ':' + dpath
        }
        line('')
        line(`WALK  ${dpath}`)
        line('')

        const dmapFacade = await getFacade($('#ethNode').value)
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
            const cid = unpackCID(walkResult.meta, walkResult.data)
            line(`ipfs: ${cid}`)
            const targetDigest = JSON.stringify(CID.parse(cid).multihash.digest)
            const resolved = await resolveCID(cid, targetDigest, $('#ipfsNode').value)
            let utf8decoder = new TextDecoder()
            line(utf8decoder.decode(resolved))
        }
        catch(e){
            let utf8decoder = new TextDecoder()
            const bytes = Buffer.from(walkResult.data.slice(2), 'hex')
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

import { ethers } from 'ethers'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
const dmap = require('../dmap.js')
const dmapAddress = dmap.address
const dmapArtifact = dmap.artifact
const IPFS = require('ipfs-http-client')

const gateways = ['https://ipfs.fleek.co/ipfs/',
                  'https://gateway.pinata.cloud/ipfs/',
                  'https://cloudflare-ipfs.com/ipfs/',
                  'https://storry.tv/ipfs/',
                  'https://ipfs.io/ipfs/',
                  'https://hub.textile.io/ipfs/']

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

window.onload = async() => {
    const $ = document.querySelector.bind(document);
    const line =s=> { $('#result').textContent += s + '\n' }

    $('#btnGet').addEventListener('click', async () =>  {
        let dpath = $('#dpath').value;
        if (dpath.length && dpath[0] != ':') {
            dpath = ':' + dpath
        }
        line(`\nWALK  ${dpath}`)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const dmapContract = new ethers.Contract(
            dmapAddress,
            dmapArtifact.abi,
            provider
        );

        let walkResult
        try {
            walkResult = await dmap.walk(dmapContract, dpath)
            line(`meta: ${walkResult.meta}`)
            line(`data: ${walkResult.data}`)
        }
        catch (error) {
            line(`FAIL: ${error}`)
            return
        }

        try {
            // display ipfs content from a CID if we can, otherwise display as text
            const cid = dmap.unpackCID(walkResult.meta, walkResult.data)
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

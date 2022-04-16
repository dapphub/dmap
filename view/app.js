import { ethers } from 'ethers'
const { getIpfs, providers } = require('ipfs-provider')
const { httpClient, jsIpfs } = providers
const dmap = require('../dmap.js')
const dmapAddress = '0x7fA88e1014B0640833a03ACfEC71F242b5fBDC85'
const dmapArtifact = require('../artifacts/core/dmap.sol/Dmap.json')

window.onload = async() => {
    const $ = document.querySelector.bind(document);
    const line =s=> { $('#result').textContent += s + '\n' }
    const node = await getIpfs({
        providers: [
            // attempt to use local node, if unsuccessful fallback to running embedded core js-ipfs in-page
            httpClient({
                loadHttpClientModule: () => require('ipfs-http-client'),
                apiAddress: '/ip4/127.0.0.1/tcp/5001'
            }),
            jsIpfs({
                loadJsIpfsModule: () => require('ipfs-core'),
                options: { }
            })
        ]
    })

    $('#btnGet').addEventListener('click', async () =>  {
        const dpath = $('#dpath').value;
        line(`WALK ${dpath}`)
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
            const cidResult = dmap.unpackCID(walkResult.meta, walkResult.data)
            line(`ipfs: ${cidResult}`)
            const ipfsResult = await node.ipfs.cat(cidResult)
            let s = ''
            let utf8decoder = new TextDecoder()
            for await (const chunk of ipfsResult) {
                s += utf8decoder.decode(chunk)
            }
            line(s)
        }
        catch(e){
            let utf8decoder = new TextDecoder()
            const bytes = Buffer.from(walkResult.data.slice(2), 'hex')
            let i
            for (i = 0; i < bytes.length; i++) {
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

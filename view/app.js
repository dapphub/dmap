import { ethers } from 'ethers'
const dpack = require('@etherpacks/dpack')
const dmap = require('../dmap.js')
const dmapAddress = '0x7fA88e1014B0640833a03ACfEC71F242b5fBDC85'
const dmapArtifact = require('../artifacts/core/dmap.sol/Dmap.json')

window.onload =()=> {
    const $ = document.querySelector.bind(document);
    const result = $('#result')

    const line =s=> { $('#result').textContent += s + '\n' }

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
            // display json content from a CID if we can
            const cidResult = dmap.unpackCID(walkResult.meta, walkResult.data)
            line(`ipfs: ${cidResult}`)
            const ipfsResult = await dpack.getIpfsJson(cidResult)
            line(JSON.stringify(ipfsResult, null, 4))
        }
        catch(e){
            // otherwise show text
            let utf8decoder = new TextDecoder()
            const bytes = dmap._hexToArrayBuffer(walkResult.data)
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

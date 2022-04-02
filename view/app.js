const ethers = require('ethers')
const dmap = require('../dmap.js')
const dmapAddress = '0x44a47a976b2a4af781365b27f94e582ffdb71c12'
const dmapArtifact = require('../artifacts/sol/dmap.sol/Dmap.json')

window.onload =()=> {
    const $ = document.querySelector.bind(document);

    $('btnGet').addEventListener('click', async () =>  {
        $('wait').style.display = 'contents'
        const dpath = $('#dpath').value;
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const dmapContract = new ethers.Contract(
            dmapAddress,
            dmapArtifact.abi,
            provider
        );

        let walkResult
        try {
            walkResult = await dmap.walk(dmapContract, dpath)
            $('#meta').textContent = 'meta: ' + walkResult.meta;
            $('#meta').style.display = 'contents'
            $('#data').textContent = 'data: ' + walkResult.data;
            $('#data').style.display = 'contents'
        }
        catch (error) {
            $('#fail').textContent = error
            $('$fail').style.display = 'contents'
            return
        }
        finally {
            $('#wait').style.display = 'none'
        }

        try {
            const cidResult = dmap.unpackCID(walkResult.meta, walkResult.data)
            $('#ipfs').textContent = 'ipfs: ' + cidResult;
            $('#ipfs').style.display = 'contents'
        }
        catch (error){}
    });

    pathInput.addEventListener("keyup", event => {
        if(event.key !== "Enter") return;
        btnGet.click()
    });
}

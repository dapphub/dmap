const ethers = require('ethers')
const dmap = require('../dmap.js')
const dmapAddress = '0x44a47a976b2a4af781365b27f94e582ffdb71c12'
const dmapArtifact = require('../artifacts/sol/dmap.sol/Dmap.json')

window.onload =()=> {
    const $ = document.querySelector.bind(document);
    const result = $('#result')

    $('#btnGet').addEventListener('click', async () =>  {
        result.textContent = '\n' + '...'
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
            result.textContent = '\n' + 'meta: ' + walkResult.meta
            result.textContent += '\n' + 'data: ' + walkResult.data
        }
        catch (error) {
            result.textContent = '\n' + error
            return
        }

        try {
            const cidResult = dmap.unpackCID(walkResult.meta, walkResult.data)
            result.textContent += '\n' + 'ipfs: ' + cidResult
        }
        catch (error){}
    });

    $('#dpath').addEventListener("keyup", event => {
        if(event.key !== "Enter") return;
        $('#btnGet').click()
    });
}

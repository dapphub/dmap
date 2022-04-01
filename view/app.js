const ethers = require('ethers')
const lib = require('../dmap.js')

const getButton = document.querySelector('#getButton')
const pathInput = document.querySelector("#dpath");
const wait = document.querySelector("#waitvalue")
const meta = document.querySelector("#metavalue")
const data = document.querySelector("#datavalue")
const ipfs = document.querySelector("#ipfsvalue")
const fail = document.querySelector("#failvalue")
const outputs = [wait, meta, data, ipfs, fail]
outputs.map(out=>out.style.display = 'none')

getButton.addEventListener('click', async () =>  {
    outputs.map(out=>out.style.display = 'none')
    wait.style.display = 'contents'

    const dmapAddress = '0x44a47a976b2a4af781365b27f94e582ffdb71c12'
    const dpath = pathInput.value;
    const dmapArtifact = require('../artifacts/sol/dmap.sol/Dmap.json')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const dmapContract = new ethers.Contract(
        dmapAddress,
        dmapArtifact.abi,
        provider
    );

    let walkResult
    try {
        walkResult = await lib.walk(dmapContract, dpath)
        meta.textContent = 'meta: ' + walkResult.meta;
        meta.style.display = 'contents'
        data.textContent = 'data: ' + walkResult.data;
        data.style.display = 'contents'
    }
    catch (error) {
        fail.textContent = error
        fail.style.display = 'contents'
        return
    }
    finally {
        wait.style.display = 'none'
    }

    try {
        const cidResult = lib.unpackCID(walkResult.meta, walkResult.data)
        ipfs.textContent = 'ipfs: ' + cidResult;
        ipfs.style.display = 'contents'
    }
    catch (error){}
});

pathInput.addEventListener("keyup", event => {
    if(event.key !== "Enter") return;
    getButton.click()
});

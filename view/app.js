'use strict'

const updater = document.querySelector('#update');

updater.addEventListener('click', async () =>  {
    const dmapAddress = '0x2ec54Aa454BbFE0FE93A6DD772cDE882851B40FD'
    const getSig = 'get(address,bytes32)'
    const sigHex = '0x' + strToHex(getSig)
    const sigHash = await window.ethereum.request({ method: 'web3_sha3', params: [sigHex] });
    const selector = sigHash.slice(0, 10)

    const zoneAddress = document.getElementById("zoneAddress").value;
    const zoneBytes = '00'.repeat(12) + zoneAddress.slice(2)
    const name = document.getElementById("name").value;
    const nameBytes = strToHex(name) + '00'.repeat(32-name.length)

    const getTx = { to: dmapAddress, data: selector + zoneBytes + nameBytes}
    const getParams = [getTx, 'latest']
    const getRes = await window.ethereum.request({ method: 'eth_call', params: getParams });
    document.getElementById("value").textContent = getRes;


    const slotAddress = document.getElementById("slotAddr").value;
    const slotNum = document.getElementById("slotNum").value;
    const slotParams = [slotAddress, slotNum, 'latest']
    const slotRes = await window.ethereum.request({ method: 'eth_getStorageAt', params: slotParams });
    document.getElementById("slotVal").textContent = slotRes;
});

const strToHex = str => {
    let codes =  str.split('').map(c => c.charCodeAt(0))
    return codes.map(c => c.toString(16)).join('')
}

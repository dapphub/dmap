const fs = require('fs')
const { getContractAddress } = require('@ethersproject/address')
const dpack = require('@etherpacks/dpack')

task('deploy-mock-dmap', async (args, hh)=> {
    const packdir = args.packdir ?? './pack/'

    const dmap_type = await hh.artifacts.readArtifact('Dmap')
    const dmap_deployer = await hh.ethers.getContractFactory('Dmap')

    const root_type = await hh.artifacts.readArtifact('DmapRootZone')
    const root_deployer = await hh.ethers.getContractFactory('DmapRootZone')

    const free_type = await hh.artifacts.readArtifact('FreeZone')
    const free_deployer = await hh.ethers.getContractFactory('FreeZone')

    const [ali] = await hh.ethers.getSigners()
    const tx_count = await ali.getTransactionCount()
    const root_address = getContractAddress({ from: ali.address, nonce: tx_count + 1 })
    const tx_dmap = await dmap_deployer.deploy(root_address)
    const tx_root = await root_deployer.deploy(tx_dmap.address)
    const tx_free = await free_deployer.deploy(tx_dmap.address)

    const pb = await dpack.builder(hh.network.name)
    await pb.packObject({
        objectname: 'dmap',
        typename: 'Dmap',
        address: tx_dmap.address,
        artifact: dmap_type
    }, alsoPackType=true)

    // save only dmap in the core pack
    const corepack = await pb.build()

    // put everything else in a 'full' pack
    await pb.packObject({
        objectname: 'rootzone',
        typename: 'DmapRootZone',
        address: tx_root.address,
        artifact: root_type
    }, alsoPackType=true)

    await pb.packObject({
        objectname: 'freezone',
        typename: 'FreeZone',
        address: tx_free.address,
        artifact: free_type
    }, alsoPackType=true)

    const fullpack = await pb.build()

    const show =(o)=> JSON.stringify(o, null, 2)

    fs.writeFileSync(packdir + `Dmap.json`, show(dmap_type))
    fs.writeFileSync(packdir + `DmapRootZone.json`, show(root_type))

    fs.writeFileSync(packdir + `dmap_core_${hh.network.name}.dpack.json`, show(corepack))
    fs.writeFileSync(packdir + `dmap_full_${hh.network.name}.dpack.json`, show(fullpack))

})

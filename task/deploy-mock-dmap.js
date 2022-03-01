const fs = require('fs')
const dpack = require('@etherpacks/dpack')

task('deploy-mock-dmap', async (args, hh)=> {
    const packdir = args.packdir ?? './pack/'

    const dmap_type = await hh.artifacts.readArtifact('Dmap')
    const dmap_deployer = await hh.ethers.getContractFactory('Dmap')

    const root_type = await hh.artifacts.readArtifact('DmapRootZone')
    const root_deployer = await hh.ethers.getContractFactory('DmapRootZone')

    // TODO precompute tx_root address
    const tx_dmap = await dmap_deployer.deploy('0x0000000000000000000000000000000000000000')
    const tx_root = await root_deployer.deploy(tx_dmap.address)

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


    const fullpack = await pb.build()

    const show =(o)=> JSON.stringify(o, null, 2)

    fs.writeFileSync(packdir + `Dmap.json`, show(dmap_type))
    fs.writeFileSync(packdir + `DmapRootZone.json`, show(root_type))

    fs.writeFileSync(packdir + `dmap_core_${hh.network.name}.dpack.json`, show(corepack))
    fs.writeFileSync(packdir + `dmap_full_${hh.network.name}.dpack.json`, show(fullpack))

})

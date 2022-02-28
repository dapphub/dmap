const fs = require('fs')
const dpack = require('@etherpacks/dpack')

task('deploy-mock-dmap', async (args, hh)=> {
    const linkdir = args.linkdir ?? './link/'
    const packdir = args.packdir ?? './pack/'

    const dmap_type = await hh.artifacts.readArtifact('Dmap')
    const dmap_deployer = await hh.ethers.getContractFactory('Dmap')

    const tx = await dmap_deployer.deploy('0x0000000000000000000000000000000000000000')

    const pb = await dpack.builder(hh.network.name)
    await pb.packObject({
        objectname: 'dmap',
        typename: 'Dmap',
        address: tx.address,
        artifact: dmap_type
    }, alsoPackType=true)
    const pack = await pb.build()

    const show =(o)=> JSON.stringify(o, null, 2)

    fs.writeFileSync(linkdir + `Dmap.json`, show(dmap_type))
    fs.writeFileSync(packdir + `dmap_${hh.network.name}.dpack.json`, show(pack))

})

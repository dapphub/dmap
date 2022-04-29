const fs = require('fs')
const { getContractAddress } = require('@ethersproject/address')
const dpack = require('@etherpacks/dpack')
const { b32, send, wait } = require("minihat");

task('dmap-mock-deploy', async (args, hh)=> {
    const packdir = args.packdir ?? './pack/'

    const dmap_type = await hh.artifacts.readArtifact('Dmap')
    const _dmap__type = await hh.artifacts.readArtifact('_dmap_')
    dmap_type.bytecode = _dmap__type.bytecode
    dmap_type.deployedBytecode = _dmap__type.deployedBytecode
    const dmap_deployer = await hh.ethers.getContractFactory('_dmap_')

    const root_type = await hh.artifacts.readArtifact('RootZone')
    const root_deployer = await hh.ethers.getContractFactory('RootZone')

    const free_type = await hh.artifacts.readArtifact('FreeZone')
    const free_deployer = await hh.ethers.getContractFactory('FreeZone')

    const [ali] = await hh.ethers.getSigners()
    const tx_count = await ali.getTransactionCount()
    const root_address = getContractAddress({ from: ali.address, nonce: tx_count + 1 })
    const tx_dmap = await dmap_deployer.deploy(root_address)
    await tx_dmap.deployed()
    const tx_root = await root_deployer.deploy(tx_dmap.address)
    const tx_free = await free_deployer.deploy(tx_dmap.address)
    await tx_root.deployed()
    await tx_free.deployed()

    const salt = b32('salt')
    const name = b32('free')
    const zone = tx_free.address
    const types = [ "bytes32", "bytes32", "address" ]
    const encoded = ethers.utils.defaultAbiCoder.encode(types, [ salt, name, zone ])
    const commitment = hh.ethers.utils.keccak256(encoded)
    await send(tx_root.ante, commitment, { value: ethers.utils.parseEther('0.001') })
    await wait(hh, 60 * 60 * 32)
    await send(tx_root.hark)
    await send(tx_root.etch, salt, name, zone)

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
        typename: 'RootZone',
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
    fs.writeFileSync(packdir + `RootZone.json`, show(root_type))
    fs.writeFileSync(packdir + `FreeZone.json`, show(free_type))

    fs.writeFileSync(packdir + `dmap_core_${hh.network.name}.dpack.json`, show(corepack))
    fs.writeFileSync(packdir + `dmap_full_${hh.network.name}.dpack.json`, show(fullpack))

})

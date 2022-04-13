const fs = require('fs')
const { getContractAddress } = require('@ethersproject/address')
const dpack = require('@etherpacks/dpack')
const { b32, send } = require("minihat");
const ethers = require('ethers')


const solc_output = require('../out/combined.json')
const Dmap_solc_output = solc_output.contracts["core/dmap.sol:Dmap"]
//const Dmap_i = new ethers.utils.Interface(Dmap_solc_output.abi)
const _dmap__solc_output = solc_output.contracts["core/dmap.sol:_dmap_"]
//const _dmap__i = new ethers.utils.Interface(_dmap__solc_output.abi)
const RootZone_solc_output = solc_output.contracts["core/root.sol:RootZone"]
const FreeZone_solc_output = solc_output.contracts["core/free.sol:FreeZone"]

const debug = require('debug')('dmap:deploy')

async function readArtifact(contractName) {
    debug("unimplemented: readArtifact")
    return undefined
}

async function getContractFactory(iface, name) {

}

async function deploy_mock_dmap(args, provider, signer) {
    const packdir = args.packdir ?? './pack/'

    const dmap_type = Dmap_solc_output
    const dmap_deployer = new ethers.ContractFactory(
        new ethers.utils.Interface(_dmap__solc_output.abi),
        _dmap__solc_output.bin,
        signer
    )

    const root_type = RootZone_solc_output
    const root_deployer = new ethers.ContractFactory(
        new ethers.utils.Interface(RootZone_solc_output.abi),
        RootZone_solc_output.bin,
        signer
    )

    const free_type = FreeZone_solc_output
    const free_deployer = new ethers.ContractFactory(
        new ethers.utils.Interface(FreeZone_solc_output.abi),
        FreeZone_solc_output.bin,
        signer
    )

    const tx_count = await provider.getTransactionCount(signer.address)
    const root_address = getContractAddress({ from: signer.address, nonce: tx_count + 1 })
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
    const commitment = ethers.utils.keccak256(encoded)
    await send(tx_root.hark, commitment, { value: ethers.utils.parseEther('1') })
    await send(tx_root.etch, salt, name, zone)

    const pb = await dpack.builder(args.name)
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

    fs.writeFileSync(packdir + `dmap_core_${args.name}.dpack.json`, show(corepack))
    fs.writeFileSync(packdir + `dmap_full_${args.name}.dpack.json`, show(fullpack))
}

module.exports = {deploy_mock_dmap}

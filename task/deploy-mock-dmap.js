const fs = require('fs')
const { getContractAddress } = require('@ethersproject/address')
const dpack = require('@etherpacks/dpack')
const { b32, send } = require('minihat');

const assert = require('assert')

const yul_output = require('../output_yul.json')
const _dmap__yul_output = yul_output.contracts["dmap.yul"]["_dmap_"]

const debug = require('debug')('dmap:deploy')

const {parseasm} = require('../parse-asm')

task('deploy-mock-dmap', async (args, hh) => {
    const [ali] = await hh.ethers.getSigners()
    const packdir = args.packdir ?? './pack/'

    // TODO there has to be a more beautiful way to do this...
    const _dmap__type = await hh.artifacts.readArtifact('_dmap_')
    const Dmap_type = await hh.artifacts.readArtifact('Dmap')
    const _dmap__type_names = _dmap__type.abi.map(o => o.name)
    Dmap_type.abi.forEach((x) => {
        if (!_dmap__type_names.includes(x.name))
            _dmap__type.abi = _dmap__type.abi.concat([x])
    })
    // TODO maybe dpack should work on solc output, not hh?
    //_dmap__type.bytecode = _dmap__yul_output.evm.bytecode.object
    //_dmap__type.deployedBytecode = _dmap__yul_output.evm.deployedBytecode.object
    console.log(_dmap__type.bytecode)
    console.log(_dmap__type.deployedBytecode)
    let [asm_bytecode, asm_deployedBytecode] = parseasm('./core/dmap.asm')
    _dmap__type.bytecode = asm_bytecode
    _dmap__type.deployedBytecode = asm_deployedBytecode
    const _dmap__deployer = await hh.ethers.getContractFactoryFromArtifact(_dmap__type, ali)

    const root_type = await hh.artifacts.readArtifact('RootZone')
    const root_deployer = await hh.ethers.getContractFactory('RootZone')

    const free_type = await hh.artifacts.readArtifact('FreeZone')
    const free_deployer = await hh.ethers.getContractFactory('FreeZone')

    const tx_count = await ali.getTransactionCount()
    const root_address = getContractAddress({ from: ali.address, nonce: tx_count + 1 })
    const tx_dmap = await _dmap__deployer.deploy(root_address)
    await tx_dmap.deployed()
    const tx_root = await root_deployer.deploy(tx_dmap.address)
    const tx_free = await free_deployer.deploy(tx_dmap.address)
    await tx_root.deployed()
    await tx_free.deployed()

    const salt = b32('salt')
    const name = b32('free')
    const zone = tx_free.address
    const types = [ "bytes32", "bytes32", "address" ]
    const encoded = hh.ethers.utils.defaultAbiCoder.encode(types, [ salt, name, zone ])
    const commitment = hh.ethers.utils.keccak256(encoded)
    await send(tx_root.hark, commitment, { value: hh.ethers.utils.parseEther('1') })
    await send(tx_root.etch, salt, name, zone)

    const pb = await dpack.builder(hh.network.name)
    await pb.packObject({
        objectname: 'dmap',
        typename: 'Dmap',
        address: tx_dmap.address,
        artifact: _dmap__type
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

    fs.writeFileSync(packdir + `Dmap.json`, show(_dmap__type))
    fs.writeFileSync(packdir + `RootZone.json`, show(root_type))
    fs.writeFileSync(packdir + `FreeZone.json`, show(free_type))

    fs.writeFileSync(packdir + `dmap_core_${hh.network.name}.dpack.json`, show(corepack))
    fs.writeFileSync(packdir + `dmap_full_${hh.network.name}.dpack.json`, show(fullpack))
})
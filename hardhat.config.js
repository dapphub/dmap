require('@nomiclabs/hardhat-ethers')

require('./task/deploy-mock-dmap.js')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    paths: {
        sources: "sol"
    },
    solidity: {
        version: '0.8.13',
        settings: {
            optimizer: {
                enabled: true,
                runs: 20000
            }
        }
    }
};

require('@nomiclabs/hardhat-ethers')

require('./task/deploy-mock-dmap.js')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    paths: {
        sources: "sol"
    },
  solidity: "0.8.11"
};

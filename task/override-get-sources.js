const {glob} = require('hardhat/internal/util/glob')
const path = require('path')
const {
    TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS
} = require("hardhat/builtin-tasks/task-names");

subtask(
    TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
    async (_, { config }) => {
        const mainContracts = await glob(path.join(config.paths.root, "sol/**/*.sol"));
        const testContracts = await glob(path.join(config.paths.root, "test/**/*.sol"));
        return [...mainContracts, ...testContracts];
    }
);

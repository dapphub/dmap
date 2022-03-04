# dmap

- `dmap` is a key-value store
- It supports user-defined registries, but all values are stored in one contract
- + Traversal proofs do not need to spin up an EVM or execute arbitrary logic
- `dpath` is a path format with a concept of 'verify immutable'
- + example: `:stone:rock.backdoored.subreg`
- + `:stone:rock` will always resolve to the same value, but from there `.backdoored.subreg` could change
- Values have flags
- + dmap defines one core flag: `locked`
- + the `locked` flag lets you to verify that an entry is immutable without having to audit external logic
- + The 255 'user' flags are open to interpretation by other protocols
- + The 1st user flag is `dir`, used to define hierarchal resolution

If you are concerned about web3 decentralization, you should do the following right now:

- Sync an ETH light client to your actual physical computer.
- Spin up an ETH2 validator on a server that you physically control, if you can afford to. Pool on rocketpool if you can't.
- Store critical values for your dapp in dmap. Consider storing a [dpack](https://github.com/dapphub/dpack) CID.
- + A create-only registry at `:free:yourapp*` is a good stopgap solution.
- Write your own `dmap` client that talks directly to your ETH node.
- + Make sure your client verifies state trie proofs.
- Remove dependency on DNS for resolution and SSL for authentication
- + You need to verify merkle proofs for ETH values
- + You need to verify CIDs for IPFS values

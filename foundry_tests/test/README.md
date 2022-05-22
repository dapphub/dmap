## Fuzz Tests against deployed dmap object
The tests fork mainnet and run tests against the deployed dmap object.

To run them, go to the root of the repo and do:
```
forge install
```

Then do
```
forge test -f <YOUR RPC URL> test
```

optionally pass `-vvvv` to see fork and call details
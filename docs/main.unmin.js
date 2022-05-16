/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 971:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const kek = __webpack_require__(338)
const ebnf = __webpack_require__(425)

const pack = __webpack_require__(789)
const artifact = __webpack_require__(791)

const dmap_address = pack.objects.dmap.address

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

module.exports = lib = {}

lib.address = dmap_address
lib.artifact = artifact

lib.FLAG_LOCK = 1
lib.grammar = `
dpath ::= (step)* EOF
step  ::= (rune) (name)
name  ::= [a-z0-9]+
rune  ::= ":" | "."
`

lib.parser = new ebnf.Parser(ebnf.Grammars.W3C.getRules(lib.grammar))
lib.parse =s=> {
    const ast = lib.parser.getAST(s)
    return ast.children.map(step => {
        const rune = step.children[0]
        const name = step.children[1]
        return {
            locked: rune.text === ":",
            name:   name.text
        }
    })
}

lib.get = async (dmap, slot) => {
    const nextslot = hexZeroPad(
        hexlify(BigInt(slot) + BigInt(1)), 32
    )
    let meta, data
    await Promise.all(
        [
            dmap.provider.getStorageAt(dmap.address, slot),
            dmap.provider.getStorageAt(dmap.address, nextslot)
        ]
    ).then(res => [meta, data] = res)
    return [meta, data]
}

lib.getByZoneAndName = async (dmap, zone, name) => {
    const slot = keccak256(encodeZoneAndName(zone, name));
    return lib.get(dmap, slot)
}

lib.set = async (dmap, name, meta, data) => {
    const calldata = encodeFunctionCallBytes32Args("set(bytes32,bytes32,bytes32)", [name, meta, data])
    return dmap.signer.sendTransaction({to: dmap.address, data: calldata})
}

// const slotabi = ["function slot(bytes32 s) external view returns (bytes32)"]
// const slot_i = new ethers.utils.Interface(slotabi)
lib.slot = async (dmap, slot) => {
    const val = await dmap.provider.getStorageAt(dmap.address, slot)
    return val
}


lib.walk = async (dmap, path) => {
    if ( path.length > 0 && ![':', '.'].includes(path.charAt(0))) path = ':' + path
    let [meta, data] = await lib.get(dmap, '0x' + '00'.repeat(32))
    let ctx = {locked: path.charAt(0) === ':'}
    for (const step of lib.parse(path)) {
        zone = data.slice(0, 21 * 2)
        if (zone === '0x' + '00'.repeat(20)) {
            fail(`zero register`)
        }
        const fullname = '0x' + lib._strToHex(step.name) + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.getByZoneAndName(dmap, zone, fullname)
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((lib._hexToArrayBuffer(meta)[31] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
            ctx.locked = true
        }
        ctx.locked = step.locked
    }
    return {meta, data}
}

lib.walk2 = async (dmap, path) => {
    if ( path.length > 0 && ![':', '.'].includes(path.charAt(0))) path = ':' + path
    let [meta, data] = await lib.get(dmap, '0x' + '00'.repeat(32))
    let ctx = {locked: path.charAt(0) === ':'}
    const trace = [[meta,data]]
    for (const step of lib.parse(path)) {
        zone = data.slice(0, 21 * 2)
        if (zone === '0x' + '00'.repeat(20)) {
            fail(`zero register`)
        }
        const fullname = '0x' + lib._strToHex(step.name) + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.getByZoneAndName(dmap, zone, fullname)
        trace.push([meta,data])
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((lib._hexToArrayBuffer(meta)[31] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
            ctx.locked = true
        }
        ctx.locked = step.locked
    }
    return trace
}

lib._hexToArrayBuffer = hex => {
    const bytes = []
    for (let c = 2; c < hex.length; c += 2)
        bytes.push(parseInt(hex.slice(c, c + 2), 16))
    return new Uint8Array(bytes)
}

lib._strToHex = str => {
    let codes =  str.split('').map(c => c.charCodeAt(0))
    return codes.map(c => c.toString(16)).join('')
}

// GLOBAL TODO: !DMFXYZ! error and bounds checking for inputs
const HexCharacters = "0123456789abcdef";

function hexZeroPad(value, length) {
    if (typeof(value) !== "string") {
        value = hexlify(value);
    }

    if (value.length > 2 * length + 2) {
        throw "Value too big"
    }

    while (value.length < 2 * length + 2) {
        value = "0x0" + value.substring(2);
    }

    return value;
}

function hexlify(value) {

    if (typeof(value) === "number") {
        let hex = "";
        while (value) {
            hex = HexCharacters[value & 0xf] + hex;
            value = Math.floor(value / 16); // can bitshift instead
        }

        if (hex.length) {
            if (hex.length % 2) {
                hex = "0" + hex;
            }
            return "0x" + hex;
        }

        return "0x00";
    }

    if (typeof(value) === "bigint") {
        value = value.toString(16);
        if (value.length % 2) {
            return ("0x0" + value);
        }
        return "0x" + value;
    }

    if (typeof(value) === 'string') {
        return lib._strToHex(value);
    }
}

// Assumes value is a hex encoded string for now, or already a byte array
function keccak256(value) {

    if (typeof(value) == "string") {
        return "0x" + kek.keccak256(new Uint8Array(_toBytes(value)));
    }
    // add back in prefix and return as unsigned 1byte int array
    return "0x" + kek.keccak256(value);
}

function encodeZoneAndName(zone, name) {
    // zone should be an address, start by zero-padding 12 bytes
    let params = '0x' + '00'.repeat(12);
    if (zone.length == 0) {
        params = params + '00'.repeat(20);
    } else {
        params = params + zone.slice(2); // assume has leading 0x, prob shouldn't do this
    }
    if (name.length == 0 || name == null) {
        params = params + '00'.repeat(32);
    } else if (typeof(name) == 'object') {
        params = params + name.toString('hex');
    } else {
        // if already a hex string, just drop the 0x
        params = params + name.slice(2);
    }
    return params;
}

function encodeFunctionCallBytes32Args(signature, args) {
    // calculate function selector as first 4 bytes of hashed signature
    // keccak256 returns a string, so we take the first 10 characters
    let data = keccak256(signature).slice(0, 10)
    for (arg of args) {
        typeof arg == 'object' ? data += arg.toString('hex') : data += arg.slice(2)
    }
    return data;

}

function _toBytes(value) {
    if (typeof(value) == 'string') {
        return lib._hexToArrayBuffer(value)
    }
    return value
}


/***/ }),

/***/ 220:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { CID } = __webpack_require__(598)
const { sha256 } = __webpack_require__ (865)

const dmap = __webpack_require__(971)

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

const gateways = ['https://ipfs.fleek.co/ipfs/',
                  'https://gateway.pinata.cloud/ipfs/',
                  'https://cloudflare-ipfs.com/ipfs/',
                  'https://storry.tv/ipfs/',
                  'https://ipfs.io/ipfs/',
                  'https://hub.textile.io/ipfs/']
const infuraURL = 'https://mainnet.infura.io/v3/c0a739d64257448f855847c6e3d173e1'
const prefLenIndex = 30

module.exports = utils = {}

utils.prepareCID = (cidStr, lock) => {
    const cid = CID.parse(cidStr)
    need(cid.multihash.size <= 32, `Hash exceeds 256 bits`)
    const prefixLen = cid.byteLength - cid.multihash.size
    const meta = new Uint8Array(32).fill(0)
    const data = new Uint8Array(32).fill(0)

    data.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
    meta.set(cid.bytes.slice(0, prefixLen))
    if (lock) meta[31] |= dmap.FLAG_LOCK
    meta[prefLenIndex] = prefixLen
    return [meta, data]
}

utils.unpackCID = (metaStr, dataStr) => {
    const meta = dmap._hexToArrayBuffer(metaStr)
    const data = dmap._hexToArrayBuffer(dataStr)
    const prefixLen = meta[prefLenIndex]
    const specs = CID.inspectBytes(meta.slice(0, prefixLen))
    const hashLen = specs.digestSize
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(meta.slice(0, prefixLen), 0)
    cidBytes.set(data.slice(32 - hashLen), prefixLen)
    const cid = CID.decode(cidBytes)
    return cid.toString()
}

utils.readCID = async (contract, path) => {
    const packed = await dmap.walk(contract, path)
    return utils.unpackCID(packed.meta, packed.data)
}

const resolveCID = async (cid, targetDigest, nodeAddress) => {
    const verify = async bytes => {
        const hash = await sha256.digest(bytes)
        const resultDigest = JSON.stringify(hash.digest)
        return targetDigest === resultDigest
    }

    const url = nodeAddress + '/api/v0/cat?arg=' + cid
    const response = await fetch(url, { method: 'POST' })
    const catResponse = response.body.getReader();

    // initially handle only single chunk verification and sha256
    try {
        const chunk = await catResponse.read()
        if(await verify(chunk.value)) {
            return chunk.value
        }
    } catch(e) {}

    for (const gateway of gateways) {
        const url = gateway + cid
        try {
            const response = await fetch(url);
            const reader = response.body.getReader();
            let readRes = await reader.read();
            if (await verify(readRes.value)) {
                return readRes.value
            }
        } catch (e) {}
    }
    throw 'unable to resolve cid'
}

const makeRPC = async (url, method, params) => {
    let result = null
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 0
            }),
        });
        ({result} = await response.json())
    }
    catch (err) {}
    return result
}

const RPCGetStorage = async (url, address, slot) => {
    const block = await makeRPC(url, "eth_blockNumber", [])
    return await makeRPC(url, "eth_getStorageAt", [address, slot, block])
}

const windowGetStorage = async (address, slot) => {
    const block  = await window.ethereum.request({ method: 'eth_blockNumber',  params: [] });
    return await window.ethereum.request({ method: 'eth_getStorageAt', params: [address, slot, block] });
}

const getFacade = async (customURL) => {
    let storageFunction = null, description = ''

    if (await makeRPC(customURL, "eth_chainId", []) == '0x1') {
        storageFunction = RPCGetStorage.bind(null, customURL)
        description = 'custom node'
    } else if (typeof window.ethereum !== 'undefined' &&
               await window.ethereum.request({ method: 'eth_chainId',  params: [] }) == '0x1') {
        storageFunction = windowGetStorage
        description = 'window.ethereum'
    } else if (await makeRPC(infuraURL, "eth_chainId", []) == '0x1') {
        storageFunction = RPCGetStorage.bind(null, infuraURL)
        description = 'infura'
    } else {
        throw 'no ethereum connection'
    }

    return [{ provider: { getStorageAt:storageFunction },
              address: dmap.address
            }, description]
}

window.onload = async() => {
    const $ = document.querySelector.bind(document);
    const line =s=> { $('#result').textContent += s + '\n' }

    $('#btnGet').addEventListener('click', async () =>  {
        let dpath = $('#dpath').value;
        if (dpath.length && dpath[0] != ':') {
            dpath = ':' + dpath
        }
        const [dmapFacade, description] = await getFacade($('#ethNode').value)

        line('')
        line(`WALK  ${dpath} (using ${description} for eth connection)`)
        line('')

        let walkResult
        try {
            walkResult = await dmap.walk2(dmapFacade, dpath)
            for (const step of walkResult) {
                line(`step`)
                line(`  meta: ${step[0]}`)
                line(`  data: ${step[1]}`)
            }
        }
        catch (error) {
            line('')
            line(`FAIL: ${error}`)
            return
        }
        line('')
        const last = walkResult.pop()
        console.log(last)
        walkResult = { meta: last[0], data: last[1] }

        try {
            // display ipfs content from a CID if we can, otherwise display as text
            const cid = utils.unpackCID(walkResult.meta, walkResult.data)
            line(`ipfs: ${cid}`)
            const targetDigest = JSON.stringify(CID.parse(cid).multihash.digest)
            const resolved = await resolveCID(cid, targetDigest, $('#ipfsNode').value)
            let utf8decoder = new TextDecoder()
            line(utf8decoder.decode(resolved))
        }
        catch(e){
            let utf8decoder = new TextDecoder()
            const bytes = dmap._hexToArrayBuffer(walkResult.data)
            for (var i = 0; i < bytes.length; i++) {
                if (bytes[bytes.length -1 - i] !== 0) {
                    break
                }
            }
            line(`text: ${utf8decoder.decode(bytes.slice(0, -i))}`)
        }
    });

    $('#dpath').addEventListener("keyup", event => {
        if(event.key !== "Enter") return;
        $('#btnGet').click()
    });
}


/***/ }),

/***/ 789:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"format":"dpack-1","network":"ethereum","types":{"Dmap":{"typename":"Dmap","artifact":{"/":"bafkreifpsbpx33jchsau6z63zvik3fnpxhaxgyzbtco6tpyq34wp2raggy"}}},"objects":{"dmap":{"objectname":"dmap","typename":"Dmap","address":"0x90949c9937A11BA943C7A72C3FA073a37E3FdD96","artifact":{"/":"bafkreifpsbpx33jchsau6z63zvik3fnpxhaxgyzbtco6tpyq34wp2raggy"}}}}');

/***/ }),

/***/ 791:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"_format":"hh-sol-artifact-1","contractName":"Dmap","sourceName":"core/dmap.sol","abi":[{"inputs":[],"name":"LOCKED","type":"error"},{"anonymous":true,"inputs":[{"indexed":true,"internalType":"address","name":"zone","type":"address"},{"indexed":true,"internalType":"bytes32","name":"name","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"meta","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"data","type":"bytes32"}],"name":"Set","type":"event"},{"inputs":[{"internalType":"bytes32","name":"slot","type":"bytes32"}],"name":"get","outputs":[{"internalType":"bytes32","name":"meta","type":"bytes32"},{"internalType":"bytes32","name":"data","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"bytes32","name":"meta","type":"bytes32"},{"internalType":"bytes32","name":"data","type":"bytes32"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"}],"bytecode":"0x608060405234801561001057600080fd5b5060405161012e38038061012e83398101604081905261002f91610041565b60016000558060601b60015550610071565b60006020828403121561005357600080fd5b81516001600160a01b038116811461006a57600080fd5b9392505050565b60af8061007f6000396000f3fe608060405236602403602257600435546000526004356001015460205260406000f35b6004356024356044353360005282602052604060002081838533600080a481600182015580546001163660641817605857828155005b505050503660640360745763a1422f6960e01b60005260046000fd5b600080fdfea2646970667358221220475e238f09c07b2df011287cd0b887d9e0864657776ab6a3484c43f79237fefa64736f6c634300080d0033","deployedBytecode":"0x608060405236602403602257600435546000526004356001015460205260406000f35b6004356024356044353360005282602052604060002081838533600080a481600182015580546001163660641817605857828155005b505050503660640360745763a1422f6960e01b60005260046000fd5b600080fdfea2646970667358221220475e238f09c07b2df011287cd0b887d9e0864657776ab6a3484c43f79237fefa64736f6c634300080d0033","linkReferences":{},"deployedLinkReferences":{}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			179: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [697], () => (__webpack_require__(220)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
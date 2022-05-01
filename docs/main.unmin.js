/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2971:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var Buffer = __webpack_require__(816)["Buffer"];
const ebnf = __webpack_require__(1425)
const ethers = __webpack_require__(5341)
const multiformats = __webpack_require__(7534)

const pack = __webpack_require__(3789)
const artifact = __webpack_require__(6960)

const abi    = artifact.abi
const dmap_i = new ethers.utils.Interface(abi)
const dmap_address = pack.objects.dmap.address

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

const coder = ethers.utils.defaultAbiCoder
const keccak256 = ethers.utils.keccak256
const prefLenIndex = 2

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
    const nextslot = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(slot).add(1).toHexString(), 32
    )
    let meta, data
    await Promise.all(
        [
            dmap.provider.getStorageAt(dmap.address, slot),
            dmap.provider.getStorageAt(dmap.address, nextslot)
        ]
    ).then(res => [meta, data] = res)
    const resdata = dmap_i.encodeFunctionResult("get", [meta, data])
    const res = dmap_i.decodeFunctionResult("get", resdata)
    return res
}

lib.getByZoneAndName = async (dmap, zone, name) => {
    const slot = keccak256(coder.encode(["address", "bytes32"], [zone, name]))
    return lib.get(dmap, slot)
}

lib.set = async (dmap, name, meta, data) => {
    const calldata = dmap_i.encodeFunctionData("set", [name, meta, data])
    return dmap.signer.sendTransaction({to: dmap.address, data: calldata})
}

const slotabi = ["function slot(bytes32 s) external view returns (bytes32)"]
const slot_i = new ethers.utils.Interface(slotabi)
lib.slot = async (dmap, slot) => {
    const val = await dmap.provider.getStorageAt(dmap.address, slot)
    const resdata = slot_i.encodeFunctionResult("slot", [val])
    const res = slot_i.decodeFunctionResult("slot", resdata)
    return res[0]
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
        const fullname = '0x' + Buffer.from(step.name).toString('hex') + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.getByZoneAndName(dmap, zone, fullname)
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((Buffer.from(meta.slice(2), 'hex')[31] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
            ctx.locked = true
        }
        ctx.locked = step.locked
    }
    return {meta, data}
}

lib.prepareCID = (cidStr, lock) => {
    const cid = multiformats.CID.parse(cidStr)
    need(cid.multihash.size <= 32, `Hash exceeds 256 bits`)
    const prefixLen = cid.byteLength - cid.multihash.size
    const meta = new Uint8Array(32).fill(0)
    const data = new Uint8Array(32).fill(0)

    data.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
    meta.set(cid.bytes.slice(0, prefixLen), 32 - prefixLen)
    if (lock) meta[0] |= lib.FLAG_LOCK
    meta[prefLenIndex] = prefixLen
    return [meta, data]
}

lib.unpackCID = (metaStr, dataStr) => {
    const meta = Buffer.from(metaStr.slice(2), 'hex')
    const data = Buffer.from(dataStr.slice(2), 'hex')
    const prefixLen = meta[prefLenIndex]
    const specs = multiformats.CID.inspectBytes(meta.slice(-prefixLen))
    const hashLen = specs.digestSize
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(meta.slice(-prefixLen), 0)
    cidBytes.set(data.slice(32 - hashLen), prefixLen)
    const cid = multiformats.CID.decode(cidBytes)
    return cid.toString()
}

lib.readCID = async (dmap, path) => {
    const packed = await lib.walk(dmap, path)
    return lib.unpackCID(packed.meta, packed.data)
}


/***/ }),

/***/ 2220:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9450);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3726);
/* harmony import */ var multiformats_cid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3036);
/* harmony import */ var multiformats_hashes_sha2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2671);
/* provided dependency */ var Buffer = __webpack_require__(816)["Buffer"];



const dmap = __webpack_require__(2971)
const dmapAddress = dmap.address
const dmapArtifact = dmap.artifact
const IPFS = __webpack_require__(2708)

const gateways = ['https://ipfs.fleek.co/ipfs/',
                  'https://gateway.pinata.cloud/ipfs/',
                  'https://cloudflare-ipfs.com/ipfs/',
                  'https://storry.tv/ipfs/',
                  'https://ipfs.io/ipfs/',
                  'https://hub.textile.io/ipfs/']

const resolveCID = async (cid, targetDigest, nodeAddress) => {
    const verify = async bytes => {
        const hash = await multiformats_hashes_sha2__WEBPACK_IMPORTED_MODULE_1__.sha256.digest(bytes)
        const resultDigest = JSON.stringify(hash.digest)
        return targetDigest === resultDigest
    }
    const node = IPFS.create(nodeAddress)
    const catResponse = await node.cat(cid)
    // initially handle only single chunk verification and sha256
    try {
        const chunk = await catResponse.next()
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

window.onload = async() => {
    const $ = document.querySelector.bind(document);
    const line =s=> { $('#result').textContent += s + '\n' }

    $('#btnGet').addEventListener('click', async () =>  {
        const dpath = $('#dpath').value;
        line(`WALK ${dpath}`)
        const provider = new ethers__WEBPACK_IMPORTED_MODULE_2__/* .Web3Provider */ .Q(window.ethereum)
        const dmapContract = new ethers__WEBPACK_IMPORTED_MODULE_3__/* .Contract */ .CH(
            dmapAddress,
            dmapArtifact.abi,
            provider
        );

        let walkResult
        try {
            walkResult = await dmap.walk(dmapContract, dpath)
            line(`meta: ${walkResult.meta}`)
            line(`data: ${walkResult.data}`)
        }
        catch (error) {
            line(`FAIL: ${error}`)
            return
        }

        try {
            // display ipfs content from a CID if we can, otherwise display as text
            const cid = dmap.unpackCID(walkResult.meta, walkResult.data)
            line(`ipfs: ${cid}`)
            const targetDigest = JSON.stringify(multiformats_cid__WEBPACK_IMPORTED_MODULE_0__.CID.parse(cid).multihash.digest)
            const resolved = await resolveCID(cid, targetDigest, $('#localNode').value)
            let utf8decoder = new TextDecoder()
            line(utf8decoder.decode(resolved))
        }
        catch(e){
            let utf8decoder = new TextDecoder()
            const bytes = Buffer.from(walkResult.data.slice(2), 'hex')
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

/***/ 5545:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 7868:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 3034:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 6960:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"format":"dpack-1","network":"ethereum","types":{"Dmap":{"typename":"Dmap","artifact":{"/":"bafkreifpsbpx33jchsau6z63zvik3fnpxhaxgyzbtco6tpyq34wp2raggy"}}},"objects":{"dmap":{"objectname":"dmap","typename":"Dmap","address":"0x90949c9937A11BA943C7A72C3FA073a37E3FdD96","artifact":{"/":"bafkreifpsbpx33jchsau6z63zvik3fnpxhaxgyzbtco6tpyq34wp2raggy"}}}}');

/***/ }),

/***/ 3789:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"format":"dpack-1","network":"ethereum","types":{"Dmap":{"typename":"Dmap","artifact":{"/":"bafkreifpsbpx33jchsau6z63zvik3fnpxhaxgyzbtco6tpyq34wp2raggy"}}},"objects":{"dmap":{"objectname":"dmap","typename":"Dmap","address":"0x90949c9937A11BA943C7A72C3FA073a37E3FdD96","artifact":{"/":"bafkreifpsbpx33jchsau6z63zvik3fnpxhaxgyzbtco6tpyq34wp2raggy"}}}}');

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
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
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
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [697], () => (__webpack_require__(2220)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
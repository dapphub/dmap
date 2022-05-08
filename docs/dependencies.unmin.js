(self["webpackChunk"] = self["webpackChunk"] || []).push([[697],{

/***/ 7383:
/***/ ((module) => {

"use strict";

module.exports = asPromise;

/**
 * Callback as used by {@link util.asPromise}.
 * @typedef asPromiseCallback
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {...*} params Additional arguments
 * @returns {undefined}
 */

/**
 * Returns a promise from a node-style callback function.
 * @memberof util
 * @param {asPromiseCallback} fn Function to call
 * @param {*} ctx Function context
 * @param {...*} params Function arguments
 * @returns {Promise<*>} Promisified function
 */
function asPromise(fn, ctx/*, varargs */) {
    var params  = new Array(arguments.length - 1),
        offset  = 0,
        index   = 2,
        pending = true;
    while (index < arguments.length)
        params[offset++] = arguments[index++];
    return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err/*, varargs */) {
            if (pending) {
                pending = false;
                if (err)
                    reject(err);
                else {
                    var params = new Array(arguments.length - 1),
                        offset = 0;
                    while (offset < params.length)
                        params[offset++] = arguments[offset];
                    resolve.apply(null, params);
                }
            }
        };
        try {
            fn.apply(ctx || null, params);
        } catch (err) {
            if (pending) {
                pending = false;
                reject(err);
            }
        }
    });
}


/***/ }),

/***/ 3417:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * A minimal base64 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var base64 = exports;

/**
 * Calculates the byte length of a base64 encoded string.
 * @param {string} string Base64 encoded string
 * @returns {number} Byte length
 */
base64.length = function length(string) {
    var p = string.length;
    if (!p)
        return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
    return Math.ceil(string.length * 3) / 4 - n;
};

// Base64 encoding table
var b64 = new Array(64);

// Base64 decoding table
var s64 = new Array(123);

// 65..90, 97..122, 48..57, 43, 47
for (var i = 0; i < 64;)
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

/**
 * Encodes a buffer to a base64 encoded string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} Base64 encoded string
 */
base64.encode = function encode(buffer, start, end) {
    var parts = null,
        chunk = [];
    var i = 0, // output index
        j = 0, // goto index
        t;     // temporary
    while (start < end) {
        var b = buffer[start++];
        switch (j) {
            case 0:
                chunk[i++] = b64[b >> 2];
                t = (b & 3) << 4;
                j = 1;
                break;
            case 1:
                chunk[i++] = b64[t | b >> 4];
                t = (b & 15) << 2;
                j = 2;
                break;
            case 2:
                chunk[i++] = b64[t | b >> 6];
                chunk[i++] = b64[b & 63];
                j = 0;
                break;
        }
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (j) {
        chunk[i++] = b64[t];
        chunk[i++] = 61;
        if (j === 1)
            chunk[i++] = 61;
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

var invalidEncoding = "invalid encoding";

/**
 * Decodes a base64 encoded string to a buffer.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Number of bytes written
 * @throws {Error} If encoding is invalid
 */
base64.decode = function decode(string, buffer, offset) {
    var start = offset;
    var j = 0, // goto index
        t;     // temporary
    for (var i = 0; i < string.length;) {
        var c = string.charCodeAt(i++);
        if (c === 61 && j > 1)
            break;
        if ((c = s64[c]) === undefined)
            throw Error(invalidEncoding);
        switch (j) {
            case 0:
                t = c;
                j = 1;
                break;
            case 1:
                buffer[offset++] = t << 2 | (c & 48) >> 4;
                t = c;
                j = 2;
                break;
            case 2:
                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
                t = c;
                j = 3;
                break;
            case 3:
                buffer[offset++] = (t & 3) << 6 | c;
                j = 0;
                break;
        }
    }
    if (j === 1)
        throw Error(invalidEncoding);
    return offset - start;
};

/**
 * Tests if the specified string appears to be base64 encoded.
 * @param {string} string String to test
 * @returns {boolean} `true` if probably base64 encoded, otherwise false
 */
base64.test = function test(string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
};


/***/ }),

/***/ 7516:
/***/ ((module) => {

"use strict";

module.exports = EventEmitter;

/**
 * Constructs a new event emitter instance.
 * @classdesc A minimal event emitter.
 * @memberof util
 * @constructor
 */
function EventEmitter() {

    /**
     * Registered listeners.
     * @type {Object.<string,*>}
     * @private
     */
    this._listeners = {};
}

/**
 * Registers an event listener.
 * @param {string} evt Event name
 * @param {function} fn Listener
 * @param {*} [ctx] Listener context
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.on = function on(evt, fn, ctx) {
    (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn  : fn,
        ctx : ctx || this
    });
    return this;
};

/**
 * Removes an event listener or any matching listeners if arguments are omitted.
 * @param {string} [evt] Event name. Removes all listeners if omitted.
 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.off = function off(evt, fn) {
    if (evt === undefined)
        this._listeners = {};
    else {
        if (fn === undefined)
            this._listeners[evt] = [];
        else {
            var listeners = this._listeners[evt];
            for (var i = 0; i < listeners.length;)
                if (listeners[i].fn === fn)
                    listeners.splice(i, 1);
                else
                    ++i;
        }
    }
    return this;
};

/**
 * Emits an event by calling its listeners with the specified arguments.
 * @param {string} evt Event name
 * @param {...*} args Arguments
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.emit = function emit(evt) {
    var listeners = this._listeners[evt];
    if (listeners) {
        var args = [],
            i = 1;
        for (; i < arguments.length;)
            args.push(arguments[i++]);
        for (i = 0; i < listeners.length;)
            listeners[i].fn.apply(listeners[i++].ctx, args);
    }
    return this;
};


/***/ }),

/***/ 9787:
/***/ ((module) => {

"use strict";


module.exports = factory(factory);

/**
 * Reads / writes floats / doubles from / to buffers.
 * @name util.float
 * @namespace
 */

/**
 * Writes a 32 bit float to a buffer using little endian byte order.
 * @name util.float.writeFloatLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 32 bit float to a buffer using big endian byte order.
 * @name util.float.writeFloatBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 32 bit float from a buffer using little endian byte order.
 * @name util.float.readFloatLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 32 bit float from a buffer using big endian byte order.
 * @name util.float.readFloatBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Writes a 64 bit double to a buffer using little endian byte order.
 * @name util.float.writeDoubleLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 64 bit double to a buffer using big endian byte order.
 * @name util.float.writeDoubleBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 64 bit double from a buffer using little endian byte order.
 * @name util.float.readDoubleLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 64 bit double from a buffer using big endian byte order.
 * @name util.float.readDoubleBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

// Factory function for the purpose of node-based testing in modified global environments
function factory(exports) {

    // float: typed array
    if (typeof Float32Array !== "undefined") (function() {

        var f32 = new Float32Array([ -0 ]),
            f8b = new Uint8Array(f32.buffer),
            le  = f8b[3] === 128;

        function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
        }

        function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        /* istanbul ignore next */
        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

        function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
        }

        function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos    ];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
        }

        /* istanbul ignore next */
        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        /* istanbul ignore next */
        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

    // float: ieee754
    })(); else (function() {

        function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0)
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
            else if (isNaN(val))
                writeUint(2143289344, buf, pos);
            else if (val > 3.4028234663852886e+38) // +-Infinity
                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 1.1754943508222875e-38) // denormal
                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
            else {
                var exponent = Math.floor(Math.log(val) / Math.LN2),
                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
        }

        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

        function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos),
                sign = (uint >> 31) * 2 + 1,
                exponent = uint >>> 23 & 255,
                mantissa = uint & 8388607;
            return exponent === 255
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 1.401298464324817e-45 * mantissa
                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }

        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

    })();

    // double: typed array
    if (typeof Float64Array !== "undefined") (function() {

        var f64 = new Float64Array([-0]),
            f8b = new Uint8Array(f64.buffer),
            le  = f8b[7] === 128;

        function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
        }

        function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        /* istanbul ignore next */
        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

        function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
        }

        function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos    ];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
        }

        /* istanbul ignore next */
        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        /* istanbul ignore next */
        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

    // double: ieee754
    })(); else (function() {

        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0) {
                writeUint(0, buf, pos + off0);
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
            } else if (isNaN(val)) {
                writeUint(0, buf, pos + off0);
                writeUint(2146959360, buf, pos + off1);
            } else if (val > 1.7976931348623157e+308) { // +-Infinity
                writeUint(0, buf, pos + off0);
                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
                var mantissa;
                if (val < 2.2250738585072014e-308) { // denormal
                    mantissa = val / 5e-324;
                    writeUint(mantissa >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
                } else {
                    var exponent = Math.floor(Math.log(val) / Math.LN2);
                    if (exponent === 1024)
                        exponent = 1023;
                    mantissa = val * Math.pow(2, -exponent);
                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
                }
            }
        }

        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0),
                hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1,
                exponent = hi >>> 20 & 2047,
                mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 5e-324 * mantissa
                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }

        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

    })();

    return exports;
}

// uint helpers

function writeUintLE(val, buf, pos) {
    buf[pos    ] =  val        & 255;
    buf[pos + 1] =  val >>> 8  & 255;
    buf[pos + 2] =  val >>> 16 & 255;
    buf[pos + 3] =  val >>> 24;
}

function writeUintBE(val, buf, pos) {
    buf[pos    ] =  val >>> 24;
    buf[pos + 1] =  val >>> 16 & 255;
    buf[pos + 2] =  val >>> 8  & 255;
    buf[pos + 3] =  val        & 255;
}

function readUintLE(buf, pos) {
    return (buf[pos    ]
          | buf[pos + 1] << 8
          | buf[pos + 2] << 16
          | buf[pos + 3] << 24) >>> 0;
}

function readUintBE(buf, pos) {
    return (buf[pos    ] << 24
          | buf[pos + 1] << 16
          | buf[pos + 2] << 8
          | buf[pos + 3]) >>> 0;
}


/***/ }),

/***/ 2795:
/***/ ((module) => {

"use strict";

module.exports = inquire;

/**
 * Requires a module only if available.
 * @memberof util
 * @param {string} moduleName Module to require
 * @returns {?Object} Required module if available and not empty, otherwise `null`
 */
function inquire(moduleName) {
    try {
        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
        if (mod && (mod.length || Object.keys(mod).length))
            return mod;
    } catch (e) {} // eslint-disable-line no-empty
    return null;
}


/***/ }),

/***/ 4476:
/***/ ((module) => {

"use strict";

module.exports = pool;

/**
 * An allocator as used by {@link util.pool}.
 * @typedef PoolAllocator
 * @type {function}
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */

/**
 * A slicer as used by {@link util.pool}.
 * @typedef PoolSlicer
 * @type {function}
 * @param {number} start Start offset
 * @param {number} end End offset
 * @returns {Uint8Array} Buffer slice
 * @this {Uint8Array}
 */

/**
 * A general purpose buffer pool.
 * @memberof util
 * @function
 * @param {PoolAllocator} alloc Allocator
 * @param {PoolSlicer} slice Slicer
 * @param {number} [size=8192] Slab size
 * @returns {PoolAllocator} Pooled allocator
 */
function pool(alloc, slice, size) {
    var SIZE   = size || 8192;
    var MAX    = SIZE >>> 1;
    var slab   = null;
    var offset = SIZE;
    return function pool_alloc(size) {
        if (size < 1 || size > MAX)
            return alloc(size);
        if (offset + size > SIZE) {
            slab = alloc(SIZE);
            offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size);
        if (offset & 7) // align to 32 bit
            offset = (offset | 7) + 1;
        return buf;
    };
}


/***/ }),

/***/ 1893:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var utf8 = exports;

/**
 * Calculates the UTF8 byte length of a string.
 * @param {string} string String
 * @returns {number} Byte length
 */
utf8.length = function utf8_length(string) {
    var len = 0,
        c = 0;
    for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
            len += 1;
        else if (c < 2048)
            len += 2;
        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            ++i;
            len += 4;
        } else
            len += 3;
    }
    return len;
};

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
utf8.read = function utf8_read(buffer, start, end) {
    var len = end - start;
    if (len < 1)
        return "";
    var parts = null,
        chunk = [],
        i = 0, // char offset
        t;     // temporary
    while (start < end) {
        t = buffer[start++];
        if (t < 128)
            chunk[i++] = t;
        else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
            chunk[i++] = 0xD800 + (t >> 10);
            chunk[i++] = 0xDC00 + (t & 1023);
        } else
            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

/**
 * Writes a string as UTF8 bytes.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Bytes written
 */
utf8.write = function utf8_write(string, buffer, offset) {
    var start = offset,
        c1, // character 1
        c2; // character 2
    for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6       | 192;
            buffer[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buffer[offset++] = c1 >> 18      | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12      | 224;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        }
    }
    return offset - start;
};


/***/ }),

/***/ 1659:
/***/ ((module) => {

/**
 * Takes an array of AbortSignals and returns a single signal.
 * If any signals are aborted, the returned signal will be aborted.
 * @param {Array<AbortSignal>} signals
 * @returns {AbortSignal}
 */
function anySignal (signals) {
  const controller = new globalThis.AbortController()

  function onAbort () {
    controller.abort()

    for (const signal of signals) {
      if (!signal || !signal.removeEventListener) continue
      signal.removeEventListener('abort', onAbort)
    }
  }

  for (const signal of signals) {
    if (!signal || !signal.addEventListener) continue
    if (signal.aborted) {
      onAbort()
      break
    }
    signal.addEventListener('abort', onAbort)
  }

  return controller.signal
}

module.exports = anySignal
module.exports.anySignal = anySignal


/***/ }),

/***/ 4782:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ 3133:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint-env browser */



const browserReadableStreamToIt = __webpack_require__(2630)

/**
 * @param {Blob} blob
 * @returns {AsyncIterable<Uint8Array>}
 */
function blobToIt (blob) {
  if (typeof blob.stream === 'function') {
    // @ts-ignore missing some properties
    return browserReadableStreamToIt(blob.stream())
  }

  // firefox < 69 does not support blob.stream()
  // @ts-ignore - response.body is optional, but in practice it's a stream.
  return browserReadableStreamToIt(new Response(blob).body)
}

module.exports = blobToIt


/***/ }),

/***/ 2630:
/***/ ((module) => {

"use strict";


/**
 * Turns a browser readable stream into an async iterable. Async iteration over
 * returned iterable will lock give stream, preventing any other consumer from
 * acquiring a reader. The lock will be released if iteration loop is broken. To
 * prevent stream cancelling optional `{ preventCancel: true }` could be passed
 * as a second argument.
 * @template T
 * @param {ReadableStream<T>} stream
 * @param {Object} [options]
 * @param {boolean} [options.preventCancel=boolean]
 * @returns {AsyncIterable<T>}
 */
async function * browserReadableStreamToIt (stream, options = {}) {
  const reader = stream.getReader()

  try {
    while (true) {
      const result = await reader.read()

      if (result.done) {
        return
      }

      yield result.value
    }
  } finally {
    if (options.preventCancel !== true) {
      reader.cancel()
    }

    reader.releaseLock()
  }
}

module.exports = browserReadableStreamToIt


/***/ }),

/***/ 816:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(4782)
var ieee754 = __webpack_require__(8898)
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayView (arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    var copy = new Uint8Array(arrayView)
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
  }
  return fromArrayLike(arrayView)
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        Buffer.from(buf).copy(buffer, pos)
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        )
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    } else {
      buf.copy(buffer, pos)
    }
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF)
      ? 4
      : (firstByte > 0xDF)
          ? 3
          : (firstByte > 0xBF)
              ? 2
              : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (var i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUintLE =
Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUintBE =
Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUint8 =
Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUint16LE =
Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUint16BE =
Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUint32LE =
Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUint32BE =
Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUintLE =
Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUintBE =
Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUint8 =
Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUint16LE =
Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUint16BE =
Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUint32LE =
Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUint32BE =
Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()


/***/ }),

/***/ 1766:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const utils_1 = __webpack_require__(8582);
function fromSplit(split) {
    const [protectedHeader, encrypted_key, iv, ciphertext, tag] = split;
    const jwe = {
        ciphertext,
        iv,
        protected: protectedHeader,
        tag,
    };
    if (encrypted_key)
        jwe.recipients = [{ encrypted_key }];
    return jwe;
}
function encodeRecipient(recipient) {
    const encRec = {};
    if (recipient.encrypted_key)
        encRec.encrypted_key = utils_1.fromBase64url(recipient.encrypted_key);
    if (recipient.header)
        encRec.header = recipient.header;
    return encRec;
}
function encode(jwe) {
    const encJwe = {
        ciphertext: utils_1.fromBase64url(jwe.ciphertext),
        protected: utils_1.fromBase64url(jwe.protected),
        iv: utils_1.fromBase64url(jwe.iv),
        tag: utils_1.fromBase64url(jwe.tag),
    };
    if (jwe.aad)
        encJwe.aad = utils_1.fromBase64url(jwe.aad);
    if (jwe.recipients)
        encJwe.recipients = jwe.recipients.map(encodeRecipient);
    if (jwe.unprotected)
        encJwe.unprotected = jwe.unprotected;
    return encJwe;
}
function decodeRecipient(encoded) {
    const recipient = {};
    if (encoded.encrypted_key)
        recipient.encrypted_key = utils_1.toBase64url(encoded.encrypted_key);
    if (encoded.header)
        recipient.header = encoded.header;
    return recipient;
}
function decode(encoded) {
    const jwe = {
        ciphertext: utils_1.toBase64url(encoded.ciphertext),
        protected: utils_1.toBase64url(encoded.protected),
        iv: utils_1.toBase64url(encoded.iv),
        tag: utils_1.toBase64url(encoded.tag),
    };
    if (encoded.aad)
        jwe.aad = utils_1.toBase64url(encoded.aad);
    if (encoded.recipients)
        jwe.recipients = encoded.recipients.map(decodeRecipient);
    if (encoded.unprotected)
        jwe.unprotected = encoded.unprotected;
    return jwe;
}
exports["default"] = {
    fromSplit,
    decode,
    encode,
};
//# sourceMappingURL=encryption.js.map

/***/ }),

/***/ 3614:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decode = exports.encode = exports.toGeneral = exports.code = exports.name = void 0;
const signing_1 = __importDefault(__webpack_require__(5935));
const encryption_1 = __importDefault(__webpack_require__(1766));
const cbor = __importStar(__webpack_require__(7262));
exports.name = 'dag-jose';
exports.code = 133;
function isDagJWS(jose) {
    return ('payload' in jose &&
        typeof jose.payload === 'string' &&
        'signatures' in jose &&
        Array.isArray(jose.signatures));
}
function isEncodedJWS(jose) {
    return ('payload' in jose &&
        jose.payload instanceof Uint8Array &&
        'signatures' in jose &&
        Array.isArray(jose.signatures));
}
function isEncodedJWE(jose) {
    return ('ciphertext' in jose &&
        jose.ciphertext instanceof Uint8Array &&
        'iv' in jose &&
        jose.iv instanceof Uint8Array &&
        'protected' in jose &&
        jose.protected instanceof Uint8Array &&
        'tag' in jose &&
        jose.tag instanceof Uint8Array);
}
function isDagJWE(jose) {
    return ('ciphertext' in jose &&
        typeof jose.ciphertext === 'string' &&
        'iv' in jose &&
        typeof jose.iv === 'string' &&
        'protected' in jose &&
        typeof jose.protected === 'string' &&
        'tag' in jose &&
        typeof jose.tag === 'string');
}
function toGeneral(jose) {
    if (typeof jose === 'string') {
        const split = jose.split('.');
        if (split.length === 3) {
            return signing_1.default.fromSplit(split);
        }
        else if (split.length === 5) {
            return encryption_1.default.fromSplit(split);
        }
        throw new Error('Not a valid JOSE string');
    }
    if (isDagJWS(jose) || isDagJWE(jose)) {
        return jose;
    }
    throw new Error('Not a valid unencoded JOSE object');
}
exports.toGeneral = toGeneral;
function encode(obj) {
    if (typeof obj === 'string') {
        obj = toGeneral(obj);
    }
    let encodedJose;
    if (isDagJWS(obj)) {
        encodedJose = signing_1.default.encode(obj);
    }
    else if (isDagJWE(obj)) {
        encodedJose = encryption_1.default.encode(obj);
    }
    else {
        throw new Error('Not a valid JOSE object');
    }
    return new Uint8Array(cbor.encode(encodedJose));
}
exports.encode = encode;
function decode(data) {
    let encoded;
    try {
        encoded = cbor.decode(data);
    }
    catch (e) {
        throw new Error('Not a valid DAG-JOSE object');
    }
    if (isEncodedJWS(encoded)) {
        return signing_1.default.decode(encoded);
    }
    else if (isEncodedJWE(encoded)) {
        return encryption_1.default.decode(encoded);
    }
    else {
        throw new Error('Not a valid DAG-JOSE object');
    }
}
exports.decode = decode;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 5935:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const utils_1 = __webpack_require__(8582);
const cid_1 = __webpack_require__(3036);
function fromSplit(split) {
    const [protectedHeader, payload, signature] = split;
    return {
        payload,
        signatures: [{ protected: protectedHeader, signature }],
        link: cid_1.CID.decode(utils_1.fromBase64url(payload)),
    };
}
function encodeSignature(signature) {
    const encoded = {
        signature: utils_1.fromBase64url(signature.signature),
    };
    if (signature.header)
        encoded.header = signature.header;
    if (signature.protected)
        encoded.protected = utils_1.fromBase64url(signature.protected);
    return encoded;
}
function encode(jws) {
    const payload = utils_1.fromBase64url(jws.payload);
    try {
        cid_1.CID.decode(payload);
    }
    catch (e) {
        throw new Error('Not a valid DagJWS');
    }
    const encodedJws = {
        payload,
        signatures: jws.signatures.map(encodeSignature),
    };
    return encodedJws;
}
function decodeSignature(encoded) {
    const sign = {
        signature: utils_1.toBase64url(encoded.signature),
    };
    if (encoded.header)
        sign.header = encoded.header;
    if (encoded.protected)
        sign.protected = utils_1.toBase64url(encoded.protected);
    return sign;
}
function decode(encoded) {
    const decoded = {
        payload: utils_1.toBase64url(encoded.payload),
        signatures: encoded.signatures.map(decodeSignature),
    };
    decoded.link = cid_1.CID.decode(new Uint8Array(encoded.payload));
    return decoded;
}
exports["default"] = {
    fromSplit,
    encode,
    decode,
};
//# sourceMappingURL=signing.js.map

/***/ }),

/***/ 8582:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromBase64url = exports.toBase64url = void 0;
const base64_1 = __webpack_require__(1453);
function toBase64url(b) {
    return base64_1.base64url.encode(b).slice(1);
}
exports.toBase64url = toBase64url;
function fromBase64url(s) {
    return base64_1.base64url.decode(`u${s}`);
}
exports.fromBase64url = fromBase64url;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 6292:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(9374)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 9374:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(8628);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 8173:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form
Object.defineProperty(exports, "__esModule", ({ value: true }));
/*
syntax ::= RULE_EOL* rule+
rule ::= " "* "<" rule-name ">" " "* "::=" firstExpression otherExpression* " "* RULE_EOL+ " "*
firstExpression ::= " "* list
otherExpression ::= " "* "|" " "* list
RULE_EOL ::= "\r" | "\n"
list ::= term " "* list | term
term ::= literal | "<" rule-name ">"
literal ::= '"' RULE_CHARACTER1* '"' | "'" RULE_CHARACTER2* "'"
RULE_CHARACTER ::= " " | RULE_LETTER | RULE_DIGIT | RULE_SYMBOL
RULE_LETTER ::= "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
RULE_DIGIT ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
RULE_SYMBOL ::= "-" | "_" | "!" | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | ":" | ";" | "<" | "=" | ">" | "?" | "@" | "[" | "\" | "]" | "^" | "_" | "`" | "{" | "|" | "}" | "~"
RULE_CHARACTER1 ::= RULE_CHARACTER | "'"
RULE_CHARACTER2 ::= RULE_CHARACTER | '"'
rule-name ::= RULE_LETTER RULE_CHAR*
RULE_CHAR ::= RULE_LETTER | RULE_DIGIT | "_" | "-"
*/
const SemanticHelpers_1 = __webpack_require__(7241);
const Parser_1 = __webpack_require__(489);
var BNF;
(function (BNF) {
    BNF.RULES = [
        {
            name: 'syntax',
            bnf: [['RULE_EOL*', 'rule+']]
        },
        {
            name: 'rule',
            bnf: [
                [
                    '" "*',
                    '"<"',
                    'rule-name',
                    '">"',
                    '" "*',
                    '"::="',
                    'firstExpression',
                    'otherExpression*',
                    '" "*',
                    'RULE_EOL+',
                    '" "*'
                ]
            ]
        },
        {
            name: 'firstExpression',
            bnf: [['" "*', 'list']]
        },
        {
            name: 'otherExpression',
            bnf: [['" "*', '"|"', '" "*', 'list']]
        },
        {
            name: 'RULE_EOL',
            bnf: [['"\\r"'], ['"\\n"']]
        },
        {
            name: 'list',
            bnf: [['term', '" "*', 'list'], ['term']]
        },
        {
            name: 'term',
            bnf: [['literal'], ['"<"', 'rule-name', '">"']]
        },
        {
            name: 'literal',
            bnf: [[`'"'`, 'RULE_CHARACTER1*', `'"'`], [`"'"`, 'RULE_CHARACTER2*', `"'"`]]
        },
        {
            name: 'RULE_CHARACTER',
            bnf: [['" "'], ['RULE_LETTER'], ['RULE_DIGIT'], ['RULE_SYMBOL']]
        },
        {
            name: 'RULE_LETTER',
            bnf: [
                ['"A"'],
                ['"B"'],
                ['"C"'],
                ['"D"'],
                ['"E"'],
                ['"F"'],
                ['"G"'],
                ['"H"'],
                ['"I"'],
                ['"J"'],
                ['"K"'],
                ['"L"'],
                ['"M"'],
                ['"N"'],
                ['"O"'],
                ['"P"'],
                ['"Q"'],
                ['"R"'],
                ['"S"'],
                ['"T"'],
                ['"U"'],
                ['"V"'],
                ['"W"'],
                ['"X"'],
                ['"Y"'],
                ['"Z"'],
                ['"a"'],
                ['"b"'],
                ['"c"'],
                ['"d"'],
                ['"e"'],
                ['"f"'],
                ['"g"'],
                ['"h"'],
                ['"i"'],
                ['"j"'],
                ['"k"'],
                ['"l"'],
                ['"m"'],
                ['"n"'],
                ['"o"'],
                ['"p"'],
                ['"q"'],
                ['"r"'],
                ['"s"'],
                ['"t"'],
                ['"u"'],
                ['"v"'],
                ['"w"'],
                ['"x"'],
                ['"y"'],
                ['"z"']
            ]
        },
        {
            name: 'RULE_DIGIT',
            bnf: [['"0"'], ['"1"'], ['"2"'], ['"3"'], ['"4"'], ['"5"'], ['"6"'], ['"7"'], ['"8"'], ['"9"']]
        },
        {
            name: 'RULE_SYMBOL',
            bnf: [
                ['"-"'],
                ['"_"'],
                ['"!"'],
                ['"#"'],
                ['"$"'],
                ['"%"'],
                ['"&"'],
                ['"("'],
                ['")"'],
                ['"*"'],
                ['"+"'],
                ['","'],
                ['"-"'],
                ['"."'],
                ['"/"'],
                ['":"'],
                ['";"'],
                ['"<"'],
                ['"="'],
                ['">"'],
                ['"?"'],
                ['"@"'],
                ['"["'],
                ['"\\"'],
                ['"]"'],
                ['"^"'],
                ['"_"'],
                ['"`"'],
                ['"{"'],
                ['"|"'],
                ['"}"'],
                ['"~"']
            ]
        },
        {
            name: 'RULE_CHARACTER1',
            bnf: [['RULE_CHARACTER'], [`"'"`]]
        },
        {
            name: 'RULE_CHARACTER2',
            bnf: [['RULE_CHARACTER'], [`'"'`]]
        },
        {
            name: 'rule-name',
            bnf: [['RULE_LETTER', 'RULE_CHAR*']]
        },
        {
            name: 'RULE_CHAR',
            bnf: [['RULE_LETTER'], ['RULE_DIGIT'], ['"_"'], ['"-"']]
        }
    ];
    BNF.defaultParser = new Parser_1.Parser(BNF.RULES, { debug: false });
    function getAllTerms(expr) {
        let terms = SemanticHelpers_1.findChildrenByType(expr, 'term').map(term => {
            return SemanticHelpers_1.findChildrenByType(term, 'literal').concat(SemanticHelpers_1.findChildrenByType(term, 'rule-name'))[0].text;
        });
        SemanticHelpers_1.findChildrenByType(expr, 'list').forEach(expr => {
            terms = terms.concat(getAllTerms(expr));
        });
        return terms;
    }
    function getRules(source, parser = BNF.defaultParser) {
        let ast = parser.getAST(source);
        if (!ast)
            throw new Error('Could not parse ' + source);
        if (ast.errors && ast.errors.length) {
            throw ast.errors[0];
        }
        let rules = SemanticHelpers_1.findChildrenByType(ast, 'rule');
        let ret = rules.map((rule) => {
            let name = SemanticHelpers_1.findChildrenByType(rule, 'rule-name')[0].text;
            let expressions = SemanticHelpers_1.findChildrenByType(rule, 'firstExpression').concat(SemanticHelpers_1.findChildrenByType(rule, 'otherExpression'));
            let bnf = [];
            expressions.forEach(expr => {
                bnf.push(getAllTerms(expr));
            });
            return {
                name: name,
                bnf
            };
        });
        if (!ret.some(x => x.name == 'EOL')) {
            ret.push({
                name: 'EOL',
                bnf: [['"\\r\\n"', '"\\r"', '"\\n"']]
            });
        }
        return ret;
    }
    BNF.getRules = getRules;
    function Transform(source, subParser = BNF.defaultParser) {
        return getRules(source.join(''), subParser);
    }
    BNF.Transform = Transform;
    class Parser extends Parser_1.Parser {
        constructor(source, options) {
            const subParser = options && options.debugRulesParser === true ? new Parser_1.Parser(BNF.RULES, { debug: true }) : BNF.defaultParser;
            super(getRules(source, subParser), options);
            this.source = source;
        }
        emitSource() {
            return this.source;
        }
    }
    BNF.Parser = Parser;
})(BNF || (BNF = {}));
exports["default"] = BNF;
//# sourceMappingURL=BNF.js.map

/***/ }),

/***/ 1657:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://www.w3.org/TR/REC-xml/#NT-Name
// http://www.bottlecaps.de/rr/ui
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Grammar	::=	Production*
// Production	::=	NCName '::=' Choice
// NCName	::=	[http://www.w3.org/TR/xml-names/#NT-NCName]
// Choice	::=	SequenceOrDifference ( '|' SequenceOrDifference )*
// SequenceOrDifference	::=	(Item ( '-' Item | Item* ))?
// Item	::=	Primary ( '?' | '*' | '+' )?
// Primary	::=	NCName | StringLiteral | CharCode | CharClass | '(' Choice ')'
// StringLiteral	::=	'"' [^"]* '"' | "'" [^']* "'"
// CharCode	::=	'#x' [0-9a-fA-F]+
// CharClass	::=	'[' '^'? ( RULE_Char | CharCode | CharRange | CharCodeRange )+ ']'
// RULE_Char	::=	[http://www.w3.org/TR/xml#NT-RULE_Char]
// CharRange	::=	RULE_Char '-' ( RULE_Char - ']' )
// CharCodeRange	::=	CharCode '-' CharCode
// RULE_WHITESPACE	::=	RULE_S | Comment
// RULE_S	::=	#x9 | #xA | #xD | #x20
// Comment	::=	'/*' ( [^*] | '*'+ [^*/] )* '*'* '*/'
const TokenError_1 = __webpack_require__(4217);
const Parser_1 = __webpack_require__(489);
var BNF;
(function (BNF) {
    BNF.RULES = [
        {
            name: 'Grammar',
            bnf: [['RULE_S*', 'Attributes?', 'RULE_S*', '%Atomic*', 'EOF']]
        },
        {
            name: '%Atomic',
            bnf: [['Production', 'RULE_S*']],
            fragment: true
        },
        {
            name: 'Production',
            bnf: [
                [
                    'NCName',
                    'RULE_S*',
                    '"::="',
                    'RULE_WHITESPACE*',
                    '%Choice',
                    'RULE_WHITESPACE*',
                    'Attributes?',
                    'RULE_EOL+',
                    'RULE_S*'
                ]
            ]
        },
        {
            name: 'NCName',
            bnf: [[/[a-zA-Z][a-zA-Z_0-9]*/]]
        },
        {
            name: 'Attributes',
            bnf: [['"{"', 'Attribute', '%Attributes*', 'RULE_S*', '"}"']]
        },
        {
            name: '%Attributes',
            bnf: [['RULE_S*', '","', 'Attribute']],
            fragment: true
        },
        {
            name: 'Attribute',
            bnf: [['RULE_S*', 'NCName', 'RULE_WHITESPACE*', '"="', 'RULE_WHITESPACE*', 'AttributeValue']]
        },
        {
            name: 'AttributeValue',
            bnf: [['NCName'], [/[1-9][0-9]*/]]
        },
        {
            name: '%Choice',
            bnf: [['SequenceOrDifference', '%_Choice_1*']],
            fragment: true
        },
        {
            name: '%_Choice_1',
            bnf: [['RULE_S*', '"|"', 'RULE_S*', 'SequenceOrDifference']],
            fragment: true
        },
        {
            name: 'SequenceOrDifference',
            bnf: [['%Item', 'RULE_WHITESPACE*', '%_Item_1?']]
        },
        {
            name: '%_Item_1',
            bnf: [['Minus', '%Item'], ['%Item*']],
            fragment: true
        },
        {
            name: 'Minus',
            bnf: [['"-"']]
        },
        {
            name: '%Item',
            bnf: [['RULE_WHITESPACE*', 'PrimaryPreDecoration?', '%Primary', 'PrimaryDecoration?']],
            fragment: true
        },
        {
            name: 'PrimaryDecoration',
            bnf: [['"?"'], ['"*"'], ['"+"']]
        },
        {
            name: 'PrimaryPreDecoration',
            bnf: [['"&"'], ['"!"'], ['"~"']]
        },
        {
            name: '%Primary',
            bnf: [['NCName'], ['StringLiteral'], ['CharCode'], ['CharClass'], ['SubItem']],
            fragment: true
        },
        {
            name: 'SubItem',
            bnf: [['"("', 'RULE_S*', '%Choice', 'RULE_S*', '")"']]
        },
        {
            name: 'StringLiteral',
            bnf: [[`'"'`, /[^"]*/, `'"'`], [`"'"`, /[^']*/, `"'"`]]
        },
        {
            name: 'CharCode',
            bnf: [['"#x"', /[0-9a-zA-Z]+/]]
        },
        {
            name: 'CharClass',
            bnf: [["'['", "'^'?", '%RULE_CharClass_1+', '"]"']]
        },
        {
            name: '%RULE_CharClass_1',
            bnf: [['CharCodeRange'], ['CharRange'], ['CharCode'], ['RULE_Char']],
            fragment: true
        },
        {
            name: 'RULE_Char',
            bnf: [[/\x09/], [/\x0A/], [/\x0D/], [/[\x20-\x5c]/], [/[\x5e-\uD7FF]/], [/[\uE000-\uFFFD]/]]
        },
        {
            name: 'CharRange',
            bnf: [['RULE_Char', '"-"', 'RULE_Char']]
        },
        {
            name: 'CharCodeRange',
            bnf: [['CharCode', '"-"', 'CharCode']]
        },
        {
            name: 'RULE_WHITESPACE',
            bnf: [['%RULE_WHITESPACE_CHAR*'], ['Comment', 'RULE_WHITESPACE*']]
        },
        {
            name: 'RULE_S',
            bnf: [['RULE_WHITESPACE', 'RULE_S*'], ['RULE_EOL', 'RULE_S*']]
        },
        {
            name: '%RULE_WHITESPACE_CHAR',
            bnf: [[/\x09/], [/\x20/]],
            fragment: true
        },
        {
            name: 'Comment',
            bnf: [['"/*"', '%RULE_Comment_Body*', '"*/"']]
        },
        {
            name: '%RULE_Comment_Body',
            bnf: [[/[^*]/], ['"*"+', /[^/]*/]],
            fragment: true
        },
        {
            name: 'RULE_EOL',
            bnf: [[/\x0D/, /\x0A/], [/\x0A/], [/\x0D/]]
        },
        {
            name: 'Link',
            bnf: [["'['", 'Url', "']'"]]
        },
        {
            name: 'Url',
            bnf: [[/[^\x5D:/?#]/, '"://"', /[^\x5D#]+/, '%Url1?']]
        },
        {
            name: '%Url1',
            bnf: [['"#"', 'NCName']],
            fragment: true
        }
    ];
    BNF.defaultParser = new Parser_1.Parser(BNF.RULES, { debug: false });
    const preDecorationRE = /^(!|&)/;
    const decorationRE = /(\?|\+|\*)$/;
    const subExpressionRE = /^%/;
    function getBNFRule(name, parser) {
        if (typeof name == 'string') {
            let decoration = decorationRE.exec(name);
            let preDecoration = preDecorationRE.exec(name);
            let preDecorationText = preDecoration ? preDecoration[0] : '';
            let decorationText = decoration ? decoration[0] + ' ' : '';
            let subexpression = subExpressionRE.test(name);
            if (subexpression) {
                let lonely = isLonelyRule(name, parser);
                if (lonely)
                    return preDecorationText + getBNFBody(name, parser) + decorationText;
                return preDecorationText + '(' + getBNFBody(name, parser) + ')' + decorationText;
            }
            return name.replace(preDecorationRE, preDecorationText);
        }
        else {
            return name.source
                .replace(/\\(?:x|u)([a-zA-Z0-9]+)/g, '#x$1')
                .replace(/\[\\(?:x|u)([a-zA-Z0-9]+)-\\(?:x|u)([a-zA-Z0-9]+)\]/g, '[#x$1-#x$2]');
        }
    }
    /// Returns true if the rule is a string literal or regular expression without a descendant tree
    function isLonelyRule(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        return (rule &&
            rule.bnf.length == 1 &&
            rule.bnf[0].length == 1 &&
            (rule.bnf[0][0] instanceof RegExp || rule.bnf[0][0][0] == '"' || rule.bnf[0][0][0] == "'"));
    }
    function getBNFChoice(rules, parser) {
        return rules.map(x => getBNFRule(x, parser)).join(' ');
    }
    function getBNFBody(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        if (rule)
            return rule.bnf.map(x => getBNFChoice(x, parser)).join(' | ');
        return 'RULE_NOT_FOUND {' + name + '}';
    }
    function emit(parser) {
        let acumulator = [];
        parser.grammarRules.forEach(l => {
            if (!/^%/.test(l.name)) {
                let recover = l.recover ? ' { recoverUntil=' + l.recover + ' }' : '';
                acumulator.push(l.name + ' ::= ' + getBNFBody(l.name, parser) + recover);
            }
        });
        return acumulator.join('\n');
    }
    BNF.emit = emit;
    let subitems = 0;
    function restar(total, resta) {
        console.log('reberia restar ' + resta + ' a ' + total);
        throw new Error('Difference not supported yet');
    }
    function convertRegex(txt) {
        return new RegExp(txt
            .replace(/#x([a-zA-Z0-9]{4})/g, '\\u$1')
            .replace(/#x([a-zA-Z0-9]{3})/g, '\\u0$1')
            .replace(/#x([a-zA-Z0-9]{2})/g, '\\x$1')
            .replace(/#x([a-zA-Z0-9]{1})/g, '\\x0$1'));
    }
    function getSubItems(tmpRules, seq, parentName, parentAttributes) {
        let anterior = null;
        let bnfSeq = [];
        seq.children.forEach((x, i) => {
            if (x.type == 'Minus') {
                restar(anterior, x);
            }
            else {
            }
            let decoration = seq.children[i + 1];
            decoration = (decoration && decoration.type == 'PrimaryDecoration' && decoration.text) || '';
            let preDecoration = '';
            if (anterior && anterior.type == 'PrimaryPreDecoration') {
                preDecoration = anterior.text;
            }
            let pinned = preDecoration == '~' ? 1 : undefined;
            if (pinned) {
                preDecoration = '';
            }
            switch (x.type) {
                case 'SubItem':
                    let name = '%' + (parentName + subitems++);
                    createRule(tmpRules, x, name, parentAttributes);
                    bnfSeq.push(preDecoration + name + decoration);
                    break;
                case 'NCName':
                    bnfSeq.push(preDecoration + x.text + decoration);
                    break;
                case 'StringLiteral':
                    if (decoration || preDecoration || !/^['"/()a-zA-Z0-9&_.:=,+*\-\^\\]+$/.test(x.text)) {
                        bnfSeq.push(preDecoration + x.text + decoration);
                    }
                    else {
                        for (const c of x.text.slice(1, -1)) {
                            if (parentAttributes && parentAttributes["ignoreCase"] == "true" && /[a-zA-Z]/.test(c)) {
                                bnfSeq.push(new RegExp("[" + c.toUpperCase() + c.toLowerCase() + "]"));
                            }
                            else {
                                bnfSeq.push(new RegExp(Parser_1.escapeRegExp(c)));
                            }
                        }
                    }
                    break;
                case 'CharCode':
                case 'CharClass':
                    if (decoration || preDecoration) {
                        let newRule = {
                            name: '%' + (parentName + subitems++),
                            bnf: [[convertRegex(x.text)]],
                            pinned
                        };
                        tmpRules.push(newRule);
                        bnfSeq.push(preDecoration + newRule.name + decoration);
                    }
                    else {
                        bnfSeq.push(convertRegex(x.text));
                    }
                    break;
                case 'PrimaryPreDecoration':
                case 'PrimaryDecoration':
                    break;
                default:
                    throw new Error(' HOW SHOULD I PARSE THIS? ' + x.type + ' -> ' + JSON.stringify(x.text));
            }
            anterior = x;
        });
        return bnfSeq;
    }
    function createRule(tmpRules, token, name, parentAttributes = undefined) {
        let attrNode = token.children.filter(x => x.type == 'Attributes')[0];
        let attributes = {};
        if (attrNode) {
            attrNode.children.forEach(x => {
                let name = x.children.filter(x => x.type == 'NCName')[0].text;
                if (name in attributes) {
                    throw new TokenError_1.TokenError('Duplicated attribute ' + name, x);
                }
                else {
                    attributes[name] = x.children.filter(x => x.type == 'AttributeValue')[0].text;
                }
            });
        }
        let bnf = token.children.filter(x => x.type == 'SequenceOrDifference').map(s => getSubItems(tmpRules, s, name, parentAttributes ? parentAttributes : attributes));
        let rule = {
            name,
            bnf
        };
        if (name.indexOf('%') == 0)
            rule.fragment = true;
        if (attributes['recoverUntil']) {
            rule.recover = attributes['recoverUntil'];
            if (rule.bnf.length > 1)
                throw new TokenError_1.TokenError('only one-option productions are suitable for error recovering', token);
        }
        if ('pin' in attributes) {
            let num = parseInt(attributes['pin']);
            if (!isNaN(num)) {
                rule.pinned = num;
            }
            if (rule.bnf.length > 1)
                throw new TokenError_1.TokenError('only one-option productions are suitable for pinning', token);
        }
        if ('ws' in attributes) {
            rule.implicitWs = attributes['ws'] != 'explicit';
        }
        else {
            rule.implicitWs = null;
        }
        rule.fragment = rule.fragment || attributes['fragment'] == 'true';
        rule.simplifyWhenOneChildren = attributes['simplifyWhenOneChildren'] == 'true';
        tmpRules.push(rule);
    }
    function getRules(source, parser = BNF.defaultParser) {
        let ast = parser.getAST(source);
        if (!ast)
            throw new Error('Could not parse ' + source);
        if (ast.errors && ast.errors.length) {
            throw ast.errors[0];
        }
        let implicitWs = null;
        let attrNode = ast.children.filter(x => x.type == 'Attributes')[0];
        let attributes = {};
        if (attrNode) {
            attrNode.children.forEach(x => {
                let name = x.children.filter(x => x.type == 'NCName')[0].text;
                if (name in attributes) {
                    throw new TokenError_1.TokenError('Duplicated attribute ' + name, x);
                }
                else {
                    attributes[name] = x.children.filter(x => x.type == 'AttributeValue')[0].text;
                }
            });
        }
        implicitWs = attributes['ws'] == 'implicit';
        let tmpRules = [];
        ast.children.filter(x => x.type == 'Production').map((x) => {
            let name = x.children.filter(x => x.type == 'NCName')[0].text;
            createRule(tmpRules, x, name);
        });
        tmpRules.forEach(rule => {
            if (rule.implicitWs === null)
                rule.implicitWs = implicitWs;
        });
        return tmpRules;
    }
    BNF.getRules = getRules;
    function Transform(source, subParser = BNF.defaultParser) {
        return getRules(source.join(''), subParser);
    }
    BNF.Transform = Transform;
    class Parser extends Parser_1.Parser {
        constructor(source, options) {
            const subParser = options && options.debugRulesParser === true ? new Parser_1.Parser(BNF.RULES, { debug: true }) : BNF.defaultParser;
            super(getRules(source, subParser), options);
        }
        emitSource() {
            return emit(this);
        }
    }
    BNF.Parser = Parser;
})(BNF || (BNF = {}));
exports["default"] = BNF;
//# sourceMappingURL=Custom.js.map

/***/ }),

/***/ 1575:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://www.w3.org/TR/REC-xml/#NT-Name
// http://www.bottlecaps.de/rr/ui
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Grammar	::=	Production*
// Production	::=	NCName '::=' Choice
// NCName	::=	[http://www.w3.org/TR/xml-names/#NT-NCName]
// Choice	::=	SequenceOrDifference ( '|' SequenceOrDifference )*
// SequenceOrDifference	::=	(Item ( '-' Item | Item* ))?
// Item	::=	Primary ( '?' | '*' | '+' )?
// Primary	::=	NCName | StringLiteral | CharCode | CharClass | '(' Choice ')'
// StringLiteral	::=	'"' [^"]* '"' | "'" [^']* "'"
// CharCode	::=	'#x' [0-9a-fA-F]+
// CharClass	::=	'[' '^'? ( RULE_Char | CharCode | CharRange | CharCodeRange )+ ']'
// RULE_Char	::=	[http://www.w3.org/TR/xml#NT-RULE_Char]
// CharRange	::=	RULE_Char '-' ( RULE_Char - ']' )
// CharCodeRange	::=	CharCode '-' CharCode
// RULE_WHITESPACE	::=	RULE_S | Comment
// RULE_S	::=	#x9 | #xA | #xD | #x20
// Comment	::=	'/*' ( [^*] | '*'+ [^*/] )* '*'* '*/'
const Parser_1 = __webpack_require__(489);
var BNF;
(function (BNF) {
    BNF.RULES = [
        {
            name: 'Grammar',
            bnf: [['RULE_S*', '%Atomic*', 'EOF']]
        },
        {
            name: '%Atomic',
            bnf: [['Production', 'RULE_S*']],
            fragment: true
        },
        {
            name: 'Production',
            bnf: [['NCName', 'RULE_S*', '"::="', 'RULE_WHITESPACE*', 'Choice', 'RULE_WHITESPACE*', 'RULE_EOL+', 'RULE_S*']]
        },
        {
            name: 'NCName',
            bnf: [[/[a-zA-Z][a-zA-Z_0-9]*/]]
        },
        {
            name: 'Choice',
            bnf: [['SequenceOrDifference', '%_Choice_1*']],
            fragment: true
        },
        {
            name: '%_Choice_1',
            bnf: [['RULE_WHITESPACE*', '"|"', 'RULE_WHITESPACE*', 'SequenceOrDifference']],
            fragment: true
        },
        {
            name: 'SequenceOrDifference',
            bnf: [['Item', 'RULE_WHITESPACE*', '%_Item_1?']]
        },
        {
            name: '%_Item_1',
            bnf: [['Minus', 'Item'], ['Item*']],
            fragment: true
        },
        {
            name: 'Minus',
            bnf: [['"-"']]
        },
        {
            name: 'Item',
            bnf: [['RULE_WHITESPACE*', '%Primary', 'PrimaryDecoration?']],
            fragment: true
        },
        {
            name: 'PrimaryDecoration',
            bnf: [['"?"'], ['"*"'], ['"+"']]
        },
        {
            name: 'DecorationName',
            bnf: [['"ebnf://"', /[^\x5D#]+/]]
        },
        {
            name: '%Primary',
            bnf: [['NCName'], ['StringLiteral'], ['CharCode'], ['CharClass'], ['SubItem']],
            fragment: true
        },
        {
            name: 'SubItem',
            bnf: [['"("', 'RULE_WHITESPACE*', 'Choice', 'RULE_WHITESPACE*', '")"']]
        },
        {
            name: 'StringLiteral',
            bnf: [[`'"'`, /[^"]*/, `'"'`], [`"'"`, /[^']*/, `"'"`]],
            pinned: 1
        },
        {
            name: 'CharCode',
            bnf: [['"#x"', /[0-9a-zA-Z]+/]]
        },
        {
            name: 'CharClass',
            bnf: [["'['", "'^'?", '%RULE_CharClass_1+', '"]"']]
        },
        {
            name: '%RULE_CharClass_1',
            bnf: [['CharCodeRange'], ['CharRange'], ['CharCode'], ['RULE_Char']],
            fragment: true
        },
        {
            name: 'RULE_Char',
            bnf: [[/\x09/], [/\x0A/], [/\x0D/], [/[\x20-\x5c]/], [/[\x5e-\uD7FF]/], [/[\uE000-\uFFFD]/]]
        },
        {
            name: 'CharRange',
            bnf: [['RULE_Char', '"-"', 'RULE_Char']]
        },
        {
            name: 'CharCodeRange',
            bnf: [['CharCode', '"-"', 'CharCode']]
        },
        {
            name: 'RULE_WHITESPACE',
            bnf: [['%RULE_WHITESPACE_CHAR*'], ['Comment', 'RULE_WHITESPACE*']]
        },
        {
            name: 'RULE_S',
            bnf: [['RULE_WHITESPACE', 'RULE_S*'], ['RULE_EOL', 'RULE_S*']]
        },
        {
            name: '%RULE_WHITESPACE_CHAR',
            bnf: [[/\x09/], [/\x20/]],
            fragment: true
        },
        {
            name: 'Comment',
            bnf: [['"/*"', '%RULE_Comment_Body*', '"*/"']]
        },
        {
            name: '%RULE_Comment_Body',
            bnf: [['!"*/"', /[^*]/]],
            fragment: true
        },
        {
            name: 'RULE_EOL',
            bnf: [[/\x0D/, /\x0A/], [/\x0A/], [/\x0D/]]
        },
        {
            name: 'Link',
            bnf: [["'['", 'Url', "']'"]]
        },
        {
            name: 'Url',
            bnf: [[/[^\x5D:/?#]/, '"://"', /[^\x5D#]+/, '%Url1?']]
        },
        {
            name: '%Url1',
            bnf: [['"#"', 'NCName']],
            fragment: true
        }
    ];
    BNF.defaultParser = new Parser_1.Parser(BNF.RULES, { debug: false });
    const preDecorationRE = /^(!|&)/;
    const decorationRE = /(\?|\+|\*)$/;
    const subExpressionRE = /^%/;
    function getBNFRule(name, parser) {
        if (typeof name == 'string') {
            if (preDecorationRE.test(name))
                return '';
            let subexpression = subExpressionRE.test(name);
            if (subexpression) {
                let decoration = decorationRE.exec(name);
                let decorationText = decoration ? decoration[0] + ' ' : '';
                let lonely = isLonelyRule(name, parser);
                if (lonely)
                    return getBNFBody(name, parser) + decorationText;
                return '(' + getBNFBody(name, parser) + ')' + decorationText;
            }
            return name;
        }
        else {
            return name.source
                .replace(/\\(?:x|u)([a-zA-Z0-9]+)/g, '#x$1')
                .replace(/\[\\(?:x|u)([a-zA-Z0-9]+)-\\(?:x|u)([a-zA-Z0-9]+)\]/g, '[#x$1-#x$2]');
        }
    }
    /// Returns true if the rule is a string literal or regular expression without a descendant tree
    function isLonelyRule(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        return (rule &&
            rule.bnf.length == 1 &&
            rule.bnf[0].length == 1 &&
            (rule.bnf[0][0] instanceof RegExp || rule.bnf[0][0][0] == '"' || rule.bnf[0][0][0] == "'"));
    }
    function getBNFChoice(rules, parser) {
        return rules.map(x => getBNFRule(x, parser)).join(' ');
    }
    function getBNFBody(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        if (rule)
            return rule.bnf.map(x => getBNFChoice(x, parser)).join(' | ');
        return 'RULE_NOT_FOUND {' + name + '}';
    }
    function emit(parser) {
        let acumulator = [];
        parser.grammarRules.forEach(l => {
            if (!/^%/.test(l.name)) {
                let recover = l.recover ? ' /* { recoverUntil=' + l.recover + ' } */' : '';
                acumulator.push(l.name + ' ::= ' + getBNFBody(l.name, parser) + recover);
            }
        });
        return acumulator.join('\n');
    }
    BNF.emit = emit;
    let subitems = 0;
    function restar(total, resta) {
        console.log('reberia restar ' + resta + ' a ' + total);
        throw new Error('Difference not supported yet');
    }
    function convertRegex(txt) {
        return new RegExp(txt
            .replace(/#x([a-zA-Z0-9]{4})/g, '\\u$1')
            .replace(/#x([a-zA-Z0-9]{3})/g, '\\u0$1')
            .replace(/#x([a-zA-Z0-9]{2})/g, '\\x$1')
            .replace(/#x([a-zA-Z0-9]{1})/g, '\\x0$1'));
    }
    function getSubItems(tmpRules, seq, parentName) {
        let anterior = null;
        let bnfSeq = [];
        seq.children.forEach((x, i) => {
            if (x.type == 'Minus') {
                restar(anterior, x);
            }
            else {
            }
            let decoration = seq.children[i + 1];
            decoration = (decoration && decoration.type == 'PrimaryDecoration' && decoration.text) || '';
            let preDecoration = '';
            switch (x.type) {
                case 'SubItem':
                    let name = '%' + (parentName + subitems++);
                    createRule(tmpRules, x, name);
                    bnfSeq.push(preDecoration + name + decoration);
                    break;
                case 'NCName':
                case 'StringLiteral':
                    bnfSeq.push(preDecoration + x.text + decoration);
                    break;
                case 'CharCode':
                case 'CharClass':
                    if (decoration || preDecoration) {
                        let newRule = {
                            name: '%' + (parentName + subitems++),
                            bnf: [[convertRegex(x.text)]]
                        };
                        tmpRules.push(newRule);
                        bnfSeq.push(preDecoration + newRule.name + decoration);
                    }
                    else {
                        bnfSeq.push(convertRegex(x.text));
                    }
                    break;
                case 'PrimaryDecoration':
                    break;
                default:
                    throw new Error(' HOW SHOULD I PARSE THIS? ' + x.type + ' -> ' + JSON.stringify(x.text));
            }
            anterior = x;
        });
        return bnfSeq;
    }
    function createRule(tmpRules, token, name) {
        let bnf = token.children.filter(x => x.type == 'SequenceOrDifference').map(s => getSubItems(tmpRules, s, name));
        let rule = {
            name,
            bnf
        };
        let recover = null;
        bnf.forEach(x => {
            recover = recover || x['recover'];
            delete x['recover'];
        });
        if (name.indexOf('%') == 0)
            rule.fragment = true;
        if (recover)
            rule.recover = recover;
        tmpRules.push(rule);
    }
    function getRules(source, parser = BNF.defaultParser) {
        let ast = parser.getAST(source);
        if (!ast)
            throw new Error('Could not parse ' + source);
        if (ast.errors && ast.errors.length) {
            throw ast.errors[0];
        }
        let tmpRules = [];
        ast.children.filter(x => x.type == 'Production').map((x) => {
            let name = x.children.filter(x => x.type == 'NCName')[0].text;
            createRule(tmpRules, x, name);
        });
        return tmpRules;
    }
    BNF.getRules = getRules;
    function Transform(source, subParser = BNF.defaultParser) {
        return getRules(source.join(''), subParser);
    }
    BNF.Transform = Transform;
    class Parser extends Parser_1.Parser {
        constructor(source, options) {
            const subParser = options && options.debugRulesParser === true ? new Parser_1.Parser(BNF.RULES, { debug: true }) : BNF.defaultParser;
            super(getRules(source, subParser), options);
        }
        emitSource() {
            return emit(this);
        }
    }
    BNF.Parser = Parser;
})(BNF || (BNF = {}));
exports["default"] = BNF;
//# sourceMappingURL=W3CEBNF.js.map

/***/ }),

/***/ 9652:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var BNF_1 = __webpack_require__(8173);
Object.defineProperty(exports, "BNF", ({ enumerable: true, get: function () { return BNF_1.default; } }));
var W3CEBNF_1 = __webpack_require__(1575);
Object.defineProperty(exports, "W3C", ({ enumerable: true, get: function () { return W3CEBNF_1.default; } }));
var Custom_1 = __webpack_require__(1657);
Object.defineProperty(exports, "Custom", ({ enumerable: true, get: function () { return Custom_1.default; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 489:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://www.ics.uci.edu/~pattis/ICS-33/lectures/ebnf.pdf
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Parser = exports.findRuleByName = exports.parseRuleName = exports.escapeRegExp = exports.readToken = void 0;
const UPPER_SNAKE_RE = /^[A-Z0-9_]+$/;
const decorationRE = /(\?|\+|\*)$/;
const preDecorationRE = /^(@|&|!)/;
const WS_RULE = 'WS';
const TokenError_1 = __webpack_require__(4217);
function readToken(txt, expr) {
    let result = expr.exec(txt);
    if (result && result.index == 0) {
        if (result[0].length == 0 && expr.source.length > 0)
            return null;
        return {
            type: null,
            text: result[0],
            rest: txt.substr(result[0].length),
            start: 0,
            end: result[0].length - 1,
            fullText: result[0],
            errors: [],
            children: [],
            parent: null
        };
    }
    return null;
}
exports.readToken = readToken;
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
function fixRest(token) {
    token.rest = '';
    token.children && token.children.forEach(c => fixRest(c));
}
function fixPositions(token, start) {
    token.start += start;
    token.end += start;
    token.children && token.children.forEach(c => fixPositions(c, token.start));
}
function agregateErrors(errors, token) {
    if (token.errors && token.errors.length)
        token.errors.forEach(err => errors.push(err));
    token.children && token.children.forEach(tok => agregateErrors(errors, tok));
}
function parseRuleName(name) {
    let postDecoration = decorationRE.exec(name);
    let preDecoration = preDecorationRE.exec(name);
    let postDecorationText = (postDecoration && postDecoration[0]) || '';
    let preDecorationText = (preDecoration && preDecoration[0]) || '';
    let out = {
        raw: name,
        name: name.replace(decorationRE, '').replace(preDecorationRE, ''),
        isOptional: postDecorationText == '?' || postDecorationText == '*',
        allowRepetition: postDecorationText == '+' || postDecorationText == '*',
        atLeastOne: postDecorationText == '+',
        lookupPositive: preDecorationText == '&',
        lookupNegative: preDecorationText == '!',
        pinned: preDecorationText == '@',
        lookup: false,
        isLiteral: false
    };
    out.isLiteral = out.name[0] == "'" || out.name[0] == '"';
    out.lookup = out.lookupNegative || out.lookupPositive;
    return out;
}
exports.parseRuleName = parseRuleName;
function findRuleByName(name, parser) {
    let parsed = parseRuleName(name);
    return parser.cachedRules[parsed.name] || null;
}
exports.findRuleByName = findRuleByName;
/// Removes all the nodes starting with 'RULE_'
function stripRules(token, re) {
    if (token.children) {
        let localRules = token.children.filter(x => x.type && re.test(x.type));
        for (let i = 0; i < localRules.length; i++) {
            let indexOnChildren = token.children.indexOf(localRules[i]);
            if (indexOnChildren != -1) {
                token.children.splice(indexOnChildren, 1);
            }
        }
        token.children.forEach(c => stripRules(c, re));
    }
}
const ignoreMissingRules = ['EOF'];
class Parser {
    constructor(grammarRules, options) {
        this.grammarRules = grammarRules;
        this.options = options;
        this.cachedRules = {};
        this.debug = options ? options.debug === true : false;
        let errors = [];
        let neededRules = [];
        grammarRules.forEach(rule => {
            let parsedName = parseRuleName(rule.name);
            if (parsedName.name in this.cachedRules) {
                errors.push('Duplicated rule ' + parsedName.name);
                return;
            }
            else {
                this.cachedRules[parsedName.name] = rule;
            }
            if (!rule.bnf || !rule.bnf.length) {
                let error = 'Missing rule content, rule: ' + rule.name;
                if (errors.indexOf(error) == -1)
                    errors.push(error);
            }
            else {
                rule.bnf.forEach(options => {
                    if (typeof options[0] === 'string') {
                        let parsed = parseRuleName(options[0]);
                        if (parsed.name == rule.name) {
                            let error = 'Left recursion is not allowed, rule: ' + rule.name;
                            if (errors.indexOf(error) == -1)
                                errors.push(error);
                        }
                    }
                    options.forEach(option => {
                        if (typeof option == 'string') {
                            let name = parseRuleName(option);
                            if (!name.isLiteral &&
                                neededRules.indexOf(name.name) == -1 &&
                                ignoreMissingRules.indexOf(name.name) == -1)
                                neededRules.push(name.name);
                        }
                    });
                });
            }
            if (WS_RULE == rule.name)
                rule.implicitWs = false;
            if (rule.implicitWs) {
                if (neededRules.indexOf(WS_RULE) == -1)
                    neededRules.push(WS_RULE);
            }
            if (rule.recover) {
                if (neededRules.indexOf(rule.recover) == -1)
                    neededRules.push(rule.recover);
            }
        });
        neededRules.forEach(ruleName => {
            if (!(ruleName in this.cachedRules)) {
                errors.push('Missing rule ' + ruleName);
            }
        });
        if (errors.length)
            throw new Error(errors.join('\n'));
    }
    getAST(txt, target) {
        if (!target) {
            target = this.grammarRules.filter(x => !x.fragment && x.name.indexOf('%') != 0)[0].name;
        }
        let result = this.parse(txt, target);
        if (result) {
            agregateErrors(result.errors, result);
            fixPositions(result, 0);
            // REMOVE ALL THE TAGS MATCHING /^%/
            stripRules(result, /^%/);
            if (!this.options || !this.options.keepUpperRules)
                stripRules(result, UPPER_SNAKE_RE);
            let rest = result.rest;
            if (rest) {
                new TokenError_1.TokenError('Unexpected end of input: \n' + rest, result);
            }
            fixRest(result);
            result.rest = rest;
        }
        return result;
    }
    emitSource() {
        return 'CANNOT EMIT SOURCE FROM BASE Parser';
    }
    parse(txt, target, recursion = 0) {
        let out = null;
        let type = parseRuleName(target);
        let expr;
        let printable = this.debug && /*!isLiteral &*/ !UPPER_SNAKE_RE.test(type.name);
        printable &&
            console.log(new Array(recursion).join('│  ') + 'Trying to get ' + target + ' from ' + JSON.stringify(txt.split('\n')[0]));
        let realType = type.name;
        let targetLex = findRuleByName(type.name, this);
        if (type.name == 'EOF') {
            if (txt.length) {
                return null;
            }
            else if (txt.length == 0) {
                return {
                    type: 'EOF',
                    text: '',
                    rest: '',
                    start: 0,
                    end: 0,
                    fullText: '',
                    errors: [],
                    children: [],
                    parent: null
                };
            }
        }
        try {
            if (!targetLex && type.isLiteral) {
                // tslint:disable-next-line: no-eval
                let src = eval(type.name);
                if (src === '') {
                    return {
                        type: '%%EMPTY%%',
                        text: '',
                        rest: txt,
                        start: 0,
                        end: 0,
                        fullText: '',
                        errors: [],
                        children: [],
                        parent: null
                    };
                }
                expr = new RegExp(escapeRegExp(src));
                realType = null;
            }
        }
        catch (e) {
            if (e instanceof ReferenceError) {
                console.error(e);
            }
            return null;
        }
        if (expr) {
            let result = readToken(txt, expr);
            if (result) {
                result.type = realType;
                return result;
            }
        }
        else {
            let options = targetLex.bnf;
            if (options instanceof Array) {
                options.forEach(phases => {
                    if (out)
                        return;
                    let pinned = null;
                    let tmp = {
                        type: type.name,
                        text: '',
                        children: [],
                        end: 0,
                        errors: [],
                        fullText: '',
                        parent: null,
                        start: 0,
                        rest: txt
                    };
                    if (targetLex.fragment)
                        tmp.fragment = true;
                    let tmpTxt = txt;
                    let position = 0;
                    let allOptional = phases.length > 0;
                    let foundSomething = false;
                    for (let i = 0; i < phases.length; i++) {
                        if (typeof phases[i] == 'string') {
                            let localTarget = parseRuleName(phases[i]);
                            allOptional = allOptional && localTarget.isOptional;
                            let got;
                            let foundAtLeastOne = false;
                            do {
                                got = null;
                                if (targetLex.implicitWs) {
                                    got = this.parse(tmpTxt, localTarget.name, recursion + 1);
                                    if (!got) {
                                        let WS;
                                        do {
                                            WS = this.parse(tmpTxt, WS_RULE, recursion + 1);
                                            if (WS) {
                                                tmp.text = tmp.text + WS.text;
                                                tmp.end = tmp.text.length;
                                                WS.parent = tmp;
                                                tmp.children.push(WS);
                                                tmpTxt = tmpTxt.substr(WS.text.length);
                                                position += WS.text.length;
                                            }
                                            else {
                                                break;
                                            }
                                        } while (WS && WS.text.length);
                                    }
                                }
                                got = got || this.parse(tmpTxt, localTarget.name, recursion + 1);
                                // rule ::= "true" ![a-zA-Z]
                                // negative lookup, if it does not match, we should continue
                                if (localTarget.lookupNegative) {
                                    if (got)
                                        return /* cancel this path */;
                                    break;
                                }
                                if (localTarget.lookupPositive) {
                                    if (!got)
                                        return;
                                }
                                if (!got) {
                                    if (localTarget.isOptional)
                                        break;
                                    if (localTarget.atLeastOne && foundAtLeastOne)
                                        break;
                                }
                                if (got && targetLex.pinned == i + 1) {
                                    pinned = got;
                                    printable && console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.type + ' PINNED');
                                }
                                if (!got)
                                    got = this.parseRecovery(targetLex, tmpTxt, recursion + 1);
                                if (!got) {
                                    if (pinned) {
                                        out = tmp;
                                        got = {
                                            type: 'SyntaxError',
                                            text: tmpTxt,
                                            children: [],
                                            end: tmpTxt.length,
                                            errors: [],
                                            fullText: '',
                                            parent: null,
                                            start: 0,
                                            rest: ''
                                        };
                                        if (tmpTxt.length) {
                                            new TokenError_1.TokenError(`Unexpected end of input. Expecting ${localTarget.name} Got: ${tmpTxt}`, got);
                                        }
                                        else {
                                            new TokenError_1.TokenError(`Unexpected end of input. Missing ${localTarget.name}`, got);
                                        }
                                        printable &&
                                            console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.type + ' ' + JSON.stringify(got.text));
                                    }
                                    else {
                                        return;
                                    }
                                }
                                foundAtLeastOne = true;
                                foundSomething = true;
                                if (got.type == '%%EMPTY%%') {
                                    break;
                                }
                                got.start += position;
                                got.end += position;
                                if (!localTarget.lookupPositive && got.type) {
                                    if (got.fragment) {
                                        got.children &&
                                            got.children.forEach(x => {
                                                x.start += position;
                                                x.end += position;
                                                x.parent = tmp;
                                                tmp.children.push(x);
                                            });
                                    }
                                    else {
                                        got.parent = tmp;
                                        tmp.children.push(got);
                                    }
                                }
                                if (localTarget.lookup)
                                    got.lookup = true;
                                printable &&
                                    console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.type + ' ' + JSON.stringify(got.text));
                                // Eat it from the input stream, only if it is not a lookup
                                if (!localTarget.lookup && !got.lookup) {
                                    tmp.text = tmp.text + got.text;
                                    tmp.end = tmp.text.length;
                                    tmpTxt = tmpTxt.substr(got.text.length);
                                    position += got.text.length;
                                }
                                tmp.rest = tmpTxt;
                            } while (got && localTarget.allowRepetition && tmpTxt.length && !got.lookup);
                        } /* IS A REGEXP */
                        else {
                            let got = readToken(tmpTxt, phases[i]);
                            if (!got) {
                                return;
                            }
                            printable &&
                                console.log(new Array(recursion + 1).join('│  ') + '└> ' + JSON.stringify(got.text) + phases[i].source);
                            foundSomething = true;
                            got.start += position;
                            got.end += position;
                            tmp.text = tmp.text + got.text;
                            tmp.end = tmp.text.length;
                            tmpTxt = tmpTxt.substr(got.text.length);
                            position += got.text.length;
                            tmp.rest = tmpTxt;
                        }
                    }
                    if (foundSomething) {
                        out = tmp;
                        printable &&
                            console.log(new Array(recursion).join('│  ') + '├<─┴< PUSHING ' + out.type + ' ' + JSON.stringify(out.text));
                    }
                });
            }
            if (out && targetLex.simplifyWhenOneChildren && out.children.length == 1) {
                out = out.children[0];
            }
        }
        if (!out) {
            printable && console.log(target + ' NOT RESOLVED FROM ' + txt);
        }
        return out;
    }
    parseRecovery(recoverableToken, tmpTxt, recursion) {
        if (recoverableToken.recover && tmpTxt.length) {
            let printable = this.debug;
            printable &&
                console.log(new Array(recursion + 1).join('│  ') +
                    'Trying to recover until token ' +
                    recoverableToken.recover +
                    ' from ' +
                    JSON.stringify(tmpTxt.split('\n')[0] + tmpTxt.split('\n')[1]));
            let tmp = {
                type: 'SyntaxError',
                text: '',
                children: [],
                end: 0,
                errors: [],
                fullText: '',
                parent: null,
                start: 0,
                rest: ''
            };
            let got;
            do {
                got = this.parse(tmpTxt, recoverableToken.recover, recursion + 1);
                if (got) {
                    new TokenError_1.TokenError('Unexpected input: "' + tmp.text + `" Expecting: ${recoverableToken.name}`, tmp);
                    break;
                }
                else {
                    tmp.text = tmp.text + tmpTxt[0];
                    tmp.end = tmp.text.length;
                    tmpTxt = tmpTxt.substr(1);
                }
            } while (!got && tmpTxt.length > 0);
            if (tmp.text.length > 0 && got) {
                printable && console.log(new Array(recursion + 1).join('│  ') + 'Recovered text: ' + JSON.stringify(tmp.text));
                return tmp;
            }
        }
        return null;
    }
}
exports.Parser = Parser;
exports["default"] = Parser;
//# sourceMappingURL=Parser.js.map

/***/ }),

/***/ 7241:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findChildrenByType = void 0;
/**
 * Finds all the direct childs of a specifyed type
 */
function findChildrenByType(token, type) {
    return token.children ? token.children.filter(x => x.type == type) : [];
}
exports.findChildrenByType = findChildrenByType;
//# sourceMappingURL=SemanticHelpers.js.map

/***/ }),

/***/ 4217:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenError = void 0;
class TokenError extends Error {
    constructor(message, token) {
        super(message);
        this.message = message;
        this.token = token;
        if (token && token.errors)
            token.errors.push(this);
        else
            throw this;
    }
    inspect() {
        return 'SyntaxError: ' + this.message;
    }
}
exports.TokenError = TokenError;
//# sourceMappingURL=TokenError.js.map

/***/ }),

/***/ 1425:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Parser_1 = __webpack_require__(489);
Object.defineProperty(exports, "Parser", ({ enumerable: true, get: function () { return Parser_1.Parser; } }));
var TokenError_1 = __webpack_require__(4217);
Object.defineProperty(exports, "TokenError", ({ enumerable: true, get: function () { return TokenError_1.TokenError; } }));
exports.Grammars = __webpack_require__(9652);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 118:
/***/ ((module) => {

"use strict";


/**
 * @typedef {{ [key: string]: any }} Extensions
 * @typedef {Error} Err
 * @property {string} message
 */

/**
 *
 * @param {Error} obj
 * @param {Extensions} props
 * @returns {Error & Extensions}
 */
function assign(obj, props) {
    for (const key in props) {
        Object.defineProperty(obj, key, {
            value: props[key],
            enumerable: true,
            configurable: true,
        });
    }

    return obj;
}

/**
 *
 * @param {any} err - An Error
 * @param {string|Extensions} code - A string code or props to set on the error
 * @param {Extensions} [props] - Props to set on the error
 * @returns {Error & Extensions}
 */
function createError(err, code, props) {
    if (!err || typeof err === 'string') {
        throw new TypeError('Please pass an Error to err-code');
    }

    if (!props) {
        props = {};
    }

    if (typeof code === 'object') {
        props = code;
        code = '';
    }

    if (code) {
        props.code = code;
    }

    try {
        return assign(err, props);
    } catch (_) {
        props.message = err.message;
        props.stack = err.stack;

        const ErrClass = function () {};

        ErrClass.prototype = Object.create(Object.getPrototypeOf(err));

        // @ts-ignore
        const output = assign(new ErrClass(), props);

        return output;
    }
}

module.exports = createError;


/***/ }),

/***/ 8898:
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ 9331:
/***/ ((module) => {

"use strict";


const word = '[a-fA-F\\d:]';
const b = options => options && options.includeBoundaries ?
	`(?:(?<=\\s|^)(?=${word})|(?<=${word})(?=\\s|$))` :
	'';

const v4 = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}';

const v6seg = '[a-fA-F\\d]{1,4}';
const v6 = `
(?:
(?:${v6seg}:){7}(?:${v6seg}|:)|                                    // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
(?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)|                             // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
(?:${v6seg}:){5}(?::${v4}|(?::${v6seg}){1,2}|:)|                   // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
(?:${v6seg}:){4}(?:(?::${v6seg}){0,1}:${v4}|(?::${v6seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
(?:${v6seg}:){3}(?:(?::${v6seg}){0,2}:${v4}|(?::${v6seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
(?:${v6seg}:){2}(?:(?::${v6seg}){0,3}:${v4}|(?::${v6seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
(?:${v6seg}:){1}(?:(?::${v6seg}){0,4}:${v4}|(?::${v6seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
(?::(?:(?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))             // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
)(?:%[0-9a-zA-Z]{1,})?                                             // %eth0            %1
`.replace(/\s*\/\/.*$/gm, '').replace(/\n/g, '').trim();

// Pre-compile only the exact regexes because adding a global flag make regexes stateful
const v46Exact = new RegExp(`(?:^${v4}$)|(?:^${v6}$)`);
const v4exact = new RegExp(`^${v4}$`);
const v6exact = new RegExp(`^${v6}$`);

const ip = options => options && options.exact ?
	v46Exact :
	new RegExp(`(?:${b(options)}${v4}${b(options)})|(?:${b(options)}${v6}${b(options)})`, 'g');

ip.v4 = options => options && options.exact ? v4exact : new RegExp(`${b(options)}${v4}${b(options)}`, 'g');
ip.v6 = options => options && options.exact ? v6exact : new RegExp(`${b(options)}${v6}${b(options)}`, 'g');

module.exports = ip;


/***/ }),

/***/ 1823:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const isElectron = __webpack_require__(3571)

const IS_ENV_WITH_DOM = typeof window === 'object' && typeof document === 'object' && document.nodeType === 9
// @ts-ignore
const IS_ELECTRON = isElectron()
const IS_BROWSER = IS_ENV_WITH_DOM && !IS_ELECTRON
const IS_ELECTRON_MAIN = IS_ELECTRON && !IS_ENV_WITH_DOM
const IS_ELECTRON_RENDERER = IS_ELECTRON && IS_ENV_WITH_DOM
const IS_NODE =  true && typeof globalThis.process !== 'undefined' && typeof globalThis.process.release !== 'undefined' && globalThis.process.release.name === 'node' && !IS_ELECTRON
// @ts-ignore - we either ignore worker scope or dom scope
const IS_WEBWORKER = typeof importScripts === 'function' && typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
const IS_TEST = typeof globalThis.process !== 'undefined' && typeof globalThis.process.env !== 'undefined' && globalThis.process.env.NODE_ENV === 'test'
const IS_REACT_NATIVE = typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

module.exports = {
  isTest: IS_TEST,
  isElectron: IS_ELECTRON,
  isElectronMain: IS_ELECTRON_MAIN,
  isElectronRenderer: IS_ELECTRON_RENDERER,
  isNode: IS_NODE,
  /**
   * Detects browser main thread  **NOT** web worker or service worker
   */
  isBrowser: IS_BROWSER,
  isWebWorker: IS_WEBWORKER,
  isEnvWithDom: IS_ENV_WITH_DOM,
  isReactNative: IS_REACT_NATIVE
}


/***/ }),

/***/ 4745:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { isElectronMain } = __webpack_require__(1823)

if (isElectronMain) {
  module.exports = __webpack_require__(3034)
} else {
// use window.fetch if it is available, fall back to node-fetch if not
  module.exports = __webpack_require__(6487)
}


/***/ }),

/***/ 6417:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const HTTP = __webpack_require__(2722)

/**
 *
 * @param {string} url
 * @param {import("../types").HTTPOptions} [options]
 * @returns {{ path: string; content?: AsyncIterable<Uint8Array> }}
 */
const urlSource = (url, options) => {
  return {
    path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
    content: readURLContent(url, options)
  }
}

/**
 *
 * @param {string} url
 * @param {import("../types").HTTPOptions} [options]
 * @returns {AsyncIterable<Uint8Array>}
 */
async function * readURLContent (url, options) {
  const http = new HTTP()
  const response = await http.get(url, options)

  yield * response.iterator()
}

module.exports = urlSource


/***/ }),

/***/ 2722:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint-disable no-undef */


const { fetch, Request, Headers } = __webpack_require__(341)
const { TimeoutError, HTTPError } = __webpack_require__(5348)
const merge = (__webpack_require__(3224).bind)({ ignoreUndefined: true })
const { URL, URLSearchParams } = __webpack_require__(4698)
const anySignal = __webpack_require__(1659)

/**
 * @typedef {import('stream').Readable} NodeReadableStream
 * @typedef {import('./types').HTTPOptions} HTTPOptions
 * @typedef {import('./types').ExtendedResponse} ExtendedResponse
 */

/**
 * @template TResponse
 * @param {Promise<TResponse>} promise
 * @param {number | undefined} ms
 * @param {AbortController} abortController
 * @returns {Promise<TResponse>}
 */
const timeout = (promise, ms, abortController) => {
  if (ms === undefined) {
    return promise
  }

  const start = Date.now()

  const timedOut = () => {
    const time = Date.now() - start

    return time >= ms
  }

  return new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      if (timedOut()) {
        reject(new TimeoutError())
        abortController.abort()
      }
    }, ms)

    /**
     * @param {(value: any) => void } next
     */
    const after = (next) => {
      /**
       * @param {any} res
       */
      const fn = (res) => {
        clearTimeout(timeoutID)

        if (timedOut()) {
          reject(new TimeoutError())
          return
        }

        next(res)
      }
      return fn
    }

    promise
      .then(after(resolve), after(reject))
  })
}

const defaults = {
  throwHttpErrors: true,
  credentials: 'same-origin'
}

class HTTP {
  /**
   *
   * @param {HTTPOptions} options
   */
  constructor (options = {}) {
    /** @type {HTTPOptions} */
    this.opts = merge(defaults, options)
  }

  /**
   * Fetch
   *
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   * @returns {Promise<ExtendedResponse>}
   */
  async fetch (resource, options = {}) {
    /** @type {HTTPOptions} */
    const opts = merge(this.opts, options)
    const headers = new Headers(opts.headers)

    // validate resource type
    if (typeof resource !== 'string' && !(resource instanceof URL || resource instanceof Request)) {
      throw new TypeError('`resource` must be a string, URL, or Request')
    }

    const url = new URL(resource.toString(), opts.base)

    const {
      searchParams,
      transformSearchParams,
      json
    } = opts

    if (searchParams) {
      if (typeof transformSearchParams === 'function') {
        // @ts-ignore
        url.search = transformSearchParams(new URLSearchParams(opts.searchParams))
      } else {
        // @ts-ignore
        url.search = new URLSearchParams(opts.searchParams)
      }
    }

    if (json) {
      opts.body = JSON.stringify(opts.json)
      headers.set('content-type', 'application/json')
    }

    const abortController = new AbortController()
    // @ts-ignore
    const signal = anySignal([abortController.signal, opts.signal])

    const response = await timeout(
      fetch(
        url.toString(),
        {
          ...opts,
          signal,
          timeout: undefined,
          headers
        }
      ),
      opts.timeout,
      abortController
    )

    if (!response.ok && opts.throwHttpErrors) {
      if (opts.handleError) {
        await opts.handleError(response)
      }
      throw new HTTPError(response)
    }

    response.iterator = function () {
      return fromStream(response.body)
    }

    response.ndjson = async function * () {
      for await (const chunk of ndjson(response.iterator())) {
        if (options.transform) {
          yield options.transform(chunk)
        } else {
          yield chunk
        }
      }
    }

    return response
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   */
  post (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'POST' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   */
  get (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'GET' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   */
  put (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'PUT' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   */
  delete (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'DELETE' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   */
  options (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'OPTIONS' })
  }
}

/**
 * Parses NDJSON chunks from an iterator
 *
 * @param {AsyncIterable<Uint8Array>} source
 * @returns {AsyncIterable<any>}
 */
const ndjson = async function * (source) {
  const decoder = new TextDecoder()
  let buf = ''

  for await (const chunk of source) {
    buf += decoder.decode(chunk, { stream: true })
    const lines = buf.split(/\r?\n/)

    for (let i = 0; i < lines.length - 1; i++) {
      const l = lines[i].trim()
      if (l.length > 0) {
        yield JSON.parse(l)
      }
    }
    buf = lines[lines.length - 1]
  }
  buf += decoder.decode()
  buf = buf.trim()
  if (buf.length !== 0) {
    yield JSON.parse(buf)
  }
}

/**
 * Stream to AsyncIterable
 *
 * @template TChunk
 * @param {ReadableStream<TChunk> | NodeReadableStream | null} source
 * @returns {AsyncIterable<TChunk>}
 */
const fromStream = (source) => {
  // Workaround for https://github.com/node-fetch/node-fetch/issues/766
  if (isNodeReadableStream(source)) {
    const iter = source[Symbol.asyncIterator]()
    return {
      [Symbol.asyncIterator] () {
        return {
          next: iter.next.bind(iter),
          return (value) {
            source.destroy()
            if (typeof iter.return === 'function') {
              return iter.return()
            }
            return Promise.resolve({ done: true, value })
          }
        }
      }
    }
  }

  if (isWebReadableStream(source)) {
    const reader = source.getReader()
    return (async function * () {
      try {
        while (true) {
          // Read from the stream
          const { done, value } = await reader.read()
          // Exit if we're done
          if (done) return
          // Else yield the chunk
          if (value) {
            yield value
          }
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  if (isAsyncIterable(source)) {
    return source
  }

  throw new TypeError('Body can\'t be converted to AsyncIterable')
}

/**
 * Check if it's an AsyncIterable
 *
 * @template {unknown} TChunk
 * @template {any} Other
 * @param {Other|AsyncIterable<TChunk>} value
 * @returns {value is AsyncIterable<TChunk>}
 */
const isAsyncIterable = (value) => {
  return typeof value === 'object' &&
  value !== null &&
  typeof /** @type {any} */(value)[Symbol.asyncIterator] === 'function'
}

/**
 * Check for web readable stream
 *
 * @template {unknown} TChunk
 * @template {any} Other
 * @param {Other|ReadableStream<TChunk>} value
 * @returns {value is ReadableStream<TChunk>}
 */
const isWebReadableStream = (value) => {
  return value && typeof /** @type {any} */(value).getReader === 'function'
}

/**
 * @param {any} value
 * @returns {value is NodeReadableStream}
 */
const isNodeReadableStream = (value) =>
  Object.prototype.hasOwnProperty.call(value, 'readable') &&
  Object.prototype.hasOwnProperty.call(value, 'writable')

HTTP.HTTPError = HTTPError
HTTP.TimeoutError = TimeoutError
HTTP.streamToAsyncIterator = fromStream

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 */
HTTP.post = (resource, options) => new HTTP(options).post(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 */
HTTP.get = (resource, options) => new HTTP(options).get(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 */
HTTP.put = (resource, options) => new HTTP(options).put(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 */
HTTP.delete = (resource, options) => new HTTP(options).delete(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 */
HTTP.options = (resource, options) => new HTTP(options).options(resource, options)

module.exports = HTTP


/***/ }),

/***/ 5348:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


class TimeoutError extends Error {
  constructor (message = 'Request timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}
exports.TimeoutError = TimeoutError

class AbortError extends Error {
  constructor (message = 'The operation was aborted.') {
    super(message)
    this.name = 'AbortError'
  }
}
exports.AbortError = AbortError

class HTTPError extends Error {
  /**
   * @param {Response} response
   */
  constructor (response) {
    super(response.statusText)
    this.name = 'HTTPError'
    this.response = response
  }
}
exports.HTTPError = HTTPError


/***/ }),

/***/ 341:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { TimeoutError, AbortError } = __webpack_require__(5348)
const { Response, Request, Headers, default: fetch } = __webpack_require__(4745)

/**
 * @typedef {import('../types').FetchOptions} FetchOptions
 * @typedef {import('../types').ProgressFn} ProgressFn
 */

/**
 * Fetch with progress
 *
 * @param {string | Request} url
 * @param {FetchOptions} [options]
 * @returns {Promise<ResponseWithURL>}
 */
const fetchWithProgress = (url, options = {}) => {
  const request = new XMLHttpRequest()
  request.open(options.method || 'GET', url.toString(), true)

  const { timeout, headers } = options

  if (timeout && timeout > 0 && timeout < Infinity) {
    request.timeout = timeout
  }

  if (options.overrideMimeType != null) {
    request.overrideMimeType(options.overrideMimeType)
  }

  if (headers) {
    for (const [name, value] of new Headers(headers)) {
      request.setRequestHeader(name, value)
    }
  }

  if (options.signal) {
    options.signal.onabort = () => request.abort()
  }

  if (options.onUploadProgress) {
    request.upload.onprogress = options.onUploadProgress
  }

  // Note: Need to use `arraybuffer` here instead of `blob` because `Blob`
  // instances coming from JSDOM are not compatible with `Response` from
  // node-fetch (which is the setup we get when testing with jest because
  // it uses JSDOM which does not provide a global fetch
  // https://github.com/jsdom/jsdom/issues/1724)
  request.responseType = 'arraybuffer'

  return new Promise((resolve, reject) => {
    /**
     * @param {Event} event
     */
    const handleEvent = (event) => {
      switch (event.type) {
        case 'error': {
          resolve(Response.error())
          break
        }
        case 'load': {
          resolve(
            new ResponseWithURL(request.responseURL, request.response, {
              status: request.status,
              statusText: request.statusText,
              headers: parseHeaders(request.getAllResponseHeaders())
            })
          )
          break
        }
        case 'timeout': {
          reject(new TimeoutError())
          break
        }
        case 'abort': {
          reject(new AbortError())
          break
        }
        default: {
          break
        }
      }
    }
    request.onerror = handleEvent
    request.onload = handleEvent
    request.ontimeout = handleEvent
    request.onabort = handleEvent

    // @ts-expect-error options.body can be a node readable stream, which isn't compatible with XHR, but this
    // file is a browser override so you won't get a node readable stream so ignore the error
    request.send(options.body)
  })
}

const fetchWithStreaming = fetch

/**
 * @param {string | Request} url
 * @param {FetchOptions} options
 */
const fetchWith = (url, options = {}) =>
  (options.onUploadProgress != null)
    ? fetchWithProgress(url, options)
    : fetchWithStreaming(url, options)

/**
 * Parse Headers from a XMLHttpRequest
 *
 * @param {string} input
 * @returns {Headers}
 */
const parseHeaders = (input) => {
  const headers = new Headers()
  for (const line of input.trim().split(/[\r\n]+/)) {
    const index = line.indexOf(': ')
    if (index > 0) {
      headers.set(line.slice(0, index), line.slice(index + 1))
    }
  }

  return headers
}

class ResponseWithURL extends Response {
  /**
   * @param {string} url
   * @param {BodyInit} body
   * @param {ResponseInit} options
   */
  constructor (url, body, options) {
    super(body, options)
    Object.defineProperty(this, 'url', { value: url })
  }
}

module.exports = {
  fetch: fetchWith,
  Request,
  Headers
}


/***/ }),

/***/ 3571:
/***/ ((module) => {

// https://github.com/electron/electron/issues/2288
function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to false
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

module.exports = isElectron;


/***/ }),

/***/ 2478:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const ipRegex = __webpack_require__(9331);

const isIp = string => ipRegex({exact: true}).test(string);
isIp.v4 = string => ipRegex.v4({exact: true}).test(string);
isIp.v6 = string => ipRegex.v6({exact: true}).test(string);
isIp.version = string => isIp(string) ? (isIp.v4(string) ? 4 : 6) : undefined;

module.exports = isIp;


/***/ }),

/***/ 7760:
/***/ ((module) => {

"use strict";


module.exports = value => {
	if (Object.prototype.toString.call(value) !== '[object Object]') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
};


/***/ }),

/***/ 4698:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const {
  URLWithLegacySupport,
  format,
  URLSearchParams,
  defaultBase
} = __webpack_require__(5053)
const relative = __webpack_require__(5784)

module.exports = {
  URL: URLWithLegacySupport,
  URLSearchParams,
  format,
  relative,
  defaultBase
}


/***/ }),

/***/ 5784:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { URLWithLegacySupport, format } = __webpack_require__(5053)

/**
 * @param {string | undefined} url
 * @param {any} [location]
 * @param {any} [protocolMap]
 * @param {any} [defaultProtocol]
 */
module.exports = (url, location = {}, protocolMap = {}, defaultProtocol) => {
  let protocol = location.protocol
    ? location.protocol.replace(':', '')
    : 'http'

  // Check protocol map
  protocol = (protocolMap[protocol] || defaultProtocol || protocol) + ':'
  let urlParsed

  try {
    urlParsed = new URLWithLegacySupport(url)
  } catch (err) {
    urlParsed = {}
  }

  const base = Object.assign({}, location, {
    protocol: protocol || urlParsed.protocol,
    host: location.host || urlParsed.host
  })

  return new URLWithLegacySupport(url, format(base)).toString()
}


/***/ }),

/***/ 5053:
/***/ ((module) => {

"use strict";


const isReactNative =
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative'

function getDefaultBase () {
  if (isReactNative) {
    return 'http://localhost'
  }
  // in some environments i.e. cloudflare workers location is not available
  if (!self.location) {
    return ''
  }

  return self.location.protocol + '//' + self.location.host
}

const URL = self.URL
const defaultBase = getDefaultBase()

class URLWithLegacySupport {
  constructor (url = '', base = defaultBase) {
    this.super = new URL(url, base)
    this.path = this.pathname + this.search
    this.auth =
            this.username && this.password
              ? this.username + ':' + this.password
              : null

    this.query =
            this.search && this.search.startsWith('?')
              ? this.search.slice(1)
              : null
  }

  get hash () {
    return this.super.hash
  }

  get host () {
    return this.super.host
  }

  get hostname () {
    return this.super.hostname
  }

  get href () {
    return this.super.href
  }

  get origin () {
    return this.super.origin
  }

  get password () {
    return this.super.password
  }

  get pathname () {
    return this.super.pathname
  }

  get port () {
    return this.super.port
  }

  get protocol () {
    return this.super.protocol
  }

  get search () {
    return this.super.search
  }

  get searchParams () {
    return this.super.searchParams
  }

  get username () {
    return this.super.username
  }

  set hash (hash) {
    this.super.hash = hash
  }

  set host (host) {
    this.super.host = host
  }

  set hostname (hostname) {
    this.super.hostname = hostname
  }

  set href (href) {
    this.super.href = href
  }

  set password (password) {
    this.super.password = password
  }

  set pathname (pathname) {
    this.super.pathname = pathname
  }

  set port (port) {
    this.super.port = port
  }

  set protocol (protocol) {
    this.super.protocol = protocol
  }

  set search (search) {
    this.super.search = search
  }

  set username (username) {
    this.super.username = username
  }

  /**
   * @param {any} o
   */
  static createObjectURL (o) {
    return URL.createObjectURL(o)
  }

  /**
   * @param {string} o
   */
  static revokeObjectURL (o) {
    URL.revokeObjectURL(o)
  }

  toJSON () {
    return this.super.toJSON()
  }

  toString () {
    return this.super.toString()
  }

  format () {
    return this.toString()
  }
}

/**
 * @param {string | import('url').UrlObject} obj
 */
function format (obj) {
  if (typeof obj === 'string') {
    const url = new URL(obj)

    return url.toString()
  }

  if (!(obj instanceof URL)) {
    const userPass =
            // @ts-ignore its not supported in node but we normalise
            obj.username && obj.password
              // @ts-ignore its not supported in node but we normalise
              ? `${obj.username}:${obj.password}@`
              : ''
    const auth = obj.auth ? obj.auth + '@' : ''
    const port = obj.port ? ':' + obj.port : ''
    const protocol = obj.protocol ? obj.protocol + '//' : ''
    const host = obj.host || ''
    const hostname = obj.hostname || ''
    const search = obj.search || (obj.query ? '?' + obj.query : '')
    const hash = obj.hash || ''
    const pathname = obj.pathname || ''
    // @ts-ignore - path is not supported in node but we normalise
    const path = obj.path || pathname + search

    return `${protocol}${userPass || auth}${
            host || hostname + port
        }${path}${hash}`
  }
}

module.exports = {
  URLWithLegacySupport,
  URLSearchParams: self.URLSearchParams,
  defaultBase,
  format
}


/***/ }),

/***/ 1251:
/***/ ((module) => {

"use strict";


/**
 * Collects all values from an (async) iterable into an array and returns it.
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 */
const all = async (source) => {
  const arr = []

  for await (const entry of source) {
    arr.push(entry)
  }

  return arr
}

module.exports = all


/***/ }),

/***/ 6843:
/***/ ((module) => {

"use strict";


/**
 * Returns the first result from an (async) iterable, unless empty, in which
 * case returns `undefined`.
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 */
const first = async (source) => {
  for await (const entry of source) { // eslint-disable-line no-unreachable-loop
    return entry
  }

  return undefined
}

module.exports = first


/***/ }),

/***/ 1215:
/***/ ((module) => {

"use strict";


/**
 * Returns the last item of an (async) iterable, unless empty, in which case
 * return `undefined`.
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 */
const last = async (source) => {
  let res

  for await (const entry of source) {
    res = entry
  }

  return res
}

module.exports = last


/***/ }),

/***/ 8731:
/***/ ((module) => {

"use strict";


/**
 * Takes an (async) iterable and returns one with each item mapped by the passed
 * function.
 *
 * @template I,O
 * @param {AsyncIterable<I>|Iterable<I>} source
 * @param {function(I):O|Promise<O>} func
 * @returns {AsyncIterable<O>}
 */
const map = async function * (source, func) {
  for await (const val of source) {
    yield func(val)
  }
}

module.exports = map


/***/ }),

/***/ 3506:
/***/ ((module) => {

"use strict";


/**
 * @template T
 * @typedef {Object} Peek
 * @property {() => IteratorResult<T, void>} peek
 */

/**
 * @template T
 * @typedef {Object} AsyncPeek
 * @property {() => Promise<IteratorResult<T, void>>} peek
 */

/**
 * @template T
 * @typedef {Object} Push
 * @property {(value:T) => void} push
 */

/**
 * @template T
 * @typedef {Iterable<T> & Peek<T> & Push<T> & Iterator<T>} Peekable<T>
 */

/**
 * @template T
 * @typedef {AsyncIterable<T> & AsyncPeek<T> & Push<T> & AsyncIterator<T>} AsyncPeekable<T>
 */

/**
 * @template {Iterable<any> | AsyncIterable<any>} I
 * @param {I} iterable
 * @returns {I extends Iterable<infer T>
 *  ? Peekable<T>
 *  : I extends AsyncIterable<infer T>
 *  ? AsyncPeekable<T>
 *  : never
 * }
 */
function peekableIterator (iterable) {
  // @ts-ignore
  const [iterator, symbol] = iterable[Symbol.asyncIterator]
    // @ts-ignore
    ? [iterable[Symbol.asyncIterator](), Symbol.asyncIterator]
    // @ts-ignore
    : [iterable[Symbol.iterator](), Symbol.iterator]

  /** @type {any[]} */
  const queue = []

  // @ts-ignore
  return {
    peek: () => {
      return iterator.next()
    },
    push: (value) => {
      queue.push(value)
    },
    next: () => {
      if (queue.length) {
        return {
          done: false,
          value: queue.shift()
        }
      }

      return iterator.next()
    },
    [symbol] () {
      return this
    }
  }
}

module.exports = peekableIterator


/***/ }),

/***/ 338:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var INPUT_ERROR = 'input is invalid type';
  var FINALIZE_ERROR = 'finalize already called';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA3_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = __webpack_require__.g;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && "object" === 'object' && module.exports;
  var AMD =  true && __webpack_require__.amdO;
  var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
  var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
  var KECCAK_PADDING = [1, 256, 65536, 16777216];
  var PADDING = [6, 1536, 393216, 100663296];
  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
    0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
    2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
    2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
    2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];
  var SHAKE_BITS = [128, 256];
  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array', 'digest'];
  var CSHAKE_BYTEPAD = {
    '128': 168,
    '256': 136
  };

  if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (bits, padding, outputType) {
    return function (message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    };
  };

  var createShakeOutputMethod = function (bits, padding, outputType) {
    return function (message, outputBits) {
      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
    };
  };

  var createCshakeOutputMethod = function (bits, padding, outputType) {
    return function (message, outputBits, n, s) {
      return methods['cshake' + bits].update(message, outputBits, n, s)[outputType]();
    };
  };

  var createKmacOutputMethod = function (bits, padding, outputType) {
    return function (key, message, outputBits, s) {
      return methods['kmac' + bits].update(key, message, outputBits, s)[outputType]();
    };
  };

  var createOutputMethods = function (method, createMethod, bits, padding) {
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createMethod(bits, padding, type);
    }
    return method;
  };

  var createMethod = function (bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');
    method.create = function () {
      return new Keccak(bits, padding, bits);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    return createOutputMethods(method, createOutputMethod, bits, padding);
  };

  var createShakeMethod = function (bits, padding) {
    var method = createShakeOutputMethod(bits, padding, 'hex');
    method.create = function (outputBits) {
      return new Keccak(bits, padding, outputBits);
    };
    method.update = function (message, outputBits) {
      return method.create(outputBits).update(message);
    };
    return createOutputMethods(method, createShakeOutputMethod, bits, padding);
  };

  var createCshakeMethod = function (bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createCshakeOutputMethod(bits, padding, 'hex');
    method.create = function (outputBits, n, s) {
      if (!n && !s) {
        return methods['shake' + bits].create(outputBits);
      } else {
        return new Keccak(bits, padding, outputBits).bytepad([n, s], w);
      }
    };
    method.update = function (message, outputBits, n, s) {
      return method.create(outputBits, n, s).update(message);
    };
    return createOutputMethods(method, createCshakeOutputMethod, bits, padding);
  };

  var createKmacMethod = function (bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createKmacOutputMethod(bits, padding, 'hex');
    method.create = function (key, outputBits, s) {
      return new Kmac(bits, padding, outputBits).bytepad(['KMAC', s], w).bytepad([key], w);
    };
    method.update = function (key, message, outputBits, s) {
      return method.create(key, outputBits, s).update(message);
    };
    return createOutputMethods(method, createKmacOutputMethod, bits, padding);
  };

  var algorithms = [
    { name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod },
    { name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod },
    { name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod },
    { name: 'cshake', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createCshakeMethod },
    { name: 'kmac', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createKmacMethod }
  ];

  var methods = {}, methodNames = [];

  for (var i = 0; i < algorithms.length; ++i) {
    var algorithm = algorithms[i];
    var bits = algorithm.bits;
    for (var j = 0; j < bits.length; ++j) {
      var methodName = algorithm.name + '_' + bits[j];
      methodNames.push(methodName);
      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
      if (algorithm.name !== 'sha3') {
        var newMethodName = algorithm.name + bits[j];
        methodNames.push(newMethodName);
        methods[newMethodName] = methods[methodName];
      }
    }
  }

  function Keccak(bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.finalized = false;
    this.block = 0;
    this.start = 0;
    this.blockCount = (1600 - (bits << 1)) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for (var i = 0; i < 50; ++i) {
      this.s[i] = 0;
    }
  }

  Keccak.prototype.update = function (message) {
    if (this.finalized) {
      throw new Error(FINALIZE_ERROR);
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }
      notString = true;
    }
    var blocks = this.blocks, byteCount = this.byteCount, length = message.length,
      blockCount = this.blockCount, index = 0, s = this.s, i, code;

    while (index < length) {
      if (this.reset) {
        this.reset = false;
        blocks[0] = this.block;
        for (i = 1; i < blockCount + 1; ++i) {
          blocks[i] = 0;
        }
      }
      if (notString) {
        for (i = this.start; index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }
      this.lastByteIndex = i;
      if (i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];
        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }
        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }
    return this;
  };

  Keccak.prototype.encode = function (x, right) {
    var o = x & 255, n = 1;
    var bytes = [o];
    x = x >> 8;
    o = x & 255;
    while (o > 0) {
      bytes.unshift(o);
      x = x >> 8;
      o = x & 255;
      ++n;
    }
    if (right) {
      bytes.push(n);
    } else {
      bytes.unshift(n);
    }
    this.update(bytes);
    return bytes.length;
  };

  Keccak.prototype.encodeString = function (str) {
    var notString, type = typeof str;
    if (type !== 'string') {
      if (type === 'object') {
        if (str === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
          str = new Uint8Array(str);
        } else if (!Array.isArray(str)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }
      notString = true;
    }
    var bytes = 0, length = str.length;
    if (notString) {
      bytes = length;
    } else {
      for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);
        if (code < 0x80) {
          bytes += 1;
        } else if (code < 0x800) {
          bytes += 2;
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes += 3;
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff));
          bytes += 4;
        }
      }
    }
    bytes += this.encode(bytes * 8);
    this.update(str);
    return bytes;
  };

  Keccak.prototype.bytepad = function (strs, w) {
    var bytes = this.encode(w);
    for (var i = 0; i < strs.length; ++i) {
      bytes += this.encodeString(strs[i]);
    }
    var paddingBytes = w - bytes % w;
    var zeros = [];
    zeros.length = paddingBytes;
    this.update(zeros);
    return this;
  };

  Keccak.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];
    if (this.lastByteIndex === this.byteCount) {
      blocks[0] = blocks[blockCount];
      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }
    blocks[blockCount - 1] |= 0x80000000;
    for (i = 0; i < blockCount; ++i) {
      s[i] ^= blocks[i];
    }
    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var hex = '', block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
          HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
          HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
          HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
      }
      if (j % blockCount === 0) {
        f(s);
        i = 0;
      }
    }
    if (extraBytes) {
      block = s[i];
      hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
      if (extraBytes > 1) {
        hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
      }
      if (extraBytes > 2) {
        hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
      }
    }
    return hex;
  };

  Keccak.prototype.arrayBuffer = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var bytes = this.outputBits >> 3;
    var buffer;
    if (extraBytes) {
      buffer = new ArrayBuffer((outputBlocks + 1) << 2);
    } else {
      buffer = new ArrayBuffer(bytes);
    }
    var array = new Uint32Array(buffer);
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        array[j] = s[i];
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      array[i] = s[i];
      buffer = buffer.slice(0, bytes);
    }
    return buffer;
  };

  Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

  Keccak.prototype.digest = Keccak.prototype.array = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var array = [], offset, block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        offset = j << 2;
        block = s[i];
        array[offset] = block & 0xFF;
        array[offset + 1] = (block >> 8) & 0xFF;
        array[offset + 2] = (block >> 16) & 0xFF;
        array[offset + 3] = (block >> 24) & 0xFF;
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      offset = j << 2;
      block = s[i];
      array[offset] = block & 0xFF;
      if (extraBytes > 1) {
        array[offset + 1] = (block >> 8) & 0xFF;
      }
      if (extraBytes > 2) {
        array[offset + 2] = (block >> 16) & 0xFF;
      }
    }
    return array;
  };

  function Kmac(bits, padding, outputBits) {
    Keccak.call(this, bits, padding, outputBits);
  }

  Kmac.prototype = new Keccak();

  Kmac.prototype.finalize = function () {
    this.encode(this.outputBits, true);
    return Keccak.prototype.finalize.call(this);
  };

  var f = function (s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
      b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
      b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
      b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
    for (n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;

      b0 = s[0];
      b1 = s[1];
      b32 = (s[11] << 4) | (s[10] >>> 28);
      b33 = (s[10] << 4) | (s[11] >>> 28);
      b14 = (s[20] << 3) | (s[21] >>> 29);
      b15 = (s[21] << 3) | (s[20] >>> 29);
      b46 = (s[31] << 9) | (s[30] >>> 23);
      b47 = (s[30] << 9) | (s[31] >>> 23);
      b28 = (s[40] << 18) | (s[41] >>> 14);
      b29 = (s[41] << 18) | (s[40] >>> 14);
      b20 = (s[2] << 1) | (s[3] >>> 31);
      b21 = (s[3] << 1) | (s[2] >>> 31);
      b2 = (s[13] << 12) | (s[12] >>> 20);
      b3 = (s[12] << 12) | (s[13] >>> 20);
      b34 = (s[22] << 10) | (s[23] >>> 22);
      b35 = (s[23] << 10) | (s[22] >>> 22);
      b16 = (s[33] << 13) | (s[32] >>> 19);
      b17 = (s[32] << 13) | (s[33] >>> 19);
      b48 = (s[42] << 2) | (s[43] >>> 30);
      b49 = (s[43] << 2) | (s[42] >>> 30);
      b40 = (s[5] << 30) | (s[4] >>> 2);
      b41 = (s[4] << 30) | (s[5] >>> 2);
      b22 = (s[14] << 6) | (s[15] >>> 26);
      b23 = (s[15] << 6) | (s[14] >>> 26);
      b4 = (s[25] << 11) | (s[24] >>> 21);
      b5 = (s[24] << 11) | (s[25] >>> 21);
      b36 = (s[34] << 15) | (s[35] >>> 17);
      b37 = (s[35] << 15) | (s[34] >>> 17);
      b18 = (s[45] << 29) | (s[44] >>> 3);
      b19 = (s[44] << 29) | (s[45] >>> 3);
      b10 = (s[6] << 28) | (s[7] >>> 4);
      b11 = (s[7] << 28) | (s[6] >>> 4);
      b42 = (s[17] << 23) | (s[16] >>> 9);
      b43 = (s[16] << 23) | (s[17] >>> 9);
      b24 = (s[26] << 25) | (s[27] >>> 7);
      b25 = (s[27] << 25) | (s[26] >>> 7);
      b6 = (s[36] << 21) | (s[37] >>> 11);
      b7 = (s[37] << 21) | (s[36] >>> 11);
      b38 = (s[47] << 24) | (s[46] >>> 8);
      b39 = (s[46] << 24) | (s[47] >>> 8);
      b30 = (s[8] << 27) | (s[9] >>> 5);
      b31 = (s[9] << 27) | (s[8] >>> 5);
      b12 = (s[18] << 20) | (s[19] >>> 12);
      b13 = (s[19] << 20) | (s[18] >>> 12);
      b44 = (s[29] << 7) | (s[28] >>> 25);
      b45 = (s[28] << 7) | (s[29] >>> 25);
      b26 = (s[38] << 8) | (s[39] >>> 24);
      b27 = (s[39] << 8) | (s[38] >>> 24);
      b8 = (s[48] << 14) | (s[49] >>> 18);
      b9 = (s[49] << 14) | (s[48] >>> 18);

      s[0] = b0 ^ (~b2 & b4);
      s[1] = b1 ^ (~b3 & b5);
      s[10] = b10 ^ (~b12 & b14);
      s[11] = b11 ^ (~b13 & b15);
      s[20] = b20 ^ (~b22 & b24);
      s[21] = b21 ^ (~b23 & b25);
      s[30] = b30 ^ (~b32 & b34);
      s[31] = b31 ^ (~b33 & b35);
      s[40] = b40 ^ (~b42 & b44);
      s[41] = b41 ^ (~b43 & b45);
      s[2] = b2 ^ (~b4 & b6);
      s[3] = b3 ^ (~b5 & b7);
      s[12] = b12 ^ (~b14 & b16);
      s[13] = b13 ^ (~b15 & b17);
      s[22] = b22 ^ (~b24 & b26);
      s[23] = b23 ^ (~b25 & b27);
      s[32] = b32 ^ (~b34 & b36);
      s[33] = b33 ^ (~b35 & b37);
      s[42] = b42 ^ (~b44 & b46);
      s[43] = b43 ^ (~b45 & b47);
      s[4] = b4 ^ (~b6 & b8);
      s[5] = b5 ^ (~b7 & b9);
      s[14] = b14 ^ (~b16 & b18);
      s[15] = b15 ^ (~b17 & b19);
      s[24] = b24 ^ (~b26 & b28);
      s[25] = b25 ^ (~b27 & b29);
      s[34] = b34 ^ (~b36 & b38);
      s[35] = b35 ^ (~b37 & b39);
      s[44] = b44 ^ (~b46 & b48);
      s[45] = b45 ^ (~b47 & b49);
      s[6] = b6 ^ (~b8 & b0);
      s[7] = b7 ^ (~b9 & b1);
      s[16] = b16 ^ (~b18 & b10);
      s[17] = b17 ^ (~b19 & b11);
      s[26] = b26 ^ (~b28 & b20);
      s[27] = b27 ^ (~b29 & b21);
      s[36] = b36 ^ (~b38 & b30);
      s[37] = b37 ^ (~b39 & b31);
      s[46] = b46 ^ (~b48 & b40);
      s[47] = b47 ^ (~b49 & b41);
      s[8] = b8 ^ (~b0 & b2);
      s[9] = b9 ^ (~b1 & b3);
      s[18] = b18 ^ (~b10 & b12);
      s[19] = b19 ^ (~b11 & b13);
      s[28] = b28 ^ (~b20 & b22);
      s[29] = b29 ^ (~b21 & b23);
      s[38] = b38 ^ (~b30 & b32);
      s[39] = b39 ^ (~b31 & b33);
      s[48] = b48 ^ (~b40 & b42);
      s[49] = b49 ^ (~b41 & b43);

      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  };

  if (COMMON_JS) {
    module.exports = methods;
  } else {
    for (i = 0; i < methodNames.length; ++i) {
      root[methodNames[i]] = methods[methodNames[i]];
    }
    if (AMD) {
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
        return methods;
      }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
  }
})();


/***/ }),

/***/ 3224:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const isOptionObject = __webpack_require__(7760);

const {hasOwnProperty} = Object.prototype;
const {propertyIsEnumerable} = Object;
const defineProperty = (object, name, value) => Object.defineProperty(object, name, {
	value,
	writable: true,
	enumerable: true,
	configurable: true
});

const globalThis = this;
const defaultMergeOptions = {
	concatArrays: false,
	ignoreUndefined: false
};

const getEnumerableOwnPropertyKeys = value => {
	const keys = [];

	for (const key in value) {
		if (hasOwnProperty.call(value, key)) {
			keys.push(key);
		}
	}

	/* istanbul ignore else  */
	if (Object.getOwnPropertySymbols) {
		const symbols = Object.getOwnPropertySymbols(value);

		for (const symbol of symbols) {
			if (propertyIsEnumerable.call(value, symbol)) {
				keys.push(symbol);
			}
		}
	}

	return keys;
};

function clone(value) {
	if (Array.isArray(value)) {
		return cloneArray(value);
	}

	if (isOptionObject(value)) {
		return cloneOptionObject(value);
	}

	return value;
}

function cloneArray(array) {
	const result = array.slice(0, 0);

	getEnumerableOwnPropertyKeys(array).forEach(key => {
		defineProperty(result, key, clone(array[key]));
	});

	return result;
}

function cloneOptionObject(object) {
	const result = Object.getPrototypeOf(object) === null ? Object.create(null) : {};

	getEnumerableOwnPropertyKeys(object).forEach(key => {
		defineProperty(result, key, clone(object[key]));
	});

	return result;
}

/**
 * @param {*} merged already cloned
 * @param {*} source something to merge
 * @param {string[]} keys keys to merge
 * @param {Object} config Config Object
 * @returns {*} cloned Object
 */
const mergeKeys = (merged, source, keys, config) => {
	keys.forEach(key => {
		if (typeof source[key] === 'undefined' && config.ignoreUndefined) {
			return;
		}

		// Do not recurse into prototype chain of merged
		if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
			defineProperty(merged, key, merge(merged[key], source[key], config));
		} else {
			defineProperty(merged, key, clone(source[key]));
		}
	});

	return merged;
};

/**
 * @param {*} merged already cloned
 * @param {*} source something to merge
 * @param {Object} config Config Object
 * @returns {*} cloned Object
 *
 * see [Array.prototype.concat ( ...arguments )](http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat)
 */
const concatArrays = (merged, source, config) => {
	let result = merged.slice(0, 0);
	let resultIndex = 0;

	[merged, source].forEach(array => {
		const indices = [];

		// `result.concat(array)` with cloning
		for (let k = 0; k < array.length; k++) {
			if (!hasOwnProperty.call(array, k)) {
				continue;
			}

			indices.push(String(k));

			if (array === merged) {
				// Already cloned
				defineProperty(result, resultIndex++, array[k]);
			} else {
				defineProperty(result, resultIndex++, clone(array[k]));
			}
		}

		// Merge non-index keys
		result = mergeKeys(result, array, getEnumerableOwnPropertyKeys(array).filter(key => !indices.includes(key)), config);
	});

	return result;
};

/**
 * @param {*} merged already cloned
 * @param {*} source something to merge
 * @param {Object} config Config Object
 * @returns {*} cloned Object
 */
function merge(merged, source, config) {
	if (config.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
		return concatArrays(merged, source, config);
	}

	if (!isOptionObject(source) || !isOptionObject(merged)) {
		return clone(source);
	}

	return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), config);
}

module.exports = function (...options) {
	const config = merge(clone(defaultMergeOptions), (this !== globalThis && this) || {}, defaultMergeOptions);
	let merged = {_: {}};

	for (const option of options) {
		if (option === undefined) {
			continue;
		}

		if (!isOptionObject(option)) {
			throw new TypeError('`' + option + '` is not an Option Object');
		}

		merged = merge(merged, {_: option}, config);
	}

	return merged._;
};


/***/ }),

/***/ 8628:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 9546:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Multiaddr } = __webpack_require__(9038)

const reduceValue = (_, v) => v
const tcpUri = (str, port, parts, opts) => {
  // return tcp when explicitly requested
  if (opts && opts.assumeHttp === false) return `tcp://${str}:${port}`
  // check if tcp is the last protocol in multiaddr
  let protocol = 'tcp'
  let explicitPort = `:${port}`
  const last = parts[parts.length - 1]
  if (last.protocol === 'tcp') {
    // assume http and produce clean urls
    protocol = port === '443' ? 'https' : 'http'
    explicitPort = port === '443' || port === '80' ? '' : explicitPort
  }
  return `${protocol}://${str}${explicitPort}`
}

const Reducers = {
  ip4: reduceValue,
  ip6: (str, content, i, parts) => (
    parts.length === 1 && parts[0].protocol === 'ip6'
      ? content
      : `[${content}]`
  ),
  tcp: (str, content, i, parts, opts) => (
    parts.some(p => ['http', 'https', 'ws', 'wss'].includes(p.protocol))
      ? `${str}:${content}`
      : tcpUri(str, content, parts, opts)
  ),
  udp: (str, content) => `udp://${str}:${content}`,
  dnsaddr: reduceValue,
  dns4: reduceValue,
  dns6: reduceValue,
  ipfs: (str, content) => `${str}/ipfs/${content}`,
  p2p: (str, content) => `${str}/p2p/${content}`,
  http: str => `http://${str}`,
  https: str => `https://${str}`,
  ws: str => `ws://${str}`,
  wss: str => `wss://${str}`,
  'p2p-websocket-star': str => `${str}/p2p-websocket-star`,
  'p2p-webrtc-star': str => `${str}/p2p-webrtc-star`,
  'p2p-webrtc-direct': str => `${str}/p2p-webrtc-direct`
}

module.exports = (multiaddr, opts) => {
  const ma = new Multiaddr(multiaddr)
  const parts = multiaddr.toString().split('/').slice(1)
  return ma
    .tuples()
    .map(tuple => ({
      protocol: parts.shift(),
      content: tuple[1] ? parts.shift() : null
    }))
    .reduce((str, part, i, parts) => {
      const reduce = Reducers[part.protocol]
      if (!reduce) throw new Error(`Unsupported protocol ${part.protocol}`)
      return reduce(str, part.content, i, parts, opts)
    }, '')
}


/***/ }),

/***/ 984:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const convert = __webpack_require__(1868)
const protocols = __webpack_require__(8988)
const varint = __webpack_require__(1114)
const { concat: uint8ArrayConcat } = __webpack_require__(6729)
const { toString: uint8ArrayToString } = __webpack_require__(5824)

// export codec
module.exports = {
  stringToStringTuples,
  stringTuplesToString,

  tuplesToStringTuples,
  stringTuplesToTuples,

  bytesToTuples,
  tuplesToBytes,

  bytesToString,
  stringToBytes,

  fromString,
  fromBytes,
  validateBytes,
  isValidBytes,
  cleanPath,

  ParseError,
  protoFromTuple,

  sizeForAddr
}

// string -> [[str name, str addr]... ]
/**
 * @param {string} str
 */
function stringToStringTuples (str) {
  const tuples = []
  const parts = str.split('/').slice(1) // skip first empty elem
  if (parts.length === 1 && parts[0] === '') {
    return []
  }

  for (let p = 0; p < parts.length; p++) {
    const part = parts[p]
    const proto = protocols(part)

    if (proto.size === 0) {
      tuples.push([part])
      continue
    }

    p++ // advance addr part
    if (p >= parts.length) {
      throw ParseError('invalid address: ' + str)
    }

    // if it's a path proto, take the rest
    if (proto.path) {
      tuples.push([
        part,
        // TODO: should we need to check each path part to see if it's a proto?
        // This would allow for other protocols to be added after a unix path,
        // however it would have issues if the path had a protocol name in the path
        cleanPath(parts.slice(p).join('/'))
      ])
      break
    }

    tuples.push([part, parts[p]])
  }

  return tuples
}

// [[str name, str addr]... ] -> string
/**
 * @param {[number, string?][]} tuples
 */
function stringTuplesToString (tuples) {
  /** @type {Array<string | undefined>} */
  const parts = []
  tuples.map((tup) => {
    const proto = protoFromTuple(tup)
    parts.push(proto.name)
    if (tup.length > 1) {
      parts.push(tup[1])
    }
    return null
  })

  return cleanPath(parts.join('/'))
}

// [[str name, str addr]... ] -> [[int code, Uint8Array]... ]
/**
 * @param {Array<string[] | string >} tuples
 * @returns {[number , Uint8Array?][]}
 */
function stringTuplesToTuples (tuples) {
  return tuples.map((tup) => {
    if (!Array.isArray(tup)) {
      tup = [tup]
    }
    const proto = protoFromTuple(tup)
    if (tup.length > 1) {
      return [proto.code, convert.toBytes(proto.code, tup[1])]
    }
    return [proto.code]
  })
}

/**
 * Convert tuples to string tuples
 *
 * [[int code, Uint8Array]... ] -> [[int code, str addr]... ]
 *
 * @param {Array<[number, Uint8Array?]>} tuples
 * @returns {Array<[number, string?]>}
 */

function tuplesToStringTuples (tuples) {
  return tuples.map(tup => {
    const proto = protoFromTuple(tup)
    if (tup[1]) {
      return [proto.code, convert.toString(proto.code, tup[1])]
    }
    return [proto.code]
  })
}

// [[int code, Uint8Array ]... ] -> Uint8Array
/**
 * @param {[number, Uint8Array?][]} tuples
 */
function tuplesToBytes (tuples) {
  return fromBytes(uint8ArrayConcat(tuples.map((/** @type {any[]} */ tup) => {
    const proto = protoFromTuple(tup)
    let buf = Uint8Array.from(varint.encode(proto.code))

    if (tup.length > 1) {
      buf = uint8ArrayConcat([buf, tup[1]]) // add address buffer
    }

    return buf
  })))
}

/**
 * @param {import("./types").Protocol} p
 * @param {Uint8Array | number[]} addr
 */
function sizeForAddr (p, addr) {
  if (p.size > 0) {
    return p.size / 8
  } else if (p.size === 0) {
    return 0
  } else {
    const size = varint.decode(addr)
    return size + varint.decode.bytes
  }
}

/**
 *
 * @param {Uint8Array} buf
 * @returns {Array<[number, Uint8Array?]>}
 */
function bytesToTuples (buf) {
  /** @type {Array<[number, Uint8Array?]>} */
  const tuples = []
  let i = 0
  while (i < buf.length) {
    const code = varint.decode(buf, i)
    const n = varint.decode.bytes

    const p = protocols(code)

    const size = sizeForAddr(p, buf.slice(i + n))

    if (size === 0) {
      tuples.push([code])
      i += n
      continue
    }

    const addr = buf.slice(i + n, i + n + size)

    i += (size + n)

    if (i > buf.length) { // did not end _exactly_ at buffer.length
      throw ParseError('Invalid address Uint8Array: ' + uint8ArrayToString(buf, 'base16'))
    }

    // ok, tuple seems good.
    tuples.push([code, addr])
  }

  return tuples
}

// Uint8Array -> String
/**
 * @param {Uint8Array} buf
 */
function bytesToString (buf) {
  const a = bytesToTuples(buf)
  const b = tuplesToStringTuples(a)
  return stringTuplesToString(b)
}

// String -> Uint8Array
/**
 * @param {string} str
 */
function stringToBytes (str) {
  str = cleanPath(str)
  const a = stringToStringTuples(str)
  const b = stringTuplesToTuples(a)

  return tuplesToBytes(b)
}

// String -> Uint8Array
/**
 * @param {string} str
 */
function fromString (str) {
  return stringToBytes(str)
}

// Uint8Array -> Uint8Array
/**
 * @param {Uint8Array} buf
 */
function fromBytes (buf) {
  const err = validateBytes(buf)
  if (err) throw err
  return Uint8Array.from(buf) // copy
}

/**
 * @param {Uint8Array} buf
 */
function validateBytes (buf) {
  try {
    bytesToTuples(buf) // try to parse. will throw if breaks
  } catch (err) {
    return err
  }
}

/**
 * @param {Uint8Array} buf
 */
function isValidBytes (buf) {
  return validateBytes(buf) === undefined
}

/**
 * @param {string} str
 */
function cleanPath (str) {
  return '/' + str.trim().split('/').filter((/** @type {any} */ a) => a).join('/')
}

/**
 * @param {string} str
 */
function ParseError (str) {
  return new Error('Error parsing address: ' + str)
}

/**
 * @param {any[]} tup
 */
function protoFromTuple (tup) {
  const proto = protocols(tup[0])
  return proto
}


/***/ }),

/***/ 1868:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const ip = __webpack_require__(8373)
const protocols = __webpack_require__(8988)
const { CID } = __webpack_require__(3036)
const { base32 } = __webpack_require__(4052)
const { base58btc } = __webpack_require__(4749)
const Digest = __webpack_require__(9122)
const varint = __webpack_require__(1114)
const { toString: uint8ArrayToString } = __webpack_require__(5824)
const { fromString: uint8ArrayFromString } = __webpack_require__(4081)
const { concat: uint8ArrayConcat } = __webpack_require__(6729)

module.exports = Convert

// converts (serializes) addresses
/**
 * @param {string} proto
 * @param {string | Uint8Array} a
 */
function Convert (proto, a) {
  if (a instanceof Uint8Array) {
    return Convert.toString(proto, a)
  } else {
    return Convert.toBytes(proto, a)
  }
}

/**
 * Convert [code,Uint8Array] to string
 *
 * @param {number|string} proto
 * @param {Uint8Array} buf
 * @returns {string}
 */
Convert.toString = function convertToString (proto, buf) {
  const protocol = protocols(proto)
  switch (protocol.code) {
    case 4: // ipv4
    case 41: // ipv6
      return bytes2ip(buf)

    case 6: // tcp
    case 273: // udp
    case 33: // dccp
    case 132: // sctp
      return bytes2port(buf).toString()

    case 53: // dns
    case 54: // dns4
    case 55: // dns6
    case 56: // dnsaddr
    case 400: // unix
    case 777: // memory
      return bytes2str(buf)

    case 421: // ipfs
      return bytes2mh(buf)
    case 444: // onion
      return bytes2onion(buf)
    case 445: // onion3
      return bytes2onion(buf)
    default:
      return uint8ArrayToString(buf, 'base16') // no clue. convert to hex
  }
}

Convert.toBytes = function convertToBytes (/** @type {string | number } */ proto, /** @type {string} */ str) {
  const protocol = protocols(proto)
  switch (protocol.code) {
    case 4: // ipv4
      return ip2bytes(str)
    case 41: // ipv6
      return ip2bytes(str)

    case 6: // tcp
    case 273: // udp
    case 33: // dccp
    case 132: // sctp
      return port2bytes(parseInt(str, 10))

    case 53: // dns
    case 54: // dns4
    case 55: // dns6
    case 56: // dnsaddr
    case 400: // unix
    case 777: // memory
      return str2bytes(str)

    case 421: // ipfs
      return mh2bytes(str)
    case 444: // onion
      return onion2bytes(str)
    case 445: // onion3
      return onion32bytes(str)
    default:
      return uint8ArrayFromString(str, 'base16') // no clue. convert from hex
  }
}

/**
 * @param {string} ipString
 */
function ip2bytes (ipString) {
  if (!ip.isIP(ipString)) {
    throw new Error('invalid ip address')
  }
  return ip.toBytes(ipString)
}

/**
 * @param {Uint8Array} ipBuff
 */
function bytes2ip (ipBuff) {
  const ipString = ip.toString(ipBuff)
  if (!ipString || !ip.isIP(ipString)) {
    throw new Error('invalid ip address')
  }
  return ipString
}

/**
 * @param {number} port
 */
function port2bytes (port) {
  const buf = new ArrayBuffer(2)
  const view = new DataView(buf)
  view.setUint16(0, port)

  return new Uint8Array(buf)
}

/**
 * @param {Uint8Array} buf
 */
function bytes2port (buf) {
  const view = new DataView(buf.buffer)
  return view.getUint16(buf.byteOffset)
}

/**
 * @param {string} str
 */
function str2bytes (str) {
  const buf = uint8ArrayFromString(str)
  const size = Uint8Array.from(varint.encode(buf.length))
  return uint8ArrayConcat([size, buf], size.length + buf.length)
}

/**
 * @param {Uint8Array} buf
 */
function bytes2str (buf) {
  const size = varint.decode(buf)
  buf = buf.slice(varint.decode.bytes)

  if (buf.length !== size) {
    throw new Error('inconsistent lengths')
  }

  return uint8ArrayToString(buf)
}

/**
 * @param {string} hash - base58btc string
 */
function mh2bytes (hash) {
  let mh

  if (hash[0] === 'Q' || hash[0] === '1') {
    mh = Digest.decode(base58btc.decode(`z${hash}`)).bytes
  } else {
    mh = CID.parse(hash).multihash.bytes
  }

  // the address is a varint prefixed multihash string representation
  const size = Uint8Array.from(varint.encode(mh.length))
  return uint8ArrayConcat([size, mh], size.length + mh.length)
}

/**
 * Converts bytes to bas58btc string
 *
 * @param {Uint8Array} buf
 * @returns {string} base58btc string
 */
function bytes2mh (buf) {
  const size = varint.decode(buf)
  const address = buf.slice(varint.decode.bytes)

  if (address.length !== size) {
    throw new Error('inconsistent lengths')
  }

  return uint8ArrayToString(address, 'base58btc')
}

/**
 * @param {string} str
 */
function onion2bytes (str) {
  const addr = str.split(':')
  if (addr.length !== 2) {
    throw new Error('failed to parse onion addr: ' + addr + ' does not contain a port number')
  }
  if (addr[0].length !== 16) {
    throw new Error('failed to parse onion addr: ' + addr[0] + ' not a Tor onion address.')
  }

  // onion addresses do not include the multibase prefix, add it before decoding
  const buf = base32.decode('b' + addr[0])

  // onion port number
  const port = parseInt(addr[1], 10)
  if (port < 1 || port > 65536) {
    throw new Error('Port number is not in range(1, 65536)')
  }
  const portBuf = port2bytes(port)
  return uint8ArrayConcat([buf, portBuf], buf.length + portBuf.length)
}

/**
 * @param {string} str
 */
function onion32bytes (str) {
  const addr = str.split(':')
  if (addr.length !== 2) {
    throw new Error('failed to parse onion addr: ' + addr + ' does not contain a port number')
  }
  if (addr[0].length !== 56) {
    throw new Error('failed to parse onion addr: ' + addr[0] + ' not a Tor onion3 address.')
  }
  // onion addresses do not include the multibase prefix, add it before decoding
  const buf = base32.decode('b' + addr[0])

  // onion port number
  const port = parseInt(addr[1], 10)
  if (port < 1 || port > 65536) {
    throw new Error('Port number is not in range(1, 65536)')
  }
  const portBuf = port2bytes(port)
  return uint8ArrayConcat([buf, portBuf], buf.length + portBuf.length)
}

/**
 * @param {Uint8Array} buf
 */
function bytes2onion (buf) {
  const addrBytes = buf.slice(0, buf.length - 2)
  const portBytes = buf.slice(buf.length - 2)
  const addr = uint8ArrayToString(addrBytes, 'base32')
  const port = bytes2port(portBytes)
  return addr + ':' + port
}


/***/ }),

/***/ 9038:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const codec = __webpack_require__(984)
const protocols = __webpack_require__(8988)
const varint = __webpack_require__(1114)
const { CID } = __webpack_require__(3036)
const { base58btc } = __webpack_require__(4749)
const errCode = __webpack_require__(118)
const inspect = Symbol.for('nodejs.util.inspect.custom')
const { toString: uint8ArrayToString } = __webpack_require__(5824)
const { equals: uint8ArrayEquals } = __webpack_require__(5732)

/**
 * @typedef {(addr: Multiaddr) => Promise<string[]>} Resolver
 * @typedef {string | Multiaddr | Uint8Array | null} MultiaddrInput
 * @typedef {import('./types').MultiaddrObject} MultiaddrObject
 * @typedef {import('./types').Protocol} Protocol
 */

/** @type {Map<string, Resolver>} */
const resolvers = new Map()
const symbol = Symbol.for('@multiformats/js-multiaddr/multiaddr')

/**
 * Creates a [multiaddr](https://github.com/multiformats/multiaddr) from
 * a Uint8Array, String or another Multiaddr instance
 * public key.
 *
 */
class Multiaddr {
  /**
   * @example
   * ```js
   * new Multiaddr('/ip4/127.0.0.1/tcp/4001')
   * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
   * ```
   *
   * @param {MultiaddrInput} [addr] - If String or Uint8Array, needs to adhere to the address format of a [multiaddr](https://github.com/multiformats/multiaddr#string-format)
   */
  constructor (addr) {
    // default
    if (addr == null) {
      addr = ''
    }

    // Define symbol
    Object.defineProperty(this, symbol, { value: true })

    if (addr instanceof Uint8Array) {
      /** @type {Uint8Array} - The raw bytes representing this multiaddress */
      this.bytes = codec.fromBytes(addr)
    } else if (typeof addr === 'string') {
      if (addr.length > 0 && addr.charAt(0) !== '/') {
        throw new Error(`multiaddr "${addr}" must start with a "/"`)
      }
      this.bytes = codec.fromString(addr)
    } else if (Multiaddr.isMultiaddr(addr)) { // Multiaddr
      this.bytes = codec.fromBytes(addr.bytes) // validate + copy buffer
    } else {
      throw new Error('addr must be a string, Buffer, or another Multiaddr')
    }
  }

  /**
   * Returns Multiaddr as a String
   *
   * @example
   * ```js
   * new Multiaddr('/ip4/127.0.0.1/tcp/4001').toString()
   * // '/ip4/127.0.0.1/tcp/4001'
   * ```
   */
  toString () {
    return codec.bytesToString(this.bytes)
  }

  /**
   * Returns Multiaddr as a JSON encoded object
   *
   * @example
   * ```js
   * JSON.stringify(new Multiaddr('/ip4/127.0.0.1/tcp/4001'))
   * // '/ip4/127.0.0.1/tcp/4001'
   * ```
   */
  toJSON () {
    return this.toString()
  }

  /**
   * Returns Multiaddr as a convinient options object to be used with net.createConnection
   *
   * @example
   * ```js
   * new Multiaddr('/ip4/127.0.0.1/tcp/4001').toOptions()
   * // { family: 4, host: '127.0.0.1', transport: 'tcp', port: 4001 }
   * ```
   */
  toOptions () {
    /** @type {MultiaddrObject} */
    const opts = {}
    const parsed = this.toString().split('/')
    opts.family = parsed[1] === 'ip4' ? 4 : 6
    opts.host = parsed[2]
    opts.transport = parsed[3]
    opts.port = parseInt(parsed[4])
    return opts
  }

  /**
   * Returns the protocols the Multiaddr is defined with, as an array of objects, in
   * left-to-right order. Each object contains the protocol code, protocol name,
   * and the size of its address space in bits.
   * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
   *
   * @example
   * ```js
   * new Multiaddr('/ip4/127.0.0.1/tcp/4001').protos()
   * // [ { code: 4, size: 32, name: 'ip4' },
   * //   { code: 6, size: 16, name: 'tcp' } ]
   * ```
   *
   * @returns {Protocol[]} protocols - All the protocols the address is composed of
   */
  protos () {
    return this.protoCodes().map(code => Object.assign({}, protocols(code)))
  }

  /**
   * Returns the codes of the protocols in left-to-right order.
   * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
   *
   * @example
   * ```js
   * Multiaddr('/ip4/127.0.0.1/tcp/4001').protoCodes()
   * // [ 4, 6 ]
   * ```
   *
   * @returns {number[]} protocol codes
   */
  protoCodes () {
    const codes = []
    const buf = this.bytes
    let i = 0
    while (i < buf.length) {
      const code = varint.decode(buf, i)
      const n = varint.decode.bytes

      const p = protocols(code)
      const size = codec.sizeForAddr(p, buf.slice(i + n))

      i += (size + n)
      codes.push(code)
    }

    return codes
  }

  /**
   * Returns the names of the protocols in left-to-right order.
   * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
   *
   * @example
   * ```js
   * new Multiaddr('/ip4/127.0.0.1/tcp/4001').protoNames()
   * // [ 'ip4', 'tcp' ]
   * ```
   *
   * @returns {string[]} protocol names
   */
  protoNames () {
    return this.protos().map(proto => proto.name)
  }

  /**
   * Returns a tuple of parts
   *
   * @example
   * ```js
   * new Multiaddr("/ip4/127.0.0.1/tcp/4001").tuples()
   * // [ [ 4, <Buffer 7f 00 00 01> ], [ 6, <Buffer 0f a1> ] ]
   * ```
   */
  tuples () {
    return codec.bytesToTuples(this.bytes)
  }

  /**
   * Returns a tuple of string/number parts
   * - tuples[][0] = code of protocol
   * - tuples[][1] = contents of address
   *
   * @example
   * ```js
   * new Multiaddr("/ip4/127.0.0.1/tcp/4001").stringTuples()
   * // [ [ 4, '127.0.0.1' ], [ 6, '4001' ] ]
   * ```
   */
  stringTuples () {
    const t = codec.bytesToTuples(this.bytes)
    return codec.tuplesToStringTuples(t)
  }

  /**
   * Encapsulates a Multiaddr in another Multiaddr
   *
   * @example
   * ```js
   * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080')
   * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
   *
   * const mh2 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
   * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
   *
   * const mh3 = mh1.encapsulate(mh2)
   * // <Multiaddr 0408080808060438047f000001060fa1 - /ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001>
   *
   * mh3.toString()
   * // '/ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001'
   * ```
   *
   * @param {MultiaddrInput} addr - Multiaddr to add into this Multiaddr
   */
  encapsulate (addr) {
    addr = new Multiaddr(addr)
    return new Multiaddr(this.toString() + addr.toString())
  }

  /**
   * Decapsulates a Multiaddr from another Multiaddr
   *
   * @example
   * ```js
   * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080')
   * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
   *
   * const mh2 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
   * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
   *
   * const mh3 = mh1.encapsulate(mh2)
   * // <Multiaddr 0408080808060438047f000001060fa1 - /ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001>
   *
   * mh3.decapsulate(mh2).toString()
   * // '/ip4/8.8.8.8/tcp/1080'
   * ```
   *
   * @param {Multiaddr | string} addr - Multiaddr to remove from this Multiaddr
   * @returns {Multiaddr}
   */
  decapsulate (addr) {
    const addrString = addr.toString()
    const s = this.toString()
    const i = s.lastIndexOf(addrString)
    if (i < 0) {
      throw new Error('Address ' + this + ' does not contain subaddress: ' + addr)
    }
    return new Multiaddr(s.slice(0, i))
  }

  /**
   * A more reliable version of `decapsulate` if you are targeting a
   * specific code, such as 421 (the `p2p` protocol code). The last index of the code
   * will be removed from the `Multiaddr`, and a new instance will be returned.
   * If the code is not present, the original `Multiaddr` is returned.
   *
   * @example
   * ```js
   * const addr = new Multiaddr('/ip4/0.0.0.0/tcp/8080/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC')
   * // <Multiaddr 0400... - /ip4/0.0.0.0/tcp/8080/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC>
   *
   * addr.decapsulateCode(421).toString()
   * // '/ip4/0.0.0.0/tcp/8080'
   *
   * new Multiaddr('/ip4/127.0.0.1/tcp/8080').decapsulateCode(421).toString()
   * // '/ip4/127.0.0.1/tcp/8080'
   * ```
   *
   * @param {number} code - The code of the protocol to decapsulate from this Multiaddr
   * @returns {Multiaddr}
   */
  decapsulateCode (code) {
    const tuples = this.tuples()
    for (let i = tuples.length - 1; i >= 0; i--) {
      if (tuples[i][0] === code) {
        return new Multiaddr(codec.tuplesToBytes(tuples.slice(0, i)))
      }
    }
    return this
  }

  /**
   * Extract the peerId if the multiaddr contains one
   *
   * @example
   * ```js
   * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080/ipfs/QmValidBase58string')
   * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080/ipfs/QmValidBase58string>
   *
   * // should return QmValidBase58string or null if the id is missing or invalid
   * const peerId = mh1.getPeerId()
   * ```
   *
   * @returns {string | null} peerId - The id of the peer or null if invalid or missing from the ma
   */
  getPeerId () {
    try {
      const tuples = this.stringTuples().filter((tuple) => {
        if (tuple[0] === protocols.names.ipfs.code) {
          return true
        }
        return false
      })

      // Get the last ipfs tuple ['ipfs', 'peerid string']
      const tuple = tuples.pop()
      if (tuple && tuple[1]) {
        const peerIdStr = tuple[1]

        // peer id is base58btc encoded string but not multibase encoded so add the `z`
        // prefix so we can validate that it is correctly encoded
        if (peerIdStr[0] === 'Q' || peerIdStr[0] === '1') {
          return uint8ArrayToString(base58btc.decode(`z${peerIdStr}`), 'base58btc')
        }

        // try to parse peer id as CID
        return uint8ArrayToString(CID.parse(peerIdStr).multihash.bytes, 'base58btc')
      }

      return null
    } catch (e) {
      return null
    }
  }

  /**
   * Extract the path if the multiaddr contains one
   *
   * @example
   * ```js
   * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080/unix/tmp/p2p.sock')
   * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080/unix/tmp/p2p.sock>
   *
   * // should return utf8 string or null if the id is missing or invalid
   * const path = mh1.getPath()
   * ```js
   *
   * @returns {string | null} path - The path of the multiaddr, or null if no path protocol is present
   */
  getPath () {
    let path = null
    try {
      path = this.stringTuples().filter((tuple) => {
        const proto = protocols(tuple[0])
        if (proto.path) {
          return true
        }
        return false
      })[0][1]

      if (!path) {
        path = null
      }
    } catch (e) {
      path = null
    }
    return path
  }

  /**
   * Checks if two Multiaddrs are the same
   *
   * @example
   * ```js
   * const mh1 = new Multiaddr('/ip4/8.8.8.8/tcp/1080')
   * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
   *
   * const mh2 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
   * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
   *
   * mh1.equals(mh1)
   * // true
   *
   * mh1.equals(mh2)
   * // false
   * ```
   *
   * @param {Multiaddr} addr
   * @returns {boolean}
   */
  equals (addr) {
    return uint8ArrayEquals(this.bytes, addr.bytes)
  }

  /**
   * Resolve multiaddr if containing resolvable hostname.
   *
   * @example
   * ```js
   * Multiaddr.resolvers.set('dnsaddr', resolverFunction)
   * const mh1 = new Multiaddr('/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb')
   * const resolvedMultiaddrs = await mh1.resolve()
   * // [
   * //   <Multiaddr 04934b5353060fa1a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/tcp/4001/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>,
   * //   <Multiaddr 04934b53530601bbde03a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/tcp/443/wss/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>,
   * //   <Multiaddr 04934b535391020fa1cc03a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/udp/4001/quic/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>
   * // ]
   * ```
   *
   * @returns {Promise<Array<Multiaddr>>}
   */
  async resolve () {
    const resolvableProto = this.protos().find((p) => p.resolvable)

    // Multiaddr is not resolvable?
    if (!resolvableProto) {
      return [this]
    }

    const resolver = resolvers.get(resolvableProto.name)
    if (!resolver) {
      throw errCode(new Error(`no available resolver for ${resolvableProto.name}`), 'ERR_NO_AVAILABLE_RESOLVER')
    }

    const addresses = await resolver(this)
    return addresses.map((a) => new Multiaddr(a))
  }

  /**
   * Gets a Multiaddrs node-friendly address object. Note that protocol information
   * is left out: in Node (and most network systems) the protocol is unknowable
   * given only the address.
   *
   * Has to be a ThinWaist Address, otherwise throws error
   *
   * @example
   * ```js
   * new Multiaddr('/ip4/127.0.0.1/tcp/4001').nodeAddress()
   * // {family: 4, address: '127.0.0.1', port: 4001}
   * ```
   *
   * @returns {{family: 4 | 6, address: string, port: number}}
   * @throws {Error} Throws error if Multiaddr is not a Thin Waist address
   */
  nodeAddress () {
    const codes = this.protoCodes()
    const names = this.protoNames()
    const parts = this.toString().split('/').slice(1)

    if (parts.length < 4) {
      throw new Error('multiaddr must have a valid format: "/{ip4, ip6, dns4, dns6}/{address}/{tcp, udp}/{port}".')
    } else if (codes[0] !== 4 && codes[0] !== 41 && codes[0] !== 54 && codes[0] !== 55) {
      throw new Error(`no protocol with name: "'${names[0]}'". Must have a valid family name: "{ip4, ip6, dns4, dns6}".`)
    } else if (parts[2] !== 'tcp' && parts[2] !== 'udp') {
      throw new Error(`no protocol with name: "'${names[1]}'". Must have a valid transport protocol: "{tcp, udp}".`)
    }

    return {
      family: (codes[0] === 41 || codes[0] === 55) ? 6 : 4,
      address: parts[1],
      port: parseInt(parts[3]) // tcp or udp port
    }
  }

  /**
   * Returns if a Multiaddr is a Thin Waist address or not.
   *
   * Thin Waist is if a Multiaddr adheres to the standard combination of:
   *
   * `{IPv4, IPv6}/{TCP, UDP}`
   *
   * @example
   * ```js
   * const mh1 = new Multiaddr('/ip4/127.0.0.1/tcp/4001')
   * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
   * const mh2 = new Multiaddr('/ip4/192.168.2.1/tcp/5001')
   * // <Multiaddr 04c0a80201061389 - /ip4/192.168.2.1/tcp/5001>
   * const mh3 = mh1.encapsulate(mh2)
   * // <Multiaddr 047f000001060fa104c0a80201061389 - /ip4/127.0.0.1/tcp/4001/ip4/192.168.2.1/tcp/5001>
   * const mh4 = new Multiaddr('/ip4/127.0.0.1/tcp/2000/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')
   * // <Multiaddr 047f0000010607d0de039302a503221220d52ebb89d85b02a284948203a62ff28389c57c9f42beec4ec20db76a64835843 - /ip4/127.0.0.1/tcp/2000/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a>
   * mh1.isThinWaistAddress()
   * // true
   * mh2.isThinWaistAddress()
   * // true
   * mh3.isThinWaistAddress()
   * // false
   * mh4.isThinWaistAddress()
   * // false
   * ```
   *
   * @param {Multiaddr} [addr] - Defaults to using `this` instance
   */
  isThinWaistAddress (addr) {
    const protos = (addr || this).protos()

    if (protos.length !== 2) {
      return false
    }

    if (protos[0].code !== 4 && protos[0].code !== 41) {
      return false
    }
    if (protos[1].code !== 6 && protos[1].code !== 273) {
      return false
    }
    return true
  }

  /**
   * Creates a Multiaddr from a node-friendly address object
   *
   * @example
   * ```js
   * Multiaddr.fromNodeAddress({address: '127.0.0.1', port: '4001'}, 'tcp')
   * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
   * ```
   *
   * @param {{family: 4 | 6, address: string, port: number}} addr
   * @param {string} transport
   */
  static fromNodeAddress (addr, transport) {
    if (!addr) { throw new Error('requires node address object') }
    if (!transport) { throw new Error('requires transport protocol') }
    let ip
    switch (addr.family) {
      case 4:
        ip = 'ip4'
        break
      case 6:
        ip = 'ip6'
        break
      default:
        throw Error(`Invalid addr family. Got '${addr.family}' instead of 4 or 6`)
    }
    return new Multiaddr('/' + [ip, addr.address, transport, addr.port].join('/'))
  }

  /**
   * Returns if something is a Multiaddr that is a name
   *
   * @param {Multiaddr} addr
   * @returns {boolean} isName
   */
  static isName (addr) {
    if (!Multiaddr.isMultiaddr(addr)) {
      return false
    }

    // if a part of the multiaddr is resolvable, then return true
    return addr.protos().some((proto) => proto.resolvable)
  }

  /**
   * Check if object is a CID instance
   *
   * @param {any} value
   * @returns {value is Multiaddr}
   */
  static isMultiaddr (value) {
    return value instanceof Multiaddr || Boolean(value && value[symbol])
  }

  /**
   * Returns Multiaddr as a human-readable string.
   * For post Node.js v10.0.0.
   * https://nodejs.org/api/deprecations.html#deprecations_dep0079_custom_inspection_function_on_objects_via_inspect
   *
   * @example
   * ```js
   * console.log(new Multiaddr('/ip4/127.0.0.1/tcp/4001'))
   * // '<Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>'
   * ```
   *
   * @returns {string}
   */
  [inspect] () {
    return '<Multiaddr ' +
    uint8ArrayToString(this.bytes, 'base16') + ' - ' +
    codec.bytesToString(this.bytes) + '>'
  }

  /**
   * Returns Multiaddr as a human-readable string.
   * Fallback for pre Node.js v10.0.0.
   * https://nodejs.org/api/deprecations.html#deprecations_dep0079_custom_inspection_function_on_objects_via_inspect
   *
   * @example
   * ```js
   * new Multiaddr('/ip4/127.0.0.1/tcp/4001').inspect()
   * // '<Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>'
   * ```
   *
   * @returns {string}
   */
  inspect () {
    return '<Multiaddr ' +
      uint8ArrayToString(this.bytes, 'base16') + ' - ' +
      codec.bytesToString(this.bytes) + '>'
  }
}

/**
 * Object containing table, names and codes of all supported protocols.
 * To get the protocol values from a Multiaddr, you can use
 * [`.protos()`](#multiaddrprotos),
 * [`.protoCodes()`](#multiaddrprotocodes) or
 * [`.protoNames()`](#multiaddrprotonames)
 *
 * @returns {{table: Array, names: Object, codes: Object}}
 */
Multiaddr.protocols = protocols

Multiaddr.resolvers = resolvers

/**
 * Static factory
 *
 * @param {MultiaddrInput} addr
 */
function multiaddr (addr) {
  return new Multiaddr(addr)
}

module.exports = { Multiaddr, multiaddr, protocols, resolvers }


/***/ }),

/***/ 8373:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const isIp = __webpack_require__(2478)
const { toString: uint8ArrayToString } = __webpack_require__(5824)

const isIP = isIp
const isV4 = isIp.v4
const isV6 = isIp.v6

// Copied from https://github.com/indutny/node-ip/blob/master/lib/ip.js#L7
// @ts-ignore - this is copied from the link above better to keep it the same
const toBytes = function (ip, buff, offset) {
  offset = ~~offset

  let result

  if (isV4(ip)) {
    result = buff || new Uint8Array(offset + 4)
    // @ts-ignore
    // eslint-disable-next-line array-callback-return
    ip.split(/\./g).map(function (byte) {
      result[offset++] = parseInt(byte, 10) & 0xff
    })
  } else if (isV6(ip)) {
    const sections = ip.split(':', 8)

    let i
    for (i = 0; i < sections.length; i++) {
      const isv4 = isV4(sections[i])
      let v4Buffer

      if (isv4) {
        v4Buffer = toBytes(sections[i])
        sections[i] = uint8ArrayToString(v4Buffer.slice(0, 2), 'base16')
      }

      if (v4Buffer && ++i < 8) {
        sections.splice(i, 0, uint8ArrayToString(v4Buffer.slice(2, 4), 'base16'))
      }
    }

    if (sections[0] === '') {
      while (sections.length < 8) sections.unshift('0')
    } else if (sections[sections.length - 1] === '') {
      while (sections.length < 8) sections.push('0')
    } else if (sections.length < 8) {
      for (i = 0; i < sections.length && sections[i] !== ''; i++);
      const argv = [i, '1']
      for (i = 9 - sections.length; i > 0; i--) {
        argv.push('0')
      }
      sections.splice.apply(sections, argv)
    }

    result = buff || new Uint8Array(offset + 16)
    for (i = 0; i < sections.length; i++) {
      const word = parseInt(sections[i], 16)
      result[offset++] = (word >> 8) & 0xff
      result[offset++] = word & 0xff
    }
  }

  if (!result) {
    throw Error('Invalid ip address: ' + ip)
  }

  return result
}

// Copied from https://github.com/indutny/node-ip/blob/master/lib/ip.js#L63
// @ts-ignore - this is copied from the link above better to keep it the same
const toString = function (buff, offset, length) {
  offset = ~~offset
  length = length || (buff.length - offset)

  const result = []
  let string
  const view = new DataView(buff.buffer)
  if (length === 4) {
    // IPv4
    for (let i = 0; i < length; i++) {
      result.push(buff[offset + i])
    }
    string = result.join('.')
  } else if (length === 16) {
    // IPv6
    for (let i = 0; i < length; i += 2) {
      result.push(view.getUint16(offset + i).toString(16))
    }
    string = result.join(':')
    string = string.replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
    string = string.replace(/:{3,4}/, '::')
  }

  return string
}

module.exports = {
  isIP,
  isV4,
  isV6,
  toBytes,
  toString
}


/***/ }),

/***/ 8988:
/***/ ((module) => {

"use strict";

/** @typedef {import("./types").Protocol} Protocol */

/**
 * Protocols
 *
 * @param {number | string} proto
 * @returns {Protocol}
 */
function Protocols (proto) {
  if (typeof (proto) === 'number') {
    if (Protocols.codes[proto]) {
      return Protocols.codes[proto]
    }

    throw new Error('no protocol with code: ' + proto)
  } else if (typeof (proto) === 'string') {
    if (Protocols.names[proto]) {
      return Protocols.names[proto]
    }

    throw new Error('no protocol with name: ' + proto)
  }

  throw new Error('invalid protocol id type: ' + proto)
}

const V = -1
Protocols.lengthPrefixedVarSize = V
Protocols.V = V

/** @type {Array<[number, number, string, (string|boolean)?, string?]>} */
Protocols.table = [
  [4, 32, 'ip4'],
  [6, 16, 'tcp'],
  [33, 16, 'dccp'],
  [41, 128, 'ip6'],
  [42, V, 'ip6zone'],
  [53, V, 'dns', 'resolvable'],
  [54, V, 'dns4', 'resolvable'],
  [55, V, 'dns6', 'resolvable'],
  [56, V, 'dnsaddr', 'resolvable'],
  [132, 16, 'sctp'],
  [273, 16, 'udp'],
  [275, 0, 'p2p-webrtc-star'],
  [276, 0, 'p2p-webrtc-direct'],
  [277, 0, 'p2p-stardust'],
  [290, 0, 'p2p-circuit'],
  [301, 0, 'udt'],
  [302, 0, 'utp'],
  [400, V, 'unix', false, 'path'],
  // `ipfs` is added before `p2p` for legacy support.
  // All text representations will default to `p2p`, but `ipfs` will
  // still be supported
  [421, V, 'ipfs'],
  // `p2p` is the preferred name for 421, and is now the default
  [421, V, 'p2p'],
  [443, 0, 'https'],
  [444, 96, 'onion'],
  [445, 296, 'onion3'],
  [446, V, 'garlic64'],
  [460, 0, 'quic'],
  [477, 0, 'ws'],
  [478, 0, 'wss'],
  [479, 0, 'p2p-websocket-star'],
  [480, 0, 'http'],
  [777, V, 'memory']
]
/** @type {Record<string,Protocol>} */
Protocols.names = {}
/** @type {Record<number,Protocol>} */
Protocols.codes = {}

// populate tables
Protocols.table.map(row => {
  const proto = p.apply(null, row)
  Protocols.codes[proto.code] = proto
  Protocols.names[proto.name] = proto
  return null
})

Protocols.object = p

/**
 *
 * Create a protocol
 *
 * @param {number} code
 * @param {number} size
 * @param {string} name
 * @param {any} [resolvable]
 * @param {any} [path]
 * @returns {Protocol}
 */
function p (code, size, name, resolvable, path) {
  return {
    code,
    size,
    name,
    resolvable: Boolean(resolvable),
    path: Boolean(path)
  }
}

module.exports = Protocols


/***/ }),

/***/ 6487:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (globalThis.fetch && globalThis.Headers && globalThis.Request && globalThis.Response) {
  module.exports = {
    default: globalThis.fetch,
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response
  }
} else {
  module.exports = {
    default: (__webpack_require__(759)["default"]),
    Headers: (__webpack_require__(759).Headers),
    Request: (__webpack_require__(759).Request),
    Response: (__webpack_require__(759).Response)
  }
}


/***/ }),

/***/ 759:
/***/ ((module, exports) => {

"use strict";


// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports["default"] = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;

/***/ }),

/***/ 3967:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// minimal library entry point.


module.exports = __webpack_require__(4365);


/***/ }),

/***/ 4365:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var protobuf = exports;

/**
 * Build type, one of `"full"`, `"light"` or `"minimal"`.
 * @name build
 * @type {string}
 * @const
 */
protobuf.build = "minimal";

// Serialization
protobuf.Writer       = __webpack_require__(2147);
protobuf.BufferWriter = __webpack_require__(5055);
protobuf.Reader       = __webpack_require__(2074);
protobuf.BufferReader = __webpack_require__(69);

// Utility
protobuf.util         = __webpack_require__(8835);
protobuf.rpc          = __webpack_require__(7876);
protobuf.roots        = __webpack_require__(4007);
protobuf.configure    = configure;

/* istanbul ignore next */
/**
 * Reconfigures the library according to the environment.
 * @returns {undefined}
 */
function configure() {
    protobuf.util._configure();
    protobuf.Writer._configure(protobuf.BufferWriter);
    protobuf.Reader._configure(protobuf.BufferReader);
}

// Set up buffer utility according to the environment
configure();


/***/ }),

/***/ 2074:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Reader;

var util      = __webpack_require__(8835);

var BufferReader; // cyclic

var LongBits  = util.LongBits,
    utf8      = util.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        if (Array.isArray(buffer))
            return new Reader(buffer);
        throw Error("illegal buffer");
    };

var create = function create() {
    return util.Buffer
        ? function create_buffer_setup(buffer) {
            return (Reader.create = function create_buffer(buffer) {
                return util.Buffer.isBuffer(buffer)
                    ? new BufferReader(buffer)
                    /* istanbul ignore next */
                    : create_array(buffer);
            })(buffer);
        }
        /* istanbul ignore next */
        : create_array;
};

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array|Buffer} buffer Buffer to read from
 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 * @throws {Error} If `buffer` is not a valid buffer
 */
Reader.create = create();

Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */ util.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore if */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader.prototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0, 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
Reader.prototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as an unsigned 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.fixed32 = function read_fixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4);
};

/**
 * Reads fixed 32 bits as a signed 32 bit integer.
 * @returns {number} Value read
 */
Reader.prototype.sfixed32 = function read_sfixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4) | 0;
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.float = function read_float() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
};

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
Reader.prototype.double = function read_double() {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util.float.readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
Reader.prototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore if */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    if (Array.isArray(this.buf)) // plain array
        return this.buf.slice(start, end);
    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
        ? new this.buf.constructor(0)
        : this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
Reader.prototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
Reader.prototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore if */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        do {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
Reader.prototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
                this.skipType(wireType);
            }
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

Reader._configure = function(BufferReader_) {
    BufferReader = BufferReader_;
    Reader.create = create();
    BufferReader._configure();

    var fn = util.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    util.merge(Reader.prototype, {

        int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
        },

        uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
        },

        sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
        },

        fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
        },

        sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
        }

    });
};


/***/ }),

/***/ 69:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = BufferReader;

// extends Reader
var Reader = __webpack_require__(2074);
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

var util = __webpack_require__(8835);

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);

    /**
     * Read buffer.
     * @name BufferReader#buf
     * @type {Buffer}
     */
}

BufferReader._configure = function () {
    /* istanbul ignore else */
    if (util.Buffer)
        BufferReader.prototype._slice = util.Buffer.prototype.slice;
};


/**
 * @override
 */
BufferReader.prototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice
        ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len))
        : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @name BufferReader#bytes
 * @function
 * @returns {Buffer} Value read
 */

BufferReader._configure();


/***/ }),

/***/ 4007:
/***/ ((module) => {

"use strict";

module.exports = {};

/**
 * Named roots.
 * This is where pbjs stores generated structures (the option `-r, --root` specifies a name).
 * Can also be used manually to make roots available accross modules.
 * @name roots
 * @type {Object.<string,Root>}
 * @example
 * // pbjs -r myroot -o compiled.js ...
 *
 * // in another module:
 * require("./compiled.js");
 *
 * // in any subsequent module:
 * var root = protobuf.roots["myroot"];
 */


/***/ }),

/***/ 7876:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


/**
 * Streaming RPC helpers.
 * @namespace
 */
var rpc = exports;

/**
 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
 * @typedef RPCImpl
 * @type {function}
 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
 * @param {Uint8Array} requestData Request data
 * @param {RPCImplCallback} callback Callback function
 * @returns {undefined}
 * @example
 * function rpcImpl(method, requestData, callback) {
 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
 *         throw Error("no such method");
 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
 *         callback(err, responseData);
 *     });
 * }
 */

/**
 * Node-style callback as used by {@link RPCImpl}.
 * @typedef RPCImplCallback
 * @type {function}
 * @param {Error|null} error Error, if any, otherwise `null`
 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
 * @returns {undefined}
 */

rpc.Service = __webpack_require__(1380);


/***/ }),

/***/ 1380:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Service;

var util = __webpack_require__(8835);

// Extends EventEmitter
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

/**
 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
 *
 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
 * @typedef rpc.ServiceMethodCallback
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {TRes} [response] Response message
 * @returns {undefined}
 */

/**
 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
 * @typedef rpc.ServiceMethod
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
 */

/**
 * Constructs a new RPC service instance.
 * @classdesc An RPC service as returned by {@link Service#create}.
 * @exports rpc.Service
 * @extends util.EventEmitter
 * @constructor
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Service(rpcImpl, requestDelimited, responseDelimited) {

    if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");

    util.EventEmitter.call(this);

    /**
     * RPC implementation. Becomes `null` once the service is ended.
     * @type {RPCImpl|null}
     */
    this.rpcImpl = rpcImpl;

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
 * @param {Constructor<TReq>} requestCtor Request constructor
 * @param {Constructor<TRes>} responseCtor Response constructor
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
 * @returns {undefined}
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 */
Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    if (!request)
        throw TypeError("request must be specified");

    var self = this;
    if (!callback)
        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    if (!self.rpcImpl) {
        setTimeout(function() { callback(Error("already ended")); }, 0);
        return undefined;
    }

    try {
        return self.rpcImpl(
            method,
            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {

                if (err) {
                    self.emit("error", err, method);
                    return callback(err);
                }

                if (response === null) {
                    self.end(/* endedByRPC */ true);
                    return undefined;
                }

                if (!(response instanceof responseCtor)) {
                    try {
                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
                    } catch (err) {
                        self.emit("error", err, method);
                        return callback(err);
                    }
                }

                self.emit("data", response, method);
                return callback(null, response);
            }
        );
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};

/**
 * Ends this service and emits the `end` event.
 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
 * @returns {rpc.Service} `this`
 */
Service.prototype.end = function end(endedByRPC) {
    if (this.rpcImpl) {
        if (!endedByRPC) // signal end to rpcImpl
            this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
    }
    return this;
};


/***/ }),

/***/ 4600:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = LongBits;

var util = __webpack_require__(8835);

/**
 * Constructs new long bits.
 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
 * @memberof util
 * @constructor
 * @param {number} lo Low 32 bits, unsigned
 * @param {number} hi High 32 bits, unsigned
 */
function LongBits(lo, hi) {

    // note that the casts below are theoretically unnecessary as of today, but older statically
    // generated converter code might still call the ctor with signed 32bits. kept for compat.

    /**
     * Low bits.
     * @type {number}
     */
    this.lo = lo >>> 0;

    /**
     * High bits.
     * @type {number}
     */
    this.hi = hi >>> 0;
}

/**
 * Zero bits.
 * @memberof util.LongBits
 * @type {util.LongBits}
 */
var zero = LongBits.zero = new LongBits(0, 0);

zero.toNumber = function() { return 0; };
zero.zzEncode = zero.zzDecode = function() { return this; };
zero.length = function() { return 1; };

/**
 * Zero hash.
 * @memberof util.LongBits
 * @type {string}
 */
var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

/**
 * Constructs new long bits from the specified number.
 * @param {number} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.fromNumber = function fromNumber(value) {
    if (value === 0)
        return zero;
    var sign = value < 0;
    if (sign)
        value = -value;
    var lo = value >>> 0,
        hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
                hi = 0;
        }
    }
    return new LongBits(lo, hi);
};

/**
 * Constructs new long bits from a number, long or string.
 * @param {Long|number|string} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.from = function from(value) {
    if (typeof value === "number")
        return LongBits.fromNumber(value);
    if (util.isString(value)) {
        /* istanbul ignore else */
        if (util.Long)
            value = util.Long.fromString(value);
        else
            return LongBits.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
};

/**
 * Converts this long bits to a possibly unsafe JavaScript number.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {number} Possibly unsafe number
 */
LongBits.prototype.toNumber = function toNumber(unsigned) {
    if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0,
            hi = ~this.hi     >>> 0;
        if (!lo)
            hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
};

/**
 * Converts this long bits to a long.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long} Long
 */
LongBits.prototype.toLong = function toLong(unsigned) {
    return util.Long
        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
        /* istanbul ignore next */
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
};

var charCodeAt = String.prototype.charCodeAt;

/**
 * Constructs new long bits from the specified 8 characters long hash.
 * @param {string} hash Hash
 * @returns {util.LongBits} Bits
 */
LongBits.fromHash = function fromHash(hash) {
    if (hash === zeroHash)
        return zero;
    return new LongBits(
        ( charCodeAt.call(hash, 0)
        | charCodeAt.call(hash, 1) << 8
        | charCodeAt.call(hash, 2) << 16
        | charCodeAt.call(hash, 3) << 24) >>> 0
    ,
        ( charCodeAt.call(hash, 4)
        | charCodeAt.call(hash, 5) << 8
        | charCodeAt.call(hash, 6) << 16
        | charCodeAt.call(hash, 7) << 24) >>> 0
    );
};

/**
 * Converts this long bits to a 8 characters long hash.
 * @returns {string} Hash
 */
LongBits.prototype.toHash = function toHash() {
    return String.fromCharCode(
        this.lo        & 255,
        this.lo >>> 8  & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24      ,
        this.hi        & 255,
        this.hi >>> 8  & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
    );
};

/**
 * Zig-zag encodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzEncode = function zzEncode() {
    var mask =   this.hi >> 31;
    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
    return this;
};

/**
 * Zig-zag decodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits.prototype.zzDecode = function zzDecode() {
    var mask = -(this.lo & 1);
    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
    return this;
};

/**
 * Calculates the length of this longbits when encoded as a varint.
 * @returns {number} Length
 */
LongBits.prototype.length = function length() {
    var part0 =  this.lo,
        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
        part2 =  this.hi >>> 24;
    return part2 === 0
         ? part1 === 0
           ? part0 < 16384
             ? part0 < 128 ? 1 : 2
             : part0 < 2097152 ? 3 : 4
           : part1 < 16384
             ? part1 < 128 ? 5 : 6
             : part1 < 2097152 ? 7 : 8
         : part2 < 128 ? 9 : 10;
};


/***/ }),

/***/ 8835:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var util = exports;

// used to return a Promise where callback is omitted
util.asPromise = __webpack_require__(7383);

// converts to / from base64 encoded strings
util.base64 = __webpack_require__(3417);

// base class of rpc.Service
util.EventEmitter = __webpack_require__(7516);

// float handling accross browsers
util.float = __webpack_require__(9787);

// requires modules optionally and hides the call from bundlers
util.inquire = __webpack_require__(2795);

// converts to / from utf8 encoded strings
util.utf8 = __webpack_require__(1893);

// provides a node-like buffer pool in the browser
util.pool = __webpack_require__(4476);

// utility to work with the low and high bits of a 64 bit value
util.LongBits = __webpack_require__(4600);

/**
 * Whether running within node or not.
 * @memberof util
 * @type {boolean}
 */
util.isNode = Boolean(typeof __webpack_require__.g !== "undefined"
                   && __webpack_require__.g
                   && __webpack_require__.g.process
                   && __webpack_require__.g.process.versions
                   && __webpack_require__.g.process.versions.node);

/**
 * Global object reference.
 * @memberof util
 * @type {Object}
 */
util.global = util.isNode && __webpack_require__.g
           || typeof window !== "undefined" && window
           || typeof self   !== "undefined" && self
           || this; // eslint-disable-line no-invalid-this

/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};

/**
 * Tests if the specified value is a string.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a string
 */
util.isString = function isString(value) {
    return typeof value === "string" || value instanceof String;
};

/**
 * Tests if the specified value is a non-null object.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a non-null object
 */
util.isObject = function isObject(value) {
    return value && typeof value === "object";
};

/**
 * Checks if a property on a message is considered to be present.
 * This is an alias of {@link util.isSet}.
 * @function
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isset =

/**
 * Checks if a property on a message is considered to be present.
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isSet = function isSet(obj, prop) {
    var value = obj[prop];
    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
    return false;
};

/**
 * Any compatible Buffer instance.
 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
 * @interface Buffer
 * @extends Uint8Array
 */

/**
 * Node's Buffer class if available.
 * @type {Constructor<Buffer>}
 */
util.Buffer = (function() {
    try {
        var Buffer = util.inquire("buffer").Buffer;
        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
    } catch (e) {
        /* istanbul ignore next */
        return null;
    }
})();

// Internal alias of or polyfull for Buffer.from.
util._Buffer_from = null;

// Internal alias of or polyfill for Buffer.allocUnsafe.
util._Buffer_allocUnsafe = null;

/**
 * Creates a new buffer of whatever type supported by the environment.
 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
 * @returns {Uint8Array|Buffer} Buffer
 */
util.newBuffer = function newBuffer(sizeOrArray) {
    /* istanbul ignore next */
    return typeof sizeOrArray === "number"
        ? util.Buffer
            ? util._Buffer_allocUnsafe(sizeOrArray)
            : new util.Array(sizeOrArray)
        : util.Buffer
            ? util._Buffer_from(sizeOrArray)
            : typeof Uint8Array === "undefined"
                ? sizeOrArray
                : new Uint8Array(sizeOrArray);
};

/**
 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
 * @type {Constructor<Uint8Array>}
 */
util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

/**
 * Any compatible Long instance.
 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
 * @interface Long
 * @property {number} low Low bits
 * @property {number} high High bits
 * @property {boolean} unsigned Whether unsigned or not
 */

/**
 * Long.js's Long class if available.
 * @type {Constructor<Long>}
 */
util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
         || /* istanbul ignore next */ util.global.Long
         || util.inquire("long");

/**
 * Regular expression used to verify 2 bit (`bool`) map keys.
 * @type {RegExp}
 * @const
 */
util.key2Re = /^true|false|0|1$/;

/**
 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

/**
 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

/**
 * Converts a number or long to an 8 characters long hash string.
 * @param {Long|number} value Value to convert
 * @returns {string} Hash
 */
util.longToHash = function longToHash(value) {
    return value
        ? util.LongBits.from(value).toHash()
        : util.LongBits.zeroHash;
};

/**
 * Converts an 8 characters long hash string to a long or number.
 * @param {string} hash Hash
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long|number} Original value
 */
util.longFromHash = function longFromHash(hash, unsigned) {
    var bits = util.LongBits.fromHash(hash);
    if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
    return bits.toNumber(Boolean(unsigned));
};

/**
 * Merges the properties of the source object into the destination object.
 * @memberof util
 * @param {Object.<string,*>} dst Destination object
 * @param {Object.<string,*>} src Source object
 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
 * @returns {Object.<string,*>} Destination object
 */
function merge(dst, src, ifNotSet) { // used by converters
    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === undefined || !ifNotSet)
            dst[keys[i]] = src[keys[i]];
    return dst;
}

util.merge = merge;

/**
 * Converts the first character of a string to lower case.
 * @param {string} str String to convert
 * @returns {string} Converted string
 */
util.lcFirst = function lcFirst(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
};

/**
 * Creates a custom error constructor.
 * @memberof util
 * @param {string} name Error name
 * @returns {Constructor<Error>} Custom error constructor
 */
function newError(name) {

    function CustomError(message, properties) {

        if (!(this instanceof CustomError))
            return new CustomError(message, properties);

        // Error.call(this, message);
        // ^ just returns a new error instance because the ctor can be called as a function

        Object.defineProperty(this, "message", { get: function() { return message; } });

        /* istanbul ignore next */
        if (Error.captureStackTrace) // node
            Error.captureStackTrace(this, CustomError);
        else
            Object.defineProperty(this, "stack", { value: new Error().stack || "" });

        if (properties)
            merge(this, properties);
    }

    (CustomError.prototype = Object.create(Error.prototype)).constructor = CustomError;

    Object.defineProperty(CustomError.prototype, "name", { get: function() { return name; } });

    CustomError.prototype.toString = function toString() {
        return this.name + ": " + this.message;
    };

    return CustomError;
}

util.newError = newError;

/**
 * Constructs a new protocol error.
 * @classdesc Error subclass indicating a protocol specifc error.
 * @memberof util
 * @extends Error
 * @template T extends Message<T>
 * @constructor
 * @param {string} message Error message
 * @param {Object.<string,*>} [properties] Additional properties
 * @example
 * try {
 *     MyMessage.decode(someBuffer); // throws if required fields are missing
 * } catch (e) {
 *     if (e instanceof ProtocolError && e.instance)
 *         console.log("decoded so far: " + JSON.stringify(e.instance));
 * }
 */
util.ProtocolError = newError("ProtocolError");

/**
 * So far decoded message instance.
 * @name util.ProtocolError#instance
 * @type {Message<T>}
 */

/**
 * A OneOf getter as returned by {@link util.oneOfGetter}.
 * @typedef OneOfGetter
 * @type {function}
 * @returns {string|undefined} Set field name, if any
 */

/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
util.oneOfGetter = function getOneOf(fieldNames) {
    var fieldMap = {};
    for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;

    /**
     * @returns {string|undefined} Set field name, if any
     * @this Object
     * @ignore
     */
    return function() { // eslint-disable-line consistent-return
        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
                return keys[i];
    };
};

/**
 * A OneOf setter as returned by {@link util.oneOfSetter}.
 * @typedef OneOfSetter
 * @type {function}
 * @param {string|undefined} value Field name
 * @returns {undefined}
 */

/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfSetter} Unbound setter
 */
util.oneOfSetter = function setOneOf(fieldNames) {

    /**
     * @param {string} name Field name
     * @returns {undefined}
     * @this Object
     * @ignore
     */
    return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name)
                delete this[fieldNames[i]];
    };
};

/**
 * Default conversion options used for {@link Message#toJSON} implementations.
 *
 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
 *
 * - Longs become strings
 * - Enums become string keys
 * - Bytes become base64 encoded strings
 * - (Sub-)Messages become plain objects
 * - Maps become plain objects with all string keys
 * - Repeated fields become arrays
 * - NaN and Infinity for float and double fields become strings
 *
 * @type {IConversionOptions}
 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
 */
util.toJSONOptions = {
    longs: String,
    enums: String,
    bytes: String,
    json: true
};

// Sets up buffer utility according to the environment (called in index-minimal)
util._configure = function() {
    var Buffer = util.Buffer;
    /* istanbul ignore if */
    if (!Buffer) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
    }
    // because node 4.x buffers are incompatible & immutable
    // see: https://github.com/dcodeIO/protobuf.js/pull/665
    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
        /* istanbul ignore next */
        function Buffer_from(value, encoding) {
            return new Buffer(value, encoding);
        };
    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
        /* istanbul ignore next */
        function Buffer_allocUnsafe(size) {
            return new Buffer(size);
        };
};


/***/ }),

/***/ 2147:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Writer;

var util      = __webpack_require__(8835);

var BufferWriter; // cyclic

var LongBits  = util.LongBits,
    base64    = util.base64,
    utf8      = util.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {State|null}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {Object|null}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

var create = function create() {
    return util.Buffer
        ? function create_buffer_setup() {
            return (Writer.create = function create_buffer() {
                return new BufferWriter();
            })();
        }
        /* istanbul ignore next */
        : function create_array() {
            return new Writer();
        };
};

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer.create = create();

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer.alloc = function alloc(size) {
    return new util.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util.Array !== Array)
    Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 * @private
 */
Writer.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.int32 = function write_int32(value) {
    return value < 0
        ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.uint64 = function write_uint64(value) {
    var bits = LongBits.from(value);
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.int64 = Writer.prototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sint64 = function write_sint64(value) {
    var bits = LongBits.from(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.bool = function write_bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos    ] =  val         & 255;
    buf[pos + 1] =  val >>> 8   & 255;
    buf[pos + 2] =  val >>> 16  & 255;
    buf[pos + 3] =  val >>> 24;
}

/**
 * Writes an unsigned 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.fixed32 = function write_fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a signed 32 bit value as fixed 32 bits.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.sfixed32 = Writer.prototype.fixed32;

/**
 * Writes an unsigned 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits.from(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a signed 64 bit value as fixed 64 bits.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer.prototype.sfixed64 = Writer.prototype.fixed64;

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.float = function write_float(value) {
    return this._push(util.float.writeFloatLE, 4, value);
};

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.double = function write_double(value) {
    return this._push(util.float.writeDoubleLE, 8, value);
};

var writeBytes = util.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
Writer.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this._push(writeByte, 1, 0);
    if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
Writer.prototype.string = function write_string(value) {
    var len = utf8.length(value);
    return len
        ? this.uint32(len)._push(utf8.write, len, value)
        : this._push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
Writer.prototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
Writer.prototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
Writer.prototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
Writer.prototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

Writer._configure = function(BufferWriter_) {
    BufferWriter = BufferWriter_;
    Writer.create = create();
    BufferWriter._configure();
};


/***/ }),

/***/ 5055:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = BufferWriter;

// extends Writer
var Writer = __webpack_require__(2147);
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

var util = __webpack_require__(8835);

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

BufferWriter._configure = function () {
    /**
     * Allocates a buffer of the specified size.
     * @function
     * @param {number} size Buffer size
     * @returns {Buffer} Buffer
     */
    BufferWriter.alloc = util._Buffer_allocUnsafe;

    BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set"
        ? function writeBytesBuffer_set(val, buf, pos) {
          buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
          // also works for plain array values
        }
        /* istanbul ignore next */
        : function writeBytesBuffer_copy(val, buf, pos) {
          if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
          else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
        };
};


/**
 * @override
 */
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    if (util.isString(value))
        value = util._Buffer_from(value, "base64");
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util.utf8.write(val, buf, pos);
    else if (buf.utf8Write)
        buf.utf8Write(val, pos);
    else
        buf.write(val, pos);
}

/**
 * @override
 */
BufferWriter.prototype.string = function write_string_buffer(value) {
    var len = util.Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this._push(writeStringBuffer, len, value);
    return this;
};


/**
 * Finishes the write operation.
 * @name BufferWriter#finish
 * @function
 * @returns {Buffer} Finished buffer
 */

BufferWriter._configure();


/***/ }),

/***/ 4372:
/***/ ((module) => {

module.exports = readable => {
  // Node.js stream
  if (readable[Symbol.asyncIterator]) return readable

  // Browser ReadableStream
  if (readable.getReader) {
    return (async function * () {
      const reader = readable.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  throw new Error('unknown stream')
}


/***/ }),

/***/ 3434:
/***/ ((module) => {

module.exports = read

var MSB = 0x80
  , REST = 0x7F

function read(buf, offset) {
  var res    = 0
    , offset = offset || 0
    , shift  = 0
    , counter = offset
    , b
    , l = buf.length

  do {
    if (counter >= l || shift > 49) {
      read.bytes = 0
      throw new RangeError('Could not decode varint')
    }
    b = buf[counter++]
    res += shift < 28
      ? (b & REST) << shift
      : (b & REST) * Math.pow(2, shift)
    shift += 7
  } while (b >= MSB)

  read.bytes = counter - offset

  return res
}


/***/ }),

/***/ 399:
/***/ ((module) => {

module.exports = encode

var MSB = 0x80
  , REST = 0x7F
  , MSBALL = ~REST
  , INT = Math.pow(2, 31)

function encode(num, out, offset) {
  if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
    encode.bytes = 0
    throw new RangeError('Could not encode varint')
  }
  out = out || []
  offset = offset || 0
  var oldOffset = offset

  while(num >= INT) {
    out[offset++] = (num & 0xFF) | MSB
    num /= 128
  }
  while(num & MSBALL) {
    out[offset++] = (num & 0xFF) | MSB
    num >>>= 7
  }
  out[offset] = num | 0
  
  encode.bytes = offset - oldOffset + 1
  
  return out
}


/***/ }),

/***/ 1114:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
    encode: __webpack_require__(399)
  , decode: __webpack_require__(3434)
  , encodingLength: __webpack_require__(9581)
}


/***/ }),

/***/ 9581:
/***/ ((module) => {


var N1 = Math.pow(2,  7)
var N2 = Math.pow(2, 14)
var N3 = Math.pow(2, 21)
var N4 = Math.pow(2, 28)
var N5 = Math.pow(2, 35)
var N6 = Math.pow(2, 42)
var N7 = Math.pow(2, 49)
var N8 = Math.pow(2, 56)
var N9 = Math.pow(2, 63)

module.exports = function (value) {
  return (
    value < N1 ? 1
  : value < N2 ? 2
  : value < N3 ? 3
  : value < N4 ? 4
  : value < N5 ? 5
  : value < N6 ? 6
  : value < N7 ? 7
  : value < N8 ? 8
  : value < N9 ? 9
  :              10
  )
}


/***/ }),

/***/ 308:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Dy": () => (/* reexport safe */ _lib_token_js__WEBPACK_IMPORTED_MODULE_2__.D),
/* harmony export */   "Jx": () => (/* reexport safe */ _lib_decode_js__WEBPACK_IMPORTED_MODULE_1__.Jx),
/* harmony export */   "WU": () => (/* reexport safe */ _lib_token_js__WEBPACK_IMPORTED_MODULE_2__.W),
/* harmony export */   "cv": () => (/* reexport safe */ _lib_encode_js__WEBPACK_IMPORTED_MODULE_0__.cv)
/* harmony export */ });
/* harmony import */ var _lib_encode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6456);
/* harmony import */ var _lib_decode_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2972);
/* harmony import */ var _lib_token_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1302);





/***/ }),

/***/ 7228:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Fh": () => (/* binding */ encodeUint),
/* harmony export */   "Jl": () => (/* binding */ readUint32),
/* harmony export */   "Km": () => (/* binding */ decodeUint8),
/* harmony export */   "Tp": () => (/* binding */ encodeUintValue),
/* harmony export */   "X0": () => (/* binding */ readUint16),
/* harmony export */   "YX": () => (/* binding */ readUint64),
/* harmony export */   "Zh": () => (/* binding */ decodeUint16),
/* harmony export */   "cs": () => (/* binding */ decodeUint32),
/* harmony export */   "kj": () => (/* binding */ readUint8),
/* harmony export */   "or": () => (/* binding */ uintBoundaries),
/* harmony export */   "uN": () => (/* binding */ decodeUint64)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3002);


const uintBoundaries = [
  24,
  256,
  65536,
  4294967296,
  BigInt('18446744073709551616')
];
function readUint8(data, offset, options) {
  (0,_common_js__WEBPACK_IMPORTED_MODULE_1__/* .assertEnoughData */ .DO)(data, offset, 1);
  const value = data[offset];
  if (options.strict === true && value < uintBoundaries[0]) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } integer encoded in more bytes than necessary (strict decode)`);
  }
  return value;
}
function readUint16(data, offset, options) {
  (0,_common_js__WEBPACK_IMPORTED_MODULE_1__/* .assertEnoughData */ .DO)(data, offset, 2);
  const value = data[offset] << 8 | data[offset + 1];
  if (options.strict === true && value < uintBoundaries[1]) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } integer encoded in more bytes than necessary (strict decode)`);
  }
  return value;
}
function readUint32(data, offset, options) {
  (0,_common_js__WEBPACK_IMPORTED_MODULE_1__/* .assertEnoughData */ .DO)(data, offset, 4);
  const value = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
  if (options.strict === true && value < uintBoundaries[2]) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } integer encoded in more bytes than necessary (strict decode)`);
  }
  return value;
}
function readUint64(data, offset, options) {
  (0,_common_js__WEBPACK_IMPORTED_MODULE_1__/* .assertEnoughData */ .DO)(data, offset, 8);
  const hi = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
  const lo = data[offset + 4] * 16777216 + (data[offset + 5] << 16) + (data[offset + 6] << 8) + data[offset + 7];
  const value = (BigInt(hi) << BigInt(32)) + BigInt(lo);
  if (options.strict === true && value < uintBoundaries[3]) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } integer encoded in more bytes than necessary (strict decode)`);
  }
  if (value <= Number.MAX_SAFE_INTEGER) {
    return Number(value);
  }
  if (options.allowBigInt === true) {
    return value;
  }
  throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } integers outside of the safe integer range are not supported`);
}
function decodeUint8(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.uint */ .D.uint, readUint8(data, pos + 1, options), 2);
}
function decodeUint16(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.uint */ .D.uint, readUint16(data, pos + 1, options), 3);
}
function decodeUint32(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.uint */ .D.uint, readUint32(data, pos + 1, options), 5);
}
function decodeUint64(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.uint */ .D.uint, readUint64(data, pos + 1, options), 9);
}
function encodeUint(buf, token) {
  return encodeUintValue(buf, 0, token.value);
}
function encodeUintValue(buf, major, uint) {
  if (uint < uintBoundaries[0]) {
    const nuint = Number(uint);
    buf.push([major | nuint]);
  } else if (uint < uintBoundaries[1]) {
    const nuint = Number(uint);
    buf.push([
      major | 24,
      nuint
    ]);
  } else if (uint < uintBoundaries[2]) {
    const nuint = Number(uint);
    buf.push([
      major | 25,
      nuint >>> 8,
      nuint & 255
    ]);
  } else if (uint < uintBoundaries[3]) {
    const nuint = Number(uint);
    buf.push([
      major | 26,
      nuint >>> 24 & 255,
      nuint >>> 16 & 255,
      nuint >>> 8 & 255,
      nuint & 255
    ]);
  } else {
    const buint = BigInt(uint);
    if (buint < uintBoundaries[4]) {
      const set = [
        major | 27,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ];
      let lo = Number(buint & BigInt(4294967295));
      let hi = Number(buint >> BigInt(32) & BigInt(4294967295));
      set[8] = lo & 255;
      lo = lo >> 8;
      set[7] = lo & 255;
      lo = lo >> 8;
      set[6] = lo & 255;
      lo = lo >> 8;
      set[5] = lo & 255;
      set[4] = hi & 255;
      hi = hi >> 8;
      set[3] = hi & 255;
      hi = hi >> 8;
      set[2] = hi & 255;
      hi = hi >> 8;
      set[1] = hi & 255;
      buf.push(set);
    } else {
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } encountered BigInt larger than allowable range`);
    }
  }
}
encodeUint.encodedSize = function encodedSize(token) {
  return encodeUintValue.encodedSize(token.value);
};
encodeUintValue.encodedSize = function encodedSize(uint) {
  if (uint < uintBoundaries[0]) {
    return 1;
  }
  if (uint < uintBoundaries[1]) {
    return 2;
  }
  if (uint < uintBoundaries[2]) {
    return 3;
  }
  if (uint < uintBoundaries[3]) {
    return 5;
  }
  return 9;
};
encodeUint.compareTokens = function compareTokens(tok1, tok2) {
  return tok1.value < tok2.value ? -1 : tok1.value > tok2.value ? 1 : 0;
};

/***/ }),

/***/ 608:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "UT": () => (/* binding */ encodeNegint),
/* harmony export */   "ec": () => (/* binding */ decodeNegint64),
/* harmony export */   "r0": () => (/* binding */ decodeNegint16),
/* harmony export */   "wy": () => (/* binding */ decodeNegint32),
/* harmony export */   "yr": () => (/* binding */ decodeNegint8)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7228);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3002);



function decodeNegint8(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.negint */ .D.negint, -1 - _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint8 */ .kj(data, pos + 1, options), 2);
}
function decodeNegint16(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.negint */ .D.negint, -1 - _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint16 */ .X0(data, pos + 1, options), 3);
}
function decodeNegint32(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.negint */ .D.negint, -1 - _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint32 */ .Jl(data, pos + 1, options), 5);
}
const neg1b = BigInt(-1);
const pos1b = BigInt(1);
function decodeNegint64(data, pos, _minor, options) {
  const int = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint64 */ .YX(data, pos + 1, options);
  if (typeof int !== 'bigint') {
    const value = -1 - int;
    if (value >= Number.MIN_SAFE_INTEGER) {
      return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.negint */ .D.negint, value, 9);
    }
  }
  if (options.allowBigInt !== true) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeErrPrefix */ .IR } integers outside of the safe integer range are not supported`);
  }
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.negint */ .D.negint, neg1b - BigInt(int), 9);
}
function encodeNegint(buf, token) {
  const negint = token.value;
  const unsigned = typeof negint === 'bigint' ? negint * neg1b - pos1b : negint * -1 - 1;
  _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUintValue */ .Tp(buf, token.type.majorEncoded, unsigned);
}
encodeNegint.encodedSize = function encodedSize(token) {
  const negint = token.value;
  const unsigned = typeof negint === 'bigint' ? negint * neg1b - pos1b : negint * -1 - 1;
  if (unsigned < _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .uintBoundaries[0] */ .or[0]) {
    return 1;
  }
  if (unsigned < _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .uintBoundaries[1] */ .or[1]) {
    return 2;
  }
  if (unsigned < _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .uintBoundaries[2] */ .or[2]) {
    return 3;
  }
  if (unsigned < _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .uintBoundaries[3] */ .or[3]) {
    return 5;
  }
  return 9;
};
encodeNegint.compareTokens = function compareTokens(tok1, tok2) {
  return tok1.value < tok2.value ? 1 : tok1.value > tok2.value ? -1 : 0;
};

/***/ }),

/***/ 622:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BS": () => (/* binding */ decodeBytes16),
/* harmony export */   "Ii": () => (/* binding */ decodeBytesCompact),
/* harmony export */   "ME": () => (/* binding */ decodeBytes64),
/* harmony export */   "UQ": () => (/* binding */ decodeBytes8),
/* harmony export */   "hg": () => (/* binding */ encodeBytes),
/* harmony export */   "zU": () => (/* binding */ decodeBytes32)
/* harmony export */ });
/* unused harmony export compareBytes */
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3002);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7228);
/* harmony import */ var _byte_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1926);




function toToken(data, pos, prefix, length) {
  (0,_common_js__WEBPACK_IMPORTED_MODULE_1__/* .assertEnoughData */ .DO)(data, pos, prefix + length);
  const buf = (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_3__/* .slice */ .tP)(data, pos + prefix, pos + prefix + length);
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.bytes */ .D.bytes, buf, prefix + length);
}
function decodeBytesCompact(data, pos, minor, _options) {
  return toToken(data, pos, 1, minor);
}
function decodeBytes8(data, pos, _minor, options) {
  return toToken(data, pos, 2, _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint8 */ .kj(data, pos + 1, options));
}
function decodeBytes16(data, pos, _minor, options) {
  return toToken(data, pos, 3, _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint16 */ .X0(data, pos + 1, options));
}
function decodeBytes32(data, pos, _minor, options) {
  return toToken(data, pos, 5, _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint32 */ .Jl(data, pos + 1, options));
}
function decodeBytes64(data, pos, _minor, options) {
  const l = _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint64 */ .YX(data, pos + 1, options);
  if (typeof l === 'bigint') {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } 64-bit integer bytes lengths not supported`);
  }
  return toToken(data, pos, 9, l);
}
function tokenBytes(token) {
  if (token.encodedBytes === undefined) {
    token.encodedBytes = token.type === _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.string */ .D.string ? (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_3__/* .fromString */ .mL)(token.value) : token.value;
  }
  return token.encodedBytes;
}
function encodeBytes(buf, token) {
  const bytes = tokenBytes(token);
  _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .encodeUintValue */ .Tp(buf, token.type.majorEncoded, bytes.length);
  buf.push(bytes);
}
encodeBytes.encodedSize = function encodedSize(token) {
  const bytes = tokenBytes(token);
  return _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .encodeUintValue.encodedSize */ .Tp.encodedSize(bytes.length) + bytes.length;
};
encodeBytes.compareTokens = function compareTokens(tok1, tok2) {
  return compareBytes(tokenBytes(tok1), tokenBytes(tok2));
};
function compareBytes(b1, b2) {
  return b1.length < b2.length ? -1 : b1.length > b2.length ? 1 : (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_3__/* .compare */ .qu)(b1, b2);
}

/***/ }),

/***/ 790:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Bq": () => (/* binding */ decodeString8),
/* harmony export */   "YW": () => (/* binding */ encodeString),
/* harmony export */   "bc": () => (/* binding */ decodeString64),
/* harmony export */   "h": () => (/* binding */ decodeString16),
/* harmony export */   "nt": () => (/* binding */ decodeStringCompact),
/* harmony export */   "q0": () => (/* binding */ decodeString32)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3002);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7228);
/* harmony import */ var _2bytes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(622);
/* harmony import */ var _byte_utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1926);





function toToken(data, pos, prefix, length, options) {
  const totLength = prefix + length;
  (0,_common_js__WEBPACK_IMPORTED_MODULE_1__/* .assertEnoughData */ .DO)(data, pos, totLength);
  const tok = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.string */ .D.string, (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_4__/* .toString */ .BB)(data, pos + prefix, pos + totLength), totLength);
  if (options.retainStringBytes === true) {
    tok.byteValue = (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_4__/* .slice */ .tP)(data, pos + prefix, pos + totLength);
  }
  return tok;
}
function decodeStringCompact(data, pos, minor, options) {
  return toToken(data, pos, 1, minor, options);
}
function decodeString8(data, pos, _minor, options) {
  return toToken(data, pos, 2, _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint8 */ .kj(data, pos + 1, options), options);
}
function decodeString16(data, pos, _minor, options) {
  return toToken(data, pos, 3, _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint16 */ .X0(data, pos + 1, options), options);
}
function decodeString32(data, pos, _minor, options) {
  return toToken(data, pos, 5, _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint32 */ .Jl(data, pos + 1, options), options);
}
function decodeString64(data, pos, _minor, options) {
  const l = _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .readUint64 */ .YX(data, pos + 1, options);
  if (typeof l === 'bigint') {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } 64-bit integer string lengths not supported`);
  }
  return toToken(data, pos, 9, l, options);
}
const encodeString = _2bytes_js__WEBPACK_IMPORTED_MODULE_3__/* .encodeBytes */ .hg;

/***/ }),

/***/ 7656:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HF": () => (/* binding */ encodeArray),
/* harmony export */   "Ju": () => (/* binding */ decodeArrayCompact),
/* harmony export */   "OC": () => (/* binding */ decodeArray16),
/* harmony export */   "a8": () => (/* binding */ decodeArray64),
/* harmony export */   "h7": () => (/* binding */ decodeArray8),
/* harmony export */   "lY": () => (/* binding */ decodeArray32),
/* harmony export */   "s5": () => (/* binding */ decodeArrayIndefinite)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7228);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3002);



function toToken(_data, _pos, prefix, length) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.array */ .D.array, length, prefix);
}
function decodeArrayCompact(data, pos, minor, _options) {
  return toToken(data, pos, 1, minor);
}
function decodeArray8(data, pos, _minor, options) {
  return toToken(data, pos, 2, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint8 */ .kj(data, pos + 1, options));
}
function decodeArray16(data, pos, _minor, options) {
  return toToken(data, pos, 3, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint16 */ .X0(data, pos + 1, options));
}
function decodeArray32(data, pos, _minor, options) {
  return toToken(data, pos, 5, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint32 */ .Jl(data, pos + 1, options));
}
function decodeArray64(data, pos, _minor, options) {
  const l = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint64 */ .YX(data, pos + 1, options);
  if (typeof l === 'bigint') {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeErrPrefix */ .IR } 64-bit integer array lengths not supported`);
  }
  return toToken(data, pos, 9, l);
}
function decodeArrayIndefinite(data, pos, _minor, options) {
  if (options.allowIndefinite === false) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeErrPrefix */ .IR } indefinite length items not allowed`);
  }
  return toToken(data, pos, 1, Infinity);
}
function encodeArray(buf, token) {
  _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUintValue */ .Tp(buf, _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.array.majorEncoded */ .D.array.majorEncoded, token.value);
}
encodeArray.compareTokens = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUint.compareTokens */ .Fh.compareTokens;
encodeArray.encodedSize = function encodedSize(token) {
  return _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUintValue.encodedSize */ .Tp.encodedSize(token.value);
};

/***/ }),

/***/ 1613:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "F2": () => (/* binding */ decodeMap64),
/* harmony export */   "G": () => (/* binding */ decodeMap8),
/* harmony export */   "IY": () => (/* binding */ decodeMap32),
/* harmony export */   "KI": () => (/* binding */ encodeMap),
/* harmony export */   "_K": () => (/* binding */ decodeMapCompact),
/* harmony export */   "ng": () => (/* binding */ decodeMapIndefinite),
/* harmony export */   "qe": () => (/* binding */ decodeMap16)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7228);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3002);



function toToken(_data, _pos, prefix, length) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.map */ .D.map, length, prefix);
}
function decodeMapCompact(data, pos, minor, _options) {
  return toToken(data, pos, 1, minor);
}
function decodeMap8(data, pos, _minor, options) {
  return toToken(data, pos, 2, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint8 */ .kj(data, pos + 1, options));
}
function decodeMap16(data, pos, _minor, options) {
  return toToken(data, pos, 3, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint16 */ .X0(data, pos + 1, options));
}
function decodeMap32(data, pos, _minor, options) {
  return toToken(data, pos, 5, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint32 */ .Jl(data, pos + 1, options));
}
function decodeMap64(data, pos, _minor, options) {
  const l = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint64 */ .YX(data, pos + 1, options);
  if (typeof l === 'bigint') {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeErrPrefix */ .IR } 64-bit integer map lengths not supported`);
  }
  return toToken(data, pos, 9, l);
}
function decodeMapIndefinite(data, pos, _minor, options) {
  if (options.allowIndefinite === false) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeErrPrefix */ .IR } indefinite length items not allowed`);
  }
  return toToken(data, pos, 1, Infinity);
}
function encodeMap(buf, token) {
  _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUintValue */ .Tp(buf, _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.map.majorEncoded */ .D.map.majorEncoded, token.value);
}
encodeMap.compareTokens = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUint.compareTokens */ .Fh.compareTokens;
encodeMap.encodedSize = function encodedSize(token) {
  return _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUintValue.encodedSize */ .Tp.encodedSize(token.value);
};

/***/ }),

/***/ 6589:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CF": () => (/* binding */ decodeTag16),
/* harmony export */   "MV": () => (/* binding */ decodeTag64),
/* harmony export */   "ZR": () => (/* binding */ decodeTag8),
/* harmony export */   "qJ": () => (/* binding */ decodeTagCompact),
/* harmony export */   "vP": () => (/* binding */ decodeTag32),
/* harmony export */   "xy": () => (/* binding */ encodeTag)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7228);


function decodeTagCompact(_data, _pos, minor, _options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.tag */ .D.tag, minor, 1);
}
function decodeTag8(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.tag */ .D.tag, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint8 */ .kj(data, pos + 1, options), 2);
}
function decodeTag16(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.tag */ .D.tag, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint16 */ .X0(data, pos + 1, options), 3);
}
function decodeTag32(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.tag */ .D.tag, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint32 */ .Jl(data, pos + 1, options), 5);
}
function decodeTag64(data, pos, _minor, options) {
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.tag */ .D.tag, _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .readUint64 */ .YX(data, pos + 1, options), 9);
}
function encodeTag(buf, token) {
  _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUintValue */ .Tp(buf, _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.tag.majorEncoded */ .D.tag.majorEncoded, token.value);
}
encodeTag.compareTokens = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUint.compareTokens */ .Fh.compareTokens;
encodeTag.encodedSize = function encodedSize(token) {
  return _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeUintValue.encodedSize */ .Tp.encodedSize(token.value);
};

/***/ }),

/***/ 3964:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GI": () => (/* binding */ decodeFloat32),
/* harmony export */   "h1": () => (/* binding */ decodeUndefined),
/* harmony export */   "mW": () => (/* binding */ decodeFloat16),
/* harmony export */   "tA": () => (/* binding */ encodeFloat),
/* harmony export */   "vV": () => (/* binding */ decodeFloat64),
/* harmony export */   "y7": () => (/* binding */ decodeBreak)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3002);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7228);



const MINOR_FALSE = 20;
const MINOR_TRUE = 21;
const MINOR_NULL = 22;
const MINOR_UNDEFINED = 23;
function decodeUndefined(_data, _pos, _minor, options) {
  if (options.allowUndefined === false) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } undefined values are not supported`);
  } else if (options.coerceUndefinedToNull === true) {
    return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["null"] */ .D["null"], null, 1);
  }
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.undefined */ .D.undefined, undefined, 1);
}
function decodeBreak(_data, _pos, _minor, options) {
  if (options.allowIndefinite === false) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } indefinite length items not allowed`);
  }
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["break"] */ .D["break"], undefined, 1);
}
function createToken(value, bytes, options) {
  if (options) {
    if (options.allowNaN === false && Number.isNaN(value)) {
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } NaN values are not supported`);
    }
    if (options.allowInfinity === false && (value === Infinity || value === -Infinity)) {
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } Infinity values are not supported`);
    }
  }
  return new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.float */ .D.float, value, bytes);
}
function decodeFloat16(data, pos, _minor, options) {
  return createToken(readFloat16(data, pos + 1), 3, options);
}
function decodeFloat32(data, pos, _minor, options) {
  return createToken(readFloat32(data, pos + 1), 5, options);
}
function decodeFloat64(data, pos, _minor, options) {
  return createToken(readFloat64(data, pos + 1), 9, options);
}
function encodeFloat(buf, token, options) {
  const float = token.value;
  if (float === false) {
    buf.push([_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.float.majorEncoded */ .D.float.majorEncoded | MINOR_FALSE]);
  } else if (float === true) {
    buf.push([_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.float.majorEncoded */ .D.float.majorEncoded | MINOR_TRUE]);
  } else if (float === null) {
    buf.push([_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.float.majorEncoded */ .D.float.majorEncoded | MINOR_NULL]);
  } else if (float === undefined) {
    buf.push([_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.float.majorEncoded */ .D.float.majorEncoded | MINOR_UNDEFINED]);
  } else {
    let decoded;
    let success = false;
    if (!options || options.float64 !== true) {
      encodeFloat16(float);
      decoded = readFloat16(ui8a, 1);
      if (float === decoded || Number.isNaN(float)) {
        ui8a[0] = 249;
        buf.push(ui8a.slice(0, 3));
        success = true;
      } else {
        encodeFloat32(float);
        decoded = readFloat32(ui8a, 1);
        if (float === decoded) {
          ui8a[0] = 250;
          buf.push(ui8a.slice(0, 5));
          success = true;
        }
      }
    }
    if (!success) {
      encodeFloat64(float);
      decoded = readFloat64(ui8a, 1);
      ui8a[0] = 251;
      buf.push(ui8a.slice(0, 9));
    }
  }
}
encodeFloat.encodedSize = function encodedSize(token, options) {
  const float = token.value;
  if (float === false || float === true || float === null || float === undefined) {
    return 1;
  }
  if (!options || options.float64 !== true) {
    encodeFloat16(float);
    let decoded = readFloat16(ui8a, 1);
    if (float === decoded || Number.isNaN(float)) {
      return 3;
    }
    encodeFloat32(float);
    decoded = readFloat32(ui8a, 1);
    if (float === decoded) {
      return 5;
    }
  }
  return 9;
};
const buffer = new ArrayBuffer(9);
const dataView = new DataView(buffer, 1);
const ui8a = new Uint8Array(buffer, 0);
function encodeFloat16(inp) {
  if (inp === Infinity) {
    dataView.setUint16(0, 31744, false);
  } else if (inp === -Infinity) {
    dataView.setUint16(0, 64512, false);
  } else if (Number.isNaN(inp)) {
    dataView.setUint16(0, 32256, false);
  } else {
    dataView.setFloat32(0, inp);
    const valu32 = dataView.getUint32(0);
    const exponent = (valu32 & 2139095040) >> 23;
    const mantissa = valu32 & 8388607;
    if (exponent === 255) {
      dataView.setUint16(0, 31744, false);
    } else if (exponent === 0) {
      dataView.setUint16(0, (inp & 2147483648) >> 16 | mantissa >> 13, false);
    } else {
      const logicalExponent = exponent - 127;
      if (logicalExponent < -24) {
        dataView.setUint16(0, 0);
      } else if (logicalExponent < -14) {
        dataView.setUint16(0, (valu32 & 2147483648) >> 16 | 1 << 24 + logicalExponent, false);
      } else {
        dataView.setUint16(0, (valu32 & 2147483648) >> 16 | logicalExponent + 15 << 10 | mantissa >> 13, false);
      }
    }
  }
}
function readFloat16(ui8a, pos) {
  if (ui8a.length - pos < 2) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } not enough data for float16`);
  }
  const half = (ui8a[pos] << 8) + ui8a[pos + 1];
  if (half === 31744) {
    return Infinity;
  }
  if (half === 64512) {
    return -Infinity;
  }
  if (half === 32256) {
    return NaN;
  }
  const exp = half >> 10 & 31;
  const mant = half & 1023;
  let val;
  if (exp === 0) {
    val = mant * 2 ** -24;
  } else if (exp !== 31) {
    val = (mant + 1024) * 2 ** (exp - 25);
  } else {
    val = mant === 0 ? Infinity : NaN;
  }
  return half & 32768 ? -val : val;
}
function encodeFloat32(inp) {
  dataView.setFloat32(0, inp, false);
}
function readFloat32(ui8a, pos) {
  if (ui8a.length - pos < 4) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } not enough data for float32`);
  }
  const offset = (ui8a.byteOffset || 0) + pos;
  return new DataView(ui8a.buffer, offset, 4).getFloat32(0, false);
}
function encodeFloat64(inp) {
  dataView.setFloat64(0, inp, false);
}
function readFloat64(ui8a, pos) {
  if (ui8a.length - pos < 8) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeErrPrefix */ .IR } not enough data for float64`);
  }
  const offset = (ui8a.byteOffset || 0) + pos;
  return new DataView(ui8a.buffer, offset, 8).getFloat64(0, false);
}
encodeFloat.compareTokens = _0uint_js__WEBPACK_IMPORTED_MODULE_2__/* .encodeUint.compareTokens */ .Fh.compareTokens;

/***/ }),

/***/ 1926:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BB": () => (/* binding */ toString),
/* harmony export */   "Dz": () => (/* binding */ asU8A),
/* harmony export */   "Pu": () => (/* binding */ decodeCodePointsArray),
/* harmony export */   "mL": () => (/* binding */ fromString),
/* harmony export */   "nI": () => (/* binding */ fromArray),
/* harmony export */   "qu": () => (/* binding */ compare),
/* harmony export */   "tP": () => (/* binding */ slice),
/* harmony export */   "un": () => (/* binding */ alloc),
/* harmony export */   "zo": () => (/* binding */ concat)
/* harmony export */ });
/* unused harmony exports useBuffer, toHex, fromHex */
const useBuffer = globalThis.process && !globalThis.process.browser && globalThis.Buffer && typeof globalThis.Buffer.isBuffer === 'function';
const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
function isBuffer(buf) {
  return useBuffer && globalThis.Buffer.isBuffer(buf);
}
function asU8A(buf) {
  if (!(buf instanceof Uint8Array)) {
    return Uint8Array.from(buf);
  }
  return isBuffer(buf) ? new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) : buf;
}
const toString = useBuffer ? (bytes, start, end) => {
  return end - start > 64 ? globalThis.Buffer.from(bytes.subarray(start, end)).toString('utf8') : utf8Slice(bytes, start, end);
} : (bytes, start, end) => {
  return end - start > 64 ? textDecoder.decode(bytes.subarray(start, end)) : utf8Slice(bytes, start, end);
};
const fromString = useBuffer ? string => {
  return string.length > 64 ? globalThis.Buffer.from(string) : utf8ToBytes(string);
} : string => {
  return string.length > 64 ? textEncoder.encode(string) : utf8ToBytes(string);
};
const fromArray = arr => {
  return Uint8Array.from(arr);
};
const slice = useBuffer ? (bytes, start, end) => {
  if (isBuffer(bytes)) {
    return new Uint8Array(bytes.subarray(start, end));
  }
  return bytes.slice(start, end);
} : (bytes, start, end) => {
  return bytes.slice(start, end);
};
const concat = useBuffer ? (chunks, length) => {
  chunks = chunks.map(c => c instanceof Uint8Array ? c : globalThis.Buffer.from(c));
  return asU8A(globalThis.Buffer.concat(chunks, length));
} : (chunks, length) => {
  const out = new Uint8Array(length);
  let off = 0;
  for (let b of chunks) {
    if (off + b.length > out.length) {
      b = b.subarray(0, out.length - off);
    }
    out.set(b, off);
    off += b.length;
  }
  return out;
};
const alloc = useBuffer ? size => {
  return globalThis.Buffer.allocUnsafe(size);
} : size => {
  return new Uint8Array(size);
};
const toHex = (/* unused pure expression or super */ null && (useBuffer ? d => {
  if (typeof d === 'string') {
    return d;
  }
  return globalThis.Buffer.from(toBytes(d)).toString('hex');
} : d => {
  if (typeof d === 'string') {
    return d;
  }
  return Array.prototype.reduce.call(toBytes(d), (p, c) => `${ p }${ c.toString(16).padStart(2, '0') }`, '');
}));
const fromHex = (/* unused pure expression or super */ null && (useBuffer ? hex => {
  if (hex instanceof Uint8Array) {
    return hex;
  }
  return globalThis.Buffer.from(hex, 'hex');
} : hex => {
  if (hex instanceof Uint8Array) {
    return hex;
  }
  if (!hex.length) {
    return new Uint8Array(0);
  }
  return new Uint8Array(hex.split('').map((c, i, d) => i % 2 === 0 ? `0x${ c }${ d[i + 1] }` : '').filter(Boolean).map(e => parseInt(e, 16)));
}));
function toBytes(obj) {
  if (obj instanceof Uint8Array && obj.constructor.name === 'Uint8Array') {
    return obj;
  }
  if (obj instanceof ArrayBuffer) {
    return new Uint8Array(obj);
  }
  if (ArrayBuffer.isView(obj)) {
    return new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength);
  }
  throw new Error('Unknown type, must be binary type');
}
function compare(b1, b2) {
  if (isBuffer(b1) && isBuffer(b2)) {
    return b1.compare(b2);
  }
  for (let i = 0; i < b1.length; i++) {
    if (b1[i] === b2[i]) {
      continue;
    }
    return b1[i] < b2[i] ? -1 : 1;
  }
  return 0;
}
function utf8ToBytes(string, units = Infinity) {
  let codePoint;
  const length = string.length;
  let leadSurrogate = null;
  const bytes = [];
  for (let i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);
    if (codePoint > 55295 && codePoint < 57344) {
      if (!leadSurrogate) {
        if (codePoint > 56319) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        }
        leadSurrogate = codePoint;
        continue;
      }
      if (codePoint < 56320) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
        leadSurrogate = codePoint;
        continue;
      }
      codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1)
        bytes.push(239, 191, 189);
    }
    leadSurrogate = null;
    if (codePoint < 128) {
      if ((units -= 1) < 0)
        break;
      bytes.push(codePoint);
    } else if (codePoint < 2048) {
      if ((units -= 2) < 0)
        break;
      bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
    } else if (codePoint < 65536) {
      if ((units -= 3) < 0)
        break;
      bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else if (codePoint < 1114112) {
      if ((units -= 4) < 0)
        break;
      bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else {
      throw new Error('Invalid code point');
    }
  }
  return bytes;
}
function utf8Slice(buf, offset, end) {
  const res = [];
  while (offset < end) {
    const firstByte = buf[offset];
    let codePoint = null;
    let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
    if (offset + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
      case 1:
        if (firstByte < 128) {
          codePoint = firstByte;
        }
        break;
      case 2:
        secondByte = buf[offset + 1];
        if ((secondByte & 192) === 128) {
          tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
          if (tempCodePoint > 127) {
            codePoint = tempCodePoint;
          }
        }
        break;
      case 3:
        secondByte = buf[offset + 1];
        thirdByte = buf[offset + 2];
        if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
          tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
          if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
            codePoint = tempCodePoint;
          }
        }
        break;
      case 4:
        secondByte = buf[offset + 1];
        thirdByte = buf[offset + 2];
        fourthByte = buf[offset + 3];
        if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
          tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
          if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
            codePoint = tempCodePoint;
          }
        }
      }
    }
    if (codePoint === null) {
      codePoint = 65533;
      bytesPerSequence = 1;
    } else if (codePoint > 65535) {
      codePoint -= 65536;
      res.push(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    res.push(codePoint);
    offset += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}
const MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
  const len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }
  let res = '';
  let i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}

/***/ }),

/***/ 3002:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DO": () => (/* binding */ assertEnoughData),
/* harmony export */   "IR": () => (/* binding */ decodeErrPrefix),
/* harmony export */   "OO": () => (/* binding */ encodeErrPrefix)
/* harmony export */ });
/* unused harmony export uintMinorPrefixBytes */
const decodeErrPrefix = 'CBOR decode error:';
const encodeErrPrefix = 'CBOR encode error:';
const uintMinorPrefixBytes = [];
uintMinorPrefixBytes[23] = 1;
uintMinorPrefixBytes[24] = 2;
uintMinorPrefixBytes[25] = 3;
uintMinorPrefixBytes[26] = 5;
uintMinorPrefixBytes[27] = 9;
function assertEnoughData(data, pos, need) {
  if (data.length - pos < need) {
    throw new Error(`${ decodeErrPrefix } not enough data for type`);
  }
}


/***/ }),

/***/ 2972:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Jx": () => (/* binding */ decode)
/* harmony export */ });
/* unused harmony exports Tokeniser, tokensToObject */
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3002);
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1302);
/* harmony import */ var _jump_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1266);



const defaultDecodeOptions = {
  strict: false,
  allowIndefinite: true,
  allowUndefined: true,
  allowBigInt: true
};
class Tokeniser {
  constructor(data, options = {}) {
    this.pos = 0;
    this.data = data;
    this.options = options;
  }
  done() {
    return this.pos >= this.data.length;
  }
  next() {
    const byt = this.data[this.pos];
    let token = _jump_js__WEBPACK_IMPORTED_MODULE_2__/* .quick */ .PS[byt];
    if (token === undefined) {
      const decoder = _jump_js__WEBPACK_IMPORTED_MODULE_2__/* .jump */ .cW[byt];
      if (!decoder) {
        throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } no decoder for major type ${ byt >>> 5 } (byte 0x${ byt.toString(16).padStart(2, '0') })`);
      }
      const minor = byt & 31;
      token = decoder(this.data, this.pos, minor, this.options);
    }
    this.pos += token.encodedLength;
    return token;
  }
}
const DONE = Symbol.for('DONE');
const BREAK = Symbol.for('BREAK');
function tokenToArray(token, tokeniser, options) {
  const arr = [];
  for (let i = 0; i < token.value; i++) {
    const value = tokensToObject(tokeniser, options);
    if (value === BREAK) {
      if (token.value === Infinity) {
        break;
      }
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } got unexpected break to lengthed array`);
    }
    if (value === DONE) {
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } found array but not enough entries (got ${ i }, expected ${ token.value })`);
    }
    arr[i] = value;
  }
  return arr;
}
function tokenToMap(token, tokeniser, options) {
  const useMaps = options.useMaps === true;
  const obj = useMaps ? undefined : {};
  const m = useMaps ? new Map() : undefined;
  for (let i = 0; i < token.value; i++) {
    const key = tokensToObject(tokeniser, options);
    if (key === BREAK) {
      if (token.value === Infinity) {
        break;
      }
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } got unexpected break to lengthed map`);
    }
    if (key === DONE) {
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } found map but not enough entries (got ${ i } [no key], expected ${ token.value })`);
    }
    if (useMaps !== true && typeof key !== 'string') {
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } non-string keys not supported (got ${ typeof key })`);
    }
    const value = tokensToObject(tokeniser, options);
    if (value === DONE) {
      throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } found map but not enough entries (got ${ i } [no value], expected ${ token.value })`);
    }
    if (useMaps) {
      m.set(key, value);
    } else {
      obj[key] = value;
    }
  }
  return useMaps ? m : obj;
}
function tokensToObject(tokeniser, options) {
  if (tokeniser.done()) {
    return DONE;
  }
  const token = tokeniser.next();
  if (token.type === _token_js__WEBPACK_IMPORTED_MODULE_1__/* .Type["break"] */ .D["break"]) {
    return BREAK;
  }
  if (token.type.terminal) {
    return token.value;
  }
  if (token.type === _token_js__WEBPACK_IMPORTED_MODULE_1__/* .Type.array */ .D.array) {
    return tokenToArray(token, tokeniser, options);
  }
  if (token.type === _token_js__WEBPACK_IMPORTED_MODULE_1__/* .Type.map */ .D.map) {
    return tokenToMap(token, tokeniser, options);
  }
  if (token.type === _token_js__WEBPACK_IMPORTED_MODULE_1__/* .Type.tag */ .D.tag) {
    if (options.tags && typeof options.tags[token.value] === 'function') {
      const tagged = tokensToObject(tokeniser, options);
      return options.tags[token.value](tagged);
    }
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } tag not supported (${ token.value })`);
  }
  throw new Error('unsupported');
}
function decode(data, options) {
  if (!(data instanceof Uint8Array)) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } data to decode must be a Uint8Array`);
  }
  options = Object.assign({}, defaultDecodeOptions, options);
  const tokeniser = options.tokenizer || new Tokeniser(data, options);
  const decoded = tokensToObject(tokeniser, options);
  if (decoded === DONE) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } did not find any content to decode`);
  }
  if (decoded === BREAK) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } got unexpected break`);
  }
  if (!tokeniser.done()) {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeErrPrefix */ .IR } too many terminals, data makes no sense`);
  }
  return decoded;
}


/***/ }),

/***/ 6456:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "cv": () => (/* binding */ encode),
  "w$": () => (/* binding */ encodeCustom)
});

// UNUSED EXPORTS: Ref, makeCborEncoders, objectToTokens

;// CONCATENATED MODULE: ../node_modules/cborg/esm/lib/is.js
const typeofs = [
  'string',
  'number',
  'bigint',
  'symbol'
];
const objectTypeNames = [
  'Function',
  'Generator',
  'AsyncGenerator',
  'GeneratorFunction',
  'AsyncGeneratorFunction',
  'AsyncFunction',
  'Observable',
  'Array',
  'Buffer',
  'Object',
  'RegExp',
  'Date',
  'Error',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'ArrayBuffer',
  'SharedArrayBuffer',
  'DataView',
  'Promise',
  'URL',
  'HTMLElement',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array'
];
function is(value) {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (value === true || value === false) {
    return 'boolean';
  }
  const typeOf = typeof value;
  if (typeofs.includes(typeOf)) {
    return typeOf;
  }
  if (typeOf === 'function') {
    return 'Function';
  }
  if (Array.isArray(value)) {
    return 'Array';
  }
  if (isBuffer(value)) {
    return 'Buffer';
  }
  const objectType = getObjectType(value);
  if (objectType) {
    return objectType;
  }
  return 'Object';
}
function isBuffer(value) {
  return value && value.constructor && value.constructor.isBuffer && value.constructor.isBuffer.call(null, value);
}
function getObjectType(value) {
  const objectTypeName = Object.prototype.toString.call(value).slice(8, -1);
  if (objectTypeNames.includes(objectTypeName)) {
    return objectTypeName;
  }
  return undefined;
}
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/token.js
var token = __webpack_require__(1302);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/byte-utils.js
var byte_utils = __webpack_require__(1926);
;// CONCATENATED MODULE: ../node_modules/cborg/esm/lib/bl.js

const defaultChunkSize = 256;
class Bl {
  constructor(chunkSize = defaultChunkSize) {
    this.chunkSize = chunkSize;
    this.cursor = 0;
    this.maxCursor = -1;
    this.chunks = [];
    this._initReuseChunk = null;
  }
  reset() {
    this.cursor = 0;
    this.maxCursor = -1;
    if (this.chunks.length) {
      this.chunks = [];
    }
    if (this._initReuseChunk !== null) {
      this.chunks.push(this._initReuseChunk);
      this.maxCursor = this._initReuseChunk.length - 1;
    }
  }
  push(bytes) {
    let topChunk = this.chunks[this.chunks.length - 1];
    const newMax = this.cursor + bytes.length;
    if (newMax <= this.maxCursor + 1) {
      const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
      topChunk.set(bytes, chunkPos);
    } else {
      if (topChunk) {
        const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
        if (chunkPos < topChunk.length) {
          this.chunks[this.chunks.length - 1] = topChunk.subarray(0, chunkPos);
          this.maxCursor = this.cursor - 1;
        }
      }
      if (bytes.length < 64 && bytes.length < this.chunkSize) {
        topChunk = (0,byte_utils/* alloc */.un)(this.chunkSize);
        this.chunks.push(topChunk);
        this.maxCursor += topChunk.length;
        if (this._initReuseChunk === null) {
          this._initReuseChunk = topChunk;
        }
        topChunk.set(bytes, 0);
      } else {
        this.chunks.push(bytes);
        this.maxCursor += bytes.length;
      }
    }
    this.cursor += bytes.length;
  }
  toBytes(reset = false) {
    let byts;
    if (this.chunks.length === 1) {
      const chunk = this.chunks[0];
      if (reset && this.cursor > chunk.length / 2) {
        byts = this.cursor === chunk.length ? chunk : chunk.subarray(0, this.cursor);
        this._initReuseChunk = null;
        this.chunks = [];
      } else {
        byts = (0,byte_utils/* slice */.tP)(chunk, 0, this.cursor);
      }
    } else {
      byts = (0,byte_utils/* concat */.zo)(this.chunks, this.cursor);
    }
    if (reset) {
      this.reset();
    }
    return byts;
  }
}
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/common.js
var common = __webpack_require__(3002);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/jump.js
var jump = __webpack_require__(1266);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/0uint.js
var _0uint = __webpack_require__(7228);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/1negint.js
var _1negint = __webpack_require__(608);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/2bytes.js
var _2bytes = __webpack_require__(622);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/3string.js
var _3string = __webpack_require__(790);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/4array.js
var _4array = __webpack_require__(7656);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/5map.js
var _5map = __webpack_require__(1613);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/6tag.js
var _6tag = __webpack_require__(6589);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/7float.js
var _7float = __webpack_require__(3964);
;// CONCATENATED MODULE: ../node_modules/cborg/esm/lib/encode.js














const defaultEncodeOptions = {
  float64: false,
  mapSorter,
  quickEncodeToken: jump/* quickEncodeToken */.JN
};
function makeCborEncoders() {
  const encoders = [];
  encoders[token/* Type.uint.major */.D.uint.major] = _0uint/* encodeUint */.Fh;
  encoders[token/* Type.negint.major */.D.negint.major] = _1negint/* encodeNegint */.UT;
  encoders[token/* Type.bytes.major */.D.bytes.major] = _2bytes/* encodeBytes */.hg;
  encoders[token/* Type.string.major */.D.string.major] = _3string/* encodeString */.YW;
  encoders[token/* Type.array.major */.D.array.major] = _4array/* encodeArray */.HF;
  encoders[token/* Type.map.major */.D.map.major] = _5map/* encodeMap */.KI;
  encoders[token/* Type.tag.major */.D.tag.major] = _6tag/* encodeTag */.xy;
  encoders[token/* Type.float.major */.D.float.major] = _7float/* encodeFloat */.tA;
  return encoders;
}
const cborEncoders = makeCborEncoders();
const buf = new Bl();
class Ref {
  constructor(obj, parent) {
    this.obj = obj;
    this.parent = parent;
  }
  includes(obj) {
    let p = this;
    do {
      if (p.obj === obj) {
        return true;
      }
    } while (p = p.parent);
    return false;
  }
  static createCheck(stack, obj) {
    if (stack && stack.includes(obj)) {
      throw new Error(`${ common/* encodeErrPrefix */.OO } object contains circular references`);
    }
    return new Ref(obj, stack);
  }
}
const simpleTokens = {
  null: new token/* Token */.W(token/* Type.null */.D["null"], null),
  undefined: new token/* Token */.W(token/* Type.undefined */.D.undefined, undefined),
  true: new token/* Token */.W(token/* Type.true */.D["true"], true),
  false: new token/* Token */.W(token/* Type.false */.D["false"], false),
  emptyArray: new token/* Token */.W(token/* Type.array */.D.array, 0),
  emptyMap: new token/* Token */.W(token/* Type.map */.D.map, 0)
};
const typeEncoders = {
  number(obj, _typ, _options, _refStack) {
    if (!Number.isInteger(obj) || !Number.isSafeInteger(obj)) {
      return new token/* Token */.W(token/* Type.float */.D.float, obj);
    } else if (obj >= 0) {
      return new token/* Token */.W(token/* Type.uint */.D.uint, obj);
    } else {
      return new token/* Token */.W(token/* Type.negint */.D.negint, obj);
    }
  },
  bigint(obj, _typ, _options, _refStack) {
    if (obj >= BigInt(0)) {
      return new token/* Token */.W(token/* Type.uint */.D.uint, obj);
    } else {
      return new token/* Token */.W(token/* Type.negint */.D.negint, obj);
    }
  },
  Uint8Array(obj, _typ, _options, _refStack) {
    return new token/* Token */.W(token/* Type.bytes */.D.bytes, obj);
  },
  string(obj, _typ, _options, _refStack) {
    return new token/* Token */.W(token/* Type.string */.D.string, obj);
  },
  boolean(obj, _typ, _options, _refStack) {
    return obj ? simpleTokens.true : simpleTokens.false;
  },
  null(_obj, _typ, _options, _refStack) {
    return simpleTokens.null;
  },
  undefined(_obj, _typ, _options, _refStack) {
    return simpleTokens.undefined;
  },
  ArrayBuffer(obj, _typ, _options, _refStack) {
    return new token/* Token */.W(token/* Type.bytes */.D.bytes, new Uint8Array(obj));
  },
  DataView(obj, _typ, _options, _refStack) {
    return new token/* Token */.W(token/* Type.bytes */.D.bytes, new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength));
  },
  Array(obj, _typ, options, refStack) {
    if (!obj.length) {
      if (options.addBreakTokens === true) {
        return [
          simpleTokens.emptyArray,
          new token/* Token */.W(token/* Type.break */.D["break"])
        ];
      }
      return simpleTokens.emptyArray;
    }
    refStack = Ref.createCheck(refStack, obj);
    const entries = [];
    let i = 0;
    for (const e of obj) {
      entries[i++] = objectToTokens(e, options, refStack);
    }
    if (options.addBreakTokens) {
      return [
        new token/* Token */.W(token/* Type.array */.D.array, obj.length),
        entries,
        new token/* Token */.W(token/* Type.break */.D["break"])
      ];
    }
    return [
      new token/* Token */.W(token/* Type.array */.D.array, obj.length),
      entries
    ];
  },
  Object(obj, typ, options, refStack) {
    const isMap = typ !== 'Object';
    const keys = isMap ? obj.keys() : Object.keys(obj);
    const length = isMap ? obj.size : keys.length;
    if (!length) {
      if (options.addBreakTokens === true) {
        return [
          simpleTokens.emptyMap,
          new token/* Token */.W(token/* Type.break */.D["break"])
        ];
      }
      return simpleTokens.emptyMap;
    }
    refStack = Ref.createCheck(refStack, obj);
    const entries = [];
    let i = 0;
    for (const key of keys) {
      entries[i++] = [
        objectToTokens(key, options, refStack),
        objectToTokens(isMap ? obj.get(key) : obj[key], options, refStack)
      ];
    }
    sortMapEntries(entries, options);
    if (options.addBreakTokens) {
      return [
        new token/* Token */.W(token/* Type.map */.D.map, length),
        entries,
        new token/* Token */.W(token/* Type.break */.D["break"])
      ];
    }
    return [
      new token/* Token */.W(token/* Type.map */.D.map, length),
      entries
    ];
  }
};
typeEncoders.Map = typeEncoders.Object;
typeEncoders.Buffer = typeEncoders.Uint8Array;
for (const typ of 'Uint8Clamped Uint16 Uint32 Int8 Int16 Int32 BigUint64 BigInt64 Float32 Float64'.split(' ')) {
  typeEncoders[`${ typ }Array`] = typeEncoders.DataView;
}
function objectToTokens(obj, options = {}, refStack) {
  const typ = is(obj);
  const customTypeEncoder = options && options.typeEncoders && options.typeEncoders[typ] || typeEncoders[typ];
  if (typeof customTypeEncoder === 'function') {
    const tokens = customTypeEncoder(obj, typ, options, refStack);
    if (tokens != null) {
      return tokens;
    }
  }
  const typeEncoder = typeEncoders[typ];
  if (!typeEncoder) {
    throw new Error(`${ common/* encodeErrPrefix */.OO } unsupported type: ${ typ }`);
  }
  return typeEncoder(obj, typ, options, refStack);
}
function sortMapEntries(entries, options) {
  if (options.mapSorter) {
    entries.sort(options.mapSorter);
  }
}
function mapSorter(e1, e2) {
  const keyToken1 = Array.isArray(e1[0]) ? e1[0][0] : e1[0];
  const keyToken2 = Array.isArray(e2[0]) ? e2[0][0] : e2[0];
  if (keyToken1.type !== keyToken2.type) {
    return keyToken1.type.compare(keyToken2.type);
  }
  const major = keyToken1.type.major;
  const tcmp = cborEncoders[major].compareTokens(keyToken1, keyToken2);
  if (tcmp === 0) {
    console.warn('WARNING: complex key types used, CBOR key sorting guarantees are gone');
  }
  return tcmp;
}
function tokensToEncoded(buf, tokens, encoders, options) {
  if (Array.isArray(tokens)) {
    for (const token of tokens) {
      tokensToEncoded(buf, token, encoders, options);
    }
  } else {
    encoders[tokens.type.major](buf, tokens, options);
  }
}
function encodeCustom(data, encoders, options) {
  const tokens = objectToTokens(data, options);
  if (!Array.isArray(tokens) && options.quickEncodeToken) {
    const quickBytes = options.quickEncodeToken(tokens);
    if (quickBytes) {
      return quickBytes;
    }
    const encoder = encoders[tokens.type.major];
    if (encoder.encodedSize) {
      const size = encoder.encodedSize(tokens, options);
      const buf = new Bl(size);
      encoder(buf, tokens, options);
      if (buf.chunks.length !== 1) {
        throw new Error(`Unexpected error: pre-calculated length for ${ tokens } was wrong`);
      }
      return (0,byte_utils/* asU8A */.Dz)(buf.chunks[0]);
    }
  }
  buf.reset();
  tokensToEncoded(buf, tokens, encoders, options);
  return buf.toBytes(true);
}
function encode(data, options) {
  options = Object.assign({}, defaultEncodeOptions, options);
  return encodeCustom(data, cborEncoders, options);
}


/***/ }),

/***/ 1266:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JN": () => (/* binding */ quickEncodeToken),
/* harmony export */   "PS": () => (/* binding */ quick),
/* harmony export */   "cW": () => (/* binding */ jump)
/* harmony export */ });
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1302);
/* harmony import */ var _0uint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7228);
/* harmony import */ var _1negint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(608);
/* harmony import */ var _2bytes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(622);
/* harmony import */ var _3string_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(790);
/* harmony import */ var _4array_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7656);
/* harmony import */ var _5map_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1613);
/* harmony import */ var _6tag_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(6589);
/* harmony import */ var _7float_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(3964);
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(3002);
/* harmony import */ var _byte_utils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(1926);











function invalidMinor(data, pos, minor) {
  throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_9__/* .decodeErrPrefix */ .IR } encountered invalid minor (${ minor }) for major ${ data[pos] >>> 5 }`);
}
function errorer(msg) {
  return () => {
    throw new Error(`${ _common_js__WEBPACK_IMPORTED_MODULE_9__/* .decodeErrPrefix */ .IR } ${ msg }`);
  };
}
const jump = [];
for (let i = 0; i <= 23; i++) {
  jump[i] = invalidMinor;
}
jump[24] = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeUint8 */ .Km;
jump[25] = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeUint16 */ .Zh;
jump[26] = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeUint32 */ .cs;
jump[27] = _0uint_js__WEBPACK_IMPORTED_MODULE_1__/* .decodeUint64 */ .uN;
jump[28] = invalidMinor;
jump[29] = invalidMinor;
jump[30] = invalidMinor;
jump[31] = invalidMinor;
for (let i = 32; i <= 55; i++) {
  jump[i] = invalidMinor;
}
jump[56] = _1negint_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeNegint8 */ .yr;
jump[57] = _1negint_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeNegint16 */ .r0;
jump[58] = _1negint_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeNegint32 */ .wy;
jump[59] = _1negint_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeNegint64 */ .ec;
jump[60] = invalidMinor;
jump[61] = invalidMinor;
jump[62] = invalidMinor;
jump[63] = invalidMinor;
for (let i = 64; i <= 87; i++) {
  jump[i] = _2bytes_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeBytesCompact */ .Ii;
}
jump[88] = _2bytes_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeBytes8 */ .UQ;
jump[89] = _2bytes_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeBytes16 */ .BS;
jump[90] = _2bytes_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeBytes32 */ .zU;
jump[91] = _2bytes_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeBytes64 */ .ME;
jump[92] = invalidMinor;
jump[93] = invalidMinor;
jump[94] = invalidMinor;
jump[95] = errorer('indefinite length bytes/strings are not supported');
for (let i = 96; i <= 119; i++) {
  jump[i] = _3string_js__WEBPACK_IMPORTED_MODULE_4__/* .decodeStringCompact */ .nt;
}
jump[120] = _3string_js__WEBPACK_IMPORTED_MODULE_4__/* .decodeString8 */ .Bq;
jump[121] = _3string_js__WEBPACK_IMPORTED_MODULE_4__/* .decodeString16 */ .h;
jump[122] = _3string_js__WEBPACK_IMPORTED_MODULE_4__/* .decodeString32 */ .q0;
jump[123] = _3string_js__WEBPACK_IMPORTED_MODULE_4__/* .decodeString64 */ .bc;
jump[124] = invalidMinor;
jump[125] = invalidMinor;
jump[126] = invalidMinor;
jump[127] = errorer('indefinite length bytes/strings are not supported');
for (let i = 128; i <= 151; i++) {
  jump[i] = _4array_js__WEBPACK_IMPORTED_MODULE_5__/* .decodeArrayCompact */ .Ju;
}
jump[152] = _4array_js__WEBPACK_IMPORTED_MODULE_5__/* .decodeArray8 */ .h7;
jump[153] = _4array_js__WEBPACK_IMPORTED_MODULE_5__/* .decodeArray16 */ .OC;
jump[154] = _4array_js__WEBPACK_IMPORTED_MODULE_5__/* .decodeArray32 */ .lY;
jump[155] = _4array_js__WEBPACK_IMPORTED_MODULE_5__/* .decodeArray64 */ .a8;
jump[156] = invalidMinor;
jump[157] = invalidMinor;
jump[158] = invalidMinor;
jump[159] = _4array_js__WEBPACK_IMPORTED_MODULE_5__/* .decodeArrayIndefinite */ .s5;
for (let i = 160; i <= 183; i++) {
  jump[i] = _5map_js__WEBPACK_IMPORTED_MODULE_6__/* .decodeMapCompact */ ._K;
}
jump[184] = _5map_js__WEBPACK_IMPORTED_MODULE_6__/* .decodeMap8 */ .G;
jump[185] = _5map_js__WEBPACK_IMPORTED_MODULE_6__/* .decodeMap16 */ .qe;
jump[186] = _5map_js__WEBPACK_IMPORTED_MODULE_6__/* .decodeMap32 */ .IY;
jump[187] = _5map_js__WEBPACK_IMPORTED_MODULE_6__/* .decodeMap64 */ .F2;
jump[188] = invalidMinor;
jump[189] = invalidMinor;
jump[190] = invalidMinor;
jump[191] = _5map_js__WEBPACK_IMPORTED_MODULE_6__/* .decodeMapIndefinite */ .ng;
for (let i = 192; i <= 215; i++) {
  jump[i] = _6tag_js__WEBPACK_IMPORTED_MODULE_7__/* .decodeTagCompact */ .qJ;
}
jump[216] = _6tag_js__WEBPACK_IMPORTED_MODULE_7__/* .decodeTag8 */ .ZR;
jump[217] = _6tag_js__WEBPACK_IMPORTED_MODULE_7__/* .decodeTag16 */ .CF;
jump[218] = _6tag_js__WEBPACK_IMPORTED_MODULE_7__/* .decodeTag32 */ .vP;
jump[219] = _6tag_js__WEBPACK_IMPORTED_MODULE_7__/* .decodeTag64 */ .MV;
jump[220] = invalidMinor;
jump[221] = invalidMinor;
jump[222] = invalidMinor;
jump[223] = invalidMinor;
for (let i = 224; i <= 243; i++) {
  jump[i] = errorer('simple values are not supported');
}
jump[244] = invalidMinor;
jump[245] = invalidMinor;
jump[246] = invalidMinor;
jump[247] = _7float_js__WEBPACK_IMPORTED_MODULE_8__/* .decodeUndefined */ .h1;
jump[248] = errorer('simple values are not supported');
jump[249] = _7float_js__WEBPACK_IMPORTED_MODULE_8__/* .decodeFloat16 */ .mW;
jump[250] = _7float_js__WEBPACK_IMPORTED_MODULE_8__/* .decodeFloat32 */ .GI;
jump[251] = _7float_js__WEBPACK_IMPORTED_MODULE_8__/* .decodeFloat64 */ .vV;
jump[252] = invalidMinor;
jump[253] = invalidMinor;
jump[254] = invalidMinor;
jump[255] = _7float_js__WEBPACK_IMPORTED_MODULE_8__/* .decodeBreak */ .y7;
const quick = [];
for (let i = 0; i < 24; i++) {
  quick[i] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.uint */ .D.uint, i, 1);
}
for (let i = -1; i >= -24; i--) {
  quick[31 - i] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.negint */ .D.negint, i, 1);
}
quick[64] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.bytes */ .D.bytes, new Uint8Array(0), 1);
quick[96] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.string */ .D.string, '', 1);
quick[128] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.array */ .D.array, 0, 1);
quick[160] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.map */ .D.map, 0, 1);
quick[244] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["false"] */ .D["false"], false, 1);
quick[245] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["true"] */ .D["true"], true, 1);
quick[246] = new _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .W(_token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["null"] */ .D["null"], null, 1);
function quickEncodeToken(token) {
  switch (token.type) {
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["false"] */ .D["false"]:
    return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([244]);
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["true"] */ .D["true"]:
    return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([245]);
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type["null"] */ .D["null"]:
    return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([246]);
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.bytes */ .D.bytes:
    if (!token.value.length) {
      return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([64]);
    }
    return;
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.string */ .D.string:
    if (token.value === '') {
      return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([96]);
    }
    return;
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.array */ .D.array:
    if (token.value === 0) {
      return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([128]);
    }
    return;
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.map */ .D.map:
    if (token.value === 0) {
      return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([160]);
    }
    return;
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.uint */ .D.uint:
    if (token.value < 24) {
      return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([Number(token.value)]);
    }
    return;
  case _token_js__WEBPACK_IMPORTED_MODULE_0__/* .Type.negint */ .D.negint:
    if (token.value >= -24) {
      return (0,_byte_utils_js__WEBPACK_IMPORTED_MODULE_10__/* .fromArray */ .nI)([31 - Number(token.value)]);
    }
  }
}

/***/ }),

/***/ 1302:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "D": () => (/* binding */ Type),
/* harmony export */   "W": () => (/* binding */ Token)
/* harmony export */ });
class Type {
  constructor(major, name, terminal) {
    this.major = major;
    this.majorEncoded = major << 5;
    this.name = name;
    this.terminal = terminal;
  }
  toString() {
    return `Type[${ this.major }].${ this.name }`;
  }
  compare(typ) {
    return this.major < typ.major ? -1 : this.major > typ.major ? 1 : 0;
  }
}
Type.uint = new Type(0, 'uint', true);
Type.negint = new Type(1, 'negint', true);
Type.bytes = new Type(2, 'bytes', true);
Type.string = new Type(3, 'string', true);
Type.array = new Type(4, 'array', false);
Type.map = new Type(5, 'map', false);
Type.tag = new Type(6, 'tag', false);
Type.float = new Type(7, 'float', true);
Type.false = new Type(7, 'false', true);
Type.true = new Type(7, 'true', true);
Type.null = new Type(7, 'null', true);
Type.undefined = new Type(7, 'undefined', true);
Type.break = new Type(7, 'break', true);
class Token {
  constructor(type, value, encodedLength) {
    this.type = type;
    this.value = value;
    this.encodedLength = encodedLength;
    this.encodedBytes = undefined;
    this.byteValue = undefined;
  }
  toString() {
    return `Token[${ this.type }].${ this.value }`;
  }
}


/***/ }),

/***/ 7262:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "code": () => (/* binding */ code),
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode),
/* harmony export */   "name": () => (/* binding */ name)
/* harmony export */ });
/* harmony import */ var cborg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(308);
/* harmony import */ var multiformats_cid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3036);


const CID_CBOR_TAG = 42;
function cidEncoder(obj) {
  if (obj.asCID !== obj) {
    return null;
  }
  const cid = multiformats_cid__WEBPACK_IMPORTED_MODULE_1__.CID.asCID(obj);
  if (!cid) {
    return null;
  }
  const bytes = new Uint8Array(cid.bytes.byteLength + 1);
  bytes.set(cid.bytes, 1);
  return [
    new cborg__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .WU(cborg__WEBPACK_IMPORTED_MODULE_0__/* .Type.tag */ .Dy.tag, CID_CBOR_TAG),
    new cborg__WEBPACK_IMPORTED_MODULE_0__/* .Token */ .WU(cborg__WEBPACK_IMPORTED_MODULE_0__/* .Type.bytes */ .Dy.bytes, bytes)
  ];
}
function undefinedEncoder() {
  throw new Error('`undefined` is not supported by the IPLD Data Model and cannot be encoded');
}
function numberEncoder(num) {
  if (Number.isNaN(num)) {
    throw new Error('`NaN` is not supported by the IPLD Data Model and cannot be encoded');
  }
  if (num === Infinity || num === -Infinity) {
    throw new Error('`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded');
  }
  return null;
}
const encodeOptions = {
  float64: true,
  typeEncoders: {
    Object: cidEncoder,
    undefined: undefinedEncoder,
    number: numberEncoder
  }
};
function cidDecoder(bytes) {
  if (bytes[0] !== 0) {
    throw new Error('Invalid CID for CBOR tag 42; expected leading 0x00');
  }
  return multiformats_cid__WEBPACK_IMPORTED_MODULE_1__.CID.decode(bytes.subarray(1));
}
const decodeOptions = {
  allowIndefinite: false,
  allowUndefined: false,
  allowNaN: false,
  allowInfinity: false,
  allowBigInt: true,
  strict: true,
  useMaps: false,
  tags: []
};
decodeOptions.tags[CID_CBOR_TAG] = cidDecoder;
const name = 'dag-cbor';
const code = 113;
const encode = node => cborg__WEBPACK_IMPORTED_MODULE_0__/* .encode */ .cv(node, encodeOptions);
const decode = data => cborg__WEBPACK_IMPORTED_MODULE_0__/* .decode */ .Jx(data, decodeOptions);

/***/ }),

/***/ 2708:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "CID": () => (/* reexport */ src_cid.CID),
  "create": () => (/* binding */ create),
  "globSource": () => (/* binding */ globSource),
  "multiaddr": () => (/* reexport */ multiaddr_src.Multiaddr),
  "urlSource": () => (/* reexport */ url_source)
});

// NAMESPACE OBJECT: ../node_modules/@ipld/dag-pb/esm/src/index.js
var src_namespaceObject = {};
__webpack_require__.r(src_namespaceObject);
__webpack_require__.d(src_namespaceObject, {
  "code": () => (code),
  "createLink": () => (createLink),
  "createNode": () => (createNode),
  "decode": () => (decode),
  "encode": () => (encode),
  "name": () => (src_name),
  "prepare": () => (prepare),
  "validate": () => (validate)
});

// NAMESPACE OBJECT: ../node_modules/@ipld/dag-cbor/esm/index.js
var esm_namespaceObject = {};
__webpack_require__.r(esm_namespaceObject);
__webpack_require__.d(esm_namespaceObject, {
  "code": () => (esm_code),
  "decode": () => (esm_decode),
  "encode": () => (esm_encode),
  "name": () => (esm_name)
});

// NAMESPACE OBJECT: ../node_modules/@ipld/dag-json/esm/index.js
var dag_json_esm_namespaceObject = {};
__webpack_require__.r(dag_json_esm_namespaceObject);
__webpack_require__.d(dag_json_esm_namespaceObject, {
  "code": () => (dag_json_esm_code),
  "decode": () => (dag_json_esm_decode),
  "encode": () => (dag_json_esm_encode),
  "name": () => (dag_json_esm_name)
});

;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/multibases.js
const LOAD_BASE = name => Promise.reject(new Error(`No base found for "${ name }"`));
class Multibases {
  constructor(options) {
    this._basesByName = {};
    this._basesByPrefix = {};
    this._loadBase = options.loadBase || LOAD_BASE;
    for (const base of options.bases) {
      this.addBase(base);
    }
  }
  addBase(base) {
    if (this._basesByName[base.name] || this._basesByPrefix[base.prefix]) {
      throw new Error(`Codec already exists for codec "${ base.name }"`);
    }
    this._basesByName[base.name] = base;
    this._basesByPrefix[base.prefix] = base;
  }
  removeBase(base) {
    delete this._basesByName[base.name];
    delete this._basesByPrefix[base.prefix];
  }
  async getBase(nameOrPrefix) {
    if (this._basesByName[nameOrPrefix]) {
      return this._basesByName[nameOrPrefix];
    }
    if (this._basesByPrefix[nameOrPrefix]) {
      return this._basesByPrefix[nameOrPrefix];
    }
    const base = await this._loadBase(nameOrPrefix);
    if (this._basesByName[base.name] == null && this._basesByPrefix[base.prefix] == null) {
      this.addBase(base);
    }
    return base;
  }
  listBases() {
    return Object.values(this._basesByName);
  }
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/multicodecs.js
const LOAD_CODEC = codeOrName => Promise.reject(new Error(`No codec found for "${ codeOrName }"`));
class Multicodecs {
  constructor(options) {
    this._codecsByName = {};
    this._codecsByCode = {};
    this._loadCodec = options.loadCodec || LOAD_CODEC;
    for (const codec of options.codecs) {
      this.addCodec(codec);
    }
  }
  addCodec(codec) {
    if (this._codecsByName[codec.name] || this._codecsByCode[codec.code]) {
      throw new Error(`Resolver already exists for codec "${ codec.name }"`);
    }
    this._codecsByName[codec.name] = codec;
    this._codecsByCode[codec.code] = codec;
  }
  removeCodec(codec) {
    delete this._codecsByName[codec.name];
    delete this._codecsByCode[codec.code];
  }
  async getCodec(code) {
    const table = typeof code === 'string' ? this._codecsByName : this._codecsByCode;
    if (table[code]) {
      return table[code];
    }
    const codec = await this._loadCodec(code);
    if (table[code] == null) {
      this.addCodec(codec);
    }
    return codec;
  }
  listCodecs() {
    return Object.values(this._codecsByName);
  }
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/multihashes.js
const LOAD_HASHER = codeOrName => Promise.reject(new Error(`No hasher found for "${ codeOrName }"`));
class Multihashes {
  constructor(options) {
    this._hashersByName = {};
    this._hashersByCode = {};
    this._loadHasher = options.loadHasher || LOAD_HASHER;
    for (const hasher of options.hashers) {
      this.addHasher(hasher);
    }
  }
  addHasher(hasher) {
    if (this._hashersByName[hasher.name] || this._hashersByCode[hasher.code]) {
      throw new Error(`Resolver already exists for codec "${ hasher.name }"`);
    }
    this._hashersByName[hasher.name] = hasher;
    this._hashersByCode[hasher.code] = hasher;
  }
  removeHasher(hasher) {
    delete this._hashersByName[hasher.name];
    delete this._hashersByCode[hasher.code];
  }
  async getHasher(code) {
    const table = typeof code === 'string' ? this._hashersByName : this._hashersByCode;
    if (table[code]) {
      return table[code];
    }
    const hasher = await this._loadHasher(code);
    if (table[code] == null) {
      this.addHasher(hasher);
    }
    return hasher;
  }
  listHashers() {
    return Object.values(this._hashersByName);
  }
}
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/cid.js
var src_cid = __webpack_require__(3036);
;// CONCATENATED MODULE: ../node_modules/@ipld/dag-pb/esm/src/pb-decode.js
const textDecoder = new TextDecoder();
function decodeVarint(bytes, offset) {
  let v = 0;
  for (let shift = 0;; shift += 7) {
    if (shift >= 64) {
      throw new Error('protobuf: varint overflow');
    }
    if (offset >= bytes.length) {
      throw new Error('protobuf: unexpected end of data');
    }
    const b = bytes[offset++];
    v += shift < 28 ? (b & 127) << shift : (b & 127) * 2 ** shift;
    if (b < 128) {
      break;
    }
  }
  return [
    v,
    offset
  ];
}
function decodeBytes(bytes, offset) {
  let byteLen;
  [byteLen, offset] = decodeVarint(bytes, offset);
  const postOffset = offset + byteLen;
  if (byteLen < 0 || postOffset < 0) {
    throw new Error('protobuf: invalid length');
  }
  if (postOffset > bytes.length) {
    throw new Error('protobuf: unexpected end of data');
  }
  return [
    bytes.subarray(offset, postOffset),
    postOffset
  ];
}
function decodeKey(bytes, index) {
  let wire;
  [wire, index] = decodeVarint(bytes, index);
  return [
    wire & 7,
    wire >> 3,
    index
  ];
}
function decodeLink(bytes) {
  const link = {};
  const l = bytes.length;
  let index = 0;
  while (index < l) {
    let wireType, fieldNum;
    [wireType, fieldNum, index] = decodeKey(bytes, index);
    if (fieldNum === 1) {
      if (link.Hash) {
        throw new Error('protobuf: (PBLink) duplicate Hash section');
      }
      if (wireType !== 2) {
        throw new Error(`protobuf: (PBLink) wrong wireType (${ wireType }) for Hash`);
      }
      if (link.Name !== undefined) {
        throw new Error('protobuf: (PBLink) invalid order, found Name before Hash');
      }
      if (link.Tsize !== undefined) {
        throw new Error('protobuf: (PBLink) invalid order, found Tsize before Hash');
      }
      ;
      [link.Hash, index] = decodeBytes(bytes, index);
    } else if (fieldNum === 2) {
      if (link.Name !== undefined) {
        throw new Error('protobuf: (PBLink) duplicate Name section');
      }
      if (wireType !== 2) {
        throw new Error(`protobuf: (PBLink) wrong wireType (${ wireType }) for Name`);
      }
      if (link.Tsize !== undefined) {
        throw new Error('protobuf: (PBLink) invalid order, found Tsize before Name');
      }
      let byts;
      [byts, index] = decodeBytes(bytes, index);
      link.Name = textDecoder.decode(byts);
    } else if (fieldNum === 3) {
      if (link.Tsize !== undefined) {
        throw new Error('protobuf: (PBLink) duplicate Tsize section');
      }
      if (wireType !== 0) {
        throw new Error(`protobuf: (PBLink) wrong wireType (${ wireType }) for Tsize`);
      }
      ;
      [link.Tsize, index] = decodeVarint(bytes, index);
    } else {
      throw new Error(`protobuf: (PBLink) invalid fieldNumber, expected 1, 2 or 3, got ${ fieldNum }`);
    }
  }
  if (index > l) {
    throw new Error('protobuf: (PBLink) unexpected end of data');
  }
  return link;
}
function decodeNode(bytes) {
  const l = bytes.length;
  let index = 0;
  let links;
  let linksBeforeData = false;
  let data;
  while (index < l) {
    let wireType, fieldNum;
    [wireType, fieldNum, index] = decodeKey(bytes, index);
    if (wireType !== 2) {
      throw new Error(`protobuf: (PBNode) invalid wireType, expected 2, got ${ wireType }`);
    }
    if (fieldNum === 1) {
      if (data) {
        throw new Error('protobuf: (PBNode) duplicate Data section');
      }
      ;
      [data, index] = decodeBytes(bytes, index);
      if (links) {
        linksBeforeData = true;
      }
    } else if (fieldNum === 2) {
      if (linksBeforeData) {
        throw new Error('protobuf: (PBNode) duplicate Links section');
      } else if (!links) {
        links = [];
      }
      let byts;
      [byts, index] = decodeBytes(bytes, index);
      links.push(decodeLink(byts));
    } else {
      throw new Error(`protobuf: (PBNode) invalid fieldNumber, expected 1 or 2, got ${ fieldNum }`);
    }
  }
  if (index > l) {
    throw new Error('protobuf: (PBNode) unexpected end of data');
  }
  const node = {};
  if (data) {
    node.Data = data;
  }
  node.Links = links || [];
  return node;
}
;// CONCATENATED MODULE: ../node_modules/@ipld/dag-pb/esm/src/pb-encode.js
const textEncoder = new TextEncoder();
const maxInt32 = 2 ** 32;
const maxUInt32 = 2 ** 31;
function encodeLink(link, bytes) {
  let i = bytes.length;
  if (typeof link.Tsize === 'number') {
    if (link.Tsize < 0) {
      throw new Error('Tsize cannot be negative');
    }
    if (!Number.isSafeInteger(link.Tsize)) {
      throw new Error('Tsize too large for encoding');
    }
    i = encodeVarint(bytes, i, link.Tsize) - 1;
    bytes[i] = 24;
  }
  if (typeof link.Name === 'string') {
    const nameBytes = textEncoder.encode(link.Name);
    i -= nameBytes.length;
    bytes.set(nameBytes, i);
    i = encodeVarint(bytes, i, nameBytes.length) - 1;
    bytes[i] = 18;
  }
  if (link.Hash) {
    i -= link.Hash.length;
    bytes.set(link.Hash, i);
    i = encodeVarint(bytes, i, link.Hash.length) - 1;
    bytes[i] = 10;
  }
  return bytes.length - i;
}
function encodeNode(node) {
  const size = sizeNode(node);
  const bytes = new Uint8Array(size);
  let i = size;
  if (node.Data) {
    i -= node.Data.length;
    bytes.set(node.Data, i);
    i = encodeVarint(bytes, i, node.Data.length) - 1;
    bytes[i] = 10;
  }
  if (node.Links) {
    for (let index = node.Links.length - 1; index >= 0; index--) {
      const size = encodeLink(node.Links[index], bytes.subarray(0, i));
      i -= size;
      i = encodeVarint(bytes, i, size) - 1;
      bytes[i] = 18;
    }
  }
  return bytes;
}
function sizeLink(link) {
  let n = 0;
  if (link.Hash) {
    const l = link.Hash.length;
    n += 1 + l + sov(l);
  }
  if (typeof link.Name === 'string') {
    const l = textEncoder.encode(link.Name).length;
    n += 1 + l + sov(l);
  }
  if (typeof link.Tsize === 'number') {
    n += 1 + sov(link.Tsize);
  }
  return n;
}
function sizeNode(node) {
  let n = 0;
  if (node.Data) {
    const l = node.Data.length;
    n += 1 + l + sov(l);
  }
  if (node.Links) {
    for (const link of node.Links) {
      const l = sizeLink(link);
      n += 1 + l + sov(l);
    }
  }
  return n;
}
function encodeVarint(bytes, offset, v) {
  offset -= sov(v);
  const base = offset;
  while (v >= maxUInt32) {
    bytes[offset++] = v & 127 | 128;
    v /= 128;
  }
  while (v >= 128) {
    bytes[offset++] = v & 127 | 128;
    v >>>= 7;
  }
  bytes[offset] = v;
  return base;
}
function sov(x) {
  if (x % 2 === 0) {
    x++;
  }
  return Math.floor((len64(x) + 6) / 7);
}
function len64(x) {
  let n = 0;
  if (x >= maxInt32) {
    x = Math.floor(x / maxInt32);
    n = 32;
  }
  if (x >= 1 << 16) {
    x >>>= 16;
    n += 16;
  }
  if (x >= 1 << 8) {
    x >>>= 8;
    n += 8;
  }
  return n + len8tab[x];
}
const len8tab = [
  0,
  1,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  7,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8
];
;// CONCATENATED MODULE: ../node_modules/@ipld/dag-pb/esm/src/util.js

const pbNodeProperties = [
  'Data',
  'Links'
];
const pbLinkProperties = [
  'Hash',
  'Name',
  'Tsize'
];
const util_textEncoder = new TextEncoder();
function linkComparator(a, b) {
  if (a === b) {
    return 0;
  }
  const abuf = a.Name ? util_textEncoder.encode(a.Name) : [];
  const bbuf = b.Name ? util_textEncoder.encode(b.Name) : [];
  let x = abuf.length;
  let y = bbuf.length;
  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
    if (abuf[i] !== bbuf[i]) {
      x = abuf[i];
      y = bbuf[i];
      break;
    }
  }
  return x < y ? -1 : y < x ? 1 : 0;
}
function hasOnlyProperties(node, properties) {
  return !Object.keys(node).some(p => !properties.includes(p));
}
function asLink(link) {
  if (typeof link.asCID === 'object') {
    const Hash = src_cid.CID.asCID(link);
    if (!Hash) {
      throw new TypeError('Invalid DAG-PB form');
    }
    return { Hash };
  }
  if (typeof link !== 'object' || Array.isArray(link)) {
    throw new TypeError('Invalid DAG-PB form');
  }
  const pbl = {};
  if (link.Hash) {
    let cid = src_cid.CID.asCID(link.Hash);
    try {
      if (!cid) {
        if (typeof link.Hash === 'string') {
          cid = src_cid.CID.parse(link.Hash);
        } else if (link.Hash instanceof Uint8Array) {
          cid = src_cid.CID.decode(link.Hash);
        }
      }
    } catch (e) {
      throw new TypeError(`Invalid DAG-PB form: ${ e.message }`);
    }
    if (cid) {
      pbl.Hash = cid;
    }
  }
  if (!pbl.Hash) {
    throw new TypeError('Invalid DAG-PB form');
  }
  if (typeof link.Name === 'string') {
    pbl.Name = link.Name;
  }
  if (typeof link.Tsize === 'number') {
    pbl.Tsize = link.Tsize;
  }
  return pbl;
}
function prepare(node) {
  if (node instanceof Uint8Array || typeof node === 'string') {
    node = { Data: node };
  }
  if (typeof node !== 'object' || Array.isArray(node)) {
    throw new TypeError('Invalid DAG-PB form');
  }
  const pbn = {};
  if (node.Data !== undefined) {
    if (typeof node.Data === 'string') {
      pbn.Data = util_textEncoder.encode(node.Data);
    } else if (node.Data instanceof Uint8Array) {
      pbn.Data = node.Data;
    } else {
      throw new TypeError('Invalid DAG-PB form');
    }
  }
  if (node.Links !== undefined) {
    if (Array.isArray(node.Links)) {
      pbn.Links = node.Links.map(asLink);
      pbn.Links.sort(linkComparator);
    } else {
      throw new TypeError('Invalid DAG-PB form');
    }
  } else {
    pbn.Links = [];
  }
  return pbn;
}
function validate(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new TypeError('Invalid DAG-PB form');
  }
  if (!hasOnlyProperties(node, pbNodeProperties)) {
    throw new TypeError('Invalid DAG-PB form (extraneous properties)');
  }
  if (node.Data !== undefined && !(node.Data instanceof Uint8Array)) {
    throw new TypeError('Invalid DAG-PB form (Data must be a Uint8Array)');
  }
  if (!Array.isArray(node.Links)) {
    throw new TypeError('Invalid DAG-PB form (Links must be an array)');
  }
  for (let i = 0; i < node.Links.length; i++) {
    const link = node.Links[i];
    if (!link || typeof link !== 'object' || Array.isArray(link)) {
      throw new TypeError('Invalid DAG-PB form (bad link object)');
    }
    if (!hasOnlyProperties(link, pbLinkProperties)) {
      throw new TypeError('Invalid DAG-PB form (extraneous properties on link object)');
    }
    if (!link.Hash) {
      throw new TypeError('Invalid DAG-PB form (link must have a Hash)');
    }
    if (link.Hash.asCID !== link.Hash) {
      throw new TypeError('Invalid DAG-PB form (link Hash must be a CID)');
    }
    if (link.Name !== undefined && typeof link.Name !== 'string') {
      throw new TypeError('Invalid DAG-PB form (link Name must be a string)');
    }
    if (link.Tsize !== undefined && (typeof link.Tsize !== 'number' || link.Tsize % 1 !== 0)) {
      throw new TypeError('Invalid DAG-PB form (link Tsize must be an integer)');
    }
    if (i > 0 && linkComparator(link, node.Links[i - 1]) === -1) {
      throw new TypeError('Invalid DAG-PB form (links must be sorted by Name bytes)');
    }
  }
}
function createNode(data, links = []) {
  return prepare({
    Data: data,
    Links: links
  });
}
function createLink(name, size, cid) {
  return asLink({
    Hash: cid,
    Name: name,
    Tsize: size
  });
}
;// CONCATENATED MODULE: ../node_modules/@ipld/dag-pb/esm/src/index.js




const src_name = 'dag-pb';
const code = 112;
function encode(node) {
  validate(node);
  const pbn = {};
  if (node.Links) {
    pbn.Links = node.Links.map(l => {
      const link = {};
      if (l.Hash) {
        link.Hash = l.Hash.bytes;
      }
      if (l.Name !== undefined) {
        link.Name = l.Name;
      }
      if (l.Tsize !== undefined) {
        link.Tsize = l.Tsize;
      }
      return link;
    });
  }
  if (node.Data) {
    pbn.Data = node.Data;
  }
  return encodeNode(pbn);
}
function decode(bytes) {
  const pbn = decodeNode(bytes);
  const node = {};
  if (pbn.Data) {
    node.Data = pbn.Data;
  }
  if (pbn.Links) {
    node.Links = pbn.Links.map(l => {
      const link = {};
      try {
        link.Hash = src_cid.CID.decode(l.Hash);
      } catch (e) {
      }
      if (!link.Hash) {
        throw new Error('Invalid Hash field found in link, expected CID');
      }
      if (l.Name !== undefined) {
        link.Name = l.Name;
      }
      if (l.Tsize !== undefined) {
        link.Tsize = l.Tsize;
      }
      return link;
    });
  }
  return node;
}

// EXTERNAL MODULE: ../node_modules/cborg/esm/cborg.js
var cborg = __webpack_require__(308);
;// CONCATENATED MODULE: ../node_modules/@ipld/dag-cbor/esm/index.js


const CID_CBOR_TAG = 42;
function cidEncoder(obj) {
  if (obj.asCID !== obj) {
    return null;
  }
  const cid = src_cid.CID.asCID(obj);
  if (!cid) {
    return null;
  }
  const bytes = new Uint8Array(cid.bytes.byteLength + 1);
  bytes.set(cid.bytes, 1);
  return [
    new cborg/* Token */.WU(cborg/* Type.tag */.Dy.tag, CID_CBOR_TAG),
    new cborg/* Token */.WU(cborg/* Type.bytes */.Dy.bytes, bytes)
  ];
}
function undefinedEncoder() {
  throw new Error('`undefined` is not supported by the IPLD Data Model and cannot be encoded');
}
function numberEncoder(num) {
  if (Number.isNaN(num)) {
    throw new Error('`NaN` is not supported by the IPLD Data Model and cannot be encoded');
  }
  if (num === Infinity || num === -Infinity) {
    throw new Error('`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded');
  }
  return null;
}
const encodeOptions = {
  float64: true,
  typeEncoders: {
    Object: cidEncoder,
    undefined: undefinedEncoder,
    number: numberEncoder
  }
};
function cidDecoder(bytes) {
  if (bytes[0] !== 0) {
    throw new Error('Invalid CID for CBOR tag 42; expected leading 0x00');
  }
  return src_cid.CID.decode(bytes.subarray(1));
}
const decodeOptions = {
  allowIndefinite: false,
  coerceUndefinedToNull: true,
  allowNaN: false,
  allowInfinity: false,
  allowBigInt: true,
  strict: true,
  useMaps: false,
  tags: []
};
decodeOptions.tags[CID_CBOR_TAG] = cidDecoder;
const esm_name = 'dag-cbor';
const esm_code = 113;
const esm_encode = node => cborg/* encode */.cv(node, encodeOptions);
const esm_decode = data => cborg/* decode */.Jx(data, decodeOptions);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/index.js
var src = __webpack_require__(7534);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bases/base64.js
var base64 = __webpack_require__(1453);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/token.js
var lib_token = __webpack_require__(1302);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/encode.js + 2 modules
var lib_encode = __webpack_require__(6456);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/common.js
var common = __webpack_require__(3002);
// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/byte-utils.js
var byte_utils = __webpack_require__(1926);
;// CONCATENATED MODULE: ../node_modules/cborg/esm/lib/json/encode.js




class JSONEncoder extends Array {
  constructor() {
    super();
    this.inRecursive = [];
  }
  prefix(buf) {
    const recurs = this.inRecursive[this.inRecursive.length - 1];
    if (recurs) {
      if (recurs.type === lib_token/* Type.array */.D.array) {
        recurs.elements++;
        if (recurs.elements !== 1) {
          buf.push([44]);
        }
      }
      if (recurs.type === lib_token/* Type.map */.D.map) {
        recurs.elements++;
        if (recurs.elements !== 1) {
          if (recurs.elements % 2 === 1) {
            buf.push([44]);
          } else {
            buf.push([58]);
          }
        }
      }
    }
  }
  [lib_token/* Type.uint.major */.D.uint.major](buf, token) {
    this.prefix(buf);
    const is = String(token.value);
    const isa = [];
    for (let i = 0; i < is.length; i++) {
      isa[i] = is.charCodeAt(i);
    }
    buf.push(isa);
  }
  [lib_token/* Type.negint.major */.D.negint.major](buf, token) {
    this[lib_token/* Type.uint.major */.D.uint.major](buf, token);
  }
  [lib_token/* Type.bytes.major */.D.bytes.major](_buf, _token) {
    throw new Error(`${ common/* encodeErrPrefix */.OO } unsupported type: Uint8Array`);
  }
  [lib_token/* Type.string.major */.D.string.major](buf, token) {
    this.prefix(buf);
    const byts = (0,byte_utils/* fromString */.mL)(JSON.stringify(token.value));
    buf.push(byts.length > 32 ? (0,byte_utils/* asU8A */.Dz)(byts) : byts);
  }
  [lib_token/* Type.array.major */.D.array.major](buf, _token) {
    this.prefix(buf);
    this.inRecursive.push({
      type: lib_token/* Type.array */.D.array,
      elements: 0
    });
    buf.push([91]);
  }
  [lib_token/* Type.map.major */.D.map.major](buf, _token) {
    this.prefix(buf);
    this.inRecursive.push({
      type: lib_token/* Type.map */.D.map,
      elements: 0
    });
    buf.push([123]);
  }
  [lib_token/* Type.tag.major */.D.tag.major](_buf, _token) {
  }
  [lib_token/* Type.float.major */.D.float.major](buf, token) {
    if (token.type.name === 'break') {
      const recurs = this.inRecursive.pop();
      if (recurs) {
        if (recurs.type === lib_token/* Type.array */.D.array) {
          buf.push([93]);
        } else if (recurs.type === lib_token/* Type.map */.D.map) {
          buf.push([125]);
        } else {
          throw new Error('Unexpected recursive type; this should not happen!');
        }
        return;
      }
      throw new Error('Unexpected break; this should not happen!');
    }
    if (token.value === undefined) {
      throw new Error(`${ common/* encodeErrPrefix */.OO } unsupported type: undefined`);
    }
    this.prefix(buf);
    if (token.type.name === 'true') {
      buf.push([
        116,
        114,
        117,
        101
      ]);
      return;
    } else if (token.type.name === 'false') {
      buf.push([
        102,
        97,
        108,
        115,
        101
      ]);
      return;
    } else if (token.type.name === 'null') {
      buf.push([
        110,
        117,
        108,
        108
      ]);
      return;
    }
    const is = String(token.value);
    const isa = [];
    let dp = false;
    for (let i = 0; i < is.length; i++) {
      isa[i] = is.charCodeAt(i);
      if (!dp && (isa[i] === 46 || isa[i] === 101 || isa[i] === 69)) {
        dp = true;
      }
    }
    if (!dp) {
      isa.push(46);
      isa.push(48);
    }
    buf.push(isa);
  }
}
function mapSorter(e1, e2) {
  if (Array.isArray(e1[0]) || Array.isArray(e2[0])) {
    throw new Error(`${ common/* encodeErrPrefix */.OO } complex map keys are not supported`);
  }
  const keyToken1 = e1[0];
  const keyToken2 = e2[0];
  if (keyToken1.type !== lib_token/* Type.string */.D.string || keyToken2.type !== lib_token/* Type.string */.D.string) {
    throw new Error(`${ common/* encodeErrPrefix */.OO } non-string map keys are not supported`);
  }
  if (keyToken1 < keyToken2) {
    return -1;
  }
  if (keyToken1 > keyToken2) {
    return 1;
  }
  throw new Error(`${ common/* encodeErrPrefix */.OO } unexpected duplicate map keys, this is not supported`);
}
const defaultEncodeOptions = {
  addBreakTokens: true,
  mapSorter
};
function encode_encode(data, options) {
  options = Object.assign({}, defaultEncodeOptions, options);
  return (0,lib_encode/* encodeCustom */.w$)(data, new JSONEncoder(), options);
}

// EXTERNAL MODULE: ../node_modules/cborg/esm/lib/decode.js
var lib_decode = __webpack_require__(2972);
;// CONCATENATED MODULE: ../node_modules/cborg/esm/lib/json/decode.js




class Tokenizer {
  constructor(data, options = {}) {
    this.pos = 0;
    this.data = data;
    this.options = options;
    this.modeStack = ['value'];
    this.lastToken = '';
  }
  done() {
    return this.pos >= this.data.length;
  }
  ch() {
    return this.data[this.pos];
  }
  currentMode() {
    return this.modeStack[this.modeStack.length - 1];
  }
  skipWhitespace() {
    let c = this.ch();
    while (c === 32 || c === 9 || c === 13 || c === 10) {
      c = this.data[++this.pos];
    }
  }
  expect(str) {
    if (this.data.length - this.pos < str.length) {
      throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected end of input at position ${ this.pos }`);
    }
    for (let i = 0; i < str.length; i++) {
      if (this.data[this.pos++] !== str[i]) {
        throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected token at position ${ this.pos }, expected to find '${ String.fromCharCode(...str) }'`);
      }
    }
  }
  parseNumber() {
    const startPos = this.pos;
    let negative = false;
    let float = false;
    const swallow = chars => {
      while (!this.done()) {
        const ch = this.ch();
        if (chars.includes(ch)) {
          this.pos++;
        } else {
          break;
        }
      }
    };
    if (this.ch() === 45) {
      negative = true;
      this.pos++;
    }
    if (this.ch() === 48) {
      this.pos++;
      if (this.ch() === 46) {
        this.pos++;
        float = true;
      } else {
        return new lib_token/* Token */.W(lib_token/* Type.uint */.D.uint, 0, this.pos - startPos);
      }
    }
    swallow([
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57
    ]);
    if (negative && this.pos === startPos + 1) {
      throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected token at position ${ this.pos }`);
    }
    if (!this.done() && this.ch() === 46) {
      if (float) {
        throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected token at position ${ this.pos }`);
      }
      float = true;
      this.pos++;
      swallow([
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57
      ]);
    }
    if (!this.done() && (this.ch() === 101 || this.ch() === 69)) {
      float = true;
      this.pos++;
      if (!this.done() && (this.ch() === 43 || this.ch() === 45)) {
        this.pos++;
      }
      swallow([
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57
      ]);
    }
    const numStr = String.fromCharCode.apply(null, this.data.subarray(startPos, this.pos));
    const num = parseFloat(numStr);
    if (float) {
      return new lib_token/* Token */.W(lib_token/* Type.float */.D.float, num, this.pos - startPos);
    }
    if (this.options.allowBigInt !== true || Number.isSafeInteger(num)) {
      return new lib_token/* Token */.W(num >= 0 ? lib_token/* Type.uint */.D.uint : lib_token/* Type.negint */.D.negint, num, this.pos - startPos);
    }
    return new lib_token/* Token */.W(num >= 0 ? lib_token/* Type.uint */.D.uint : lib_token/* Type.negint */.D.negint, BigInt(numStr), this.pos - startPos);
  }
  parseString() {
    if (this.ch() !== 34) {
      throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected character at position ${ this.pos }; this shouldn't happen`);
    }
    this.pos++;
    for (let i = this.pos, l = 0; i < this.data.length && l < 65536; i++, l++) {
      const ch = this.data[i];
      if (ch === 92 || ch < 32 || ch >= 128) {
        break;
      }
      if (ch === 34) {
        const str = String.fromCharCode.apply(null, this.data.subarray(this.pos, i));
        this.pos = i + 1;
        return new lib_token/* Token */.W(lib_token/* Type.string */.D.string, str, l);
      }
    }
    const startPos = this.pos;
    const chars = [];
    const readu4 = () => {
      if (this.pos + 4 >= this.data.length) {
        throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected end of unicode escape sequence at position ${ this.pos }`);
      }
      let u4 = 0;
      for (let i = 0; i < 4; i++) {
        let ch = this.ch();
        if (ch >= 48 && ch <= 57) {
          ch -= 48;
        } else if (ch >= 97 && ch <= 102) {
          ch = ch - 97 + 10;
        } else if (ch >= 65 && ch <= 70) {
          ch = ch - 65 + 10;
        } else {
          throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected unicode escape character at position ${ this.pos }`);
        }
        u4 = u4 * 16 + ch;
        this.pos++;
      }
      return u4;
    };
    const readUtf8Char = () => {
      const firstByte = this.ch();
      let codePoint = null;
      let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (this.pos + bytesPerSequence > this.data.length) {
        throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected unicode sequence at position ${ this.pos }`);
      }
      let secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
      case 1:
        if (firstByte < 128) {
          codePoint = firstByte;
        }
        break;
      case 2:
        secondByte = this.data[this.pos + 1];
        if ((secondByte & 192) === 128) {
          tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
          if (tempCodePoint > 127) {
            codePoint = tempCodePoint;
          }
        }
        break;
      case 3:
        secondByte = this.data[this.pos + 1];
        thirdByte = this.data[this.pos + 2];
        if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
          tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
          if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
            codePoint = tempCodePoint;
          }
        }
        break;
      case 4:
        secondByte = this.data[this.pos + 1];
        thirdByte = this.data[this.pos + 2];
        fourthByte = this.data[this.pos + 3];
        if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
          tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
          if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
            codePoint = tempCodePoint;
          }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        chars.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      chars.push(codePoint);
      this.pos += bytesPerSequence;
    };
    while (!this.done()) {
      const ch = this.ch();
      let ch1;
      switch (ch) {
      case 92:
        this.pos++;
        if (this.done()) {
          throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected string termination at position ${ this.pos }`);
        }
        ch1 = this.ch();
        this.pos++;
        switch (ch1) {
        case 34:
        case 39:
        case 92:
        case 47:
          chars.push(ch1);
          break;
        case 98:
          chars.push(8);
          break;
        case 116:
          chars.push(9);
          break;
        case 110:
          chars.push(10);
          break;
        case 102:
          chars.push(12);
          break;
        case 114:
          chars.push(13);
          break;
        case 117:
          chars.push(readu4());
          break;
        default:
          throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected string escape character at position ${ this.pos }`);
        }
        break;
      case 34:
        this.pos++;
        return new lib_token/* Token */.W(lib_token/* Type.string */.D.string, (0,byte_utils/* decodeCodePointsArray */.Pu)(chars), this.pos - startPos);
      default:
        if (ch < 32) {
          throw new Error(`${ common/* decodeErrPrefix */.IR } invalid control character at position ${ this.pos }`);
        } else if (ch < 128) {
          chars.push(ch);
          this.pos++;
        } else {
          readUtf8Char();
        }
      }
    }
    throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected end of string at position ${ this.pos }`);
  }
  parseValue() {
    switch (this.ch()) {
    case 123:
      this.modeStack.push('obj-start');
      this.pos++;
      return new lib_token/* Token */.W(lib_token/* Type.map */.D.map, Infinity, 1);
    case 91:
      this.modeStack.push('array-start');
      this.pos++;
      return new lib_token/* Token */.W(lib_token/* Type.array */.D.array, Infinity, 1);
    case 34: {
        return this.parseString();
      }
    case 110:
      this.expect([
        110,
        117,
        108,
        108
      ]);
      return new lib_token/* Token */.W(lib_token/* Type.null */.D["null"], null, 4);
    case 102:
      this.expect([
        102,
        97,
        108,
        115,
        101
      ]);
      return new lib_token/* Token */.W(lib_token/* Type.false */.D["false"], false, 5);
    case 116:
      this.expect([
        116,
        114,
        117,
        101
      ]);
      return new lib_token/* Token */.W(lib_token/* Type.true */.D["true"], true, 4);
    case 45:
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      return this.parseNumber();
    default:
      throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected character at position ${ this.pos }`);
    }
  }
  next() {
    this.skipWhitespace();
    switch (this.currentMode()) {
    case 'value':
      this.modeStack.pop();
      return this.parseValue();
    case 'array-value': {
        this.modeStack.pop();
        if (this.ch() === 93) {
          this.pos++;
          this.skipWhitespace();
          return new lib_token/* Token */.W(lib_token/* Type.break */.D["break"], undefined, 1);
        }
        if (this.ch() !== 44) {
          throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected character at position ${ this.pos }, was expecting array delimiter but found '${ String.fromCharCode(this.ch()) }'`);
        }
        this.pos++;
        this.modeStack.push('array-value');
        this.skipWhitespace();
        return this.parseValue();
      }
    case 'array-start': {
        this.modeStack.pop();
        if (this.ch() === 93) {
          this.pos++;
          this.skipWhitespace();
          return new lib_token/* Token */.W(lib_token/* Type.break */.D["break"], undefined, 1);
        }
        this.modeStack.push('array-value');
        this.skipWhitespace();
        return this.parseValue();
      }
    case 'obj-key':
      if (this.ch() === 125) {
        this.modeStack.pop();
        this.pos++;
        this.skipWhitespace();
        return new lib_token/* Token */.W(lib_token/* Type.break */.D["break"], undefined, 1);
      }
      if (this.ch() !== 44) {
        throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected character at position ${ this.pos }, was expecting object delimiter but found '${ String.fromCharCode(this.ch()) }'`);
      }
      this.pos++;
      this.skipWhitespace();
    case 'obj-start': {
        this.modeStack.pop();
        if (this.ch() === 125) {
          this.pos++;
          this.skipWhitespace();
          return new lib_token/* Token */.W(lib_token/* Type.break */.D["break"], undefined, 1);
        }
        const token = this.parseString();
        this.skipWhitespace();
        if (this.ch() !== 58) {
          throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected character at position ${ this.pos }, was expecting key/value delimiter ':' but found '${ String.fromCharCode(this.ch()) }'`);
        }
        this.pos++;
        this.modeStack.push('obj-value');
        return token;
      }
    case 'obj-value': {
        this.modeStack.pop();
        this.modeStack.push('obj-key');
        this.skipWhitespace();
        return this.parseValue();
      }
    default:
      throw new Error(`${ common/* decodeErrPrefix */.IR } unexpected parse state at position ${ this.pos }; this shouldn't happen`);
    }
  }
}
function decode_decode(data, options) {
  options = Object.assign({ tokenizer: new Tokenizer(data, options) }, options);
  return (0,lib_decode/* decode */.Jx)(data, options);
}

;// CONCATENATED MODULE: ../node_modules/cborg/esm/lib/json/json.js



;// CONCATENATED MODULE: ../node_modules/@ipld/dag-json/esm/index.js




function esm_cidEncoder(obj) {
  if (obj.asCID !== obj) {
    return null;
  }
  const cid = src.CID.asCID(obj);
  if (!cid) {
    return null;
  }
  const cidString = cid.toString();
  return [
    new cborg/* Token */.WU(cborg/* Type.map */.Dy.map, Infinity, 1),
    new cborg/* Token */.WU(cborg/* Type.string */.Dy.string, '/', 1),
    new cborg/* Token */.WU(cborg/* Type.string */.Dy.string, cidString, cidString.length),
    new cborg/* Token */.WU(cborg/* Type.break */.Dy["break"], undefined, 1)
  ];
}
function bytesEncoder(bytes) {
  const bytesString = base64.base64.encode(bytes).slice(1);
  return [
    new cborg/* Token */.WU(cborg/* Type.map */.Dy.map, Infinity, 1),
    new cborg/* Token */.WU(cborg/* Type.string */.Dy.string, '/', 1),
    new cborg/* Token */.WU(cborg/* Type.map */.Dy.map, Infinity, 1),
    new cborg/* Token */.WU(cborg/* Type.string */.Dy.string, 'bytes', 5),
    new cborg/* Token */.WU(cborg/* Type.string */.Dy.string, bytesString, bytesString.length),
    new cborg/* Token */.WU(cborg/* Type.break */.Dy["break"], undefined, 1),
    new cborg/* Token */.WU(cborg/* Type.break */.Dy["break"], undefined, 1)
  ];
}
function esm_undefinedEncoder() {
  throw new Error('`undefined` is not supported by the IPLD Data Model and cannot be encoded');
}
function esm_numberEncoder(num) {
  if (Number.isNaN(num)) {
    throw new Error('`NaN` is not supported by the IPLD Data Model and cannot be encoded');
  }
  if (num === Infinity || num === -Infinity) {
    throw new Error('`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded');
  }
  return null;
}
const esm_encodeOptions = {
  typeEncoders: {
    Object: esm_cidEncoder,
    Uint8Array: bytesEncoder,
    Buffer: bytesEncoder,
    undefined: esm_undefinedEncoder,
    number: esm_numberEncoder
  }
};
class DagJsonTokenizer extends Tokenizer {
  constructor(data, options) {
    super(data, options);
    this.tokenBuffer = [];
  }
  done() {
    return this.tokenBuffer.length === 0 && super.done();
  }
  _next() {
    if (this.tokenBuffer.length > 0) {
      return this.tokenBuffer.pop();
    }
    return super.next();
  }
  next() {
    const token = this._next();
    if (token.type === cborg/* Type.map */.Dy.map) {
      const keyToken = this._next();
      if (keyToken.type === cborg/* Type.string */.Dy.string && keyToken.value === '/') {
        const valueToken = this._next();
        if (valueToken.type === cborg/* Type.string */.Dy.string) {
          const breakToken = this._next();
          if (breakToken.type !== cborg/* Type.break */.Dy["break"]) {
            throw new Error('Invalid encoded CID form');
          }
          this.tokenBuffer.push(valueToken);
          return new cborg/* Token */.WU(cborg/* Type.tag */.Dy.tag, 42, 0);
        }
        if (valueToken.type === cborg/* Type.map */.Dy.map) {
          const innerKeyToken = this._next();
          if (innerKeyToken.type === cborg/* Type.string */.Dy.string && innerKeyToken.value === 'bytes') {
            const innerValueToken = this._next();
            if (innerValueToken.type === cborg/* Type.string */.Dy.string) {
              for (let i = 0; i < 2; i++) {
                const breakToken = this._next();
                if (breakToken.type !== cborg/* Type.break */.Dy["break"]) {
                  throw new Error('Invalid encoded Bytes form');
                }
              }
              const bytes = base64.base64.decode(`m${ innerValueToken.value }`);
              return new cborg/* Token */.WU(cborg/* Type.bytes */.Dy.bytes, bytes, innerValueToken.value.length);
            }
            this.tokenBuffer.push(innerValueToken);
          }
          this.tokenBuffer.push(innerKeyToken);
        }
        this.tokenBuffer.push(valueToken);
      }
      this.tokenBuffer.push(keyToken);
    }
    return token;
  }
}
const esm_decodeOptions = {
  allowIndefinite: false,
  allowUndefined: false,
  allowNaN: false,
  allowInfinity: false,
  allowBigInt: true,
  strict: true,
  useMaps: false,
  tags: []
};
esm_decodeOptions.tags[42] = src.CID.parse;
const dag_json_esm_name = 'dag-json';
const dag_json_esm_code = 297;
const dag_json_esm_encode = node => encode_encode(node, esm_encodeOptions);
const dag_json_esm_decode = data => {
  const options = Object.assign(esm_decodeOptions, { tokenizer: new DagJsonTokenizer(data, esm_decodeOptions) });
  return decode_decode(data, options);
};
// EXTERNAL MODULE: ../node_modules/dag-jose/lib/index.js
var lib = __webpack_require__(3614);
var lib_namespaceObject = /*#__PURE__*/__webpack_require__.t(lib, 2);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/hashes/identity.js
var identity = __webpack_require__(7246);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/basics.js + 8 modules
var basics = __webpack_require__(9145);
// EXTERNAL MODULE: ../node_modules/multiaddr/src/index.js
var multiaddr_src = __webpack_require__(9038);
// EXTERNAL MODULE: ../node_modules/ipfs-utils/src/env.js
var env = __webpack_require__(1823);
;// CONCATENATED MODULE: ../node_modules/parse-duration/index.mjs
let durationRE = /(-?(?:\d+\.?\d*|\d*\.?\d+)(?:e[-+]?\d+)?)\s*([\p{L}]*)/uig


/**
 * conversion ratios
 */

parse.nanosecond =
parse.ns = 1 / 1e6

parse['µs'] =
parse['μs'] =
parse.us =
parse.microsecond = 1 / 1e3

parse.millisecond =
parse.ms =
parse[''] = 1

parse.second =
parse.sec =
parse.s = parse.ms * 1000

parse.minute =
parse.min =
parse.m = parse.s * 60

parse.hour =
parse.hr =
parse.h = parse.m * 60

parse.day =
parse.d = parse.h * 24

parse.week =
parse.wk =
parse.w = parse.d * 7

parse.month =
parse.b =
parse.d * (365.25 / 12)

parse.year =
parse.yr =
parse.y = parse.d * 365.25

/**
 * convert `str` to ms
 *
 * @param {String} str
 * @param {String} format
 * @return {Number}
 */

function parse(str='', format='ms'){
  var result = null
  // ignore commas/placeholders
  str = (str+'').replace(/(\d)[,_](\d)/g, '$1$2')
  str.replace(durationRE, function(_, n, units){
    units = unitRatio(units)
    if (units) result = (result || 0) + parseFloat(n, 10) * units
  })

  return result && (result / (unitRatio(format) || 1))
}

function unitRatio(str) {
  return parse[str] || parse[str.toLowerCase().replace(/s$/, '')]
}

/* harmony default export */ const parse_duration = (parse);

// EXTERNAL MODULE: ../node_modules/debug/src/browser.js
var browser = __webpack_require__(6292);
// EXTERNAL MODULE: ../node_modules/ipfs-utils/src/http.js
var http = __webpack_require__(2722);
// EXTERNAL MODULE: ../node_modules/merge-options/index.js
var merge_options = __webpack_require__(3224);
;// CONCATENATED MODULE: ../node_modules/merge-options/index.mjs
/**
 * Thin ESM wrapper for CJS named exports.
 *
 * Ref: https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1
 */


/* harmony default export */ const node_modules_merge_options = (merge_options);

// EXTERNAL MODULE: ../node_modules/multiaddr-to-uri/index.js
var multiaddr_to_uri = __webpack_require__(9546);
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/to-url-string.js


function toUrlString(url) {
  try {
    url = multiaddr_to_uri(new multiaddr_src.Multiaddr(url));
  } catch (err) {
  }
  url = url.toString();
  return url;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/agent.browser.js
/* harmony default export */ const agent_browser = (() => {
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/core.js








const log = browser('ipfs-http-client:lib:error-handler');
const merge = node_modules_merge_options.bind({ ignoreUndefined: true });
const DEFAULT_PROTOCOL = env.isBrowser || env.isWebWorker ? location.protocol : 'http';
const DEFAULT_HOST = env.isBrowser || env.isWebWorker ? location.hostname : 'localhost';
const DEFAULT_PORT = env.isBrowser || env.isWebWorker ? location.port : '5001';
const normalizeOptions = (options = {}) => {
  let url;
  let opts = {};
  let agent;
  if (typeof options === 'string' || multiaddr_src.Multiaddr.isMultiaddr(options)) {
    url = new URL(toUrlString(options));
  } else if (options instanceof URL) {
    url = options;
  } else if (typeof options.url === 'string' || multiaddr_src.Multiaddr.isMultiaddr(options.url)) {
    url = new URL(toUrlString(options.url));
    opts = options;
  } else if (options.url instanceof URL) {
    url = options.url;
    opts = options;
  } else {
    opts = options || {};
    const protocol = (opts.protocol || DEFAULT_PROTOCOL).replace(':', '');
    const host = (opts.host || DEFAULT_HOST).split(':')[0];
    const port = opts.port || DEFAULT_PORT;
    url = new URL(`${ protocol }://${ host }:${ port }`);
  }
  if (opts.apiPath) {
    url.pathname = opts.apiPath;
  } else if (url.pathname === '/' || url.pathname === undefined) {
    url.pathname = 'api/v0';
  }
  if (env.isNode) {
    const Agent = agent_browser(url);
    agent = opts.agent || new Agent({
      keepAlive: true,
      maxSockets: 6
    });
  }
  return {
    ...opts,
    host: url.host,
    protocol: url.protocol.replace(':', ''),
    port: Number(url.port),
    apiPath: url.pathname,
    url,
    agent
  };
};
const errorHandler = async response => {
  let msg;
  try {
    if ((response.headers.get('Content-Type') || '').startsWith('application/json')) {
      const data = await response.json();
      log(data);
      msg = data.Message || data.message;
    } else {
      msg = await response.text();
    }
  } catch (err) {
    log('Failed to parse error response', err);
    msg = err.message;
  }
  let error = new http.HTTPError(response);
  if (msg) {
    if (msg.includes('deadline has elapsed')) {
      error = new http.TimeoutError();
    }
    if (msg && msg.includes('context deadline exceeded')) {
      error = new http.TimeoutError();
    }
  }
  if (msg && msg.includes('request timed out')) {
    error = new http.TimeoutError();
  }
  if (msg) {
    error.message = msg;
  }
  throw error;
};
const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;
const kebabCase = str => {
  return str.replace(KEBAB_REGEX, function (match) {
    return '-' + match.toLowerCase();
  });
};
const parseTimeout = value => {
  return typeof value === 'string' ? parse_duration(value) : value;
};
class Client extends http {
  constructor(options = {}) {
    const opts = normalizeOptions(options);
    super({
      timeout: parseTimeout(opts.timeout || 0) || undefined,
      headers: opts.headers,
      base: `${ opts.url }`,
      handleError: errorHandler,
      transformSearchParams: search => {
        const out = new URLSearchParams();
        for (const [key, value] of search) {
          if (value !== 'undefined' && value !== 'null' && key !== 'signal') {
            out.append(kebabCase(key), value);
          }
          if (key === 'timeout' && !isNaN(value)) {
            out.append(kebabCase(key), value);
          }
        }
        return out;
      },
      agent: opts.agent
    });
    delete this.get;
    delete this.put;
    delete this.delete;
    delete this.options;
    const fetch = this.fetch;
    this.fetch = (resource, options = {}) => {
      if (typeof resource === 'string' && !resource.startsWith('/')) {
        resource = `${ opts.url }/${ resource }`;
      }
      return fetch.call(this, resource, merge(options, { method: 'POST' }));
    };
  }
}
const HTTPError = http.HTTPError;
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/configure.js

const configure = fn => {
  return options => {
    return fn(new Client(options), options);
  };
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/mode-to-string.js
function modeToString(mode) {
  if (mode == null) {
    return undefined;
  }
  if (typeof mode === 'string') {
    return mode;
  }
  return mode.toString(8).padStart(4, '0');
}
// EXTERNAL MODULE: ../node_modules/err-code/index.js
var err_code = __webpack_require__(118);
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/parse-mtime.js

function parseMtime(input) {
  if (input == null) {
    return undefined;
  }
  let mtime;
  if (input.secs != null) {
    mtime = {
      secs: input.secs,
      nsecs: input.nsecs
    };
  }
  if (input.Seconds != null) {
    mtime = {
      secs: input.Seconds,
      nsecs: input.FractionalNanoseconds
    };
  }
  if (Array.isArray(input)) {
    mtime = {
      secs: input[0],
      nsecs: input[1]
    };
  }
  if (input instanceof Date) {
    const ms = input.getTime();
    const secs = Math.floor(ms / 1000);
    mtime = {
      secs: secs,
      nsecs: (ms - secs * 1000) * 1000
    };
  }
  if (!Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
    return undefined;
  }
  if (mtime != null && mtime.nsecs != null && (mtime.nsecs < 0 || mtime.nsecs > 999999999)) {
    throw err_code(new Error('mtime-nsecs must be within the range [0,999999999]'), 'ERR_INVALID_MTIME_NSECS');
  }
  return mtime;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/to-url-search-params.js


function toUrlSearchParams({arg, searchParams, hashAlg, mtime, mode, ...options} = {}) {
  if (searchParams) {
    options = {
      ...options,
      ...searchParams
    };
  }
  if (hashAlg) {
    options.hash = hashAlg;
  }
  if (mtime != null) {
    mtime = parseMtime(mtime);
    options.mtime = mtime.secs;
    options.mtimeNsecs = mtime.nsecs;
  }
  if (mode != null) {
    options.mode = modeToString(mode);
  }
  if (options.timeout && !isNaN(options.timeout)) {
    options.timeout = `${ options.timeout }ms`;
  }
  if (arg === undefined || arg === null) {
    arg = [];
  } else if (!Array.isArray(arg)) {
    arg = [arg];
  }
  const urlSearchParams = new URLSearchParams(options);
  arg.forEach(arg => urlSearchParams.append('arg', arg));
  return urlSearchParams;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bitswap/wantlist.js



const createWantlist = configure(api => {
  async function wantlist(options = {}) {
    const res = await (await api.post('bitswap/wantlist', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json();
    return (res.Keys || []).map(k => src_cid.CID.parse(k['/']));
  }
  return wantlist;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bitswap/wantlist-for-peer.js



const createWantlistForPeer = configure(api => {
  async function wantlistForPeer(peerId, options = {}) {
    const res = await (await api.post('bitswap/wantlist', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        peer: peerId.toString()
      }),
      headers: options.headers
    })).json();
    return (res.Keys || []).map(k => src_cid.CID.parse(k['/']));
  }
  return wantlistForPeer;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bitswap/stat.js



const createStat = configure(api => {
  async function stat(options = {}) {
    const res = await api.post('bitswap/stat', {
      searchParams: toUrlSearchParams(options),
      signal: options.signal,
      headers: options.headers
    });
    return toCoreInterface(await res.json());
  }
  return stat;
});
function toCoreInterface(res) {
  return {
    provideBufLen: res.ProvideBufLen,
    wantlist: (res.Wantlist || []).map(k => src_cid.CID.parse(k['/'])),
    peers: res.Peers || [],
    blocksReceived: BigInt(res.BlocksReceived),
    dataReceived: BigInt(res.DataReceived),
    blocksSent: BigInt(res.BlocksSent),
    dataSent: BigInt(res.DataSent),
    dupBlksReceived: BigInt(res.DupBlksReceived),
    dupDataReceived: BigInt(res.DupDataReceived)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bitswap/unwant.js


const createUnwant = configure(api => {
  async function unwant(cid, options = {}) {
    const res = await api.post('bitswap/unwant', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    });
    return res.json();
  }
  return unwant;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bitswap/index.js




function createBitswap(config) {
  return {
    wantlist: createWantlist(config),
    wantlistForPeer: createWantlistForPeer(config),
    unwant: createUnwant(config),
    stat: createStat(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/block/get.js


const createGet = configure(api => {
  async function get(cid, options = {}) {
    const res = await api.post('block/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    });
    return new Uint8Array(await res.arrayBuffer());
  }
  return get;
});
// EXTERNAL MODULE: ../node_modules/it-peekable/index.js
var it_peekable = __webpack_require__(3506);
// EXTERNAL MODULE: ../node_modules/browser-readablestream-to-it/index.js
var browser_readablestream_to_it = __webpack_require__(2630);
// EXTERNAL MODULE: ../node_modules/it-all/index.js
var it_all = __webpack_require__(1251);
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/files/utils.js
function isBytes(obj) {
  return ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer;
}
function isBlob(obj) {
  return obj.constructor && (obj.constructor.name === 'Blob' || obj.constructor.name === 'File') && typeof obj.stream === 'function';
}
function isFileObject(obj) {
  return typeof obj === 'object' && (obj.path || obj.content);
}
const isReadableStream = value => value && typeof value.getReader === 'function';
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/files/normalise-content.browser.js





async function normaliseContent(input) {
  if (isBytes(input)) {
    return new Blob([input]);
  }
  if (typeof input === 'string' || input instanceof String) {
    return new Blob([input.toString()]);
  }
  if (isBlob(input)) {
    return input;
  }
  if (isReadableStream(input)) {
    input = browser_readablestream_to_it(input);
  }
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    const peekable = it_peekable(input);
    const {value, done} = await peekable.peek();
    if (done) {
      return itToBlob(peekable);
    }
    peekable.push(value);
    if (Number.isInteger(value)) {
      return new Blob([Uint8Array.from(await it_all(peekable))]);
    }
    if (isBytes(value) || typeof value === 'string' || value instanceof String) {
      return itToBlob(peekable);
    }
  }
  throw err_code(new Error(`Unexpected input: ${ input }`), 'ERR_UNEXPECTED_INPUT');
}
async function itToBlob(stream) {
  const parts = [];
  for await (const chunk of stream) {
    parts.push(chunk);
  }
  return new Blob(parts);
}
// EXTERNAL MODULE: ../node_modules/it-map/index.js
var it_map = __webpack_require__(8731);
// EXTERNAL MODULE: ../node_modules/protobufjs/minimal.js
var minimal = __webpack_require__(3967);
;// CONCATENATED MODULE: ../node_modules/ipfs-unixfs/esm/src/unixfs.js

const $Reader = minimal.Reader, $Writer = minimal.Writer, $util = minimal.util;
const $root = minimal.roots["ipfs-unixfs"] || (minimal.roots["ipfs-unixfs"] = {});
const Data = $root.Data = (() => {
  function Data(p) {
    this.blocksizes = [];
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null)
          this[ks[i]] = p[ks[i]];
  }
  Data.prototype.Type = 0;
  Data.prototype.Data = $util.newBuffer([]);
  Data.prototype.filesize = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
  Data.prototype.blocksizes = $util.emptyArray;
  Data.prototype.hashType = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
  Data.prototype.fanout = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
  Data.prototype.mode = 0;
  Data.prototype.mtime = null;
  Data.encode = function encode(m, w) {
    if (!w)
      w = $Writer.create();
    w.uint32(8).int32(m.Type);
    if (m.Data != null && Object.hasOwnProperty.call(m, 'Data'))
      w.uint32(18).bytes(m.Data);
    if (m.filesize != null && Object.hasOwnProperty.call(m, 'filesize'))
      w.uint32(24).uint64(m.filesize);
    if (m.blocksizes != null && m.blocksizes.length) {
      for (var i = 0; i < m.blocksizes.length; ++i)
        w.uint32(32).uint64(m.blocksizes[i]);
    }
    if (m.hashType != null && Object.hasOwnProperty.call(m, 'hashType'))
      w.uint32(40).uint64(m.hashType);
    if (m.fanout != null && Object.hasOwnProperty.call(m, 'fanout'))
      w.uint32(48).uint64(m.fanout);
    if (m.mode != null && Object.hasOwnProperty.call(m, 'mode'))
      w.uint32(56).uint32(m.mode);
    if (m.mtime != null && Object.hasOwnProperty.call(m, 'mtime'))
      $root.UnixTime.encode(m.mtime, w.uint32(66).fork()).ldelim();
    return w;
  };
  Data.decode = function decode(r, l) {
    if (!(r instanceof $Reader))
      r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l, m = new $root.Data();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
      case 1:
        m.Type = r.int32();
        break;
      case 2:
        m.Data = r.bytes();
        break;
      case 3:
        m.filesize = r.uint64();
        break;
      case 4:
        if (!(m.blocksizes && m.blocksizes.length))
          m.blocksizes = [];
        if ((t & 7) === 2) {
          var c2 = r.uint32() + r.pos;
          while (r.pos < c2)
            m.blocksizes.push(r.uint64());
        } else
          m.blocksizes.push(r.uint64());
        break;
      case 5:
        m.hashType = r.uint64();
        break;
      case 6:
        m.fanout = r.uint64();
        break;
      case 7:
        m.mode = r.uint32();
        break;
      case 8:
        m.mtime = $root.UnixTime.decode(r, r.uint32());
        break;
      default:
        r.skipType(t & 7);
        break;
      }
    }
    if (!m.hasOwnProperty('Type'))
      throw $util.ProtocolError('missing required \'Type\'', { instance: m });
    return m;
  };
  Data.fromObject = function fromObject(d) {
    if (d instanceof $root.Data)
      return d;
    var m = new $root.Data();
    switch (d.Type) {
    case 'Raw':
    case 0:
      m.Type = 0;
      break;
    case 'Directory':
    case 1:
      m.Type = 1;
      break;
    case 'File':
    case 2:
      m.Type = 2;
      break;
    case 'Metadata':
    case 3:
      m.Type = 3;
      break;
    case 'Symlink':
    case 4:
      m.Type = 4;
      break;
    case 'HAMTShard':
    case 5:
      m.Type = 5;
      break;
    }
    if (d.Data != null) {
      if (typeof d.Data === 'string')
        $util.base64.decode(d.Data, m.Data = $util.newBuffer($util.base64.length(d.Data)), 0);
      else if (d.Data.length)
        m.Data = d.Data;
    }
    if (d.filesize != null) {
      if ($util.Long)
        (m.filesize = $util.Long.fromValue(d.filesize)).unsigned = true;
      else if (typeof d.filesize === 'string')
        m.filesize = parseInt(d.filesize, 10);
      else if (typeof d.filesize === 'number')
        m.filesize = d.filesize;
      else if (typeof d.filesize === 'object')
        m.filesize = new $util.LongBits(d.filesize.low >>> 0, d.filesize.high >>> 0).toNumber(true);
    }
    if (d.blocksizes) {
      if (!Array.isArray(d.blocksizes))
        throw TypeError('.Data.blocksizes: array expected');
      m.blocksizes = [];
      for (var i = 0; i < d.blocksizes.length; ++i) {
        if ($util.Long)
          (m.blocksizes[i] = $util.Long.fromValue(d.blocksizes[i])).unsigned = true;
        else if (typeof d.blocksizes[i] === 'string')
          m.blocksizes[i] = parseInt(d.blocksizes[i], 10);
        else if (typeof d.blocksizes[i] === 'number')
          m.blocksizes[i] = d.blocksizes[i];
        else if (typeof d.blocksizes[i] === 'object')
          m.blocksizes[i] = new $util.LongBits(d.blocksizes[i].low >>> 0, d.blocksizes[i].high >>> 0).toNumber(true);
      }
    }
    if (d.hashType != null) {
      if ($util.Long)
        (m.hashType = $util.Long.fromValue(d.hashType)).unsigned = true;
      else if (typeof d.hashType === 'string')
        m.hashType = parseInt(d.hashType, 10);
      else if (typeof d.hashType === 'number')
        m.hashType = d.hashType;
      else if (typeof d.hashType === 'object')
        m.hashType = new $util.LongBits(d.hashType.low >>> 0, d.hashType.high >>> 0).toNumber(true);
    }
    if (d.fanout != null) {
      if ($util.Long)
        (m.fanout = $util.Long.fromValue(d.fanout)).unsigned = true;
      else if (typeof d.fanout === 'string')
        m.fanout = parseInt(d.fanout, 10);
      else if (typeof d.fanout === 'number')
        m.fanout = d.fanout;
      else if (typeof d.fanout === 'object')
        m.fanout = new $util.LongBits(d.fanout.low >>> 0, d.fanout.high >>> 0).toNumber(true);
    }
    if (d.mode != null) {
      m.mode = d.mode >>> 0;
    }
    if (d.mtime != null) {
      if (typeof d.mtime !== 'object')
        throw TypeError('.Data.mtime: object expected');
      m.mtime = $root.UnixTime.fromObject(d.mtime);
    }
    return m;
  };
  Data.toObject = function toObject(m, o) {
    if (!o)
      o = {};
    var d = {};
    if (o.arrays || o.defaults) {
      d.blocksizes = [];
    }
    if (o.defaults) {
      d.Type = o.enums === String ? 'Raw' : 0;
      if (o.bytes === String)
        d.Data = '';
      else {
        d.Data = [];
        if (o.bytes !== Array)
          d.Data = $util.newBuffer(d.Data);
      }
      if ($util.Long) {
        var n = new $util.Long(0, 0, true);
        d.filesize = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
      } else
        d.filesize = o.longs === String ? '0' : 0;
      if ($util.Long) {
        var n = new $util.Long(0, 0, true);
        d.hashType = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
      } else
        d.hashType = o.longs === String ? '0' : 0;
      if ($util.Long) {
        var n = new $util.Long(0, 0, true);
        d.fanout = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
      } else
        d.fanout = o.longs === String ? '0' : 0;
      d.mode = 0;
      d.mtime = null;
    }
    if (m.Type != null && m.hasOwnProperty('Type')) {
      d.Type = o.enums === String ? $root.Data.DataType[m.Type] : m.Type;
    }
    if (m.Data != null && m.hasOwnProperty('Data')) {
      d.Data = o.bytes === String ? $util.base64.encode(m.Data, 0, m.Data.length) : o.bytes === Array ? Array.prototype.slice.call(m.Data) : m.Data;
    }
    if (m.filesize != null && m.hasOwnProperty('filesize')) {
      if (typeof m.filesize === 'number')
        d.filesize = o.longs === String ? String(m.filesize) : m.filesize;
      else
        d.filesize = o.longs === String ? $util.Long.prototype.toString.call(m.filesize) : o.longs === Number ? new $util.LongBits(m.filesize.low >>> 0, m.filesize.high >>> 0).toNumber(true) : m.filesize;
    }
    if (m.blocksizes && m.blocksizes.length) {
      d.blocksizes = [];
      for (var j = 0; j < m.blocksizes.length; ++j) {
        if (typeof m.blocksizes[j] === 'number')
          d.blocksizes[j] = o.longs === String ? String(m.blocksizes[j]) : m.blocksizes[j];
        else
          d.blocksizes[j] = o.longs === String ? $util.Long.prototype.toString.call(m.blocksizes[j]) : o.longs === Number ? new $util.LongBits(m.blocksizes[j].low >>> 0, m.blocksizes[j].high >>> 0).toNumber(true) : m.blocksizes[j];
      }
    }
    if (m.hashType != null && m.hasOwnProperty('hashType')) {
      if (typeof m.hashType === 'number')
        d.hashType = o.longs === String ? String(m.hashType) : m.hashType;
      else
        d.hashType = o.longs === String ? $util.Long.prototype.toString.call(m.hashType) : o.longs === Number ? new $util.LongBits(m.hashType.low >>> 0, m.hashType.high >>> 0).toNumber(true) : m.hashType;
    }
    if (m.fanout != null && m.hasOwnProperty('fanout')) {
      if (typeof m.fanout === 'number')
        d.fanout = o.longs === String ? String(m.fanout) : m.fanout;
      else
        d.fanout = o.longs === String ? $util.Long.prototype.toString.call(m.fanout) : o.longs === Number ? new $util.LongBits(m.fanout.low >>> 0, m.fanout.high >>> 0).toNumber(true) : m.fanout;
    }
    if (m.mode != null && m.hasOwnProperty('mode')) {
      d.mode = m.mode;
    }
    if (m.mtime != null && m.hasOwnProperty('mtime')) {
      d.mtime = $root.UnixTime.toObject(m.mtime, o);
    }
    return d;
  };
  Data.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, minimal.util.toJSONOptions);
  };
  Data.DataType = function () {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = 'Raw'] = 0;
    values[valuesById[1] = 'Directory'] = 1;
    values[valuesById[2] = 'File'] = 2;
    values[valuesById[3] = 'Metadata'] = 3;
    values[valuesById[4] = 'Symlink'] = 4;
    values[valuesById[5] = 'HAMTShard'] = 5;
    return values;
  }();
  return Data;
})();
const UnixTime = $root.UnixTime = (() => {
  function UnixTime(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null)
          this[ks[i]] = p[ks[i]];
  }
  UnixTime.prototype.Seconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
  UnixTime.prototype.FractionalNanoseconds = 0;
  UnixTime.encode = function encode(m, w) {
    if (!w)
      w = $Writer.create();
    w.uint32(8).int64(m.Seconds);
    if (m.FractionalNanoseconds != null && Object.hasOwnProperty.call(m, 'FractionalNanoseconds'))
      w.uint32(21).fixed32(m.FractionalNanoseconds);
    return w;
  };
  UnixTime.decode = function decode(r, l) {
    if (!(r instanceof $Reader))
      r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l, m = new $root.UnixTime();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
      case 1:
        m.Seconds = r.int64();
        break;
      case 2:
        m.FractionalNanoseconds = r.fixed32();
        break;
      default:
        r.skipType(t & 7);
        break;
      }
    }
    if (!m.hasOwnProperty('Seconds'))
      throw $util.ProtocolError('missing required \'Seconds\'', { instance: m });
    return m;
  };
  UnixTime.fromObject = function fromObject(d) {
    if (d instanceof $root.UnixTime)
      return d;
    var m = new $root.UnixTime();
    if (d.Seconds != null) {
      if ($util.Long)
        (m.Seconds = $util.Long.fromValue(d.Seconds)).unsigned = false;
      else if (typeof d.Seconds === 'string')
        m.Seconds = parseInt(d.Seconds, 10);
      else if (typeof d.Seconds === 'number')
        m.Seconds = d.Seconds;
      else if (typeof d.Seconds === 'object')
        m.Seconds = new $util.LongBits(d.Seconds.low >>> 0, d.Seconds.high >>> 0).toNumber();
    }
    if (d.FractionalNanoseconds != null) {
      m.FractionalNanoseconds = d.FractionalNanoseconds >>> 0;
    }
    return m;
  };
  UnixTime.toObject = function toObject(m, o) {
    if (!o)
      o = {};
    var d = {};
    if (o.defaults) {
      if ($util.Long) {
        var n = new $util.Long(0, 0, false);
        d.Seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
      } else
        d.Seconds = o.longs === String ? '0' : 0;
      d.FractionalNanoseconds = 0;
    }
    if (m.Seconds != null && m.hasOwnProperty('Seconds')) {
      if (typeof m.Seconds === 'number')
        d.Seconds = o.longs === String ? String(m.Seconds) : m.Seconds;
      else
        d.Seconds = o.longs === String ? $util.Long.prototype.toString.call(m.Seconds) : o.longs === Number ? new $util.LongBits(m.Seconds.low >>> 0, m.Seconds.high >>> 0).toNumber() : m.Seconds;
    }
    if (m.FractionalNanoseconds != null && m.hasOwnProperty('FractionalNanoseconds')) {
      d.FractionalNanoseconds = m.FractionalNanoseconds;
    }
    return d;
  };
  UnixTime.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, minimal.util.toJSONOptions);
  };
  return UnixTime;
})();
const Metadata = $root.Metadata = (() => {
  function Metadata(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null)
          this[ks[i]] = p[ks[i]];
  }
  Metadata.prototype.MimeType = '';
  Metadata.encode = function encode(m, w) {
    if (!w)
      w = $Writer.create();
    if (m.MimeType != null && Object.hasOwnProperty.call(m, 'MimeType'))
      w.uint32(10).string(m.MimeType);
    return w;
  };
  Metadata.decode = function decode(r, l) {
    if (!(r instanceof $Reader))
      r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l, m = new $root.Metadata();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
      case 1:
        m.MimeType = r.string();
        break;
      default:
        r.skipType(t & 7);
        break;
      }
    }
    return m;
  };
  Metadata.fromObject = function fromObject(d) {
    if (d instanceof $root.Metadata)
      return d;
    var m = new $root.Metadata();
    if (d.MimeType != null) {
      m.MimeType = String(d.MimeType);
    }
    return m;
  };
  Metadata.toObject = function toObject(m, o) {
    if (!o)
      o = {};
    var d = {};
    if (o.defaults) {
      d.MimeType = '';
    }
    if (m.MimeType != null && m.hasOwnProperty('MimeType')) {
      d.MimeType = m.MimeType;
    }
    return d;
  };
  Metadata.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, minimal.util.toJSONOptions);
  };
  return Metadata;
})();

;// CONCATENATED MODULE: ../node_modules/ipfs-unixfs/esm/src/index.js


const PBData = Data;
const types = (/* unused pure expression or super */ null && ([
  'raw',
  'directory',
  'file',
  'metadata',
  'symlink',
  'hamt-sharded-directory'
]));
const dirTypes = (/* unused pure expression or super */ null && ([
  'directory',
  'hamt-sharded-directory'
]));
const DEFAULT_FILE_MODE = parseInt('0644', 8);
const DEFAULT_DIRECTORY_MODE = parseInt('0755', 8);
function parseMode(mode) {
  if (mode == null) {
    return undefined;
  }
  if (typeof mode === 'number') {
    return mode & 4095;
  }
  mode = mode.toString();
  if (mode.substring(0, 1) === '0') {
    return parseInt(mode, 8) & 4095;
  }
  return parseInt(mode, 10) & 4095;
}
function src_parseMtime(input) {
  if (input == null) {
    return undefined;
  }
  let mtime;
  if (input.secs != null) {
    mtime = {
      secs: input.secs,
      nsecs: input.nsecs
    };
  }
  if (input.Seconds != null) {
    mtime = {
      secs: input.Seconds,
      nsecs: input.FractionalNanoseconds
    };
  }
  if (Array.isArray(input)) {
    mtime = {
      secs: input[0],
      nsecs: input[1]
    };
  }
  if (input instanceof Date) {
    const ms = input.getTime();
    const secs = Math.floor(ms / 1000);
    mtime = {
      secs: secs,
      nsecs: (ms - secs * 1000) * 1000
    };
  }
  if (!Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
    return undefined;
  }
  if (mtime != null && mtime.nsecs != null && (mtime.nsecs < 0 || mtime.nsecs > 999999999)) {
    throw err_code(new Error('mtime-nsecs must be within the range [0,999999999]'), 'ERR_INVALID_MTIME_NSECS');
  }
  return mtime;
}
class UnixFS {
  static unmarshal(marshaled) {
    const message = PBData.decode(marshaled);
    const decoded = PBData.toObject(message, {
      defaults: false,
      arrays: true,
      longs: Number,
      objects: false
    });
    const data = new UnixFS({
      type: types[decoded.Type],
      data: decoded.Data,
      blockSizes: decoded.blocksizes,
      mode: decoded.mode,
      mtime: decoded.mtime ? {
        secs: decoded.mtime.Seconds,
        nsecs: decoded.mtime.FractionalNanoseconds
      } : undefined
    });
    data._originalMode = decoded.mode || 0;
    return data;
  }
  constructor(options = { type: 'file' }) {
    const {type, data, blockSizes, hashType, fanout, mtime, mode} = options;
    if (type && !types.includes(type)) {
      throw errcode(new Error('Type: ' + type + ' is not valid'), 'ERR_INVALID_TYPE');
    }
    this.type = type || 'file';
    this.data = data;
    this.hashType = hashType;
    this.fanout = fanout;
    this.blockSizes = blockSizes || [];
    this._originalMode = 0;
    this.mode = parseMode(mode);
    if (mtime) {
      this.mtime = src_parseMtime(mtime);
      if (this.mtime && !this.mtime.nsecs) {
        this.mtime.nsecs = 0;
      }
    }
  }
  set mode(mode) {
    this._mode = this.isDirectory() ? DEFAULT_DIRECTORY_MODE : DEFAULT_FILE_MODE;
    const parsedMode = parseMode(mode);
    if (parsedMode !== undefined) {
      this._mode = parsedMode;
    }
  }
  get mode() {
    return this._mode;
  }
  isDirectory() {
    return Boolean(this.type && dirTypes.includes(this.type));
  }
  addBlockSize(size) {
    this.blockSizes.push(size);
  }
  removeBlockSize(index) {
    this.blockSizes.splice(index, 1);
  }
  fileSize() {
    if (this.isDirectory()) {
      return 0;
    }
    let sum = 0;
    this.blockSizes.forEach(size => {
      sum += size;
    });
    if (this.data) {
      sum += this.data.length;
    }
    return sum;
  }
  marshal() {
    let type;
    switch (this.type) {
    case 'raw':
      type = PBData.DataType.Raw;
      break;
    case 'directory':
      type = PBData.DataType.Directory;
      break;
    case 'file':
      type = PBData.DataType.File;
      break;
    case 'metadata':
      type = PBData.DataType.Metadata;
      break;
    case 'symlink':
      type = PBData.DataType.Symlink;
      break;
    case 'hamt-sharded-directory':
      type = PBData.DataType.HAMTShard;
      break;
    default:
      throw errcode(new Error('Type: ' + type + ' is not valid'), 'ERR_INVALID_TYPE');
    }
    let data = this.data;
    if (!this.data || !this.data.length) {
      data = undefined;
    }
    let mode;
    if (this.mode != null) {
      mode = this._originalMode & 4294963200 | (parseMode(this.mode) || 0);
      if (mode === DEFAULT_FILE_MODE && !this.isDirectory()) {
        mode = undefined;
      }
      if (mode === DEFAULT_DIRECTORY_MODE && this.isDirectory()) {
        mode = undefined;
      }
    }
    let mtime;
    if (this.mtime != null) {
      const parsed = src_parseMtime(this.mtime);
      if (parsed) {
        mtime = {
          Seconds: parsed.secs,
          FractionalNanoseconds: parsed.nsecs
        };
        if (mtime.FractionalNanoseconds === 0) {
          delete mtime.FractionalNanoseconds;
        }
      }
    }
    const pbData = {
      Type: type,
      Data: data,
      filesize: this.isDirectory() ? undefined : this.fileSize(),
      blocksizes: this.blockSizes,
      hashType: this.hashType,
      fanout: this.fanout,
      mode,
      mtime
    };
    return PBData.encode(pbData).finish();
  }
}

;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/files/normalise-candidate-multiple.js






async function* normaliseCandidateMultiple(input, normaliseContent) {
  if (typeof input === 'string' || input instanceof String || isBytes(input) || isBlob(input) || input._readableState) {
    throw err_code(new Error('Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead'), 'ERR_UNEXPECTED_INPUT');
  }
  if (isReadableStream(input)) {
    input = browser_readablestream_to_it(input);
  }
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    const peekable = it_peekable(input);
    const {value, done} = await peekable.peek();
    if (done) {
      yield* [];
      return;
    }
    peekable.push(value);
    if (Number.isInteger(value)) {
      throw err_code(new Error('Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead'), 'ERR_UNEXPECTED_INPUT');
    }
    if (value._readableState) {
      yield* it_map(peekable, value => toFileObject({ content: value }, normaliseContent));
      return;
    }
    if (isBytes(value)) {
      yield toFileObject({ content: peekable }, normaliseContent);
      return;
    }
    if (isFileObject(value) || value[Symbol.iterator] || value[Symbol.asyncIterator] || isReadableStream(value) || isBlob(value)) {
      yield* it_map(peekable, value => toFileObject(value, normaliseContent));
      return;
    }
  }
  if (isFileObject(input)) {
    throw err_code(new Error('Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead'), 'ERR_UNEXPECTED_INPUT');
  }
  throw err_code(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT');
}
async function toFileObject(input, normaliseContent) {
  const {path, mode, mtime, content} = input;
  const file = {
    path: path || '',
    mode: parseMode(mode),
    mtime: src_parseMtime(mtime)
  };
  if (content) {
    file.content = await normaliseContent(content);
  } else if (!path) {
    file.content = await normaliseContent(input);
  }
  return file;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/files/normalise-input-multiple.browser.js


function normaliseInput(input) {
  return normaliseCandidateMultiple(input, normaliseContent, true);
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/mode-to-string.js
function mode_to_string_modeToString(mode) {
  if (mode == null) {
    return undefined;
  }
  if (typeof mode === 'string') {
    return mode;
  }
  return mode.toString(8).padStart(4, '0');
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/multipart-request.browser.js


async function multipartRequest(source, abortController, headers = {}) {
  const parts = [];
  const formData = new FormData();
  let index = 0;
  let total = 0;
  for await (const {content, path, mode, mtime} of normaliseInput(source)) {
    let fileSuffix = '';
    const type = content ? 'file' : 'dir';
    if (index > 0) {
      fileSuffix = `-${ index }`;
    }
    let fieldName = type + fileSuffix;
    const qs = [];
    if (mode !== null && mode !== undefined) {
      qs.push(`mode=${ mode_to_string_modeToString(mode) }`);
    }
    if (mtime != null) {
      const {secs, nsecs} = mtime;
      qs.push(`mtime=${ secs }`);
      if (nsecs != null) {
        qs.push(`mtime-nsecs=${ nsecs }`);
      }
    }
    if (qs.length) {
      fieldName = `${ fieldName }?${ qs.join('&') }`;
    }
    if (content) {
      formData.set(fieldName, content, path != null ? encodeURIComponent(path) : undefined);
      const end = total + content.size;
      parts.push({
        name: path,
        start: total,
        end
      });
      total = end;
    } else if (path != null) {
      formData.set(fieldName, new File([''], encodeURIComponent(path), { type: 'application/x-directory' }));
    } else {
      throw new Error('path or content or both must be set');
    }
    index++;
  }
  return {
    total,
    parts,
    headers,
    body: formData
  };
}
// EXTERNAL MODULE: ../node_modules/any-signal/index.js
var any_signal = __webpack_require__(1659);
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/abort-signal.js

function filter(signals) {
  return signals.filter(Boolean);
}
function abortSignal(...signals) {
  return (0,any_signal.anySignal)(filter(signals));
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/block/put.js





const createPut = configure(api => {
  async function put(data, options = {}) {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    let res;
    try {
      const response = await api.post('block/put', {
        signal: signal,
        searchParams: toUrlSearchParams(options),
        ...await multipartRequest([data], controller, options.headers)
      });
      res = await response.json();
    } catch (err) {
      if (options.format === 'dag-pb') {
        return put(data, {
          ...options,
          format: 'protobuf'
        });
      } else if (options.format === 'dag-cbor') {
        return put(data, {
          ...options,
          format: 'cbor'
        });
      }
      throw err;
    }
    return src_cid.CID.parse(res.Key);
  }
  return put;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/block/rm.js



const createRm = configure(api => {
  async function* rm(cid, options = {}) {
    if (!Array.isArray(cid)) {
      cid = [cid];
    }
    const res = await api.post('block/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.map(cid => cid.toString()),
        'stream-channels': true,
        ...options
      }),
      headers: options.headers
    });
    for await (const removed of res.ndjson()) {
      yield rm_toCoreInterface(removed);
    }
  }
  return rm;
});
function rm_toCoreInterface(removed) {
  const out = { cid: src_cid.CID.parse(removed.Hash) };
  if (removed.Error) {
    out.error = new Error(removed.Error);
  }
  return out;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/block/stat.js



const stat_createStat = configure(api => {
  async function stat(cid, options = {}) {
    const res = await api.post('block/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return {
      cid: src_cid.CID.parse(data.Key),
      size: data.Size
    };
  }
  return stat;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/block/index.js




function createBlock(config) {
  return {
    get: createGet(config),
    put: createPut(config),
    rm: createRm(config),
    stat: stat_createStat(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bootstrap/add.js



const createAdd = configure(api => {
  async function add(addr, options = {}) {
    const res = await api.post('bootstrap/add', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    });
    const {Peers} = await res.json();
    return { Peers: Peers.map(ma => new multiaddr_src.Multiaddr(ma)) };
  }
  return add;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bootstrap/clear.js



const createClear = configure(api => {
  async function clear(options = {}) {
    const res = await api.post('bootstrap/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        all: true
      }),
      headers: options.headers
    });
    const {Peers} = await res.json();
    return { Peers: Peers.map(ma => new multiaddr_src.Multiaddr(ma)) };
  }
  return clear;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bootstrap/list.js



const createList = configure(api => {
  async function list(options = {}) {
    const res = await api.post('bootstrap/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const {Peers} = await res.json();
    return { Peers: Peers.map(ma => new multiaddr_src.Multiaddr(ma)) };
  }
  return list;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bootstrap/reset.js



const createReset = configure(api => {
  async function reset(options = {}) {
    const res = await api.post('bootstrap/add', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        default: true
      }),
      headers: options.headers
    });
    const {Peers} = await res.json();
    return { Peers: Peers.map(ma => new multiaddr_src.Multiaddr(ma)) };
  }
  return reset;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bootstrap/rm.js



const rm_createRm = configure(api => {
  async function rm(addr, options = {}) {
    const res = await api.post('bootstrap/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    });
    const {Peers} = await res.json();
    return { Peers: Peers.map(ma => new multiaddr_src.Multiaddr(ma)) };
  }
  return rm;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/bootstrap/index.js





function createBootstrap(config) {
  return {
    add: createAdd(config),
    clear: createClear(config),
    list: createList(config),
    reset: createReset(config),
    rm: rm_createRm(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/profiles/apply.js


const createApply = configure(api => {
  async function apply(profile, options = {}) {
    const res = await api.post('config/profile/apply', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: profile,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return {
      original: data.OldCfg,
      updated: data.NewCfg
    };
  }
  return apply;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/object-to-camel.js
function objectToCamel(obj) {
  if (obj == null) {
    return obj;
  }
  const caps = /^[A-Z]+$/;
  const output = {};
  return Object.keys(obj).reduce((camelObj, k) => {
    if (caps.test(k)) {
      camelObj[k.toLowerCase()] = obj[k];
    } else if (caps.test(k[0])) {
      camelObj[k[0].toLowerCase() + k.slice(1)] = obj[k];
    } else {
      camelObj[k] = obj[k];
    }
    return camelObj;
  }, output);
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/profiles/list.js



const list_createList = configure(api => {
  async function list(options = {}) {
    const res = await api.post('config/profile/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const data = await res.json();
    return data.map(profile => objectToCamel(profile));
  }
  return list;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/profiles/index.js


function createProfiles(config) {
  return {
    apply: createApply(config),
    list: list_createList(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/get.js


const get_createGet = configure(api => {
  const get = async (key, options = {}) => {
    if (!key) {
      throw new Error('key argument is required');
    }
    const res = await api.post('config', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return data.Value;
  };
  return get;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/get-all.js


const createGetAll = configure(api => {
  const getAll = async (options = {}) => {
    const res = await api.post('config/show', {
      signal: options.signal,
      searchParams: toUrlSearchParams({ ...options }),
      headers: options.headers
    });
    const data = await res.json();
    return data;
  };
  return getAll;
});
// EXTERNAL MODULE: ../node_modules/uint8arrays/esm/src/from-string.js
var from_string = __webpack_require__(4081);
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/replace.js





const createReplace = configure(api => {
  const replace = async (config, options = {}) => {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const res = await api.post('config/replace', {
      signal,
      searchParams: toUrlSearchParams(options),
      ...await multipartRequest([(0,from_string.fromString)(JSON.stringify(config))], controller, options.headers)
    });
    await res.text();
  };
  return replace;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/set.js


const createSet = configure(api => {
  const set = async (key, value, options = {}) => {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type');
    }
    const params = {
      ...options,
      ...encodeParam(key, value)
    };
    const res = await api.post('config', {
      signal: options.signal,
      searchParams: toUrlSearchParams(params),
      headers: options.headers
    });
    await res.text();
  };
  return set;
});
const encodeParam = (key, value) => {
  switch (typeof value) {
  case 'boolean':
    return {
      arg: [
        key,
        value.toString()
      ],
      bool: true
    };
  case 'string':
    return {
      arg: [
        key,
        value
      ]
    };
  default:
    return {
      arg: [
        key,
        JSON.stringify(value)
      ],
      json: true
    };
  }
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/config/index.js





function createConfig(config) {
  return {
    getAll: createGetAll(config),
    get: get_createGet(config),
    set: createSet(config),
    replace: createReplace(config),
    profiles: createProfiles(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dag/export.js


const createExport = configure(api => {
  async function* dagExport(root, options = {}) {
    const res = await api.post('dag/export', {
      signal: options.signal,
      searchParams: toUrlSearchParams({ arg: root.toString() }),
      headers: options.headers
    });
    yield* res.iterator();
  }
  return dagExport;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/resolve.js


async function* resolve(cid, path, codecs, getBlock, options) {
  const load = async cid => {
    const codec = await codecs.getCodec(cid.code);
    const block = await getBlock(cid, options);
    return codec.decode(block);
  };
  const parts = path.split('/').filter(Boolean);
  let value = await load(cid);
  let lastCid = cid;
  while (parts.length) {
    const key = parts.shift();
    if (!key) {
      throw err_code(new Error(`Could not resolve path "${ path }"`), 'ERR_INVALID_PATH');
    }
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      value = value[key];
      yield {
        value,
        remainderPath: parts.join('/')
      };
    } else {
      throw err_code(new Error(`no link named "${ key }" under ${ lastCid }`), 'ERR_NO_LINK');
    }
    const cid = src_cid.CID.asCID(value);
    if (cid) {
      lastCid = cid;
      value = await load(value);
    }
  }
  yield {
    value,
    remainderPath: ''
  };
}
// EXTERNAL MODULE: ../node_modules/it-first/index.js
var it_first = __webpack_require__(6843);
// EXTERNAL MODULE: ../node_modules/it-last/index.js
var it_last = __webpack_require__(1215);
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dag/get.js






const dag_get_createGet = (codecs, options) => {
  const fn = configure((api, opts) => {
    const getBlock = createGet(opts);
    const get = async (cid, options = {}) => {
      if (options.path) {
        const entry = options.localResolve ? await it_first(resolve(cid, options.path, codecs, getBlock, options)) : await it_last(resolve(cid, options.path, codecs, getBlock, options));
        const result = entry;
        if (!result) {
          throw err_code(new Error('Not found'), 'ERR_NOT_FOUND');
        }
        return result;
      }
      const codec = await codecs.getCodec(cid.code);
      const block = await getBlock(cid, options);
      const node = codec.decode(block);
      return {
        value: node,
        remainderPath: ''
      };
    };
    return get;
  });
  return fn(options);
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dag/import.js





const createImport = configure(api => {
  async function* dagImport(source, options = {}) {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const {headers, body} = await multipartRequest(source, controller, options.headers);
    const res = await api.post('dag/import', {
      signal,
      headers,
      body,
      searchParams: toUrlSearchParams({ 'pin-roots': options.pinRoots })
    });
    for await (const {Root} of res.ndjson()) {
      if (Root !== undefined) {
        const {
          Cid: {'/': Cid},
          PinErrorMsg
        } = Root;
        yield {
          root: {
            cid: src_cid.CID.parse(Cid),
            pinErrorMsg: PinErrorMsg
          }
        };
      }
    }
  }
  return dagImport;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dag/put.js





const put_createPut = (codecs, options) => {
  const fn = configure(api => {
    const put = async (dagNode, options = {}) => {
      const settings = {
        storeCodec: 'dag-cbor',
        hashAlg: 'sha2-256',
        ...options
      };
      let serialized;
      if (settings.inputCodec) {
        if (!(dagNode instanceof Uint8Array)) {
          throw new Error('Can only inputCodec on raw bytes that can be decoded');
        }
        serialized = dagNode;
      } else {
        const storeCodec = await codecs.getCodec(settings.storeCodec);
        serialized = storeCodec.encode(dagNode);
        settings.inputCodec = settings.storeCodec;
      }
      const controller = new AbortController();
      const signal = abortSignal(controller.signal, settings.signal);
      const res = await api.post('dag/put', {
        timeout: settings.timeout,
        signal,
        searchParams: toUrlSearchParams(settings),
        ...await multipartRequest([serialized], controller, settings.headers)
      });
      const data = await res.json();
      return src_cid.CID.parse(data.Cid['/']);
    };
    return put;
  });
  return fn(options);
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dag/resolve.js



const createResolve = configure(api => {
  const resolve = async (ipfsPath, options = {}) => {
    const res = await api.post('dag/resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ ipfsPath }${ options.path ? `/${ options.path }`.replace(/\/[/]+/g, '/') : '' }`,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return {
      cid: src_cid.CID.parse(data.Cid['/']),
      remainderPath: data.RemPath
    };
  };
  return resolve;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dag/index.js





function createDag(codecs, config) {
  return {
    export: createExport(config),
    get: dag_get_createGet(codecs, config),
    import: createImport(config),
    put: put_createPut(codecs, config),
    resolve: createResolve(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/response-types.js
const SendingQuery = 0;
const PeerResponse = 1;
const FinalPeer = 2;
const QueryError = 3;
const Provider = 4;
const Value = 5;
const AddingPeer = 6;
const DialingPeer = 7;
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/map-event.js



const mapEvent = event => {
  if (event.Type === SendingQuery) {
    return {
      to: event.ID,
      name: 'SENDING_QUERY',
      type: event.Type
    };
  }
  if (event.Type === PeerResponse) {
    return {
      from: event.ID,
      name: 'PEER_RESPONSE',
      type: event.Type,
      messageType: 0,
      messageName: 'PUT_VALUE',
      closer: (event.Responses || []).map(({ID, Addrs}) => ({
        id: ID,
        multiaddrs: Addrs.map(addr => new multiaddr_src.Multiaddr(addr))
      })),
      providers: (event.Responses || []).map(({ID, Addrs}) => ({
        id: ID,
        multiaddrs: Addrs.map(addr => new multiaddr_src.Multiaddr(addr))
      }))
    };
  }
  if (event.Type === FinalPeer) {
    let peer = {
      id: event.ID,
      multiaddrs: []
    };
    if (event.Responses && event.Responses.length) {
      peer = {
        id: event.Responses[0].ID,
        multiaddrs: event.Responses[0].Addrs.map(addr => new multiaddr_src.Multiaddr(addr))
      };
    }
    return {
      from: event.ID,
      name: 'FINAL_PEER',
      type: event.Type,
      peer
    };
  }
  if (event.Type === QueryError) {
    return {
      from: event.ID,
      name: 'QUERY_ERROR',
      type: event.Type,
      error: new Error(event.Extra)
    };
  }
  if (event.Type === Provider) {
    return {
      from: event.ID,
      name: 'PROVIDER',
      type: event.Type,
      providers: event.Responses.map(({ID, Addrs}) => ({
        id: ID,
        multiaddrs: Addrs.map(addr => new multiaddr_src.Multiaddr(addr))
      }))
    };
  }
  if (event.Type === Value) {
    return {
      from: event.ID,
      name: 'VALUE',
      type: event.Type,
      value: (0,from_string.fromString)(event.Extra, 'base64pad')
    };
  }
  if (event.Type === AddingPeer) {
    const peers = event.Responses.map(({ID}) => ID);
    if (!peers.length) {
      throw new Error('No peer found');
    }
    return {
      name: 'ADDING_PEER',
      type: event.Type,
      peer: peers[0]
    };
  }
  if (event.Type === DialingPeer) {
    return {
      name: 'DIALING_PEER',
      type: event.Type,
      peer: event.ID
    };
  }
  throw new Error('Unknown DHT event type');
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/find-peer.js



const createFindPeer = configure(api => {
  async function* findPeer(peerId, options = {}) {
    const res = await api.post('dht/findpeer', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId,
        ...options
      }),
      headers: options.headers
    });
    for await (const event of res.ndjson()) {
      yield mapEvent(event);
    }
  }
  return findPeer;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/find-provs.js



const createFindProvs = configure(api => {
  async function* findProvs(cid, options = {}) {
    const res = await api.post('dht/findprovs', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    });
    for await (const event of res.ndjson()) {
      yield mapEvent(event);
    }
  }
  return findProvs;
});
// EXTERNAL MODULE: ../node_modules/uint8arrays/esm/src/to-string.js
var to_string = __webpack_require__(5824);
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/get.js




const dht_get_createGet = configure(api => {
  async function* get(key, options = {}) {
    const res = await api.post('dht/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key instanceof Uint8Array ? (0,to_string.toString)(key) : key.toString(),
        ...options
      }),
      headers: options.headers
    });
    for await (const event of res.ndjson()) {
      yield mapEvent(event);
    }
  }
  return get;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/provide.js



const createProvide = configure(api => {
  async function* provide(cids, options = { recursive: false }) {
    const cidArr = Array.isArray(cids) ? cids : [cids];
    const res = await api.post('dht/provide', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cidArr.map(cid => cid.toString()),
        ...options
      }),
      headers: options.headers
    });
    for await (const event of res.ndjson()) {
      yield mapEvent(event);
    }
  }
  return provide;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/put.js






const dht_put_createPut = configure(api => {
  async function* put(key, value, options = {}) {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const res = await api.post('dht/put', {
      signal,
      searchParams: toUrlSearchParams({
        arg: key instanceof Uint8Array ? (0,to_string.toString)(key) : key.toString(),
        ...options
      }),
      ...await multipartRequest([value], controller, options.headers)
    });
    for await (const event of res.ndjson()) {
      yield mapEvent(event);
    }
  }
  return put;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/query.js



const createQuery = configure(api => {
  async function* query(peerId, options = {}) {
    const res = await api.post('dht/query', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId.toString(),
        ...options
      }),
      headers: options.headers
    });
    for await (const event of res.ndjson()) {
      yield mapEvent(event);
    }
  }
  return query;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dht/index.js






function createDht(config) {
  return {
    findPeer: createFindPeer(config),
    findProvs: createFindProvs(config),
    get: dht_get_createGet(config),
    provide: createProvide(config),
    put: dht_put_createPut(config),
    query: createQuery(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/diag/cmds.js


const createCmds = configure(api => {
  async function cmds(options = {}) {
    const res = await api.post('diag/cmds', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    return res.json();
  }
  return cmds;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/diag/net.js


const createNet = configure(api => {
  async function net(options = {}) {
    const res = await api.post('diag/net', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    return res.json();
  }
  return net;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/diag/sys.js


const createSys = configure(api => {
  async function sys(options = {}) {
    const res = await api.post('diag/sys', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    return res.json();
  }
  return sys;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/diag/index.js



function createDiag(config) {
  return {
    cmds: createCmds(config),
    net: createNet(config),
    sys: createSys(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/chmod.js


const createChmod = configure(api => {
  async function chmod(path, mode, options = {}) {
    const res = await api.post('files/chmod', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        mode,
        ...options
      }),
      headers: options.headers
    });
    await res.text();
  }
  return chmod;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/cp.js



const createCp = configure(api => {
  async function cp(sources, destination, options = {}) {
    const sourceArr = Array.isArray(sources) ? sources : [sources];
    const res = await api.post('files/cp', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sourceArr.concat(destination).map(src => src_cid.CID.asCID(src) ? `/ipfs/${ src }` : src),
        ...options
      }),
      headers: options.headers
    });
    await res.text();
  }
  return cp;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/flush.js



const createFlush = configure(api => {
  async function flush(path, options = {}) {
    if (!path || typeof path !== 'string') {
      throw new Error('ipfs.files.flush requires a path');
    }
    const res = await api.post('files/flush', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return src_cid.CID.parse(data.Cid);
  }
  return flush;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/object-to-camel-with-metadata.js

function objectToCamelWithMetadata(entry) {
  const file = objectToCamel(entry);
  if (Object.prototype.hasOwnProperty.call(file, 'mode')) {
    file.mode = parseInt(file.mode, 8);
  }
  if (Object.prototype.hasOwnProperty.call(file, 'mtime')) {
    file.mtime = {
      secs: file.mtime,
      nsecs: file.mtimeNsecs || 0
    };
    delete file.mtimeNsecs;
  }
  return file;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/ls.js




const createLs = configure(api => {
  async function* ls(path, options = {}) {
    if (!path) {
      throw new Error('ipfs.files.ls requires a path');
    }
    const res = await api.post('files/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: src_cid.CID.asCID(path) ? `/ipfs/${ path }` : path,
        long: true,
        ...options,
        stream: true
      }),
      headers: options.headers
    });
    for await (const result of res.ndjson()) {
      if ('Entries' in result) {
        for (const entry of result.Entries || []) {
          yield ls_toCoreInterface(objectToCamelWithMetadata(entry));
        }
      } else {
        yield ls_toCoreInterface(objectToCamelWithMetadata(result));
      }
    }
  }
  return ls;
});
function ls_toCoreInterface(entry) {
  if (entry.hash) {
    entry.cid = src_cid.CID.parse(entry.hash);
  }
  delete entry.hash;
  entry.type = entry.type === 1 ? 'directory' : 'file';
  return entry;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/mkdir.js


const createMkdir = configure(api => {
  async function mkdir(path, options = {}) {
    const res = await api.post('files/mkdir', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    });
    await res.text();
  }
  return mkdir;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/mv.js


const createMv = configure(api => {
  async function mv(sources, destination, options = {}) {
    if (!Array.isArray(sources)) {
      sources = [sources];
    }
    const res = await api.post('files/mv', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sources.concat(destination),
        ...options
      }),
      headers: options.headers
    });
    await res.text();
  }
  return mv;
});
// EXTERNAL MODULE: ../node_modules/stream-to-it/source.js
var source = __webpack_require__(4372);
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/read.js



const createRead = configure(api => {
  async function* read(path, options = {}) {
    const res = await api.post('files/read', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        count: options.length,
        ...options
      }),
      headers: options.headers
    });
    yield* source(res.body);
  }
  return read;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/rm.js



const files_rm_createRm = configure(api => {
  async function rm(path, options = {}) {
    const res = await api.post('files/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    });
    const body = await res.text();
    if (body !== '') {
      const error = new http.HTTPError(res);
      error.message = body;
      throw error;
    }
  }
  return rm;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/stat.js




const files_stat_createStat = configure(api => {
  async function stat(path, options = {}) {
    const res = await api.post('files/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    data.WithLocality = data.WithLocality || false;
    return stat_toCoreInterface(objectToCamelWithMetadata(data));
  }
  return stat;
});
function stat_toCoreInterface(entry) {
  entry.cid = src_cid.CID.parse(entry.hash);
  delete entry.hash;
  return entry;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/touch.js


const createTouch = configure(api => {
  async function touch(path, options = {}) {
    const res = await api.post('files/touch', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    });
    await res.text();
  }
  return touch;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/write.js






const createWrite = configure(api => {
  async function write(path, input, options = {}) {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const res = await api.post('files/write', {
      signal,
      searchParams: toUrlSearchParams({
        arg: path,
        streamChannels: true,
        count: options.length,
        ...options
      }),
      ...await multipartRequest([{
          content: input,
          path: 'arg',
          mode: modeToString(options.mode),
          mtime: parseMtime(options.mtime)
        }], controller, options.headers)
    });
    await res.text();
  }
  return write;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/files/index.js











function createFiles(config) {
  return {
    chmod: createChmod(config),
    cp: createCp(config),
    flush: createFlush(config),
    ls: createLs(config),
    mkdir: createMkdir(config),
    mv: createMv(config),
    read: createRead(config),
    rm: files_rm_createRm(config),
    stat: files_stat_createStat(config),
    touch: createTouch(config),
    write: createWrite(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/export.js


const export_createExport = configure(api => {
  const exportKey = async (name, password, options = {}) => {
    throw err_code(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED');
  };
  return exportKey;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/gen.js



const createGen = configure(api => {
  async function gen(name, options = {
    type: 'rsa',
    size: 2048
  }) {
    const res = await api.post('key/gen', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return objectToCamel(data);
  }
  return gen;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/import.js



const import_createImport = configure(api => {
  async function importKey(name, pem, password, options = {}) {
    const res = await api.post('key/import', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        pem,
        password,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return objectToCamel(data);
  }
  return importKey;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/info.js


const createInfo = configure(api => {
  const info = async (name, options = {}) => {
    throw err_code(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED');
  };
  return info;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/list.js



const key_list_createList = configure(api => {
  async function list(options = {}) {
    const res = await api.post('key/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const data = await res.json();
    return (data.Keys || []).map(k => objectToCamel(k));
  }
  return list;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/rename.js



const createRename = configure(api => {
  async function rename(oldName, newName, options = {}) {
    const res = await api.post('key/rename', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          oldName,
          newName
        ],
        ...options
      }),
      headers: options.headers
    });
    return objectToCamel(await res.json());
  }
  return rename;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/rm.js



const key_rm_createRm = configure(api => {
  async function rm(name, options = {}) {
    const res = await api.post('key/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return objectToCamel(data.Keys[0]);
  }
  return rm;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/key/index.js







function createKey(config) {
  return {
    export: export_createExport(config),
    gen: createGen(config),
    import: import_createImport(config),
    info: createInfo(config),
    list: key_list_createList(config),
    rename: createRename(config),
    rm: key_rm_createRm(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/log/level.js



const createLevel = configure(api => {
  async function level(subsystem, level, options = {}) {
    const res = await api.post('log/level', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          subsystem,
          level
        ],
        ...options
      }),
      headers: options.headers
    });
    return objectToCamel(await res.json());
  }
  return level;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/log/ls.js


const ls_createLs = configure(api => {
  async function ls(options = {}) {
    const res = await api.post('log/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const data = await res.json();
    return data.Strings;
  }
  return ls;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/log/tail.js


const createTail = configure(api => {
  async function* tail(options = {}) {
    const res = await api.post('log/tail', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    yield* res.ndjson();
  }
  return tail;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/log/index.js



function createLog(config) {
  return {
    level: createLevel(config),
    ls: ls_createLs(config),
    tail: createTail(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/name/publish.js



const createPublish = configure(api => {
  async function publish(path, options = {}) {
    const res = await api.post('name/publish', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ path }`,
        ...options
      }),
      headers: options.headers
    });
    return objectToCamel(await res.json());
  }
  return publish;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/name/resolve.js


const resolve_createResolve = configure(api => {
  async function* resolve(path, options = {}) {
    const res = await api.post('name/resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        stream: true,
        ...options
      }),
      headers: options.headers
    });
    for await (const result of res.ndjson()) {
      yield result.Path;
    }
  }
  return resolve;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/name/pubsub/cancel.js



const createCancel = configure(api => {
  async function cancel(name, options = {}) {
    const res = await api.post('name/pubsub/cancel', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    });
    return objectToCamel(await res.json());
  }
  return cancel;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/name/pubsub/state.js



const createState = configure(api => {
  async function state(options = {}) {
    const res = await api.post('name/pubsub/state', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    return objectToCamel(await res.json());
  }
  return state;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/name/pubsub/subs.js


const createSubs = configure(api => {
  async function subs(options = {}) {
    const res = await api.post('name/pubsub/subs', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const data = await res.json();
    return data.Strings || [];
  }
  return subs;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/name/pubsub/index.js



function createPubsub(config) {
  return {
    cancel: createCancel(config),
    state: createState(config),
    subs: createSubs(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/name/index.js



function createName(config) {
  return {
    publish: createPublish(config),
    resolve: resolve_createResolve(config),
    pubsub: createPubsub(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/data.js



const createData = configure(api => {
  async function data(cid, options = {}) {
    const res = await api.post('object/data', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ cid instanceof Uint8Array ? src_cid.CID.decode(cid) : cid }`,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.arrayBuffer();
    return new Uint8Array(data, 0, data.byteLength);
  }
  return data;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/get.js




const object_get_createGet = configure(api => {
  async function get(cid, options = {}) {
    const res = await api.post('object/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ cid instanceof Uint8Array ? src_cid.CID.decode(cid) : cid }`,
        dataEncoding: 'base64',
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return {
      Data: (0,from_string.fromString)(data.Data, 'base64pad'),
      Links: (data.Links || []).map(link => ({
        Name: link.Name,
        Hash: src_cid.CID.parse(link.Hash),
        Tsize: link.Size
      }))
    };
  }
  return get;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/links.js



const createLinks = configure(api => {
  async function links(cid, options = {}) {
    const res = await api.post('object/links', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ cid instanceof Uint8Array ? src_cid.CID.decode(cid) : cid }`,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return (data.Links || []).map(l => ({
      Name: l.Name,
      Tsize: l.Size,
      Hash: src_cid.CID.parse(l.Hash)
    }));
  }
  return links;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/new.js



const createNew = configure(api => {
  async function newObject(options = {}) {
    const res = await api.post('object/new', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: options.template,
        ...options
      }),
      headers: options.headers
    });
    const {Hash} = await res.json();
    return src_cid.CID.parse(Hash);
  }
  return newObject;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/put.js


const object_put_createPut = (codecs, options) => {
  const fn = configure(api => {
    const dagPut = put_createPut(codecs, options);
    async function put(obj, options = {}) {
      return dagPut(obj, {
        ...options,
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256',
        version: 1
      });
    }
    return put;
  });
  return fn(options);
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/stat.js



const object_stat_createStat = configure(api => {
  async function stat(cid, options = {}) {
    const res = await api.post('object/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ cid }`,
        ...options
      }),
      headers: options.headers
    });
    const output = await res.json();
    return {
      ...output,
      Hash: src_cid.CID.parse(output.Hash)
    };
  }
  return stat;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/patch/add-link.js



const createAddLink = configure(api => {
  async function addLink(cid, dLink, options = {}) {
    const res = await api.post('object/patch/add-link', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${ cid }`,
          dLink.Name || dLink.name || '',
          (dLink.Hash || dLink.cid || '').toString() || null
        ],
        ...options
      }),
      headers: options.headers
    });
    const {Hash} = await res.json();
    return src_cid.CID.parse(Hash);
  }
  return addLink;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/patch/append-data.js





const createAppendData = configure(api => {
  async function appendData(cid, data, options = {}) {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const res = await api.post('object/patch/append-data', {
      signal,
      searchParams: toUrlSearchParams({
        arg: `${ cid }`,
        ...options
      }),
      ...await multipartRequest([data], controller, options.headers)
    });
    const {Hash} = await res.json();
    return src_cid.CID.parse(Hash);
  }
  return appendData;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/patch/rm-link.js



const createRmLink = configure(api => {
  async function rmLink(cid, dLink, options = {}) {
    const res = await api.post('object/patch/rm-link', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${ cid }`,
          dLink.Name || dLink.name || null
        ],
        ...options
      }),
      headers: options.headers
    });
    const {Hash} = await res.json();
    return src_cid.CID.parse(Hash);
  }
  return rmLink;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/patch/set-data.js





const createSetData = configure(api => {
  async function setData(cid, data, options = {}) {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const res = await api.post('object/patch/set-data', {
      signal,
      searchParams: toUrlSearchParams({
        arg: [`${ cid }`],
        ...options
      }),
      ...await multipartRequest([data], controller, options.headers)
    });
    const {Hash} = await res.json();
    return src_cid.CID.parse(Hash);
  }
  return setData;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/patch/index.js




function createPatch(config) {
  return {
    addLink: createAddLink(config),
    appendData: createAppendData(config),
    rmLink: createRmLink(config),
    setData: createSetData(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/object/index.js







function createObject(codecs, config) {
  return {
    data: createData(config),
    get: object_get_createGet(config),
    links: createLinks(config),
    new: createNew(config),
    put: object_put_createPut(codecs, config),
    stat: object_stat_createStat(config),
    patch: createPatch(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/pins/normalise-input.js


async function* normalise_input_normaliseInput(input) {
  if (input === null || input === undefined) {
    throw err_code(new Error(`Unexpected input: ${ input }`), 'ERR_UNEXPECTED_INPUT');
  }
  const cid = src_cid.CID.asCID(input);
  if (cid) {
    yield toPin({ cid });
    return;
  }
  if (input instanceof String || typeof input === 'string') {
    yield toPin({ path: input });
    return;
  }
  if (input.cid != null || input.path != null) {
    return yield toPin(input);
  }
  if (Symbol.iterator in input) {
    const iterator = input[Symbol.iterator]();
    const first = iterator.next();
    if (first.done)
      return iterator;
    if (src_cid.CID.asCID(first.value) || first.value instanceof String || typeof first.value === 'string') {
      yield toPin({ cid: first.value });
      for (const cid of iterator) {
        yield toPin({ cid });
      }
      return;
    }
    if (first.value.cid != null || first.value.path != null) {
      yield toPin(first.value);
      for (const obj of iterator) {
        yield toPin(obj);
      }
      return;
    }
    throw err_code(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT');
  }
  if (Symbol.asyncIterator in input) {
    const iterator = input[Symbol.asyncIterator]();
    const first = await iterator.next();
    if (first.done)
      return iterator;
    if (src_cid.CID.asCID(first.value) || first.value instanceof String || typeof first.value === 'string') {
      yield toPin({ cid: first.value });
      for await (const cid of iterator) {
        yield toPin({ cid });
      }
      return;
    }
    if (first.value.cid != null || first.value.path != null) {
      yield toPin(first.value);
      for await (const obj of iterator) {
        yield toPin(obj);
      }
      return;
    }
    throw err_code(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT');
  }
  throw err_code(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT');
}
function toPin(input) {
  const path = input.cid || `${ input.path }`;
  if (!path) {
    throw err_code(new Error('Unexpected input: Please path either a CID or an IPFS path'), 'ERR_UNEXPECTED_INPUT');
  }
  const pin = {
    path,
    recursive: input.recursive !== false
  };
  if (input.metadata != null) {
    pin.metadata = input.metadata;
  }
  return pin;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/add-all.js




const createAddAll = configure(api => {
  async function* addAll(source, options = {}) {
    for await (const {path, recursive, metadata} of normalise_input_normaliseInput(source)) {
      const res = await api.post('pin/add', {
        signal: options.signal,
        searchParams: toUrlSearchParams({
          ...options,
          arg: path,
          recursive,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          stream: true
        }),
        headers: options.headers
      });
      for await (const pin of res.ndjson()) {
        if (pin.Pins) {
          for (const cid of pin.Pins) {
            yield src_cid.CID.parse(cid);
          }
          continue;
        }
        yield src_cid.CID.parse(pin);
      }
    }
  }
  return addAll;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/add.js



function add_createAdd(config) {
  const all = createAddAll(config);
  return configure(() => {
    async function add(path, options = {}) {
      return it_last(all([{
          path,
          ...options
        }], options));
    }
    return add;
  })(config);
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/ls.js



function ls_toPin(type, cid, metadata) {
  const pin = {
    type,
    cid: src_cid.CID.parse(cid)
  };
  if (metadata) {
    pin.metadata = metadata;
  }
  return pin;
}
const pin_ls_createLs = configure(api => {
  async function* ls(options = {}) {
    let paths = [];
    if (options.paths) {
      paths = Array.isArray(options.paths) ? options.paths : [options.paths];
    }
    const res = await api.post('pin/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: paths.map(path => `${ path }`),
        stream: true
      }),
      headers: options.headers
    });
    for await (const pin of res.ndjson()) {
      if (pin.Keys) {
        for (const cid of Object.keys(pin.Keys)) {
          yield ls_toPin(pin.Keys[cid].Type, cid, pin.Keys[cid].Metadata);
        }
        return;
      }
      yield ls_toPin(pin.Type, pin.Cid, pin.Metadata);
    }
  }
  return ls;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/rm-all.js




const createRmAll = configure(api => {
  async function* rmAll(source, options = {}) {
    for await (const {path, recursive} of normalise_input_normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams);
      searchParams.append('arg', `${ path }`);
      if (recursive != null)
        searchParams.set('recursive', String(recursive));
      const res = await api.post('pin/rm', {
        signal: options.signal,
        headers: options.headers,
        searchParams: toUrlSearchParams({
          ...options,
          arg: `${ path }`,
          recursive
        })
      });
      for await (const pin of res.ndjson()) {
        if (pin.Pins) {
          yield* pin.Pins.map(cid => src_cid.CID.parse(cid));
          continue;
        }
        yield src_cid.CID.parse(pin);
      }
    }
  }
  return rmAll;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/rm.js



const pin_rm_createRm = config => {
  const all = createRmAll(config);
  return configure(() => {
    async function rm(path, options = {}) {
      return it_last(all([{
          path,
          ...options
        }], options));
    }
    return rm;
  })(config);
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/utils.js


const decodePin = ({
  Name: name,
  Status: status,
  Cid: cid
}) => {
  return {
    cid: src_cid.CID.parse(cid),
    name,
    status
  };
};
const encodeService = service => {
  if (typeof service === 'string' && service !== '') {
    return service;
  } else {
    throw new TypeError('service name must be passed');
  }
};
const encodeCID = cid => {
  if (src_cid.CID.asCID(cid)) {
    return cid.toString();
  } else {
    throw new TypeError(`CID instance expected instead of ${ typeof cid }`);
  }
};
const encodeQuery = ({service, cid, name, status, all}) => {
  const query = toUrlSearchParams({
    service: encodeService(service),
    name,
    force: all ? true : undefined
  });
  if (cid) {
    for (const value of cid) {
      query.append('cid', encodeCID(value));
    }
  }
  if (status) {
    for (const value of status) {
      query.append('status', value);
    }
  }
  return query;
};
const encodeAddParams = ({cid, service, background, name, origins}) => {
  const params = toUrlSearchParams({
    arg: encodeCID(cid),
    service: encodeService(service),
    name,
    background: background ? true : undefined
  });
  if (origins) {
    for (const origin of origins) {
      params.append('origin', origin.toString());
    }
  }
  return params;
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/add.js

function remote_add_createAdd(client) {
  async function add(cid, {timeout, signal, headers, ...query}) {
    const response = await client.post('pin/remote/add', {
      timeout,
      signal,
      headers,
      searchParams: encodeAddParams({
        cid,
        ...query
      })
    });
    return decodePin(await response.json());
  }
  return add;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/ls.js

function remote_ls_createLs(client) {
  async function* ls({timeout, signal, headers, ...query}) {
    const response = await client.post('pin/remote/ls', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery(query)
    });
    for await (const pin of response.ndjson()) {
      yield decodePin(pin);
    }
  }
  return ls;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/rm.js

function remote_rm_createRm(client) {
  async function rm({timeout, signal, headers, ...query}) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: false
      })
    });
  }
  return rm;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/rm-all.js

function rm_all_createRmAll(client) {
  async function rmAll({timeout, signal, headers, ...query}) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: true
      })
    });
  }
  return rmAll;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/service/utils.js
function encodeEndpoint(url) {
  const href = String(url);
  if (href === 'undefined') {
    throw Error('endpoint is required');
  }
  return href[href.length - 1] === '/' ? href.slice(0, -1) : href;
}
function decodeRemoteService(json) {
  return {
    service: json.Service,
    endpoint: new URL(json.ApiEndpoint),
    ...json.Stat && { stat: decodeStat(json.Stat) }
  };
}
function decodeStat(json) {
  switch (json.Status) {
  case 'valid': {
      const {Pinning, Pinned, Queued, Failed} = json.PinCount;
      return {
        status: 'valid',
        pinCount: {
          queued: Queued,
          pinning: Pinning,
          pinned: Pinned,
          failed: Failed
        }
      };
    }
  case 'invalid': {
      return { status: 'invalid' };
    }
  default: {
      return { status: json.Status };
    }
  }
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/service/add.js


function service_add_createAdd(client) {
  async function add(name, options) {
    const {endpoint, key, headers, timeout, signal} = options;
    await client.post('pin/remote/service/add', {
      timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: [
          name,
          encodeEndpoint(endpoint),
          key
        ]
      }),
      headers
    });
  }
  return add;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/service/ls.js


function service_ls_createLs(client) {
  async function ls(options = {}) {
    const {stat, headers, timeout, signal} = options;
    const response = await client.post('pin/remote/service/ls', {
      timeout,
      signal,
      headers,
      searchParams: stat === true ? toUrlSearchParams({ stat }) : undefined
    });
    const {RemoteServices} = await response.json();
    return RemoteServices.map(decodeRemoteService);
  }
  return ls;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/service/rm.js

function service_rm_createRm(client) {
  async function rm(name, options = {}) {
    await client.post('pin/remote/service/rm', {
      signal: options.signal,
      headers: options.headers,
      searchParams: toUrlSearchParams({ arg: name })
    });
  }
  return rm;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/service/index.js




function createService(config) {
  const client = new Client(config);
  return {
    add: service_add_createAdd(client),
    ls: service_ls_createLs(client),
    rm: service_rm_createRm(client)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/remote/index.js






function createRemote(config) {
  const client = new Client(config);
  return {
    add: remote_add_createAdd(client),
    ls: remote_ls_createLs(client),
    rm: remote_rm_createRm(client),
    rmAll: rm_all_createRmAll(client),
    service: createService(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pin/index.js






function createPin(config) {
  return {
    addAll: createAddAll(config),
    add: add_createAdd(config),
    ls: pin_ls_createLs(config),
    rmAll: createRmAll(config),
    rm: pin_rm_createRm(config),
    remote: createRemote(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/lib/http-rpc-wire-format.js



const rpcArrayToTextArray = strings => {
  if (Array.isArray(strings)) {
    return strings.map(rpcToText);
  }
  return strings;
};
const rpcToText = mb => (0,to_string.toString)(rpcToBytes(mb));
const rpcToBytes = mb => base64.base64url.decode(mb);
const textToUrlSafeRpc = text => base64.base64url.encode((0,from_string.fromString)(text));

;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pubsub/ls.js



const pubsub_ls_createLs = configure(api => {
  async function ls(options = {}) {
    const {Strings} = await (await api.post('pubsub/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json();
    return rpcArrayToTextArray(Strings) || [];
  }
  return ls;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pubsub/peers.js



const createPeers = configure(api => {
  async function peers(topic, options = {}) {
    const res = await api.post('pubsub/peers', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: textToUrlSafeRpc(topic),
        ...options
      }),
      headers: options.headers
    });
    const {Strings} = await res.json();
    return Strings || [];
  }
  return peers;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pubsub/publish.js





const publish_createPublish = configure(api => {
  async function publish(topic, data, options = {}) {
    const searchParams = toUrlSearchParams({
      arg: textToUrlSafeRpc(topic),
      ...options
    });
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const res = await api.post('pubsub/pub', {
      signal,
      searchParams,
      ...await multipartRequest([data], controller, options.headers)
    });
    await res.text();
  }
  return publish;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pubsub/subscribe.js




const subscribe_log = browser('ipfs-http-client:pubsub:subscribe');
const createSubscribe = (options, subsTracker) => {
  return configure(api => {
    async function subscribe(topic, handler, options = {}) {
      options.signal = subsTracker.subscribe(topic, handler, options.signal);
      let done;
      let fail;
      const result = new Promise((resolve, reject) => {
        done = resolve;
        fail = reject;
      });
      const ffWorkaround = setTimeout(() => done(), 1000);
      api.post('pubsub/sub', {
        signal: options.signal,
        searchParams: toUrlSearchParams({
          arg: textToUrlSafeRpc(topic),
          ...options
        }),
        headers: options.headers
      }).catch(err => {
        subsTracker.unsubscribe(topic, handler);
        fail(err);
      }).then(response => {
        clearTimeout(ffWorkaround);
        if (!response) {
          return;
        }
        readMessages(response, {
          onMessage: handler,
          onEnd: () => subsTracker.unsubscribe(topic, handler),
          onError: options.onError
        });
        done();
      });
      return result;
    }
    return subscribe;
  })(options);
};
async function readMessages(response, {onMessage, onEnd, onError}) {
  onError = onError || subscribe_log;
  try {
    for await (const msg of response.ndjson()) {
      try {
        if (!msg.from) {
          continue;
        }
        onMessage({
          from: msg.from,
          data: rpcToBytes(msg.data),
          seqno: rpcToBytes(msg.seqno),
          topicIDs: rpcArrayToTextArray(msg.topicIDs)
        });
      } catch (err) {
        err.message = `Failed to parse pubsub message: ${ err.message }`;
        onError(err, false, msg);
      }
    }
  } catch (err) {
    if (!isAbortError(err)) {
      onError(err, true);
    }
  } finally {
    onEnd();
  }
}
const isAbortError = error => {
  switch (error.type) {
  case 'aborted':
    return true;
  case 'abort':
    return true;
  default:
    return error.name === 'AbortError';
  }
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pubsub/unsubscribe.js
const createUnsubscribe = (options, subsTracker) => {
  async function unsubscribe(topic, handler) {
    subsTracker.unsubscribe(topic, handler);
  }
  return unsubscribe;
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pubsub/subscription-tracker.js
class SubscriptionTracker {
  constructor() {
    this._subs = new Map();
  }
  subscribe(topic, handler, signal) {
    const topicSubs = this._subs.get(topic) || [];
    if (topicSubs.find(s => s.handler === handler)) {
      throw new Error(`Already subscribed to ${ topic } with this handler`);
    }
    const controller = new AbortController();
    this._subs.set(topic, [{
        handler,
        controller
      }].concat(topicSubs));
    if (signal) {
      signal.addEventListener('abort', () => this.unsubscribe(topic, handler));
    }
    return controller.signal;
  }
  unsubscribe(topic, handler) {
    const subs = this._subs.get(topic) || [];
    let unsubs;
    if (handler) {
      this._subs.set(topic, subs.filter(s => s.handler !== handler));
      unsubs = subs.filter(s => s.handler === handler);
    } else {
      this._subs.set(topic, []);
      unsubs = subs;
    }
    if (!(this._subs.get(topic) || []).length) {
      this._subs.delete(topic);
    }
    unsubs.forEach(s => s.controller.abort());
  }
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/pubsub/index.js






function pubsub_createPubsub(config) {
  const subscriptionTracker = new SubscriptionTracker();
  return {
    ls: pubsub_ls_createLs(config),
    peers: createPeers(config),
    publish: publish_createPublish(config),
    subscribe: createSubscribe(config, subscriptionTracker),
    unsubscribe: createUnsubscribe(config, subscriptionTracker)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/refs/local.js



const createLocal = configure(api => {
  async function* refsLocal(options = {}) {
    const res = await api.post('refs/local', {
      signal: options.signal,
      transform: objectToCamel,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    yield* res.ndjson();
  }
  return refsLocal;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/refs/index.js





const createRefs = configure((api, opts) => {
  const refs = async function* (args, options = {}) {
    const argsArr = Array.isArray(args) ? args : [args];
    const res = await api.post('refs', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: argsArr.map(arg => `${ arg instanceof Uint8Array ? src_cid.CID.decode(arg) : arg }`),
        ...options
      }),
      headers: options.headers,
      transform: objectToCamel
    });
    yield* res.ndjson();
  };
  return Object.assign(refs, { local: createLocal(opts) });
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/repo/gc.js



const createGc = configure(api => {
  async function* gc(options = {}) {
    const res = await api.post('repo/gc', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      transform: res => {
        return {
          err: res.Error ? new Error(res.Error) : null,
          cid: (res.Key || {})['/'] ? src_cid.CID.parse(res.Key['/']) : null
        };
      }
    });
    yield* res.ndjson();
  }
  return gc;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/repo/stat.js


const repo_stat_createStat = configure(api => {
  async function stat(options = {}) {
    const res = await api.post('repo/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const data = await res.json();
    return {
      numObjects: BigInt(data.NumObjects),
      repoSize: BigInt(data.RepoSize),
      repoPath: data.RepoPath,
      version: data.Version,
      storageMax: BigInt(data.StorageMax)
    };
  }
  return stat;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/repo/version.js


const createVersion = configure(api => {
  async function version(options = {}) {
    const res = await (await api.post('repo/version', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json();
    return res.Version;
  }
  return version;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/repo/index.js



function createRepo(config) {
  return {
    gc: createGc(config),
    stat: repo_stat_createStat(config),
    version: createVersion(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/stats/bw.js


const createBw = configure(api => {
  async function* bw(options = {}) {
    const res = await api.post('stats/bw', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      transform: stats => ({
        totalIn: BigInt(stats.TotalIn),
        totalOut: BigInt(stats.TotalOut),
        rateIn: parseFloat(stats.RateIn),
        rateOut: parseFloat(stats.RateOut)
      })
    });
    yield* res.ndjson();
  }
  return bw;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/stats/index.js



function createStats(config) {
  return {
    bitswap: createStat(config),
    repo: repo_stat_createStat(config),
    bw: createBw(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/swarm/addrs.js



const createAddrs = configure(api => {
  async function addrs(options = {}) {
    const res = await api.post('swarm/addrs', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const {Addrs} = await res.json();
    return Object.keys(Addrs).map(id => ({
      id,
      addrs: (Addrs[id] || []).map(a => new multiaddr_src.Multiaddr(a))
    }));
  }
  return addrs;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/swarm/connect.js


const createConnect = configure(api => {
  async function connect(addr, options = {}) {
    const res = await api.post('swarm/connect', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    });
    const {Strings} = await res.json();
    return Strings || [];
  }
  return connect;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/swarm/disconnect.js


const createDisconnect = configure(api => {
  async function disconnect(addr, options = {}) {
    const res = await api.post('swarm/disconnect', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    });
    const {Strings} = await res.json();
    return Strings || [];
  }
  return disconnect;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/swarm/local-addrs.js



const createLocalAddrs = configure(api => {
  async function localAddrs(options = {}) {
    const res = await api.post('swarm/addrs/local', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const {Strings} = await res.json();
    return (Strings || []).map(a => new multiaddr_src.Multiaddr(a));
  }
  return localAddrs;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/swarm/peers.js



const peers_createPeers = configure(api => {
  async function peers(options = {}) {
    const res = await api.post('swarm/peers', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    const {Peers} = await res.json();
    return (Peers || []).map(peer => {
      return {
        addr: new multiaddr_src.Multiaddr(peer.Addr),
        peer: peer.Peer,
        muxer: peer.Muxer,
        latency: peer.Latency,
        streams: peer.Streams,
        direction: peer.Direction == null ? undefined : peer.Direction === 0 ? 'inbound' : 'outbound'
      };
    });
  }
  return peers;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/swarm/index.js





function createSwarm(config) {
  return {
    addrs: createAddrs(config),
    connect: createConnect(config),
    disconnect: createDisconnect(config),
    localAddrs: createLocalAddrs(config),
    peers: peers_createPeers(config)
  };
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/add-all.js






const add_all_createAddAll = configure(api => {
  async function* addAll(source, options = {}) {
    const controller = new AbortController();
    const signal = abortSignal(controller.signal, options.signal);
    const {headers, body, total, parts} = await multipartRequest(source, controller, options.headers);
    const [progressFn, onUploadProgress] = typeof options.progress === 'function' ? createProgressHandler(total, parts, options.progress) : [
      undefined,
      undefined
    ];
    const res = await api.post('add', {
      searchParams: toUrlSearchParams({
        'stream-channels': true,
        ...options,
        progress: Boolean(progressFn)
      }),
      onUploadProgress,
      signal,
      headers,
      body
    });
    for await (let file of res.ndjson()) {
      file = objectToCamel(file);
      if (file.hash !== undefined) {
        yield add_all_toCoreInterface(file);
      } else if (progressFn) {
        progressFn(file.bytes || 0, file.name);
      }
    }
  }
  return addAll;
});
const createProgressHandler = (total, parts, progress) => parts ? [
  undefined,
  createOnUploadProgress(total, parts, progress)
] : [
  progress,
  undefined
];
const createOnUploadProgress = (size, parts, progress) => {
  let index = 0;
  const count = parts.length;
  return ({loaded, total}) => {
    const position = Math.floor(loaded / total * size);
    while (index < count) {
      const {start, end, name} = parts[index];
      if (position < end) {
        progress(position - start, name);
        break;
      } else {
        progress(end - start, name);
        index += 1;
      }
    }
  };
};
function add_all_toCoreInterface({name, hash, size, mode, mtime, mtimeNsecs}) {
  const output = {
    path: name,
    cid: src_cid.CID.parse(hash),
    size: parseInt(size)
  };
  if (mode != null) {
    output.mode = parseInt(mode, 8);
  }
  if (mtime != null) {
    output.mtime = {
      secs: mtime,
      nsecs: mtimeNsecs || 0
    };
  }
  return output;
}
// EXTERNAL MODULE: ../node_modules/blob-to-it/index.js
var blob_to_it = __webpack_require__(3133);
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/files/normalise-content.js








async function* toAsyncIterable(thing) {
  yield thing;
}
async function normalise_content_normaliseContent(input) {
  if (isBytes(input)) {
    return toAsyncIterable(toBytes(input));
  }
  if (typeof input === 'string' || input instanceof String) {
    return toAsyncIterable(toBytes(input.toString()));
  }
  if (isBlob(input)) {
    return blob_to_it(input);
  }
  if (isReadableStream(input)) {
    input = browser_readablestream_to_it(input);
  }
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    const peekable = it_peekable(input);
    const {value, done} = await peekable.peek();
    if (done) {
      return toAsyncIterable(new Uint8Array(0));
    }
    peekable.push(value);
    if (Number.isInteger(value)) {
      return toAsyncIterable(Uint8Array.from(await it_all(peekable)));
    }
    if (isBytes(value) || typeof value === 'string' || value instanceof String) {
      return it_map(peekable, toBytes);
    }
  }
  throw err_code(new Error(`Unexpected input: ${ input }`), 'ERR_UNEXPECTED_INPUT');
}
function toBytes(chunk) {
  if (chunk instanceof Uint8Array) {
    return chunk;
  }
  if (ArrayBuffer.isView(chunk)) {
    return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  }
  if (chunk instanceof ArrayBuffer) {
    return new Uint8Array(chunk);
  }
  if (Array.isArray(chunk)) {
    return Uint8Array.from(chunk);
  }
  return (0,from_string.fromString)(chunk.toString());
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/files/normalise-candidate-single.js





async function* normaliseCandidateSingle(input, normaliseContent) {
  if (input === null || input === undefined) {
    throw err_code(new Error(`Unexpected input: ${ input }`), 'ERR_UNEXPECTED_INPUT');
  }
  if (typeof input === 'string' || input instanceof String) {
    yield normalise_candidate_single_toFileObject(input.toString(), normaliseContent);
    return;
  }
  if (isBytes(input) || isBlob(input)) {
    yield normalise_candidate_single_toFileObject(input, normaliseContent);
    return;
  }
  if (isReadableStream(input)) {
    input = browser_readablestream_to_it(input);
  }
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    const peekable = it_peekable(input);
    const {value, done} = await peekable.peek();
    if (done) {
      yield { content: [] };
      return;
    }
    peekable.push(value);
    if (Number.isInteger(value) || isBytes(value) || typeof value === 'string' || value instanceof String) {
      yield normalise_candidate_single_toFileObject(peekable, normaliseContent);
      return;
    }
    throw err_code(new Error('Unexpected input: multiple items passed - if you are using ipfs.add, please use ipfs.addAll instead'), 'ERR_UNEXPECTED_INPUT');
  }
  if (isFileObject(input)) {
    yield normalise_candidate_single_toFileObject(input, normaliseContent);
    return;
  }
  throw err_code(new Error('Unexpected input: cannot convert "' + typeof input + '" into ImportCandidate'), 'ERR_UNEXPECTED_INPUT');
}
async function normalise_candidate_single_toFileObject(input, normaliseContent) {
  const {path, mode, mtime, content} = input;
  const file = {
    path: path || '',
    mode: parseMode(mode),
    mtime: src_parseMtime(mtime)
  };
  if (content) {
    file.content = await normaliseContent(content);
  } else if (!path) {
    file.content = await normaliseContent(input);
  }
  return file;
}
;// CONCATENATED MODULE: ../node_modules/ipfs-core-utils/esm/src/files/normalise-input-single.js


function normalise_input_single_normaliseInput(input) {
  return normaliseCandidateSingle(input, normalise_content_normaliseContent);
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/add.js




function src_add_createAdd(options) {
  const all = add_all_createAddAll(options);
  return configure(() => {
    async function add(input, options = {}) {
      return await it_last(all(normalise_input_single_normaliseInput(input), options));
    }
    return add;
  })(options);
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/cat.js


const createCat = configure(api => {
  async function* cat(path, options = {}) {
    const res = await api.post('cat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path.toString(),
        ...options
      }),
      headers: options.headers
    });
    yield* res.iterator();
  }
  return cat;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/commands.js


const createCommands = configure(api => {
  const commands = async (options = {}) => {
    const res = await api.post('commands', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    return res.json();
  };
  return commands;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/dns.js


const createDns = configure(api => {
  const dns = async (domain, options = {}) => {
    const res = await api.post('dns', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: domain,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    return data.Path;
  };
  return dns;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/get-endpoint-config.js

const createGetEndpointConfig = configure(api => {
  return () => {
    const url = new URL(api.opts.base || '');
    return {
      host: url.hostname,
      port: url.port,
      protocol: url.protocol,
      pathname: url.pathname,
      'api-path': url.pathname
    };
  };
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/get.js



const src_get_createGet = configure(api => {
  async function* get(path, options = {}) {
    const opts = {
      arg: `${ path instanceof Uint8Array ? src_cid.CID.decode(path) : path }`,
      ...options
    };
    if (opts.compressionLevel) {
      opts['compression-level'] = opts.compressionLevel;
      delete opts.compressionLevel;
    }
    const res = await api.post('get', {
      signal: options.signal,
      searchParams: toUrlSearchParams(opts),
      headers: options.headers
    });
    yield* res.iterator();
  }
  return get;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/id.js




const createId = configure(api => {
  async function id(options = {}) {
    const res = await api.post('id', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: options.peerId ? options.peerId.toString() : undefined,
        ...options
      }),
      headers: options.headers
    });
    const data = await res.json();
    const output = { ...objectToCamel(data) };
    if (output.addresses) {
      output.addresses = output.addresses.map(ma => new multiaddr_src.Multiaddr(ma));
    }
    return output;
  }
  return id;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/is-online.js

const createIsOnline = options => {
  const id = createId(options);
  async function isOnline(options = {}) {
    const res = await id(options);
    return Boolean(res && res.addresses && res.addresses.length);
  }
  return isOnline;
};
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/ls.js




const src_ls_createLs = configure((api, opts) => {
  async function* ls(path, options = {}) {
    const pathStr = `${ path instanceof Uint8Array ? src_cid.CID.decode(path) : path }`;
    async function mapLink(link) {
      let hash = link.Hash;
      if (hash.includes('/')) {
        const ipfsPath = hash.startsWith('/ipfs/') ? hash : `/ipfs/${ hash }`;
        const stats = await files_stat_createStat(opts)(ipfsPath);
        hash = stats.cid;
      } else {
        hash = src_cid.CID.parse(hash);
      }
      const entry = {
        name: link.Name,
        path: pathStr + (link.Name ? `/${ link.Name }` : ''),
        size: link.Size,
        cid: hash,
        type: typeOf(link)
      };
      if (link.Mode) {
        entry.mode = parseInt(link.Mode, 8);
      }
      if (link.Mtime !== undefined && link.Mtime !== null) {
        entry.mtime = { secs: link.Mtime };
        if (link.MtimeNsecs !== undefined && link.MtimeNsecs !== null) {
          entry.mtime.nsecs = link.MtimeNsecs;
        }
      }
      return entry;
    }
    const res = await api.post('ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: pathStr,
        ...options
      }),
      headers: options.headers
    });
    for await (let result of res.ndjson()) {
      result = result.Objects;
      if (!result) {
        throw new Error('expected .Objects in results');
      }
      result = result[0];
      if (!result) {
        throw new Error('expected one array in results.Objects');
      }
      const links = result.Links;
      if (!Array.isArray(links)) {
        throw new Error('expected one array in results.Objects[0].Links');
      }
      if (!links.length) {
        yield mapLink(result);
        return;
      }
      yield* links.map(mapLink);
    }
  }
  return ls;
});
function typeOf(link) {
  switch (link.Type) {
  case 1:
  case 5:
    return 'dir';
  case 2:
    return 'file';
  default:
    return 'file';
  }
}
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/mount.js



const createMount = configure(api => {
  async function mount(options = {}) {
    const res = await api.post('dns', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    return objectToCamel(await res.json());
  }
  return mount;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/ping.js



const createPing = configure(api => {
  async function* ping(peerId, options = {}) {
    const res = await api.post('ping', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ peerId }`,
        ...options
      }),
      headers: options.headers,
      transform: objectToCamel
    });
    yield* res.ndjson();
  }
  return ping;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/resolve.js


const src_resolve_createResolve = configure(api => {
  async function resolve(path, options = {}) {
    const res = await api.post('resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    });
    const {Path} = await res.json();
    return Path;
  }
  return resolve;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/start.js


const createStart = configure(api => {
  const start = async (options = {}) => {
    throw err_code(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED');
  };
  return start;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/stop.js


const createStop = configure(api => {
  async function stop(options = {}) {
    const res = await api.post('shutdown', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    await res.text();
  }
  return stop;
});
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/version.js



const version_createVersion = configure(api => {
  async function version(options = {}) {
    const res = await api.post('version', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    });
    return {
      ...objectToCamel(await res.json()),
      'ipfs-http-client': '1.0.0'
    };
  }
  return version;
});
// EXTERNAL MODULE: ipfs-utils/src/files/glob-source.js (ignored)
var glob_source_ignored_ = __webpack_require__(7868);
// EXTERNAL MODULE: ../node_modules/ipfs-utils/src/files/url-source.js
var url_source = __webpack_require__(6417);
;// CONCATENATED MODULE: ../node_modules/ipfs-http-client/esm/src/index.js












































function create(options = {}) {
  const id = {
    name: identity.identity.name,
    code: identity.identity.code,
    encode: id => id,
    decode: id => id
  };
  const multibaseCodecs = Object.values(basics/* bases */.gh);
  (options.ipld && options.ipld.bases ? options.ipld.bases : []).forEach(base => multibaseCodecs.push(base));
  const multibases = new Multibases({
    bases: multibaseCodecs,
    loadBase: options.ipld && options.ipld.loadBase
  });
  const blockCodecs = Object.values(basics/* codecs */.QB);
  [
    src_namespaceObject,
    esm_namespaceObject,
    dag_json_esm_namespaceObject,
    lib_namespaceObject,
    id
  ].concat(options.ipld && options.ipld.codecs || []).forEach(codec => blockCodecs.push(codec));
  const multicodecs = new Multicodecs({
    codecs: blockCodecs,
    loadCodec: options.ipld && options.ipld.loadCodec
  });
  const multihashHashers = Object.values(basics/* hashes */.kq);
  (options.ipld && options.ipld.hashers ? options.ipld.hashers : []).forEach(hasher => multihashHashers.push(hasher));
  const multihashes = new Multihashes({
    hashers: multihashHashers,
    loadHasher: options.ipld && options.ipld.loadHasher
  });
  const client = {
    add: src_add_createAdd(options),
    addAll: add_all_createAddAll(options),
    bitswap: createBitswap(options),
    block: createBlock(options),
    bootstrap: createBootstrap(options),
    cat: createCat(options),
    commands: createCommands(options),
    config: createConfig(options),
    dag: createDag(multicodecs, options),
    dht: createDht(options),
    diag: createDiag(options),
    dns: createDns(options),
    files: createFiles(options),
    get: src_get_createGet(options),
    getEndpointConfig: createGetEndpointConfig(options),
    id: createId(options),
    isOnline: createIsOnline(options),
    key: createKey(options),
    log: createLog(options),
    ls: src_ls_createLs(options),
    mount: createMount(options),
    name: createName(options),
    object: createObject(multicodecs, options),
    pin: createPin(options),
    ping: createPing(options),
    pubsub: pubsub_createPubsub(options),
    refs: createRefs(options),
    repo: createRepo(options),
    resolve: src_resolve_createResolve(options),
    start: createStart(options),
    stats: createStats(options),
    stop: createStop(options),
    swarm: createSwarm(options),
    version: version_createVersion(options),
    bases: multibases,
    codecs: multicodecs,
    hashers: multihashes
  };
  return client;
}



const globSource = glob_source_ignored_;

/***/ }),

/***/ 9853:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "kU": () => (/* binding */ baseX),
  "Dp": () => (/* binding */ from),
  "ET": () => (/* binding */ rfc4648)
});

// UNUSED EXPORTS: Codec, or

;// CONCATENATED MODULE: ../node_modules/multiformats/esm/vendor/base-x.js
function base(ALPHABET, name) {
  if (ALPHABET.length >= 255) {
    throw new TypeError('Alphabet too long');
  }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + ' is ambiguous');
    }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256);
  var iFACTOR = Math.log(256) / Math.log(BASE);
  function encode(source) {
    if (source instanceof Uint8Array);
    else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError('Expected Uint8Array');
    }
    if (source.length === 0) {
      return '';
    }
    var zeroes = 0;
    var length = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
    var b58 = new Uint8Array(size);
    while (pbegin !== pend) {
      var carry = source[pbegin];
      var i = 0;
      for (var it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = i;
      pbegin++;
    }
    var it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== 'string') {
      throw new TypeError('Expected String');
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    var psz = 0;
    if (source[psz] === ' ') {
      return;
    }
    var zeroes = 0;
    var length = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    var size = (source.length - psz) * FACTOR + 1 >>> 0;
    var b256 = new Uint8Array(size);
    while (source[psz]) {
      var carry = BASE_MAP[source.charCodeAt(psz)];
      if (carry === 255) {
        return;
      }
      var i = 0;
      for (var it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = i;
      psz++;
    }
    if (source[psz] === ' ') {
      return;
    }
    var it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = new Uint8Array(zeroes + (size - it4));
    var j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch;
  }
  function decode(string) {
    var buffer = decodeUnsafe(string);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Non-${ name } character`);
  }
  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  };
}
var src = base;
var _brrp__multiformats_scope_baseX = src;
/* harmony default export */ const base_x = (_brrp__multiformats_scope_baseX);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bytes.js
var bytes = __webpack_require__(9551);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base.js


class Encoder {
  constructor(name, prefix, baseEncode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
  }
  encode(bytes) {
    if (bytes instanceof Uint8Array) {
      return `${ this.prefix }${ this.baseEncode(bytes) }`;
    } else {
      throw Error('Unknown type, must be binary type');
    }
  }
}
class Decoder {
  constructor(name, prefix, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseDecode = baseDecode;
  }
  decode(text) {
    if (typeof text === 'string') {
      switch (text[0]) {
      case this.prefix: {
          return this.baseDecode(text.slice(1));
        }
      default: {
          throw Error(`Unable to decode multibase string ${ JSON.stringify(text) }, ${ this.name } decoder only supports inputs prefixed with ${ this.prefix }`);
        }
      }
    } else {
      throw Error('Can only multibase decode strings');
    }
  }
  or(decoder) {
    return or(this, decoder);
  }
}
class ComposedDecoder {
  constructor(decoders) {
    this.decoders = decoders;
  }
  or(decoder) {
    return or(this, decoder);
  }
  decode(input) {
    const prefix = input[0];
    const decoder = this.decoders[prefix];
    if (decoder) {
      return decoder.decode(input);
    } else {
      throw RangeError(`Unable to decode multibase string ${ JSON.stringify(input) }, only inputs prefixed with ${ Object.keys(this.decoders) } are supported`);
    }
  }
}
const or = (left, right) => new ComposedDecoder({
  ...left.decoders || { [left.prefix]: left },
  ...right.decoders || { [right.prefix]: right }
});
class Codec {
  constructor(name, prefix, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder(name, prefix, baseEncode);
    this.decoder = new Decoder(name, prefix, baseDecode);
  }
  encode(input) {
    return this.encoder.encode(input);
  }
  decode(input) {
    return this.decoder.decode(input);
  }
}
const from = ({name, prefix, encode, decode}) => new Codec(name, prefix, encode, decode);
const baseX = ({prefix, name, alphabet}) => {
  const {encode, decode} = base_x(alphabet, name);
  return from({
    prefix,
    name,
    encode,
    decode: text => (0,bytes.coerce)(decode(text))
  });
};
const decode = (string, alphabet, bitsPerChar, name) => {
  const codes = {};
  for (let i = 0; i < alphabet.length; ++i) {
    codes[alphabet[i]] = i;
  }
  let end = string.length;
  while (string[end - 1] === '=') {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = codes[string[i]];
    if (value === undefined) {
      throw new SyntaxError(`Non-${ name } character`);
    }
    buffer = buffer << bitsPerChar | value;
    bits += bitsPerChar;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= bitsPerChar || 255 & buffer << 8 - bits) {
    throw new SyntaxError('Unexpected end of data');
  }
  return out;
};
const encode = (data, alphabet, bitsPerChar) => {
  const pad = alphabet[alphabet.length - 1] === '=';
  const mask = (1 << bitsPerChar) - 1;
  let out = '';
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | data[i];
    bits += 8;
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & buffer >> bits];
    }
  }
  if (bits) {
    out += alphabet[mask & buffer << bitsPerChar - bits];
  }
  if (pad) {
    while (out.length * bitsPerChar & 7) {
      out += '=';
    }
  }
  return out;
};
const rfc4648 = ({name, prefix, bitsPerChar, alphabet}) => {
  return from({
    prefix,
    name,
    encode(input) {
      return encode(input, alphabet, bitsPerChar);
    },
    decode(input) {
      return decode(input, alphabet, bitsPerChar, name);
    }
  });
};

/***/ }),

/***/ 4052:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "base32": () => (/* binding */ base32),
/* harmony export */   "base32hex": () => (/* binding */ base32hex),
/* harmony export */   "base32hexpad": () => (/* binding */ base32hexpad),
/* harmony export */   "base32hexpadupper": () => (/* binding */ base32hexpadupper),
/* harmony export */   "base32hexupper": () => (/* binding */ base32hexupper),
/* harmony export */   "base32pad": () => (/* binding */ base32pad),
/* harmony export */   "base32padupper": () => (/* binding */ base32padupper),
/* harmony export */   "base32upper": () => (/* binding */ base32upper),
/* harmony export */   "base32z": () => (/* binding */ base32z)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9853);

const base32 = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'b',
  name: 'base32',
  alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
  bitsPerChar: 5
});
const base32upper = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'B',
  name: 'base32upper',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  bitsPerChar: 5
});
const base32pad = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'c',
  name: 'base32pad',
  alphabet: 'abcdefghijklmnopqrstuvwxyz234567=',
  bitsPerChar: 5
});
const base32padupper = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'C',
  name: 'base32padupper',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
  bitsPerChar: 5
});
const base32hex = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'v',
  name: 'base32hex',
  alphabet: '0123456789abcdefghijklmnopqrstuv',
  bitsPerChar: 5
});
const base32hexupper = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'V',
  name: 'base32hexupper',
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
  bitsPerChar: 5
});
const base32hexpad = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 't',
  name: 'base32hexpad',
  alphabet: '0123456789abcdefghijklmnopqrstuv=',
  bitsPerChar: 5
});
const base32hexpadupper = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'T',
  name: 'base32hexpadupper',
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
  bitsPerChar: 5
});
const base32z = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'h',
  name: 'base32z',
  alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
  bitsPerChar: 5
});

/***/ }),

/***/ 4749:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "base58btc": () => (/* binding */ base58btc),
/* harmony export */   "base58flickr": () => (/* binding */ base58flickr)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9853);

const base58btc = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .baseX */ .kU)({
  name: 'base58btc',
  prefix: 'z',
  alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
});
const base58flickr = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .baseX */ .kU)({
  name: 'base58flickr',
  prefix: 'Z',
  alphabet: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
});

/***/ }),

/***/ 1453:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "base64": () => (/* binding */ base64),
/* harmony export */   "base64pad": () => (/* binding */ base64pad),
/* harmony export */   "base64url": () => (/* binding */ base64url),
/* harmony export */   "base64urlpad": () => (/* binding */ base64urlpad)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9853);

const base64 = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'm',
  name: 'base64',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  bitsPerChar: 6
});
const base64pad = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'M',
  name: 'base64pad',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  bitsPerChar: 6
});
const base64url = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'u',
  name: 'base64url',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  bitsPerChar: 6
});
const base64urlpad = (0,_base_js__WEBPACK_IMPORTED_MODULE_0__/* .rfc4648 */ .ET)({
  prefix: 'U',
  name: 'base64urlpad',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=',
  bitsPerChar: 6
});

/***/ }),

/***/ 9145:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "gh": () => (/* binding */ bases),
  "QB": () => (/* binding */ codecs),
  "kq": () => (/* binding */ hashes)
});

// UNUSED EXPORTS: CID, bytes, digest, hasher, varint

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/bases/identity.js
var identity_namespaceObject = {};
__webpack_require__.r(identity_namespaceObject);
__webpack_require__.d(identity_namespaceObject, {
  "identity": () => (identity)
});

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/bases/base2.js
var base2_namespaceObject = {};
__webpack_require__.r(base2_namespaceObject);
__webpack_require__.d(base2_namespaceObject, {
  "base2": () => (base2)
});

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/bases/base8.js
var base8_namespaceObject = {};
__webpack_require__.r(base8_namespaceObject);
__webpack_require__.d(base8_namespaceObject, {
  "base8": () => (base8)
});

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/bases/base10.js
var base10_namespaceObject = {};
__webpack_require__.r(base10_namespaceObject);
__webpack_require__.d(base10_namespaceObject, {
  "base10": () => (base10)
});

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/bases/base16.js
var base16_namespaceObject = {};
__webpack_require__.r(base16_namespaceObject);
__webpack_require__.d(base16_namespaceObject, {
  "base16": () => (base16),
  "base16upper": () => (base16upper)
});

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/bases/base36.js
var base36_namespaceObject = {};
__webpack_require__.r(base36_namespaceObject);
__webpack_require__.d(base36_namespaceObject, {
  "base36": () => (base36),
  "base36upper": () => (base36upper)
});

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/codecs/raw.js
var raw_namespaceObject = {};
__webpack_require__.r(raw_namespaceObject);
__webpack_require__.d(raw_namespaceObject, {
  "code": () => (code),
  "decode": () => (decode),
  "encode": () => (encode),
  "name": () => (raw_name)
});

// NAMESPACE OBJECT: ../node_modules/multiformats/esm/src/codecs/json.js
var json_namespaceObject = {};
__webpack_require__.r(json_namespaceObject);
__webpack_require__.d(json_namespaceObject, {
  "code": () => (json_code),
  "decode": () => (json_decode),
  "encode": () => (json_encode),
  "name": () => (json_name)
});

// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bases/base.js + 1 modules
var base = __webpack_require__(9853);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bytes.js
var bytes = __webpack_require__(9551);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/identity.js


const identity = (0,base/* from */.Dp)({
  prefix: '\0',
  name: 'identity',
  encode: buf => (0,bytes.toString)(buf),
  decode: str => (0,bytes.fromString)(str)
});
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base2.js

const base2 = (0,base/* rfc4648 */.ET)({
  prefix: '0',
  name: 'base2',
  alphabet: '01',
  bitsPerChar: 1
});
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base8.js

const base8 = (0,base/* rfc4648 */.ET)({
  prefix: '7',
  name: 'base8',
  alphabet: '01234567',
  bitsPerChar: 3
});
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base10.js

const base10 = (0,base/* baseX */.kU)({
  prefix: '9',
  name: 'base10',
  alphabet: '0123456789'
});
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base16.js

const base16 = (0,base/* rfc4648 */.ET)({
  prefix: 'f',
  name: 'base16',
  alphabet: '0123456789abcdef',
  bitsPerChar: 4
});
const base16upper = (0,base/* rfc4648 */.ET)({
  prefix: 'F',
  name: 'base16upper',
  alphabet: '0123456789ABCDEF',
  bitsPerChar: 4
});
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bases/base32.js
var base32 = __webpack_require__(4052);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base36.js

const base36 = (0,base/* baseX */.kU)({
  prefix: 'k',
  name: 'base36',
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyz'
});
const base36upper = (0,base/* baseX */.kU)({
  prefix: 'K',
  name: 'base36upper',
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
});
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bases/base58.js
var base58 = __webpack_require__(4749);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bases/base64.js
var base64 = __webpack_require__(1453);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/hashes/sha2-browser.js
var sha2_browser = __webpack_require__(2671);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/hashes/identity.js
var hashes_identity = __webpack_require__(7246);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/codecs/raw.js

const raw_name = 'raw';
const code = 85;
const encode = node => (0,bytes.coerce)(node);
const decode = data => (0,bytes.coerce)(data);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/codecs/json.js
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const json_name = 'json';
const json_code = 512;
const json_encode = node => textEncoder.encode(JSON.stringify(node));
const json_decode = data => JSON.parse(textDecoder.decode(data));
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/index.js
var src = __webpack_require__(7534);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/basics.js














const bases = {
  ...identity_namespaceObject,
  ...base2_namespaceObject,
  ...base8_namespaceObject,
  ...base10_namespaceObject,
  ...base16_namespaceObject,
  ...base32,
  ...base36_namespaceObject,
  ...base58,
  ...base64
};
const hashes = {
  ...sha2_browser,
  ...hashes_identity
};
const codecs = {
  raw: raw_namespaceObject,
  json: json_namespaceObject
};


/***/ }),

/***/ 9551:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "coerce": () => (/* binding */ coerce),
/* harmony export */   "empty": () => (/* binding */ empty),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "fromHex": () => (/* binding */ fromHex),
/* harmony export */   "fromString": () => (/* binding */ fromString),
/* harmony export */   "isBinary": () => (/* binding */ isBinary),
/* harmony export */   "toHex": () => (/* binding */ toHex),
/* harmony export */   "toString": () => (/* binding */ toString)
/* harmony export */ });
const empty = new Uint8Array(0);
const toHex = d => d.reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '');
const fromHex = hex => {
  const hexes = hex.match(/../g);
  return hexes ? new Uint8Array(hexes.map(b => parseInt(b, 16))) : empty;
};
const equals = (aa, bb) => {
  if (aa === bb)
    return true;
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }
  for (let ii = 0; ii < aa.byteLength; ii++) {
    if (aa[ii] !== bb[ii]) {
      return false;
    }
  }
  return true;
};
const coerce = o => {
  if (o instanceof Uint8Array && o.constructor.name === 'Uint8Array')
    return o;
  if (o instanceof ArrayBuffer)
    return new Uint8Array(o);
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error('Unknown type, must be binary type');
};
const isBinary = o => o instanceof ArrayBuffer || ArrayBuffer.isView(o);
const fromString = str => new TextEncoder().encode(str);
const toString = b => new TextDecoder().decode(b);


/***/ }),

/***/ 3036:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CID": () => (/* binding */ CID)
/* harmony export */ });
/* harmony import */ var _varint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3209);
/* harmony import */ var _hashes_digest_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9122);
/* harmony import */ var _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4749);
/* harmony import */ var _bases_base32_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4052);
/* harmony import */ var _bytes_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9551);





class CID {
  constructor(version, code, multihash, bytes) {
    this.code = code;
    this.version = version;
    this.multihash = multihash;
    this.bytes = bytes;
    this.byteOffset = bytes.byteOffset;
    this.byteLength = bytes.byteLength;
    this.asCID = this;
    this._baseCache = new Map();
    Object.defineProperties(this, {
      byteOffset: hidden,
      byteLength: hidden,
      code: readonly,
      version: readonly,
      multihash: readonly,
      bytes: readonly,
      _baseCache: hidden,
      asCID: hidden
    });
  }
  toV0() {
    switch (this.version) {
    case 0: {
        return this;
      }
    default: {
        const {code, multihash} = this;
        if (code !== DAG_PB_CODE) {
          throw new Error('Cannot convert a non dag-pb CID to CIDv0');
        }
        if (multihash.code !== SHA_256_CODE) {
          throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0');
        }
        return CID.createV0(multihash);
      }
    }
  }
  toV1() {
    switch (this.version) {
    case 0: {
        const {code, digest} = this.multihash;
        const multihash = _hashes_digest_js__WEBPACK_IMPORTED_MODULE_1__.create(code, digest);
        return CID.createV1(this.code, multihash);
      }
    case 1: {
        return this;
      }
    default: {
        throw Error(`Can not convert CID version ${ this.version } to version 0. This is a bug please report`);
      }
    }
  }
  equals(other) {
    return other && this.code === other.code && this.version === other.version && _hashes_digest_js__WEBPACK_IMPORTED_MODULE_1__.equals(this.multihash, other.multihash);
  }
  toString(base) {
    const {bytes, version, _baseCache} = this;
    switch (version) {
    case 0:
      return toStringV0(bytes, _baseCache, base || _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc.encoder);
    default:
      return toStringV1(bytes, _baseCache, base || _bases_base32_js__WEBPACK_IMPORTED_MODULE_3__.base32.encoder);
    }
  }
  toJSON() {
    return {
      code: this.code,
      version: this.version,
      hash: this.multihash.bytes
    };
  }
  get [Symbol.toStringTag]() {
    return 'CID';
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return 'CID(' + this.toString() + ')';
  }
  static isCID(value) {
    deprecate(/^0\.0/, IS_CID_DEPRECATION);
    return !!(value && (value[cidSymbol] || value.asCID === value));
  }
  get toBaseEncodedString() {
    throw new Error('Deprecated, use .toString()');
  }
  get codec() {
    throw new Error('"codec" property is deprecated, use integer "code" property instead');
  }
  get buffer() {
    throw new Error('Deprecated .buffer property, use .bytes to get Uint8Array instead');
  }
  get multibaseName() {
    throw new Error('"multibaseName" property is deprecated');
  }
  get prefix() {
    throw new Error('"prefix" property is deprecated');
  }
  static asCID(value) {
    if (value instanceof CID) {
      return value;
    } else if (value != null && value.asCID === value) {
      const {version, code, multihash, bytes} = value;
      return new CID(version, code, multihash, bytes || encodeCID(version, code, multihash.bytes));
    } else if (value != null && value[cidSymbol] === true) {
      const {version, multihash, code} = value;
      const digest = _hashes_digest_js__WEBPACK_IMPORTED_MODULE_1__.decode(multihash);
      return CID.create(version, code, digest);
    } else {
      return null;
    }
  }
  static create(version, code, digest) {
    if (typeof code !== 'number') {
      throw new Error('String codecs are no longer supported');
    }
    switch (version) {
    case 0: {
        if (code !== DAG_PB_CODE) {
          throw new Error(`Version 0 CID must use dag-pb (code: ${ DAG_PB_CODE }) block encoding`);
        } else {
          return new CID(version, code, digest, digest.bytes);
        }
      }
    case 1: {
        const bytes = encodeCID(version, code, digest.bytes);
        return new CID(version, code, digest, bytes);
      }
    default: {
        throw new Error('Invalid version');
      }
    }
  }
  static createV0(digest) {
    return CID.create(0, DAG_PB_CODE, digest);
  }
  static createV1(code, digest) {
    return CID.create(1, code, digest);
  }
  static decode(bytes) {
    const [cid, remainder] = CID.decodeFirst(bytes);
    if (remainder.length) {
      throw new Error('Incorrect length');
    }
    return cid;
  }
  static decodeFirst(bytes) {
    const specs = CID.inspectBytes(bytes);
    const prefixSize = specs.size - specs.multihashSize;
    const multihashBytes = (0,_bytes_js__WEBPACK_IMPORTED_MODULE_4__.coerce)(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
    if (multihashBytes.byteLength !== specs.multihashSize) {
      throw new Error('Incorrect length');
    }
    const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
    const digest = new _hashes_digest_js__WEBPACK_IMPORTED_MODULE_1__.Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
    const cid = specs.version === 0 ? CID.createV0(digest) : CID.createV1(specs.codec, digest);
    return [
      cid,
      bytes.subarray(specs.size)
    ];
  }
  static inspectBytes(initialBytes) {
    let offset = 0;
    const next = () => {
      const [i, length] = _varint_js__WEBPACK_IMPORTED_MODULE_0__.decode(initialBytes.subarray(offset));
      offset += length;
      return i;
    };
    let version = next();
    let codec = DAG_PB_CODE;
    if (version === 18) {
      version = 0;
      offset = 0;
    } else if (version === 1) {
      codec = next();
    }
    if (version !== 0 && version !== 1) {
      throw new RangeError(`Invalid CID version ${ version }`);
    }
    const prefixSize = offset;
    const multihashCode = next();
    const digestSize = next();
    const size = offset + digestSize;
    const multihashSize = size - prefixSize;
    return {
      version,
      codec,
      multihashCode,
      digestSize,
      multihashSize,
      size
    };
  }
  static parse(source, base) {
    const [prefix, bytes] = parseCIDtoBytes(source, base);
    const cid = CID.decode(bytes);
    cid._baseCache.set(prefix, source);
    return cid;
  }
}
const parseCIDtoBytes = (source, base) => {
  switch (source[0]) {
  case 'Q': {
      const decoder = base || _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc;
      return [
        _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc.prefix,
        decoder.decode(`${ _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc.prefix }${ source }`)
      ];
    }
  case _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc.prefix: {
      const decoder = base || _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc;
      return [
        _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc.prefix,
        decoder.decode(source)
      ];
    }
  case _bases_base32_js__WEBPACK_IMPORTED_MODULE_3__.base32.prefix: {
      const decoder = base || _bases_base32_js__WEBPACK_IMPORTED_MODULE_3__.base32;
      return [
        _bases_base32_js__WEBPACK_IMPORTED_MODULE_3__.base32.prefix,
        decoder.decode(source)
      ];
    }
  default: {
      if (base == null) {
        throw Error('To parse non base32 or base58btc encoded CID multibase decoder must be provided');
      }
      return [
        source[0],
        base.decode(source)
      ];
    }
  }
};
const toStringV0 = (bytes, cache, base) => {
  const {prefix} = base;
  if (prefix !== _bases_base58_js__WEBPACK_IMPORTED_MODULE_2__.base58btc.prefix) {
    throw Error(`Cannot string encode V0 in ${ base.name } encoding`);
  }
  const cid = cache.get(prefix);
  if (cid == null) {
    const cid = base.encode(bytes).slice(1);
    cache.set(prefix, cid);
    return cid;
  } else {
    return cid;
  }
};
const toStringV1 = (bytes, cache, base) => {
  const {prefix} = base;
  const cid = cache.get(prefix);
  if (cid == null) {
    const cid = base.encode(bytes);
    cache.set(prefix, cid);
    return cid;
  } else {
    return cid;
  }
};
const DAG_PB_CODE = 112;
const SHA_256_CODE = 18;
const encodeCID = (version, code, multihash) => {
  const codeOffset = _varint_js__WEBPACK_IMPORTED_MODULE_0__.encodingLength(version);
  const hashOffset = codeOffset + _varint_js__WEBPACK_IMPORTED_MODULE_0__.encodingLength(code);
  const bytes = new Uint8Array(hashOffset + multihash.byteLength);
  _varint_js__WEBPACK_IMPORTED_MODULE_0__.encodeTo(version, bytes, 0);
  _varint_js__WEBPACK_IMPORTED_MODULE_0__.encodeTo(code, bytes, codeOffset);
  bytes.set(multihash, hashOffset);
  return bytes;
};
const cidSymbol = Symbol.for('@ipld/js-cid/CID');
const readonly = {
  writable: false,
  configurable: false,
  enumerable: true
};
const hidden = {
  writable: false,
  enumerable: false,
  configurable: false
};
const version = '0.0.0-dev';
const deprecate = (range, message) => {
  if (range.test(version)) {
    console.warn(message);
  } else {
    throw new Error(message);
  }
};
const IS_CID_DEPRECATION = `CID.isCID(v) is deprecated and will be removed in the next major release.
Following code pattern:

if (CID.isCID(value)) {
  doSomethingWithCID(value)
}

Is replaced with:

const cid = CID.asCID(value)
if (cid) {
  // Make sure to use cid instead of value
  doSomethingWithCID(cid)
}
`;

/***/ }),

/***/ 9122:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Digest": () => (/* binding */ Digest),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "equals": () => (/* binding */ equals)
/* harmony export */ });
/* harmony import */ var _bytes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9551);
/* harmony import */ var _varint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3209);


const create = (code, digest) => {
  const size = digest.byteLength;
  const sizeOffset = _varint_js__WEBPACK_IMPORTED_MODULE_1__.encodingLength(code);
  const digestOffset = sizeOffset + _varint_js__WEBPACK_IMPORTED_MODULE_1__.encodingLength(size);
  const bytes = new Uint8Array(digestOffset + size);
  _varint_js__WEBPACK_IMPORTED_MODULE_1__.encodeTo(code, bytes, 0);
  _varint_js__WEBPACK_IMPORTED_MODULE_1__.encodeTo(size, bytes, sizeOffset);
  bytes.set(digest, digestOffset);
  return new Digest(code, size, digest, bytes);
};
const decode = multihash => {
  const bytes = (0,_bytes_js__WEBPACK_IMPORTED_MODULE_0__.coerce)(multihash);
  const [code, sizeOffset] = _varint_js__WEBPACK_IMPORTED_MODULE_1__.decode(bytes);
  const [size, digestOffset] = _varint_js__WEBPACK_IMPORTED_MODULE_1__.decode(bytes.subarray(sizeOffset));
  const digest = bytes.subarray(sizeOffset + digestOffset);
  if (digest.byteLength !== size) {
    throw new Error('Incorrect length');
  }
  return new Digest(code, size, digest, bytes);
};
const equals = (a, b) => {
  if (a === b) {
    return true;
  } else {
    return a.code === b.code && a.size === b.size && (0,_bytes_js__WEBPACK_IMPORTED_MODULE_0__.equals)(a.bytes, b.bytes);
  }
};
class Digest {
  constructor(code, size, digest, bytes) {
    this.code = code;
    this.size = size;
    this.digest = digest;
    this.bytes = bytes;
  }
}

/***/ }),

/***/ 4986:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hasher": () => (/* binding */ Hasher),
/* harmony export */   "from": () => (/* binding */ from)
/* harmony export */ });
/* harmony import */ var _digest_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9122);

const from = ({name, code, encode}) => new Hasher(name, code, encode);
class Hasher {
  constructor(name, code, encode) {
    this.name = name;
    this.code = code;
    this.encode = encode;
  }
  digest(input) {
    if (input instanceof Uint8Array) {
      const result = this.encode(input);
      return result instanceof Uint8Array ? _digest_js__WEBPACK_IMPORTED_MODULE_0__.create(this.code, result) : result.then(digest => _digest_js__WEBPACK_IMPORTED_MODULE_0__.create(this.code, digest));
    } else {
      throw Error('Unknown type, must be binary type');
    }
  }
}

/***/ }),

/***/ 7246:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "identity": () => (/* binding */ identity)
/* harmony export */ });
/* harmony import */ var _bytes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9551);
/* harmony import */ var _digest_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9122);


const code = 0;
const name = 'identity';
const encode = _bytes_js__WEBPACK_IMPORTED_MODULE_0__.coerce;
const digest = input => _digest_js__WEBPACK_IMPORTED_MODULE_1__.create(code, encode(input));
const identity = {
  code,
  name,
  encode,
  digest
};

/***/ }),

/***/ 2671:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sha256": () => (/* binding */ sha256),
/* harmony export */   "sha512": () => (/* binding */ sha512)
/* harmony export */ });
/* harmony import */ var _hasher_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4986);

const sha = name => async data => new Uint8Array(await crypto.subtle.digest(name, data));
const sha256 = (0,_hasher_js__WEBPACK_IMPORTED_MODULE_0__.from)({
  name: 'sha2-256',
  code: 18,
  encode: sha('SHA-256')
});
const sha512 = (0,_hasher_js__WEBPACK_IMPORTED_MODULE_0__.from)({
  name: 'sha2-512',
  code: 19,
  encode: sha('SHA-512')
});

/***/ }),

/***/ 7534:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CID": () => (/* reexport safe */ _cid_js__WEBPACK_IMPORTED_MODULE_0__.CID),
/* harmony export */   "bytes": () => (/* reexport module object */ _bytes_js__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   "digest": () => (/* reexport module object */ _hashes_digest_js__WEBPACK_IMPORTED_MODULE_4__),
/* harmony export */   "hasher": () => (/* reexport module object */ _hashes_hasher_js__WEBPACK_IMPORTED_MODULE_3__),
/* harmony export */   "varint": () => (/* reexport module object */ _varint_js__WEBPACK_IMPORTED_MODULE_1__)
/* harmony export */ });
/* harmony import */ var _cid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3036);
/* harmony import */ var _varint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3209);
/* harmony import */ var _bytes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9551);
/* harmony import */ var _hashes_hasher_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4986);
/* harmony import */ var _hashes_digest_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9122);







/***/ }),

/***/ 3209:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "decode": () => (/* binding */ varint_decode),
  "encodeTo": () => (/* binding */ encodeTo),
  "encodingLength": () => (/* binding */ encodingLength)
});

;// CONCATENATED MODULE: ../node_modules/multiformats/esm/vendor/varint.js
var encode_1 = encode;
var MSB = 128, REST = 127, MSBALL = ~REST, INT = Math.pow(2, 31);
function encode(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;
  while (num >= INT) {
    out[offset++] = num & 255 | MSB;
    num /= 128;
  }
  while (num & MSBALL) {
    out[offset++] = num & 255 | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;
  encode.bytes = offset - oldOffset + 1;
  return out;
}
var decode = read;
var MSB$1 = 128, REST$1 = 127;
function read(buf, offset) {
  var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
  do {
    if (counter >= l) {
      read.bytes = 0;
      throw new RangeError('Could not decode varint');
    }
    b = buf[counter++];
    res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$1);
  read.bytes = counter - offset;
  return res;
}
var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);
var varint_length = function (value) {
  return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
};
var varint = {
  encode: encode_1,
  decode: decode,
  encodingLength: varint_length
};
var _brrp_varint = varint;
/* harmony default export */ const vendor_varint = (_brrp_varint);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/varint.js

const varint_decode = data => {
  const code = vendor_varint.decode(data);
  return [
    code,
    vendor_varint.decode.bytes
  ];
};
const encodeTo = (int, target, offset = 0) => {
  vendor_varint.encode(int, target, offset);
  return target;
};
const encodingLength = int => {
  return vendor_varint.encodingLength(int);
};

/***/ }),

/***/ 6729:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "concat": () => (/* binding */ concat)
/* harmony export */ });
function concat(arrays, length) {
  if (!length) {
    length = arrays.reduce((acc, curr) => acc + curr.length, 0);
  }
  const output = new Uint8Array(length);
  let offset = 0;
  for (const arr of arrays) {
    output.set(arr, offset);
    offset += arr.length;
  }
  return output;
}

/***/ }),

/***/ 5732:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "equals": () => (/* binding */ equals)
/* harmony export */ });
function equals(a, b) {
  if (a === b) {
    return true;
  }
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/***/ }),

/***/ 4081:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromString": () => (/* binding */ fromString)
/* harmony export */ });
/* harmony import */ var _util_bases_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1785);

function fromString(string, encoding = 'utf8') {
  const base = _util_bases_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z[encoding];
  if (!base) {
    throw new Error(`Unsupported encoding "${ encoding }"`);
  }
  return base.decoder.decode(`${ base.prefix }${ string }`);
}

/***/ }),

/***/ 5824:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "toString": () => (/* binding */ toString)
/* harmony export */ });
/* harmony import */ var _util_bases_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1785);

function toString(array, encoding = 'utf8') {
  const base = _util_bases_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z[encoding];
  if (!base) {
    throw new Error(`Unsupported encoding "${ encoding }"`);
  }
  return base.encoder.encode(array).substring(1);
}

/***/ }),

/***/ 1785:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var multiformats_basics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9145);

function createCodec(name, prefix, encode, decode) {
  return {
    name,
    prefix,
    encoder: {
      name,
      prefix,
      encode
    },
    decoder: { decode }
  };
}
const string = createCodec('utf8', 'u', buf => {
  const decoder = new TextDecoder('utf8');
  return 'u' + decoder.decode(buf);
}, str => {
  const encoder = new TextEncoder();
  return encoder.encode(str.substring(1));
});
const ascii = createCodec('ascii', 'a', buf => {
  let string = 'a';
  for (let i = 0; i < buf.length; i++) {
    string += String.fromCharCode(buf[i]);
  }
  return string;
}, str => {
  str = str.substring(1);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
});
const BASES = {
  utf8: string,
  'utf-8': string,
  hex: multiformats_basics__WEBPACK_IMPORTED_MODULE_0__/* .bases.base16 */ .gh.base16,
  latin1: ascii,
  ascii: ascii,
  binary: ascii,
  ...multiformats_basics__WEBPACK_IMPORTED_MODULE_0__/* .bases */ .gh
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BASES);

/***/ })

}]);
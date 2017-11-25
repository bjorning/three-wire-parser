/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const ThreeWireParser = __webpack_require__(1);

window.ThreeWireParser = ThreeWireParser;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const slip = __webpack_require__(2);
const ThreeWirePacket = __webpack_require__(3);

/**
 * @class ThreeWireParser
 * 
 * Parses raw slip encoded Three Wire Protocol bytes
 */
class ThreeWireParser {
    constructor() {}

    parseData(packetBytes) {
        // Detect argument type
        if (typeof(packetBytes) === 'string') {
            this._pktBytesArray = this.convertHexStringToArray(packetBytes);
        } else if (Array.isArray(packetBytes)) {
            this._pktBytesArray = packetBytes;
        } else {
            throw new Error('Invalid input, must be string or array');
        }

        //console.log(this._pktBytesArray);

        const slipPackets = [];

        // Feed data to slip, get slip packets
        let aggreateSlipArray = [];
        for (let i = 0; i < this._pktBytesArray.length; i++) {
            const singleSlipPkt = slip.aggregateSlipPacket(this._pktBytesArray[i], aggreateSlipArray, (err, newAggregate) => {
                aggreateSlipArray = newAggregate;
            });
            if (singleSlipPkt) {
                slipPackets.push(singleSlipPkt);
            }
        }

        // Unescape slip packets
        const unescapedPackets = [];
        slipPackets.map(pkt => {
            slip.unescapeSlip(pkt, (err, unescPkt) => {
                if (err) throw new Error(`Slip unescape failed: ${err}`);
                unescapedPackets.push(unescPkt);
            });
        })

        //console.log(unescapedPackets);

        const parsedPackets = [];
        // Feed the unescaped data to ThreeWirePacket
        for (let j = 0; j < unescapedPackets.length; j++) {
            const pkt = new ThreeWirePacket(unescapedPackets[j]);
            parsedPackets.push(pkt);
        }

        return parsedPackets;
    }

    convertHexStringToArray(hexString) {
        if (typeof(hexString) !== 'string') {
            throw new Error('Invalid input, must be string');
        }

        const hexStringArray = hexString
            .replace(/^\s*/, '') //Remove leading white space chars
            .replace(/\s*$/, '') //Remove trailing white space chars
            .split(/\s+/); //Split at white space chars

        const intArray = [];
        hexStringArray.map(element => {
            const parsedInt = parseInt(element, 16);
            intArray.push(parsedInt);
        });

        return intArray;
    }
}

module.exports = ThreeWireParser;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const SLIP_BOUNDARY_CHAR = 0xC0;

/**
 * 
 * @param {integer} inputByte, must be between 0 and 255
 * @param {array} aggregateArray, return value of previous call to function
 * @param {function} callback, (err, aggregateArray)
 */
function aggregateSlipPacket(inputByte, aggregateArray, callback) {
    // Check callback
    if (!typeof(callback) == 'function') {
        return;
    }

    // Check type
    if (!Number.isInteger(inputByte)) {
        callback(new Error('inputByte must be an integer'));
        return;
    }

    // Check valid range
    if (inputByte < 0 || inputByte > 255) {
        callback(new Error('inputByte must be between 0 and 255'));
    }

    // Input is slip start or end
    if (inputByte == SLIP_BOUNDARY_CHAR) {
        if (Array.isArray(aggregateArray)) {
            // Start of new packet
            if (aggregateArray.length >= 2) { 
                callback(null, null);
                return aggregateArray.concat(inputByte);
            } else { // length too short, duplicate boundary char
                // Discard aggregateArray and callback new array
                callback(null, [].concat(inputByte));
                return;
            }
        } else { // Not an array, callback new array
            callback(null, [].concat(inputByte));
            return;
        }
    } else { // Not boundary char
        if (Array.isArray(aggregateArray)) {
            if (aggregateArray[0] == SLIP_BOUNDARY_CHAR) {
                callback(null, aggregateArray.concat(inputByte));
                return;
            } else { // Not in a valid slip packet, discard pkt
                callback(null, null);
                return;
            }
        } else { // no boundary char, no aggregateArray, discard pkt
            callback(null, null);
            return;
        }
    }

    // Should never come to this point
    callback(new Error('Invalid state'), null);
    return;
}

// Callback (err, unescapedPacket)
function unescapeSlip(rawSlipPacket, callback) {
    // Buffer for building unescaped packet
    let unescapedPacket = [];

    if (typeof(callback) !== 'function') {
        throw new Error('Callback function must be defined');
    }

    for (let i = 0; i < rawSlipPacket.length; i++) {
        // Remove 0xC0 elements
        if (rawSlipPacket[i] === 0xC0) {
            continue;
        }

        // Check for special two-byte sequences
        // Make sure there are at least two remaining elements in the packet
        if ((i + 1) < rawSlipPacket.length) {
            // replace DB DC with C0
            if (rawSlipPacket[i] === 0xDB && rawSlipPacket[i+1] === 0xDC) {
                unescapedPacket.push(0xC0);
                // skip over next byte since we have checked it
                i += 1;
                continue;
            }

            // replace DB DD with DB
            if (rawSlipPacket[i] === 0xDB && rawSlipPacket[i+1] === 0xDD) {
                unescapedPacket.push(0xDB);
                i += 1;
                continue;
            }
        }

        // Passed all special case checks, add as regular element
        unescapedPacket.push(rawSlipPacket[i]);
    }

    callback(null, unescapedPacket);
}

module.exports = {
    aggregateSlipPacket,
    unescapeSlip,
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const ThreeWireHeader = __webpack_require__(4);

const HEADER_LENGTH = 4;

/**
 * @class ThreeWirePacket
 * 
 * Represents a complete Three Wire UART Protocol packet
 * 
 * @example
 * import packet1 = new ThreeWirePacket(packetBytesArray);
 */
class ThreeWirePacket {
    /**
     * @param {Array} packetBytesArray The raw packet
     */
    constructor(packetBytesArray) {
        this._pktBytes = packetBytesArray;

        if (!packetBytesArray) {
            throw new Error('Invalid input, undefined');
        } else if (packetBytesArray.length < HEADER_LENGTH) {
            throw new Error(`Invalid input, length must be >= ${HEADER_LENGTH}`);
        }

        this.parseHeader();
        this.parsePayload();
        //this.parseCRC();
    }

    parseHeader() {
        this._header = new ThreeWireHeader(this._pktBytes);
        
        if (!this._header) {
            throw new Error('Invalid header, could not parse');
        }
    }

    parsePayload() {
        const payloadStart = HEADER_LENGTH;

        if ((this._pktBytes.length - HEADER_LENGTH) < this._header.payloadLength) {
            throw new Error('Invalid length, payload array shorter than header payload length');
        }

        const payloadEnd = payloadStart + this._header.payloadLength;
        this._payloadBytesArray = this._pktBytes.slice(payloadStart, payloadEnd);
    }

    /**
     * @type {ThreeWireHeader} Packet header
     */
    get header() {
        return this._header;
    }

    /**
     * @type {object} Packet payload
     */
    get payload() {
        return this._payloadBytesArray;
    }

    toString() {
        let str = '';
        str += this._header.toString();
        return str;
    }
}

module.exports = ThreeWirePacket;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

const PacketTypeEnum = {
    ACK_PACKET: 0,
    HCI_COMMAND_PACKET: 1,
    HCI_ACL_DATA_PACKET: 2,
    HCI_SYNCHRONOUS_DATA_PACKET: 3,
    HCI_EVENT_PACKET: 4,
    RESET_PACKET: 5,
    RESERVED_START: 6,
    RESERVED_END: 13,
    VENDOR_SPECIFIC_PACKET: 14,
    LINK_CONTROL_PACKET: 15,
}

/**
 * @class ThreeWireHeader
 *
 * Represents the header of a Three Wire UART Protocol packet
 *
 * @example
 * import ThreeWireHeader from 'nrf-intel-hex';
 *
 * let header1 = new ThreeWireHeader(headerBytesArray);
 */
class ThreeWireHeader {
    /**
     * @param {Array} headerBytesArray The raw three wire uart header packet
     * contents.
     */
    constructor(headerBytesArray) {
        this._pktBytes = headerBytesArray;

        if (!headerBytesArray) {
            throw new Error('Invalid input, undefined');
        } else if (!Array.isArray(headerBytesArray)) {
            throw new Error('Invalid input, must be an array');
        } else if (headerBytesArray.length < 4) {
            throw new Error('Invalid input, length must be >= 4')
        }

        this.parseHeader();
    }

    parseHeader() {
        this._sequenceNumber = this._pktBytes[0] & 3;

        this._ackNumber = (this._pktBytes[0] >> 3) & 3;

        const integrityBit = (this._pktBytes[0] >> 6) & 1;
        this._integrityCheckPresent = Boolean(integrityBit);

        const reliableBit = (this._pktBytes[0] >> 7) & 1;
        this._reliablePacket = Boolean(reliableBit);

        this._packetType = this._pktBytes[1] & 0x0F;

        this._packetTypeName = this.parsePacketType(this._packetType);
                
        const payloadLenLowByte = (this._pktBytes[1] >> 4) & 0xF;
        const payloadLenHighByte = (this._pktBytes[2] << 4) & 0xFF0;
        this._payloadLength = payloadLenLowByte + payloadLenHighByte;

        this._headerChecksum = this._pktBytes[3] & 0xFF;

        this._validHeader = this.validateHeader();
    }

    static twosComplement(inputValue) {
        const mask = Math.pow(2, 8 - 1);
        return -(inputValue & mask) + (inputValue & ~mask);
    }

    // The twocomplement modulo 256 sum of all header bytes shall be 0
    validateHeader() {
        let sum = this._pktBytes[0] + this._pktBytes[1] + this._pktBytes[2] + this._pktBytes[3];
        sum &= 0xFF;
        sum = ThreeWireHeader.twosComplement(sum);
        return sum === 0;
    }

    static headerChecksumCalculate(inputArr) {
        let checksum = 0;
    
        checksum  = inputArr[0];
        checksum += inputArr[1];
        checksum += inputArr[2];
        checksum &= 0xFF;
        checksum  = ((~checksum >>> 0) + 1);
    
        return checksum & 0xFF;
    }

    parsePacketType(id) {
        if (id === PacketTypeEnum.ACK_PACKET) {
            return 'Ack Packet';
        } else if (id === PacketTypeEnum.HCI_COMMAND_PACKET) {
            return 'HCI Command Packet';
        } else if (id === PacketTypeEnum.HCI_ACL_DATA_PACKET) {
            return 'HCI ACL Data Packet';
        } else if (id === PacketTypeEnum.HCI_SYNCHRONOUS_DATA_PACKET) {
            return 'HCI Synchronous Data Packet';
        } else if (id === PacketTypeEnum.HCI_EVENT_PACKET) {
            return 'HCI Event Packet';
        } else if (id === PacketTypeEnum.RESET_PACKET) {
            return 'Reset'; // Proprietary type
        } else if (id >= PacketTypeEnum.RESERVED_START && id <= PacketTypeEnum.RESERVED_END) {
            return 'Reserved';
        } else if (id === PacketTypeEnum.VENDOR_SPECIFIC_PACKET) {
            return 'Vendor Specific Packet';
        } else if (id === PacketTypeEnum.LINK_CONTROL_PACKET) {
            return 'Link Control Packet';
        } else {
            return 'Unknown Packet Type';
        }
    }

    /**
     * @type {number} Sequence number
     */
    get sequenceNumber() {
        return this._sequenceNumber;
    }

    /**
     * @type {number} Acknowledge number
     */
    get ackNumber() {
        return this._ackNumber;
    }

    /**
     * @type {bool} Integrity check present
     */
    get integrityCheckPresent() {
        return this._integrityCheckPresent;
    }

    /**
     * @type {bool} Reliable packet
     */
    get reliablePacket() {
        return this._reliablePacket;
    }

    /**
     * @type {number} Packet type id
     */
    get packetType() {
        return this._packetType;
    }

    /**
     * @type {string} Packet type name
     */
    get packetTypeName() {
        return this._packetTypeName;
    }

    /**
     * @type {number} Payload length
     */
    get payloadLength() {
        return this._payloadLength;
    }

    /**
     * @type {number} Header checksum
     */
    get headerChecksum() {
        return this._headerChecksum;
    }

    /**
     * @type {bool} Valid header integrity check
     */
    get validHeader() {
        return this._validHeader;
    }

    /**
     * String representation of packet header
     * 
     * @return {string}
     */
    toString() {
        let str = '';
        str += `SeqNum:${this.sequenceNumber}, `;
        str += `AckNum:${this.ackNumber}, `;
        str += `IntChk:${this.integrityCheckPresent ? 'Yes' : 'No'}, `;
        str += `Reliable:${this.reliablePacket ? 'Yes' : 'No'}, `;
        str += `Type:${this.packetTypeName.replace(/ /g, '')}, `;
        str += `Length:${this.payloadLength}, `;
        str += `Checksum:${this.headerChecksum}, `;
        return str;
    }
}

module.exports = ThreeWireHeader;

/***/ })
/******/ ]);
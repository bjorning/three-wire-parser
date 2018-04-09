/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const Slip = __webpack_require__(4);
const ThreeWirePacket = __webpack_require__(2);

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

        // Feed data to slip, get slip packets
        const slip = new Slip(this._pktBytesArray);

        const parsedPackets = [];
        // Feed the unescaped data to ThreeWirePacket
        for (let i = 0; i < slip.decodedPackets.length; i++) {
            const pkt = new ThreeWirePacket(slip.decodedPackets[i]);
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
/* 1 */
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
     * @type {object} Packet type enum
     */
    get packetTypeEnum() {
        return PacketTypeEnum;
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
        str += `Checksum:${this.headerChecksum}`;
        return str;
    }
}

module.exports = ThreeWireHeader;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const ThreeWireHeader = __webpack_require__(1);
const LinkControlPacket = __webpack_require__(3);

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

        switch (this._header.packetType) {
            case this._header.packetTypeEnum.ACI_PACKET:
            case this._header.packetTypeEnum.HCI_COMMAND_PACKET:
            case this._header.packetTypeEnum.HCI_ACL_DATA_PACKET:
            case this._header.packetTypeEnum.HCI_SYNCHRONOUS_DATA_PACKET:
            case this._header.packetTypeEnum.HCI_EVENT_PACKET:
            case this._header.packetTypeEnum.RESET_PACKET:
            case this._header.packetTypeEnum.VENDOR_SPECIFIC_PACKET:
                break;
            case this._header.packetTypeEnum.LINK_CONTROL_PACKET:
                const linkCtrlPkt = new LinkControlPacket(this._payloadBytesArray);
                this._parsedPayload = linkCtrlPkt.parsedPacket;
                break;

        }
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

    /**
     * @type {string} Parsed payload as string
     */
    get parsedPayload() {
        return this._parsedPayload;
    }

    toString() {
        let str = '';
        str += this._header.toString();
        str += `, payload: ${this.parsedPayload}`;
        return str;
    }
}

module.exports = ThreeWirePacket;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

class LinkControlPacket {
    constructor(packetDataArray) {
        this._parsedPacket = this.parse(packetDataArray);
    }

    /**
     * @type {string} Parsed packet
     */
    get parsedPacket() {
        return this._parsedPacket;
    }

    parse(packetDataArray) {
        if (!Array.isArray(packetDataArray)) {
            throw new Error('Invalid input, must be array');
        }

        if (packetDataArray.length < 2) {
            throw new Error('Invalid input, length must be at least 2');
        }

        if (packetDataArray[0] === 0x01 && packetDataArray[1] === 0x7E) {
            return this.parseSyncMessage();
        } else if (packetDataArray[0] === 0x02 && packetDataArray[1] === 0x7D) {
            return this.parseSyncResponseMessage();
        } else if (packetDataArray[0] === 0x03 && packetDataArray[1] === 0xFC) {
            return this.parseConfigMessage(packetDataArray.slice(2));
        } else if (packetDataArray[0] === 0x04 && packetDataArray[1] === 0x7B) {
            return this.parseConfigResponseMessage(packetDataArray.slice(2));
        } else {
            throw new Error(`Invalid input, unrecognized link control packet data 
            ${packetDataArray}`);
        }
    }

    parseSyncMessage() {
        return {
            type: 'SyncMessage',
        }
    }

    parseSyncResponseMessage() {
        return {
            type: 'SyncResponseMessage',
        }
    }

    parseConfigMessage(configData) {
        const configField = this.parseConfigField(configData);
        return {
            type: 'ConfigMessage',
            configField: configField,
        }
    }

    parseConfigResponseMessage(configData) {
        const configField = this.parseConfigField(configData);
        return {
            type: 'ConfigResponseMessage',
            configField: configField,
        }
    }

    parseConfigField(configData) {
        const slidingWindowSize = configData & 0x03;
        const odfFlowControl = (configData >>> 3) & 0x01;
        const dataIntegrityCheckType = (configData >>> 4) & 0x01;
        const versionNumber = (configData >>> 5) & 0x03;

        return {
            slidingWindowSize,
            odfFlowControl,
            dataIntegrityCheckType,
            versionNumber,
        }
    }
}

module.exports = LinkControlPacket;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const SLIP_BOUNDARY_CHAR = 0xC0;

class Slip {
    /**
     * @param {Array} slipBytesArray Raw slip encoded bytes
     */
    constructor(slipBytesArray) {
        this._pktBytes = slipBytesArray;

        if (!this._pktBytes) {
            throw new Error('Invalid input, undefined');
        }

        this._escapedPackets = Slip.extractSlipPackets(this._pktBytes);
        this._unescapedPackets = Slip.unescapePackets(this._escapedPackets);        
    }

    /**
     * @type {Array} Slip encoded packets
     */
    get encodedPackets() {
        return this._escapedPackets || [];
    }

    /**
     * @type {Array} Decoded packets
     */
    get decodedPackets() {
        return this._unescapedPackets || [];
    }

    /**
     * @param {Array} slipBytesArray The raw slip encoded packet
     */
    static extractSlipPackets(slipBytesArray) {
        if (!Array.isArray(slipBytesArray)) {
            throw new Error('Invalid input, must be array');
        };

        const packets = [];
        let aggregateArray = [];
        let inputByte;

        for (let i = 0; i < slipBytesArray.length; i++) {
            inputByte = slipBytesArray[i];
            
            // Check type
            if (!Number.isInteger(inputByte)) {
                throw new Error('inputByte must be an integer');
            }

            // Check valid range
            if (inputByte < 0 || inputByte > 255) {
                throw new Error('inputByte must be between 0 and 255');
            }

            // Input is slip start or end
            if (inputByte == SLIP_BOUNDARY_CHAR) {
                // End of packet
                if (aggregateArray.length >= 2) {
                    aggregateArray.push(inputByte);
                    packets.push(aggregateArray.slice());
                    aggregateArray = [];
                    continue;
                } else {
                    // New packet
                    aggregateArray = [inputByte];
                    continue;
                }
            } else { // Not boundary char
                if (aggregateArray[0] == SLIP_BOUNDARY_CHAR) {
                    aggregateArray.push(inputByte);
                    continue;
                } else { // Not in a valid slip packet, discard pkt
                    aggregateArray = [];
                    continue;
                }
            }
        }

        return packets;
    }

    static unescapePackets(slipPackets) {
        if (!slipPackets) {
            return [];
        }

        const pkts = slipPackets.reduce((acc, packet) => {
            acc.push(Slip.unescapeSlip(packet));
            return acc;
        }, []); // Initial reduce value
        return pkts;  
    }

    // Callback (err, unescapedPacket)
    static unescapeSlip(rawSlipPacket) {
        if (!Array.isArray(rawSlipPacket)) {
            throw new Error('Invalid input, must be array');
        }

        // Buffer for building unescaped packet
        let unescapedPacket = [];

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

        return unescapedPacket;
    }
}

module.exports = Slip;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const ThreeWireParser = __webpack_require__(0);

window.ThreeWireParser = ThreeWireParser;


/***/ })
/******/ ]);
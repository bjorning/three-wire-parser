const ThreeWireHeader = require('./header');

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
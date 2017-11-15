/**
 * @class ThreeWireHeader
 *
 * Represents the header of a Three Wire UART Protocol packet header
 *
 * @example
 * import ThreeWireHeader from 'nrf-intel-hex';
 *
 * let header1 = new ThreeWireHeader(headerBytesArray);
 */
class ThreeWireHeader {
    /**
     * @param {Array} headerBytesArray The raw packet three wire uart header packet
     * contents.
     */
    constructor(headerBytesArray) {
        this._pktBytes = headerBytesArray;

        if (!headerBytesArray) {
            throw new Error('Invalid input, undefined');
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
        const payloadLenHighByte = (this._pktBytes[2] << 8) & 0xFF00;
        this._payloadLength = payloadLenLowByte + payloadLenHighByte;

        this._headerChecksum = this._pktBytes[3] & 0xFF;
    }

    parsePacketType(id) {
        if (id === 1) {
            return 'HCI Command Packet';
        } else if (id === 2) {
            return 'HCI ACL Data Packet';
        } else if (id === 3) {
            return 'HCI Synchronous Data Packet';
        } else if (id === 4) {
            return 'HCI Event Packet';
        } else if (id === 5) {
            return 'Reset'; // Proprietary type
        } else if (id >= 6 && id <= 13) {
            return 'Reserved';
        } else if (id === 14) {
            return 'Vendor Specific Packet';
        } else if (id === 15) {
            return 'Link Control Packet';
        } else {
            return 'Unknown';
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
     * String representation of packet header
     * 
     * @return {string}
     */
    toString() {
        let str = '';
        str += `SeqNum:${this.sequenceNumber}, `;
        str += `AckNum:${this.ackNumber}, `;
        str += `IntChkPresent:${this.integrityCheckPresent}, `;
        str += `PacketType:${this.packetTypeName.replace(/ /g, '')}, `;
        str += `PayloadLength:${this.payloadLength}, `;
        str += `HeaderChecksum:${this.headerChecksum}, `;
        return str;
    }
}

module.exports = ThreeWireHeader;
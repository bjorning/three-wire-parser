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
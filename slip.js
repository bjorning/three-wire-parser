'use strict';

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
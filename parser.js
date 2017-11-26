const Slip = require('./slip');
const ThreeWirePacket = require('./packet');

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
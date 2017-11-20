const slip = require('./slip');
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
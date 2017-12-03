class SerializationPacket {
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

        //case packetDataArray[0] === 1
        //    throw new Error(`Invalid input, unrecognized serialization packet data 
        //    ${packetDataArray}`);
        //}
    }
}

module.exports = LinkControlPacket;
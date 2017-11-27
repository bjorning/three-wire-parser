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
            throw new Error('Invalid input, unrecognized link control packet data');
        }
    }

    parseSyncMessage() {
        return 'SyncMessage';
    }

    parseSyncResponseMessage() {
        return 'SyncResponseMessage';
    }

    parseConfigMessage(configData) {
        const configField = this.parseConfigField(configData);
        return `ConfigMessage: ${configField}`;
    }

    parseConfigResponseMessage(configData) {
        const configField = this.parseConfigField(packetDataArray.slice(2));
        return `ConfigResponseMessage: ${configField}`;
    }

    parseConfigField(configData) {
        const slidingWindowSize = configData & 0x03;
        const odfFlowControl = (configData >>> 3) & 0x01;
        const dataIntegrityCheckType = (configData >>> 4) & 0x01;
        const versionNumber = (configData >>> 5) & 0x03;

        return `slidingWindowSize:${slidingWindowSize}, \
        odfFlowControl:${odfFlowControl}, \
        checkType:${dataIntegrityCheckType}, \
        versionNumber:${versionNumber}`;
    }
}

module.exports = LinkControlPacket;
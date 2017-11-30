'use strict';

const ThreeWireHeader = require('./header');

const headerBytes1 = [0xDE, 0x5E, 0x03, 0xC1];
const headerBytes2 = [0xDE, 0x5E, 0x03, 0xC1];

describe('Twos Complemet', () => {
    const inputExpected = [
        [127, 127],
        [2, 2],
        [1, 1],
        [0, 0],
        [255, -1],
        [254, -2],
        [130, -126],
        [129, -127],
        [128, -128],
    ];
    it('Calculates correct results', () => {
        inputExpected.map((value, index) => {
            const twosComp = ThreeWireHeader.twosComplement(value[0]);
            expect(twosComp).toBe(value[1]);
        });
    });
});

describe('Three wire constructor', () => {
    const input = [0x00, 0x2F, 0x00, 0xD1];

    it('Does not throw error on valid 4 length array', () => {
        const header = new ThreeWireHeader(input);
    });

    it('Does not throw error on valid array of length > 4', () => {
        const header = new ThreeWireHeader([1,2,3,4,5,6,7,8]);
    });

    it('Returns an object', () => {
        const header = new ThreeWireHeader(input);
        expect(header).toBeDefined();
    });

    it('Throws error when input is undefined', () => {
        expect(() => {
            new ThreeWireHeader(undefined);
        }).toThrow();
    });

    it('Throws error when input is empty array', () => {
        expect(() => {
            new ThreeWireHeader([]);
        }).toThrow();
    });

    it('Throws error when input is array shorter than 4', () => {
        expect(() => {
            new ThreeWireHeader([1,2,3]);
        }).toThrow();
    });

    it('Return string repr with toString', () => {
        const header = new ThreeWireHeader(input);
        const txt = header.toString();
        expect(txt.length).toBeGreaterThan(0);
    });

    it('Parses all fields correctly', () => {
        const inPkt = [0xDE, 0x5E, 0x03, 0xC1];
        const header = new ThreeWireHeader(inPkt);
        expect(header.payloadLength).toBe(53);
        expect(header.packetTypeName).toBe('Vendor Specific Packet');
        expect(header.sequenceNumber).toBe(2);
        expect(header.ackNumber).toBe(3);
        expect(header.integrityCheckPresent).toBe(true);
        expect(header.reliablePacket).toBe(true);
        expect(header.headerChecksum).toBe(193);
        expect(header.validHeader).toBe(true);
        const txt = header.toString();
    });

    it('Calculates header checksum correctly', () => {
        const headersArr = [];
        headersArr.push([0xDF, 0x5E, 0x03, 0xC0]);
        headersArr.push([0xD8, 0x5E, 0x03, 0xC7]);
        headersArr.push([0xDA, 0x5E, 0x03, 0xC5]);
        headersArr.push([0x18, 0x00, 0x00, 0xE8]);
        for (let i = 0; i < headersArr.length; i++) {
            const header = new ThreeWireHeader(headersArr[i]);
            expect(header.validHeader).toBe(true);
            const checksum = ThreeWireHeader.headerChecksumCalculate(headersArr[i]);
            expect(checksum).toBe(headersArr[i][3]);
        }
    });
});

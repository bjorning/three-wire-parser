'use strict';

const ThreeWirePacket = require('./packet');

describe('ThreeWirePacket', () => {
    const validPkt1 = [0xDE, 0x5E, 0x03, 0xC1, 0x02, 0x1D, 0x00, 0xFF, 0xFF, 0x02, 0x7D, 0x6E, 0x68,
        0xB5, 0xFD, 0xE2, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB4, 0x06, 0x1E, 0x01, 0x02, 0x01, 0x04, 0x1A, 0xFF, 0x59,
        0x00, 0x02, 0x15, 0x01, 0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78, 0x89, 0x9A, 0xAB, 0xBC, 0xCD, 0xDE, 0xEF, 0xF0, 0x01,
        0x02, 0x03, 0x04, 0xC3, 0x80, 0x13];

    it('Can be constructed with a valid packet', () => {
        const pkt = new ThreeWirePacket(validPkt1);
        expect(pkt).toBeDefined();
        expect(pkt.header).toBeDefined();
        console.log(pkt.header.toString());
    });

    it('Throws error if packet is shorter than length field', () => {
        const tooShortPkt = validPkt1.slice(0, validPkt1.length - 5);
        expect(() => {
            const pkt = new ThreeWirePacket(tooShortPkt);
        }).toThrow();
    });

    it('Parses header correctly', () => {
        const pkt = new ThreeWirePacket(validPkt1);
        expect(pkt.header.packetType).toBe(14);
        expect(pkt.header.ackNumber).toBe(3);
        expect(pkt.header.sequenceNumber).toBe(2);
        expect(pkt.header.validHeader).toBe(true);
        expect(pkt.header.reliablePacket).toBe(true);
    });

    it('Parses payload correctly', () => {
        const pkt = new ThreeWirePacket(validPkt1);
        const crcLength = pkt.header.reliablePacket ? 2 : 0;
        const expPayload = validPkt1.slice(4, validPkt1.length - 4 + crcLength);
        expect(pkt.payload).toEqual(expPayload);
    });
});
'use strict';

const Slip = require('./slip');

function isSame(arrayA, arrayB) {
    if (arrayA.length != arrayB.length) return false;

    return arrayA.every((element, index) => {
        return element === arrayB[index];
    });
}

describe('isSame', () => {
    it('should return true for two arrays with same values', () => {
        const array1 = [1,2,3,4,5];
        const array2 = [1,2,3,4,5];
        expect(isSame(array1, array2)).toBe(true);
    });

    if('should return false for two arrays with unequal values', () => {
        const array1 = [1,2,3,4,5];
        const array2 = [1,2,3,4,5,6];
        expect(isSame(array1, array2)).toBe(false);
    });
});

describe('slip aggregateSlipPacket', () => {
    it('should yield empty array until complete packet received', () => {
        const slip = new Slip([0x0E]);
        expect(slip.encodedPackets).toEqual([]);
    });

    it('should yield complete packet when complete packet input', () => {
        const input = [0xC0, 0x00, 0x05, 0x00, 0xFB, 0xC0];
        const slip = new Slip(input);
        expect(slip.encodedPackets).toEqual([input,]);
        expect(slip.decodedPackets).toEqual([[0x00, 0x05, 0x00, 0xFB]]);
    });

    it('should yield only packet bytes within C0', () => {
        const pkt = [0xC0, 0x00, 0x05, 0x00, 0xFB, 0xC0];
        const input = [0xA, 0xB].concat(pkt).concat([0xC, 0xD]);
        const slip = new Slip(input);
        expect(slip.encodedPackets).toEqual([pkt,]);
        expect(slip.decodedPackets).toEqual([[0x00, 0x05, 0x00, 0xFB]]);
    });

    it('should parse multiple packets if present', () => {
        const pkt = [0xC0, 0x00, 0x05, 0xC0];
        const input = [].concat(pkt).concat(pkt);
        const slip = new Slip(input);
        expect(slip.encodedPackets).toEqual([pkt, pkt]);
        expect(slip.decodedPackets).toEqual([[0x00, 0x05], [0x00, 0x05]]);
    });
});

describe('Slip unescapeSlip', () => {
    it('should replace DB DC sequences', () => {
        const input = [0xC0, 0x00, 0x05, 0xDB, 0xDC, 0x34, 0xC0];
        const expected = [0x00, 0x05, 0xC0, 0x34];
        const slip = new Slip(input);
        expect(slip.encodedPackets).toEqual([input]);
        expect(slip.decodedPackets).toEqual([expected]);
    });

    it('should replace DB DD sequences', () => {
        const input = [0xC0, 0x00, 0x05, 0xDB, 0xDD, 0x34, 0xC0];
        const expected = [0x00, 0x05, 0xDB, 0x34];
        const slip = new Slip(input);
        expect(slip.encodedPackets).toEqual([input]);
        expect(slip.decodedPackets).toEqual([expected]);
    });
});
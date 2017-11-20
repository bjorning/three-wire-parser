'use strict';

const slip = require('./slip');

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
    it('should return undefined until complete packet received', () => {
        expect(slip.aggregateSlipPacket(0x0E, [], () => {}))
        .toBeUndefined();
    });

    it('should return complete packet when c0 found and aggregate exists', () => {
        const input = 0xC0;
        const aggregateArr = [0xC0, 0x00, 0x05, 0x00, 0xFB];
        const result = slip.aggregateSlipPacket(
            input, 
            aggregateArr,
            () => {});
        expect(result).toBeDefined();
        const concatArr = aggregateArr.concat(input);
        expect(isSame(result, concatArr)).toBe(true);
    });

    it('should callback aggregate arr with inputbyte concat', done => {
        const input = 0xAA;
        const aggregateArr = [0xC0, 0x00, 0x05, 0x00, 0xFB];
        const result = slip.aggregateSlipPacket(
            input,
            aggregateArr,
            (err, aggArr) => {
                expect(isSame(aggArr, aggregateArr.concat(input))).toBe(true);
                done();
            }
        )
        expect(result).toBeUndefined();
    });

    it('should callback aggregate arr also when aggarr.len < 2', done => {
        const input = 0xAA;
        const aggregateArr = [0xC0];
        const result = slip.aggregateSlipPacket(
            input,
            aggregateArr,
            (err, aggArr) => {
                expect(isSame(aggArr, aggregateArr.concat(input))).toBe(true);
                done();
            }
        );
        expect(result).toBeUndefined();
    });
});

describe('Slip unescapeSlip', () => {
    it('should remove C0 elements', done => {
        const input = [0xC0, 0x00, 0x05, 0x00, 0xFB, 0xC0];
        const expected = [0x00, 0x05, 0x00, 0xFB];
        slip.unescapeSlip(input, (err, unescapedPkt) => {
            expect(isSame(unescapedPkt, expected)).toBe(true);
            done();
        });
    });

    it('should replace DB DC sequences', done => {
        const input = [0xC0, 0x00, 0x05, 0xDB, 0xDC, 0x34, 0xC0];
        const expected = [0x00, 0x05, 0xC0, 0x34];
        slip.unescapeSlip(input, (err, unescapedPkt) => {
            expect(isSame(unescapedPkt, expected)).toBe(true);
            done();
        });
    });

    it('should replace DB DD sequences', done => {
        const input = [0xC0, 0x00, 0x05, 0xDB, 0xDD, 0x34, 0xC0];
        const expected = [0x00, 0x05, 0xDB, 0x34];
        slip.unescapeSlip(input, (err, unescapedPkt) => {
            expect(isSame(unescapedPkt, expected)).toBe(true);
            done();
        });
    });

    it('should tolerate packets without 0xC0 at start/end', done => {
        const input = [0x00, 0x05, 0xC0, 0x34, 0xDB, 0xDD];
        const expected = [0x00, 0x05, 0x34, 0xDB];
        slip.unescapeSlip(input, (err, unescapedPkt) => {
            expect(isSame(unescapedPkt, expected)).toBe(true);
            done();
        });
    });
});
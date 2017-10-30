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
});

describe('slip', () => {
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
                expect(isSame(aggArr, aggregateArr.concat(input)));
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
                console.log(aggArr);
                expect(isSame(aggArr, aggregateArr.concat(input)));
                done();
            }
        )
        expect(result).toBeUndefined();
    })
});
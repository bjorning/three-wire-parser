'use strict';

const parser = require('./index');

const input = `C0 00 2F 00 D1 01 7E C0 C0 00 2F 00 D1 01 7E
C0 00 05 00 FB C0
C0 00 2F 00 D1 01 7E C0 C0 00 2F 00 D1 02 7D C0 C0 00 2F 00 D1 02 7D C0 C0 00 2F 00 D1 02 7D C0
C0 00 2F 00 D1 01 7E C0
C0 00 2F 00 D1 02 7D C0
C0 00 2F 00 D1 02 7D C0
C0 00 2F 00 D1 01 7E C0
C0 00 2F 00 D1 02 7D C0
C0 00 3F 00 C1 03 FC 11 C0
C0 00 3F 00 C1
04
7B 11
C0
C0 00 3F 00 C1 03 FC 11 C0
C0 00 3F
00
C1 04
7B 11 C0`;

const result = parser.parse(input);

describe('Valid input', () => {
    test('Returns defined value', () => {
        expect(result).toBeDefined();
    });

    it('Return array for valid input', () => {
        expect(result).toEqual(expect.arrayContaining([]));
    });

    it('Returns array with objects', () => {
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('First slip packet of valid input', () => {
    it('Has an object with a length field of type number', () => {
        console.log(result[0]);
        expect(result[0]).toHaveProperty('len');
    });
});

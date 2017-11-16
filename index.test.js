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

const inputPkt2 = `C0 DE 5E 03 C1 02 1D 00 FF FF 02 7D 6E 68 
B5 FD E2 00 00 00 00 00 00 00 B4 06 1E 01 02 01 04 1A FF 59 
00 02 15 01 12 23 34 45 56 67 78 89 9A AB BC CD DE EF F0 01 
02 03 04 C3 80 13 C0`;

const result = parser.parse(input);

describe('Valid input', () => {
    it('Returns defined value', () => {
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
        expect(result[0]).toHaveProperty('len');
    });
});

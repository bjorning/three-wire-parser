'use strict';

const ThreeWireParser = require('./parser');

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
7B 11 C0
C0 DE 5E 03 C1 02 1D 00 FF FF 02 7D 6E 68 
B5 FD E2 00 00 00 00 00 00 00 B4 06 1E 01 02 01 04 1A FF 59 
00 02 15 01 12 23 34 45 56 67 78 89 9A AB BC CD DE EF F0 01 
02 03 04 C3 80 13 C0`;

const validPkt1 = [0xC0, 0x00, 0x05, 0x00, 0xFB, 0xC0, 0xC0, 0x00, 0x05, 0x00, 0xFB, 0xC0];
    
describe('ThreeWireParser', () => {
    it('Parses valid threewire slip packet string', () => {
        const parser = new ThreeWireParser();
        const packets = parser.parseData(input);
        expect(packets).toBeDefined();
    });

    it('Parses valid threewire slip packet byte array', () => {
        const parser = new ThreeWireParser();
        const packets = parser.parseData(validPkt1);
        expect(packets.length).toBe(2);
    });
    
    it('Silently discards bytes prior to slip start char', () => {});

    it('Accepts muliple packets in same input', () => {});

    it('Silently discards line breaks', () => {});
    
});

describe('Text to hex conversion', () => {
    it('Removes leading and trailing whitespace characters', () => {
        const testArray = [
            ['C0 C1', [0xC0, 0xC1]],
            ['\r\nC0 C2', [0xC0, 0xC2]],
            ['  C0 C2', [0xC0, 0xC2]],
            ['  C0 C3  ', [0xC0, 0xC3]],
            ['  0xC0 0xC3  ', [0xC0, 0xC3]],
        ];

        const parser = new ThreeWireParser();

        testArray.map((value, index) => {
            const result = parser.convertHexStringToArray(value[0]);
            expect(result).toEqual(value[1]);
        });
    });

    it('Converts long multiline hex string', () => {
        const parser = new ThreeWireParser();
        const result = parser.convertHexStringToArray(input);
        expect(result).toBeDefined();
        expect(result.length).toBe(190);
        const validValues = result.reduce((prevValue, currentValue) => {
            if (!prevValue) return false;
            if (currentValue < 0 || currentValue > 255) return false;
            return true;
        });
        expect(validValues).toBe(true);
    });
});


'use strict';

const ThreeWireHeader = require('./header');

describe('When calling contructor using valid input array', () => {
    const input = [0x00, 0x2F, 0x00, 0xD1];

    it('Does not throw error', () => {
        const header = new ThreeWireHeader(input);
    });

    it('Returns an object', () => {
        const header = new ThreeWireHeader(input);
        expect(header).toBeDefined();
    });

    it('Return string repr with toString', () => {
        const header = new ThreeWireHeader(input);
        const txt = header.toString();
        console.log(txt);
        expect(txt.length).toBeGreaterThan(0);
    });
})
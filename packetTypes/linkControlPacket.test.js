const LinkControlPacket = require('./linkControlPacket');

describe('linkControlPacket', () => {
    it('Fails on invalid input, undefined', () => {
        expect(() => {
            const lkp = new LinkControlPacket();
        }).toThrow();
    });

    xit('Succeeds on valid input', () => {
        const input = [0x01, 0x7E];
        const lkp = new LinkControlPacket(input);
        expect(lkp.parsedPacket).toBe('SyncMessage');
    });
});
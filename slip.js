'use strict';

const SLIP_BOUNDARY_CHAR = 0xC0;

function aggregateSlipPacket(inputByte, aggregateArray, callback) {
    // Check callback
    if (!typeof(callback) == 'function') {
        return;
    }

    // Check type
    if (!Number.isInteger(inputByte)) {
        callback(new Error('inputByte must be an integer'));
        return;
    }

    // Check valid range
    if (inputByte < 0 || inputByte > 255) {
        callback(new Error('inputByte must be between 0 and 255'));
    }

    // Input is slip start or end
    if (inputByte == SLIP_BOUNDARY_CHAR) {
        if (Array.isArray(aggregateArray)) {
            // Start of new packet
            if (aggregateArray.length >= 2) { 
                callback(null, null);
                return aggregateArray.concat(inputByte);
            } else { // length too short, duplicate boundary char
                // Discard aggregateArray and callback new array
                callback(null, [].concat(inputByte));
                return;
            }
        } else { // Not an array, callback new array
            callback(null, [].concat(inputByte));
            return;
        }
    } else { // Not boundary char
        if (Array.isArray(aggregateArray)) {
            if (aggregateArray[0] == SLIP_BOUNDARY_CHAR) {
                callback(null, aggregateArray.concat(inputByte));
                return;
            } else { // Not in a valid slip packet, discard pkt
                callback(null, null);
                return;
            }
        } else { // no boundary char, no aggregateArray, discard pkt
            callback(null, null);
            return;
        }
    }

    // Should never come to this point
    callback(new Error('Invalid state'), null);
    return;
}

// Callback (err, unescapedPacket)
function unescapeSlip(rawSlipPacket, callback) {
    // Buffer for building unescaped packet
    let unescapedPacket = [];

    if (typeof(callback) !== 'function') {
        throw new Error('Callback function must be defined');
    }

    for (let i = 0; i < rawSlipPacket.length; i++) {
        // Remove 0xC0 elements
        if (rawSlipPacket[i] === 0xC0) {
            continue;
        }

        // Check for special two-byte sequences
        // Make sure there are at least two remaining elements in the packet
        if ((i + 1) < rawSlipPacket.length) {
            // replace DB DC with C0
            if (rawSlipPacket[i] === 0xDB && rawSlipPacket[i+1] === 0xDC) {
                unescapedPacket.push(0xC0);
                // skip over next byte since we have checked it
                i += 1;
                continue;
            }

            // replace DB DD with DB
            if (rawSlipPacket[i] === 0xDB && rawSlipPacket[i+1] === 0xDD) {
                unescapedPacket.push(0xDB);
                i += 1;
                continue;
            }
        }

        // Passed all special case checks, add as regular element
        unescapedPacket.push(rawSlipPacket[i]);
    }

    callback(null, unescapedPacket);
}

module.exports = {
    aggregateSlipPacket,
    unescapeSlip,
}
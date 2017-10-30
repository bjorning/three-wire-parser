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
            if (aggregateArray[0] == 0xC0) {
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

function decodeSlip(rawSlipPacket) {
    
}

module.exports = {
    aggregateSlipPacket,
}
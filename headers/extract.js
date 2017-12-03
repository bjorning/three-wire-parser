const util = require('util');
const fs = require('fs');
const path = require('path');

class SDConstExtractor {
    constructor() {
        this.readFile = util.promisify(fs.readFile);

        // define file names array
        this._headerFiles = [
            ['ble.h', 'BLE_COMMON'],
            ['ble_gap.h', 'BLE_GAP'],
            ['ble_gattc.h', 'BLE_GATTC'],
            ['ble_gatts.h', 'BLE_GATTS'],
            ['ble_l2cap.h', 'BLE_L2CAP'],
        ];
    }

    get headerFiles() {
        return this._headerFiles;
    }

    async processHeaders() {
        const svcsEvts = await Promise.all(this.headerFiles.map(async value => {
            const fileString = await this.getFileAsString(`headers/${value[0]}`);
            const svcs = await this.extractSvcsConstants(fileString, value[1]);
            const evts = await this.extractEvtsConstants(fileString, value[1]);
            return [svcs, evts];
        }));
        return svcsEvts;
    }

    async getFileAsString(pth) {
        let fileName = path.basename(pth, '.h');
        const data = await this.readFile(pth, 'utf8');
        return data;
    }

    async extractSvcsConstants(data, specifier) {
        const constNameSvcs = `${specifier.toUpperCase()}_SVCS`;
        const regexSvcs = new RegExp(`enum (${constNameSvcs}[\\s\\S]*?})`);
        const matchSvcs = data.match(regexSvcs);
        const svcs = matchSvcs[1];

        return svcs;
    }

    async extractEvtsConstants(data, specifier) {
        const constNameEvts = `${specifier.toUpperCase()}_EVTS`;
        const regexEvts = new RegExp(`enum (${constNameEvts}[\\s\\S]*?})`);
        const matchEvts = data.match(regexEvts);
        const evts = matchEvts[1];
        return evts;
    }
}

module.exports = new SDConstExtractor();
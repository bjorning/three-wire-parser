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
        const headersSvcsEvts = await Promise.all(this.headerFiles.map(async value => {
            const fileString = await this.getFileAsString(`headers/${value[0]}`);
            const svcs = await this.extractSvcsConstants(fileString, value[1]);
            const formattedSvcs = await this.reformatCtoJSConsts(svcs);
            const evts = await this.extractEvtsConstants(fileString, value[1]);
            const formattedEvts = await this.reformatCtoJSConsts(evts);
            return [formattedSvcs, formattedEvts];
        }));

        return headersSvcsEvts;
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

    async reformatCtoJSConsts(cEnum) {
        const match = cEnum.match(/\w+\s+=\s+(\w+),?/);
        let reformatted = cEnum;
        reformatted = reformatted
            .replace(/(\w+)\s+=\s+(\w+),?/, '$1,')
            .replace(/(\w+_\w+)\s\s{/, 'const $1 = {')
            .replace(/}/, '};');
        //console.log(reformatted);
        return reformatted;
    }

    async mergeConstants(headersSvcsEvts) {
        const mergedStr = await headersSvcsEvts.reduce(async (accP, value) => {
            //console.log(value);
            const acc = await accP;
            return acc + `${value[0]}\n${value[1]}\n`;
        }, '');
        return mergedStr;
    }
}

module.exports = new SDConstExtractor();
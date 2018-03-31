import {readFile, writeFile} from 'fs';
import {promisify} from 'util';
import path from 'path';
const fsReadFile = promisify(readFile);
const fsWriteFile = promisify(writeFile);
import {PackageJson} from 'origami-cms';
import deepmerge from 'deepmerge';


const PKG_FILE = (): string => path.resolve(process.env.CLI_CWD || './', 'package.json');


export namespace pkgjson {
    /**
     * Attempt to load the package.json at the current directory
     * @returns {NPM.Static|Boolean} The package as json, or false if it cannot be found
     * or loaded correctly
    */
    export const read = async (): Promise<PackageJson | Boolean> => {
        try {
            return require(PKG_FILE());
        } catch (e) {
            return false;
        }
    };


    /**
     * Merge/create the package.json file
     * @param file JSON config for Origami app to override
     */
    export const write = async (file: PackageJson): Promise<void> => {
        let existing = {};
        try {
            existing = require(PKG_FILE());
        } catch (e) {
            // No existing package.json file
        }

        const TAB_SIZE = 4;

        return fsWriteFile(
            PKG_FILE(),
            JSON.stringify(
                deepmerge(existing, file),
                null, TAB_SIZE
            )
        );
    };
}

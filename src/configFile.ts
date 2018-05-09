import {readFile, writeFile} from 'fs';
import {promisify} from 'util';
import path from 'path';
import {Origami} from './types';
import {requireKeys, error} from '.';
import dot from 'dot-object';

const fsReadFile = promisify(readFile);
const fsWriteFile = promisify(writeFile);


const CONFIG_FILE = (): string => path.resolve(process.env.CLI_CWD || './', '.origami');


export namespace config {

    /**
     * Converts origami_x_y envrionment variables to an object
     * @returns {Object} Object of origami environment variables
    */
    export const env = (obj = {}): object => {
        const e = Object.entries(process.env)
            .filter(([key, value]) => /^origami_.*$/.test(key))
            .map(([key, value]) => [
                key
                    // Replace _ with .
                    .replace(/_/g, '.')
                    // Remove preceding 'origami.'
                    .split('.').slice(1).join('.'),
                value
            ])
            .forEach(([key, value]) => {
                dot.str(key as string, value, obj);
            });

        return obj;
    };

    /**
     * Attempt to load the .origami file at the current directory. Overwrites with any ENV variables
     * @returns {Origami.Config|Boolean} The Origami file as json, or false if it cannot be
     * found or loaded correctly
    */
    export const read = async (): Promise<Origami.Config | false> => {
        let c = {} as Origami.Config;
        try {
            c = JSON.parse(
                (await fsReadFile(CONFIG_FILE())).toString()
            );
        } catch (e) {
            return false;
        }

        c = env(c) as Origami.Config;

        return c;
    };


    /**
     * Override/write the .origami file
     * @param file JSON config for Origami app to override
     */
export const write = async(file: Origami.Config): Promise<void> => {
    const TAB_SIZE = 4;
    return fsWriteFile(
            CONFIG_FILE(),
            JSON.stringify(file, null, TAB_SIZE)
        );
};

export const validate = (config: Origami.Config) => {
    try {
        requireKeys([
            'store'
        ], config);
    } catch (e) {
        return error(new Error(`Origami: Missing '${e.key}' setting`));
    }


        // ------------------------------------------------------ Validate store
    const store = `origami-store-${config.store.type}`;
    try {
        require(path.resolve(process.cwd(), 'node_modules', store));
    } catch (e) {
        if (e.name === 'Error') {
            return error(
                    new Error(
                        `Origami: Could not find store plugin '${store}'. Try running 'yarn install ${store}'`
                    )
                );
        }

        return error(e);
    }
};

}

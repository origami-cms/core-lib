import dot from 'dot-object';
import {readFile, writeFile, stat} from 'fs';
import path, {join} from 'path';
import {promisify} from 'util';
import {error, requireKeys} from '.';
import Route from './Route';
import {Origami} from './types';

const fsReadFile = promisify(readFile);
const fsWriteFile = promisify(writeFile);
const fsStat = promisify(stat);


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
    export const read = async (
        fileOrDirectory?: string
    ): Promise<Origami.Config | false> => {
        // If there is no file provided, load the .origami file in the current dir
        let file = path.join(process.env.CLI_CWD || process.cwd(), '.origami');

        if (fileOrDirectory) {
            const stats = await fsStat(fileOrDirectory);
            if (stats.isFile()) file = fileOrDirectory;

            // If a directory is passed, attempt to load the .origami file in the directory
            // If that's not a file return false
            if (stats.isDirectory()) {
                const joined = path.join(fileOrDirectory, '.origami');
                const fileStats = await fsStat(joined);
                if (fileStats.isFile()) {
                    process.env.CLI_CWD = fileOrDirectory;
                    process.chdir(fileOrDirectory);
                    file = path.join(process.cwd(), '.origami');
                }
                else return false;
            }
        }

        let c = {} as Origami.Config;
        let fileString;
        try {
            fileString = (await fsReadFile(file)).toString();
        } catch {
            // No .origami file
            return false;
        }
        try {
            c = JSON.parse(fileString);
        } catch (e) {
            console.log('Error parsing .origami file'.red);
            throw e;
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
            // requireKeys([
            //     'store'
            // ], config);
        } catch (e) {
            return error(new Error(`Origami: Missing '${e.key}' setting`));
        }


        // ------------------------------------------------------ Validate store
        // const store = `origami-store-${config.store.type}`;
        // try {
        //     require(path.resolve(process.cwd(), 'node_modules', store, 'package.json'));
        // } catch (e) {
        //     if (e.name === 'Error') {
        //         console.log(path.resolve(process.cwd(), 'node_modules', store, 'package.json'));

        //         return error(
        //                 new Error(
        //                     `Origami: Could not find store plugin '${store}'. Try running 'yarn install ${store}'`
        //                 )
        //             );
        //     }

        //     return error(e);
        // }
    };


    // Setup the plugins for the server
    export const setupPlugins = (
        config: Origami.Config,
        server: any,
        context: string = process.cwd()
    ) => {

        Object.entries(config.plugins!).forEach(([name, settings]) => {
            server.plugin(name, settings, context);
        });
    };


    // Setup the apps for the server
    export const setupApps = (
        config: Origami.Config,
        server: any
    ) => {

        Object.entries(config.apps!).forEach(([name, settings]) => {
            server.application(name, settings);
        });
    };


    // Setup the resources for the server API
    export const setupResources = (
        config: Origami.Config,
        server: any,
        context: string = process.cwd()
    ) => {

        Object.entries(config.resources!).forEach(([name, r]) => {
            // r is a string to the model
            if (typeof r === 'string') {
                const model = require(path.resolve(context, r));
                const auth = true;
                server.resource(name, {model, auth});

                // r is a config object
            } else if (r instanceof Object) {
                const model = require(path.resolve(context, r.model));
                const auth = r.auth;
                server.resource(name, {model, auth});
            }
        });
    };


    // Setup the controllers for the server API
    export const setupControllers = (
        config: Origami.Config,
        server: any,
        context: string = process.cwd()
    ) => {

        Object.entries(config.controllers!).forEach(async ([_path, c]) => {
            let config: Origami.ConfigController = {
                prefix: ''
            };

            if (typeof c === 'string') {
                config.prefix = c;
            } else if (c instanceof Object) {
                config = {
                    ...config,
                    ...c
                };
            }

            const route = new Route(config.prefix);

            await route.include(path.resolve(context, _path), config.prefix, true);

            server.useRouter(route);
        });
    };


    // Load a directory of routes, models, config files, etc, and automatically
    // add everything into the server (EG: calling useRouter(), resource(), etc)
    const loadDirectory = (dir: string) => {
        // TODO:
        error('Not implemented');
    };
}

import fs, {ReadStream} from 'fs';
import path from 'path';
import {promisify} from 'util';
import engines from './engines';


const fsRead = promisify(fs.readFile);

export type CompileFunction = (template: string, data?: object) => Promise<string> | ReadStream;


export interface Engine {
    name: string | false;
    engine: any;
}


export default class Renderer {

    private _engineCache: {
        [engine: string]: CompileFunction
    } = {};


    constructor(
        public packageDir = path.resolve(process.cwd(), 'node_modules')
    ) {}


    render(file: string, data?: object) {
        const ext = path.extname(file).slice(1);
        const engine = this._getEngine(ext);
        return engine(file, data);
    }



    private _getEngine(ext: string): CompileFunction {
        // Load from cache
        if (ext && this._engineCache[ext]) return this._engineCache[ext];


        // Engine npm package name
        const enginePkgName = engines[ext];
        if (!enginePkgName) {
            throw new Error(
                `Origami.Renderer: No engine is configured for ${ext} filetype.`
            );
        }

        let engine: any;


        // Attempt to load the package
        try {
            engine = enginePkgName
                ? require(path.resolve(this.packageDir, enginePkgName))
                : false;

        } catch (e) {
            throw new Error(
                `Origami.Renderer: '${enginePkgName}' engine is not installed.`
            );
        }


        // Wrap the engine in a CompileFunction syntax
        switch (ext) {
            case 'pug':
                return this._engineCache[ext] = async (
                    template: string, data?: object
                ): Promise<string> => {

                    const markdown = require('marked');
                    markdown.setOptions({
                        breaks: true,
                        gfm: true
                    });

                    const options = {
                        filename: template,
                        filters: {markdown}
                    };

                    return engine.compile(
                        (await fsRead(template)).toString(),
                        options
                    )(data);
                };

            case 'hbs':
            case 'ejs':
                return this._engineCache[ext] = async (template: string, data?: object) => engine.compile(
                    (await fsRead(template)).toString()
                )(data);


            case 'scss':
            case 'sass':
                return this._engineCache[ext] = (
                    styles: string, options?: object
                ) => fs.createReadStream(styles).pipe(engine(styles, options));

            default:
                return (text: string) => fs.createReadStream(text);
            // Throw new Error(`Could not render with extension ${name}`);
        }
    }
}

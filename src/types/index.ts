import express from 'express';

export namespace Origami {
    export interface Config {
        /** Settings for the overall project */
        'app': ConfigApp;

        /** Settings for the store/database */
        'store': ConfigStore;

        /** Settings for the theme */
        'theme'?: ConfigTheme;

        /** Settings for the server setup */
        'server': ConfigServer;

        /** Admin node module */
        'admin': string;

        /** Model/Controller resources to automatically create */
        'resources'?: {
            [name: string]: ConfigResource | string
        };

        /** Plugins to integrate into Origami */
        'plugins'?: {
            [name: string]: boolean | object
        };

        /** Add controllers by individual files or directories */
        'controllers'?: {
            [path: string]: ConfigController | string
        };

        /** Applications to install into Origami */
        'apps'?: {
            [name: string]: boolean | object;
        };
    }


    export interface ConfigApp {
        /** Name of the project */
        'name': string;
    }


    export interface ConfigStore {
        /** Store/Database type to integrate with */
        'type': string;
        /** Store/Database hostname to connect with */
        'host': string;
        /** Store/Database port to connect with */
        'port': number;
        /** Store/Database db name to connect with */
        'database': string;
        /** Store/Database username to connect with */
        'username': string;
        /** Store/Database password to connect with */
        'password': string;
    }

    export interface ConfigTheme {
        /** Theme name to run */
        'name'?: string;
        'path'?: string;
    }

    export interface ConfigServer {
        /** Secret code to encrypt data and authentication tokens with */
        'secret': string;
        /** Port number to run the server on */
        'port': number;
        /** Server language */
        'ln': string;
        /** Static directories to serve */
        'static'?: string | string[];
    }


    export interface ConfigResource {
        model: string;
        auth?: boolean | {
            [key in 'get' | 'head' | 'post' | 'put' | 'delete' | 'list']: boolean
        };
    }

    export interface ConfigController {
        /** Prefix all controllers in this path under a prefix */
        prefix?: string;
    }


    /**
     * Valid types of Origami modules to install via NPM
     * @example origami-theme-snow, origami-store-mongodb, origami-plugin-facebook
     */
    export type ModuleType = 'theme' | 'store' | 'plugin' | 'admin';




    export namespace Server {

        export type Position = 'init' | 'pre-store' | 'store' | 'post-store' |
            'pre-render' | 'render' | 'post-render' | 'pre-send';

        export type URL = string | null | RegExp;

        export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' |
            'CONNECT' | 'OPTIONS' | 'PATCH' | 'USE';

        export interface Config {
            /** Secret code to encrypt data and authentication tokens with */
            'secret': string;
            /** Port number to run the server on */
            'port': number;
            /** Server language */
            'ln': string;
        }

        export interface RequestHandler {
            (req: Request, res: Response, next: express.NextFunction): any;
        }

        export interface Request extends express.Request {
            jwt: {
                token: string,
                data: {
                    userId: string;
                    email: string;
                }
            };
            __initialPassword?: string;
        }

        export interface Response extends express.Response {
            data?: object | any[];
            body?: string;
            text?: string;
            responseCode?: string;
            error: string;
            isPage: boolean;
            pageType: string | undefined;
        }

        export interface NextFunction extends express.NextFunction {}

        export interface DataError extends Error {
            data: object;
        }
    }




    export namespace Theme {
        export interface Config {
            /** Theme name to run */
            name: string;
            paths?: {
                styles?: string
                views?: string
                content?: string
            };
        }
    }


    export namespace Store {
        export declare const Store: {
            new(options: StoreOptions): Store;
        };
        export interface Store {

            models: { [name: string]: Model };
            connURI: string;



            connect(): Promise<any>;
            model(name: string, schema?: Schema): Model | void;
        }

        export interface StoreOptions {
            username: string;
            password: string;
            host: string;
            port: number;
            database: string;
        }


        export interface Schema {
            tree?: boolean;
            properties: {
                [key: string]: any;
            };
        }


        export declare const Model: {
            new(name: string, schema: Origami.Store.Schema): Model;
        };
        export interface Model {
            create(resource: Origami.Store.Resource): Origami.Store.Resource;

            find(query: object, opts?: object):
                Promise<Resource | Resource[] | null>;
        }


        export interface Resource {
            id?: string;
            deletedAt?: Date | null;
            children?: Resource[];

            [key: string]: any;
        }

    }


    export interface AppManifest {
        name: string;
        icon: {
            type: string;
            color: string;
        };
        sidemenu?: boolean;

        resources?: object[];

        pages: AppManifestPage[];
    }

    export interface AppManifestPage {
        title: string;
        path: string;
        page: string;
        icon?: string;
        scripts?: string[];
    }
}




export interface PackageJson {
    'name'?: string;
    'dependencies'?: {
        [pkg: string]: string
    };
    'devDependencies'?: {
        [pkg: string]: string
    };
    'scripts'?: {
        [name: string]: string
    };
}

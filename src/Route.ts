import fs from 'fs';
import {Origami, error} from '.';
import path from 'path';

export type Routers = {
    [K in Origami.Server.Position]: RouterListItem[]
};

export interface RouterListItem {
    path: Origami.Server.URL;
    handlers: RouterUseHandler;
    method: Origami.Server.Method;
}

export type RouterUseHandler = (Origami.Server.RequestHandler | string)[];

export default class Route {
    parent?: Route;
    routers: Routers;
    nested: Route[];

    private _url: string | null | RegExp;
    private _positions: Origami.Server.Position[];
    private _activeRouter: RouterListItem[];
    private _curposition: Origami.Server.Position = 'init';

    constructor(url: Origami.Server.URL = null, parent?: Route) {
        this._url = url;
        this.parent = parent;

        // Different positions to run route at
        this._positions = [
            'init',

            'pre-store',
            'store',
            'post-store',

            'pre-render',
            'render',
            'post-render',

            'pre-send'
        ];

        // A different array of middleware for each position
        this.routers = {
            init: [],

            'pre-store': [],
            store: [],
            'post-store': [],

            'pre-render': [],
            render: [],
            'post-render': [],

            'pre-send': []
        };


        // Default position is 'render'
        this.position('pre-render');


        this.nested = [];
        this._activeRouter = this.routers['post-store'];
    }


    // If the position is changed, update the activeRouter
    private set _position(v: Origami.Server.Position) {
        if (this._positions.includes(v)) this._activeRouter = this.routers[v];
        else throw new Error(`Origami.Route: No position ${v}`);
        this._curposition = v;
    }

    private get _position(): Origami.Server.Position {
        return this._curposition;
    }

    get url(): Origami.Server.URL {
        if (this._url instanceof RegExp) return this._url;
        return `${this.parent ? this.parent.url : ''}${this._url || ''}`;
    }


    // Route methods
    get(...handlers: RouterUseHandler): this {
        return this._route('GET', ...handlers);
    }
    post(...handlers: RouterUseHandler): this {
        return this._route('POST', ...handlers);
    }
    put(...handlers: RouterUseHandler): this {
        return this._route('PUT', ...handlers);
    }
    delete(...handlers: RouterUseHandler): this {
        return this._route('DELETE', ...handlers);
    }
    all(...handlers: RouterUseHandler): this {
        return this._route('USE', ...handlers);
    }
    use(...handlers: RouterUseHandler): this {
        return this._route('USE', ...handlers);
    }

    // Change the position (active router)
    position(position: Origami.Server.Position) {
        this._position = position;

        return this;
    }


    // Nest a Router under itself for recursive paths
    route(path: Origami.Server.URL) {
        const r = new Route(path, this);
        r.position(this._position);
        this.nested.push(r);

        return r;
    }

    /**
     * Load all routers from a file or directory and nest them
     * @param path Path to file or directory
     * @param prefix Prefix the route
     * @param recursive If true, recursively nest routes
     */
    async include(p: string, prefix: string = '/', r: Boolean = true) {
        const nest = (_p: string) => {
            const route = require(_p);
            if (route.constructor.name === 'Route') return this.nested.push(route);
            error(`File ${_p} does not export a Route`);
            return false;
        };

        const stat = await fs.statSync(p);

        if (stat.isFile()) return nest(p);

        if (stat.isDirectory()) {
            const list = fs.readdirSync(p);
            list.forEach(i => {
                const pathRel = path.resolve(p, i);
                const s = fs.statSync(pathRel);
                if (s.isFile() && /.*\.js$/.test(i)) return nest(pathRel);
                if (r && s.isDirectory()) return this.include(pathRel, `${p}/${i}`);
                return false;
            });

        } else return false;
    }


    // Registers the activeRouter (set by position()) to handle on the url
    private _route(
        method: Origami.Server.Method,
        ...handlersOrNamedMW: RouterUseHandler
    ): this {
        this._activeRouter.push({
            path: this.url,
            handlers: handlersOrNamedMW,
            method
        });

        return this;
    }
}

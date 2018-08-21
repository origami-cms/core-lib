const path = require('path');
// @ts-ignore
import importFrom from 'import-from';
import findRoot from 'find-root';

/**
 * A fallback require function that attempts to load the library first from the
 * current workspace, then as a relative path, then as a module from where the
 * process is called
 */
export default async (lib: string, context: string, prefix?: string) => {
    // If trying to load a relative module
    if (lib.startsWith('/')) return require(lib);
    if (lib.startsWith('./')) return require(path.resolve(process.cwd(), lib));

    try {
        // Attempt to load module relative to where it's called with opt. prefix
        // EG: lib: user-profiles, prefix: origami-plugin-

        return await importFrom(findRoot(context), `${prefix}${lib}`);
    } catch (e) {
        // Finally attempt to load it from the project's node_modules with opt. prefix

        return await importFrom(process.cwd(), `${prefix}${lib}`);
    }
};

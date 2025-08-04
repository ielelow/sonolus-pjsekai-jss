/** @type {import('@sonolus/sonolus.js').SonolusCLIConfig} */
export default {
    type: 'preview',
    esbuild(options) {
        return {
            ...options,
            treeShaking: true,
            minifyWhitespace: true,
            minifySyntax: true,
        }
    },
}

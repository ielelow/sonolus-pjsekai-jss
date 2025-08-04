/** @type {import('@sonolus/sonolus.js').SonolusCLIConfig} */
export default {
    type: 'play',
    esbuild(options) {
        return {
            ...options,
            treeShaking: true,
            minifyWhitespace: true,
            minifySyntax: true,
        }
    },
}

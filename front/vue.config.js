// const HtmlWebpackPlugin = require('html-webpack-plugin')
const asset_dir = "static"
module.exports = {
    assetsDir: asset_dir,
    outputDir: '..\\back\\dist',

    // publicPath: isProd ? '/app/' : '/',

    publicPath: '/',
    // indexPath: './index.html', // output path for the generated index.html (relative to outputDir). Can also be an absolute path
    indexPath: '..\\templates\\index.html', // output path for the generated index.html (relative to outputDir). Can also be an absolute path

    // devServer: {
    //     proxy: {
    //         "/": {
    //             "target": "http://localhost:8765/",
    //             "secure": false,
    //             "changeOrigin": true
    //         }
    //     }
    // }
    // devServer: {
    //     // proxy: 'https://127.0.0.1:8080/',
    //     proxy: 'https://login.vk.com/',
    //     // headers: { 'Access-Control-Allow-Origin': '*' }
    // }
    // devServer: {
    //         proxy: {
    //           "^/?act": {
    //               target: "https://login.vk.com/",
    //               pathRewrite: { '^/?act': '' },
    //               changeOrigin: true,
    //               secure: false
    //         }
    //      }
    //   },

    // chainWebpack: config => {
    //     config.resolve.alias.set('__STATIC__', 'static')
    // }
    // configureWebpack: {
    //     plugins: [
    //         new HtmlWebpackPlugin({
    //             template: '/public/index.html',
    //             inject: false,
    //             minify: false,
    //             assetsDir: asset_dir,
    //         })
    //     ],
    // }
}
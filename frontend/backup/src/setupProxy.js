const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/AndroidFTPBackup/api', {
            target: 'http://localhost:8000/',
            changeOrigin: true,
        })
    )
    app.use(
        createProxyMiddleware('/ws/code/output', {
            target: 'ws://localhost:8000/',
            changeOrigin: true,
            ws: true
        })
    )
}
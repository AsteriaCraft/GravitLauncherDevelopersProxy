const fs = require('fs');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const readline = require('readline');

const app = express();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

try {
    fs.statSync('.env');
    console.log('[APP] .env exists...');
}
catch (err) {
    if (err.code === 'ENOENT') {
        console.log('[APP] .env does not exist');
        fs.writeFileSync('.env', `APP_PORT=9274\nLAUNCHER_WS=\nLAUNCHER_WEB=`);
        console.log('[APP] .env created..');
    }
}
require('dotenv').config()

const server = app.listen(process.env.APP_PORT);
const launcher_ws__ = process.env.LAUNCHER_WS;
const launcher_web__ = process.env.LAUNCHER_WEB;

const appInit = () => {
    const port = process.env.APP_PORT || 9274;
    const launcher_ws = process.env.LAUNCHER_WS;
    const launcher_web = process.env.LAUNCHER_WEB;
    try {
        const wsProxy = createProxyMiddleware({
            target: launcher_ws,
            changeOrigin: true,
            ws: true,
            logger: console,
        });

        app.use(wsProxy);

        app.use('/', createProxyMiddleware({ target: launcher_web, changeOrigin: true, logger: console }));

        server.on('upgrade', wsProxy.upgrade);
        console.log(`[APP] Gravit Launcher Proxy started at localhost:${port}`)

    } catch (e) {
        console.log(`[ERROR] Init error: ${e}`)
    }
}

if (launcher_ws__ && launcher_web__) {
    appInit();
} else {
    console.log(`[APP] Enter config values`);
    rl.question('[INPUT] Launcher WS: ', (launcher_ws_) => {
        rl.question('[INPUT] Launcher WEB: ', (launcher_web_) => {
            fs.writeFileSync('.env', `APP_PORT=9274\nLAUNCHER_WS=${launcher_ws_}\nLAUNCHER_WEB=${launcher_web_}`);
            process.env['LAUNCHER_WS'] = launcher_ws_;
            process.env['LAUNCHER_WEB'] = launcher_web_;
            rl.close();
        });
    });

    rl.on('close', () => {
        console.log('[INSTALL] Prepare configuration.....');
        appInit();
    });
}
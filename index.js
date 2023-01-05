const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config()

console.log(`Gravit Launcher Proxy started at localhost:${process.env.APP_PORT}`)

const wsProxy = createProxyMiddleware({
  target: process.env.LAUNCHER_WS,
  changeOrigin: true, 
  ws: true, 
  logger: console,
});

const app = express();
app.use(wsProxy);

app.use('/', createProxyMiddleware({ target: process.env.LAUNCHER_WEB, changeOrigin: true , logger: console}));

const server = app.listen(process.env.APP_PORT);
server.on('upgrade', wsProxy.upgrade);


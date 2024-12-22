import express from 'express';

import { configureWebSocket } from './socket';

if (!process.env.TTT_SERVER_PORT) {
  throw new Error('Invalid env configuration');
}

const app = express();

const server = app.listen(process.env.TTT_SERVER_PORT, () => {
  console.info(`Server started at http://localhost:${process.env.TTT_SERVER_PORT}`);
});

server.on('error', console.error);

configureWebSocket(server);

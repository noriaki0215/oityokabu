// サーバーエントリーポイント

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/handlers';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

const app = express();
const httpServer = createServer(app);

// CORS設定
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io設定
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socketハンドラーをセットアップ
setupSocketHandlers(io);

// サーバー起動
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎴 おいちょかぶサーバー起動: http://localhost:${PORT}`);
});

"use strict";
// サーバーエントリーポイント
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const handlers_1 = require("./socket/handlers");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// CORS設定
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
// ヘルスチェック
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Socket.io設定
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Socketハンドラーをセットアップ
(0, handlers_1.setupSocketHandlers)(io);
// サーバー起動
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🎴 おいちょかぶサーバー起動: http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map
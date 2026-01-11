"use strict";
// ゲームマネージャー（部屋の管理）
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameManager = exports.GameManager = void 0;
const Room_1 = require("./Room");
const Player_1 = require("./Player");
const roomCode_1 = require("../utils/roomCode");
class GameManager {
    rooms = new Map();
    playerRooms = new Map(); // playerId -> roomCode
    // 部屋を作成
    createRoom(playerId, nickname) {
        const player = new Player_1.Player(playerId, nickname, true);
        // ユニークな部屋コードを生成
        let code;
        do {
            code = (0, roomCode_1.generateRoomCode)();
        } while (this.rooms.has(code));
        const room = new Room_1.Room(code, player);
        this.rooms.set(code, room);
        this.playerRooms.set(playerId, code);
        return room;
    }
    // 部屋に参加
    joinRoom(roomCode, playerId, nickname) {
        const room = this.rooms.get(roomCode.toUpperCase());
        if (!room)
            return null;
        const player = new Player_1.Player(playerId, nickname, false);
        if (!room.addPlayer(player))
            return null;
        this.playerRooms.set(playerId, roomCode);
        return room;
    }
    // 部屋を退出
    leaveRoom(playerId) {
        const roomCode = this.playerRooms.get(playerId);
        if (!roomCode)
            return { room: null, isEmpty: false };
        const room = this.rooms.get(roomCode);
        if (!room)
            return { room: null, isEmpty: false };
        room.removePlayer(playerId);
        this.playerRooms.delete(playerId);
        if (room.players.length === 0) {
            this.rooms.delete(roomCode);
            return { room, isEmpty: true };
        }
        return { room, isEmpty: false };
    }
    // 部屋を取得
    getRoom(roomCode) {
        return this.rooms.get(roomCode.toUpperCase());
    }
    // プレイヤーの部屋を取得
    getPlayerRoom(playerId) {
        const roomCode = this.playerRooms.get(playerId);
        if (!roomCode)
            return undefined;
        return this.rooms.get(roomCode);
    }
    // 部屋コードを取得
    getPlayerRoomCode(playerId) {
        return this.playerRooms.get(playerId);
    }
}
exports.GameManager = GameManager;
// シングルトンインスタンス
exports.gameManager = new GameManager();
//# sourceMappingURL=GameManager.js.map
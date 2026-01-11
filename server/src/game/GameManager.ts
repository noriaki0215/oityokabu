// ゲームマネージャー（部屋の管理）

import { Room } from './Room';
import { Player } from './Player';
import { generateRoomCode } from '../utils/roomCode';

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // playerId -> roomCode

  // 部屋を作成
  createRoom(playerId: string, nickname: string): Room {
    const player = new Player(playerId, nickname, true);
    
    // ユニークな部屋コードを生成
    let code: string;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));

    const room = new Room(code, player);
    this.rooms.set(code, room);
    this.playerRooms.set(playerId, code);

    return room;
  }

  // 部屋に参加
  joinRoom(roomCode: string, playerId: string, nickname: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    const player = new Player(playerId, nickname, false);
    if (!room.addPlayer(player)) return null;

    this.playerRooms.set(playerId, roomCode);
    return room;
  }

  // 部屋を退出
  leaveRoom(playerId: string): { room: Room | null; isEmpty: boolean } {
    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return { room: null, isEmpty: false };

    const room = this.rooms.get(roomCode);
    if (!room) return { room: null, isEmpty: false };

    room.removePlayer(playerId);
    this.playerRooms.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return { room, isEmpty: true };
    }

    return { room, isEmpty: false };
  }

  // 部屋を取得
  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  // プレイヤーの部屋を取得
  getPlayerRoom(playerId: string): Room | undefined {
    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return undefined;
    return this.rooms.get(roomCode);
  }

  // 部屋コードを取得
  getPlayerRoomCode(playerId: string): string | undefined {
    return this.playerRooms.get(playerId);
  }
}

// シングルトンインスタンス
export const gameManager = new GameManager();

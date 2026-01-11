import { Room } from './Room';
export declare class GameManager {
    private rooms;
    private playerRooms;
    createRoom(playerId: string, nickname: string): Room;
    joinRoom(roomCode: string, playerId: string, nickname: string): Room | null;
    leaveRoom(playerId: string): {
        room: Room | null;
        isEmpty: boolean;
    };
    getRoom(roomCode: string): Room | undefined;
    getPlayerRoom(playerId: string): Room | undefined;
    getPlayerRoomCode(playerId: string): string | undefined;
}
export declare const gameManager: GameManager;
//# sourceMappingURL=GameManager.d.ts.map
import { Player } from './player';
import { GameState } from './game';
export interface Room {
    code: string;
    players: Player[];
    hostId: string;
    gameState: GameState | null;
    maxPlayers: number;
    minPlayers: number;
}
export declare const MAX_PLAYERS = 6;
export declare const MIN_PLAYERS = 2;
export declare const ROOM_CODE_LENGTH = 6;
//# sourceMappingURL=room.d.ts.map
import { PlayerInGame, SpecialRole } from './player';
export type GamePhase = 'waiting' | 'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'result';
export interface Card {
    value: number;
    id: string;
}
export interface GameState {
    phase: GamePhase;
    roundNumber: number;
    fieldCard: number | null;
    currentTurnPlayerId: string | null;
    players: PlayerInGame[];
    dealerId: string;
}
export interface RoundResult {
    roundNumber: number;
    dealerTotal: number;
    dealerRole?: SpecialRole;
    playerResults: PlayerRoundResult[];
}
export interface PlayerRoundResult {
    playerId: string;
    nickname: string;
    handTotal: number;
    role?: SpecialRole;
    roundResult: number;
    totalResult: number;
    chips: number;
    isWin: boolean;
    isDraw: boolean;
}
export declare const ROLE_NAMES: Record<SpecialRole, string>;
export declare const ROLE_MULTIPLIERS: Record<SpecialRole, number>;
//# sourceMappingURL=game.d.ts.map
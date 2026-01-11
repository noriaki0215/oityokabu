import { Player as PlayerType, PlayerInGame, SpecialRole } from '../../../shared/types';
export declare class Player implements PlayerType {
    id: string;
    nickname: string;
    chips: number;
    totalResult: number;
    isHost: boolean;
    isDealer: boolean;
    isConnected: boolean;
    constructor(id: string, nickname: string, isHost?: boolean);
    toJSON(): PlayerType;
    resetStats(): void;
}
export declare class PlayerInGameState implements PlayerInGame {
    id: string;
    nickname: string;
    chips: number;
    totalResult: number;
    isHost: boolean;
    isDealer: boolean;
    isConnected: boolean;
    hand: number[];
    bet: number;
    isStand: boolean;
    handTotal: number;
    roundResult: number;
    role?: SpecialRole;
    constructor(player: Player);
    calculateHandTotal(): number;
    addCard(card: number): void;
    checkRole(fieldCard: number): SpecialRole | undefined;
    toJSON(): PlayerInGame;
}
//# sourceMappingURL=Player.d.ts.map
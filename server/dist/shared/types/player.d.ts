export interface Player {
    id: string;
    nickname: string;
    chips: number;
    totalResult: number;
    isHost: boolean;
    isDealer: boolean;
    isConnected: boolean;
}
export interface PlayerInGame extends Player {
    hand: number[];
    bet: number;
    isStand: boolean;
    handTotal: number;
    roundResult: number;
    role?: SpecialRole;
}
export type SpecialRole = 'kabu' | 'shippin' | 'kuppin' | 'arashi';
export declare const INITIAL_CHIPS = 100;
//# sourceMappingURL=player.d.ts.map
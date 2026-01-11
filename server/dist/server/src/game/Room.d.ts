import { Room as RoomType } from '../../../shared/types';
import { GameState, RoundResult } from '../../../shared/types';
import { Player } from './Player';
export declare class Room implements RoomType {
    code: string;
    players: Player[];
    hostId: string;
    gameState: GameState | null;
    maxPlayers: number;
    minPlayers: number;
    private deck;
    private dealerIndex;
    private playerTurnIndex;
    constructor(code: string, host: Player);
    addPlayer(player: Player): boolean;
    removePlayer(playerId: string): boolean;
    getPlayer(playerId: string): Player | undefined;
    canStartGame(): boolean;
    startGame(): GameState;
    placeBet(playerId: string, amount: number): boolean;
    allBetsPlaced(): boolean;
    dealCards(): GameState;
    private setNextPlayerTurn;
    drawCard(playerId: string): number | null;
    stand(playerId: string): boolean;
    advanceTurn(): GameState;
    calculateRoundResult(): RoundResult;
    private checkPlayerRole;
    private compareHands;
    nextRound(): GameState;
    resetStats(): void;
    toJSON(): RoomType;
}
//# sourceMappingURL=Room.d.ts.map
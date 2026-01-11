import { Player } from './player';
import { GameState, RoundResult } from './game';
export interface ClientToServerEvents {
    create_room: (data: {
        nickname: string;
    }) => void;
    join_room: (data: {
        roomCode: string;
        nickname: string;
    }) => void;
    leave_room: () => void;
    start_game: () => void;
    place_bet: (data: {
        amount: number;
    }) => void;
    draw_card: () => void;
    stand: () => void;
    next_round: () => void;
    reset_stats: () => void;
}
export interface ServerToClientEvents {
    room_created: (data: {
        roomCode: string;
        player: Player;
    }) => void;
    room_joined: (data: {
        roomCode: string;
        player: Player;
        players: Player[];
    }) => void;
    player_joined: (data: {
        player: Player;
        players: Player[];
    }) => void;
    player_left: (data: {
        playerId: string;
        players: Player[];
    }) => void;
    game_started: (data: {
        gameState: GameState;
    }) => void;
    betting_started: (data: {
        gameState: GameState;
    }) => void;
    bet_placed: (data: {
        playerId: string;
        amount: number;
    }) => void;
    cards_dealt: (data: {
        gameState: GameState;
    }) => void;
    turn_changed: (data: {
        currentPlayerId: string;
        gameState: GameState;
    }) => void;
    card_drawn: (data: {
        playerId: string;
        card: number;
        gameState: GameState;
    }) => void;
    player_stand: (data: {
        playerId: string;
        gameState: GameState;
    }) => void;
    round_ended: (data: {
        result: RoundResult;
        gameState: GameState;
    }) => void;
    stats_reset: (data: {
        players: Player[];
    }) => void;
    error: (data: {
        message: string;
    }) => void;
}
export interface SocketData {
    oderId: string;
    nickname: string;
    roomCode: string | null;
}
//# sourceMappingURL=events.d.ts.map
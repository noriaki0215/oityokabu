// ゲーム関連の型定義

import { PlayerInGame, SpecialRole } from './player';

export type GamePhase = 
  | 'waiting'      // ロビーで待機中
  | 'betting'      // ベット中
  | 'dealing'      // カード配布中
  | 'playerTurn'   // プレイヤーの手番
  | 'dealerTurn'   // 親の手番
  | 'result';      // 結果表示

export interface Card {
  value: number; // 1-10
  id: string;    // ユニークID
}

export interface GameState {
  phase: GamePhase;
  roundNumber: number;
  fieldCard: number | null;        // 場札
  currentTurnPlayerId: string | null;
  players: PlayerInGame[];
  dealerId: string;                // 現在の親のID
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
  roundResult: number;   // 今回の収支
  totalResult: number;   // 累積収支
  chips: number;         // 現在のチップ
  isWin: boolean;
  isDraw: boolean;
}

// 役の表示名
export const ROLE_NAMES: Record<SpecialRole, string> = {
  kabu: 'カブ',
  shippin: 'シッピン',
  kuppin: 'クッピン',
  arashi: 'アラシ',
};

// 役の倍率
export const ROLE_MULTIPLIERS: Record<SpecialRole, number> = {
  kabu: 1,
  shippin: 2,
  kuppin: 2,
  arashi: 3,
};

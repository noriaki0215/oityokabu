// クライアント側の型定義

// 画面の状態
export type PageType = 'title' | 'join' | 'create' | 'lobby' | 'game' | 'result';

// プレイヤー
export interface Player {
  id: string;
  nickname: string;
  chips: number;
  totalResult: number;
  isHost: boolean;
  isDealer: boolean;
}

// ゲーム中のプレイヤー
export interface PlayerInGame extends Player {
  hand: number[];
  bet: number;
  isStand: boolean;
  handTotal: number;
  roundResult: number;
  role?: string;
}

// ゲーム状態
export interface GameState {
  phase: 'waiting' | 'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'result';
  roundNumber: number;
  fieldCard: number | null;
  currentTurnIndex: number;
  players: PlayerInGame[];
  dealerId: string;
}

// ラウンド結果
export interface RoundResult {
  roundNumber: number;
  dealerTotal: number;
  dealerRole?: string;
  playerResults: PlayerRoundResult[];
}

export interface PlayerRoundResult {
  playerId: string;
  nickname: string;
  handTotal: number;
  role?: string;
  roundResult: number;
  totalResult: number;
  chips: number;
  isWin: boolean;
  isDraw: boolean;
}

// 役の表示名
export const ROLE_NAMES: Record<string, string> = {
  kabu: 'カブ',
  shippin: 'シッピン',
  kuppin: 'クッピン',
  arashi: 'アラシ',
};

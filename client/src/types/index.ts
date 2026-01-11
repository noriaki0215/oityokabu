// クライアント側の型定義

export * from '../../../shared/types';

// 画面の状態
export type PageType = 'title' | 'join' | 'create' | 'lobby' | 'game' | 'result';

// ゲームコンテキストの状態
export interface AppState {
  page: PageType;
  roomCode: string | null;
  nickname: string;
  playerId: string | null;
  isHost: boolean;
  isConnected: boolean;
  error: string | null;
}

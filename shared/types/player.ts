// プレイヤー関連の型定義

export interface Player {
  id: string;
  nickname: string;
  chips: number;
  totalResult: number; // 累積収支
  isHost: boolean;     // 部屋の親（ホスト）かどうか
  isDealer: boolean;   // 現在のラウンドの親かどうか
  isConnected: boolean;
}

export interface PlayerInGame extends Player {
  hand: number[];        // 手札（カードの数値）
  bet: number;           // 賭け金
  isStand: boolean;      // 止めているか
  handTotal: number;     // 手札合計の下一桁
  roundResult: number;   // 今回の収支
  role?: SpecialRole;    // 役
}

export type SpecialRole = 'kabu' | 'shippin' | 'kuppin' | 'arashi';

export const INITIAL_CHIPS = 100;

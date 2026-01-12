// Upstash Redis クライアント
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 部屋データの型
export interface RoomData {
  code: string;
  players: PlayerData[];
  hostId: string;
  gameState: GameStateData | null;
  dealerIndex: number;
}

export interface PlayerData {
  id: string;
  nickname: string;
  chips: number;
  totalResult: number;
  isHost: boolean;
  isDealer: boolean;
}

export interface GameStateData {
  phase: 'waiting' | 'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'result';
  roundNumber: number;
  fieldCard: number | null;
  currentTurnIndex: number;
  deck: number[];
  players: PlayerInGameData[];
  dealerId: string;
}

export interface PlayerInGameData extends PlayerData {
  hand: number[];
  bet: number;
  isStand: boolean;
  handTotal: number;
  roundResult: number;
  role?: string;
}

// ヘルパー関数
export async function getRoom(code: string): Promise<RoomData | null> {
  return await redis.get(`room:${code}`);
}

export async function setRoom(code: string, data: RoomData): Promise<void> {
  await redis.set(`room:${code}`, data, { ex: 3600 }); // 1時間で期限切れ
}

export async function deleteRoom(code: string): Promise<void> {
  await redis.del(`room:${code}`);
}

// 部屋コード生成
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// デッキ生成
export function createDeck(): number[] {
  const deck: number[] = [];
  for (let value = 1; value <= 10; value++) {
    for (let i = 0; i < 4; i++) {
      deck.push(value);
    }
  }
  // シャッフル
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// 手札合計計算
export function calculateHandTotal(hand: number[]): number {
  return hand.reduce((sum, card) => sum + card, 0) % 10;
}

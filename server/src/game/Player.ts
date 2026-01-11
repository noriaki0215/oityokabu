// プレイヤークラス

import { Player as PlayerType, PlayerInGame, SpecialRole, INITIAL_CHIPS } from '../../../shared/types';

export class Player implements PlayerType {
  id: string;
  nickname: string;
  chips: number;
  totalResult: number;
  isHost: boolean;
  isDealer: boolean;
  isConnected: boolean;

  constructor(id: string, nickname: string, isHost: boolean = false) {
    this.id = id;
    this.nickname = nickname;
    this.chips = INITIAL_CHIPS;
    this.totalResult = 0;
    this.isHost = isHost;
    this.isDealer = false;
    this.isConnected = true;
  }

  // プレーンオブジェクトに変換
  toJSON(): PlayerType {
    return {
      id: this.id,
      nickname: this.nickname,
      chips: this.chips,
      totalResult: this.totalResult,
      isHost: this.isHost,
      isDealer: this.isDealer,
      isConnected: this.isConnected,
    };
  }

  // 累積結果をリセット
  resetStats(): void {
    this.chips = INITIAL_CHIPS;
    this.totalResult = 0;
  }
}

export class PlayerInGameState implements PlayerInGame {
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

  constructor(player: Player) {
    this.id = player.id;
    this.nickname = player.nickname;
    this.chips = player.chips;
    this.totalResult = player.totalResult;
    this.isHost = player.isHost;
    this.isDealer = player.isDealer;
    this.isConnected = player.isConnected;
    this.hand = [];
    this.bet = 0;
    this.isStand = false;
    this.handTotal = 0;
    this.roundResult = 0;
    this.role = undefined;
  }

  // 手札の合計（下一桁）を計算
  calculateHandTotal(): number {
    const sum = this.hand.reduce((acc, card) => acc + card, 0);
    this.handTotal = sum % 10;
    return this.handTotal;
  }

  // カードを追加
  addCard(card: number): void {
    this.hand.push(card);
    this.calculateHandTotal();
  }

  // 役をチェック
  checkRole(fieldCard: number): SpecialRole | undefined {
    // アラシ: 3枚同じ数字
    if (this.hand.length === 3 && 
        this.hand[0] === this.hand[1] && 
        this.hand[1] === this.hand[2]) {
      this.role = 'arashi';
      return this.role;
    }

    // 2枚のみの場合のシッピン・クッピン判定
    if (this.hand.length === 2 && this.hand[0] === 1) {
      // シッピン: 場札4 + 手札1
      if (fieldCard === 4) {
        this.role = 'shippin';
        return this.role;
      }
      // クッピン: 場札9 + 手札1
      if (fieldCard === 9) {
        this.role = 'kuppin';
        return this.role;
      }
    }

    // カブ: 合計9
    if (this.handTotal === 9) {
      this.role = 'kabu';
      return this.role;
    }

    this.role = undefined;
    return undefined;
  }

  // プレーンオブジェクトに変換
  toJSON(): PlayerInGame {
    return {
      id: this.id,
      nickname: this.nickname,
      chips: this.chips,
      totalResult: this.totalResult,
      isHost: this.isHost,
      isDealer: this.isDealer,
      isConnected: this.isConnected,
      hand: this.hand,
      bet: this.bet,
      isStand: this.isStand,
      handTotal: this.handTotal,
      roundResult: this.roundResult,
      role: this.role,
    };
  }
}

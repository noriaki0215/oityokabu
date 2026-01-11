"use strict";
// プレイヤークラス
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerInGameState = exports.Player = void 0;
const types_1 = require("../../../shared/types");
class Player {
    id;
    nickname;
    chips;
    totalResult;
    isHost;
    isDealer;
    isConnected;
    constructor(id, nickname, isHost = false) {
        this.id = id;
        this.nickname = nickname;
        this.chips = types_1.INITIAL_CHIPS;
        this.totalResult = 0;
        this.isHost = isHost;
        this.isDealer = false;
        this.isConnected = true;
    }
    // プレーンオブジェクトに変換
    toJSON() {
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
    resetStats() {
        this.chips = types_1.INITIAL_CHIPS;
        this.totalResult = 0;
    }
}
exports.Player = Player;
class PlayerInGameState {
    id;
    nickname;
    chips;
    totalResult;
    isHost;
    isDealer;
    isConnected;
    hand;
    bet;
    isStand;
    handTotal;
    roundResult;
    role;
    constructor(player) {
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
    calculateHandTotal() {
        const sum = this.hand.reduce((acc, card) => acc + card, 0);
        this.handTotal = sum % 10;
        return this.handTotal;
    }
    // カードを追加
    addCard(card) {
        this.hand.push(card);
        this.calculateHandTotal();
    }
    // 役をチェック
    checkRole(fieldCard) {
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
    toJSON() {
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
exports.PlayerInGameState = PlayerInGameState;
//# sourceMappingURL=Player.js.map
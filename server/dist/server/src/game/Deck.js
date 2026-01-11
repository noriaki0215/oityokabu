"use strict";
// デッキ管理クラス
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deck = void 0;
class Deck {
    cards = [];
    constructor() {
        this.reset();
    }
    // デッキをリセット（40枚: 1-10を各4枚）
    reset() {
        this.cards = [];
        for (let value = 1; value <= 10; value++) {
            for (let i = 0; i < 4; i++) {
                this.cards.push(value);
            }
        }
        this.shuffle();
    }
    // シャッフル（Fisher-Yates）
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    // カードを1枚引く
    draw() {
        if (this.cards.length === 0) {
            return null;
        }
        return this.cards.pop();
    }
    // 残りカード枚数
    remaining() {
        return this.cards.length;
    }
    // デッキが空かどうか
    isEmpty() {
        return this.cards.length === 0;
    }
}
exports.Deck = Deck;
//# sourceMappingURL=Deck.js.map
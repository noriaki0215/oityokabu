"use strict";
// 部屋管理クラス
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const types_1 = require("../../../shared/types");
const types_2 = require("../../../shared/types");
const Player_1 = require("./Player");
const Deck_1 = require("./Deck");
class Room {
    code;
    players;
    hostId;
    gameState;
    maxPlayers;
    minPlayers;
    deck;
    dealerIndex = 0;
    playerTurnIndex = 0;
    constructor(code, host) {
        this.code = code;
        this.players = [host];
        this.hostId = host.id;
        this.gameState = null;
        this.maxPlayers = types_1.MAX_PLAYERS;
        this.minPlayers = types_1.MIN_PLAYERS;
        this.deck = new Deck_1.Deck();
    }
    // プレイヤーを追加
    addPlayer(player) {
        if (this.players.length >= this.maxPlayers) {
            return false;
        }
        this.players.push(player);
        return true;
    }
    // プレイヤーを削除
    removePlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index === -1)
            return false;
        this.players.splice(index, 1);
        // ホストが抜けた場合、次のプレイヤーをホストに
        if (this.hostId === playerId && this.players.length > 0) {
            this.players[0].isHost = true;
            this.hostId = this.players[0].id;
        }
        return true;
    }
    // プレイヤーを取得
    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }
    // ゲーム開始可能かチェック
    canStartGame() {
        return this.players.length >= this.minPlayers && this.gameState === null;
    }
    // ゲーム開始
    startGame() {
        this.deck.reset();
        // 最初の親を設定
        this.dealerIndex = 0;
        this.players[this.dealerIndex].isDealer = true;
        // ゲーム状態を初期化
        const playersInGame = this.players.map(p => new Player_1.PlayerInGameState(p));
        this.gameState = {
            phase: 'betting',
            roundNumber: 1,
            fieldCard: null,
            currentTurnPlayerId: null,
            players: playersInGame.map(p => p.toJSON()),
            dealerId: this.players[this.dealerIndex].id,
        };
        return this.gameState;
    }
    // ベットを配置
    placeBet(playerId, amount) {
        if (!this.gameState || this.gameState.phase !== 'betting') {
            return false;
        }
        const player = this.gameState.players.find(p => p.id === playerId);
        if (!player)
            return false;
        // 親はベットしない
        if (player.isDealer)
            return false;
        // チップが足りない場合
        if (amount > player.chips)
            return false;
        player.bet = amount;
        return true;
    }
    // 全員がベットしたかチェック
    allBetsPlaced() {
        if (!this.gameState)
            return false;
        return this.gameState.players
            .filter(p => !p.isDealer)
            .every(p => p.bet > 0);
    }
    // カードを配る
    dealCards() {
        if (!this.gameState) {
            throw new Error('Game not started');
        }
        // 場札を配る
        this.gameState.fieldCard = this.deck.draw();
        // 各プレイヤーに2枚ずつ配る
        for (const player of this.gameState.players) {
            player.hand = [this.deck.draw(), this.deck.draw()];
            const sum = player.hand.reduce((acc, c) => acc + c, 0);
            player.handTotal = sum % 10;
        }
        // 最初のプレイヤー（親以外）のターンを設定
        this.setNextPlayerTurn();
        this.gameState.phase = 'playerTurn';
        return this.gameState;
    }
    // 次のプレイヤーのターンを設定
    setNextPlayerTurn() {
        if (!this.gameState)
            return false;
        const nonDealerPlayers = this.gameState.players.filter(p => !p.isDealer);
        // 全員がスタンドしているか確認
        const allStand = nonDealerPlayers.every(p => p.isStand);
        if (allStand) {
            // 親のターンへ
            this.gameState.phase = 'dealerTurn';
            this.gameState.currentTurnPlayerId = this.gameState.dealerId;
            return true;
        }
        // スタンドしていない次のプレイヤーを探す
        for (let i = 0; i < nonDealerPlayers.length; i++) {
            const idx = (this.playerTurnIndex + i) % nonDealerPlayers.length;
            if (!nonDealerPlayers[idx].isStand) {
                this.playerTurnIndex = idx;
                this.gameState.currentTurnPlayerId = nonDealerPlayers[idx].id;
                return true;
            }
        }
        return false;
    }
    // カードを引く
    drawCard(playerId) {
        if (!this.gameState)
            return null;
        if (this.gameState.currentTurnPlayerId !== playerId)
            return null;
        const player = this.gameState.players.find(p => p.id === playerId);
        if (!player)
            return null;
        // 既に3枚持っている場合は引けない
        if (player.hand.length >= 3)
            return null;
        const card = this.deck.draw();
        if (card === null)
            return null;
        player.hand.push(card);
        const sum = player.hand.reduce((acc, c) => acc + c, 0);
        player.handTotal = sum % 10;
        // 3枚になったら自動的にスタンド
        if (player.hand.length >= 3) {
            player.isStand = true;
        }
        return card;
    }
    // スタンド（止める）
    stand(playerId) {
        if (!this.gameState)
            return false;
        if (this.gameState.currentTurnPlayerId !== playerId)
            return false;
        const player = this.gameState.players.find(p => p.id === playerId);
        if (!player)
            return false;
        player.isStand = true;
        return true;
    }
    // 次のターンへ進む
    advanceTurn() {
        if (!this.gameState) {
            throw new Error('Game not started');
        }
        if (this.gameState.phase === 'playerTurn') {
            this.playerTurnIndex++;
            this.setNextPlayerTurn();
        }
        else if (this.gameState.phase === 'dealerTurn') {
            // 親のターン終了 → 結果発表
            this.gameState.phase = 'result';
        }
        return this.gameState;
    }
    // ラウンド結果を計算
    calculateRoundResult() {
        if (!this.gameState || !this.gameState.fieldCard) {
            throw new Error('Game not started');
        }
        const dealer = this.gameState.players.find(p => p.isDealer);
        const fieldCard = this.gameState.fieldCard;
        // 役のチェック
        for (const player of this.gameState.players) {
            this.checkPlayerRole(player, fieldCard);
        }
        const playerResults = [];
        for (const player of this.gameState.players) {
            if (player.isDealer)
                continue;
            const result = this.compareHands(player, dealer, fieldCard);
            // 収支計算
            let roundResult = 0;
            if (result === 'win') {
                const multiplier = player.role ? types_2.ROLE_MULTIPLIERS[player.role] : 1;
                roundResult = player.bet * multiplier;
            }
            else if (result === 'lose') {
                const multiplier = dealer.role ? types_2.ROLE_MULTIPLIERS[dealer.role] : 1;
                roundResult = -player.bet * multiplier;
            }
            player.roundResult = roundResult;
            player.chips += roundResult;
            player.totalResult += roundResult;
            // 元のPlayerオブジェクトも更新
            const originalPlayer = this.players.find(p => p.id === player.id);
            if (originalPlayer) {
                originalPlayer.chips = player.chips;
                originalPlayer.totalResult = player.totalResult;
            }
            playerResults.push({
                playerId: player.id,
                nickname: player.nickname,
                handTotal: player.handTotal,
                role: player.role,
                roundResult: roundResult,
                totalResult: player.totalResult,
                chips: player.chips,
                isWin: result === 'win',
                isDraw: result === 'draw',
            });
        }
        // 親の収支（子の収支の逆）
        const dealerRoundResult = -playerResults.reduce((sum, p) => sum + p.roundResult, 0);
        dealer.roundResult = dealerRoundResult;
        dealer.chips += dealerRoundResult;
        dealer.totalResult += dealerRoundResult;
        const originalDealer = this.players.find(p => p.id === dealer.id);
        if (originalDealer) {
            originalDealer.chips = dealer.chips;
            originalDealer.totalResult = dealer.totalResult;
        }
        return {
            roundNumber: this.gameState.roundNumber,
            dealerTotal: dealer.handTotal,
            dealerRole: dealer.role,
            playerResults: playerResults,
        };
    }
    // 役をチェック
    checkPlayerRole(player, fieldCard) {
        // アラシ: 3枚同じ数字
        if (player.hand.length === 3 &&
            player.hand[0] === player.hand[1] &&
            player.hand[1] === player.hand[2]) {
            player.role = 'arashi';
            return;
        }
        // 2枚のみの場合のシッピン・クッピン判定
        if (player.hand.length === 2 && player.hand[0] === 1) {
            if (fieldCard === 4) {
                player.role = 'shippin';
                return;
            }
            if (fieldCard === 9) {
                player.role = 'kuppin';
                return;
            }
        }
        // カブ: 合計9
        if (player.handTotal === 9) {
            player.role = 'kabu';
            return;
        }
        player.role = undefined;
    }
    // 手札を比較
    compareHands(player, dealer, _fieldCard) {
        // 特殊役の優先度
        const getRolePriority = (role) => {
            if (!role)
                return 0;
            if (role === 'arashi')
                return 3;
            if (role === 'shippin' || role === 'kuppin')
                return 2;
            if (role === 'kabu')
                return 1;
            return 0;
        };
        const playerPriority = getRolePriority(player.role);
        const dealerPriority = getRolePriority(dealer.role);
        if (playerPriority > dealerPriority)
            return 'win';
        if (playerPriority < dealerPriority)
            return 'lose';
        // 同じ優先度なら数値で比較
        if (player.handTotal > dealer.handTotal)
            return 'win';
        if (player.handTotal < dealer.handTotal)
            return 'lose';
        return 'draw';
    }
    // 次のラウンドへ
    nextRound() {
        if (!this.gameState) {
            throw new Error('Game not started');
        }
        // 親を交代
        this.players[this.dealerIndex].isDealer = false;
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
        this.players[this.dealerIndex].isDealer = true;
        // デッキをリセット
        this.deck.reset();
        // ゲーム状態をリセット
        const playersInGame = this.players.map(p => {
            const pig = new Player_1.PlayerInGameState(p);
            return pig.toJSON();
        });
        this.gameState = {
            phase: 'betting',
            roundNumber: this.gameState.roundNumber + 1,
            fieldCard: null,
            currentTurnPlayerId: null,
            players: playersInGame,
            dealerId: this.players[this.dealerIndex].id,
        };
        this.playerTurnIndex = 0;
        return this.gameState;
    }
    // 累積結果をリセット
    resetStats() {
        for (const player of this.players) {
            player.resetStats();
        }
        if (this.gameState) {
            for (const player of this.gameState.players) {
                player.chips = 100;
                player.totalResult = 0;
            }
            this.gameState.roundNumber = 1;
        }
    }
    // プレーンオブジェクトに変換
    toJSON() {
        return {
            code: this.code,
            players: this.players.map(p => p.toJSON()),
            hostId: this.hostId,
            gameState: this.gameState,
            maxPlayers: this.maxPlayers,
            minPlayers: this.minPlayers,
        };
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map
# おいちょかぶ 🎴

スマホで遊べるマルチプレイヤー対応の「おいちょかぶ」ゲーム

## 🎮 ゲーム概要

**おいちょかぶ（Oicho-Kabu）** は日本の伝統的なカードゲームです。  
手札の合計の下一桁が「9」に最も近いプレイヤーが勝利します。

### 基本ルール

- **カード**: 株札（1〜10の数字札を各4枚、計40枚）
- **目的**: 2〜3枚のカードの合計値の下一桁を「9」に近づける
- **勝敗**: 親 vs 子で個別に勝敗を判定。9に近い方が勝ち

### 役（特殊な勝ち方）

| 役名 | 条件 | 効果 |
|------|------|------|
| カブ | 合計が9 | 通常勝利 |
| シッピン | 場札4 + 手札1（最初の2枚で） | 親の2倍勝ち |
| クッピン | 場札9 + 手札1（最初の2枚で） | 親の2倍勝ち |
| アラシ | 同じ数字3枚 | 3倍勝ち |

---

## 🛠 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | React + TypeScript + Vite |
| スタイリング | Tailwind CSS |
| リアルタイム通信 | Socket.io |
| バックエンド | Node.js + Express + Socket.io |
| フォント | Noto Serif JP（Google Fonts） |

---

## 📱 画面構成

### 1. タイトル画面

- 部屋を作る
- 部屋に参加
- 一人で遊ぶ（CPU対戦）

### 2. ニックネーム入力画面

- ニックネーム入力フィールド
- 「参加する」ボタン

### 3. ロビー画面

- 部屋コード表示（6文字英数字）
- 参加者一覧（最大6人）
- ゲーム開始ボタン（親のみ）
- 退出ボタン

### 4. ゲーム画面

- 親の手札エリア
- 他プレイヤー一覧（コンパクト表示、タップで詳細）
- 場札
- 自分の手札エリア（大きく表示）
- ベット操作 / アクションボタン

### 5. 結果画面

- 今回の結果（勝敗・収支）
- 累積結果（トータル収支・ランキング）
- リセットボタン（親のみ）
- 次のラウンドボタン

---

## 🪙 チップ仕様

| 項目 | 値 |
|------|-----|
| 初期チップ | 100 |
| 最小ベット | 1 |
| 最大ベット | 所持チップ全額 |
| リセット | 親のみ実行可能 |

---

## 🎴 カードデザイン

株札風のオリジナルデザイン（CSS実装）

- 数字: 漢数字（一〜十）
- 背景: 和紙風クリーム色
- 特別札（4, 9）: 赤背景 + 金装飾
- 裏面: 紺色 + 「株」の文字
- フォント: Noto Serif JP

---

## 👥 マルチプレイヤー仕様

### 部屋設定

- 部屋コード: 6文字の英数字
- 最大人数: 6人（親1人 + 子5人）
- 最小人数: 2人

### ゲーム進行

1. 親がゲーム開始
2. 全員がベット額を決定
3. 場札1枚、各自に手札2枚を配布
4. 子から順番に「引く」or「止める」を選択
5. 親がアクション
6. 勝敗判定・精算
7. 次のラウンド（親は順番に交代）

---

## 📂 ディレクトリ構成

```
/workspace/
├── README.md
├── client/                    # フロントエンド
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/
│       │   ├── Card.tsx
│       │   ├── Hand.tsx
│       │   ├── GameBoard.tsx
│       │   ├── PlayerList.tsx
│       │   ├── PlayerDetail.tsx
│       │   ├── NicknameForm.tsx
│       │   ├── Lobby.tsx
│       │   ├── BetControls.tsx
│       │   ├── ActionButtons.tsx
│       │   ├── RoundResult.tsx
│       │   └── TotalResult.tsx
│       ├── pages/
│       │   ├── TitlePage.tsx
│       │   ├── JoinPage.tsx
│       │   ├── LobbyPage.tsx
│       │   ├── GamePage.tsx
│       │   └── ResultPage.tsx
│       ├── hooks/
│       │   ├── useSocket.ts
│       │   ├── useGame.ts
│       │   └── useRoom.ts
│       ├── context/
│       │   ├── GameContext.tsx
│       │   └── SocketContext.tsx
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           └── helpers.ts
├── server/                    # バックエンド
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── socket/
│       │   ├── handlers.ts
│       │   └── events.ts
│       ├── game/
│       │   ├── GameManager.ts
│       │   ├── Room.ts
│       │   ├── Player.ts
│       │   └── Deck.ts
│       └── utils/
│           └── roomCode.ts
└── shared/                    # 共通型定義
    └── types/
        ├── index.ts
        ├── game.ts
        ├── player.ts
        ├── room.ts
        └── events.ts
```

---

## 🚀 起動方法

### 開発環境

```bash
# 依存関係インストール（初回のみ）
npm run install:all

# サーバー起動（ターミナル1）
npm run dev:server

# クライアント起動（ターミナル2）
npm run dev:client
```

アクセス: http://localhost:5173

### 本番ビルド

```bash
# ビルド
npm run build

# サーバー起動
npm start
```

### 個別インストール（必要な場合）

```bash
# サーバー
cd server && npm install && npm run dev

# クライアント（別ターミナル）
cd client && npm install && npm run dev
```

---

## 📝 今後の拡張予定

- [ ] CPU対戦モード
- [ ] サウンドエフェクト
- [ ] カードアニメーション
- [ ] 実績システム
- [ ] カスタム札デザイン

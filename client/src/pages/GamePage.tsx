// ゲーム画面

import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Card } from '../components/Card';
import { Hand } from '../components/Hand';
import { Button } from '../components/Button';
import { PlayerList } from '../components/PlayerList';
import { PlayerDetail } from '../components/PlayerDetail';
import { PlayerInGame } from '../types';

export const GamePage: React.FC = () => {
  const { state, actions } = useGame();
  const { gameState, playerId } = state;
  
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerInGame | null>(null);
  const [betAmount, setBetAmount] = useState(10);

  // 自分のプレイヤー情報
  const myPlayer = useMemo(() => {
    return gameState?.players.find(p => p.id === playerId);
  }, [gameState, playerId]);

  // 親のプレイヤー情報
  const dealer = useMemo(() => {
    return gameState?.players.find(p => p.isDealer);
  }, [gameState]);

  // 自分のターンかどうか
  const currentPlayer = gameState?.players[gameState?.currentTurnIndex ?? -1];
  const isMyTurn = currentPlayer?.id === playerId;

  // ベット可能かどうか
  const canBet = gameState?.phase === 'betting' && !myPlayer?.isDealer && myPlayer?.bet === 0;

  // アクション可能かどうか
  const canAction = isMyTurn && 
    (gameState?.phase === 'playerTurn' || gameState?.phase === 'dealerTurn') &&
    !myPlayer?.isStand;

  if (!gameState || !myPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-washi/60">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* ラウンド情報 */}
      <div className="text-center mb-2">
        <span className="text-xs text-washi/60">
          ラウンド {gameState.roundNumber}
        </span>
      </div>

      {/* 親エリア */}
      {dealer && (
        <div className="bg-white/5 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span>👑</span>
              <span className="font-bold text-sm">
                {dealer.nickname}
                {dealer.id === playerId && ' (あなた)'}
              </span>
            </div>
            <span className="text-sm">🪙 {dealer.chips}</span>
          </div>
          <div className="flex justify-center">
            <Hand 
              cards={dealer.hand} 
              hideCards={gameState.phase !== 'result' && dealer.id !== playerId}
              size="sm"
            />
          </div>
          {gameState.phase === 'result' && (
            <div className="text-center mt-2 text-sm">
              合計: <span className="text-kin font-bold">{dealer.handTotal}</span>
            </div>
          )}
        </div>
      )}

      {/* 他プレイヤー一覧 */}
      <div className="mb-3">
        <PlayerList
          players={gameState.players}
          currentPlayerId={currentPlayer?.id ?? null}
          myId={playerId}
          onPlayerClick={setSelectedPlayer}
        />
      </div>

      {/* 場札 */}
      {gameState.fieldCard && (
        <div className="flex flex-col items-center mb-3">
          <div className="text-xs text-washi/60 mb-1">場札</div>
          <Card value={gameState.fieldCard} size="md" />
        </div>
      )}

      {/* 自分のエリア */}
      <div className="flex-1" />
      
      <div className="bg-gradient-to-t from-ai/50 to-transparent rounded-t-xl p-4 -mx-4 -mb-4">
        {/* ターン表示 */}
        {isMyTurn && (
          <div className="text-center mb-3">
            <span className="bg-kin text-kon px-3 py-1 rounded-full text-sm font-bold">
              🟢 あなたの番です！
            </span>
          </div>
        )}

        {/* プレイヤー情報 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>🎴</span>
            <span className="font-bold">{myPlayer.nickname}</span>
          </div>
          <span>🪙 {myPlayer.chips}</span>
        </div>

        {/* 手札 */}
        <div className="flex justify-center mb-3">
          <Hand cards={myPlayer.hand} size="lg" />
        </div>

        {/* 手札合計 */}
        {myPlayer.hand.length > 0 && (
          <div className="text-center mb-4">
            <span className="text-washi/60">合計: </span>
            <span className="text-2xl font-bold text-kin">{myPlayer.handTotal}</span>
          </div>
        )}

        {/* ベット中 */}
        {canBet && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
              >
                -5
              </Button>
              <div className="text-2xl font-bold text-kin min-w-[80px] text-center">
                🪙 {betAmount}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBetAmount(Math.min(myPlayer.chips, betAmount + 5))}
              >
                +5
              </Button>
            </div>
            <Button
              fullWidth
              onClick={() => actions.placeBet(betAmount)}
            >
              ベットする
            </Button>
          </div>
        )}

        {/* 待機中（ベット済み） */}
        {gameState.phase === 'betting' && !myPlayer.isDealer && myPlayer.bet > 0 && (
          <div className="text-center text-washi/60">
            ベット済み: 🪙 {myPlayer.bet}
            <br />
            <span className="text-sm">他のプレイヤーを待っています...</span>
          </div>
        )}

        {/* 親のベット待ち */}
        {gameState.phase === 'betting' && myPlayer.isDealer && (
          <div className="text-center text-washi/60">
            他のプレイヤーがベットするのを待っています...
          </div>
        )}

        {/* アクションボタン */}
        {canAction && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="secondary"
              onClick={actions.drawCard}
              disabled={myPlayer.hand.length >= 3}
            >
              🎴 引く
            </Button>
            <Button
              size="lg"
              onClick={actions.stand}
            >
              ✋ 止める
            </Button>
          </div>
        )}

        {/* 待機中（自分のターンでない） */}
        {!isMyTurn && gameState.phase === 'playerTurn' && !myPlayer.isDealer && myPlayer.isStand && (
          <div className="text-center text-washi/60">
            止めています。他のプレイヤーの番を待っています...
          </div>
        )}

        {!isMyTurn && gameState.phase === 'playerTurn' && !myPlayer.isDealer && !myPlayer.isStand && (
          <div className="text-center text-washi/60">
            他のプレイヤーの番を待っています...
          </div>
        )}
      </div>

      {/* プレイヤー詳細モーダル */}
      <PlayerDetail
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        showCards={gameState.phase === 'result'}
      />
    </div>
  );
};

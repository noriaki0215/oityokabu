// 結果画面

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Hand } from '../components/Hand';
import { ROLE_NAMES } from '@shared/types/game';

export const ResultPage: React.FC = () => {
  const { state, actions } = useGame();
  const { roundResult, gameState, playerId, isHost } = state;
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!roundResult || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-washi/60">読み込み中...</div>
      </div>
    );
  }

  // 自分の結果
  const myResult = roundResult.playerResults.find(r => r.playerId === playerId);
  const dealer = gameState.players.find(p => p.isDealer);

  // 累積結果（ソート済み）
  const sortedPlayers = [...gameState.players].sort((a, b) => b.totalResult - a.totalResult);

  const handleReset = () => {
    actions.resetStats();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* 結果ヘッダー */}
      <div className="text-center mb-4">
        {myResult ? (
          <>
            {myResult.isWin ? (
              <div className="text-3xl mb-2">🎉</div>
            ) : myResult.isDraw ? (
              <div className="text-3xl mb-2">🤝</div>
            ) : (
              <div className="text-3xl mb-2">😢</div>
            )}
            <h1 className="text-2xl font-bold text-kin font-serif-jp">
              {myResult.isWin ? '勝利！' : myResult.isDraw ? '引き分け' : '敗北...'}
            </h1>
            <div className="text-sm text-washi/80 mt-1">
              あなた: {myResult.handTotal} vs 親: {roundResult.dealerTotal}
            </div>
          </>
        ) : dealer?.id === playerId ? (
          <>
            <div className="text-3xl mb-2">👑</div>
            <h1 className="text-2xl font-bold text-kin font-serif-jp">
              親の結果
            </h1>
            <div className="text-sm text-washi/80 mt-1">
              あなたの合計: {roundResult.dealerTotal}
            </div>
          </>
        ) : null}
      </div>

      {/* 親の手札表示 */}
      {dealer && (
        <div className="flex justify-center mb-4">
          <div className="text-center">
            <div className="text-xs text-washi/60 mb-1">親の手札</div>
            <Hand cards={dealer.hand} size="sm" />
            <div className="text-sm mt-1">
              合計: <span className="text-kin font-bold">{dealer.handTotal}</span>
              {dealer.role && (
                <span className="ml-2 text-shu">
                  {ROLE_NAMES[dealer.role]}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 今回の結果 */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <h2 className="text-sm font-bold text-kin mb-3 flex items-center gap-2">
          📍 今回の結果
        </h2>
        <div className="space-y-2">
          {/* 親 */}
          {dealer && (
            <div className="flex items-center justify-between text-sm border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span>👑</span>
                <span>{dealer.nickname}</span>
                <span className="text-washi/60">{dealer.handTotal}</span>
              </div>
              <span className={dealer.roundResult >= 0 ? 'text-matcha' : 'text-shu'}>
                {dealer.roundResult >= 0 ? '+' : ''}{dealer.roundResult}
              </span>
            </div>
          )}
          
          {/* 子 */}
          {roundResult.playerResults.map((result, index) => (
            <div 
              key={result.playerId}
              className={`
                flex items-center justify-between text-sm
                ${result.playerId === playerId ? 'bg-kin/10 -mx-2 px-2 py-1 rounded' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎴'}</span>
                <span>{result.nickname}</span>
                <span className="text-washi/60">{result.handTotal}</span>
                {result.role && (
                  <span className="text-xs bg-shu/30 px-1.5 py-0.5 rounded text-shu">
                    {ROLE_NAMES[result.role]}
                  </span>
                )}
              </div>
              <span className={result.roundResult >= 0 ? 'text-matcha' : 'text-shu'}>
                {result.roundResult >= 0 ? '+' : ''}{result.roundResult}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 累積結果 */}
      <div className="bg-white/5 rounded-lg p-4 mb-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-kin flex items-center gap-2">
            📊 累積結果
          </h2>
          {isHost && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-washi/60 hover:text-washi underline"
            >
              リセット
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-4 text-xs text-washi/60 border-b border-white/10 pb-1">
            <span>順位</span>
            <span>名前</span>
            <span className="text-right">収支</span>
            <span className="text-right">所持</span>
          </div>
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={`
                grid grid-cols-4 text-sm
                ${player.id === playerId ? 'bg-kin/10 -mx-2 px-2 py-1 rounded' : ''}
              `}
            >
              <span>{index + 1}位</span>
              <span className="truncate">{player.nickname}</span>
              <span className={`text-right ${player.totalResult >= 0 ? 'text-matcha' : 'text-shu'}`}>
                {player.totalResult >= 0 ? '+' : ''}{player.totalResult}
              </span>
              <span className="text-right">🪙{player.chips}</span>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-washi/40 mt-3">
          🎮 ラウンド: {gameState.roundNumber}
        </div>
      </div>

      {/* アクション */}
      <div className="space-y-3">
        <Button fullWidth size="lg" onClick={actions.nextRound}>
          次のラウンドへ
        </Button>
        <Button fullWidth variant="ghost" onClick={actions.leaveRoom}>
          退出する
        </Button>
      </div>

      {/* リセット確認モーダル */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="🔄 累積結果をリセット"
      >
        <div className="space-y-4">
          <p className="text-sm text-washi/80">
            全員の累積収支と所持チップを初期状態に戻しますか？
          </p>
          <p className="text-xs text-washi/60">
            ※ラウンド数もリセットされます
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowResetConfirm(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
            >
              リセット
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

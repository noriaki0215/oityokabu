// ロビー画面

import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/Button';

export const LobbyPage: React.FC = () => {
  const { state, actions } = useGame();

  const copyRoomCode = () => {
    if (state.roomCode) {
      navigator.clipboard.writeText(state.roomCode);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="text-sm text-washi/60 mb-1">部屋コード</div>
        <button
          onClick={copyRoomCode}
          className="text-3xl font-bold text-kin tracking-widest hover:text-amber-400 transition-colors"
        >
          {state.roomCode}
        </button>
        <div className="text-xs text-washi/40 mt-1">タップでコピー</div>
      </div>

      {/* 参加者リスト */}
      <div className="flex-1">
        <div className="text-sm text-washi/60 mb-3">
          参加者 ({state.players.length}/6)
        </div>
        
        <div className="space-y-2">
          {state.players.map((player) => (
            <div
              key={player.id}
              className={`
                flex items-center justify-between
                px-4 py-3
                rounded-lg
                ${player.id === state.playerId 
                  ? 'bg-kin/20 border border-kin/40' 
                  : 'bg-white/5'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {player.isHost ? '👑' : '🎴'}
                </span>
                <span className="font-bold">
                  {player.nickname}
                  {player.id === state.playerId && (
                    <span className="text-xs text-washi/60 ml-2">（あなた）</span>
                  )}
                </span>
              </div>
              <div className="text-sm text-washi/60">
                🪙 {player.chips}
              </div>
            </div>
          ))}

          {/* 空きスロット */}
          {Array.from({ length: 6 - state.players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center px-4 py-3 rounded-lg border border-dashed border-white/20 text-washi/30"
            >
              <span className="text-lg mr-3">⏳</span>
              <span>待機中...</span>
            </div>
          ))}
        </div>
      </div>

      {/* アクション */}
      <div className="space-y-3 mt-6">
        {state.isHost && (
          <Button
            fullWidth
            size="lg"
            disabled={state.players.length < 2}
            onClick={actions.startGame}
          >
            🎮 ゲーム開始
          </Button>
        )}

        {!state.isHost && (
          <div className="text-center text-washi/60 py-4">
            ホストがゲームを開始するのを待っています...
          </div>
        )}

        <Button
          fullWidth
          variant="ghost"
          onClick={actions.leaveRoom}
        >
          退出する
        </Button>
      </div>
    </div>
  );
};

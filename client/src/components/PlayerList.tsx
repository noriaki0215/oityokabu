// プレイヤー一覧コンポーネント（ゲーム中のコンパクト表示）

import React from 'react';
import { PlayerInGame } from '../types';

interface PlayerListProps {
  players: PlayerInGame[];
  currentPlayerId: string | null;
  myId: string | null;
  onPlayerClick?: (player: PlayerInGame) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  myId,
  onPlayerClick
}) => {
  // 自分と親以外のプレイヤー
  const otherPlayers = players.filter(p => p.id !== myId && !p.isDealer);

  if (otherPlayers.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="text-xs text-washi/60 mb-1">他のプレイヤー（タップで詳細）</div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {otherPlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => onPlayerClick?.(player)}
            className={`
              w-full
              flex items-center justify-between
              px-3 py-2
              rounded-lg
              text-left
              transition-all
              ${currentPlayerId === player.id 
                ? 'bg-kin/20 border border-kin' 
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {currentPlayerId === player.id ? '⭐' : '🎴'}
              </span>
              <span className="font-bold text-sm">{player.nickname}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-washi/80">
              <span>🪙 {player.chips}</span>
              <span>🎴 {player.hand.length}枚</span>
              {player.bet > 0 && <span>BET: {player.bet}</span>}
              {player.isStand && <span className="text-matcha">止</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

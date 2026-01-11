// プレイヤー詳細モーダル

import React from 'react';
import { PlayerInGame } from '../types';
import { Modal } from './Modal';
import { Hand } from './Hand';

interface PlayerDetailProps {
  player: PlayerInGame | null;
  isOpen: boolean;
  onClose: () => void;
  showCards?: boolean;
}

export const PlayerDetail: React.FC<PlayerDetailProps> = ({
  player,
  isOpen,
  onClose,
  showCards = false
}) => {
  if (!player) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${player.nickname} の手札`}>
      <div className="space-y-4">
        {/* ステータス */}
        <div className="flex justify-between text-sm">
          <span>🪙 {player.chips}</span>
          <span>BET: {player.bet}</span>
        </div>

        {/* 手札 */}
        <div className="flex justify-center">
          <Hand 
            cards={player.hand} 
            hideCards={!showCards}
            revealFirst={!showCards}
            size="md"
          />
        </div>

        {/* 状態 */}
        <div className="text-center text-sm text-washi/80">
          {player.isStand ? (
            <span className="text-matcha">止めている</span>
          ) : (
            <span>{player.hand.length}枚を持っている</span>
          )}
        </div>
      </div>
    </Modal>
  );
};

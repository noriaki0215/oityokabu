// 部屋参加画面

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface JoinPageProps {
  isCreate?: boolean;
}

export const JoinPage: React.FC<JoinPageProps> = ({ isCreate = false }) => {
  const { state, dispatch, actions } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState(state.nickname);

  const canSubmit = nickname.trim().length > 0 && (isCreate || roomCode.length === 6);

  const handleSubmit = () => {
    if (!canSubmit) return;
    
    dispatch({ type: 'SET_NICKNAME', nickname: nickname.trim() });
    
    if (isCreate) {
      actions.createRoom();
    } else {
      actions.joinRoom(roomCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <h2 className="text-2xl font-bold text-kin text-center mb-8 font-serif-jp">
          {isCreate ? '部屋を作る' : '部屋に参加'}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-washi/80 mb-2">
              ニックネーム
            </label>
            <Input
              value={nickname}
              onChange={setNickname}
              placeholder="名前を入力"
              maxLength={10}
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>

          {!isCreate && (
            <div>
              <label className="block text-sm text-washi/80 mb-2">
                部屋コード
              </label>
              <Input
                value={roomCode}
                onChange={(v) => setRoomCode(v.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {state.error && (
            <div className="text-shu text-sm text-center bg-shu/10 p-2 rounded">
              {state.error}
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            disabled={!canSubmit || !state.isConnected}
            onClick={handleSubmit}
          >
            参加する
          </Button>

          <Button
            fullWidth
            variant="ghost"
            onClick={() => dispatch({ type: 'SET_PAGE', page: 'title' })}
          >
            戻る
          </Button>
        </div>
      </div>
    </div>
  );
};

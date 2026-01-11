// タイトル画面

import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const TitlePage: React.FC = () => {
  const { dispatch, state } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* ロゴ・タイトル */}
      <div className="text-center mb-12">
        <div className="flex justify-center gap-2 mb-4">
          <Card value={8} size="md" />
          <Card value={9} size="md" />
        </div>
        <h1 className="text-4xl font-bold font-serif-jp text-kin mb-2">
          おいちょかぶ
        </h1>
        <p className="text-washi/60 text-sm">
          オンライン対戦カードゲーム
        </p>
      </div>

      {/* メニュー */}
      <div className="w-full max-w-xs space-y-4">
        <Button
          fullWidth
          size="lg"
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'create' })}
        >
          🏠 部屋を作る
        </Button>

        <Button
          fullWidth
          size="lg"
          variant="secondary"
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'join' })}
        >
          🚪 部屋に参加
        </Button>

        {/* 接続状態 */}
        <div className="text-center text-xs mt-8">
          {state.isConnected ? (
            <span className="text-matcha">● サーバー接続中</span>
          ) : (
            <span className="text-shu pulse">● 接続中...</span>
          )}
        </div>
      </div>
    </div>
  );
};

// メインアプリケーション

import React from 'react';
import { SocketProvider } from './context/SocketContext';
import { GameProvider, useGame } from './context/GameContext';
import { TitlePage } from './pages/TitlePage';
import { JoinPage } from './pages/JoinPage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { ResultPage } from './pages/ResultPage';

const AppContent: React.FC = () => {
  const { state } = useGame();

  const renderPage = () => {
    switch (state.page) {
      case 'title':
        return <TitlePage />;
      case 'create':
        return <JoinPage isCreate />;
      case 'join':
        return <JoinPage />;
      case 'lobby':
        return <LobbyPage />;
      case 'game':
        return <GamePage />;
      case 'result':
        return <ResultPage />;
      default:
        return <TitlePage />;
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SocketProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SocketProvider>
  );
};

export default App;

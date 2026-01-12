// API通信コンテキスト（Socket.ioの代わり）

import React, { createContext, useContext, useCallback, useState } from 'react';

interface ApiContextType {
  isConnected: boolean;
  createRoom: (nickname: string, playerId: string) => Promise<any>;
  joinRoom: (roomCode: string, nickname: string, playerId: string) => Promise<any>;
  getRoomStatus: (roomCode: string) => Promise<any>;
  startGame: (roomCode: string, playerId: string) => Promise<any>;
  placeBet: (roomCode: string, playerId: string, amount: number) => Promise<any>;
  performAction: (roomCode: string, playerId: string, action: 'draw' | 'stand') => Promise<any>;
  nextRound: (roomCode: string) => Promise<any>;
  resetStats: (roomCode: string, playerId: string) => Promise<any>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

const API_BASE = '/api';

async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API error');
  }
  
  return data;
}

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [isConnected] = useState(true); // API always "connected"

  const createRoom = useCallback(async (nickname: string, playerId: string) => {
    return apiCall('/room/create', 'POST', { nickname, playerId });
  }, []);

  const joinRoom = useCallback(async (roomCode: string, nickname: string, playerId: string) => {
    return apiCall('/room/join', 'POST', { roomCode, nickname, playerId });
  }, []);

  const getRoomStatus = useCallback(async (roomCode: string) => {
    return apiCall(`/room/status?code=${roomCode}`);
  }, []);

  const startGame = useCallback(async (roomCode: string, playerId: string) => {
    return apiCall('/game/start', 'POST', { roomCode, playerId });
  }, []);

  const placeBet = useCallback(async (roomCode: string, playerId: string, amount: number) => {
    return apiCall('/game/bet', 'POST', { roomCode, playerId, amount });
  }, []);

  const performAction = useCallback(async (roomCode: string, playerId: string, action: 'draw' | 'stand') => {
    return apiCall('/game/action', 'POST', { roomCode, playerId, action });
  }, []);

  const nextRound = useCallback(async (roomCode: string) => {
    return apiCall('/game/next', 'POST', { roomCode });
  }, []);

  const resetStats = useCallback(async (roomCode: string, playerId: string) => {
    return apiCall('/game/reset', 'POST', { roomCode, playerId });
  }, []);

  return (
    <ApiContext.Provider value={{
      isConnected,
      createRoom,
      joinRoom,
      getRoomStatus,
      startGame,
      placeBet,
      performAction,
      nextRound,
      resetStats,
    }}>
      {children}
    </ApiContext.Provider>
  );
};

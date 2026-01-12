// ゲーム状態管理コンテキスト（API版）

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useApi } from './ApiContext';
import { 
  Player, 
  GameState, 
  RoundResult,
} from '../types';

type PageType = 'title' | 'join' | 'create' | 'lobby' | 'game' | 'result';

interface GameContextState {
  page: PageType;
  roomCode: string | null;
  nickname: string;
  playerId: string;
  isHost: boolean;
  isConnected: boolean;
  error: string | null;
  players: Player[];
  gameState: GameState | null;
  roundResult: RoundResult | null;
}

type GameAction =
  | { type: 'SET_PAGE'; page: PageType }
  | { type: 'SET_NICKNAME'; nickname: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'ROOM_CREATED'; roomCode: string; player: Player }
  | { type: 'ROOM_JOINED'; roomCode: string; player: Player; players: Player[] }
  | { type: 'UPDATE_ROOM'; players: Player[]; gameState: GameState | null }
  | { type: 'GAME_STARTED'; gameState: GameState }
  | { type: 'GAME_STATE_UPDATED'; gameState: GameState }
  | { type: 'ROUND_ENDED'; result: RoundResult; gameState: GameState }
  | { type: 'STATS_RESET'; players: Player[] }
  | { type: 'LEAVE_ROOM' }
  | { type: 'SET_CONNECTED'; isConnected: boolean };

// ユニークなプレイヤーIDを生成
function generatePlayerId(): string {
  const stored = localStorage.getItem('playerId');
  if (stored) return stored;
  const id = 'p_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('playerId', id);
  return id;
}

const initialState: GameContextState = {
  page: 'title',
  roomCode: null,
  nickname: '',
  playerId: generatePlayerId(),
  isHost: false,
  isConnected: true,
  error: null,
  players: [],
  gameState: null,
  roundResult: null,
};

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.page, error: null };
    
    case 'SET_NICKNAME':
      return { ...state, nickname: action.nickname };
    
    case 'SET_ERROR':
      return { ...state, error: action.error };
    
    case 'ROOM_CREATED':
      return {
        ...state,
        page: 'lobby',
        roomCode: action.roomCode,
        isHost: true,
        players: [action.player],
        error: null,
      };
    
    case 'ROOM_JOINED':
      return {
        ...state,
        page: 'lobby',
        roomCode: action.roomCode,
        isHost: action.player.isHost,
        players: action.players,
        error: null,
      };
    
    case 'UPDATE_ROOM':
      const newPage = action.gameState?.phase === 'result' ? 'result' 
        : action.gameState ? 'game' 
        : state.page;
      return {
        ...state,
        players: action.players,
        gameState: action.gameState,
        page: newPage,
      };
    
    case 'GAME_STARTED':
    case 'GAME_STATE_UPDATED':
      return {
        ...state,
        page: 'game',
        gameState: action.gameState,
        roundResult: null,
      };
    
    case 'ROUND_ENDED':
      return {
        ...state,
        page: 'result',
        gameState: action.gameState,
        roundResult: action.result,
      };
    
    case 'STATS_RESET':
      return {
        ...state,
        players: action.players,
      };
    
    case 'LEAVE_ROOM':
      return {
        ...initialState,
        playerId: state.playerId,
        nickname: state.nickname,
      };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.isConnected };
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameContextState;
  dispatch: React.Dispatch<GameAction>;
  actions: {
    createRoom: () => void;
    joinRoom: (roomCode: string) => void;
    leaveRoom: () => void;
    startGame: () => void;
    placeBet: (amount: number) => void;
    drawCard: () => void;
    stand: () => void;
    nextRound: () => void;
    resetStats: () => void;
  };
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const api = useApi();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ポーリングで部屋の状態を取得
  const pollRoomStatus = useCallback(async () => {
    if (!state.roomCode) return;
    
    try {
      const data = await api.getRoomStatus(state.roomCode);
      if (data.room) {
        dispatch({ 
          type: 'UPDATE_ROOM', 
          players: data.room.players,
          gameState: data.room.gameState,
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [api, state.roomCode]);

  // ポーリング開始/停止
  useEffect(() => {
    if (state.roomCode && state.page !== 'title' && state.page !== 'join' && state.page !== 'create') {
      // 1秒ごとにポーリング
      pollingRef.current = setInterval(pollRoomStatus, 1000);
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [state.roomCode, state.page, pollRoomStatus]);

  // アクション
  const createRoom = useCallback(async () => {
    if (!state.nickname) return;
    try {
      const data = await api.createRoom(state.nickname, state.playerId);
      dispatch({ type: 'ROOM_CREATED', roomCode: data.roomCode, player: data.player });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.nickname, state.playerId]);

  const joinRoom = useCallback(async (roomCode: string) => {
    if (!state.nickname) return;
    try {
      const data = await api.joinRoom(roomCode, state.nickname, state.playerId);
      dispatch({ type: 'ROOM_JOINED', roomCode: data.roomCode, player: data.player, players: data.players });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.nickname, state.playerId]);

  const leaveRoom = useCallback(() => {
    dispatch({ type: 'LEAVE_ROOM' });
  }, []);

  const startGame = useCallback(async () => {
    if (!state.roomCode) return;
    try {
      const data = await api.startGame(state.roomCode, state.playerId);
      dispatch({ type: 'GAME_STARTED', gameState: data.gameState });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.roomCode, state.playerId]);

  const placeBet = useCallback(async (amount: number) => {
    if (!state.roomCode) return;
    try {
      const data = await api.placeBet(state.roomCode, state.playerId, amount);
      dispatch({ type: 'GAME_STATE_UPDATED', gameState: data.gameState });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.roomCode, state.playerId]);

  const drawCard = useCallback(async () => {
    if (!state.roomCode) return;
    try {
      const data = await api.performAction(state.roomCode, state.playerId, 'draw');
      if (data.roundResult) {
        dispatch({ type: 'ROUND_ENDED', result: data.roundResult, gameState: data.gameState });
      } else {
        dispatch({ type: 'GAME_STATE_UPDATED', gameState: data.gameState });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.roomCode, state.playerId]);

  const stand = useCallback(async () => {
    if (!state.roomCode) return;
    try {
      const data = await api.performAction(state.roomCode, state.playerId, 'stand');
      if (data.roundResult) {
        dispatch({ type: 'ROUND_ENDED', result: data.roundResult, gameState: data.gameState });
      } else {
        dispatch({ type: 'GAME_STATE_UPDATED', gameState: data.gameState });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.roomCode, state.playerId]);

  const nextRound = useCallback(async () => {
    if (!state.roomCode) return;
    try {
      const data = await api.nextRound(state.roomCode);
      dispatch({ type: 'GAME_STATE_UPDATED', gameState: data.gameState });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.roomCode]);

  const resetStats = useCallback(async () => {
    if (!state.roomCode) return;
    try {
      const data = await api.resetStats(state.roomCode, state.playerId);
      dispatch({ type: 'STATS_RESET', players: data.players });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [api, state.roomCode, state.playerId]);

  const actions = {
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    placeBet,
    drawCard,
    stand,
    nextRound,
    resetStats,
  };

  return (
    <GameContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
};

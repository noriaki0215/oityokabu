// ゲーム状態管理コンテキスト

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { 
  Player, 
  GameState, 
  RoundResult,
  PageType,
  AppState 
} from '../types';

interface GameContextState extends AppState {
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
  | { type: 'PLAYER_JOINED'; player: Player; players: Player[] }
  | { type: 'PLAYER_LEFT'; playerId: string; players: Player[] }
  | { type: 'GAME_STARTED'; gameState: GameState }
  | { type: 'GAME_STATE_UPDATED'; gameState: GameState }
  | { type: 'ROUND_ENDED'; result: RoundResult; gameState: GameState }
  | { type: 'STATS_RESET'; players: Player[] }
  | { type: 'LEAVE_ROOM' }
  | { type: 'SET_CONNECTED'; isConnected: boolean };

const initialState: GameContextState = {
  page: 'title',
  roomCode: null,
  nickname: '',
  playerId: null,
  isHost: false,
  isConnected: false,
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
        playerId: action.player.id,
        isHost: true,
        players: [action.player],
        error: null,
      };
    
    case 'ROOM_JOINED':
      return {
        ...state,
        page: 'lobby',
        roomCode: action.roomCode,
        playerId: action.player.id,
        isHost: action.player.isHost,
        players: action.players,
        error: null,
      };
    
    case 'PLAYER_JOINED':
      return {
        ...state,
        players: action.players,
      };
    
    case 'PLAYER_LEFT':
      return {
        ...state,
        players: action.players,
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
        gameState: state.gameState ? {
          ...state.gameState,
          players: state.gameState.players.map(p => {
            const updated = action.players.find(up => up.id === p.id);
            return updated ? { ...p, chips: updated.chips, totalResult: updated.totalResult } : p;
          }),
        } : null,
      };
    
    case 'LEAVE_ROOM':
      return {
        ...initialState,
        isConnected: state.isConnected,
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
  const { socket, isConnected } = useSocket();
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // 接続状態を更新
  useEffect(() => {
    dispatch({ type: 'SET_CONNECTED', isConnected });
  }, [isConnected]);

  // Socketイベントをリッスン
  useEffect(() => {
    if (!socket) return;

    socket.on('room_created', ({ roomCode, player }) => {
      dispatch({ type: 'ROOM_CREATED', roomCode, player });
    });

    socket.on('room_joined', ({ roomCode, player, players }) => {
      dispatch({ type: 'ROOM_JOINED', roomCode, player, players });
    });

    socket.on('player_joined', ({ player, players }) => {
      dispatch({ type: 'PLAYER_JOINED', player, players });
    });

    socket.on('player_left', ({ playerId, players }) => {
      dispatch({ type: 'PLAYER_LEFT', playerId, players });
    });

    socket.on('game_started', ({ gameState }) => {
      dispatch({ type: 'GAME_STARTED', gameState });
    });

    socket.on('betting_started', ({ gameState }) => {
      dispatch({ type: 'GAME_STATE_UPDATED', gameState });
    });

    socket.on('bet_placed', () => {
      // ベット配置の通知（必要に応じて処理）
    });

    socket.on('cards_dealt', ({ gameState }) => {
      dispatch({ type: 'GAME_STATE_UPDATED', gameState });
    });

    socket.on('turn_changed', ({ gameState }) => {
      dispatch({ type: 'GAME_STATE_UPDATED', gameState });
    });

    socket.on('card_drawn', ({ gameState }) => {
      dispatch({ type: 'GAME_STATE_UPDATED', gameState });
    });

    socket.on('player_stand', ({ gameState }) => {
      dispatch({ type: 'GAME_STATE_UPDATED', gameState });
    });

    socket.on('round_ended', ({ result, gameState }) => {
      dispatch({ type: 'ROUND_ENDED', result, gameState });
    });

    socket.on('stats_reset', ({ players }) => {
      dispatch({ type: 'STATS_RESET', players });
    });

    socket.on('error', ({ message }) => {
      dispatch({ type: 'SET_ERROR', error: message });
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_started');
      socket.off('betting_started');
      socket.off('bet_placed');
      socket.off('cards_dealt');
      socket.off('turn_changed');
      socket.off('card_drawn');
      socket.off('player_stand');
      socket.off('round_ended');
      socket.off('stats_reset');
      socket.off('error');
    };
  }, [socket]);

  // アクション
  const createRoom = useCallback(() => {
    if (!socket || !state.nickname) return;
    socket.emit('create_room', { nickname: state.nickname });
  }, [socket, state.nickname]);

  const joinRoom = useCallback((roomCode: string) => {
    if (!socket || !state.nickname) return;
    socket.emit('join_room', { roomCode: roomCode.toUpperCase(), nickname: state.nickname });
  }, [socket, state.nickname]);

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('leave_room');
    dispatch({ type: 'LEAVE_ROOM' });
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit('start_game');
  }, [socket]);

  const placeBet = useCallback((amount: number) => {
    if (!socket) return;
    socket.emit('place_bet', { amount });
  }, [socket]);

  const drawCard = useCallback(() => {
    if (!socket) return;
    socket.emit('draw_card');
  }, [socket]);

  const stand = useCallback(() => {
    if (!socket) return;
    socket.emit('stand');
  }, [socket]);

  const nextRound = useCallback(() => {
    if (!socket) return;
    socket.emit('next_round');
  }, [socket]);

  const resetStats = useCallback(() => {
    if (!socket) return;
    socket.emit('reset_stats');
  }, [socket]);

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

// Socket.io イベントハンドラー

import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';
import { gameManager } from '../game/GameManager';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: TypedServer): void {
  io.on('connection', (socket: TypedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    // 部屋を作成
    socket.on('create_room', ({ nickname }) => {
      try {
        const room = gameManager.createRoom(socket.id, nickname);
        socket.join(room.code);
        
        const player = room.getPlayer(socket.id)!;
        socket.emit('room_created', {
          roomCode: room.code,
          player: player.toJSON(),
        });
        
        console.log(`Room created: ${room.code} by ${nickname}`);
      } catch (error) {
        socket.emit('error', { message: '部屋の作成に失敗しました' });
      }
    });

    // 部屋に参加
    socket.on('join_room', ({ roomCode, nickname }) => {
      try {
        const room = gameManager.joinRoom(roomCode, socket.id, nickname);
        if (!room) {
          socket.emit('error', { message: '部屋が見つからないか、満員です' });
          return;
        }

        socket.join(room.code);
        
        const player = room.getPlayer(socket.id)!;
        const players = room.players.map(p => p.toJSON());

        socket.emit('room_joined', {
          roomCode: room.code,
          player: player.toJSON(),
          players,
        });

        socket.to(room.code).emit('player_joined', {
          player: player.toJSON(),
          players,
        });

        console.log(`${nickname} joined room: ${room.code}`);
      } catch (error) {
        socket.emit('error', { message: '参加に失敗しました' });
      }
    });

    // 部屋を退出
    socket.on('leave_room', () => {
      handleLeaveRoom(socket);
    });

    // ゲーム開始
    socket.on('start_game', () => {
      try {
        const room = gameManager.getPlayerRoom(socket.id);
        if (!room) {
          socket.emit('error', { message: '部屋が見つかりません' });
          return;
        }

        if (room.hostId !== socket.id) {
          socket.emit('error', { message: 'ホストのみゲームを開始できます' });
          return;
        }

        if (!room.canStartGame()) {
          socket.emit('error', { message: 'ゲームを開始できません（人数不足）' });
          return;
        }

        const gameState = room.startGame();
        io.to(room.code).emit('game_started', { gameState });
        io.to(room.code).emit('betting_started', { gameState });

        console.log(`Game started in room: ${room.code}`);
      } catch (error) {
        socket.emit('error', { message: 'ゲーム開始に失敗しました' });
      }
    });

    // ベットを配置
    socket.on('place_bet', ({ amount }) => {
      try {
        const room = gameManager.getPlayerRoom(socket.id);
        if (!room || !room.gameState) {
          socket.emit('error', { message: '部屋またはゲームが見つかりません' });
          return;
        }

        if (!room.placeBet(socket.id, amount)) {
          socket.emit('error', { message: 'ベットに失敗しました' });
          return;
        }

        io.to(room.code).emit('bet_placed', {
          playerId: socket.id,
          amount,
        });

        // 全員がベットしたらカードを配る
        if (room.allBetsPlaced()) {
          const gameState = room.dealCards();
          io.to(room.code).emit('cards_dealt', { gameState });
          io.to(room.code).emit('turn_changed', {
            currentPlayerId: gameState.currentTurnPlayerId!,
            gameState,
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'ベットに失敗しました' });
      }
    });

    // カードを引く
    socket.on('draw_card', () => {
      try {
        const room = gameManager.getPlayerRoom(socket.id);
        if (!room || !room.gameState) {
          socket.emit('error', { message: '部屋またはゲームが見つかりません' });
          return;
        }

        const card = room.drawCard(socket.id);
        if (card === null) {
          socket.emit('error', { message: 'カードを引けません' });
          return;
        }

        io.to(room.code).emit('card_drawn', {
          playerId: socket.id,
          card,
          gameState: room.gameState,
        });

        // プレイヤーが3枚持っていたら自動で次のターンへ
        const player = room.gameState.players.find(p => p.id === socket.id);
        if (player && player.hand.length >= 3) {
          advanceGame(io, room);
        }
      } catch (error) {
        socket.emit('error', { message: 'カードを引くのに失敗しました' });
      }
    });

    // スタンド（止める）
    socket.on('stand', () => {
      try {
        const room = gameManager.getPlayerRoom(socket.id);
        if (!room || !room.gameState) {
          socket.emit('error', { message: '部屋またはゲームが見つかりません' });
          return;
        }

        if (!room.stand(socket.id)) {
          socket.emit('error', { message: 'スタンドに失敗しました' });
          return;
        }

        io.to(room.code).emit('player_stand', {
          playerId: socket.id,
          gameState: room.gameState,
        });

        advanceGame(io, room);
      } catch (error) {
        socket.emit('error', { message: 'スタンドに失敗しました' });
      }
    });

    // 次のラウンド
    socket.on('next_round', () => {
      try {
        const room = gameManager.getPlayerRoom(socket.id);
        if (!room || !room.gameState) {
          socket.emit('error', { message: '部屋またはゲームが見つかりません' });
          return;
        }

        const gameState = room.nextRound();
        io.to(room.code).emit('betting_started', { gameState });

        console.log(`Next round started in room: ${room.code}`);
      } catch (error) {
        socket.emit('error', { message: '次のラウンドの開始に失敗しました' });
      }
    });

    // 累積結果をリセット
    socket.on('reset_stats', () => {
      try {
        const room = gameManager.getPlayerRoom(socket.id);
        if (!room) {
          socket.emit('error', { message: '部屋が見つかりません' });
          return;
        }

        if (room.hostId !== socket.id) {
          socket.emit('error', { message: 'ホストのみリセットできます' });
          return;
        }

        room.resetStats();
        const players = room.players.map(p => p.toJSON());
        io.to(room.code).emit('stats_reset', { players });

        console.log(`Stats reset in room: ${room.code}`);
      } catch (error) {
        socket.emit('error', { message: 'リセットに失敗しました' });
      }
    });

    // 切断時
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      handleLeaveRoom(socket);
    });
  });
}

// 部屋退出処理
function handleLeaveRoom(socket: TypedSocket): void {
  const roomCode = gameManager.getPlayerRoomCode(socket.id);
  if (!roomCode) return;

  const { room, isEmpty } = gameManager.leaveRoom(socket.id);
  if (!room) return;

  socket.leave(roomCode);

  if (!isEmpty) {
    const players = room.players.map(p => p.toJSON());
    socket.to(roomCode).emit('player_left', {
      playerId: socket.id,
      players,
    });
  }
}

// ゲームを進行
function advanceGame(io: TypedServer, room: ReturnType<typeof gameManager.getPlayerRoom>): void {
  if (!room || !room.gameState) return;

  const gameState = room.advanceTurn();

  if (gameState.phase === 'dealerTurn') {
    // 親のターン（自動プレイ：とりあえず止める）
    const dealer = gameState.players.find(p => p.isDealer);
    if (dealer) {
      // 親のAIロジック（簡易版：4以下なら引く）
      if (dealer.handTotal <= 4 && dealer.hand.length < 3) {
        const card = room.drawCard(dealer.id);
        if (card !== null) {
          io.to(room.code).emit('card_drawn', {
            playerId: dealer.id,
            card,
            gameState: room.gameState,
          });
        }
      }

      room.stand(dealer.id);
      room.advanceTurn();
    }
  }

  if (room.gameState.phase === 'result') {
    const result = room.calculateRoundResult();
    io.to(room.code).emit('round_ended', {
      result,
      gameState: room.gameState,
    });
  } else if (room.gameState.currentTurnPlayerId) {
    io.to(room.code).emit('turn_changed', {
      currentPlayerId: room.gameState.currentTurnPlayerId,
      gameState: room.gameState,
    });
  }
}

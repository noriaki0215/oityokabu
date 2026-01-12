// ゲーム開始 API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, setRoom, createDeck, PlayerInGameData, GameStateData } from '../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomCode, playerId } = req.body;

    const room = await getRoom(roomCode);
    if (!room) {
      return res.status(404).json({ error: '部屋が見つかりません' });
    }

    if (room.hostId !== playerId) {
      return res.status(403).json({ error: 'ホストのみゲームを開始できます' });
    }

    if (room.players.length < 2) {
      return res.status(400).json({ error: '2人以上必要です' });
    }

    // デッキ作成
    const deck = createDeck();

    // プレイヤーをゲーム用に変換
    const playersInGame: PlayerInGameData[] = room.players.map((p, index) => ({
      ...p,
      isDealer: index === room.dealerIndex,
      hand: [],
      bet: 0,
      isStand: false,
      handTotal: 0,
      roundResult: 0,
      role: undefined,
    }));

    const gameState: GameStateData = {
      phase: 'betting',
      roundNumber: 1,
      fieldCard: null,
      currentTurnIndex: -1,
      deck,
      players: playersInGame,
      dealerId: room.players[room.dealerIndex].id,
    };

    room.gameState = gameState;
    await setRoom(roomCode, room);

    return res.status(200).json({ gameState });
  } catch (error) {
    console.error('Error starting game:', error);
    return res.status(500).json({ error: 'Failed to start game' });
  }
}

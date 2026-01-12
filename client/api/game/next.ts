// 次のラウンド API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, setRoom, createDeck, PlayerInGameData, GameStateData } from '../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomCode } = req.body;

    const room = await getRoom(roomCode);
    if (!room || !room.gameState) {
      return res.status(404).json({ error: '部屋またはゲームが見つかりません' });
    }

    // 親を交代
    room.dealerIndex = (room.dealerIndex + 1) % room.players.length;

    // デッキ作成
    const deck = createDeck();

    // プレイヤーをリセット
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
      roundNumber: room.gameState.roundNumber + 1,
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
    console.error('Error starting next round:', error);
    return res.status(500).json({ error: 'Failed to start next round' });
  }
}

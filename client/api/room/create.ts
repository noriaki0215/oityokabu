// 部屋作成 API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis, generateRoomCode, setRoom, getRoom, RoomData, PlayerData } from '../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nickname, playerId } = req.body;

    if (!nickname || !playerId) {
      return res.status(400).json({ error: 'nickname and playerId are required' });
    }

    // ユニークな部屋コードを生成
    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await getRoom(code);
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const player: PlayerData = {
      id: playerId,
      nickname,
      chips: 100,
      totalResult: 0,
      isHost: true,
      isDealer: false,
    };

    const room: RoomData = {
      code,
      players: [player],
      hostId: playerId,
      gameState: null,
      dealerIndex: 0,
    };

    await setRoom(code, room);

    return res.status(200).json({
      roomCode: code,
      player,
      players: [player],
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ error: 'Failed to create room' });
  }
}

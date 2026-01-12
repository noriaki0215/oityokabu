// 累積リセット API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, setRoom } from '../lib/redis';

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
      return res.status(403).json({ error: 'ホストのみリセットできます' });
    }

    // 全員のチップと累積をリセット
    for (const player of room.players) {
      player.chips = 100;
      player.totalResult = 0;
    }

    if (room.gameState) {
      for (const player of room.gameState.players) {
        player.chips = 100;
        player.totalResult = 0;
      }
      room.gameState.roundNumber = 1;
    }

    await setRoom(roomCode, room);

    return res.status(200).json({ players: room.players });
  } catch (error) {
    console.error('Error resetting stats:', error);
    return res.status(500).json({ error: 'Failed to reset stats' });
  }
}

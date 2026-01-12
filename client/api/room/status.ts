// 部屋状態取得 API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom } from '../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const room = await getRoom(code.toUpperCase());
    if (!room) {
      return res.status(404).json({ error: '部屋が見つかりません' });
    }

    // deckは隠す（カードの順番がバレないように）
    const gameState = room.gameState ? {
      ...room.gameState,
      deck: undefined,
    } : null;

    return res.status(200).json({
      room: {
        code: room.code,
        players: room.players,
        hostId: room.hostId,
        gameState,
      },
    });
  } catch (error) {
    console.error('Error getting room:', error);
    return res.status(500).json({ error: 'Failed to get room' });
  }
}

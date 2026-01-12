// 部屋参加 API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, setRoom, PlayerData } from '../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomCode, nickname, playerId } = req.body;

    if (!roomCode || !nickname || !playerId) {
      return res.status(400).json({ error: 'roomCode, nickname, and playerId are required' });
    }

    const room = await getRoom(roomCode.toUpperCase());
    if (!room) {
      return res.status(404).json({ error: '部屋が見つかりません' });
    }

    if (room.players.length >= 6) {
      return res.status(400).json({ error: '部屋が満員です' });
    }

    if (room.gameState && room.gameState.phase !== 'waiting') {
      return res.status(400).json({ error: 'ゲーム進行中です' });
    }

    // 既に参加しているか確認
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer) {
      return res.status(200).json({
        roomCode: room.code,
        player: existingPlayer,
        players: room.players,
      });
    }

    const player: PlayerData = {
      id: playerId,
      nickname,
      chips: 100,
      totalResult: 0,
      isHost: false,
      isDealer: false,
    };

    room.players.push(player);
    await setRoom(room.code, room);

    return res.status(200).json({
      roomCode: room.code,
      player,
      players: room.players,
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return res.status(500).json({ error: 'Failed to join room' });
  }
}

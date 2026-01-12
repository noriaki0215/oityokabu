// ベット API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, setRoom, calculateHandTotal } from '../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomCode, playerId, amount } = req.body;

    const room = await getRoom(roomCode);
    if (!room || !room.gameState) {
      return res.status(404).json({ error: '部屋またはゲームが見つかりません' });
    }

    if (room.gameState.phase !== 'betting') {
      return res.status(400).json({ error: 'ベットフェーズではありません' });
    }

    const player = room.gameState.players.find(p => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'プレイヤーが見つかりません' });
    }

    if (player.isDealer) {
      return res.status(400).json({ error: '親はベットできません' });
    }

    if (amount > player.chips || amount < 1) {
      return res.status(400).json({ error: '無効なベット額です' });
    }

    player.bet = amount;

    // 全員がベットしたかチェック
    const nonDealers = room.gameState.players.filter(p => !p.isDealer);
    const allBet = nonDealers.every(p => p.bet > 0);

    if (allBet) {
      // カードを配る
      const deck = room.gameState.deck;
      
      // 場札
      room.gameState.fieldCard = deck.pop()!;

      // 各プレイヤーに2枚ずつ
      for (const p of room.gameState.players) {
        p.hand = [deck.pop()!, deck.pop()!];
        p.handTotal = calculateHandTotal(p.hand);
      }

      room.gameState.deck = deck;
      room.gameState.phase = 'playerTurn';
      
      // 最初の子プレイヤーのターン
      const firstNonDealer = room.gameState.players.findIndex(p => !p.isDealer);
      room.gameState.currentTurnIndex = firstNonDealer;
    }

    await setRoom(roomCode, room);

    return res.status(200).json({ gameState: room.gameState });
  } catch (error) {
    console.error('Error placing bet:', error);
    return res.status(500).json({ error: 'Failed to place bet' });
  }
}

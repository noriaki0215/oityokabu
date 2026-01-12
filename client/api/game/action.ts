// アクション（引く/止める）API
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, setRoom, calculateHandTotal, PlayerInGameData } from '../lib/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomCode, playerId, action } = req.body; // action: 'draw' | 'stand'

    const room = await getRoom(roomCode);
    if (!room || !room.gameState) {
      return res.status(404).json({ error: '部屋またはゲームが見つかりません' });
    }

    const gs = room.gameState;
    
    if (gs.phase !== 'playerTurn' && gs.phase !== 'dealerTurn') {
      return res.status(400).json({ error: 'アクションフェーズではありません' });
    }

    const currentPlayer = gs.players[gs.currentTurnIndex];
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return res.status(400).json({ error: 'あなたのターンではありません' });
    }

    if (action === 'draw') {
      if (currentPlayer.hand.length >= 3) {
        return res.status(400).json({ error: 'これ以上引けません' });
      }
      const card = gs.deck.pop()!;
      currentPlayer.hand.push(card);
      currentPlayer.handTotal = calculateHandTotal(currentPlayer.hand);
      
      if (currentPlayer.hand.length >= 3) {
        currentPlayer.isStand = true;
      }
    } else if (action === 'stand') {
      currentPlayer.isStand = true;
    }

    // 次のターンへ
    advanceTurn(room);

    await setRoom(roomCode, room);

    return res.status(200).json({ 
      gameState: room.gameState,
      roundResult: gs.phase === 'result' ? calculateResult(room) : null,
    });
  } catch (error) {
    console.error('Error performing action:', error);
    return res.status(500).json({ error: 'Failed to perform action' });
  }
}

function advanceTurn(room: any) {
  const gs = room.gameState;
  
  if (gs.phase === 'playerTurn') {
    // 次のスタンドしていないプレイヤーを探す
    const nonDealers = gs.players.map((p: PlayerInGameData, i: number) => ({ p, i })).filter((x: any) => !x.p.isDealer);
    const allStand = nonDealers.every((x: any) => x.p.isStand);
    
    if (allStand) {
      // 親のターンへ
      gs.phase = 'dealerTurn';
      gs.currentTurnIndex = gs.players.findIndex((p: PlayerInGameData) => p.isDealer);
      
      // 親のAI: 4以下なら引く
      const dealer = gs.players[gs.currentTurnIndex];
      if (dealer.handTotal <= 4 && dealer.hand.length < 3) {
        const card = gs.deck.pop();
        if (card) {
          dealer.hand.push(card);
          dealer.handTotal = calculateHandTotal(dealer.hand);
        }
      }
      dealer.isStand = true;
      gs.phase = 'result';
    } else {
      // 次のプレイヤー
      let nextIndex = gs.currentTurnIndex;
      do {
        nextIndex = (nextIndex + 1) % gs.players.length;
      } while (gs.players[nextIndex].isDealer || gs.players[nextIndex].isStand);
      gs.currentTurnIndex = nextIndex;
    }
  } else if (gs.phase === 'dealerTurn') {
    gs.phase = 'result';
  }
}

function calculateResult(room: any) {
  const gs = room.gameState;
  const dealer = gs.players.find((p: PlayerInGameData) => p.isDealer);
  
  // 役のチェックと勝敗判定
  for (const player of gs.players) {
    if (player.isDealer) continue;
    
    checkRole(player, gs.fieldCard);
    checkRole(dealer, gs.fieldCard);
    
    const result = compareHands(player, dealer);
    
    if (result === 'win') {
      const multiplier = getMultiplier(player.role);
      player.roundResult = player.bet * multiplier;
    } else if (result === 'lose') {
      const multiplier = getMultiplier(dealer.role);
      player.roundResult = -player.bet * multiplier;
    } else {
      player.roundResult = 0;
    }
    
    player.chips += player.roundResult;
    player.totalResult += player.roundResult;
    
    // 元のプレイヤーも更新
    const orig = room.players.find((p: any) => p.id === player.id);
    if (orig) {
      orig.chips = player.chips;
      orig.totalResult = player.totalResult;
    }
  }
  
  // 親の収支
  dealer.roundResult = -gs.players.filter((p: PlayerInGameData) => !p.isDealer).reduce((sum: number, p: PlayerInGameData) => sum + p.roundResult, 0);
  dealer.chips += dealer.roundResult;
  dealer.totalResult += dealer.roundResult;
  
  const origDealer = room.players.find((p: any) => p.id === dealer.id);
  if (origDealer) {
    origDealer.chips = dealer.chips;
    origDealer.totalResult = dealer.totalResult;
  }
  
  return {
    roundNumber: gs.roundNumber,
    dealerTotal: dealer.handTotal,
    dealerRole: dealer.role,
    playerResults: gs.players.filter((p: PlayerInGameData) => !p.isDealer).map((p: PlayerInGameData) => ({
      playerId: p.id,
      nickname: p.nickname,
      handTotal: p.handTotal,
      role: p.role,
      roundResult: p.roundResult,
      totalResult: p.totalResult,
      chips: p.chips,
      isWin: p.roundResult > 0,
      isDraw: p.roundResult === 0,
    })),
  };
}

function checkRole(player: PlayerInGameData, fieldCard: number) {
  if (player.hand.length === 3 && player.hand[0] === player.hand[1] && player.hand[1] === player.hand[2]) {
    player.role = 'arashi';
  } else if (player.hand.length === 2 && player.hand[0] === 1 && fieldCard === 4) {
    player.role = 'shippin';
  } else if (player.hand.length === 2 && player.hand[0] === 1 && fieldCard === 9) {
    player.role = 'kuppin';
  } else if (player.handTotal === 9) {
    player.role = 'kabu';
  }
}

function compareHands(player: PlayerInGameData, dealer: PlayerInGameData): 'win' | 'lose' | 'draw' {
  const pPriority = getRolePriority(player.role);
  const dPriority = getRolePriority(dealer.role);
  
  if (pPriority > dPriority) return 'win';
  if (pPriority < dPriority) return 'lose';
  if (player.handTotal > dealer.handTotal) return 'win';
  if (player.handTotal < dealer.handTotal) return 'lose';
  return 'draw';
}

function getRolePriority(role?: string): number {
  if (role === 'arashi') return 3;
  if (role === 'shippin' || role === 'kuppin') return 2;
  if (role === 'kabu') return 1;
  return 0;
}

function getMultiplier(role?: string): number {
  if (role === 'arashi') return 3;
  if (role === 'shippin' || role === 'kuppin') return 2;
  return 1;
}

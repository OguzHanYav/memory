import type { CardData, GameStatus, PlayerColor } from '../core/types';

export class GameState {
  cards: CardData[] = [];

  status: GameStatus = 'idle';
  lockInput = false;

  moves = 0;

  blueMatches = 0;
  orangeMatches = 0;

  currentPlayer: PlayerColor = 'blue';

  firstPickId: string | null = null;
  secondPickId: string | null = null;

  resetPicks() {
    this.firstPickId = null;
    this.secondPickId = null;
  }

  switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === 'blue' ? 'orange' : 'blue';
  }
}
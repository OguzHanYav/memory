import type { CardData, GameStatus, PlayerColor } from '../core/types';

// ============================================
// GAME STATE CLASS
// ============================================

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

  /** Setzt die aktuellen Picks zurück */
  resetPicks(): void {
    this.firstPickId = null;
    this.secondPickId = null;
  }

  /** Wechselt den aktuellen Spieler */
  switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 'blue' ? 'orange' : 'blue';
  }
}
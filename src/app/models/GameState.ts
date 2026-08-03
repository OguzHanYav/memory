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

  /**
   * Resets the current pick selections.
   * @remarks
   * Called after a match is evaluated or when a turn ends.
   */
  resetPicks(): void {
    this.firstPickId = null;
    this.secondPickId = null;
  }

  /**
   * Switches the current player to the other player.
   * @remarks
   * Called after a mismatch to give the turn to the other player.
   */
  switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 'blue' ? 'orange' : 'blue';
  }
}
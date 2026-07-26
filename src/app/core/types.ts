// ============================================
// CORE TYPES
// ============================================

export type CardState = 'hidden' | 'revealed' | 'matched';
export type GameStatus = 'idle' | 'running' | 'won';

export type GridSize = 16 | 24 | 36;
export type ThemeId = 'code' | 'games' | 'da' | 'food';
export type PlayerColor = 'blue' | 'orange';

// ============================================
// INTERFACES
// ============================================

export interface GameConfig {
  gridSize: GridSize;
  theme: ThemeId;
  startingPlayer: PlayerColor;
  pairs: number;
  flipBackDelayMs: number;
}

export interface CardData {
  id: string;
  pairId: string;
  backSrc: string;
  frontSrc: string;
  state: CardState;
}
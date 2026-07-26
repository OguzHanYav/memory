import type { GameConfig } from './types';

/** Standard-Konfiguration für das Spiel */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  gridSize: 16,
  theme: 'code',
  startingPlayer: 'blue',
  pairs: 8,
  flipBackDelayMs: 700,
};
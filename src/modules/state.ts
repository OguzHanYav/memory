import type { GridSize, ThemeId, PlayerColor } from '../app/core/types';

export const state = {
  selectedTheme: 'code' as ThemeId,
  selectedGrid: 16 as GridSize,
  selectedPlayer: 'blue' as PlayerColor,
  hoveredTheme: null as ThemeId | null,
};
import type { GridSize, ThemeId, PlayerColor } from '../app/core/types';

export const state = {
  selectedTheme: null as ThemeId | null,
  selectedGrid: null as GridSize | null,
  selectedPlayer: null as PlayerColor | null,
  hoveredTheme: null as ThemeId | null,
};

/**
 * Resets the entire state to null values.
 */
export function resetState(): void {
  state.selectedTheme = null;
  state.selectedGrid = null;
  state.selectedPlayer = null;
  state.hoveredTheme = null;
}
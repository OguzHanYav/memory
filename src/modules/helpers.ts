import type { GridSize, ThemeId } from '../app/core/types';

export function pairsFromGrid(grid: GridSize): number {
  return grid / 2;
}

export function showScreen(id: 'home' | 'settings' | 'game' | 'result'): void {
  const screens = {
    home: document.getElementById('screen-home'),
    settings: document.getElementById('screen-settings'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result'),
  };
  Object.values(screens).forEach((el) => el?.classList.remove('screen--active'));
  const target = screens[id];
  if (target) target.classList.add('screen--active');
}

export function getCurrentPlayerIcon(theme: ThemeId, player: 'blue' | 'orange'): string {
  if (theme === 'code') {
    return player === 'blue'
      ? './assets/Settings/topbar/label.svg'
      : './assets/Settings/topbar/label-orange.svg';
  }
  return './assets/game-hud/chess_pawn_current_player.svg';
}
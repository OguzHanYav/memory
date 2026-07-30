import { GameController } from '../app/controllers/GameController';
import { Renderer } from '../app/ui/Renderer';
import { state } from './state';
import { pairsFromGrid, showScreen } from './helpers';
import { updateHudIcons, updateResultBackText, renderGameUi } from './hud';
import { EXIT_ICONS } from './constants';
import type { ThemeId } from '../app/core/types';

function applyGameThemeClasses(theme: ThemeId): void {
  const gameScreen = document.getElementById('screen-game') as HTMLElement;
  const resultScreen = document.getElementById('screen-result') as HTMLElement;
  if (gameScreen) {
    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${theme}`);
  }
  if (resultScreen) {
    resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    resultScreen.classList.add(`theme-${theme}`);
  }
}

function updateGamePreviewIcon(theme: ThemeId): void {
  const previewExitIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (previewExitIcon) previewExitIcon.src = EXIT_ICONS[theme];
}

function configureAndStartGame(renderer: Renderer, game: GameController): void {
  const theme = state.selectedTheme;
  const grid = state.selectedGrid;
  const player = state.selectedPlayer;

  game.updateConfig({
    theme: theme,
    gridSize: grid,
    startingPlayer: player,
    pairs: pairsFromGrid(grid),
    flipBackDelayMs: 700,
  });
  game.startNewGame();
  renderGameUi(game);
  showScreen('game');
}

export function startGameFromSettings(renderer: Renderer, game: GameController): void {
  const theme = state.selectedTheme;
  const grid = state.selectedGrid;

  renderer.setTheme(theme);
  renderer.setGrid(grid);

  applyGameThemeClasses(theme);
  updateHudIcons(theme);
  updateResultBackText(theme);
  updateGamePreviewIcon(theme);

  configureAndStartGame(renderer, game);
}
import { GameController } from '../app/controllers/gameController';
import { Renderer } from '../app/ui/renderer';
import { state } from './state';
import { pairsFromGrid, showScreen } from './helpers';
import { updateHudIcons, updateResultBackText, renderGameUi } from './hud';
import { EXIT_ICONS } from './constants';
import type { ThemeId } from '../app/core/types';

/**
 * Applies theme classes to game and result screens.
 * @param theme - The theme to apply
 */
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

/**
 * Updates the preview exit icon based on the current theme.
 * @param theme - The current theme
 */
function updateGamePreviewIcon(theme: ThemeId): void {
  const previewExitIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (previewExitIcon) previewExitIcon.src = EXIT_ICONS[theme];
}

/**
 * Configures and starts the game with current settings.
 * @param renderer - The renderer instance
 * @param game - The game controller instance
 */
function configureAndStartGame(renderer: Renderer, game: GameController): void {
  const theme = state.selectedTheme;
  const grid = state.selectedGrid;
  const player = state.selectedPlayer;

  // Fallback values if not selected (should not happen if button is disabled)
  const safeTheme = theme || 'code';
  const safeGrid = grid || 16;
  const safePlayer = player || 'blue';

  game.updateConfig({
    theme: safeTheme,
    gridSize: safeGrid,
    startingPlayer: safePlayer,
    pairs: pairsFromGrid(safeGrid),
    flipBackDelayMs: 700,
  });
  game.startNewGame();
  renderGameUi(game);
  showScreen('game');
}

/**
 * Starts the game from the settings screen.
 * @param renderer - The renderer instance
 * @param game - The game controller instance
 */
export function startGameFromSettings(renderer: Renderer, game: GameController): void {
  const theme = state.selectedTheme || 'code';
  const grid = state.selectedGrid || 16;

  renderer.setTheme(theme);
  renderer.setGrid(grid);

  applyGameThemeClasses(theme);
  updateHudIcons(theme, game, renderer);
  updateResultBackText(theme);
  updateGamePreviewIcon(theme);

  configureAndStartGame(renderer, game);
}
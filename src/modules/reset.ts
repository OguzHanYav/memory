import { GameController } from '../app/controllers/gameController';
import { Renderer } from '../app/ui/renderer';
import { state } from './state';
import { pairsFromGrid, showScreen } from './helpers';

/**
 * Clears the game board.
 */
function resetBoard(): void {
  const field = document.getElementById('field');
  if (field) field.innerHTML = '';
}

/**
 * Removes all theme classes from body and screens.
 */
function resetAllThemeClasses(): void {
  document.body.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
  const gameScreen = document.getElementById('screen-game');
  const resultScreen = document.getElementById('screen-result');
  if (gameScreen) gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
  if (resultScreen) {
    resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    resultScreen.classList.remove(
      'result-screen--winner-blue',
      'result-screen--winner-orange',
      'result-screen--draw',
      'result-screen--gameover'
    );
  }
}

/**
 * Resets the game configuration and starts a new game.
 * @param game - The game controller instance
 * @param renderer - The renderer instance
 */
function resetGameConfig(game: GameController, renderer: Renderer): void {
  const DEFAULT_THEME = 'code';
  const safeGrid = state.selectedGrid || 16;
  const safePlayer = state.selectedPlayer || 'blue';
  
  renderer.setTheme(DEFAULT_THEME);
  game.updateConfig({
    theme: DEFAULT_THEME,
    gridSize: safeGrid,
    startingPlayer: safePlayer,
    pairs: pairsFromGrid(safeGrid),
    flipBackDelayMs: 700,
  });
  game.startNewGame();
}

/**
 * Resets the score display to default values.
 */
function resetScoreDisplay(): void {
  const blueScoreEl = document.getElementById('blueScore');
  const orangeScoreEl = document.getElementById('orangeScore');
  const isCode = state.selectedTheme === 'code';
  if (blueScoreEl) blueScoreEl.textContent = isCode ? 'Blue 0' : '0';
  if (orangeScoreEl) orangeScoreEl.textContent = isCode ? 'Orange 0' : '0';
}

/**
 * Resets the result screen scores to default values.
 */
function resetResultScores(): void {
  const resultBlueScore = document.getElementById('result-blue-score');
  const resultOrangeScore = document.getElementById('result-orange-score');
  if (resultBlueScore) resultBlueScore.textContent = 'Blue 0';
  if (resultOrangeScore) resultOrangeScore.textContent = 'Orange 0';
}

/**
 * Resets the current player icon to default.
 */
function resetCurrentPlayerIcon(): void {
  const img = document.getElementById('currentPlayerImg') as HTMLImageElement;
  if (img) {
    img.src = './assets/Settings/topbar/label-blue.svg';
    img.classList.remove('player-blue', 'player-orange');
    img.classList.add('player-blue');
  }
}

/**
 * Resets result back buttons to default text.
 */
function resetResultBackButtons(): void {
  const ids = ['result-back-text', 'draw-back-text', 'gameover-back-text'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = 'Back to start';
  });
}

/**
 * Resets exit icons to default values.
 */
function resetExitIcons(): void {
  const exitIcon = document.getElementById('exitGameIcon') as HTMLImageElement;
  const previewIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (exitIcon) exitIcon.src = './assets/Settings/topbar/move_item.svg';
  if (previewIcon) previewIcon.src = './assets/Settings/topbar/move_item.svg';
}

/**
 * Resets preview images to default code theme.
 */
function resetPreviewImages(): void {
  const main = document.getElementById('preview-img-main') as HTMLImageElement;
  const sub = document.getElementById('preview-img-sub') as HTMLImageElement;
  if (main) main.src = './assets/Settings/Cards 5/Cards 5_2.svg';
  if (sub) sub.src = './assets/Settings/Cards 5/Cards 5.svg';
}

/**
 * Resets preview theme root to default code theme.
 */
function resetPreviewThemeRoot(): void {
  const root = document.getElementById('theme-preview');
  if (root) {
    root.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    root.classList.add('preview--code');
  }
}

/**
 * Resets exit popup texts to default values.
 */
function resetExitPopupTexts(): void {
  const back = document.getElementById('back-to-game-text');
  const confirm = document.getElementById('confirm-exit-text');
  if (back) back.textContent = 'Back to game';
  if (confirm) confirm.textContent = 'Exit game';
}

/**
 * Resets the game and returns to the home screen.
 * @param game - The game controller instance
 * @param renderer - The renderer instance
 */
export function resetAndRestartGame(game: GameController, renderer: Renderer): void {
  resetBoard();
  resetAllThemeClasses();
  resetGameConfig(game, renderer);
  resetScoreDisplay();
  resetResultScores();
  resetCurrentPlayerIcon();
  resetResultBackButtons();
  resetExitIcons();
  resetPreviewImages();
  resetPreviewThemeRoot();
  resetExitPopupTexts();
  showScreen('home');
}
import { GameController } from '../app/controllers/gameController';
import { Renderer } from '../app/ui/renderer';
import { state, resetState } from './state';
import { pairsFromGrid, showScreen } from './helpers';

function resetBoard(): void {
  const field = document.getElementById('field');
  if (field) field.innerHTML = '';
}

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

function hideResultBlocks(): void {
  const resultGameover = document.getElementById('result-gameover');
  const resultWinner = document.getElementById('result-winner');
  const resultDraw = document.getElementById('result-draw');
  if (resultGameover) resultGameover.style.display = 'none';
  if (resultWinner) resultWinner.style.display = 'none';
  if (resultDraw) resultDraw.style.display = 'none';
}

function resetGameConfig(game: GameController, renderer: Renderer): void {
  const DEFAULT_THEME = 'code';
  const DEFAULT_GRID = 16;
  const DEFAULT_PLAYER = 'blue';
  renderer.setTheme(DEFAULT_THEME);
  renderer.setGrid(DEFAULT_GRID);
  game.updateConfig({
    theme: DEFAULT_THEME,
    gridSize: DEFAULT_GRID,
    startingPlayer: DEFAULT_PLAYER,
    pairs: pairsFromGrid(DEFAULT_GRID),
    flipBackDelayMs: 700,
  });
  game.startNewGame();
}

function resetScoreDisplay(): void {
  const blueScoreEl = document.getElementById('blueScore');
  const orangeScoreEl = document.getElementById('orangeScore');
  if (blueScoreEl) blueScoreEl.textContent = 'Blue 0';
  if (orangeScoreEl) orangeScoreEl.textContent = 'Orange 0';
}

function resetResultScores(): void {
  const resultBlueScore = document.getElementById('result-blue-score');
  const resultOrangeScore = document.getElementById('result-orange-score');
  if (resultBlueScore) resultBlueScore.textContent = 'Blue 0';
  if (resultOrangeScore) resultOrangeScore.textContent = 'Orange 0';
}

function resetCurrentPlayerIcon(): void {
  const img = document.getElementById('currentPlayerImg') as HTMLImageElement;
  if (img) {
    img.src = './assets/Settings/topbar/label-blue.svg';
    img.classList.remove('player-blue', 'player-orange');
    img.classList.add('player-blue');
  }
}

function resetResultBackButtons(): void {
  const ids = ['result-back-text', 'draw-back-text', 'gameover-back-text'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = 'Back to start';
  });
}

function resetExitIcons(): void {
  const exitIcon = document.getElementById('exitGameIcon') as HTMLImageElement;
  const previewIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (exitIcon) exitIcon.src = './assets/Settings/topbar/move_item.svg';
  if (previewIcon) previewIcon.src = './assets/Settings/topbar/move_item.svg';
}

function resetPreviewImages(): void {
  const main = document.getElementById('preview-img-main') as HTMLImageElement;
  const sub = document.getElementById('preview-img-sub') as HTMLImageElement;
  if (main) main.src = './assets/Settings/Cards 5/Cards 5_2.svg';
  if (sub) sub.src = './assets/Settings/Cards 5/Cards 5.svg';
}

function resetPreviewThemeRoot(): void {
  const root = document.getElementById('theme-preview');
  if (root) {
    root.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    root.classList.add('preview--code');
  }
}

function resetExitPopupTexts(): void {
  const back = document.getElementById('back-to-game-text');
  const confirm = document.getElementById('confirm-exit-text');
  if (back) back.textContent = 'Back to game';
  if (confirm) confirm.textContent = 'Exit game';
}

function resetAllRadioButtons(): void {
  document.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });
}

function disableStartButton(): void {
  const startBtn = document.getElementById('btn-start-game') as HTMLButtonElement;
  if (startBtn) startBtn.disabled = true;
}

function performFullReset(game: GameController, renderer: Renderer): void {
  resetBoard();
  resetAllThemeClasses();
  hideResultBlocks();
  resetGameConfig(game, renderer);
  resetScoreDisplay();
  resetResultScores();
  resetCurrentPlayerIcon();
  resetResultBackButtons();
  resetExitIcons();
  resetPreviewImages();
  resetPreviewThemeRoot();
  resetExitPopupTexts();
  resetState();
  resetAllRadioButtons();
  disableStartButton();
}

export function resetAndRestartGame(game: GameController, renderer: Renderer): void {
  performFullReset(game, renderer);
  showScreen('home');
}

export function resetAndGoToSettings(game: GameController, renderer: Renderer): void {
  performFullReset(game, renderer);
  showScreen('settings');
}
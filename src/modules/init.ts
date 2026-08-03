import { assertEl } from '../app/utils/dom';
import { Renderer } from '../app/ui/renderer';
import { GameController } from '../app/controllers/gameController';
import { state } from './state';
import { pairsFromGrid, showScreen } from './helpers';
import { resetAndRestartGame } from './reset';
import { startGameFromSettings } from './game';
import { renderGameUi } from './hud';
import { updateThemePreview } from './theme';
import { handleGameWin } from './win';
import { testResultScreen } from './test';
import {
  setupThemeRadios,
  setupPlayerRadios,
  setupGridRadios,
  setupPreviewHover,
  setupBoardClick,
  setupKeyboardShortcuts,
} from './events';

function setupMainEventListeners(
  renderer: Renderer,
  game: GameController,
  btnGoSettings: HTMLButtonElement,
  btnStartGame: HTMLButtonElement,
  btnBackToGame: HTMLButtonElement,
  btnConfirmExit: HTMLButtonElement,
  btnResultBack: HTMLButtonElement,
  btnDrawBack: HTMLButtonElement,
  btnGameoverBack: HTMLButtonElement,
  exitModal: HTMLElement
): void {
  btnGoSettings.addEventListener('click', () => showScreen('settings'));
  btnStartGame.addEventListener('click', () => startGameFromSettings(renderer, game));
  btnBackToGame.addEventListener('click', () => { exitModal.style.display = 'none'; });
  btnConfirmExit.addEventListener('click', () => {
    exitModal.style.display = 'none';
    showScreen('settings');
    document.body.classList.remove('modal-open');
  });
  btnResultBack.addEventListener('click', () => resetAndRestartGame(game, renderer));
  btnDrawBack.addEventListener('click', () => resetAndRestartGame(game, renderer));
  btnGameoverBack.addEventListener('click', () => resetAndRestartGame(game, renderer));
}

function setupGameCallbacks(game: GameController): void {
  game.onStateChange(() => renderGameUi(game));
  game.onWin((payload) => handleGameWin(payload));
}

function initializeRendererAndUI(renderer: Renderer): void {
  updateThemePreview();
  renderer.setTheme(state.selectedTheme);
  renderer.setGrid(state.selectedGrid);
  showScreen('home');
}

function getMainButtons() {
  return {
    btnGoSettings: assertEl(document.getElementById('btn-go-settings'), 'Missing #btn-go-settings') as HTMLButtonElement,
    btnStartGame: assertEl(document.getElementById('btn-start-game'), 'Missing #btn-start-game') as HTMLButtonElement,
    btnBackToGame: assertEl(document.getElementById('btn-back-to-game'), 'Missing #btn-back-to-game') as HTMLButtonElement,
    btnConfirmExit: assertEl(document.getElementById('btn-confirm-exit'), 'Missing #btn-confirm-exit') as HTMLButtonElement,
    btnResultBack: assertEl(document.getElementById('btn-result-back'), 'Missing #btn-result-back') as HTMLButtonElement,
    btnDrawBack: assertEl(document.getElementById('btn-draw-back'), 'Missing #btn-draw-back') as HTMLButtonElement,
    btnGameoverBack: assertEl(document.getElementById('btn-gameover-back'), 'Missing #btn-gameover-back') as HTMLButtonElement,
    exitModal: assertEl(document.getElementById('modal-exit'), 'Missing #modal-exit') as HTMLElement,
  };
}

export function init(): void {
  const field = assertEl(document.getElementById('field'), 'Missing #field');
  const renderer = new Renderer(field);
  const game = new GameController(renderer, {
    theme: state.selectedTheme,
    gridSize: state.selectedGrid,
    startingPlayer: state.selectedPlayer,
    pairs: pairsFromGrid(state.selectedGrid),
    flipBackDelayMs: 700,
  });
  (window as any).game = game;
  setupGameCallbacks(game);
  initializeRendererAndUI(renderer);
  const buttons = getMainButtons();
  setupMainEventListeners(
    renderer,
    game,
    buttons.btnGoSettings,
    buttons.btnStartGame,
    buttons.btnBackToGame,
    buttons.btnConfirmExit,
    buttons.btnResultBack,
    buttons.btnDrawBack,
    buttons.btnGameoverBack,
    buttons.exitModal
  );
  setupThemeRadios(renderer);
  setupPlayerRadios();
  setupGridRadios(renderer);
  setupPreviewHover();
  setupBoardClick(game);
  setupKeyboardShortcuts();
  (window as any).testResultScreen = testResultScreen;
}
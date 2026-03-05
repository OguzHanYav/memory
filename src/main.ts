import './style/style.scss';

import { assertEl } from './app/utils/dom';
import { Renderer } from './app/ui/Renderer';
import { GameController } from './app/controllers/GameController';
import type { GridSize, ThemeId, PlayerColor } from './app/core/types';

function pairsFromGrid(grid: GridSize): number {
  return grid / 2;
}

function showScreen(id: 'home' | 'settings' | 'game') {
  const home = assertEl(document.getElementById('screen-home'), 'Missing #screen-home');
  const settings = assertEl(document.getElementById('screen-settings'), 'Missing #screen-settings');
  const game = assertEl(document.getElementById('screen-game'), 'Missing #screen-game');

  home.classList.toggle('screen--active', id === 'home');
  settings.classList.toggle('screen--active', id === 'settings');
  game.classList.toggle('screen--active', id === 'game');
}

function getCheckedValue(name: string): string {
  const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  if (!el) throw new Error(`Missing checked radio for "${name}"`);
  return el.value;
}

function init() {
  // Navigation buttons
  const btnGoSettings = assertEl(document.getElementById('btn-go-settings'), 'Missing #btn-go-settings');
  const btnStartGame = assertEl(document.getElementById('btn-start-game'), 'Missing #btn-start-game');
  const btnBackHome = assertEl(document.getElementById('btn-back-home'), 'Missing #btn-back-home');
  const btnToSettings = assertEl(document.getElementById('btn-to-settings'), 'Missing #btn-to-settings');

  // Game UI
  const field = assertEl(document.getElementById('field'), 'Missing #field');
  const movesEl = assertEl(document.getElementById('moves'), 'Missing #moves');
  const restartBtn = assertEl(document.getElementById('restart'), 'Missing #restart');

  // Topbar Players UI (Blue/Orange)
  const blueChip = assertEl(document.getElementById('blueChip'), 'Missing #blueChip');
  const orangeChip = assertEl(document.getElementById('orangeChip'), 'Missing #orangeChip');
  const blueScore = assertEl(document.getElementById('blueScore'), 'Missing #blueScore');
  const orangeScore = assertEl(document.getElementById('orangeScore'), 'Missing #orangeScore');

  // Modal
  const modal = assertEl(document.getElementById('modal-gameover'), 'Missing #modal-gameover');
  const modalMoves = assertEl(document.getElementById('modal-moves'), 'Missing #modal-moves');
  const modalWinner = assertEl(document.getElementById('modal-winner'), 'Missing #modal-winner');
  const modalPlayAgain = assertEl(document.getElementById('modal-play-again'), 'Missing #modal-play-again');
  const modalSettings = assertEl(document.getElementById('modal-settings'), 'Missing #modal-settings');

  // SETTINGS: Theme Preview (RIGHT SIDE)
  const preview = assertEl(document.getElementById('theme-preview'), 'Missing #theme-preview');
  const previewImgMain = assertEl(document.getElementById('preview-img-main') as HTMLImageElement | null, 'Missing #preview-img-main');
  const previewImgSub = assertEl(document.getElementById('preview-img-sub') as HTMLImageElement | null, 'Missing #preview-img-sub');

  const renderer = new Renderer(field);

  // Read initial settings from radios
  let selectedTheme = getCheckedValue('theme') as ThemeId;
  let selectedGrid = Number(getCheckedValue('grid')) as GridSize;
  let selectedStartingPlayer = getCheckedValue('startingPlayer') as PlayerColor;

  function updateThemePreview() {
    // right preview container theme class
    preview.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    preview.classList.add(`preview--${selectedTheme}`);

    // preview images (placeholder paths - you will replace)
    switch (selectedTheme) {
      case 'code':
        previewImgMain.src = 'public/assets/Settings/Cards 5/Cards 5_2.svg';
        previewImgSub.src = 'public/assets/Settings/Cards 5/Cards 5.svg';
        break;
      case 'games':
        previewImgMain.src = 'public/assets/Settings/Cards 5/Rectangle 40.svg';
        previewImgSub.src = 'public/assets/Settings/Cards 5/Front.svg';
        break;
      case 'da':
        previewImgMain.src = 'public/assets/Settings/Cards 5/Frame 727.svg';
        previewImgSub.src = 'public/assets/Settings/Cards 5/Frame 728.svg';
        break;
      case 'food':
        previewImgMain.src = 'public/assets/Settings/Cards 5/frond.svg';
        previewImgSub.src = 'public/assets/Settings/Cards 5/frond_2.svg';
        break;
    }
  }

  // Apply initial preview + theme (optional: body theme changes while in settings)
  renderer.setTheme(selectedTheme);
  renderer.setGrid(selectedGrid);
  updateThemePreview();

  const game = new GameController(renderer, {
    startingPlayer: selectedStartingPlayer,
    pairs: pairsFromGrid(selectedGrid),
    flipBackDelayMs: 700,
  });

  function renderMoves() {
    movesEl.textContent = String(game.state.moves);
  }

  function renderPlayers() {
    blueScore.textContent = String(game.state.blueMatches);
    orangeScore.textContent = String(game.state.orangeMatches);

    blueChip.classList.toggle('is-active', game.state.currentPlayer === 'blue');
    orangeChip.classList.toggle('is-active', game.state.currentPlayer === 'orange');
  }

  function openModal(payload: {
    moves: number;
    blueMatches: number;
    orangeMatches: number;
    winner: 'blue' | 'orange' | 'tie';
  }) {
    modalMoves.textContent = String(payload.moves);

    if (payload.winner === 'tie') {
      modalWinner.textContent = 'It’s a tie!';
    } else {
      modalWinner.textContent = payload.winner === 'blue' ? 'Blue wins!' : 'Orange wins!';
    }

    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  function startGameFromSettings() {
    // re-read (user might have changed radios)
    selectedTheme = getCheckedValue('theme') as ThemeId;
    selectedGrid = Number(getCheckedValue('grid')) as GridSize;
    selectedStartingPlayer = getCheckedValue('startingPlayer') as PlayerColor;

    // update preview + body theme
    renderer.setTheme(selectedTheme);
    renderer.setGrid(selectedGrid);
    updateThemePreview();

    game.updateConfig({
      startingPlayer: selectedStartingPlayer,
      pairs: pairsFromGrid(selectedGrid),
      flipBackDelayMs: 700,
    });

    closeModal();
    game.startNewGame();
    renderMoves();
    renderPlayers();
    showScreen('game');
  }

  // WIN event
  game.onWin((payload) => openModal(payload));

  // Live preview when changing THEME radios
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((input) => {
    input.addEventListener('change', () => {
      selectedTheme = getCheckedValue('theme') as ThemeId;
      renderer.setTheme(selectedTheme); // optional live theme change
      updateThemePreview();
    });
  });

  // Live grid preview (optional)
  document.querySelectorAll<HTMLInputElement>('input[name="grid"]').forEach((input) => {
    input.addEventListener('change', () => {
      selectedGrid = Number(getCheckedValue('grid')) as GridSize;
      renderer.setGrid(selectedGrid);
    });
  });

  // Starting player radios
  document.querySelectorAll<HTMLInputElement>('input[name="startingPlayer"]').forEach((input) => {
    input.addEventListener('change', () => {
      selectedStartingPlayer = getCheckedValue('startingPlayer') as PlayerColor;
    });
  });

  // Board click
  field.addEventListener('click', (e) => {
    const cardEl = (e.target as HTMLElement).closest<HTMLButtonElement>('.card');
    if (!cardEl) return;

    const id = cardEl.dataset.id;
    if (!id) return;

    const beforeMoves = game.state.moves;
    const beforeBlue = game.state.blueMatches;
    const beforeOrange = game.state.orangeMatches;
    const beforePlayer = game.state.currentPlayer;

    game.handleCardClick(id);

    if (game.state.moves !== beforeMoves) renderMoves();
    if (
      game.state.blueMatches !== beforeBlue ||
      game.state.orangeMatches !== beforeOrange ||
      game.state.currentPlayer !== beforePlayer
    ) {
      renderPlayers();
    }
  });

  // Buttons
  restartBtn.addEventListener('click', startGameFromSettings);

  modalPlayAgain.addEventListener('click', startGameFromSettings);
  modalSettings.addEventListener('click', () => {
    closeModal();
    showScreen('settings');
  });

  btnGoSettings.addEventListener('click', () => showScreen('settings'));
  btnBackHome.addEventListener('click', () => showScreen('home'));
  btnStartGame.addEventListener('click', startGameFromSettings);
  btnToSettings.addEventListener('click', () => showScreen('settings'));

  showScreen('home');
  (window as any).game = game;
}

init();
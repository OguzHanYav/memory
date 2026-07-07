import './style/style.scss';

import { assertEl } from './app/utils/dom';
import { Renderer } from './app/ui/Renderer';
import { GameController } from './app/controllers/GameController';
import type { GridSize, ThemeId, PlayerColor } from './app/core/types';

function pairsFromGrid(grid: GridSize): number {
  return grid / 2;
}

function showScreen(id: 'home' | 'settings' | 'game' | 'result') {
  const home = assertEl(document.getElementById('screen-home'), 'Missing #screen-home');
  const settings = assertEl(document.getElementById('screen-settings'), 'Missing #screen-settings');
  const game = assertEl(document.getElementById('screen-game'), 'Missing #screen-game');
  const result = assertEl(document.getElementById('screen-result'), 'Missing #screen-result');

  home.classList.toggle('screen--active', id === 'home');
  settings.classList.toggle('screen--active', id === 'settings');
  game.classList.toggle('screen--active', id === 'game');
  result.classList.toggle('screen--active', id === 'result');
}

function init() {
  // Screens
  const btnGoSettings = assertEl(document.getElementById('btn-go-settings'), 'Missing #btn-go-settings');
  const btnStartGame = assertEl(document.getElementById('btn-start-game'), 'Missing #btn-start-game');

  // Game UI
  const field = assertEl(document.getElementById('field'), 'Missing #field');
  const blueScoreEl = assertEl(document.getElementById('blueScore'), 'Missing #blueScore');
  const orangeScoreEl = assertEl(document.getElementById('orangeScore'), 'Missing #orangeScore');


  // Exit Modal Elements
  const exitModal = assertEl(document.getElementById('modal-exit'), 'Missing #modal-exit');
  const btnBackToGame = assertEl(document.getElementById('btn-back-to-game'), 'Missing #btn-back-to-game');
  const btnConfirmExit = assertEl(document.getElementById('btn-confirm-exit'), 'Missing #btn-confirm-exit');
  const btnExitGame = assertEl(document.getElementById('btn-exit-game'), 'Missing #btn-exit-game');

  // Result Screen Elements
  const resultScreen = assertEl(document.getElementById('screen-result'), 'Missing #screen-result');
  const resultGameover = assertEl(document.getElementById('result-gameover'), 'Missing #result-gameover');
  const resultWinner = assertEl(document.getElementById('result-winner'), 'Missing #result-winner');
  const resultDraw = assertEl(document.getElementById('result-draw'), 'Missing #result-draw');
  const resultBlueScore = assertEl(document.getElementById('result-blue-score'), 'Missing #result-blue-score');
  const resultOrangeScore = assertEl(document.getElementById('result-orange-score'), 'Missing #result-orange-score');
  const resultWinnerTitle = assertEl(document.getElementById('result-winner-title'), 'Missing #result-winner-title');
  const btnResultBack = assertEl(document.getElementById('btn-result-back'), 'Missing #btn-result-back');
  const btnDrawBack = assertEl(document.getElementById('btn-draw-back'), 'Missing #btn-draw-back');

  // Theme preview (right side)
  const previewRoot = assertEl(document.getElementById('theme-preview'), 'Missing #theme-preview');
  const previewImgMain = assertEl(
    document.getElementById('preview-img-main') as HTMLImageElement | null,
    'Missing #preview-img-main'
  );
  const previewImgSub = assertEl(
    document.getElementById('preview-img-sub') as HTMLImageElement | null,
    'Missing #preview-img-sub'
  );

  const renderer = new Renderer(field);

  // Defaults
  let selectedTheme: ThemeId = 'code';
  let selectedGrid: GridSize = 16;
  let selectedPlayer: PlayerColor = 'blue';
  // Current Player Image
  const currentPlayerImg = document.getElementById('currentPlayerImg') as HTMLImageElement;

  /**
   * Update Current Player indicator
   * @param player 'blue' | 'orange'
   */
  function updateCurrentPlayer(player: 'blue' | 'orange') {
    if (!currentPlayerImg) return;

    if (player === 'blue') {
      currentPlayerImg.src = 'public/assets/Settings/topbar/label.svg';
      currentPlayerImg.alt = 'Blue Player';
    } else {
      currentPlayerImg.src = 'public/assets/Settings/topbar/label-orange.svg';
      currentPlayerImg.alt = 'Orange Player';
    }
  }

const renderGameUi = (game: GameController) => {
    if (blueScoreEl) {
        blueScoreEl.textContent = `Blue ${game.state.blueMatches}`;
    }
    if (orangeScoreEl) {
        orangeScoreEl.textContent = `Orange ${game.state.orangeMatches}`;
    }

    // Update Current Player Image
    updateCurrentPlayer(game.state.currentPlayer);
};

  const updateThemePreview = () => {
    // Entferne alte Theme-Klassen
    previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');

    // Füge neue Theme-Klasse hinzu
    previewRoot.classList.add(`preview--${selectedTheme}`);

    // Setze die Kartenbilder
    switch (selectedTheme) {
      case 'code':
        previewImgMain.src = './assets/Settings/Cards 5/Cards 5_2.svg';
        previewImgSub.src = './assets/Settings/Cards 5/Cards 5.svg';
        break;
      case 'games':
        previewImgMain.src = './assets/Settings/Cards 5/Rectangle 40.svg';
        previewImgSub.src = './assets/Settings/Cards 5/Front.svg';
        break;
      case 'da':
        previewImgMain.src = './assets/Settings/Cards 5/Frame 727.svg';
        previewImgSub.src = './assets/Settings/Cards 5/Frame 728.svg';
        break;
      case 'food':
        previewImgMain.src = './assets/Settings/Cards 5/frond.svg';
        previewImgSub.src = './assets/Settings/Cards 5/frond_foods.svg';
        break;
    }
  };

  // Apply defaults
  renderer.setTheme(selectedTheme);
  renderer.setGrid(selectedGrid);
  updateThemePreview();

  const startGameFromSettings = () => {
    renderer.setTheme(selectedTheme);
    renderer.setGrid(selectedGrid);

    game.updateConfig({
      theme: selectedTheme,
      gridSize: selectedGrid,
      startingPlayer: selectedPlayer,
      pairs: pairsFromGrid(selectedGrid),
      flipBackDelayMs: 700,
    });

    game.startNewGame();
    renderGameUi(game);
    showScreen('game');
  };

  const game = new GameController(renderer, {
    theme: selectedTheme,
    gridSize: selectedGrid,
    startingPlayer: selectedPlayer,
    pairs: pairsFromGrid(selectedGrid),
    flipBackDelayMs: 700,
  });

  // State change callback für UI-Updates
  game.onStateChange(() => {
    renderGameUi(game);
  });

  game.onWin(({ blueMatches, orangeMatches, winner }) => {
    // Set scores
    resultBlueScore.textContent = String(blueMatches);
    resultOrangeScore.textContent = String(orangeMatches);

    // Reset all blocks
    resultGameover.style.display = 'block';
    resultWinner.style.display = 'none';
    resultDraw.style.display = 'none';

    // Remove old classes
    resultScreen.classList.remove('result-screen--winner-blue', 'result-screen--winner-orange', 'result-screen--draw');

    if (winner === 'blue') {
      resultScreen.classList.add('result-screen--winner-blue');
      resultWinnerTitle.textContent = 'BLUE PLAYER';
      resultWinner.style.display = 'block';
    } else if (winner === 'orange') {
      resultScreen.classList.add('result-screen--winner-orange');
      resultWinnerTitle.textContent = 'ORANGE PLAYER';
      resultWinner.style.display = 'block';
    } else if (winner === 'tie') {
      resultScreen.classList.add('result-screen--draw');
      resultDraw.style.display = 'block';
    }

    showScreen('result');
  });

  // Result Screen Back Buttons
  btnResultBack.addEventListener('click', () => {
    showScreen('home');
  });

  btnDrawBack.addEventListener('click', () => {
    showScreen('home');
  });

  // Exit Game - zeigt Popup an
  btnExitGame.addEventListener('click', () => {
    exitModal.style.display = 'flex';
  });

  // Popup Buttons
  btnBackToGame.addEventListener('click', () => {
    exitModal.style.display = 'none';
  });

  btnConfirmExit.addEventListener('click', () => {
    exitModal.style.display = 'none';
    showScreen('settings');
    document.body.classList.remove('modal-open');
  });

  // Navigation
  btnGoSettings.addEventListener('click', () => showScreen('settings'));
  btnStartGame.addEventListener('click', startGameFromSettings);

  // Theme radios
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const t = radio.value as ThemeId;
      if (!['code', 'games', 'da', 'food'].includes(t)) return;

      selectedTheme = t;
      renderer.setTheme(selectedTheme);
      updateThemePreview();
    });
  });

  // Player radios
  document.querySelectorAll<HTMLInputElement>('input[name="startingPlayer"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const p = radio.value as PlayerColor;
      if (!['blue', 'orange'].includes(p)) return;
      selectedPlayer = p;
    });
  });

  // Grid radios
  document.querySelectorAll<HTMLInputElement>('input[name="grid"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const g = Number(radio.value) as GridSize;
      if (![16, 24, 36].includes(g)) return;
      selectedGrid = g;
      renderer.setGrid(selectedGrid);
    });
  });

  // Board click delegation
  field.addEventListener('click', (e: MouseEvent) => {
    const cardEl = (e.target as HTMLElement).closest<HTMLButtonElement>('.card');
    if (!cardEl) return;

    const id = cardEl.dataset.id;
    if (!id) return;

    game.handleCardClick(id);
    // UI wird automatisch durch onStateChange aktualisiert
  });

  showScreen('home');

  (window as any).game = game;
}

init();
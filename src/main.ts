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

// ============================================
// THEME-SPEZIFISCHE HUD ICONS
// ============================================
const THEME_ICONS: Record<ThemeId, { blue: string; orange: string }> = {
  // CODE THEME: Original Icons
  code: {
    blue: 'public/assets/Settings/topbar/label.svg',
    orange: 'public/assets/Settings/topbar/label-orange.svg',
  },
  // GAMES THEME: Farbige Schachfiguren für Scores
  games: {
    blue: 'public/assets/game-hud/chess_pawn_blue.svg',
    orange: 'public/assets/game-hud/chess_pawn.svg',
  },
  // DA THEME: Farbige Schachfiguren für Scores
  da: {
    blue: 'public/assets/game-hud/chess_pawn_blue.svg',
    orange: 'public/assets/game-hud/chess_pawn.svg',
  },
  // FOOD THEME: Farbige Schachfiguren für Scores
  food: {
    blue: 'public/assets/game-hud/chess_pawn_blue.svg',
    orange: 'public/assets/game-hud/chess_pawn.svg',
  },
};

function init() {
  // Screens
  const btnGoSettings = assertEl(document.getElementById('btn-go-settings'), 'Missing #btn-go-settings');
  const btnStartGame = assertEl(document.getElementById('btn-start-game'), 'Missing #btn-start-game');

  // Game UI
  const field = assertEl(document.getElementById('field'), 'Missing #field');
  const blueScoreEl = assertEl(document.getElementById('blueScore'), 'Missing #blueScore');
  const orangeScoreEl = assertEl(document.getElementById('orangeScore'), 'Missing #orangeScore');

  // HUD Icons
  const blueIconImg = document.querySelector('.game-hud--preview-style .preview__scores img:first-of-type') as HTMLImageElement;
  const orangeIconImg = document.querySelector('.game-hud--preview-style .preview__scores img:last-of-type') as HTMLImageElement;
  const currentPlayerImg = document.getElementById('currentPlayerImg') as HTMLImageElement;

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

  const gameScreen = assertEl(document.getElementById('screen-game'), 'Missing #screen-game');

  const renderer = new Renderer(field);

  // Defaults
  let selectedTheme: ThemeId = 'code';
  let selectedGrid: GridSize = 16;
  let selectedPlayer: PlayerColor = 'blue';

  // ============================================
  // GAME INSTANCE
  // ============================================
  const game = new GameController(renderer, {
    theme: selectedTheme,
    gridSize: selectedGrid,
    startingPlayer: selectedPlayer,
    pairs: pairsFromGrid(selectedGrid),
    flipBackDelayMs: 700,
  });

  /**
   * Get Current Player Icon basierend auf Theme und Player
   */
  function getCurrentPlayerIcon(theme: ThemeId, player: 'blue' | 'orange'): string {
    // CODE THEME: Eigene Icons (farbig)
    if (theme === 'code') {
      return player === 'blue' 
        ? 'public/assets/Settings/topbar/label.svg'
        : 'public/assets/Settings/topbar/label-orange.svg';
    }
    
    // GAMES, DA, FOOD: Weiße Schachfigur
    return 'public/assets/game-hud/chess_pawn_current_player.svg';
  }

  /**
   * Update HUD Icons basierend auf Theme
   */
  function updateHudIcons(theme: ThemeId) {
    const icons = THEME_ICONS[theme];
    if (!icons) return;

    // Score Icons (farbig)
    if (blueIconImg) blueIconImg.src = icons.blue;
    if (orangeIconImg) orangeIconImg.src = icons.orange;

    // Current Player Icon
    const currentPlayer = game?.state?.currentPlayer || selectedPlayer;
    if (currentPlayerImg) {
      currentPlayerImg.src = getCurrentPlayerIcon(theme, currentPlayer);
      currentPlayerImg.classList.remove('player-blue', 'player-orange');
      currentPlayerImg.classList.add(`player-${currentPlayer}`);
    }
  }

  /**
   * Update Current Player indicator
   * @param player 'blue' | 'orange'
   */
  function updateCurrentPlayer(player: 'blue' | 'orange') {
    if (!currentPlayerImg) return;

    // Current Player Icon
    currentPlayerImg.src = getCurrentPlayerIcon(selectedTheme, player);
    currentPlayerImg.alt = player === 'blue' ? 'Blue Player' : 'Orange Player';

    currentPlayerImg.classList.remove('player-blue', 'player-orange');
    currentPlayerImg.classList.add(`player-${player}`);
  }

  const renderGameUi = (gameInstance: GameController) => {
    if (blueScoreEl && orangeScoreEl) {
      if (selectedTheme === 'code') {
        blueScoreEl.textContent = `Blue ${gameInstance.state.blueMatches}`;
        orangeScoreEl.textContent = `Orange ${gameInstance.state.orangeMatches}`;
      } else {
        blueScoreEl.textContent = `${gameInstance.state.blueMatches}`;
        orangeScoreEl.textContent = `${gameInstance.state.orangeMatches}`;
      }
    }

    updateCurrentPlayer(gameInstance.state.currentPlayer);
  };

  const updateThemePreview = () => {
    previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    previewRoot.classList.add(`preview--${selectedTheme}`);

    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${selectedTheme}`);

    updateHudIcons(selectedTheme);

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

    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${selectedTheme}`);

    updateHudIcons(selectedTheme);

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

  // State change callback für UI-Updates
  game.onStateChange(() => {
    renderGameUi(game);
  });

  game.onWin(({ blueMatches, orangeMatches, winner }) => {
    resultBlueScore.textContent = String(blueMatches);
    resultOrangeScore.textContent = String(orangeMatches);

    const resultScreenEl = document.getElementById('screen-result');
    if (resultScreenEl) {
      resultScreenEl.classList.remove(
        'result-screen--winner-blue',
        'result-screen--winner-orange',
        'result-screen--draw',
        'result-screen--gameover'
      );

      if (winner === 'tie') {
        resultScreenEl.classList.add('result-screen--draw');
      } else {
        resultScreenEl.classList.add(`result-screen--winner-${winner}`);
      }
    }

    resultGameover.style.display = '';
    resultWinner.style.display = '';
    resultDraw.style.display = '';

    if (winner !== 'tie') {
      resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
      resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
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
  });

  showScreen('home');

  (window as any).game = game;
}

init();
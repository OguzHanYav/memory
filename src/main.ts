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

  // Alle Screens ausblenden
  home.classList.remove('screen--active');
  settings.classList.remove('screen--active');
  game.classList.remove('screen--active');
  result.classList.remove('screen--active');

  // Nur den gewünschten Screen anzeigen
  if (id === 'home') {
    home.classList.add('screen--active');
  } else if (id === 'settings') {
    settings.classList.add('screen--active');
  } else if (id === 'game') {
    game.classList.add('screen--active');
  } else if (id === 'result') {
    result.classList.add('screen--active');
  }
}

// ============================================
// THEME-SPEZIFISCHE HUD ICONS
// ============================================
const THEME_ICONS: Record<ThemeId, { blue: string; orange: string }> = {
  code: {
    blue: 'public/assets/Settings/topbar/label.svg',
    orange: 'public/assets/Settings/topbar/label-orange.svg',
  },
  games: {
    blue: 'public/assets/game-hud/chess_pawn_blue.svg',
    orange: 'public/assets/game-hud/chess_pawn.svg',
  },
  da: {
    blue: 'public/assets/game-hud/chess_pawn_blue.svg',
    orange: 'public/assets/game-hud/chess_pawn.svg',
  },
  food: {
    blue: 'public/assets/game-hud/chess_pawn_blue.svg',
    orange: 'public/assets/game-hud/chess_pawn.svg',
  },
};

// ============================================
// EXIT GAME ICONS PRO THEME
// ============================================
const EXIT_ICONS: Record<ThemeId, string> = {
  code: 'public/assets/Settings/topbar/move_item.svg',
  games: 'public/assets/game-hud/DA-Theme/move_item.svg',
  da: 'public/assets/game-hud/DA-Theme/move_item.svg',
  food: 'public/assets/game-hud/DA-Theme/move_item.svg',
};

// ============================================
// EXIT POPUP TEXTE PRO THEME
// ============================================
const EXIT_TEXTS: Record<ThemeId, { back: string; confirm: string }> = {
  code: {
    back: 'Back to game',
    confirm: 'Exit game',
  },
  games: {
    back: 'No, back to game',
    confirm: 'Yes, quit game',
  },
  da: {
    back: 'Back to game',
    confirm: 'Exit game',
  },
  food: {
    back: 'NO, BACK TO GAME',
    confirm: 'EXIT GAME',
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
  const exitGameIcon = document.getElementById('exitGameIcon') as HTMLImageElement;
  const previewExitIcon = document.getElementById('previewExitIcon') as HTMLImageElement;

  // Exit Popup Textelemente
  const backToGameText = document.getElementById('back-to-game-text') as HTMLSpanElement;
  const confirmExitText = document.getElementById('confirm-exit-text') as HTMLSpanElement;

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
  let hoveredTheme: ThemeId | null = null;

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
    if (theme === 'code') {
      return player === 'blue'
        ? 'public/assets/Settings/topbar/label.svg'
        : 'public/assets/Settings/topbar/label-orange.svg';
    }
    return 'public/assets/game-hud/chess_pawn_current_player.svg';
  }

  /**
   * Update Exit Popup Texte basierend auf Theme
   */
  function updateExitTexts(theme: ThemeId) {
    const texts = EXIT_TEXTS[theme];
    if (!texts) return;
    
    if (backToGameText) backToGameText.textContent = texts.back;
    if (confirmExitText) confirmExitText.textContent = texts.confirm;
  }

  /**
   * Update HUD Icons basierend auf Theme
   */
  function updateHudIcons(theme: ThemeId) {
    const icons = THEME_ICONS[theme];
    if (!icons) return;

    if (blueIconImg) blueIconImg.src = icons.blue;
    if (orangeIconImg) orangeIconImg.src = icons.orange;

    if (exitGameIcon) {
      exitGameIcon.src = EXIT_ICONS[theme];
    }

    // Exit Popup Texte aktualisieren
    updateExitTexts(theme);

    const currentPlayer = game?.state?.currentPlayer || selectedPlayer;
    if (currentPlayerImg) {
      currentPlayerImg.src = getCurrentPlayerIcon(theme, currentPlayer);
      currentPlayerImg.classList.remove('player-blue', 'player-orange');
      currentPlayerImg.classList.add(`player-${currentPlayer}`);
    }
  }

  /**
   * Update Current Player indicator
   */
  function updateCurrentPlayer(player: 'blue' | 'orange') {
    if (!currentPlayerImg) return;

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
    // Theme-Klassen auf Game Screen aktualisieren
    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${selectedTheme}`);

    updateHudIcons(selectedTheme);

    // Preview mit hoveredTheme oder selectedTheme
    const themeToShow = hoveredTheme || selectedTheme;

    previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    previewRoot.classList.add(`preview--${themeToShow}`);

    switch (themeToShow) {
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

    if (previewExitIcon) {
      previewExitIcon.src = EXIT_ICONS[themeToShow];
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

    if (previewExitIcon) {
      previewExitIcon.src = EXIT_ICONS[selectedTheme];
    }

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
      hoveredTheme = null;
      renderer.setTheme(selectedTheme);
      updateThemePreview();
    });
  });

  // ============================================
  // SETTINGS PREVIEW HOVER EFFECT (NUR FÜR THEMES)
  // ============================================
  document.querySelectorAll<HTMLLabelElement>('.radio-item').forEach((label) => {
    const radio = label.querySelector<HTMLInputElement>('.radio-input');
    if (!radio) return;

    // NUR für Theme-Radios (nicht für Player oder Grid)
    const isThemeRadio = radio.name === 'theme';
    if (!isThemeRadio) return;

    label.addEventListener('mouseenter', () => {
      const themeValue = radio.value as ThemeId;
      if (['code', 'games', 'da', 'food'].includes(themeValue)) {
        hoveredTheme = themeValue;
        updateThemePreview();
      }
    });

    label.addEventListener('mouseleave', () => {
      hoveredTheme = null;
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
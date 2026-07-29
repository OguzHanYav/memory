import './style/style.scss';

import { assertEl } from './app/utils/dom';
import { Renderer } from './app/ui/Renderer';
import { GameController } from './app/controllers/GameController';

import type { GridSize, ThemeId, PlayerColor } from './app/core/types';

// ============================================
// CONSTANTS
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

const EXIT_ICONS: Record<ThemeId, string> = {
  code: 'public/assets/Settings/topbar/move_item.svg',
  games: 'public/assets/Settings/topbar/move_item.svg',
  da: 'public/assets/game-hud/DA-Theme/move_item.svg',
  food: 'public/assets/game-hud/FOOD-Theme/move_item.svg',
};

const EXIT_ICONS_HOVER: Record<ThemeId, string> = {
  code: '',
  games: 'public/assets/game-hud/GAME-Theme/move_item.svg',
  da: 'public/assets/Settings/topbar/move_item.svg',
  food: 'public/assets/Settings/topbar/move_item.svg',
};

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

const RESULT_BACK_TEXTS: Record<ThemeId, string> = {
  code: 'Back to start',
  games: 'Home',
  da: 'Home',
  food: 'Home',
};

const VALID_THEMES: ThemeId[] = ['code', 'games', 'da', 'food'];
const VALID_GRID_SIZES: GridSize[] = [16, 24, 36];
const VALID_PLAYERS: PlayerColor[] = ['blue', 'orange'];

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Berechnet die Anzahl der Paare basierend auf der Grid-Größe */
function pairsFromGrid(grid: GridSize): number {
  return grid / 2;
}

/** Zeigt den gewünschten Screen an und blendet alle anderen aus */
function showScreen(id: 'home' | 'settings' | 'game' | 'result'): void {
  const screens = {
    home: document.getElementById('screen-home'),
    settings: document.getElementById('screen-settings'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result'),
  };

  // Alle Screens ausblenden
  Object.values(screens).forEach((el) => el?.classList.remove('screen--active'));

  // Nur den gewünschten Screen anzeigen
  const target = screens[id];
  if (target) {
    target.classList.add('screen--active');
  }
}

/** Setzt das Spiel komplett zurück und startet neu */
function resetAndRestartGame(
  game: GameController,
  renderer: Renderer,
  selectedTheme: ThemeId,
  selectedGrid: GridSize,
  selectedPlayer: PlayerColor
): void {
  // Board leeren
  const field = document.getElementById('field');
  if (field) {
    field.innerHTML = '';
  }

  // Theme zurücksetzen auf Code (Standard)
  const defaultTheme: ThemeId = 'code';

  // Alle Theme-Klassen von Body entfernen
  document.body.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');

  // Alle Theme-Klassen von Game Screen entfernen
  const gameScreen = document.getElementById('screen-game');
  if (gameScreen) {
    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
  }

  // Alle Theme-Klassen von Result Screen entfernen
  const resultScreen = document.getElementById('screen-result');
  if (resultScreen) {
    resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    resultScreen.classList.remove(
      'result-screen--winner-blue',
      'result-screen--winner-orange',
      'result-screen--draw',
      'result-screen--gameover'
    );
  }

  // Renderer auf Standard-Theme setzen
  renderer.setTheme(defaultTheme);

  // Game-Konfiguration zurücksetzen
  game.updateConfig({
    theme: defaultTheme,
    gridSize: selectedGrid,
    startingPlayer: selectedPlayer,
    pairs: pairsFromGrid(selectedGrid),
    flipBackDelayMs: 700,
  });

  // Neues Spiel starten (im Hintergrund)
  game.startNewGame();

  // UI zurücksetzen
  const blueScoreEl = document.getElementById('blueScore');
  const orangeScoreEl = document.getElementById('orangeScore');

  if (blueScoreEl && orangeScoreEl) {
    const isCodeTheme = selectedTheme === 'code';
    if (isCodeTheme) {
      blueScoreEl.textContent = 'Blue 0';
      orangeScoreEl.textContent = 'Orange 0';
    } else {
      blueScoreEl.textContent = '0';
      orangeScoreEl.textContent = '0';
    }
  }

  // Result Scores zurücksetzen
  const resultBlueScore = document.getElementById('result-blue-score');
  const resultOrangeScore = document.getElementById('result-orange-score');
  if (resultBlueScore && resultOrangeScore) {
    resultBlueScore.textContent = 'Blue 0';
    resultOrangeScore.textContent = 'Orange 0';
  }

  // Current Player Icon zurücksetzen
  const currentPlayerImg = document.getElementById('currentPlayerImg') as HTMLImageElement;
  if (currentPlayerImg) {
    currentPlayerImg.src = 'public/assets/Settings/topbar/label-blue.svg';
    currentPlayerImg.classList.remove('player-blue', 'player-orange');
    currentPlayerImg.classList.add('player-blue');
  }

  // Result Back Button Texte zurücksetzen
  const resultBackText = document.getElementById('result-back-text');
  const drawBackText = document.getElementById('draw-back-text');
  const gameoverBackText = document.getElementById('gameover-back-text');
  if (resultBackText) {
    resultBackText.textContent = 'Back to start';
  }
  if (drawBackText) {
    drawBackText.textContent = 'Back to start';
  }
  if (gameoverBackText) {
    gameoverBackText.textContent = 'Back to start';
  }

  // Exit Game Icon zurücksetzen
  const exitGameIcon = document.getElementById('exitGameIcon') as HTMLImageElement;
  if (exitGameIcon) {
    exitGameIcon.src = 'public/assets/Settings/topbar/move_item.svg';
  }

  // Preview Exit Icon zurücksetzen
  const previewExitIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (previewExitIcon) {
    previewExitIcon.src = 'public/assets/Settings/topbar/move_item.svg';
  }

  // Preview Bilder zurücksetzen
  const previewImgMain = document.getElementById('preview-img-main') as HTMLImageElement;
  const previewImgSub = document.getElementById('preview-img-sub') as HTMLImageElement;
  if (previewImgMain) {
    previewImgMain.src = './assets/Settings/Cards 5/Cards 5_2.svg';
  }
  if (previewImgSub) {
    previewImgSub.src = './assets/Settings/Cards 5/Cards 5.svg';
  }

  // Preview Root zurücksetzen
  const previewRoot = document.getElementById('theme-preview');
  if (previewRoot) {
    previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    previewRoot.classList.add('preview--code');
  }

  // Exit Popup Texte zurücksetzen
  const backToGameText = document.getElementById('back-to-game-text');
  const confirmExitText = document.getElementById('confirm-exit-text');
  if (backToGameText) {
    backToGameText.textContent = 'Back to game';
  }
  if (confirmExitText) {
    confirmExitText.textContent = 'Exit game';
  }

  // Zur Home-Screen navigieren
  showScreen('home');
}

// ============================================
// MAIN INIT FUNCTION
// ============================================

function init(): void {
  // ----- DOM References -----
  const btnGoSettings = assertEl(
    document.getElementById('btn-go-settings'),
    'Missing #btn-go-settings'
  );
  const btnStartGame = assertEl(
    document.getElementById('btn-start-game'),
    'Missing #btn-start-game'
  );

  const field = assertEl(document.getElementById('field'), 'Missing #field');
  const blueScoreEl = assertEl(
    document.getElementById('blueScore'),
    'Missing #blueScore'
  );
  const orangeScoreEl = assertEl(
    document.getElementById('orangeScore'),
    'Missing #orangeScore'
  );

  const blueIconImg = document.querySelector(
    '.game-hud--preview-style .preview__scores img:first-of-type'
  ) as HTMLImageElement;
  const orangeIconImg = document.querySelector(
    '.game-hud--preview-style .preview__scores img:last-of-type'
  ) as HTMLImageElement;
  const currentPlayerImg = document.getElementById(
    'currentPlayerImg'
  ) as HTMLImageElement;
  const exitGameIcon = document.getElementById(
    'exitGameIcon'
  ) as HTMLImageElement;
  const previewExitIcon = document.getElementById(
    'previewExitIcon'
  ) as HTMLImageElement;

  const backToGameText = document.getElementById(
    'back-to-game-text'
  ) as HTMLSpanElement;
  const confirmExitText = document.getElementById(
    'confirm-exit-text'
  ) as HTMLSpanElement;

  const resultBackText = document.getElementById(
    'result-back-text'
  ) as HTMLSpanElement;
  const drawBackText = document.getElementById(
    'draw-back-text'
  ) as HTMLSpanElement;
  const gameoverBackText = document.getElementById(
    'gameover-back-text'
  ) as HTMLSpanElement;

  const exitModal = assertEl(
    document.getElementById('modal-exit'),
    'Missing #modal-exit'
  );
  const btnBackToGame = assertEl(
    document.getElementById('btn-back-to-game'),
    'Missing #btn-back-to-game'
  );
  const btnConfirmExit = assertEl(
    document.getElementById('btn-confirm-exit'),
    'Missing #btn-confirm-exit'
  );
  const btnExitGame = assertEl(
    document.getElementById('btn-exit-game'),
    'Missing #btn-exit-game'
  );

  const resultScreen = assertEl(
    document.getElementById('screen-result'),
    'Missing #screen-result'
  );
  const resultGameover = assertEl(
    document.getElementById('result-gameover'),
    'Missing #result-gameover'
  );
  const resultWinner = assertEl(
    document.getElementById('result-winner'),
    'Missing #result-winner'
  );
  const resultDraw = assertEl(
    document.getElementById('result-draw'),
    'Missing #result-draw'
  );
  const resultBlueScore = assertEl(
    document.getElementById('result-blue-score'),
    'Missing #result-blue-score'
  );
  const resultOrangeScore = assertEl(
    document.getElementById('result-orange-score'),
    'Missing #result-orange-score'
  );
  const resultWinnerTitle = assertEl(
    document.getElementById('result-winner-title'),
    'Missing #result-winner-title'
  );
  const btnResultBack = assertEl(
    document.getElementById('btn-result-back'),
    'Missing #btn-result-back'
  );
  const btnDrawBack = assertEl(
    document.getElementById('btn-draw-back'),
    'Missing #btn-draw-back'
  );
  const btnGameoverBack = assertEl(
    document.getElementById('btn-gameover-back'),
    'Missing #btn-gameover-back'
  );

  const previewRoot = assertEl(
    document.getElementById('theme-preview'),
    'Missing #theme-preview'
  );
  const previewImgMain = assertEl(
    document.getElementById('preview-img-main') as HTMLImageElement | null,
    'Missing #preview-img-main'
  );
  const previewImgSub = assertEl(
    document.getElementById('preview-img-sub') as HTMLImageElement | null,
    'Missing #preview-img-sub'
  );

  const gameScreen = assertEl(
    document.getElementById('screen-game'),
    'Missing #screen-game'
  );

  // ----- State -----
  const renderer = new Renderer(field);

  let selectedTheme: ThemeId = 'code';
  let selectedGrid: GridSize = 16;
  let selectedPlayer: PlayerColor = 'blue';
  let hoveredTheme: ThemeId | null = null;

  // ----- Game Instance -----
  const game = new GameController(renderer, {
    theme: selectedTheme,
    gridSize: selectedGrid,
    startingPlayer: selectedPlayer,
    pairs: pairsFromGrid(selectedGrid),
    flipBackDelayMs: 700,
  });

  // ============================================
  // TEST FUNKTION FÜR RESULT SCREENS (global verfügbar)
  // ============================================

  /** Testet die verschiedenen Result-Screen-Zustände */
  function testResultScreen(
    winner: 'blue' | 'orange' | 'tie' | 'gameover',
    blueScore: number = 3,
    orangeScore: number = 2
  ): void {
    const resultScreen = document.getElementById('screen-result');
    const resultBlueScore = document.getElementById('result-blue-score');
    const resultOrangeScore = document.getElementById('result-orange-score');
    const resultWinnerTitle = document.getElementById('result-winner-title');
    const resultGameover = document.getElementById('result-gameover');
    const resultWinner = document.getElementById('result-winner');
    const resultDraw = document.getElementById('result-draw');

    if (!resultScreen || !resultBlueScore || !resultOrangeScore) {
      console.error('Result Screen Elemente nicht gefunden!');
      return;
    }

    // Scores setzen - mit oder ohne Text je nach Theme
    const isCodeTheme = selectedTheme === 'code';
    if (isCodeTheme) {
      resultBlueScore.textContent = `Blue ${blueScore}`;
      resultOrangeScore.textContent = `Orange ${orangeScore}`;
    } else {
      resultBlueScore.textContent = String(blueScore);
      resultOrangeScore.textContent = String(orangeScore);
    }

    // Alle Klassen entfernen
    resultScreen.classList.remove(
      'result-screen--winner-blue',
      'result-screen--winner-orange',
      'result-screen--draw',
      'result-screen--gameover'
    );

    // Alle Blocks ausblenden
    if (resultGameover) resultGameover.style.display = 'none';
    if (resultWinner) resultWinner.style.display = 'none';
    if (resultDraw) resultDraw.style.display = 'none';

    // Je nach Winner-Typ die richtige Klasse und Block anzeigen
    if (winner === 'gameover') {
      resultScreen.classList.add('result-screen--gameover');
      if (resultGameover) resultGameover.style.display = 'block';
      console.log('🟡 Game Over Screen (Test)');
    } else if (winner === 'tie') {
      resultScreen.classList.add('result-screen--draw');
      if (resultDraw) resultDraw.style.display = 'block';
      console.log('🟡 Draw Screen (Test)');
    } else {
      resultScreen.classList.add(`result-screen--winner-${winner}`);
      if (resultWinner) resultWinner.style.display = 'flex';
      if (resultWinnerTitle) {
        resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
        resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
      }
      console.log(`🟡 Winner Screen (Test): ${winner.toUpperCase()} gewinnt!`);
    }

    // Result Screen anzeigen
    showScreen('result');
  }

  // ============================================
  // UI UPDATE FUNCTIONS
  // ============================================

  /** Gibt das aktuelle Player-Icon basierend auf Theme und Player zurück */
  function getCurrentPlayerIcon(theme: ThemeId, player: 'blue' | 'orange'): string {
    const isCodeTheme = theme === 'code';

    if (isCodeTheme) {
      return player === 'blue'
        ? 'public/assets/Settings/topbar/label.svg'
        : 'public/assets/Settings/topbar/label-orange.svg';
    }

    return 'public/assets/game-hud/chess_pawn_current_player.svg';
  }

  /** Aktualisiert die Exit-Popup-Texte basierend auf dem Theme */
  function updateExitTexts(theme: ThemeId): void {
    const texts = EXIT_TEXTS[theme];
    if (!texts) return;

    if (backToGameText) {
      backToGameText.textContent = texts.back;
    }
    if (confirmExitText) {
      confirmExitText.textContent = texts.confirm;
    }
  }

  /** Aktualisiert die Result-Back-Button-Texte basierend auf dem Theme */
  function updateResultBackText(theme: ThemeId): void {
    const text = RESULT_BACK_TEXTS[theme];
    if (!text) return;

    if (resultBackText) {
      resultBackText.textContent = text;
    }
    if (drawBackText) {
      drawBackText.textContent = text;
    }
    if (gameoverBackText) {
      gameoverBackText.textContent = text;
    }
  }

  /** Richtet den Hover-Effekt für den Exit-Button ein */
  function setupExitButtonHover(theme: ThemeId): void {
    const exitBtn = document.getElementById('btn-exit-game');
    const exitIcon = document.getElementById('exitGameIcon') as HTMLImageElement;

    if (!exitBtn || !exitIcon) return;

    // Alte Event-Listener entfernen (durch Klonen)
    const newExitBtn = exitBtn.cloneNode(true) as HTMLButtonElement;
    exitBtn.parentNode?.replaceChild(newExitBtn, exitBtn);

    const newExitIcon = newExitBtn.querySelector('#exitGameIcon') as HTMLImageElement;
    if (!newExitIcon) return;

    // Hover Events für Game Button
    newExitBtn.addEventListener('mouseenter', () => {
      const hoverIcon = EXIT_ICONS_HOVER[theme];
      if (hoverIcon) {
        newExitIcon.src = hoverIcon;
      }
    });

    newExitBtn.addEventListener('mouseleave', () => {
      const defaultIcon = EXIT_ICONS[theme];
      if (defaultIcon) {
        newExitIcon.src = defaultIcon;
      }
    });

    // Click Event wieder hinzufügen
    newExitBtn.addEventListener('click', () => {
      exitModal.style.display = 'flex';
    });

    // Preview Button Hover (Settings)
    const previewBtn = document.querySelector('.preview-exit');
    const previewIcon = document.getElementById('previewExitIcon') as HTMLImageElement;

    if (previewBtn && previewIcon) {
      const newPreviewBtn = previewBtn.cloneNode(true) as HTMLButtonElement;
      previewBtn.parentNode?.replaceChild(newPreviewBtn, previewBtn);

      const newPreviewIcon = newPreviewBtn.querySelector('#previewExitIcon') as HTMLImageElement;
      if (newPreviewIcon) {
        newPreviewBtn.addEventListener('mouseenter', () => {
          const hoverIcon = EXIT_ICONS_HOVER[theme];
          if (hoverIcon) {
            newPreviewIcon.src = hoverIcon;
          }
        });

        newPreviewBtn.addEventListener('mouseleave', () => {
          const defaultIcon = EXIT_ICONS[theme];
          if (defaultIcon) {
            newPreviewIcon.src = defaultIcon;
          }
        });
      }
    }
  }

  /** Aktualisiert alle HUD-Icons basierend auf dem Theme */
  function updateHudIcons(theme: ThemeId): void {
    const icons = THEME_ICONS[theme];
    if (!icons) return;

    if (blueIconImg) {
      blueIconImg.src = icons.blue;
    }
    if (orangeIconImg) {
      orangeIconImg.src = icons.orange;
    }
    if (exitGameIcon) {
      exitGameIcon.src = EXIT_ICONS[theme];
    }

    updateExitTexts(theme);
    setupExitButtonHover(theme);

    const currentPlayer = game?.state?.currentPlayer || selectedPlayer;
    if (currentPlayerImg) {
      currentPlayerImg.src = getCurrentPlayerIcon(theme, currentPlayer);
      currentPlayerImg.classList.remove('player-blue', 'player-orange');
      currentPlayerImg.classList.add(`player-${currentPlayer}`);
    }
  }

  /** Aktualisiert den Current-Player-Indikator */
  function updateCurrentPlayer(player: 'blue' | 'orange'): void {
    if (!currentPlayerImg) return;

    currentPlayerImg.src = getCurrentPlayerIcon(selectedTheme, player);
    currentPlayerImg.alt = player === 'blue' ? 'Blue Player' : 'Orange Player';

    currentPlayerImg.classList.remove('player-blue', 'player-orange');
    currentPlayerImg.classList.add(`player-${player}`);
  }

  /** Rendert das Game-UI (Scores und Current Player) */
  function renderGameUi(gameInstance: GameController): void {
    if (blueScoreEl && orangeScoreEl) {
      const isCodeTheme = selectedTheme === 'code';
      const { blueMatches, orangeMatches } = gameInstance.state;

      if (isCodeTheme) {
        blueScoreEl.textContent = `Blue ${blueMatches}`;
        orangeScoreEl.textContent = `Orange ${orangeMatches}`;
      } else {
        blueScoreEl.textContent = `${blueMatches}`;
        orangeScoreEl.textContent = `${orangeMatches}`;
      }
    }

    updateCurrentPlayer(gameInstance.state.currentPlayer);
  }

  /** Aktualisiert die Theme-Preview im Settings-Bereich */
  function updateThemePreview(): void {
    // Theme-Klassen auf Game Screen aktualisieren
    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${selectedTheme}`);

    // Theme-Klasse auf Result Screen für ALLE Themes setzen
    resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    resultScreen.classList.add(`theme-${selectedTheme}`);

    updateHudIcons(selectedTheme);
    updateResultBackText(selectedTheme);

    const themeToShow = hoveredTheme || selectedTheme;

    previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    previewRoot.classList.add(`preview--${themeToShow}`);

    // Preview-Bilder basierend auf Theme setzen
    const previewConfig = {
      code: {
        main: './assets/Settings/Cards 5/Cards 5_2.svg',
        sub: './assets/Settings/Cards 5/Cards 5.svg',
      },
      games: {
        main: './assets/Settings/Cards 5/Rectangle 40.svg',
        sub: './assets/Settings/Cards 5/Front.svg',
      },
      da: {
        main: './assets/Settings/Cards 5/Frame 727.svg',
        sub: './assets/Settings/Cards 5/Frame 728.svg',
      },
      food: {
        main: './assets/Settings/Cards 5/frond.svg',
        sub: './assets/Settings/Cards 5/frond_foods.svg',
      },
    };

    const config = previewConfig[themeToShow];
    if (config) {
      previewImgMain.src = config.main;
      previewImgSub.src = config.sub;
    }

    if (previewExitIcon) {
      previewExitIcon.src = EXIT_ICONS[themeToShow];
    }
  }

  // ============================================
  // GAME START
  // ============================================

  /** Startet das Spiel mit den aktuellen Einstellungen */
  function startGameFromSettings(): void {
    renderer.setTheme(selectedTheme);
    renderer.setGrid(selectedGrid);

    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${selectedTheme}`);

    // Theme-Klasse auf Result Screen für ALLE Themes setzen
    resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    resultScreen.classList.add(`theme-${selectedTheme}`);

    updateHudIcons(selectedTheme);
    updateResultBackText(selectedTheme);

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
  }

  // ============================================
  // GAME CALLBACKS
  // ============================================

  game.onStateChange(() => {
    renderGameUi(game);
  });

  game.onWin(({ blueMatches, orangeMatches, winner }) => {
    // Prüfen ob wir das Code-Theme haben
    const isCodeTheme = selectedTheme === 'code';
    
    // Scores setzen - mit oder ohne Text je nach Theme
    if (isCodeTheme) {
      resultBlueScore.textContent = `Blue ${blueMatches}`;
      resultOrangeScore.textContent = `Orange ${orangeMatches}`;
    } else {
      resultBlueScore.textContent = String(blueMatches);
      resultOrangeScore.textContent = String(orangeMatches);
    }

    resultScreen.classList.remove(
      'result-screen--winner-blue',
      'result-screen--winner-orange',
      'result-screen--draw',
      'result-screen--gameover'
    );

    const playerWhoPlayed = selectedPlayer;
    const isGameOver = winner !== 'tie' && winner !== playerWhoPlayed;

    if (isGameOver) {
      // Spieler hat verloren -> Game Over Screen
      resultScreen.classList.add('result-screen--gameover');
      resultGameover.style.display = 'block';
      resultWinner.style.display = 'none';
      resultDraw.style.display = 'none';
      console.log(`🟡 Game Over - ${playerWhoPlayed.toUpperCase()} hat verloren!`);
    } else if (winner === 'tie') {
      // Unentschieden
      resultScreen.classList.add('result-screen--draw');
      resultDraw.style.display = 'block';
      resultWinner.style.display = 'none';
      resultGameover.style.display = 'none';
      console.log('🟡 Draw - Unentschieden!');
    } else {
      // Spieler hat gewonnen -> Winner Screen
      resultScreen.classList.add(`result-screen--winner-${winner}`);
      resultWinner.style.display = 'flex';
      resultGameover.style.display = 'none';
      resultDraw.style.display = 'none';
      resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
      resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
      console.log(`🟡 ${winner.toUpperCase()} hat gewonnen!`);
    }

    showScreen('result');
  });

  // ============================================
  // EVENT LISTENERS
  // ============================================

  // Result Screen Back Buttons - Spiel komplett zurücksetzen
  btnResultBack.addEventListener('click', () => {
    resetAndRestartGame(game, renderer, selectedTheme, selectedGrid, selectedPlayer);
  });

  btnDrawBack.addEventListener('click', () => {
    resetAndRestartGame(game, renderer, selectedTheme, selectedGrid, selectedPlayer);
  });

  btnGameoverBack.addEventListener('click', () => {
    resetAndRestartGame(game, renderer, selectedTheme, selectedGrid, selectedPlayer);
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
  btnGoSettings.addEventListener('click', () => {
    showScreen('settings');
  });

  btnStartGame.addEventListener('click', startGameFromSettings);

  // Theme radios
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const theme = radio.value as ThemeId;
      if (!VALID_THEMES.includes(theme)) return;

      selectedTheme = theme;
      hoveredTheme = null;
      renderer.setTheme(selectedTheme);
      updateThemePreview();
    });
  });

  // Player radios
  document.querySelectorAll<HTMLInputElement>('input[name="startingPlayer"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const player = radio.value as PlayerColor;
      if (!VALID_PLAYERS.includes(player)) return;

      selectedPlayer = player;
    });
  });

  // Grid radios
  document.querySelectorAll<HTMLInputElement>('input[name="grid"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const grid = Number(radio.value) as GridSize;
      if (!VALID_GRID_SIZES.includes(grid)) return;

      selectedGrid = grid;
      renderer.setGrid(selectedGrid);
    });
  });

  // ============================================
  // SETTINGS PREVIEW HOVER EFFECT
  // ============================================

  document.querySelectorAll<HTMLLabelElement>('.radio-item').forEach((label) => {
    const radio = label.querySelector<HTMLInputElement>('.radio-input');
    if (!radio) return;

    // Nur für Theme-Radios (nicht für Player oder Grid)
    const isThemeRadio = radio.name === 'theme';
    if (!isThemeRadio) return;

    label.addEventListener('mouseenter', () => {
      const themeValue = radio.value as ThemeId;
      if (VALID_THEMES.includes(themeValue)) {
        hoveredTheme = themeValue;
        updateThemePreview();
      }
    });

    label.addEventListener('mouseleave', () => {
      hoveredTheme = null;
      updateThemePreview();
    });
  });

  // ============================================
  // BOARD CLICK DELEGATION
  // ============================================

  field.addEventListener('click', (e: MouseEvent) => {
    const cardEl = (e.target as HTMLElement).closest<HTMLButtonElement>('.card');
    if (!cardEl) return;

    const cardId = cardEl.dataset.id;
    if (!cardId) return;

    game.handleCardClick(cardId);
  });

  // ============================================
  // KEYBOARD SHORTCUTS FÜR TESTING
  // ============================================
  document.addEventListener('keydown', (e) => {
    // Alt + 1 = Blue gewinnt
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      testResultScreen('blue', 5, 3);
    }
    // Alt + 2 = Orange gewinnt
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      testResultScreen('orange', 2, 4);
    }
    // Alt + 3 = Draw
    if (e.altKey && e.key === '3') {
      e.preventDefault();
      testResultScreen('tie', 3, 3);
    }
    // Alt + 4 = Game Over
    if (e.altKey && e.key === '4') {
      e.preventDefault();
      testResultScreen('gameover', 4, 2);
    }
  });

  // ============================================
  // INIT
  // ============================================

  renderer.setTheme(selectedTheme);
  renderer.setGrid(selectedGrid);
  updateThemePreview();

  showScreen('home');

  // Debugging - Test-Funktion global verfügbar machen
  (window as any).testResultScreen = testResultScreen;
  (window as any).game = game;
}

init();
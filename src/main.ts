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
    blue: './assets/Settings/topbar/label.svg',
    orange: './assets/Settings/topbar/label-orange.svg',
  },
  games: {
    blue: './assets/game-hud/chess_pawn_blue.svg',
    orange: './assets/game-hud/chess_pawn.svg',
  },
  da: {
    blue: './assets/game-hud/chess_pawn_blue.svg',
    orange: './assets/game-hud/chess_pawn.svg',
  },
  food: {
    blue: './assets/game-hud/chess_pawn_blue.svg',
    orange: './assets/game-hud/chess_pawn.svg',
  },
};

const EXIT_ICONS: Record<ThemeId, string> = {
  code: './assets/Settings/topbar/move_item.svg',
  games: './assets/Settings/topbar/move_item.svg',
  da: './assets/game-hud/DA-Theme/move_item.svg',
  food: './assets/game-hud/FOOD-Theme/move_item.svg',
};

const EXIT_ICONS_HOVER: Record<ThemeId, string> = {
  code: '',
  games: './assets/game-hud/GAME-Theme/move_item.svg',
  da: './assets/Settings/topbar/move_item.svg',
  food: './assets/Settings/topbar/move_item.svg',
};

const EXIT_TEXTS: Record<ThemeId, { back: string; confirm: string }> = {
  code: { back: 'Back to game', confirm: 'Exit game' },
  games: { back: 'No, back to game', confirm: 'Yes, quit game' },
  da: { back: 'Back to game', confirm: 'Exit game' },
  food: { back: 'NO, BACK TO GAME', confirm: 'EXIT GAME' },
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
// GLOBAL STATE
// ============================================

const state = {
  selectedTheme: 'code' as ThemeId,
  selectedGrid: 16 as GridSize,
  selectedPlayer: 'blue' as PlayerColor,
  hoveredTheme: null as ThemeId | null,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function pairsFromGrid(grid: GridSize): number {
  return grid / 2;
}

function showScreen(id: 'home' | 'settings' | 'game' | 'result'): void {
  const screens = {
    home: document.getElementById('screen-home'),
    settings: document.getElementById('screen-settings'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result'),
  };
  Object.values(screens).forEach((el) => el?.classList.remove('screen--active'));
  const target = screens[id];
  if (target) target.classList.add('screen--active');
}

// ============================================
// RESET & RESTART GAME - HELPER FUNCTIONS
// ============================================

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

function resetGameConfig(game: GameController, renderer: Renderer): void {
  const DEFAULT_THEME: ThemeId = 'code';
  renderer.setTheme(DEFAULT_THEME);
  game.updateConfig({
    theme: DEFAULT_THEME,
    gridSize: state.selectedGrid,
    startingPlayer: state.selectedPlayer,
    pairs: pairsFromGrid(state.selectedGrid),
    flipBackDelayMs: 700,
  });
  game.startNewGame();
}

function resetScoreDisplay(): void {
  const blueScoreEl = document.getElementById('blueScore');
  const orangeScoreEl = document.getElementById('orangeScore');
  const isCode = state.selectedTheme === 'code';
  if (blueScoreEl) blueScoreEl.textContent = isCode ? 'Blue 0' : '0';
  if (orangeScoreEl) orangeScoreEl.textContent = isCode ? 'Orange 0' : '0';
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

function resetAndRestartGame(game: GameController, renderer: Renderer): void {
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

// ============================================
// TEST RESULT SCREEN
// ============================================

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

  const isCodeTheme = state.selectedTheme === 'code';
  resultBlueScore.textContent = isCodeTheme ? `Blue ${blueScore}` : String(blueScore);
  resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeScore}` : String(orangeScore);

  resultScreen.classList.remove(
    'result-screen--winner-blue',
    'result-screen--winner-orange',
    'result-screen--draw',
    'result-screen--gameover'
  );

  if (resultGameover) resultGameover.style.display = 'none';
  if (resultWinner) resultWinner.style.display = 'none';
  if (resultDraw) resultDraw.style.display = 'none';

  if (winner === 'gameover') {
    resultScreen.classList.add('result-screen--gameover');
    if (resultGameover) resultGameover.style.display = 'block';
  } else if (winner === 'tie') {
    resultScreen.classList.add('result-screen--draw');
    if (resultDraw) resultDraw.style.display = 'block';
  } else {
    resultScreen.classList.add(`result-screen--winner-${winner}`);
    if (resultWinner) resultWinner.style.display = 'flex';
    if (resultWinnerTitle) {
      resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
      resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
    }
  }
  showScreen('result');
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function getCurrentPlayerIcon(theme: ThemeId, player: 'blue' | 'orange'): string {
  if (theme === 'code') {
    return player === 'blue'
      ? './assets/Settings/topbar/label.svg'
      : './assets/Settings/topbar/label-orange.svg';
  }
  return './assets/game-hud/chess_pawn_current_player.svg';
}

function updateExitTexts(theme: ThemeId): void {
  const texts = EXIT_TEXTS[theme];
  if (!texts) return;
  const backEl = document.getElementById('back-to-game-text') as HTMLSpanElement;
  const confirmEl = document.getElementById('confirm-exit-text') as HTMLSpanElement;
  if (backEl) backEl.textContent = texts.back;
  if (confirmEl) confirmEl.textContent = texts.confirm;
}

function updateResultBackText(theme: ThemeId): void {
  const text = RESULT_BACK_TEXTS[theme];
  if (!text) return;
  const resultEl = document.getElementById('result-back-text') as HTMLSpanElement;
  const drawEl = document.getElementById('draw-back-text') as HTMLSpanElement;
  const gameoverEl = document.getElementById('gameover-back-text') as HTMLSpanElement;
  if (resultEl) resultEl.textContent = text;
  if (drawEl) drawEl.textContent = text;
  if (gameoverEl) gameoverEl.textContent = text;
}

function setupExitButtonHover(theme: ThemeId): void {
  const exitBtn = document.getElementById('btn-exit-game');
  const exitModal = document.getElementById('modal-exit') as HTMLElement;
  if (!exitBtn || !exitModal) return;

  const newExitBtn = exitBtn.cloneNode(true) as HTMLButtonElement;
  exitBtn.parentNode?.replaceChild(newExitBtn, exitBtn);
  const newExitIcon = newExitBtn.querySelector('#exitGameIcon') as HTMLImageElement;
  if (!newExitIcon) return;

  newExitBtn.addEventListener('mouseenter', () => {
    const hoverIcon = EXIT_ICONS_HOVER[theme];
    if (hoverIcon) newExitIcon.src = hoverIcon;
  });
  newExitBtn.addEventListener('mouseleave', () => {
    const defaultIcon = EXIT_ICONS[theme];
    if (defaultIcon) newExitIcon.src = defaultIcon;
  });
  newExitBtn.addEventListener('click', () => { exitModal.style.display = 'flex'; });

  const previewBtn = document.querySelector('.preview-exit');
  const previewIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (previewBtn && previewIcon) {
    const newPreviewBtn = previewBtn.cloneNode(true) as HTMLButtonElement;
    previewBtn.parentNode?.replaceChild(newPreviewBtn, previewBtn);
    const newPreviewIcon = newPreviewBtn.querySelector('#previewExitIcon') as HTMLImageElement;
    if (newPreviewIcon) {
      newPreviewBtn.addEventListener('mouseenter', () => {
        const hoverIcon = EXIT_ICONS_HOVER[theme];
        if (hoverIcon) newPreviewIcon.src = hoverIcon;
      });
      newPreviewBtn.addEventListener('mouseleave', () => {
        const defaultIcon = EXIT_ICONS[theme];
        if (defaultIcon) newPreviewIcon.src = defaultIcon;
      });
    }
  }
}

function updateHudIcons(theme: ThemeId): void {
  const icons = THEME_ICONS[theme];
  if (!icons) return;
  const blueIcon = document.querySelector('.game-hud--preview-style .preview__scores img:first-of-type') as HTMLImageElement;
  const orangeIcon = document.querySelector('.game-hud--preview-style .preview__scores img:last-of-type') as HTMLImageElement;
  const exitIcon = document.getElementById('exitGameIcon') as HTMLImageElement;
  const currentPlayerImg = document.getElementById('currentPlayerImg') as HTMLImageElement;
  
  if (blueIcon) blueIcon.src = icons.blue;
  if (orangeIcon) orangeIcon.src = icons.orange;
  if (exitIcon) exitIcon.src = EXIT_ICONS[theme];
  
  updateExitTexts(theme);
  setupExitButtonHover(theme);

  const currentPlayer = (window as any).game?.state?.currentPlayer || state.selectedPlayer;
  if (currentPlayerImg) {
    currentPlayerImg.src = getCurrentPlayerIcon(theme, currentPlayer);
    currentPlayerImg.classList.remove('player-blue', 'player-orange');
    currentPlayerImg.classList.add(`player-${currentPlayer}`);
  }
}

function updateCurrentPlayer(player: 'blue' | 'orange'): void {
  const img = document.getElementById('currentPlayerImg') as HTMLImageElement;
  if (!img) return;
  img.src = getCurrentPlayerIcon(state.selectedTheme, player);
  img.alt = player === 'blue' ? 'Blue Player' : 'Orange Player';
  img.classList.remove('player-blue', 'player-orange');
  img.classList.add(`player-${player}`);
}

function renderGameUi(gameInstance: GameController): void {
  const blueScoreEl = document.getElementById('blueScore') as HTMLElement;
  const orangeScoreEl = document.getElementById('orangeScore') as HTMLElement;
  if (!blueScoreEl || !orangeScoreEl) return;
  
  const isCodeTheme = state.selectedTheme === 'code';
  const { blueMatches, orangeMatches } = gameInstance.state;
  blueScoreEl.textContent = isCodeTheme ? `Blue ${blueMatches}` : `${blueMatches}`;
  orangeScoreEl.textContent = isCodeTheme ? `Orange ${orangeMatches}` : `${orangeMatches}`;
  updateCurrentPlayer(gameInstance.state.currentPlayer);
}

function updateThemePreview(): void {
  const gameScreen = document.getElementById('screen-game') as HTMLElement;
  const resultScreen = document.getElementById('screen-result') as HTMLElement;
  const previewRoot = document.getElementById('theme-preview') as HTMLElement;
  const previewImgMain = document.getElementById('preview-img-main') as HTMLImageElement;
  const previewImgSub = document.getElementById('preview-img-sub') as HTMLImageElement;
  const previewExitIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  
  const theme = state.selectedTheme;
  const hovered = state.hoveredTheme;
  const themeToShow = hovered || theme;

  if (gameScreen) {
    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${theme}`);
  }
  if (resultScreen) {
    resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    resultScreen.classList.add(`theme-${theme}`);
  }

  if (previewRoot) {
    previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    previewRoot.classList.add(`preview--${themeToShow}`);
  }

  const PREVIEW_CONFIG = {
    code: { main: './assets/Settings/Cards 5/Cards 5_2.svg', sub: './assets/Settings/Cards 5/Cards 5.svg' },
    games: { main: './assets/Settings/Cards 5/Rectangle 40.svg', sub: './assets/Settings/Cards 5/Front.svg' },
    da: { main: './assets/Settings/Cards 5/Frame 727.svg', sub: './assets/Settings/Cards 5/Frame 728.svg' },
    food: { main: './assets/Settings/Cards 5/frond.svg', sub: './assets/Settings/Cards 5/frond_foods.svg' },
  };
  const config = PREVIEW_CONFIG[themeToShow];
  if (config) {
    if (previewImgMain) previewImgMain.src = config.main;
    if (previewImgSub) previewImgSub.src = config.sub;
  }
  if (previewExitIcon) previewExitIcon.src = EXIT_ICONS[themeToShow];
  
  updateHudIcons(theme);
  updateResultBackText(theme);
}

// ============================================
// GAME START
// ============================================

function startGameFromSettings(renderer: Renderer, game: GameController): void {
  const theme = state.selectedTheme;
  const grid = state.selectedGrid;
  const player = state.selectedPlayer;

  renderer.setTheme(theme);
  renderer.setGrid(grid);

  const gameScreen = document.getElementById('screen-game') as HTMLElement;
  const resultScreen = document.getElementById('screen-result') as HTMLElement;
  const previewExitIcon = document.getElementById('previewExitIcon') as HTMLImageElement;

  if (gameScreen) {
    gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    gameScreen.classList.add(`theme-${theme}`);
  }
  if (resultScreen) {
    resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    resultScreen.classList.add(`theme-${theme}`);
  }

  updateHudIcons(theme);
  updateResultBackText(theme);
  if (previewExitIcon) previewExitIcon.src = EXIT_ICONS[theme];

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

// ============================================
// GAME CALLBACKS
// ============================================

function handleGameWin(
  { blueMatches, orangeMatches, winner }: { blueMatches: number; orangeMatches: number; winner: 'blue' | 'orange' | 'tie' }
): void {
  const resultScreen = document.getElementById('screen-result') as HTMLElement;
  const resultGameover = document.getElementById('result-gameover') as HTMLElement;
  const resultWinner = document.getElementById('result-winner') as HTMLElement;
  const resultDraw = document.getElementById('result-draw') as HTMLElement;
  const resultBlueScore = document.getElementById('result-blue-score') as HTMLElement;
  const resultOrangeScore = document.getElementById('result-orange-score') as HTMLElement;
  const resultWinnerTitle = document.getElementById('result-winner-title') as HTMLElement;

  const isCodeTheme = state.selectedTheme === 'code';
  resultBlueScore.textContent = isCodeTheme ? `Blue ${blueMatches}` : String(blueMatches);
  resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeMatches}` : String(orangeMatches);

  resultScreen.classList.remove(
    'result-screen--winner-blue',
    'result-screen--winner-orange',
    'result-screen--draw',
    'result-screen--gameover'
  );

  const isGameOver = winner !== 'tie' && winner !== state.selectedPlayer;

  if (isGameOver) {
    resultScreen.classList.add('result-screen--gameover');
    resultGameover.style.display = 'block';
    resultWinner.style.display = 'none';
    resultDraw.style.display = 'none';
  } else if (winner === 'tie') {
    resultScreen.classList.add('result-screen--draw');
    resultDraw.style.display = 'block';
    resultWinner.style.display = 'none';
    resultGameover.style.display = 'none';
  } else {
    resultScreen.classList.add(`result-screen--winner-${winner}`);
    resultWinner.style.display = 'flex';
    resultGameover.style.display = 'none';
    resultDraw.style.display = 'none';
    resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
    resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
  }
  showScreen('result');
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupThemeRadios(renderer: Renderer): void {
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const theme = radio.value as ThemeId;
      if (!VALID_THEMES.includes(theme)) return;
      state.selectedTheme = theme;
      renderer.setTheme(theme);
      updateThemePreview();
    });
  });
}

function setupPlayerRadios(): void {
  document.querySelectorAll<HTMLInputElement>('input[name="startingPlayer"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const player = radio.value as PlayerColor;
      if (!VALID_PLAYERS.includes(player)) return;
      state.selectedPlayer = player;
    });
  });
}

function setupGridRadios(renderer: Renderer): void {
  document.querySelectorAll<HTMLInputElement>('input[name="grid"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const grid = Number(radio.value) as GridSize;
      if (!VALID_GRID_SIZES.includes(grid)) return;
      state.selectedGrid = grid;
      renderer.setGrid(grid);
    });
  });
}

function setupPreviewHover(): void {
  document.querySelectorAll<HTMLLabelElement>('.radio-item').forEach((label) => {
    const radio = label.querySelector<HTMLInputElement>('.radio-input');
    if (!radio || radio.name !== 'theme') return;
    label.addEventListener('mouseenter', () => {
      const themeValue = radio.value as ThemeId;
      if (VALID_THEMES.includes(themeValue)) {
        state.hoveredTheme = themeValue;
        updateThemePreview();
      }
    });
    label.addEventListener('mouseleave', () => {
      state.hoveredTheme = null;
      updateThemePreview();
    });
  });
}

function setupBoardClick(game: GameController): void {
  const field = document.getElementById('field') as HTMLElement;
  if (!field) return;
  field.addEventListener('click', (e: MouseEvent) => {
    const cardEl = (e.target as HTMLElement).closest<HTMLButtonElement>('.card');
    if (!cardEl) return;
    const cardId = cardEl.dataset.id;
    if (!cardId) return;
    game.handleCardClick(cardId);
  });
}

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === '1') { e.preventDefault(); testResultScreen('blue', 5, 3); }
    if (e.altKey && e.key === '2') { e.preventDefault(); testResultScreen('orange', 2, 4); }
    if (e.altKey && e.key === '3') { e.preventDefault(); testResultScreen('tie', 3, 3); }
    if (e.altKey && e.key === '4') { e.preventDefault(); testResultScreen('gameover', 4, 2); }
  });
}

// ============================================
// MAIN INIT FUNCTION
// ============================================

function init(): void {
  const field = assertEl(document.getElementById('field'), 'Missing #field');
  const renderer = new Renderer(field);

  const game = new GameController(renderer, {
    theme: state.selectedTheme,
    gridSize: state.selectedGrid,
    startingPlayer: state.selectedPlayer,
    pairs: pairsFromGrid(state.selectedGrid),
    flipBackDelayMs: 700,
  });

  // Make game globally available
  (window as any).game = game;

  // Game Callbacks
  game.onStateChange(() => renderGameUi(game));
  game.onWin((payload) => handleGameWin(payload));

  // Setup UI
  updateThemePreview();
  renderer.setTheme(state.selectedTheme);
  renderer.setGrid(state.selectedGrid);
  showScreen('home');

  // Setup Event Listeners
  const btnGoSettings = assertEl(document.getElementById('btn-go-settings'), 'Missing #btn-go-settings');
  const btnStartGame = assertEl(document.getElementById('btn-start-game'), 'Missing #btn-start-game');
  const btnBackToGame = assertEl(document.getElementById('btn-back-to-game'), 'Missing #btn-back-to-game');
  const btnConfirmExit = assertEl(document.getElementById('btn-confirm-exit'), 'Missing #btn-confirm-exit');
  const btnResultBack = assertEl(document.getElementById('btn-result-back'), 'Missing #btn-result-back');
  const btnDrawBack = assertEl(document.getElementById('btn-draw-back'), 'Missing #btn-draw-back');
  const btnGameoverBack = assertEl(document.getElementById('btn-gameover-back'), 'Missing #btn-gameover-back');
  const exitModal = assertEl(document.getElementById('modal-exit'), 'Missing #modal-exit');

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

  setupThemeRadios(renderer);
  setupPlayerRadios();
  setupGridRadios(renderer);
  setupPreviewHover();
  setupBoardClick(game);
  setupKeyboardShortcuts();

  (window as any).testResultScreen = testResultScreen;
}

init();
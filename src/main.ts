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

// ============================================
// EXIT BUTTON HOVER - HELPER FUNCTIONS
// ============================================

function setupExitButtonEvents(exitBtn: HTMLButtonElement, exitModal: HTMLElement, theme: ThemeId): void {
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
}

function setupPreviewExitEvents(previewBtn: Element, previewIcon: HTMLImageElement, theme: ThemeId): void {
  const newPreviewBtn = previewBtn.cloneNode(true) as HTMLButtonElement;
  previewBtn.parentNode?.replaceChild(newPreviewBtn, previewBtn);
  const newPreviewIcon = newPreviewBtn.querySelector('#previewExitIcon') as HTMLImageElement;
  if (!newPreviewIcon) return;

  newPreviewBtn.addEventListener('mouseenter', () => {
    const hoverIcon = EXIT_ICONS_HOVER[theme];
    if (hoverIcon) newPreviewIcon.src = hoverIcon;
  });
  newPreviewBtn.addEventListener('mouseleave', () => {
    const defaultIcon = EXIT_ICONS[theme];
    if (defaultIcon) newPreviewIcon.src = defaultIcon;
  });
}

function setupExitButtonHover(theme: ThemeId): void {
  const exitBtn = document.getElementById('btn-exit-game') as HTMLButtonElement;
  const exitModal = document.getElementById('modal-exit') as HTMLElement;
  if (!exitBtn || !exitModal) return;

  setupExitButtonEvents(exitBtn, exitModal, theme);

  const previewBtn = document.querySelector('.preview-exit');
  const previewIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (previewBtn && previewIcon) {
    setupPreviewExitEvents(previewBtn, previewIcon, theme);
  }
}

// ============================================
// HUD ICONS - HELPER FUNCTIONS
// ============================================

function getHudIcons() {
  return {
    blueIcon: document.querySelector('.game-hud--preview-style .preview__scores img:first-of-type') as HTMLImageElement,
    orangeIcon: document.querySelector('.game-hud--preview-style .preview__scores img:last-of-type') as HTMLImageElement,
    exitIcon: document.getElementById('exitGameIcon') as HTMLImageElement,
    currentPlayerImg: document.getElementById('currentPlayerImg') as HTMLImageElement,
  };
}

function setHudIconSources(theme: ThemeId, icons: ReturnType<typeof getHudIcons>): void {
  const themeIcons = THEME_ICONS[theme];
  if (!themeIcons) return;
  if (icons.blueIcon) icons.blueIcon.src = themeIcons.blue;
  if (icons.orangeIcon) icons.orangeIcon.src = themeIcons.orange;
  if (icons.exitIcon) icons.exitIcon.src = EXIT_ICONS[theme];
}

function updateHudPlayerIcon(theme: ThemeId, img: HTMLImageElement): void {
  const currentPlayer = (window as any).game?.state?.currentPlayer || state.selectedPlayer;
  if (img) {
    img.src = getCurrentPlayerIcon(theme, currentPlayer);
    img.classList.remove('player-blue', 'player-orange');
    img.classList.add(`player-${currentPlayer}`);
  }
}

function updateHudIcons(theme: ThemeId): void {
  const icons = getHudIcons();
  setHudIconSources(theme, icons);
  updateExitTexts(theme);
  setupExitButtonHover(theme);
  updateHudPlayerIcon(theme, icons.currentPlayerImg);
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

// ============================================
// THEME PREVIEW - HELPER FUNCTIONS
// ============================================

function getThemeElements() {
  return {
    gameScreen: document.getElementById('screen-game') as HTMLElement,
    resultScreen: document.getElementById('screen-result') as HTMLElement,
    previewRoot: document.getElementById('theme-preview') as HTMLElement,
    previewImgMain: document.getElementById('preview-img-main') as HTMLImageElement,
    previewImgSub: document.getElementById('preview-img-sub') as HTMLImageElement,
    previewExitIcon: document.getElementById('previewExitIcon') as HTMLImageElement,
  };
}

function applyThemeClasses(elements: ReturnType<typeof getThemeElements>, theme: ThemeId): void {
  if (elements.gameScreen) {
    elements.gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    elements.gameScreen.classList.add(`theme-${theme}`);
  }
  if (elements.resultScreen) {
    elements.resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    elements.resultScreen.classList.add(`theme-${theme}`);
  }
}

function applyPreviewTheme(elements: ReturnType<typeof getThemeElements>, themeToShow: ThemeId): void {
  if (elements.previewRoot) {
    elements.previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    elements.previewRoot.classList.add(`preview--${themeToShow}`);
  }

  const PREVIEW_CONFIG = {
    code: { main: './assets/Settings/Cards 5/Cards 5_2.svg', sub: './assets/Settings/Cards 5/Cards 5.svg' },
    games: { main: './assets/Settings/Cards 5/Rectangle 40.svg', sub: './assets/Settings/Cards 5/Front.svg' },
    da: { main: './assets/Settings/Cards 5/Frame 727.svg', sub: './assets/Settings/Cards 5/Frame 728.svg' },
    food: { main: './assets/Settings/Cards 5/frond.svg', sub: './assets/Settings/Cards 5/frond_foods.svg' },
  };
  const config = PREVIEW_CONFIG[themeToShow];
  if (config) {
    if (elements.previewImgMain) elements.previewImgMain.src = config.main;
    if (elements.previewImgSub) elements.previewImgSub.src = config.sub;
  }
  if (elements.previewExitIcon) elements.previewExitIcon.src = EXIT_ICONS[themeToShow];
}

function updateThemePreview(): void {
  const elements = getThemeElements();
  const theme = state.selectedTheme;
  const hovered = state.hoveredTheme;
  const themeToShow = hovered || theme;

  applyThemeClasses(elements, theme);
  applyPreviewTheme(elements, themeToShow);
  
  updateHudIcons(theme);
  updateResultBackText(theme);
}

// ============================================
// GAME START - HELPER FUNCTIONS
// ============================================

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

function updateGamePreviewIcon(theme: ThemeId): void {
  const previewExitIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (previewExitIcon) previewExitIcon.src = EXIT_ICONS[theme];
}

function configureAndStartGame(renderer: Renderer, game: GameController): void {
  const theme = state.selectedTheme;
  const grid = state.selectedGrid;
  const player = state.selectedPlayer;

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

function startGameFromSettings(renderer: Renderer, game: GameController): void {
  const theme = state.selectedTheme;
  const grid = state.selectedGrid;

  renderer.setTheme(theme);
  renderer.setGrid(grid);

  applyGameThemeClasses(theme);
  updateHudIcons(theme);
  updateResultBackText(theme);
  updateGamePreviewIcon(theme);

  configureAndStartGame(renderer, game);
}

// ============================================
// GAME WIN - HELPER FUNCTIONS
// ============================================

function getResultElements() {
  return {
    resultScreen: document.getElementById('screen-result') as HTMLElement,
    resultGameover: document.getElementById('result-gameover') as HTMLElement,
    resultWinner: document.getElementById('result-winner') as HTMLElement,
    resultDraw: document.getElementById('result-draw') as HTMLElement,
    resultBlueScore: document.getElementById('result-blue-score') as HTMLElement,
    resultOrangeScore: document.getElementById('result-orange-score') as HTMLElement,
    resultWinnerTitle: document.getElementById('result-winner-title') as HTMLElement,
  };
}

function setResultScores(elements: ReturnType<typeof getResultElements>, blueMatches: number, orangeMatches: number): void {
  const isCodeTheme = state.selectedTheme === 'code';
  elements.resultBlueScore.textContent = isCodeTheme ? `Blue ${blueMatches}` : String(blueMatches);
  elements.resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeMatches}` : String(orangeMatches);
}

function showGameOverScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultScreen.classList.add('result-screen--gameover');
  elements.resultGameover.style.display = 'block';
  elements.resultWinner.style.display = 'none';
  elements.resultDraw.style.display = 'none';
}

function showDrawScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultScreen.classList.add('result-screen--draw');
  elements.resultDraw.style.display = 'block';
  elements.resultWinner.style.display = 'none';
  elements.resultGameover.style.display = 'none';
}

function showWinnerScreen(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  elements.resultScreen.classList.add(`result-screen--winner-${winner}`);
  elements.resultWinner.style.display = 'flex';
  elements.resultGameover.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  elements.resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
  elements.resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
}

function handleGameWin(
  { blueMatches, orangeMatches, winner }: { blueMatches: number; orangeMatches: number; winner: 'blue' | 'orange' | 'tie' }
): void {
  const elements = getResultElements();
  elements.resultScreen.classList.remove(
    'result-screen--winner-blue',
    'result-screen--winner-orange',
    'result-screen--draw',
    'result-screen--gameover'
  );
  setResultScores(elements, blueMatches, orangeMatches);
  const isGameOver = winner !== 'tie' && winner !== state.selectedPlayer;
  if (isGameOver) {
    showGameOverScreen(elements);
  } else if (winner === 'tie') {
    showDrawScreen(elements);
  } else {
    showWinnerScreen(elements, winner);
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
// INIT - HELPER FUNCTIONS
// ============================================

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

init();
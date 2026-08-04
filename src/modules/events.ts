import { GameController } from '../app/controllers/gameController';
import { Renderer } from '../app/ui/renderer';
import { state } from './state';
import { updateThemePreview } from './theme';
import { startGameFromSettings } from './game';
import { resetAndRestartGame, resetAndGoToSettings } from './reset';
import { testResultScreen } from './test';
import { EXIT_ICONS_HOVER, EXIT_ICONS, VALID_THEMES, VALID_PLAYERS, VALID_GRID_SIZES, THEME_NAMES, PLAYER_NAMES, GRID_NAMES } from './constants';
import type { ThemeId, GridSize, PlayerColor } from '../app/core/types';

/**
 * Updates the settings navigation with current selections.
 */
function updateSettingsNavigation(): void {
  const themeDisplay = document.getElementById('settings-theme-display');
  const playerDisplay = document.getElementById('settings-player-display');
  const gridDisplay = document.getElementById('settings-grid-display');
  
  if (themeDisplay) {
    themeDisplay.textContent = state.selectedTheme ? THEME_NAMES[state.selectedTheme] : 'Game theme';
  }
  
  if (playerDisplay) {
    playerDisplay.textContent = state.selectedPlayer ? PLAYER_NAMES[state.selectedPlayer] : 'Player';
  }
  
  if (gridDisplay) {
    gridDisplay.textContent = state.selectedGrid ? GRID_NAMES[state.selectedGrid] : 'Board size';
  }
}

/**
 * Validates if all settings are selected and updates the start button state.
 */
function validateSettings(): void {
  const startBtn = document.getElementById('btn-start-game') as HTMLButtonElement;
  if (!startBtn) return;
  
  const themeSelected = state.selectedTheme !== null;
  const playerSelected = state.selectedPlayer !== null;
  const gridSelected = state.selectedGrid !== null;
  
  startBtn.disabled = !(themeSelected && playerSelected && gridSelected);
  
  // Update navigation display
  updateSettingsNavigation();
}

/**
 * Sets up hover events for radio items to show preview and activate radio dot.
 */
function setupRadioItemHover(): void {
  document.querySelectorAll<HTMLLabelElement>('.radio-item').forEach((label) => {
    const radio = label.querySelector<HTMLInputElement>('.radio-input');
    if (!radio) return;
    
    label.addEventListener('mouseenter', () => {
      // For theme radios: update preview
      if (radio.name === 'theme') {
        const themeValue = radio.value as ThemeId;
        if (VALID_THEMES.includes(themeValue)) {
          state.hoveredTheme = themeValue;
          updateThemePreview();
        }
      }
      
      // Activate radio dot on hover (add active class)
      const dot = label.querySelector('.radio-dot');
      if (dot) {
        dot.classList.add('active');
      }
    });
    
    label.addEventListener('mouseleave', () => {
      // For theme radios: clear hover preview
      if (radio.name === 'theme') {
        state.hoveredTheme = null;
        updateThemePreview();
      }
      
      // Remove active class from radio dot
      const dot = label.querySelector('.radio-dot');
      if (dot) {
        dot.classList.remove('active');
      }
    });
  });
}

/**
 * Sets up hover and click events for the exit button.
 * @param exitBtn - The exit button element
 * @param exitModal - The exit confirmation modal element
 * @param theme - The current theme
 * @param game - The game controller instance
 * @param renderer - The renderer instance
 */
export function setupExitButtonEvents(
  exitBtn: HTMLButtonElement, 
  exitModal: HTMLElement, 
  theme: ThemeId,
  game: GameController,
  renderer: Renderer
): void {
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
  newExitBtn.addEventListener('click', () => { 
    exitModal.style.display = 'flex'; 
  });
}

/**
 * Sets up hover events for the preview exit button.
 * @param previewBtn - The preview exit button element
 * @param previewIcon - The preview exit icon image element
 * @param theme - The current theme
 */
export function setupPreviewExitEvents(previewBtn: Element, previewIcon: HTMLImageElement, theme: ThemeId): void {
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

/**
 * Sets up hover events for the exit button in the game screen.
 * @param theme - The current theme
 * @param game - The game controller instance
 * @param renderer - The renderer instance
 */
export function setupExitButtonHover(
  theme: ThemeId, 
  game: GameController, 
  renderer: Renderer
): void {
  const exitBtn = document.getElementById('btn-exit-game') as HTMLButtonElement;
  const exitModal = document.getElementById('modal-exit') as HTMLElement;
  if (!exitBtn || !exitModal) return;

  setupExitButtonEvents(exitBtn, exitModal, theme, game, renderer);

  const previewBtn = document.querySelector('.preview-exit');
  const previewIcon = document.getElementById('previewExitIcon') as HTMLImageElement;
  if (previewBtn && previewIcon) {
    setupPreviewExitEvents(previewBtn, previewIcon, theme);
  }
}

/**
 * Sets up change event listeners for theme radio buttons.
 * @param renderer - The renderer instance
 * @param game - The game controller instance (optional)
 */
export function setupThemeRadios(renderer: Renderer, game?: GameController): void {
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const theme = radio.value as ThemeId;
      if (!VALID_THEMES.includes(theme)) return;
      state.selectedTheme = theme;
      renderer.setTheme(theme);
      
      // Update theme preview with game and renderer if provided
      if (game) {
        updateThemePreview(game, renderer);
      } else {
        updateThemePreview();
      }
      
      validateSettings();
    });
  });
}

/**
 * Sets up change event listeners for player radio buttons.
 */
export function setupPlayerRadios(): void {
  document.querySelectorAll<HTMLInputElement>('input[name="startingPlayer"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const player = radio.value as PlayerColor;
      if (!VALID_PLAYERS.includes(player)) return;
      state.selectedPlayer = player;
      validateSettings();
    });
  });
}

/**
 * Sets up change event listeners for grid size radio buttons.
 * @param renderer - The renderer instance
 */
export function setupGridRadios(renderer: Renderer): void {
  document.querySelectorAll<HTMLInputElement>('input[name="grid"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const grid = Number(radio.value) as GridSize;
      if (!VALID_GRID_SIZES.includes(grid)) return;
      state.selectedGrid = grid;
      renderer.setGrid(grid);
      validateSettings();
    });
  });
}

/**
 * Sets up hover events for theme preview labels.
 */
export function setupPreviewHover(): void {
  setupRadioItemHover();
}

/**
 * Sets up click event listener for the game board.
 * @param game - The game controller instance
 */
export function setupBoardClick(game: GameController): void {
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

/**
 * Sets up keyboard shortcuts for testing.
 * @remarks Alt+1: Blue win, Alt+2: Orange win, Alt+3: Tie, Alt+4: Game over
 */
export function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === '1') { e.preventDefault(); testResultScreen('blue', 5, 3); }
    if (e.altKey && e.key === '2') { e.preventDefault(); testResultScreen('orange', 2, 4); }
    if (e.altKey && e.key === '3') { e.preventDefault(); testResultScreen('tie', 3, 3); }
    if (e.altKey && e.key === '4') { e.preventDefault(); testResultScreen('gameover', 4, 2); }
  });
}
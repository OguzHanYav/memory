import { GameController } from '../app/controllers/gameController';
import { state } from './state';
import { getCurrentPlayerIcon } from './helpers';
import { THEME_ICONS, EXIT_ICONS, EXIT_TEXTS, RESULT_BACK_TEXTS } from './constants';
import { setupExitButtonHover } from './events';
import type { ThemeId } from '../app/core/types';

/**
 * Updates exit popup texts based on the current theme.
 * @param theme - The current theme
 */
export function updateExitTexts(theme: ThemeId): void {
  const texts = EXIT_TEXTS[theme];
  if (!texts) return;
  const backEl = document.getElementById('back-to-game-text') as HTMLSpanElement;
  const confirmEl = document.getElementById('confirm-exit-text') as HTMLSpanElement;
  if (backEl) backEl.textContent = texts.back;
  if (confirmEl) confirmEl.textContent = texts.confirm;
}

/**
 * Updates result screen back button texts based on the current theme.
 * @param theme - The current theme
 */
export function updateResultBackText(theme: ThemeId): void {
  const text = RESULT_BACK_TEXTS[theme];
  if (!text) return;
  const resultEl = document.getElementById('result-back-text') as HTMLSpanElement;
  const drawEl = document.getElementById('draw-back-text') as HTMLSpanElement;
  const gameoverEl = document.getElementById('gameover-back-text') as HTMLSpanElement;
  if (resultEl) resultEl.textContent = text;
  if (drawEl) drawEl.textContent = text;
  if (gameoverEl) gameoverEl.textContent = text;
}

/**
 * Gets all HUD icon elements.
 * @returns Object containing HUD icon elements
 */
function getHudIcons() {
  return {
    blueIcon: document.querySelector('.game-hud--preview-style .preview__scores img:first-of-type') as HTMLImageElement,
    orangeIcon: document.querySelector('.game-hud--preview-style .preview__scores img:last-of-type') as HTMLImageElement,
    exitIcon: document.getElementById('exitGameIcon') as HTMLImageElement,
    currentPlayerImg: document.getElementById('currentPlayerImg') as HTMLImageElement,
  };
}

/**
 * Sets HUD icon sources based on the current theme.
 * @param theme - The current theme
 * @param icons - The HUD icon elements
 */
function setHudIconSources(theme: ThemeId, icons: ReturnType<typeof getHudIcons>): void {
  const themeIcons = THEME_ICONS[theme];
  if (!themeIcons) return;
  if (icons.blueIcon) icons.blueIcon.src = themeIcons.blue;
  if (icons.orangeIcon) icons.orangeIcon.src = themeIcons.orange;
  if (icons.exitIcon) icons.exitIcon.src = EXIT_ICONS[theme];
}

/**
 * Updates the current player icon in the HUD.
 * @param theme - The current theme
 * @param img - The player icon image element
 */
function updateHudPlayerIcon(theme: ThemeId, img: HTMLImageElement): void {
  const currentPlayer = (window as any).game?.state?.currentPlayer || state.selectedPlayer;
  if (img) {
    img.src = getCurrentPlayerIcon(theme, currentPlayer);
    img.classList.remove('player-blue', 'player-orange');
    img.classList.add(`player-${currentPlayer}`);
  }
}

/**
 * Updates all HUD icons and texts based on the current theme.
 * @param theme - The current theme
 */
export function updateHudIcons(theme: ThemeId): void {
  const icons = getHudIcons();
  setHudIconSources(theme, icons);
  updateExitTexts(theme);
  setupExitButtonHover(theme);
  updateHudPlayerIcon(theme, icons.currentPlayerImg);
}

/**
 * Updates the current player indicator in the HUD.
 * @param player - The current player color
 */
export function updateCurrentPlayer(player: 'blue' | 'orange'): void {
  const img = document.getElementById('currentPlayerImg') as HTMLImageElement;
  if (!img) return;
  img.src = getCurrentPlayerIcon(state.selectedTheme, player);
  img.alt = player === 'blue' ? 'Blue Player' : 'Orange Player';
  img.classList.remove('player-blue', 'player-orange');
  img.classList.add(`player-${player}`);
}

/**
 * Renders the game UI with current scores and player.
 * @param gameInstance - The game controller instance
 */
export function renderGameUi(gameInstance: GameController): void {
  const blueScoreEl = document.getElementById('blueScore') as HTMLElement;
  const orangeScoreEl = document.getElementById('orangeScore') as HTMLElement;
  if (!blueScoreEl || !orangeScoreEl) return;
  
  const isCodeTheme = state.selectedTheme === 'code';
  const { blueMatches, orangeMatches } = gameInstance.state;
  blueScoreEl.textContent = isCodeTheme ? `Blue ${blueMatches}` : `${blueMatches}`;
  orangeScoreEl.textContent = isCodeTheme ? `Orange ${orangeMatches}` : `${orangeMatches}`;
  updateCurrentPlayer(gameInstance.state.currentPlayer);
}
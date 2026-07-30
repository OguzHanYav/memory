import { GameController } from '../app/controllers/GameController';
import { state } from './state';
import { getCurrentPlayerIcon } from './helpers';
import { THEME_ICONS, EXIT_ICONS, EXIT_TEXTS, RESULT_BACK_TEXTS } from './constants';
import { setupExitButtonHover } from './events';
import type { ThemeId } from '../app/core/types';

export function updateExitTexts(theme: ThemeId): void {
  const texts = EXIT_TEXTS[theme];
  if (!texts) return;
  const backEl = document.getElementById('back-to-game-text') as HTMLSpanElement;
  const confirmEl = document.getElementById('confirm-exit-text') as HTMLSpanElement;
  if (backEl) backEl.textContent = texts.back;
  if (confirmEl) confirmEl.textContent = texts.confirm;
}

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

export function updateHudIcons(theme: ThemeId): void {
  const icons = getHudIcons();
  setHudIconSources(theme, icons);
  updateExitTexts(theme);
  setupExitButtonHover(theme);
  updateHudPlayerIcon(theme, icons.currentPlayerImg);
}

export function updateCurrentPlayer(player: 'blue' | 'orange'): void {
  const img = document.getElementById('currentPlayerImg') as HTMLImageElement;
  if (!img) return;
  img.src = getCurrentPlayerIcon(state.selectedTheme, player);
  img.alt = player === 'blue' ? 'Blue Player' : 'Orange Player';
  img.classList.remove('player-blue', 'player-orange');
  img.classList.add(`player-${player}`);
}

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
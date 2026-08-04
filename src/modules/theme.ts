import { state } from './state';
import { PREVIEW_CONFIG, EXIT_ICONS } from './constants';
import { updateHudIcons, updateResultBackText } from './hud';
import type { ThemeId } from '../app/core/types';

/**
 * Gets all theme-related DOM elements.
 * @returns Object containing theme elements
 */
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

/**
 * Applies theme classes to game and result screens.
 * @param elements - The theme elements
 * @param theme - The theme to apply
 */
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

/**
 * Applies preview theme to the preview section.
 * @param elements - The theme elements
 * @param themeToShow - The theme to display in preview
 */
function applyPreviewTheme(elements: ReturnType<typeof getThemeElements>, themeToShow: ThemeId): void {
  if (elements.previewRoot) {
    elements.previewRoot.classList.remove('preview--code', 'preview--games', 'preview--da', 'preview--food');
    elements.previewRoot.classList.add(`preview--${themeToShow}`);
  }
  const config = PREVIEW_CONFIG[themeToShow];
  if (config) {
    if (elements.previewImgMain) elements.previewImgMain.src = config.main;
    if (elements.previewImgSub) elements.previewImgSub.src = config.sub;
  }
  if (elements.previewExitIcon) elements.previewExitIcon.src = EXIT_ICONS[themeToShow];
}

/**
 * Updates HUD with the current theme.
 * @param theme - The current theme
 * @param game - The game controller instance (optional)
 * @param renderer - The renderer instance (optional)
 */
function updateHudWithTheme(theme: ThemeId, game?: any, renderer?: any): void {
  if (game && renderer) {
    updateHudIcons(theme, game, renderer);
  } else {
    updateHudIcons(theme);
  }
}

/**
 * Updates the theme preview based on selected and hovered themes.
 * @param game - The game controller instance (optional)
 * @param renderer - The renderer instance (optional)
 */
export function updateThemePreview(game?: any, renderer?: any): void {
  const elements = getThemeElements();
  const theme = state.selectedTheme || 'code';
  const hovered = state.hoveredTheme;
  const themeToShow = hovered || theme;
  applyThemeClasses(elements, theme);
  applyPreviewTheme(elements, themeToShow);
  updateHudWithTheme(theme, game, renderer);
  updateResultBackText(theme);
}
import type { ThemeId } from '../app/core/types';

export const THEME_ICONS: Record<ThemeId, { blue: string; orange: string }> = {
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

export const THEME_NAMES: Record<ThemeId, string> = {
  code: 'Code vibes theme',
  games: 'Gaming theme',
  da: 'DA Projects theme',
  food: 'Foods theme',
};

export const PLAYER_NAMES: Record<string, string> = {
  blue: 'Blue',
  orange: 'Orange',
};

export const GRID_NAMES: Record<number, string> = {
  16: '16 cards',
  24: '24 cards',
  36: '36 cards',
};

export const EXIT_ICONS: Record<ThemeId, string> = {
  code: './assets/Settings/topbar/move_item.svg',
  games: './assets/Settings/topbar/move_item.svg',
  da: './assets/game-hud/DA-Theme/move_item.svg',
  food: './assets/game-hud/FOOD-Theme/move_item.svg',
};

export const EXIT_ICONS_HOVER: Record<ThemeId, string> = {
  code: '',
  games: './assets/game-hud/GAME-Theme/move_item.svg',
  da: './assets/Settings/topbar/move_item.svg',
  food: './assets/Settings/topbar/move_item.svg',
};

export const EXIT_TEXTS: Record<ThemeId, { back: string; confirm: string }> = {
  code: { back: 'Back to game', confirm: 'Exit game' },
  games: { back: 'No, back to game', confirm: 'Yes, quit game' },
  da: { back: 'Back to game', confirm: 'Exit game' },
  food: { back: 'NO, BACK TO GAME', confirm: 'EXIT GAME' },
};

export const RESULT_BACK_TEXTS: Record<ThemeId, string> = {
  code: 'Back to start',
  games: 'Home',
  da: 'Home',
  food: 'Home',
};

export const VALID_THEMES: ThemeId[] = ['code', 'games', 'da', 'food'];
export const VALID_GRID_SIZES: number[] = [16, 24, 36];
export const VALID_PLAYERS: string[] = ['blue', 'orange'];

export const PREVIEW_CONFIG = {
  code: { main: './assets/Settings/Cards 5/Cards 5_2.svg', sub: './assets/Settings/Cards 5/Cards 5.svg' },
  games: { main: './assets/Settings/Cards 5/Rectangle 40.svg', sub: './assets/Settings/Cards 5/Front.svg' },
  da: { main: './assets/Settings/Cards 5/Frame 727.svg', sub: './assets/Settings/Cards 5/Frame 728.svg' },
  food: { main: './assets/Settings/Cards 5/frond.svg', sub: './assets/Settings/Cards 5/frond_foods.svg' },
};
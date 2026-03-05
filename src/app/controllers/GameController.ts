import { DEFAULT_GAME_CONFIG } from '../core/config';
import type { CardData, GameConfig, ThemeId } from '../core/types';
import { Card } from '../models/Card';
import { GameState } from '../models/GameState';
import { shuffle } from '../utils/shuffle';
import { Renderer } from '../ui/Renderer';

type WinPayload = {
  moves: number;
  blueMatches: number;
  orangeMatches: number;
  winner: 'blue' | 'orange' | 'tie';
};

/**
 * AUTO IMPORT (Vite):
 * SVGs MUST be inside /src (not /public), otherwise import.meta.glob won't work.
 *
 * Expected structure:
 * /src/assets/cards/<theme>/back.svg
 * /src/assets/cards/<theme>/front-01.svg ... front-18.svg
 *
 * Themes (folders):
 * code | games | da | food
 */

const VALID_THEMES: ThemeId[] = ['code', 'games', 'da', 'food'];

// 1) Import all fronts as URLs (ONLY *.svg, so "front-01..18" junk files won't match)
const FRONT_URLS = import.meta.glob('/src/assets/cards/*/front-*.svg', {
  eager: true,
  as: 'url',
}) as Record<string, string>;

// 2) Import all backs as URLs
const BACK_URLS = import.meta.glob('/src/assets/cards/*/back.svg', {
  eager: true,
  as: 'url',
}) as Record<string, string>;

function themeFromPath(path: string): ThemeId {
  // "/src/assets/cards/da/front-01.svg" -> "da"
  const parts = path.split('/');
  const idx = parts.findIndex(p => p === 'cards');
  const theme = parts[idx + 1] as ThemeId | undefined;

  if (!theme || !VALID_THEMES.includes(theme)) {
    throw new Error(`Unknown theme folder in path: ${path}`);
  }

  return theme;
}

function frontIndexFromPath(path: string): number {
  // ".../front-01.svg" -> 1
  const m = path.match(/front-(\d+)\.svg$/);
  if (!m) return 9999;
  return Number(m[1]);
}

type ThemeAssets = Record<ThemeId, { back: string; fronts: string[] }>;

function buildThemeAssets(): ThemeAssets {
  const map: ThemeAssets = {
    code: { back: '', fronts: [] },
    games: { back: '', fronts: [] },
    da: { back: '', fronts: [] },
    food: { back: '', fronts: [] },
  };

  // backs
  for (const [path, url] of Object.entries(BACK_URLS)) {
    const theme = themeFromPath(path);
    map[theme].back = url;
  }

  // fronts grouped
  const byTheme: Record<ThemeId, { path: string; url: string }[]> = {
    code: [],
    games: [],
    da: [],
    food: [],
  };

  for (const [path, url] of Object.entries(FRONT_URLS)) {
    const theme = themeFromPath(path);
    byTheme[theme].push({ path, url });
  }

  // sort fronts by front-XX number
  for (const theme of VALID_THEMES) {
    map[theme].fronts = byTheme[theme]
      .sort((a, b) => frontIndexFromPath(a.path) - frontIndexFromPath(b.path))
      .map(x => x.url);
  }

  // validation: warn loudly if something is off
  for (const theme of VALID_THEMES) {
    if (!map[theme].back) {
      console.warn(`[assets] Missing back.svg for theme "${theme}" at src/assets/cards/${theme}/back.svg`);
    }

    const count = map[theme].fronts.length;
    if (count !== 18) {
      console.warn(
        `[assets] Theme "${theme}" has ${count} front svgs. Expected 18 (front-01.svg..front-18.svg).`
      );
    }

    // check missing numbers (1..18)
    const got = new Set(byTheme[theme].map(x => frontIndexFromPath(x.path)));
    for (let i = 1; i <= 18; i++) {
      if (!got.has(i)) {
        console.warn(`[assets] Theme "${theme}" missing front-${String(i).padStart(2, '0')}.svg`);
      }
    }
  }

  return map;
}

const THEME_ASSETS = buildThemeAssets();

export class GameController {
  readonly state = new GameState();

  private config: GameConfig;
  private renderer: Renderer;
  private winCallback?: (payload: WinPayload) => void;

  constructor(renderer: Renderer, config: Partial<GameConfig> = {}) {
    this.renderer = renderer;
    this.config = { ...DEFAULT_GAME_CONFIG, ...config };
  }

  updateConfig(config: Partial<GameConfig>) {
    this.config = { ...this.config, ...config };
  }

  onWin(cb: (payload: WinPayload) => void) {
    this.winCallback = cb;
  }

  startNewGame() {
    this.state.status = 'running';
    this.state.lockInput = false;
    this.state.moves = 0;
    this.state.blueMatches = 0;
    this.state.orangeMatches = 0;
    this.state.currentPlayer = this.config.startingPlayer;
    this.state.resetPicks();

    const cards = this.createDeck(this.config.theme, this.config.pairs);
    this.state.cards = cards;

    this.renderer.renderBoard(this.state.cards);
  }

  handleCardClick(cardId: string) {
    if (this.state.status !== 'running') return;
    if (this.state.lockInput) return;

    const card = this.getCard(cardId);
    if (!card) return;
    if (card.state !== 'hidden') return;

    card.state = 'revealed';
    this.renderer.updateCard(card);

    if (!this.state.firstPickId) {
      this.state.firstPickId = card.id;
      return;
    }

    // second pick
    this.state.secondPickId = card.id;
    this.state.moves += 1;

    this.evaluatePick();
  }

  reset() {
    this.startNewGame();
  }

  private evaluatePick() {
    const first = this.getCard(this.state.firstPickId);
    const second = this.getCard(this.state.secondPickId);
    if (!first || !second) {
      this.state.resetPicks();
      return;
    }

    this.state.lockInput = true;

    const isMatch = first.pairId === second.pairId;

    if (isMatch) {
      first.state = 'matched';
      second.state = 'matched';

      if (this.state.currentPlayer === 'blue') this.state.blueMatches += 1;
      else this.state.orangeMatches += 1;

      this.renderer.updateCard(first);
      this.renderer.updateCard(second);

      this.state.resetPicks();
      this.state.lockInput = false;

      if (this.state.blueMatches + this.state.orangeMatches === this.config.pairs) {
        this.state.status = 'won';
        this.finishGame();
      }

      return;
    }

    window.setTimeout(() => {
      first.state = 'hidden';
      second.state = 'hidden';

      this.renderer.updateCard(first);
      this.renderer.updateCard(second);

      this.state.resetPicks();
      this.state.switchPlayer();
      this.state.lockInput = false;
    }, this.config.flipBackDelayMs);
  }

  private finishGame() {
    let winner: 'blue' | 'orange' | 'tie' = 'tie';

    if (this.state.blueMatches > this.state.orangeMatches) winner = 'blue';
    if (this.state.orangeMatches > this.state.blueMatches) winner = 'orange';

    this.winCallback?.({
      moves: this.state.moves,
      blueMatches: this.state.blueMatches,
      orangeMatches: this.state.orangeMatches,
      winner,
    });
  }

  private getCard(id: string | null): CardData | undefined {
    if (!id) return undefined;
    return this.state.cards.find(c => c.id === id);
  }

  private createDeck(theme: ThemeId, pairs: number): CardData[] {
    const assets = THEME_ASSETS[theme];

    // if assets missing, fail gracefully (still warns above)
    if (!assets.back || assets.fronts.length === 0) {
      console.warn(`[assets] Theme "${theme}" assets incomplete. Using safe empty deck.`);
      return [];
    }

    const availablePairs = assets.fronts.length;
    const safePairs = Math.min(pairs, availablePairs);

    const pickedFronts = shuffle(assets.fronts).slice(0, safePairs);

    const all: Card[] = [];
    for (let i = 0; i < safePairs; i++) {
      const pairId = `pair-${i}`;
      const frontSrc = pickedFronts[i];

      all.push(new Card({ id: `c-${pairId}-a`, pairId, frontSrc, backSrc: assets.back }));
      all.push(new Card({ id: `c-${pairId}-b`, pairId, frontSrc, backSrc: assets.back }));
    }

    return shuffle(all).map(c => ({ ...c }));
  }
}
import { DEFAULT_GAME_CONFIG } from '../core/config';
import { Card } from '../models/cards';
import { GameState } from '../models/gameState';
import { Renderer } from '../ui/renderer';
import { shuffle } from '../utils/shuffle';

import type { CardData, GameConfig, ThemeId } from '../core/types';

// ============================================
// TYPES
// ============================================

type WinPayload = {
  moves: number;
  blueMatches: number;
  orangeMatches: number;
  winner: 'blue' | 'orange' | 'tie';
};

type ThemeAssets = Record<ThemeId, { back: string; fronts: string[] }>;

// ============================================
// CONSTANTS
// ============================================

const VALID_THEMES: ThemeId[] = ['code', 'games', 'da', 'food'];
const EXPECTED_FRONTS = 18;
const RESULT_DELAY_MS = 1000;

const FRONT_URLS = import.meta.glob('../../assets/cards/*/front-*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const BACK_URLS = import.meta.glob('../../assets/cards/*/back.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// ============================================
// HELPER FUNCTIONS
// ============================================

function themeFromPath(path: string): ThemeId {
  const parts = path.split('/');
  const cardsIndex = parts.findIndex((part) => part === 'cards');
  const theme = parts[cardsIndex + 1] as ThemeId | undefined;
  if (!theme || !VALID_THEMES.includes(theme)) {
    throw new Error(`Unknown theme folder in path: ${path}`);
  }
  return theme;
}

function frontIndexFromPath(path: string): number {
  const match = path.match(/front-(\d+)\.svg$/);
  return match ? Number(match[1]) : 9999;
}

function createEmptyThemeAssets(): ThemeAssets {
  return {
    code: { back: '', fronts: [] },
    games: { back: '', fronts: [] },
    da: { back: '', fronts: [] },
    food: { back: '', fronts: [] },
  };
}

function createEmptyByTheme(): Record<ThemeId, { path: string; url: string }[]> {
  return { code: [], games: [], da: [], food: [] };
}

function collectFrontsByTheme(): Record<ThemeId, { path: string; url: string }[]> {
  const byTheme = createEmptyByTheme();
  for (const [path, url] of Object.entries(FRONT_URLS)) {
    const theme = themeFromPath(path);
    byTheme[theme].push({ path, url });
  }
  return byTheme;
}

function assignFrontsToTheme(
  theme: ThemeId,
  items: { path: string; url: string }[]
): string[] {
  return items
    .sort((a, b) => frontIndexFromPath(a.path) - frontIndexFromPath(b.path))
    .map((item) => item.url);
}

function buildThemeAssets(): ThemeAssets {
  const map = createEmptyThemeAssets();
  for (const [path, url] of Object.entries(BACK_URLS)) {
    const theme = themeFromPath(path);
    map[theme].back = url;
  }
  const byTheme = collectFrontsByTheme();
  for (const theme of VALID_THEMES) {
    map[theme].fronts = assignFrontsToTheme(theme, byTheme[theme]);
  }
  return map;
}

function hasBackAsset(theme: ThemeId, assets: ThemeAssets): boolean {
  return !!assets[theme].back;
}

function hasCorrectFrontCount(theme: ThemeId, assets: ThemeAssets): boolean {
  return assets[theme].fronts.length === EXPECTED_FRONTS;
}

function warnMissingBack(theme: ThemeId): void {
  console.warn(
    `[assets] Missing back.svg for theme "${theme}" at src/assets/cards/${theme}/back.svg`
  );
}

function warnFrontCount(theme: ThemeId, count: number): void {
  console.warn(
    `[assets] Theme "${theme}" has ${count} front svgs. Expected ${EXPECTED_FRONTS}.`
  );
}

function warnMissingFrontNumber(theme: ThemeId, number: number): void {
  const padded = String(number).padStart(2, '0');
  console.warn(`[assets] Theme "${theme}" missing front-${padded}.svg`);
}

function extractNumberFromUrl(url: string): number {
  const match = url.match(/front-(\d+)\.svg$/);
  return match ? Number(match[1]) : 0;
}

function getExistingFrontNumbers(theme: ThemeId, assets: ThemeAssets): Set<number> {
  const numbers = assets[theme].fronts.map((url) => extractNumberFromUrl(url));
  return new Set(numbers);
}

function validateSingleTheme(theme: ThemeId, assets: ThemeAssets): void {
  if (!hasBackAsset(theme, assets)) {
    warnMissingBack(theme);
  }
  const frontCount = assets[theme].fronts.length;
  if (!hasCorrectFrontCount(theme, assets)) {
    warnFrontCount(theme, frontCount);
  }
  const existingNumbers = getExistingFrontNumbers(theme, assets);
  for (let i = 1; i <= EXPECTED_FRONTS; i++) {
    if (!existingNumbers.has(i)) {
      warnMissingFrontNumber(theme, i);
    }
  }
}

function validateThemeAssets(assets: ThemeAssets): void {
  for (const theme of VALID_THEMES) {
    validateSingleTheme(theme, assets);
  }
}

// ============================================
// GAME CONTROLLER
// ============================================

const THEME_ASSETS = buildThemeAssets();

export class GameController {
  readonly state = new GameState();
  private config: GameConfig;
  private renderer: Renderer;
  private winCallback?: (payload: WinPayload) => void;
  private stateChangeCallback?: () => void;

  constructor(renderer: Renderer, config: Partial<GameConfig> = {}) {
    this.renderer = renderer;
    this.config = { ...DEFAULT_GAME_CONFIG, ...config };
  }

  updateConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };
  }

  onWin(callback: (payload: WinPayload) => void): void {
    this.winCallback = callback;
  }

  onStateChange(callback: () => void): void {
    this.stateChangeCallback = callback;
  }

  startNewGame(): void {
    this.resetGameState();
    this.initializeDeck();
    this.renderer.renderBoard(this.state.cards);
    this.emitStateChange();
  }

  private resetGameState(): void {
    this.state.status = 'running';
    this.state.lockInput = false;
    this.state.moves = 0;
    this.state.blueMatches = 0;
    this.state.orangeMatches = 0;
    this.state.currentPlayer = this.config.startingPlayer;
    this.state.resetPicks();
  }

  private initializeDeck(): void {
    const cards = this.createDeck(this.config.theme, this.config.pairs);
    this.state.cards = cards;
  }

  handleCardClick(cardId: string): void {
    if (!this.canHandleClick()) return;
    const card = this.getCard(cardId);
    if (!card || card.state !== 'hidden') return;
    this.revealCard(card);
    if (!this.state.firstPickId) {
      this.state.firstPickId = card.id;
      return;
    }
    this.processSecondPick(card);
  }

  private canHandleClick(): boolean {
    return this.state.status === 'running' && !this.state.lockInput;
  }

  private revealCard(card: CardData): void {
    card.state = 'revealed';
    this.renderer.updateCard(card);
  }

  private processSecondPick(card: CardData): void {
    this.state.secondPickId = card.id;
    this.state.moves += 1;
    this.evaluatePick();
  }

  reset(): void {
    this.startNewGame();
  }

  private evaluatePick(): void {
    const first = this.getCard(this.state.firstPickId);
    const second = this.getCard(this.state.secondPickId);
    if (!first || !second) {
      this.state.resetPicks();
      return;
    }
    this.state.lockInput = true;
    if (first.pairId === second.pairId) {
      this.handleMatch(first, second);
    } else {
      this.handleMismatch(first, second);
    }
  }

  private handleMatch(first: CardData, second: CardData): void {
    this.markCardsAsMatched(first, second);
    this.incrementPlayerScore();
    this.updateMatchedCards(first, second);
    this.checkGameCompletion();
  }

  private markCardsAsMatched(first: CardData, second: CardData): void {
    first.state = 'matched';
    second.state = 'matched';
  }

  private incrementPlayerScore(): void {
    if (this.state.currentPlayer === 'blue') {
      this.state.blueMatches += 1;
    } else {
      this.state.orangeMatches += 1;
    }
  }

  private updateMatchedCards(first: CardData, second: CardData): void {
    this.renderer.updateCard(first);
    this.renderer.updateCard(second);
    this.state.resetPicks();
    this.state.lockInput = false;
    this.emitStateChange();
  }

  private checkGameCompletion(): void {
    const totalMatches = this.state.blueMatches + this.state.orangeMatches;
    if (totalMatches === this.config.pairs) {
      this.state.status = 'won';
      this.finishGameWithDelay();
    }
  }

  private handleMismatch(first: CardData, second: CardData): void {
    const delay = this.config.flipBackDelayMs;
    window.setTimeout(() => {
      this.hideMismatchedCards(first, second);
    }, delay);
  }

  private hideMismatchedCards(first: CardData, second: CardData): void {
    first.state = 'hidden';
    second.state = 'hidden';
    this.renderer.updateCard(first);
    this.renderer.updateCard(second);
    this.state.resetPicks();
    this.state.switchPlayer();
    this.emitStateChange();
    this.state.lockInput = false;
  }

  private finishGameWithDelay(): void {
    window.setTimeout(() => {
      this.finishGame();
    }, RESULT_DELAY_MS);
  }

  private finishGame(): void {
    const winner = this.determineWinner();
    this.emitStateChange();
    this.triggerWinCallback(winner);
  }

  private determineWinner(): 'blue' | 'orange' | 'tie' {
    const { blueMatches, orangeMatches } = this.state;
    if (blueMatches > orangeMatches) return 'blue';
    if (orangeMatches > blueMatches) return 'orange';
    return 'tie';
  }

  private triggerWinCallback(winner: 'blue' | 'orange' | 'tie'): void {
    this.winCallback?.({
      moves: this.state.moves,
      blueMatches: this.state.blueMatches,
      orangeMatches: this.state.orangeMatches,
      winner,
    });
  }

  private getCard(id: string | null): CardData | undefined {
    if (!id) return undefined;
    return this.state.cards.find((card: CardData) => card.id === id);
  }

  private createDeck(theme: ThemeId, pairs: number): CardData[] {
    const assets = THEME_ASSETS[theme];
    if (!assets.back || assets.fronts.length === 0) {
      console.warn(`[assets] Theme "${theme}" assets incomplete. Using safe empty deck.`);
      return [];
    }
    const safePairs = this.getSafePairs(assets.fronts.length, pairs);
    const pickedFronts = shuffle(assets.fronts).slice(0, safePairs);
    const cards = this.createCardPairs(pickedFronts, assets.back);
    return shuffle(cards).map((card) => ({ ...card }));
  }

  private getSafePairs(available: number, requested: number): number {
    return Math.min(requested, available);
  }

  private createCardPairs(fronts: string[], backSrc: string): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < fronts.length; i++) {
      const pairId = `pair-${i}`;
      const frontSrc = fronts[i];
      cards.push(
        new Card({ id: `c-${pairId}-a`, pairId, frontSrc, backSrc }),
        new Card({ id: `c-${pairId}-b`, pairId, frontSrc, backSrc })
      );
    }
    return cards;
  }

  private emitStateChange(): void {
    this.stateChangeCallback?.();
  }
}
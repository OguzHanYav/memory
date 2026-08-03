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

const FRONT_URLS = import.meta.glob('/src/assets/cards/*/front-*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const BACK_URLS = import.meta.glob('/src/assets/cards/*/back.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extracts the theme name from a file path.
 * @param path - The file path to extract the theme from
 * @returns The theme identifier
 * @throws {Error} If the theme is unknown or invalid
 */
function themeFromPath(path: string): ThemeId {
  const parts = path.split('/');
  const cardsIndex = parts.findIndex((part) => part === 'cards');
  const theme = parts[cardsIndex + 1] as ThemeId | undefined;

  if (!theme || !VALID_THEMES.includes(theme)) {
    throw new Error(`Unknown theme folder in path: ${path}`);
  }

  return theme;
}

/**
 * Extracts the front image number from a file path.
 * @param path - The file path containing a front-{number}.svg pattern
 * @returns The extracted number, or 9999 if no match is found
 */
function frontIndexFromPath(path: string): number {
  const match = path.match(/front-(\d+)\.svg$/);
  if (!match) return 9999;
  return Number(match[1]);
}

/**
 * Creates an empty ThemeAssets object with all themes initialized.
 * @returns An empty ThemeAssets object
 */
function createEmptyThemeAssets(): ThemeAssets {
  return {
    code: { back: '', fronts: [] },
    games: { back: '', fronts: [] },
    da: { back: '', fronts: [] },
    food: { back: '', fronts: [] },
  };
}

/**
 * Creates an empty by-theme mapping for front image collections.
 * @returns An empty record with all themes
 */
function createEmptyByTheme(): Record<ThemeId, { path: string; url: string }[]> {
  return {
    code: [],
    games: [],
    da: [],
    food: [],
  };
}

/**
 * Collects all front image URLs grouped by theme.
 * @returns A record mapping themes to their front image data
 */
function collectFrontsByTheme(): Record<ThemeId, { path: string; url: string }[]> {
  const byTheme = createEmptyByTheme();

  for (const [path, url] of Object.entries(FRONT_URLS)) {
    const theme = themeFromPath(path);
    byTheme[theme].push({ path, url });
  }

  return byTheme;
}

/**
 * Sorts and assigns front images to a theme.
 * @param theme - The theme identifier
 * @param items - Array of front image data
 * @returns Sorted array of front image URLs
 */
function assignFrontsToTheme(
  theme: ThemeId,
  items: { path: string; url: string }[]
): string[] {
  return items
    .sort((a, b) => frontIndexFromPath(a.path) - frontIndexFromPath(b.path))
    .map((item) => item.url);
}

/**
 * Builds the complete theme assets from imported files.
 * @returns The ThemeAssets object containing all URLs
 */
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

  validateThemeAssets(map);
  return map;
}

/**
 * Checks if a back asset exists for a theme.
 * @param theme - The theme identifier
 * @param assets - The ThemeAssets object
 * @returns True if the back asset exists
 */
function hasBackAsset(theme: ThemeId, assets: ThemeAssets): boolean {
  return !!assets[theme].back;
}

/**
 * Checks if a theme has the correct number of front images.
 * @param theme - The theme identifier
 * @param assets - The ThemeAssets object
 * @returns True if the front count is correct
 */
function hasCorrectFrontCount(theme: ThemeId, assets: ThemeAssets): boolean {
  return assets[theme].fronts.length === EXPECTED_FRONTS;
}

/**
 * Logs a warning for a missing back image.
 * @param theme - The theme identifier
 */
function warnMissingBack(theme: ThemeId): void {
  console.warn(
    `[assets] Missing back.svg for theme "${theme}" at src/assets/cards/${theme}/back.svg`
  );
}

/**
 * Logs a warning for incorrect front image count.
 * @param theme - The theme identifier
 * @param count - The actual number of front images
 */
function warnFrontCount(theme: ThemeId, count: number): void {
  console.warn(
    `[assets] Theme "${theme}" has ${count} front svgs. Expected ${EXPECTED_FRONTS}.`
  );
}

/**
 * Logs a warning for a missing front image number.
 * @param theme - The theme identifier
 * @param number - The missing front image number
 */
function warnMissingFrontNumber(theme: ThemeId, number: number): void {
  const padded = String(number).padStart(2, '0');
  console.warn(`[assets] Theme "${theme}" missing front-${padded}.svg`);
}

/**
 * Extracts the number from a front image URL.
 * @param url - The front image URL
 * @returns The extracted number, or 0 if no match
 */
function extractNumberFromUrl(url: string): number {
  const match = url.match(/front-(\d+)\.svg$/);
  return match ? Number(match[1]) : 0;
}

/**
 * Gets the set of existing front numbers for a theme.
 * @param theme - The theme identifier
 * @param assets - The ThemeAssets object
 * @returns A Set of existing front numbers
 */
function getExistingFrontNumbers(theme: ThemeId, assets: ThemeAssets): Set<number> {
  const numbers = assets[theme].fronts.map((url) => extractNumberFromUrl(url));
  return new Set(numbers);
}

/**
 * Validates a single theme's assets.
 * @param theme - The theme identifier
 * @param assets - The ThemeAssets object
 */
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

/**
 * Validates all theme assets and logs warnings for issues.
 * @param assets - The ThemeAssets object to validate
 */
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

  /**
   * Updates the game configuration.
   * @param config - Partial configuration to apply
   */
  updateConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Registers a callback for game end events.
   * @param callback - Function called when the game ends
   */
  onWin(callback: (payload: WinPayload) => void): void {
    this.winCallback = callback;
  }

  /**
   * Registers a callback for state change events.
   * @param callback - Function called when the game state changes
   */
  onStateChange(callback: () => void): void {
    this.stateChangeCallback = callback;
  }

  /**
   * Starts a new game with the current configuration.
   */
  startNewGame(): void {
    this.resetGameState();
    this.initializeDeck();
    this.renderer.renderBoard(this.state.cards);
    this.emitStateChange();
  }

  /**
   * Resets all game state variables to initial values.
   */
  private resetGameState(): void {
    this.state.status = 'running';
    this.state.lockInput = false;
    this.state.moves = 0;
    this.state.blueMatches = 0;
    this.state.orangeMatches = 0;
    this.state.currentPlayer = this.config.startingPlayer;
    this.state.resetPicks();
  }

  /**
   * Initializes the card deck with the current theme and pair count.
   */
  private initializeDeck(): void {
    const cards = this.createDeck(this.config.theme, this.config.pairs);
    this.state.cards = cards;
  }

  /**
   * Handles a click on a card.
   * @param cardId - The ID of the clicked card
   */
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

  /**
   * Checks if a card click can be processed.
   * @returns True if the click can be handled
   */
  private canHandleClick(): boolean {
    const isGameRunning = this.state.status === 'running';
    const isInputLocked = this.state.lockInput;
    return isGameRunning && !isInputLocked;
  }

  /**
   * Reveals a card and updates the renderer.
   * @param card - The card to reveal
   */
  private revealCard(card: CardData): void {
    card.state = 'revealed';
    this.renderer.updateCard(card);
  }

  /**
   * Processes the second card selection in a turn.
   * @param card - The second card selected
   */
  private processSecondPick(card: CardData): void {
    this.state.secondPickId = card.id;
    this.state.moves += 1;
    this.evaluatePick();
  }

  /**
   * Resets the game to its initial state.
   */
  reset(): void {
    this.startNewGame();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Evaluates the current pick by checking if the two cards match.
   */
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

  /**
   * Handles a successful match between two cards.
   * @param first - The first matched card
   * @param second - The second matched card
   */
  private handleMatch(first: CardData, second: CardData): void {
    this.markCardsAsMatched(first, second);
    this.incrementPlayerScore();
    this.updateMatchedCards(first, second);
    this.checkGameCompletion();
  }

  /**
   * Marks two cards as matched.
   * @param first - The first card
   * @param second - The second card
   */
  private markCardsAsMatched(first: CardData, second: CardData): void {
    first.state = 'matched';
    second.state = 'matched';
  }

  /**
   * Increments the current player's match count.
   */
  private incrementPlayerScore(): void {
    if (this.state.currentPlayer === 'blue') {
      this.state.blueMatches += 1;
    } else {
      this.state.orangeMatches += 1;
    }
  }

  /**
   * Updates the renderer for matched cards and resets pick state.
   * @param first - The first matched card
   * @param second - The second matched card
   */
  private updateMatchedCards(first: CardData, second: CardData): void {
    this.renderer.updateCard(first);
    this.renderer.updateCard(second);
    this.state.resetPicks();
    this.state.lockInput = false;
    this.emitStateChange();
  }

  /**
   * Checks if the game is complete (all pairs found).
   */
  private checkGameCompletion(): void {
    const totalMatches = this.state.blueMatches + this.state.orangeMatches;
    if (totalMatches === this.config.pairs) {
      this.state.status = 'won';
      this.finishGameWithDelay();
    }
  }

  /**
   * Handles a mismatch between two cards.
   * @param first - The first card
   * @param second - The second card
   */
  private handleMismatch(first: CardData, second: CardData): void {
    const delay = this.config.flipBackDelayMs;

    window.setTimeout(() => {
      this.hideMismatchedCards(first, second);
    }, delay);
  }

  /**
   * Hides two mismatched cards after a delay.
   * @param first - The first card to hide
   * @param second - The second card to hide
   */
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

  /**
   * Finishes the game after a delay to show the final card.
   */
  private finishGameWithDelay(): void {
    window.setTimeout(() => {
      this.finishGame();
    }, RESULT_DELAY_MS);
  }

  /**
   * Finishes the game and triggers the win callback.
   */
  private finishGame(): void {
    const winner = this.determineWinner();
    this.emitStateChange();
    this.triggerWinCallback(winner);
  }

  /**
   * Determines the winner based on match counts.
   * @returns The winner, or 'tie' if scores are equal
   */
  private determineWinner(): 'blue' | 'orange' | 'tie' {
    const { blueMatches, orangeMatches } = this.state;

    if (blueMatches > orangeMatches) return 'blue';
    if (orangeMatches > blueMatches) return 'orange';
    return 'tie';
  }

  /**
   * Triggers the win callback with the result payload.
   * @param winner - The winner of the game
   */
  private triggerWinCallback(winner: 'blue' | 'orange' | 'tie'): void {
    this.winCallback?.({
      moves: this.state.moves,
      blueMatches: this.state.blueMatches,
      orangeMatches: this.state.orangeMatches,
      winner,
    });
  }

  /**
   * Retrieves a card by its ID.
   * @param id - The card ID to find
   * @returns The card data, or undefined if not found
   */
  private getCard(id: string | null): CardData | undefined {
    if (!id) return undefined;
    return this.state.cards.find((card: CardData) => card.id === id);
  }

  /**
   * Creates a shuffled deck of cards.
   * @param theme - The theme to use for the cards
   * @param pairs - The number of pairs to create
   * @returns An array of card data
   */
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

  /**
   * Determines the safe number of pairs based on available assets.
   * @param available - The number of available front images
   * @param requested - The requested number of pairs
   * @returns The safe number of pairs
   */
  private getSafePairs(available: number, requested: number): number {
    return Math.min(requested, available);
  }

  /**
   * Creates card pairs from a list of front images.
   * @param fronts - Array of front image URLs
   * @param backSrc - The back image URL
   * @returns Array of Card instances
   */
  private createCardPairs(fronts: string[], backSrc: string): Card[] {
    const cards: Card[] = [];

    for (let i = 0; i < fronts.length; i++) {
      const pairId = `pair-${i}`;
      const frontSrc = fronts[i];

      cards.push(
        new Card({
          id: `c-${pairId}-a`,
          pairId,
          frontSrc,
          backSrc,
        })
      );

      cards.push(
        new Card({
          id: `c-${pairId}-b`,
          pairId,
          frontSrc,
          backSrc,
        })
      );
    }

    return cards;
  }

  /**
   * Emits a state change event to registered callbacks.
   */
  private emitStateChange(): void {
    this.stateChangeCallback?.();
  }
}
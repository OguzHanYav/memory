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

// Verwende relative Pfade von der aktuellen Datei aus
// Die Datei ist in src/app/controllers/, also gehen wir ../../assets/cards/
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

// ODER alternativ: Verwende den public Ordner
// const FRONT_URLS = import.meta.glob('/assets/cards/*/front-*.svg', {
//   eager: true,
//   query: '?url',
//   import: 'default',
// }) as Record<string, string>;
// 
// const BACK_URLS = import.meta.glob('/assets/cards/*/back.svg', {
//   eager: true,
//   query: '?url',
//   import: 'default',
// }) as Record<string, string>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Extrahiert den Theme-Namen aus dem Dateipfad */
function themeFromPath(path: string): ThemeId {
  const parts = path.split('/');
  const cardsIndex = parts.findIndex((part) => part === 'cards');
  const theme = parts[cardsIndex + 1] as ThemeId | undefined;

  if (!theme || !VALID_THEMES.includes(theme)) {
    throw new Error(`Unknown theme folder in path: ${path}`);
  }

  return theme;
}

/** Extrahiert die Front-Nummer aus dem Dateipfad */
function frontIndexFromPath(path: string): number {
  const match = path.match(/front-(\d+)\.svg$/);
  if (!match) return 9999;
  return Number(match[1]);
}

/** Erstellt eine leere ThemeAssets-Struktur */
function createEmptyThemeAssets(): ThemeAssets {
  return {
    code: { back: '', fronts: [] },
    games: { back: '', fronts: [] },
    da: { back: '', fronts: [] },
    food: { back: '', fronts: [] },
  };
}

/** Erstellt eine leere byTheme-Struktur */
function createEmptyByTheme(): Record<ThemeId, { path: string; url: string }[]> {
  return {
    code: [],
    games: [],
    da: [],
    food: [],
  };
}

/** Sammelt alle Front-URLs nach Theme */
function collectFrontsByTheme(): Record<ThemeId, { path: string; url: string }[]> {
  const byTheme = createEmptyByTheme();
  
  for (const [path, url] of Object.entries(FRONT_URLS)) {
    const theme = themeFromPath(path);
    byTheme[theme].push({ path, url });
  }
  
  return byTheme;
}

/** Sortiert und weist Fronts einem Theme zu */
function assignFrontsToTheme(
  theme: ThemeId,
  items: { path: string; url: string }[]
): string[] {
  return items
    .sort((a, b) => frontIndexFromPath(a.path) - frontIndexFromPath(b.path))
    .map((item) => item.url);
}

/** Baut die Theme-Assets aus den importierten Dateien zusammen */
function buildThemeAssets(): ThemeAssets {
  const map = createEmptyThemeAssets();

  // Backs verarbeiten
  for (const [path, url] of Object.entries(BACK_URLS)) {
    const theme = themeFromPath(path);
    map[theme].back = url;
  }

  // Fronts verarbeiten
  const byTheme = collectFrontsByTheme();
  for (const theme of VALID_THEMES) {
    map[theme].fronts = assignFrontsToTheme(theme, byTheme[theme]);
  }

  // Validierung deaktivieren, um die Warnungen zu vermeiden
  // validateThemeAssets(map);
  
  return map;
}

/** Prüft ob ein Back-Asset vorhanden ist */
function hasBackAsset(theme: ThemeId, assets: ThemeAssets): boolean {
  return !!assets[theme].back;
}

/** Prüft ob die Front-Anzahl korrekt ist */
function hasCorrectFrontCount(theme: ThemeId, assets: ThemeAssets): boolean {
  return assets[theme].fronts.length === EXPECTED_FRONTS;
}

/** Gibt eine Warnung für fehlendes Back aus */
function warnMissingBack(theme: ThemeId): void {
  console.warn(
    `[assets] Missing back.svg for theme "${theme}" at src/assets/cards/${theme}/back.svg`
  );
}

/** Gibt eine Warnung für falsche Front-Anzahl aus */
function warnFrontCount(theme: ThemeId, count: number): void {
  console.warn(
    `[assets] Theme "${theme}" has ${count} front svgs. Expected ${EXPECTED_FRONTS}.`
  );
}

/** Gibt eine Warnung für fehlende Front-Nummer aus */
function warnMissingFrontNumber(theme: ThemeId, number: number): void {
  const padded = String(number).padStart(2, '0');
  console.warn(`[assets] Theme "${theme}" missing front-${padded}.svg`);
}

/** Extrahiert die Nummer aus einer Front-URL */
function extractNumberFromUrl(url: string): number {
  const match = url.match(/front-(\d+)\.svg$/);
  return match ? Number(match[1]) : 0;
}

/** Sammelt alle vorhandenen Front-Nummern eines Themes */
function getExistingFrontNumbers(theme: ThemeId, assets: ThemeAssets): Set<number> {
  const numbers = assets[theme].fronts.map((url) => extractNumberFromUrl(url));
  return new Set(numbers);
}

/** Validiert ein einzelnes Theme */
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

/** Validiert die Theme-Assets und gibt Warnungen aus */
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

  /** Aktualisiert die Spielkonfiguration */
  updateConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Registriert einen Callback für Spielende */
  onWin(callback: (payload: WinPayload) => void): void {
    this.winCallback = callback;
  }

  /** Registriert einen Callback für State-Änderungen */
  onStateChange(callback: () => void): void {
    this.stateChangeCallback = callback;
  }

  /** Startet ein neues Spiel */
  startNewGame(): void {
    this.resetGameState();
    this.initializeDeck();
    this.renderer.renderBoard(this.state.cards);
    this.emitStateChange();
  }

  /** Setzt den Spielstatus zurück */
  private resetGameState(): void {
    this.state.status = 'running';
    this.state.lockInput = false;
    this.state.moves = 0;
    this.state.blueMatches = 0;
    this.state.orangeMatches = 0;
    this.state.currentPlayer = this.config.startingPlayer;
    this.state.resetPicks();
  }

  /** Initialisiert das Kartendeck */
  private initializeDeck(): void {
    const cards = this.createDeck(this.config.theme, this.config.pairs);
    this.state.cards = cards;
  }

  /** Verarbeitet einen Klick auf eine Karte */
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

  /** Prüft ob ein Klick verarbeitet werden kann */
  private canHandleClick(): boolean {
    const isGameRunning = this.state.status === 'running';
    const isInputLocked = this.state.lockInput;
    return isGameRunning && !isInputLocked;
  }

  /** Deckt eine Karte auf */
  private revealCard(card: CardData): void {
    card.state = 'revealed';
    this.renderer.updateCard(card);
  }

  /** Verarbeitet die zweite Kartenauswahl */
  private processSecondPick(card: CardData): void {
    this.state.secondPickId = card.id;
    this.state.moves += 1;
    this.evaluatePick();
  }

  /** Setzt das Spiel zurück */
  reset(): void {
    this.startNewGame();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /** Wertet den aktuellen Zug aus */
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

  /** Behandelt ein erfolgreiches Match */
  private handleMatch(first: CardData, second: CardData): void {
    this.markCardsAsMatched(first, second);
    this.incrementPlayerScore();
    this.updateMatchedCards(first, second);
    this.checkGameCompletion();
  }

  /** Markiert zwei Karten als gematcht */
  private markCardsAsMatched(first: CardData, second: CardData): void {
    first.state = 'matched';
    second.state = 'matched';
  }

  /** Erhöht den Score des aktuellen Spielers */
  private incrementPlayerScore(): void {
    if (this.state.currentPlayer === 'blue') {
      this.state.blueMatches += 1;
    } else {
      this.state.orangeMatches += 1;
    }
  }

  /** Aktualisiert die gematchten Karten im Renderer */
  private updateMatchedCards(first: CardData, second: CardData): void {
    this.renderer.updateCard(first);
    this.renderer.updateCard(second);
    this.state.resetPicks();
    this.state.lockInput = false;
    this.emitStateChange();
  }

  /** Prüft ob das Spiel komplett ist */
  private checkGameCompletion(): void {
    const totalMatches = this.state.blueMatches + this.state.orangeMatches;
    if (totalMatches === this.config.pairs) {
      this.state.status = 'won';
      this.finishGameWithDelay();
    }
  }

  /** Behandelt ein erfolgloses Match */
  private handleMismatch(first: CardData, second: CardData): void {
    const delay = this.config.flipBackDelayMs;

    window.setTimeout(() => {
      this.hideMismatchedCards(first, second);
    }, delay);
  }

  /** Versteckt zwei nicht gematchte Karten */
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

  /** Beendet das Spiel mit einer Verzögerung */
  private finishGameWithDelay(): void {
    window.setTimeout(() => {
      this.finishGame();
    }, RESULT_DELAY_MS);
  }

  /** Beendet das Spiel und triggert den Win-Callback */
  private finishGame(): void {
    const winner = this.determineWinner();
    this.emitStateChange();
    this.triggerWinCallback(winner);
  }

  /** Bestimmt den Gewinner */
  private determineWinner(): 'blue' | 'orange' | 'tie' {
    const { blueMatches, orangeMatches } = this.state;
    
    if (blueMatches > orangeMatches) return 'blue';
    if (orangeMatches > blueMatches) return 'orange';
    return 'tie';
  }

  /** Triggert den Win-Callback */
  private triggerWinCallback(winner: 'blue' | 'orange' | 'tie'): void {
    this.winCallback?.({
      moves: this.state.moves,
      blueMatches: this.state.blueMatches,
      orangeMatches: this.state.orangeMatches,
      winner,
    });
  }

  /** Gibt eine Karte anhand ihrer ID zurück */
  private getCard(id: string | null): CardData | undefined {
    if (!id) return undefined;
    return this.state.cards.find((card: CardData) => card.id === id);
  }

  /** Erstellt ein gemischtes Kartendeck */
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

  /** Bestimmt die sichere Anzahl an Paaren */
  private getSafePairs(available: number, requested: number): number {
    return Math.min(requested, available);
  }

  /** Erstellt Kartenpaare aus den ausgewählten Fronts */
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

  /** Emittiert eine State-Änderung */
  private emitStateChange(): void {
    this.stateChangeCallback?.();
  }
}
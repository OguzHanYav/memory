import { DEFAULT_GAME_CONFIG } from '../core/config';
import { Card } from '../models/Card';
import { GameState } from '../models/GameState';
import { Renderer } from '../ui/Renderer';
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

/** Baut die Theme-Assets aus den importierten Dateien zusammen */
function buildThemeAssets(): ThemeAssets {
  const map: ThemeAssets = {
    code: { back: '', fronts: [] },
    games: { back: '', fronts: [] },
    da: { back: '', fronts: [] },
    food: { back: '', fronts: [] },
  };

  // Backs verarbeiten
  for (const [path, url] of Object.entries(BACK_URLS)) {
    const theme = themeFromPath(path);
    map[theme].back = url;
  }

  // Fronts nach Theme gruppieren
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

  // Fronts nach Nummer sortieren und zuweisen
  for (const theme of VALID_THEMES) {
    map[theme].fronts = byTheme[theme]
      .sort((a, b) => frontIndexFromPath(a.path) - frontIndexFromPath(b.path))
      .map((item) => item.url);
  }

  // Validierung: Fehlende Assets warnen
  validateThemeAssets(map);

  return map;
}

/** Validiert die Theme-Assets und gibt Warnungen aus */
function validateThemeAssets(assets: ThemeAssets): void {
  const EXPECTED_FRONTS = 18;

  for (const theme of VALID_THEMES) {
    const themeAssets = assets[theme];

    // Back validieren
    if (!themeAssets.back) {
      console.warn(
        `[assets] Missing back.svg for theme "${theme}" at src/assets/cards/${theme}/back.svg`
      );
    }

    // Fronts validieren
    const frontCount = themeAssets.fronts.length;
    if (frontCount !== EXPECTED_FRONTS) {
      console.warn(
        `[assets] Theme "${theme}" has ${frontCount} front svgs. Expected ${EXPECTED_FRONTS}.`
      );
    }

    // Fehlende Nummern prüfen (1-18)
    const gotNumbers = new Set(
      themeAssets.fronts.map((url) => {
        const match = url.match(/front-(\d+)\.svg$/);
        return match ? Number(match[1]) : 0;
      })
    );

    for (let i = 1; i <= EXPECTED_FRONTS; i++) {
      if (!gotNumbers.has(i)) {
        const padded = String(i).padStart(2, '0');
        console.warn(`[assets] Theme "${theme}" missing front-${padded}.svg`);
      }
    }
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
    this.emitStateChange();
  }

  /** Verarbeitet einen Klick auf eine Karte */
  handleCardClick(cardId: string): void {
    const isGameRunning = this.state.status === 'running';
    const isInputLocked = this.state.lockInput;

    if (!isGameRunning || isInputLocked) return;

    const card = this.getCard(cardId);
    if (!card) return;
    if (card.state !== 'hidden') return;

    // Erste Karte umdrehen
    card.state = 'revealed';
    this.renderer.updateCard(card);

    if (!this.state.firstPickId) {
      this.state.firstPickId = card.id;
      return;
    }

    // Zweite Karte umdrehen
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

    const isMatch = first.pairId === second.pairId;

    if (isMatch) {
      this.handleMatch(first, second);
    } else {
      this.handleMismatch(first, second);
    }
  }

  /** Behandelt ein erfolgreiches Match */
  private handleMatch(first: CardData, second: CardData): void {
    first.state = 'matched';
    second.state = 'matched';

    const isBluePlayer = this.state.currentPlayer === 'blue';
    if (isBluePlayer) {
      this.state.blueMatches += 1;
    } else {
      this.state.orangeMatches += 1;
    }

    this.renderer.updateCard(first);
    this.renderer.updateCard(second);

    this.state.resetPicks();
    this.state.lockInput = false;
    this.emitStateChange();

    const totalMatches = this.state.blueMatches + this.state.orangeMatches;
    const isGameComplete = totalMatches === this.config.pairs;

    if (isGameComplete) {
      this.state.status = 'won';
      // WICHTIG: Spiel beenden mit Verzögerung, damit die letzte Karte sichtbar bleibt
      this.finishGameWithDelay();
    }
  }

  /** Behandelt ein erfolgloses Match */
  private handleMismatch(first: CardData, second: CardData): void {
    const delay = this.config.flipBackDelayMs;

    window.setTimeout(() => {
      first.state = 'hidden';
      second.state = 'hidden';

      this.renderer.updateCard(first);
      this.renderer.updateCard(second);

      this.state.resetPicks();
      this.state.switchPlayer();
      this.emitStateChange();
      this.state.lockInput = false;
    }, delay);
  }

  /** Beendet das Spiel mit einer Verzögerung, damit die letzte Karte sichtbar bleibt */
  private finishGameWithDelay(): void {
    // 1 Sekunde Verzögerung, damit der Spieler die letzte Karte sehen kann
    const RESULT_DELAY_MS = 1000;

    window.setTimeout(() => {
      this.finishGame();
    }, RESULT_DELAY_MS);
  }

  /** Beendet das Spiel und triggert den Win-Callback */
  private finishGame(): void {
    const { blueMatches, orangeMatches } = this.state;
    let winner: 'blue' | 'orange' | 'tie' = 'tie';

    if (blueMatches > orangeMatches) {
      winner = 'blue';
    } else if (orangeMatches > blueMatches) {
      winner = 'orange';
    }

    this.emitStateChange();

    this.winCallback?.({
      moves: this.state.moves,
      blueMatches,
      orangeMatches,
      winner,
    });
  }

  /** Gibt eine Karte anhand ihrer ID zurück */
  private getCard(id: string | null): CardData | undefined {
    if (!id) return undefined;

    return this.state.cards.find((card) => card.id === id);
  }

  /** Erstellt ein gemischtes Kartendeck */
  private createDeck(theme: ThemeId, pairs: number): CardData[] {
    const assets = THEME_ASSETS[theme];

    if (!assets.back || assets.fronts.length === 0) {
      console.warn(`[assets] Theme "${theme}" assets incomplete. Using safe empty deck.`);
      return [];
    }

    const availablePairs = assets.fronts.length;
    const safePairs = Math.min(pairs, availablePairs);
    const pickedFronts = shuffle(assets.fronts).slice(0, safePairs);

    const allCards: Card[] = [];

    for (let i = 0; i < safePairs; i++) {
      const pairId = `pair-${i}`;
      const frontSrc = pickedFronts[i];

      allCards.push(
        new Card({
          id: `c-${pairId}-a`,
          pairId,
          frontSrc,
          backSrc: assets.back,
        })
      );

      allCards.push(
        new Card({
          id: `c-${pairId}-b`,
          pairId,
          frontSrc,
          backSrc: assets.back,
        })
      );
    }

    return shuffle(allCards).map((card) => ({ ...card }));
  }

  /** Emittiert eine State-Änderung */
  private emitStateChange(): void {
    this.stateChangeCallback?.();
  }
}
import type { CardData, GridSize, ThemeId } from '../core/types';

// ============================================
// RENDERER CLASS
// ============================================

export class Renderer {
  private root: HTMLElement;
  private gameScreen: HTMLElement;
  private grid: GridSize = 16;
  private theme: ThemeId = 'code';

  constructor(root: HTMLElement) {
    this.root = root;
    this.gameScreen = document.getElementById('screen-game') as HTMLElement;
  }

  /** Setzt die Grid-Größe */
  setGrid(grid: GridSize): void {
    this.grid = grid;
    this.applyBoardColumns(grid);
  }

  /** Setzt das Theme */
  setTheme(theme: ThemeId): void {
    this.theme = theme;

    // Theme-Klasse auf Body (für globale Styles)
    document.body.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    document.body.classList.add(`theme-${theme}`);

    // Theme-Klasse auf Game-Screen (für HUD-Styles)
    if (this.gameScreen) {
      this.gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
      this.gameScreen.classList.add(`theme-${theme}`);
    }
  }

  /** Rendert das gesamte Board */
  renderBoard(cards: CardData[]): void {
    this.root.innerHTML = '';
    this.applyBoardColumns(cards.length);

    for (const card of cards) {
      this.root.appendChild(this.createCardElement(card));
    }
  }

  /** Aktualisiert eine einzelne Karte */
  updateCard(card: CardData): void {
    const selector = `.card[data-id="${card.id}"]`;
    const element = this.root.querySelector<HTMLButtonElement>(selector);

    if (!element) return;

    const isFlipped = card.state !== 'hidden';
    const isMatched = card.state === 'matched';

    element.classList.toggle('is-flipped', isFlipped);
    element.disabled = isMatched;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /** Wendet die Grid-Columns basierend auf der Kartenzahl an */
  private applyBoardColumns(total: number): void {
    let columns = 4;

    if (total === 16) {
      columns = 4;
    } else if (total === 24) {
      columns = 6;
    } else if (total === 36) {
      columns = 6;
    }

    this.root.style.gridTemplateColumns = `repeat(${columns}, var(--card-size))`;
  }

  /** Wendet ein Hintergrundbild auf ein Element an */
  private applyCoverBackground(element: HTMLElement, src: string): void {
    element.style.backgroundImage = `url("${src}")`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.style.backgroundRepeat = 'no-repeat';
  }

  /** Erstellt ein DOM-Element für eine Karte */
  private createCardElement(card: CardData): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card';
    button.dataset.id = card.id;

    const isFlipped = card.state !== 'hidden';
    const isMatched = card.state === 'matched';

    button.classList.toggle('is-flipped', isFlipped);
    button.disabled = isMatched;

    const inner = document.createElement('div');
    inner.className = 'card__inner';

    const faceFront = document.createElement('div');
    faceFront.className = 'card__face card__face--front';
    this.applyCoverBackground(faceFront, card.backSrc);

    const faceBack = document.createElement('div');
    faceBack.className = 'card__face card__face--back';
    this.applyCoverBackground(faceBack, card.frontSrc);

    inner.appendChild(faceFront);
    inner.appendChild(faceBack);
    button.appendChild(inner);

    return button;
  }
}
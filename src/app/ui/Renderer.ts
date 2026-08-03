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

  /**
   * Sets the grid size for the game board.
   * @param grid - The grid size (16, 24, or 36)
   */
  setGrid(grid: GridSize): void {
    this.grid = grid;
    this.applyBoardColumns(grid);
  }

  /**
   * Sets the theme and updates UI theme classes.
   * @param theme - The theme identifier
   */
  setTheme(theme: ThemeId): void {
    this.theme = theme;

    document.body.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    document.body.classList.add(`theme-${theme}`);

    if (this.gameScreen) {
      this.gameScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
      this.gameScreen.classList.add(`theme-${theme}`);
    }
  }

  /**
   * Renders the entire game board.
   * @param cards - Array of card data to render
   */
  renderBoard(cards: CardData[]): void {
    this.root.innerHTML = '';
    this.applyBoardColumns(cards.length);

    for (const card of cards) {
      this.root.appendChild(this.createCardElement(card));
    }
  }

  /**
   * Updates a single card in the DOM.
   * @param card - The card data to update
   */
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

  /**
   * Applies grid columns based on total card count.
   * @param total - Total number of cards
   */
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

  /**
   * Applies a background image to an element using CSS.
   * @param element - The DOM element
   * @param src - The image URL
   */
  private applyCoverBackground(element: HTMLElement, src: string): void {
    element.style.backgroundImage = `url("${src}")`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.style.backgroundRepeat = 'no-repeat';
  }

  /**
   * Creates a DOM element for a card.
   * @param card - The card data
   * @returns A button element representing the card
   */
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
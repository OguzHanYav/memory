import type { CardData, GridSize, ThemeId } from '../core/types';

export class Renderer {
  private root: HTMLElement;

  private grid: GridSize = 16;
  private theme: ThemeId = 'code';

  constructor(root: HTMLElement) {
    this.root = root;
  }

  setGrid(grid: GridSize) {
    this.grid = grid;
    this.applyBoardColumns(grid);
  }

  setTheme(theme: ThemeId) {
    this.theme = theme;

    document.body.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
    document.body.classList.add(`theme-${theme}`);
  }

  renderBoard(cards: CardData[]) {
    this.root.innerHTML = '';
    this.applyBoardColumns(cards.length);

    for (const card of cards) {
      this.root.appendChild(this.createCardEl(card));
    }
  }

  updateCard(card: CardData) {
    const el = this.root.querySelector<HTMLButtonElement>(`.card[data-id="${card.id}"]`);
    if (!el) return;

    el.classList.toggle('is-flipped', card.state !== 'hidden');
    el.disabled = card.state === 'matched';
  }

  private applyBoardColumns(total: number) {
    // fixed columns like before (no 1fr stretching)
    let cols = 4;
    if (total === 16) cols = 4;
    else if (total === 24) cols = 6;
    else if (total === 36) cols = 6;

    this.root.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
  }

  private applyCoverBg(el: HTMLElement, src: string) {
    el.style.backgroundImage = `url("${src}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
  }

  private createCardEl(card: CardData): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card';
    btn.dataset.id = card.id;

    btn.classList.toggle('is-flipped', card.state !== 'hidden');
    btn.disabled = card.state === 'matched';

    const inner = document.createElement('div');
    inner.className = 'card__inner';

    // Hidden side (front face) -> back.svg (pattern)
    const faceFront = document.createElement('div');
    faceFront.className = 'card__face card__face--front';
    this.applyCoverBg(faceFront, card.backSrc);

    // Revealed side (back face) -> front-xx.svg (icon)
    const faceBack = document.createElement('div');
    faceBack.className = 'card__face card__face--back';
    this.applyCoverBg(faceBack, card.frontSrc);

    inner.appendChild(faceFront);
    inner.appendChild(faceBack);
    btn.appendChild(inner);

    return btn;
  }
}
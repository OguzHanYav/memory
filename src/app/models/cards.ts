import type { CardData, CardState } from '../core/types';

// ============================================
// TYPES
// ============================================

type CardConstructor = {
  id: string;
  pairId: string;
  frontSrc: string;
  backSrc: string;
  state?: CardState;
};

// ============================================
// CARD CLASS
// ============================================

export class Card implements CardData {
  id: string;
  pairId: string;
  frontSrc: string;
  backSrc: string;
  state: CardState;

  /**
   * Creates a new Card instance.
   * @param data - Configuration parameters for the card
   */
  constructor(data: CardConstructor) {
    this.id = data.id;
    this.pairId = data.pairId;
    this.frontSrc = data.frontSrc;
    this.backSrc = data.backSrc;
    this.state = data.state ?? 'hidden';
  }
}
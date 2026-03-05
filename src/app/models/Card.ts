import type { CardData, CardState } from '../core/types';

type CardCtor = {
  id: string;
  pairId: string;
  frontSrc: string;
  backSrc: string;
  state?: CardState;
};

export class Card implements CardData {
  id: string;
  pairId: string;

  frontSrc: string;
  backSrc: string;

  state: CardState;

  constructor(data: CardCtor) {
    this.id = data.id;
    this.pairId = data.pairId;
    this.frontSrc = data.frontSrc;
    this.backSrc = data.backSrc;
    this.state = data.state ?? 'hidden';
  }
}
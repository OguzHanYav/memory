import { state } from './state';
import { showScreen } from './helpers';

const WINNER_ICONS: Record<string, { blue: string; orange: string }> = {
  code: {
    blue: './assets/game-hud/chess_pawn_blue.svg',
    orange: './assets/game-hud/chess_pawn.svg'
  },
  games: {
    blue: './assets/game-hud/trophy_orange.svg',
    orange: './assets/game-hud/trophy_orange.svg'
  },
  da: {
    blue: './assets/game-hud/DA-Theme/chess_pawn.svg',
    orange: './assets/game-hud/DA-Theme/chess_pawn_orange.svg'
  },
  food: {
    blue: './assets/game-hud/FOOD-Theme/chess_pawn_blue.svg',
    orange: './assets/game-hud/FOOD-Theme/chess_pawn.svg'
  }
};

function getResultElements() {
  return {
    resultScreen: document.getElementById('screen-result') as HTMLElement,
    resultGameover: document.getElementById('result-gameover') as HTMLElement,
    resultWinner: document.getElementById('result-winner') as HTMLElement,
    resultDraw: document.getElementById('result-draw') as HTMLElement,
    resultBlueScore: document.getElementById('result-blue-score') as HTMLElement,
    resultOrangeScore: document.getElementById('result-orange-score') as HTMLElement,
    resultWinnerTitle: document.getElementById('result-winner-title') as HTMLElement,
    resultPlayerIcon: document.getElementById('result-player-icon') as HTMLElement,
    winnerIconImg: document.getElementById('winner-icon-img') as HTMLImageElement,
  };
}

function setResultScores(elements: ReturnType<typeof getResultElements>, blueMatches: number, orangeMatches: number): void {
  const isCodeTheme = state.selectedTheme === 'code';
  elements.resultBlueScore.textContent = isCodeTheme ? `Blue ${blueMatches}` : String(blueMatches);
  elements.resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeMatches}` : String(orangeMatches);
}

function applyResultTheme(elements: ReturnType<typeof getResultElements>): void {
  const theme = state.selectedTheme || 'code';
  elements.resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
  elements.resultScreen.classList.add(`theme-${theme}`);
}

function setWinnerIcon(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  const theme = state.selectedTheme || 'code';
  const iconPath = WINNER_ICONS[theme]?.[winner] || WINNER_ICONS.code.blue;
  if (elements.winnerIconImg) {
    elements.winnerIconImg.src = iconPath;
    elements.winnerIconImg.alt = `${winner} player icon`;
    elements.winnerIconImg.style.display = 'block';
  }
}

function resetAnimationClasses(elements: ReturnType<typeof getResultElements>): void {
  elements.resultGameover.classList.remove('slide-in', 'slide-out');
  elements.resultWinner.classList.remove('slide-in', 'slide-out');
  elements.resultDraw.classList.remove('slide-in', 'slide-out');
}

function showGameOverScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultWinner.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  resetAnimationClasses(elements);
  elements.resultGameover.style.display = 'flex';
  void elements.resultGameover.offsetHeight;
  elements.resultGameover.classList.add('slide-in');
}

function showWinnerScreen(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  elements.resultGameover.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  resetAnimationClasses(elements);
  elements.resultWinner.style.display = 'flex';
  elements.resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
  elements.resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
  setWinnerIcon(elements, winner);
  void elements.resultWinner.offsetHeight;
  elements.resultWinner.classList.add('slide-in');
}

function showDrawScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultGameover.style.display = 'none';
  elements.resultWinner.style.display = 'none';
  resetAnimationClasses(elements);
  elements.resultDraw.style.display = 'flex';
  void elements.resultDraw.offsetHeight;
  elements.resultDraw.classList.add('slide-in');
}

function hideAllResults(elements: ReturnType<typeof getResultElements>): void {
  elements.resultGameover.style.display = 'none';
  elements.resultWinner.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  resetAnimationClasses(elements);
}

export function handleGameWin(
  { blueMatches, orangeMatches, winner }: { blueMatches: number; orangeMatches: number; winner: 'blue' | 'orange' | 'tie' }
): void {
  const elements = getResultElements();
  applyResultTheme(elements);
  elements.resultScreen.classList.remove(
    'result-screen--winner-blue',
    'result-screen--winner-orange',
    'result-screen--draw',
    'result-screen--gameover'
  );
  setResultScores(elements, blueMatches, orangeMatches);
  hideAllResults(elements);
  showScreen('result');
  elements.resultScreen.classList.add('result-screen--gameover');
  showGameOverScreen(elements);
  const DELAY_MS = 1200;
  setTimeout(() => {
    elements.resultScreen.classList.remove('result-screen--gameover');
    if (winner === 'tie') {
      elements.resultScreen.classList.add('result-screen--draw');
      showDrawScreen(elements);
    } else {
      elements.resultScreen.classList.add(`result-screen--winner-${winner}`);
      showWinnerScreen(elements, winner);
    }
  }, DELAY_MS);
}
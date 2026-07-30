import { state } from './state';
import { showScreen } from './helpers';

function getResultElements() {
  return {
    resultScreen: document.getElementById('screen-result') as HTMLElement,
    resultGameover: document.getElementById('result-gameover') as HTMLElement,
    resultWinner: document.getElementById('result-winner') as HTMLElement,
    resultDraw: document.getElementById('result-draw') as HTMLElement,
    resultBlueScore: document.getElementById('result-blue-score') as HTMLElement,
    resultOrangeScore: document.getElementById('result-orange-score') as HTMLElement,
    resultWinnerTitle: document.getElementById('result-winner-title') as HTMLElement,
  };
}

function setResultScores(elements: ReturnType<typeof getResultElements>, blueMatches: number, orangeMatches: number): void {
  const isCodeTheme = state.selectedTheme === 'code';
  elements.resultBlueScore.textContent = isCodeTheme ? `Blue ${blueMatches}` : String(blueMatches);
  elements.resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeMatches}` : String(orangeMatches);
}

function showGameOverScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultScreen.classList.add('result-screen--gameover');
  elements.resultGameover.style.display = 'block';
  elements.resultWinner.style.display = 'none';
  elements.resultDraw.style.display = 'none';
}

function showDrawScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultScreen.classList.add('result-screen--draw');
  elements.resultDraw.style.display = 'block';
  elements.resultWinner.style.display = 'none';
  elements.resultGameover.style.display = 'none';
}

function showWinnerScreen(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  elements.resultScreen.classList.add(`result-screen--winner-${winner}`);
  elements.resultWinner.style.display = 'flex';
  elements.resultGameover.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  elements.resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
  elements.resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
}

export function handleGameWin(
  { blueMatches, orangeMatches, winner }: { blueMatches: number; orangeMatches: number; winner: 'blue' | 'orange' | 'tie' }
): void {
  const elements = getResultElements();
  elements.resultScreen.classList.remove(
    'result-screen--winner-blue',
    'result-screen--winner-orange',
    'result-screen--draw',
    'result-screen--gameover'
  );
  setResultScores(elements, blueMatches, orangeMatches);
  const isGameOver = winner !== 'tie' && winner !== state.selectedPlayer;
  if (isGameOver) {
    showGameOverScreen(elements);
  } else if (winner === 'tie') {
    showDrawScreen(elements);
  } else {
    showWinnerScreen(elements, winner);
  }
  showScreen('result');
}
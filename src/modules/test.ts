import { state } from './state';
import { showScreen } from './helpers';

function getResultElements() {
  return {
    resultScreen: document.getElementById('screen-result'),
    resultBlueScore: document.getElementById('result-blue-score'),
    resultOrangeScore: document.getElementById('result-orange-score'),
    resultWinnerTitle: document.getElementById('result-winner-title'),
    resultGameover: document.getElementById('result-gameover'),
    resultWinner: document.getElementById('result-winner'),
    resultDraw: document.getElementById('result-draw'),
  };
}

function setTestScores(elements: ReturnType<typeof getResultElements>, blueScore: number, orangeScore: number): void {
  const isCodeTheme = state.selectedTheme === 'code';
  if (elements.resultBlueScore) {
    elements.resultBlueScore.textContent = isCodeTheme ? `Blue ${blueScore}` : String(blueScore);
  }
  if (elements.resultOrangeScore) {
    elements.resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeScore}` : String(orangeScore);
  }
}

function resetResultClasses(elements: ReturnType<typeof getResultElements>): void {
  if (elements.resultScreen) {
    elements.resultScreen.classList.remove(
      'result-screen--winner-blue',
      'result-screen--winner-orange',
      'result-screen--draw',
      'result-screen--gameover'
    );
  }
}

function hideAllResultBlocks(elements: ReturnType<typeof getResultElements>): void {
  if (elements.resultGameover) elements.resultGameover.style.display = 'none';
  if (elements.resultWinner) elements.resultWinner.style.display = 'none';
  if (elements.resultDraw) elements.resultDraw.style.display = 'none';
}

function showTestGameOver(elements: ReturnType<typeof getResultElements>): void {
  if (elements.resultScreen) elements.resultScreen.classList.add('result-screen--gameover');
  if (elements.resultGameover) elements.resultGameover.style.display = 'block';
}

function showTestDraw(elements: ReturnType<typeof getResultElements>): void {
  if (elements.resultScreen) elements.resultScreen.classList.add('result-screen--draw');
  if (elements.resultDraw) elements.resultDraw.style.display = 'block';
}

function showTestWinner(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  if (elements.resultScreen) elements.resultScreen.classList.add(`result-screen--winner-${winner}`);
  if (elements.resultWinner) elements.resultWinner.style.display = 'flex';
  if (elements.resultWinnerTitle) {
    elements.resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
    elements.resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
  }
}

export function testResultScreen(
  winner: 'blue' | 'orange' | 'tie' | 'gameover',
  blueScore: number = 3,
  orangeScore: number = 2
): void {
  const elements = getResultElements();
  if (!elements.resultScreen || !elements.resultBlueScore || !elements.resultOrangeScore) {
    console.error('Result Screen Elemente nicht gefunden!');
    return;
  }
  setTestScores(elements, blueScore, orangeScore);
  resetResultClasses(elements);
  hideAllResultBlocks(elements);
  if (winner === 'gameover') {
    showTestGameOver(elements);
  } else if (winner === 'tie') {
    showTestDraw(elements);
  } else {
    showTestWinner(elements, winner);
  }
  showScreen('result');
}
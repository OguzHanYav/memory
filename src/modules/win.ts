import { state } from './state';
import { showScreen } from './helpers';

/**
 * Gets all result screen DOM elements.
 * @returns Object containing result screen elements
 */
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

/**
 * Sets the result screen scores.
 * @param elements - The result screen elements
 * @param blueMatches - Blue player's matches
 * @param orangeMatches - Orange player's matches
 */
function setResultScores(elements: ReturnType<typeof getResultElements>, blueMatches: number, orangeMatches: number): void {
  const isCodeTheme = state.selectedTheme === 'code';
  elements.resultBlueScore.textContent = isCodeTheme ? `Blue ${blueMatches}` : String(blueMatches);
  elements.resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeMatches}` : String(orangeMatches);
}

/**
 * Shows the game over screen.
 * @param elements - The result screen elements
 */
function showGameOverScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultScreen.classList.add('result-screen--gameover');
  elements.resultGameover.style.display = 'block';
  elements.resultWinner.style.display = 'none';
  elements.resultDraw.style.display = 'none';
}

/**
 * Shows the draw screen.
 * @param elements - The result screen elements
 */
function showDrawScreen(elements: ReturnType<typeof getResultElements>): void {
  elements.resultScreen.classList.add('result-screen--draw');
  elements.resultDraw.style.display = 'block';
  elements.resultWinner.style.display = 'none';
  elements.resultGameover.style.display = 'none';
}

/**
 * Shows the winner screen.
 * @param elements - The result screen elements
 * @param winner - The winning player
 */
function showWinnerScreen(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  elements.resultScreen.classList.add(`result-screen--winner-${winner}`);
  elements.resultWinner.style.display = 'flex';
  elements.resultGameover.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  elements.resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
  elements.resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
}

/**
 * Handles the game win event and displays the appropriate result screen.
 * @param params - The win payload
 * @param params.blueMatches - Blue player's matches
 * @param params.orangeMatches - Orange player's matches
 * @param params.winner - The winner or 'tie'
 */
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
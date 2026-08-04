import { state } from './state';
import { showScreen } from './helpers';

/**
 * Gets all result screen DOM elements for testing.
 * @returns Object containing result screen elements
 */
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

/**
 * Sets test scores on the result screen.
 * @param elements - The result screen elements
 * @param blueScore - Blue player's score
 * @param orangeScore - Orange player's score
 */
function setTestScores(elements: ReturnType<typeof getResultElements>, blueScore: number, orangeScore: number): void {
  const isCodeTheme = state.selectedTheme === 'code';
  if (elements.resultBlueScore) {
    elements.resultBlueScore.textContent = isCodeTheme ? `Blue ${blueScore}` : String(blueScore);
  }
  if (elements.resultOrangeScore) {
    elements.resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeScore}` : String(orangeScore);
  }
}

/**
 * Resets all result screen classes.
 * @param elements - The result screen elements
 */
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

/**
 * Hides all result blocks.
 * @param elements - The result screen elements
 */
function hideAllResultBlocks(elements: ReturnType<typeof getResultElements>): void {
  if (elements.resultGameover) elements.resultGameover.style.display = 'none';
  if (elements.resultWinner) elements.resultWinner.style.display = 'none';
  if (elements.resultDraw) elements.resultDraw.style.display = 'none';
}

/**
 * Shows the game over test screen.
 * @param elements - The result screen elements
 */
function showTestGameOver(elements: ReturnType<typeof getResultElements>): void {
  if (elements.resultScreen) elements.resultScreen.classList.add('result-screen--gameover');
  if (elements.resultGameover) elements.resultGameover.style.display = 'block';
}

/**
 * Shows the draw test screen.
 * @param elements - The result screen elements
 */
function showTestDraw(elements: ReturnType<typeof getResultElements>): void {
  if (elements.resultScreen) elements.resultScreen.classList.add('result-screen--draw');
  if (elements.resultDraw) elements.resultDraw.style.display = 'block';
}

/**
 * Shows the winner test screen.
 * @param elements - The result screen elements
 * @param winner - The winning player
 */
function showTestWinner(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  if (elements.resultScreen) elements.resultScreen.classList.add(`result-screen--winner-${winner}`);
  if (elements.resultWinner) elements.resultWinner.style.display = 'flex';
  if (elements.resultWinnerTitle) {
    elements.resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
    elements.resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
  }
}

/**
 * Displays the result screen with test data.
 * @param winner - The winner type: 'blue', 'orange', 'tie', or 'gameover'
 * @param blueScore - Blue player's score (default: 3)
 * @param orangeScore - Orange player's score (default: 2)
 */
export function testResultScreen(
  winner: 'blue' | 'orange' | 'tie' | 'gameover',
  blueScore: number = 3,
  orangeScore: number = 2
): void {
  // Get all elements
  const elements = getResultElements();
  
  // Validate required elements exist
  if (!elements.resultScreen) {
    console.error('Result Screen element (#screen-result) not found!');
    return;
  }
  
  if (!elements.resultBlueScore) {
    console.error('Result Blue Score element (#result-blue-score) not found!');
    return;
  }
  
  if (!elements.resultOrangeScore) {
    console.error('Result Orange Score element (#result-orange-score) not found!');
    return;
  }
  
  // Set scores
  setTestScores(elements, blueScore, orangeScore);
  
  // Reset all classes
  resetResultClasses(elements);
  
  // Hide all blocks
  hideAllResultBlocks(elements);
  
  // Show the appropriate screen based on winner type
  if (winner === 'gameover') {
    showTestGameOver(elements);
  } else if (winner === 'tie') {
    showTestDraw(elements);
  } else {
    showTestWinner(elements, winner);
  }
  
  // Show the result screen
  showScreen('result');
}
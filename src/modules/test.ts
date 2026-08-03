import { state } from './state';
import { showScreen } from './helpers';

/**
 * Displays the result screen with test data.
 * @param winner - The winner type
 * @param blueScore - Blue player's score
 * @param orangeScore - Orange player's score
 */
export function testResultScreen(
  winner: 'blue' | 'orange' | 'tie' | 'gameover',
  blueScore: number = 3,
  orangeScore: number = 2
): void {
  const resultScreen = document.getElementById('screen-result');
  const resultBlueScore = document.getElementById('result-blue-score');
  const resultOrangeScore = document.getElementById('result-orange-score');
  const resultWinnerTitle = document.getElementById('result-winner-title');
  const resultGameover = document.getElementById('result-gameover');
  const resultWinner = document.getElementById('result-winner');
  const resultDraw = document.getElementById('result-draw');

  if (!resultScreen || !resultBlueScore || !resultOrangeScore) {
    console.error('Result Screen Elemente nicht gefunden!');
    return;
  }

  const isCodeTheme = state.selectedTheme === 'code';
  resultBlueScore.textContent = isCodeTheme ? `Blue ${blueScore}` : String(blueScore);
  resultOrangeScore.textContent = isCodeTheme ? `Orange ${orangeScore}` : String(orangeScore);

  resultScreen.classList.remove(
    'result-screen--winner-blue',
    'result-screen--winner-orange',
    'result-screen--draw',
    'result-screen--gameover'
  );

  if (resultGameover) resultGameover.style.display = 'none';
  if (resultWinner) resultWinner.style.display = 'none';
  if (resultDraw) resultDraw.style.display = 'none';

  if (winner === 'gameover') {
    resultScreen.classList.add('result-screen--gameover');
    if (resultGameover) resultGameover.style.display = 'block';
  } else if (winner === 'tie') {
    resultScreen.classList.add('result-screen--draw');
    if (resultDraw) resultDraw.style.display = 'block';
  } else {
    resultScreen.classList.add(`result-screen--winner-${winner}`);
    if (resultWinner) resultWinner.style.display = 'flex';
    if (resultWinnerTitle) {
      resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
      resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
    }
  }
  showScreen('result');
}
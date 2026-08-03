import { state } from './state';
import { showScreen } from './helpers';

/**
 * Icon mapping for each theme and winner.
 */
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
    resultPlayerIcon: document.getElementById('result-player-icon') as HTMLElement,
    winnerIconImg: document.getElementById('winner-icon-img') as HTMLImageElement,
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
 * Applies the correct theme class to result screen.
 * @param elements - The result screen elements
 */
function applyResultTheme(elements: ReturnType<typeof getResultElements>): void {
  const theme = state.selectedTheme || 'code';
  
  // Remove all theme classes
  elements.resultScreen.classList.remove('theme-code', 'theme-games', 'theme-da', 'theme-food');
  
  // Add current theme class
  elements.resultScreen.classList.add(`theme-${theme}`);
}

/**
 * Sets the winner icon based on theme and winner.
 * @param elements - The result screen elements
 * @param winner - The winning player
 */
function setWinnerIcon(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  const theme = state.selectedTheme || 'code';
  const iconPath = WINNER_ICONS[theme]?.[winner] || WINNER_ICONS.code.blue;
  
  if (elements.winnerIconImg) {
    elements.winnerIconImg.src = iconPath;
    elements.winnerIconImg.alt = `${winner} player icon`;
    elements.winnerIconImg.style.display = 'block';
  }
}

/**
 * Shows the game over screen with slide-in animation from top.
 * @param elements - The result screen elements
 */
function showGameOverScreen(elements: ReturnType<typeof getResultElements>): void {
  // Hide all other blocks
  elements.resultWinner.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  
  // Remove all animation classes
  elements.resultGameover.classList.remove('slide-in', 'slide-out');
  elements.resultWinner.classList.remove('slide-in', 'slide-out');
  elements.resultDraw.classList.remove('slide-in', 'slide-out');
  
  // Show game over
  elements.resultGameover.style.display = 'flex';
  
  // Force reflow for animation
  void elements.resultGameover.offsetHeight;
  elements.resultGameover.classList.add('slide-in');
}

/**
 * Shows the winner screen with slide-in animation from top.
 * @param elements - The result screen elements
 * @param winner - The winning player
 */
function showWinnerScreen(elements: ReturnType<typeof getResultElements>, winner: 'blue' | 'orange'): void {
  // Hide all other blocks
  elements.resultGameover.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  
  // Remove all animation classes
  elements.resultGameover.classList.remove('slide-in', 'slide-out');
  elements.resultWinner.classList.remove('slide-in', 'slide-out');
  elements.resultDraw.classList.remove('slide-in', 'slide-out');
  
  // Show winner
  elements.resultWinner.style.display = 'flex';
  elements.resultWinnerTitle.textContent = winner === 'blue' ? 'BLUE PLAYER' : 'ORANGE PLAYER';
  elements.resultWinnerTitle.style.color = winner === 'blue' ? '#2aa8ff' : '#ff8c42';
  
  // Set winner icon
  setWinnerIcon(elements, winner);
  
  // Force reflow for animation
  void elements.resultWinner.offsetHeight;
  elements.resultWinner.classList.add('slide-in');
}

/**
 * Shows the draw screen with slide-in animation from top.
 * @param elements - The result screen elements
 */
function showDrawScreen(elements: ReturnType<typeof getResultElements>): void {
  // Hide all other blocks
  elements.resultGameover.style.display = 'none';
  elements.resultWinner.style.display = 'none';
  
  // Remove all animation classes
  elements.resultGameover.classList.remove('slide-in', 'slide-out');
  elements.resultWinner.classList.remove('slide-in', 'slide-out');
  elements.resultDraw.classList.remove('slide-in', 'slide-out');
  
  // Show draw
  elements.resultDraw.style.display = 'flex';
  
  // Force reflow for animation
  void elements.resultDraw.offsetHeight;
  elements.resultDraw.classList.add('slide-in');
}

/**
 * Hides all result screens.
 * @param elements - The result screen elements
 */
function hideAllResults(elements: ReturnType<typeof getResultElements>): void {
  elements.resultGameover.style.display = 'none';
  elements.resultWinner.style.display = 'none';
  elements.resultDraw.style.display = 'none';
  elements.resultGameover.classList.remove('slide-in', 'slide-out');
  elements.resultWinner.classList.remove('slide-in', 'slide-out');
  elements.resultDraw.classList.remove('slide-in', 'slide-out');
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
  
  // Apply theme to result screen FIRST
  applyResultTheme(elements);
  
  // Remove all result classes
  elements.resultScreen.classList.remove(
    'result-screen--winner-blue',
    'result-screen--winner-orange',
    'result-screen--draw',
    'result-screen--gameover'
  );
  
  // Set scores
  setResultScores(elements, blueMatches, orangeMatches);
  
  // Hide all results first
  hideAllResults(elements);
  
  // Show result screen
  showScreen('result');
  
  // STEP 1: Show Game Over screen immediately (instant)
  elements.resultScreen.classList.add('result-screen--gameover');
  showGameOverScreen(elements);
  
  // STEP 2: After 1200ms delay, show winner/draw screen with slide from top
  const DELAY_MS = 1200;
  
  setTimeout(() => {
    // Remove gameover class
    elements.resultScreen.classList.remove('result-screen--gameover');
    
    // Determine which screen to show
    if (winner === 'tie') {
      elements.resultScreen.classList.add('result-screen--draw');
      showDrawScreen(elements);
    } else {
      elements.resultScreen.classList.add(`result-screen--winner-${winner}`);
      showWinnerScreen(elements, winner);
    }
  }, DELAY_MS);
}
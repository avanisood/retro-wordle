# RETRO WORDLE 1985 - IMPLEMENTATION GUIDE

## Project Overview
This is a complete frontend implementation of a 1985-style retro Wordle game with CGA graphics aesthetic. All HTML and CSS files are complete and ready to use. You now need to implement the JavaScript functionality using Claude Sonnet 4.5 (Copilot).

## Files Included
- `index.html` - Title screen (COMPLETE)
- `character.html` - Wizard animation screen (COMPLETE)
- `game.html` - Main game interface (COMPLETE)
- `admin.html` - Admin panel for word management (COMPLETE)
- `styles.css` - Complete stylesheet with all styling (COMPLETE)
- `title.js` - Title screen logic (NEEDS IMPLEMENTATION)
- `character.js` - Character animation logic (NEEDS IMPLEMENTATION)
- `game.js` - Core game logic (NEEDS IMPLEMENTATION)
- `admin.js` - Admin panel logic (NEEDS IMPLEMENTATION)

## Implementation Steps Using Claude Sonnet 4.5

---

## STEP 1: Implement Title Screen (title.js)

### Copilot Prompt:
```
I'm building a retro 1985-style Wordle game. I need you to implement the title screen JavaScript functionality.

REQUIREMENTS:
- When the user clicks anywhere on the page, navigate to 'character.html'
- Add a subtle sound effect on click (optional - use Web Audio API for retro beep)
- Add a fade-out transition before navigating (0.5s)
- Prevent double-clicks from causing issues

CONTEXT:
- The HTML is already complete with class "title-screen" on the body
- We want a simple, clean transition to the next screen
- Keep the code simple and well-commented

Please provide the complete title.js implementation.
```

---

## STEP 2: Implement Character Screen (character.js)

### Copilot Prompt:
```
I need to implement the wizard character screen for my retro Wordle game.

REQUIREMENTS:
1. Auto-advance to 'game.html' after 4 seconds
2. Allow user to click anywhere to skip immediately
3. Ensure animations are smooth and don't interfere with navigation
4. Add a fade-out transition before navigating (0.5s)
5. Optional: Add retro sound effects for the magic wand animation

CONTEXT:
- The HTML has all the wizard character elements with CSS animations already working
- The background color cycling animation is handled by CSS
- We just need the navigation logic and optional sound

Please provide the complete character.js implementation with clear comments.
```

---

## STEP 3: Implement Core Game Logic (game.js) - MOST IMPORTANT

### Copilot Prompt Part 1 - Basic Setup:
```
I'm implementing the core Wordle game logic for a retro 1985-style game. This is the most critical file. Let's start with the basic setup and structure.

REQUIREMENTS FOR PART 1:
1. Create a game state object that tracks:
   - targetWord (5-letter word from admin panel)
   - guesses array (up to 6 guesses)
   - currentRow (0-5)
   - currentGuess (current input string)
   - gameStatus ('playing', 'won', 'lost')

2. Implement getTodaysWord() function:
   - Load word list from localStorage key 'wordleData'
   - Calculate which word to use based on start date and current date
   - Handle case where no words are configured (use default word 'CRANE')

3. Implement initGame() function:
   - Load target word
   - Set up keyboard event listeners
   - Load saved game state from localStorage if exists
   - Initialize display

4. Add keyboard event listener:
   - Listen for letter keys (A-Z)
   - Listen for Enter (submit guess)
   - Listen for Backspace (delete letter)
   - Prevent input if game is over or row is animating

CONTEXT:
- Use localStorage for all data persistence
- The HTML structure uses data attributes: data-row and data-col
- Keep code modular and well-commented

Please provide Part 1 of the game.js implementation.
```

### Copilot Prompt Part 2 - Input Handling:
```
Now let's implement the input handling for the Wordle game.

REQUIREMENTS FOR PART 2:
1. Implement handleKeyPress(letter) function:
   - Only accept A-Z letters
   - Maximum 5 letters per guess
   - Update currentGuess in game state
   - Update the input display (.input-label)
   - Add the letter to the current row's tiles with animation
   - Show each letter appearing in its tile with a subtle pop effect

2. Implement handleBackspace() function:
   - Remove last letter from currentGuess
   - Update display
   - Remove letter from the tile

3. Implement updateInputDisplay() function:
   - Update the .input-label with current guess
   - Show cursor blinking after last letter

4. Implement updateTileDisplay(row, guess) function:
   - Update the tiles in the specified row with letters from guess
   - Add 'filled' class to tiles with letters
   - Clear empty tiles

CONTEXT:
- Tiles are in .board-row with data-row attribute
- Each tile has data-col attribute (0-4)
- The input display area has class .input-label
- Add smooth animations when letters appear/disappear

Please provide Part 2 of the game.js implementation focusing on input handling.
```

### Copilot Prompt Part 3 - Guess Validation & Evaluation:
```
Now let's implement the critical guess evaluation logic that matches official Wordle behavior.

REQUIREMENTS FOR PART 3:
1. Implement validateGuess(guess) function:
   - Check if guess is exactly 5 letters
   - Optionally: check against a word dictionary (can skip for now)
   - Show error message if invalid
   - Trigger shake animation on current row if invalid

2. Implement evaluateGuess(guess, target) function:
   THIS IS CRITICAL - Must match official Wordle algorithm:
   
   Algorithm:
   ```
   function evaluateGuess(guess, target) {
     const result = Array(5).fill('absent');
     const targetLetters = target.split('');
     const guessLetters = guess.split('');
     
     // FIRST PASS: Mark exact matches (green/correct)
     for (let i = 0; i < 5; i++) {
       if (guessLetters[i] === targetLetters[i]) {
         result[i] = 'correct';
         targetLetters[i] = null; // Mark as used
       }
     }
     
     // SECOND PASS: Mark present letters (yellow)
     for (let i = 0; i < 5; i++) {
       if (result[i] !== 'correct') {
         const index = targetLetters.indexOf(guessLetters[i]);
         if (index !== -1) {
           result[i] = 'present';
           targetLetters[index] = null; // Mark as used
         }
       }
     }
     
     return result; // ['correct', 'present', 'absent', ...]
   }
   ```

3. Implement submitGuess() function:
   - Validate the guess
   - Evaluate the guess
   - Animate tile flips with colors revealing
   - Update game state
   - Check win/loss condition
   - Save game state to localStorage

4. Implement animateTileFlip(row, results) function:
   - Flip each tile sequentially (left to right)
   - 150ms delay between tiles
   - Reveal color on flip
   - Use CSS class 'flip' and color classes: 'correct', 'present', 'absent'

Please provide Part 3 with the complete evaluation logic and animations.
```

### Copilot Prompt Part 4 - Win/Loss & Statistics:
```
Now let's implement the win/loss detection and statistics tracking.

REQUIREMENTS FOR PART 4:
1. Implement checkGameStatus() function:
   - Check if current guess matches target word (WIN)
   - Check if all 6 guesses used (LOSS)
   - Update gameStatus in state

2. Implement showModal(won) function:
   - Show the modal with id 'gameModal'
   - Display appropriate title: "CONGRATULATIONS!" or "GAME OVER!"
   - Show the target word
   - Display statistics
   - Set up button handlers

3. Implement statistics tracking:
   - Store in localStorage key 'wordleStats':
     {
       gamesPlayed: number,
       gamesWon: number,
       currentStreak: number,
       maxStreak: number,
       guessDistribution: [0,0,0,0,0,0]
     }
   - Update stats on game end
   - Calculate win percentage

4. Implement updateStatsDisplay() function:
   - Update modal stat elements:
     - #gamesPlayed
     - #winRate
     - #currentStreak

5. Implement playAgain() function:
   - Reset game state
   - Clear the board
   - Load new word (if available)
   - Hide modal

6. Implement shareResults() function:
   - Generate emoji grid (like real Wordle):
     🟩 for correct
     🟨 for present
     ⬛ for absent
   - Copy to clipboard
   - Show "Copied!" message

Please provide Part 4 with complete win/loss handling and statistics.
```

### Copilot Prompt Part 5 - State Persistence:
```
Finally, let's implement state persistence so users can resume their game.

REQUIREMENTS FOR PART 5:
1. Implement saveGameState() function:
   - Save to localStorage key 'currentGame':
     {
       targetWord: string,
       guesses: array,
       currentRow: number,
       gameStatus: string,
       date: string (today's date)
     }
   - Call after each guess submission

2. Implement loadGameState() function:
   - Check if saved game exists
   - Check if it's from today (clear if old)
   - Restore game state
   - Replay all guesses with instant animations
   - If game was won/lost, show modal immediately

3. Implement clearOldGameState() function:
   - Clear saved game if date doesn't match today
   - Called on init

4. Add error handling:
   - Handle localStorage not available
   - Handle corrupted data
   - Fallback to fresh game

ADDITIONAL FEATURES:
- Add a subtle console.log showing which word is being used (for testing)
- Add keyboard shortcut: press ESC to go to admin panel (for easy testing)

Please provide Part 5 with complete state persistence and error handling.
```

---

## STEP 4: Implement Admin Panel (admin.js)

### Copilot Prompt Part 1 - Authentication & Data Loading:
```
I need to implement the admin panel for managing the word list in my retro Wordle game.

REQUIREMENTS FOR PART 1:
1. Implement checkAuth() function:
   - Prompt user for password on page load
   - Password: 'wordle1985'
   - If wrong, redirect to index.html
   - If correct, proceed to load data

2. Implement loadData() function:
   - Load from localStorage key 'wordleData':
     {
       wordList: array of strings,
       startDate: string (YYYY-MM-DD)
     }
   - Populate the textarea with words (one per line)
   - Populate the start date input
   - Calculate and show current word
   - Calculate and show current index
   - Update word count

3. Implement getCurrentWordInfo() function:
   - Calculate days since start date
   - Get current index in word list
   - Get current word
   - Display in the interface

4. Set up event listeners:
   - Word list textarea: update word count on input
   - Save button: call saveData()
   - Load button: call loadData()
   - Clear button: call clearData()
   - Back button: navigate to game.html

Please provide Part 1 of admin.js with authentication and data loading.
```

### Copilot Prompt Part 2 - Data Validation & Saving:
```
Now let's implement the data validation and saving logic for the admin panel.

REQUIREMENTS FOR PART 2:
1. Implement validateWords(wordText) function:
   - Split by newlines
   - Filter out empty lines
   - Convert all to uppercase
   - Check each word:
     * Exactly 5 letters
     * Only A-Z characters
     * No duplicates
   - Return object: { valid: array, invalid: array }

2. Implement saveData() function:
   - Get word list from textarea
   - Validate all words
   - If invalid words exist:
     * Show error message listing invalid words
     * Highlight textarea in red
     * Don't save
   - If all valid:
     * Get start date from input
     * Validate start date is set
     * Save to localStorage 'wordleData'
     * Show success message
     * Update word count and current word display

3. Implement updateWordCount() function:
   - Count lines in textarea
   - Filter empty lines
   - Display count in #wordCount element

4. Implement showStatus(message, type) function:
   - Display message in #statusMessage
   - Type: 'success', 'error', or 'info'
   - Apply appropriate CSS class
   - Auto-hide after 3 seconds

5. Add input validation:
   - Real-time word count update as user types
   - Highlight invalid words (optional: mark in red)

Please provide Part 2 of admin.js with validation and saving logic.
```

### Copilot Prompt Part 3 - Additional Admin Features:
```
Finally, let's add the remaining admin panel features.

REQUIREMENTS FOR PART 3:
1. Implement clearData() function:
   - Show confirmation dialog
   - If confirmed:
     * Clear localStorage 'wordleData'
     * Clear localStorage 'currentGame'
     * Clear localStorage 'wordleStats'
     * Clear form fields
     * Show success message

2. Implement exportData() function:
   - Generate JSON of current configuration
   - Create downloadable file
   - Trigger download

3. Implement importData() function:
   - Allow user to upload JSON file
   - Parse and validate
   - Load into form
   - Show success/error message

4. Add default word list:
   - If no data exists, populate with a default list of 50 common 5-letter words
   - Set start date to today

5. Add keyboard shortcuts:
   - Ctrl+S: Save data
   - Ctrl+L: Load data
   - ESC: Back to game

DEFAULT WORD LIST (50 words):
CRANE, SLATE, AUDIO, SHOUT, THINK, WORLD, PLANT, BREAD, TOAST, SMART,
BRAVE, QUICK, FROST, LIGHT, NIGHT, FIGHT, MIGHT, RIGHT, SIGHT, TIGHT,
CLAIM, TRAIL, FRAIL, SNAIL, QUAIL, STORM, CHART, START, HEART, APART,
GRAPE, SHAPE, DRAPE, SPACE, TRACE, GRACE, PLACE, BEAST, FEAST, LEAST,
YEAST, COAST, ROAST, BOAST, PRIDE, GLIDE, SLIDE, BRIDE, GUIDE, TRIBE

Please provide Part 3 of admin.js with these additional features.
```

---

## STEP 5: Testing Checklist

After implementing all JavaScript files, test the following:

### Title Screen Tests:
- [ ] Page loads with no console errors
- [ ] Clicking anywhere navigates to character.html
- [ ] No double-click issues

### Character Screen Tests:
- [ ] Auto-advances after 4 seconds
- [ ] Clicking skips to game immediately
- [ ] Animations are smooth
- [ ] Background color cycles

### Game Screen Tests:
- [ ] Keyboard input works (A-Z)
- [ ] Backspace removes letters
- [ ] Can't type more than 5 letters
- [ ] Enter submits guess
- [ ] Invalid guess shows shake animation
- [ ] Tile flip animation works with correct timing
- [ ] Colors match official Wordle rules:
  * Green: correct letter, correct position
  * Yellow: correct letter, wrong position
  * Black: letter not in word
- [ ] Test word with duplicate letters (e.g., SPEED, ROBOT)
- [ ] Win condition triggers modal
- [ ] Loss condition shows answer
- [ ] Statistics track correctly
- [ ] Game state persists on refresh
- [ ] Share button generates emoji grid
- [ ] Play Again button resets game

### Admin Panel Tests:
- [ ] Password prompt appears
- [ ] Correct password grants access
- [ ] Wrong password redirects
- [ ] Load button populates form
- [ ] Word list validates correctly
- [ ] Invalid words show error
- [ ] Save button stores data
- [ ] Word count updates live
- [ ] Current word displays correctly
- [ ] Start date picker works
- [ ] Clear button clears all data (with confirmation)
- [ ] Back button returns to game

### Cross-Screen Tests:
- [ ] Data persists across all screens
- [ ] Admin changes affect game immediately
- [ ] Daily word rotation works (test by changing system date)
- [ ] No localStorage errors in console

---

## STEP 6: Deployment

Once all testing is complete, deploy using GitHub Pages:

### Deployment Steps:
```bash
# 1. Initialize git repository
git init
git add .
git commit -m "Initial commit - Retro Wordle 1985"

# 2. Create GitHub repository
# Go to github.com and create new repository named "retro-wordle"

# 3. Push to GitHub
git remote add origin https://github.com/YOUR-USERNAME/retro-wordle.git
git branch -M main
git push -u origin main

# 4. Enable GitHub Pages
# Go to repository Settings > Pages
# Source: Deploy from main branch
# Save

# 5. Access your game at:
# https://YOUR-USERNAME.github.io/retro-wordle/
```

### Alternative: Netlify Drop
1. Go to https://app.netlify.com/drop
2. Drag and drop your project folder
3. Get instant URL: https://random-name.netlify.app
4. Optional: Configure custom domain

---

## TROUBLESHOOTING COMMON ISSUES

### Issue: "Uncaught ReferenceError: X is not defined"
**Solution:** Check that all functions are defined before they're called. Move function declarations to top of file.

### Issue: Tiles not flipping correctly
**Solution:** Verify the flip animation timing in CSS matches JavaScript delays. Check that 'flip' class is being added/removed properly.

### Issue: Colors not matching official Wordle
**Solution:** Review the evaluateGuess() algorithm. Common mistake: not marking letters as "used" in the target word array.

### Issue: localStorage not working
**Solution:** Check browser privacy settings. Some browsers block localStorage in incognito mode. Add error handling for localStorage failures.

### Issue: Word list not rotating daily
**Solution:** Verify start date is set correctly in admin panel. Check date calculation logic in getTodaysWord() function.

### Issue: Game state not persisting
**Solution:** Ensure saveGameState() is called after each guess. Check that date comparison works correctly.

---

## OPTIONAL ENHANCEMENTS

Once basic functionality works, consider adding:

1. **Sound Effects**
   - Use Web Audio API to generate retro 8-bit beeps
   - Key press sound
   - Correct/incorrect sounds
   - Win fanfare

2. **Hard Mode**
   - Revealed hints must be used in subsequent guesses
   - Toggle in settings

3. **Dictionary Validation**
   - Load a word list from API
   - Reject non-dictionary words

4. **Color Blind Mode**
   - Add patterns/symbols in addition to colors
   - High contrast option

5. **Keyboard Display**
   - Show on-screen keyboard with letter colors
   - Track which letters have been guessed

---

## FILE STRUCTURE FOR DEPLOYMENT

```
retro-wordle/
├── index.html              # Title screen
├── character.html          # Wizard animation
├── game.html              # Main game
├── admin.html             # Admin panel
├── styles.css             # All styles
├── title.js               # Title logic
├── character.js           # Character logic
├── game.js                # Game logic
├── admin.js               # Admin logic
└── README.md              # This file
```

---

## FINAL NOTES

- All HTML and CSS are complete and tested
- Focus on implementing the JavaScript functionality step by step
- Test thoroughly after each implementation step
- Use browser DevTools console to debug
- localStorage is crucial - handle it carefully
- The game should feel authentic to 1985 DOS games
- Keep animations snappy but not too fast
- Make sure the retro aesthetic is preserved throughout

Good luck with your implementation! 🎮

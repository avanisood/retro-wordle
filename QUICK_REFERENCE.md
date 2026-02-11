# QUICK REFERENCE - Copilot Prompts

## Use These Prompts in Order with Claude Sonnet 4.5

### 1️⃣ TITLE SCREEN (5 minutes)
**Open:** `title.js`
**Paste this prompt:**
```
Implement title screen navigation for retro Wordle game. Click anywhere → navigate to character.html with fade transition. Add retro beep sound (optional). Prevent double-clicks.
```

---

### 2️⃣ CHARACTER SCREEN (5 minutes)
**Open:** `character.js`
**Paste this prompt:**
```
Implement wizard character screen. Auto-advance to game.html after 4 seconds. Allow click to skip. Add fade transition. Retro sound optional.
```

---

### 3️⃣ GAME LOGIC - PART 1 (15 minutes)
**Open:** `game.js`
**Paste this prompt:**
```
Implement Wordle game initialization. Create gameState object (targetWord, guesses, currentRow, currentGuess, gameStatus). Implement getTodaysWord() from localStorage 'wordleData', calculate daily word. Implement initGame() with keyboard listeners (A-Z, Enter, Backspace). Load saved state from localStorage.
```

---

### 4️⃣ GAME LOGIC - PART 2 (15 minutes)
**Continue in:** `game.js`
**Paste this prompt:**
```
Implement input handling. handleKeyPress(letter) - max 5 letters, update display, animate tiles. handleBackspace() - remove last letter. updateInputDisplay() - show current guess in .input-label. updateTileDisplay(row, guess) - populate tiles with letters and 'filled' class.
```

---

### 5️⃣ GAME LOGIC - PART 3 (20 minutes)
**Continue in:** `game.js`
**Paste this prompt:**
```
Implement guess evaluation matching official Wordle. validateGuess() - check 5 letters, show shake animation if invalid. evaluateGuess(guess, target) - CRITICAL: First pass mark exact matches as 'correct' and set targetLetter to null. Second pass mark remaining as 'present' or 'absent'. submitGuess() - validate, evaluate, animate flip (150ms delay between tiles), update state. animateTileFlip(row, results) - add 'flip' class and color classes ('correct', 'present', 'absent').
```

---

### 6️⃣ GAME LOGIC - PART 4 (15 minutes)
**Continue in:** `game.js`
**Paste this prompt:**
```
Implement win/loss. checkGameStatus() - detect win/loss. showModal(won) - display #gameModal with appropriate message and stats. Track statistics in localStorage 'wordleStats' (gamesPlayed, gamesWon, currentStreak, guessDistribution). updateStatsDisplay() - populate #gamesPlayed, #winRate, #currentStreak. playAgain() - reset and load new word. shareResults() - generate emoji grid (🟩🟨⬛), copy to clipboard.
```

---

### 7️⃣ GAME LOGIC - PART 5 (10 minutes)
**Continue in:** `game.js`
**Paste this prompt:**
```
Implement state persistence. saveGameState() to localStorage 'currentGame' after each guess (targetWord, guesses, currentRow, gameStatus, date). loadGameState() on init - restore if from today, clear if old. Replay guesses instantly on load. Add error handling for localStorage failures. Add ESC key → admin panel shortcut.
```

---

### 8️⃣ ADMIN PANEL - PART 1 (10 minutes)
**Open:** `admin.js`
**Paste this prompt:**
```
Implement admin panel. checkAuth() - prompt for password 'wordle1985', redirect to index.html if wrong. loadData() from localStorage 'wordleData' (wordList array, startDate string). Populate textarea and date input. getCurrentWordInfo() - calculate days since start, show current word and index. Set up all button event listeners.
```

---

### 9️⃣ ADMIN PANEL - PART 2 (15 minutes)
**Continue in:** `admin.js`
**Paste this prompt:**
```
Implement data validation and saving. validateWords(text) - split by newlines, uppercase, check 5 letters A-Z only, no duplicates, return {valid, invalid}. saveData() - validate words, show error if invalid with list, save to localStorage 'wordleData' if valid. updateWordCount() - count and display. showStatus(message, type) - show in #statusMessage with 'success'/'error'/'info' class, auto-hide after 3s.
```

---

### 🔟 ADMIN PANEL - PART 3 (10 minutes)
**Continue in:** `admin.js`
**Paste this prompt:**
```
Add final admin features. clearData() with confirmation - clear all localStorage keys. Add default 50-word list if empty: CRANE, SLATE, AUDIO, SHOUT, THINK, WORLD, PLANT, BREAD, TOAST, SMART, BRAVE, QUICK, FROST, LIGHT, NIGHT, FIGHT, MIGHT, RIGHT, SIGHT, TIGHT, CLAIM, TRAIL, FRAIL, SNAIL, QUAIL, STORM, CHART, START, HEART, APART, GRAPE, SHAPE, DRAPE, SPACE, TRACE, GRACE, PLACE, BEAST, FEAST, LEAST, YEAST, COAST, ROAST, BOAST, PRIDE, GLIDE, SLIDE, BRIDE, GUIDE, TRIBE. Add keyboard shortcuts: Ctrl+S save, Ctrl+L load, ESC back.
```

---

## TESTING ORDER

1. ✅ Test title screen → character screen transition
2. ✅ Test character screen → game screen transition  
3. ✅ Test keyboard input (typing letters)
4. ✅ Test backspace
5. ✅ Test invalid guess (shake animation)
6. ✅ Test valid guess (tile flip + colors)
7. ✅ Test word with duplicates: SPEED, ROBOT
8. ✅ Test win condition
9. ✅ Test loss condition
10. ✅ Test statistics tracking
11. ✅ Test game state persistence (refresh page)
12. ✅ Test admin panel authentication
13. ✅ Test word list save/load
14. ✅ Test invalid words in admin
15. ✅ Test daily word rotation

---

## DEPLOYMENT (2 minutes)

```bash
# GitHub Pages
git init
git add .
git commit -m "Retro Wordle 1985"
git remote add origin https://github.com/USERNAME/retro-wordle.git
git push -u origin main
# Enable Pages in repo settings

# OR Netlify
# Drag folder to netlify.com/drop
```

---

## KEY ALGORITHMS TO VERIFY

### Wordle Color Logic (CRITICAL!)
```javascript
function evaluateGuess(guess, target) {
  const result = Array(5).fill('absent');
  const targetLetters = target.split('');
  
  // FIRST: Mark greens and remove from pool
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      targetLetters[i] = null;
    }
  }
  
  // SECOND: Mark yellows from remaining pool
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct') {
      const idx = targetLetters.indexOf(guess[i]);
      if (idx !== -1) {
        result[i] = 'present';
        targetLetters[idx] = null;
      }
    }
  }
  
  return result;
}
```

### Daily Word Calculation
```javascript
function getTodaysWord() {
  const data = JSON.parse(localStorage.getItem('wordleData'));
  const start = new Date(data.startDate);
  const today = new Date();
  const daysSince = Math.floor((today - start) / 86400000);
  return data.wordList[daysSince % data.wordList.length];
}
```

---

## ESTIMATED TIME: 2-3 HOURS TOTAL

Good luck! 🎮✨

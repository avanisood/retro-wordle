# RETRO WORDLE 1985 - TESTING GUIDE

## 🎮 Complete Testing Checklist

All JavaScript files have been implemented. Use this guide to systematically test all features.

---

## PRE-TESTING SETUP

### Step 1: Open the Game
1. Navigate to the project folder: `/home/avani/wordle`
2. Open `index.html` in your web browser
3. Open Browser Developer Tools (F12)
4. Keep the Console tab visible to monitor for errors

### Step 2: Clear Previous Data (Fresh Start)
1. Open Browser Console
2. Run: `localStorage.clear()`
3. Refresh the page
4. You should start with a clean slate

---

## 📋 DETAILED TEST PROCEDURES

### ✅ TITLE SCREEN TESTS

**Test 1.1: Page Load**
- [ ] Open `index.html`
- [ ] Check Console for errors (should be none)
- [ ] Verify title "RETRO WORDLE" is visible
- [ ] Verify "CLICK ANYWHERE TO START" text is visible
- [ ] Check that retro CGA colors are applied

**Test 1.2: Click Navigation**
- [ ] Click anywhere on the page
- [ ] Should hear a retro beep sound (optional)
- [ ] Page should fade out (0.5s)
- [ ] Should navigate to `character.html`
- [ ] No errors in console

**Test 1.3: Double-Click Prevention**
- [ ] Refresh page
- [ ] Double-click rapidly
- [ ] Should only navigate once (no multiple tabs/errors)

**Expected Console Output:**
```
(No errors should appear)
```

---

### ✅ CHARACTER SCREEN TESTS

**Test 2.1: Auto-Advance**
- [ ] Wait 4 seconds without clicking
- [ ] Wizard animation should be visible
- [ ] Background should cycle through colors
- [ ] After 4 seconds, should fade out and navigate to `game.html`
- [ ] Should hear magic sound effect

**Test 2.2: Skip Feature**
- [ ] Refresh `character.html`
- [ ] Click anywhere before 4 seconds
- [ ] Should immediately fade out and navigate to `game.html`
- [ ] No timing issues or errors

**Test 2.3: Animations**
- [ ] Refresh `character.html`
- [ ] Verify wizard character is animated
- [ ] Verify stars are blinking
- [ ] Verify background color cycles
- [ ] Animations should be smooth (no jank)

**Expected Console Output:**
```
(No errors should appear)
```

---

### ✅ GAME SCREEN TESTS

**Test 3.1: Initial Load**
- [ ] Navigate to `game.html`
- [ ] Check Console for initialization message
- [ ] Verify 6x5 grid is displayed
- [ ] Verify input label shows cursor: "_"
- [ ] No errors in console

**Expected Console Output:**
```
Initializing Retro Wordle 1985...
Started new game
🎮 DEBUG MODE - Today's word: CRANE
Press ESC to access admin panel
```

**Test 3.2: Keyboard Input (Letters)**
- [ ] Type: `C` `R` `A` `N` `E`
- [ ] Each letter should appear in a tile
- [ ] Each letter should have a subtle "pop" animation
- [ ] Input label should show: `CRANE`
- [ ] Should hear a beep for each letter

**Test 3.3: Maximum Letters**
- [ ] After typing 5 letters
- [ ] Try typing a 6th letter
- [ ] Should not accept (max 5 letters)
- [ ] Input label should still show 5 letters

**Test 3.4: Backspace**
- [ ] Type: `HELLO`
- [ ] Press Backspace
- [ ] Last letter should disappear
- [ ] Input label should show: `HELL_`
- [ ] Press Backspace 4 more times
- [ ] All letters should be removed
- [ ] Input label should show: `_`

**Test 3.5: Enter - Invalid Guess (Too Short)**
- [ ] Type: `CAR` (only 3 letters)
- [ ] Press Enter
- [ ] Should show "Not enough letters" error
- [ ] Row should shake
- [ ] Should hear error sound
- [ ] Letters should remain in tiles

**Test 3.6: Enter - Valid Guess**
- [ ] Type: `SLATE` (5 letters)
- [ ] Press Enter
- [ ] Tiles should flip sequentially (left to right)
- [ ] 150ms delay between each flip
- [ ] Colors should reveal:
  - Green (correct): Letter in correct position
  - Yellow (present): Letter in word, wrong position
  - Black (absent): Letter not in word
- [ ] Should hear different sounds for each color
- [ ] Cursor should move to next row

**Test 3.7: Official Wordle Algorithm (Duplicate Letters)**

**Example 1: Target = SPEED, Guess = ERASE**
- [ ] Set up: Use admin panel to set word "SPEED"
- [ ] Type: `ERASE`
- [ ] Press Enter
- [ ] Expected colors:
  - E (pos 0): Yellow (E is in SPEED but not at position 0)
  - R (pos 1): Black (R not in SPEED)
  - A (pos 2): Black (A not in SPEED)
  - S (pos 3): Black (S is in SPEED but only once, already used)
  - E (pos 4): Green (E is at position 4 in SPEED)

**Example 2: Target = ROBOT, Guess = FLOOR**
- [ ] Set up: Use admin panel to set word "ROBOT"
- [ ] Type: `FLOOR`
- [ ] Expected colors:
  - F (pos 0): Black (F not in ROBOT)
  - L (pos 1): Black (L not in ROBOT)
  - O (pos 2): Yellow (O in ROBOT but not at position 2)
  - O (pos 3): Yellow (O in ROBOT but not at position 3)
  - R (pos 4): Black (R in ROBOT but only once, already used)

**Test 3.8: Win Condition**
- [ ] Set up: Note the target word from console
- [ ] Type the correct word
- [ ] Press Enter
- [ ] All tiles should turn green
- [ ] Should hear victory sound (ascending fanfare)
- [ ] Modal should appear with "CONGRATULATIONS!"
- [ ] Modal should show appropriate message based on guess count
- [ ] Statistics should update

**Test 3.9: Loss Condition**
- [ ] Start new game
- [ ] Make 6 incorrect guesses
- [ ] After 6th guess, modal should appear
- [ ] Modal should show "GAME OVER!"
- [ ] Modal should display the target word
- [ ] Should hear defeat sound (descending tones)

**Test 3.10: Statistics**
- [ ] Win a game
- [ ] Check modal statistics:
  - Games Played should increment
  - Win Rate should update
  - Current Streak should increment
  - Guess Distribution should show correct bar
- [ ] Lose a game
- [ ] Check that Current Streak resets to 0

**Test 3.11: Share Results**
- [ ] Complete a game (win or lose)
- [ ] Click "Share" button in modal
- [ ] Should copy emoji grid to clipboard
- [ ] Button should flash green and show "Copied to clipboard!"
- [ ] Paste result (Ctrl+V) to verify format:
```
Retro Wordle X/6

🟩🟨⬛⬛⬛
🟩🟩🟩⬛⬛
🟩🟩🟩🟩🟩
```

**Test 3.12: Play Again**
- [ ] Complete a game
- [ ] Click "Play Again" button
- [ ] Should check if same word (today)
- [ ] If same day, should show alert
- [ ] If different day, should reset board and start new game

**Test 3.13: State Persistence**
- [ ] Start a game
- [ ] Type 2-3 guesses
- [ ] Refresh the page (F5)
- [ ] Game should restore:
  - All previous guesses with colors
  - Current row position
  - Input cursor ready
- [ ] Can continue playing from where you left off

**Test 3.14: ESC Shortcut**
- [ ] During game, press ESC
- [ ] Should show confirmation dialog
- [ ] If confirmed, should navigate to `admin.html`
- [ ] Game should be saved

**Expected Console Messages:**
```
Initializing Retro Wordle 1985...
🎮 DEBUG MODE - Today's word: CRANE
Press ESC to access admin panel
Game saved successfully
```

---

### ✅ ADMIN PANEL TESTS

**Test 4.1: Authentication**
- [ ] Navigate to `admin.html` (or press ESC from game)
- [ ] Password prompt should appear
- [ ] Enter wrong password
- [ ] Should show "Invalid password!" alert
- [ ] Should redirect to `index.html`

**Test 4.2: Correct Authentication**
- [ ] Navigate to `admin.html`
- [ ] Enter password: `wordle1985`
- [ ] Should grant access to admin panel
- [ ] Session storage should remember (no re-prompt on refresh)

**Test 4.3: Load Default Words**
- [ ] Clear all data first (Clear button)
- [ ] Click "Load Default Words" button (if exists)
- [ ] Should populate textarea with 50 words
- [ ] Should set start date to today
- [ ] Word count should show 50
- [ ] Should show info message

**Test 4.4: Word Count (Real-time)**
- [ ] Type in textarea: `CRANE`
- [ ] Word count should show: 1
- [ ] Press Enter, type: `SLATE`
- [ ] Word count should show: 2
- [ ] Delete a line
- [ ] Word count should decrease

**Test 4.5: Current Word Display**
- [ ] Add words and set start date
- [ ] Current word display should show:
  - Today's word
  - Index: "X of Y"
  - Days since start

**Test 4.6: Word Validation (Save)**

**Test 4.6a: Valid Words**
- [ ] Enter valid 5-letter words (one per line):
```
CRANE
SLATE
AUDIO
```
- [ ] Set start date
- [ ] Click "Save"
- [ ] Should show success message
- [ ] Should flash save button green
- [ ] Console should log success

**Test 4.6b: Invalid - Wrong Length**
- [ ] Enter:
```
CAT
CRANE
ELEPHANT
```
- [ ] Click "Save"
- [ ] Should show error alert listing invalid words
- [ ] Textarea should have red border
- [ ] Should NOT save

**Test 4.6c: Invalid - Non-Letters**
- [ ] Enter:
```
CRAN3
AB@DE
```
- [ ] Click "Save"
- [ ] Should show error for non-letter characters

**Test 4.6d: Invalid - Duplicates**
- [ ] Enter:
```
CRANE
SLATE
CRANE
```
- [ ] Click "Save"
- [ ] Should show duplicate error

**Test 4.7: Export Data**
- [ ] Save some words
- [ ] Click "Export" button
- [ ] Should download JSON file named: `wordle-data-YYYY-MM-DD.json`
- [ ] Open file, verify JSON structure:
```json
{
  "words": ["CRANE", "SLATE", ...],
  "startDate": "2026-02-11",
  "lastModified": "2026-02-11T..."
}
```

**Test 4.8: Import Data**
- [ ] Create or use exported JSON file
- [ ] Click "Import" button
- [ ] Select the JSON file
- [ ] Should populate form with imported data
- [ ] Should show info message
- [ ] Click "Save" to apply

**Test 4.9: Clear Data**
- [ ] Click "Clear" button
- [ ] Should show first confirmation dialog
- [ ] Click OK
- [ ] Should show second confirmation
- [ ] Click OK
- [ ] Should clear:
  - Word list
  - All localStorage (wordleData, currentGame, wordleStats)
- [ ] Should show success message
- [ ] Start date should reset to today

**Test 4.10: Keyboard Shortcuts**

**Test 4.10a: Ctrl+S (Save)**
- [ ] Add some words
- [ ] Press Ctrl+S (Cmd+S on Mac)
- [ ] Should save data (same as clicking Save button)

**Test 4.10b: Ctrl+L (Load)**
- [ ] Press Ctrl+L (Cmd+L on Mac)
- [ ] Should reload data from localStorage

**Test 4.10c: ESC (Back)**
- [ ] Press ESC
- [ ] Should show confirmation
- [ ] If confirmed, should navigate to `game.html`

**Test 4.11: Back Button**
- [ ] Click "Back to Game" button
- [ ] Should navigate to `game.html`

**Expected Console Messages:**
```
Initializing admin panel...
Admin data loaded successfully
Event listeners set up successfully
Data saved successfully: {...}
Admin panel initialized successfully
```

---

### ✅ CROSS-SCREEN TESTS

**Test 5.1: Data Persistence**
- [ ] In admin panel, add words and save
- [ ] Navigate to game
- [ ] Verify game uses the word list
- [ ] Console should show correct word
- [ ] Make a guess
- [ ] Navigate to admin panel
- [ ] Navigate back to game
- [ ] Game state should be preserved

**Test 5.2: Admin Changes Affect Game**
- [ ] In admin panel, save word list with "CRANE" as first word
- [ ] Set start date to today
- [ ] Navigate to game
- [ ] Console should show: "Today's word: CRANE"
- [ ] Clear game in localStorage: `localStorage.removeItem('currentGame')`
- [ ] Refresh
- [ ] Correct word should still be loaded

**Test 5.3: Daily Word Rotation**

**Option 1: Change System Date**
- [ ] In admin panel, set start date to today
- [ ] Save 3 words: CRANE, SLATE, AUDIO
- [ ] Note current date
- [ ] Change system date to tomorrow
- [ ] Navigate to game
- [ ] Word should be SLATE (index 1)
- [ ] Change date to day after
- [ ] Word should be AUDIO (index 2)
- [ ] Change date to 3 days later
- [ ] Should cycle back to CRANE (index 0)

**Option 2: Manually Test Date Math**
- [ ] In Console, run:
```javascript
// Verify date calculation
const startDate = new Date('2026-02-11');
const today = new Date('2026-02-13');
const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
console.log('Days:', days); // Should be 2
console.log('Word index:', days % 3); // Should be 2 (if 3 words)
```

**Test 5.4: localStorage Error Handling**
- [ ] Open Console
- [ ] Simulate localStorage failure:
```javascript
// Backup
const oldLS = window.localStorage;
// Disable
delete window.localStorage;
// Refresh page
// Game should still load with default word "CRANE"
// Restore
window.localStorage = oldLS;
```

**Test 5.5: Corrupted Data Handling**
- [ ] Set invalid data:
```javascript
localStorage.setItem('wordleData', 'invalid json{');
localStorage.setItem('currentGame', 'corrupted');
```
- [ ] Refresh game page
- [ ] Should fallback to default word
- [ ] Should clear corrupted data
- [ ] Console should show error messages but no crashes

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Uncaught ReferenceError"
- **Check:** All functions are defined before use
- **Solution:** Verify file load order in HTML

### Issue: Tiles not flipping
- **Check:** CSS flip animation exists
- **Solution:** Verify 'flip' class in styles.css

### Issue: Wrong colors
- **Check:** evaluateGuess() algorithm
- **Solution:** Review two-pass marking logic

### Issue: localStorage not working
- **Check:** Browser privacy settings
- **Solution:** Not in incognito mode, localStorage enabled

### Issue: Audio not playing
- **Check:** Browser audio policy
- **Solution:** User interaction required before audio (already handled)

---

## ✅ FINAL VERIFICATION CHECKLIST

Before deploying, verify ALL of these:

### Code Quality
- [ ] No console errors on any page
- [ ] All JavaScript files load correctly
- [ ] No undefined functions
- [ ] Proper error handling everywhere

### Functionality
- [ ] All navigation works
- [ ] All keyboard shortcuts work
- [ ] All buttons have proper handlers
- [ ] localStorage works correctly
- [ ] Data persists across sessions

### User Experience
- [ ] Animations are smooth
- [ ] Sound effects work (optional)
- [ ] Error messages are clear
- [ ] Confirmation dialogs prevent accidents
- [ ] Visual feedback on all actions

### Edge Cases
- [ ] Handles missing data gracefully
- [ ] Handles corrupted data
- [ ] Handles duplicate letters correctly
- [ ] Prevents playing same word twice
- [ ] Works with empty word list

---

## 🚀 READY FOR DEPLOYMENT

If all tests pass, your game is ready to deploy!

### Quick Deployment Options:

**Option 1: Python HTTP Server**
```bash
cd /home/avani/wordle
python3 -m http.server 8000
# Visit: http://localhost:8000
```

**Option 2: GitHub Pages**
- Push to GitHub repository
- Enable Pages in Settings
- Access at: `https://username.github.io/repo-name`

**Option 3: Netlify Drop**
- Drag folder to https://app.netlify.com/drop
- Get instant live URL

---

## 📊 TEST RESULTS SUMMARY

Fill this out after testing:

```
Title Screen:     [ PASS / FAIL ]
Character Screen: [ PASS / FAIL ]
Game Logic:       [ PASS / FAIL ]
Admin Panel:      [ PASS / FAIL ]
Cross-Screen:     [ PASS / FAIL ]

Overall Status:   [ READY / NEEDS FIXES ]
```

---

## 🎉 SUCCESS CRITERIA

Your game is complete and working if:
✅ All screens load without errors
✅ Navigation between screens works
✅ Game logic follows official Wordle rules
✅ Statistics track correctly
✅ Data persists across sessions
✅ Admin panel manages words correctly
✅ All keyboard shortcuts work

**Congratulations! Your Retro Wordle 1985 is complete!** 🎮✨

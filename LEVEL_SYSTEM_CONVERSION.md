# RETRO WORDLE 1985 - LEVEL-BASED SESSION CONVERSION GUIDE

## Overview
Convert the single-word Wordle game into a **session-based, multi-level system** where:
- **5 Sessions** (user enters session ID to access)
- **3 Levels per session** (3 different Wordle puzzles)
- **Progressive unlock** (must complete Level 1 to unlock Level 2, etc.)
- **Session progress tracking** (which levels completed)

---

## NEW SYSTEM ARCHITECTURE

### Data Structure
```javascript
// localStorage 'sessionData'
{
  "session-1": {
    "sessionId": "session-1",
    "sessionName": "Beginner Challenge",
    "levels": [
      {
        "levelNumber": 1,
        "word": "CRANE",
        "completed": false,
        "attempts": 0,
        "bestScore": null
      },
      {
        "levelNumber": 2,
        "word": "SLATE",
        "completed": false,
        "attempts": 0,
        "bestScore": null
      },
      {
        "levelNumber": 3,
        "word": "AUDIO",
        "completed": false,
        "attempts": 0,
        "bestScore": null
      }
    ]
  },
  "session-2": { ... },
  "session-3": { ... },
  "session-4": { ... },
  "session-5": { ... }
}

// localStorage 'currentSession'
{
  "sessionId": "session-1",
  "currentLevel": 1,
  "levelProgress": {
    "guesses": [],
    "currentRow": 0,
    "gameStatus": "playing"
  }
}
```

---

## FILE MODIFICATIONS NEEDED

### NEW FILES TO CREATE:
1. `session-select.html` - Session ID entry screen
2. `session-select.js` - Session selection logic
3. `level-select.html` - Level selection screen for a session
4. `level-select.js` - Level selection logic

### FILES TO MODIFY:
1. `admin.html` - Update to manage sessions and levels
2. `admin.js` - Update for session/level management
3. `game.html` - Add level indicator and progress
4. `game.js` - Update for level-based gameplay
5. `index.html` - Update navigation flow

---

## IMPLEMENTATION PROMPTS FOR CLAUDE SONNET 4.5

---

## 🎯 PROMPT 1: Create Session Selection Screen

### File: `session-select.html`

**Copilot Prompt:**
```
Create a retro 1985-style session selection screen for the Wordle game.

REQUIREMENTS:
1. Page structure:
   - Title: "ENTER SESSION CODE"
   - Input box for session ID (e.g., "session-1")
   - Submit button
   - List of available sessions (shown after any session is loaded once)
   - Error message area

2. Use existing styles.css classes for consistency:
   - .game-screen as body class
   - Retro input styling
   - CRT effects and scanlines

3. HTML Structure:
   ```html
   <div class="session-container">
     <h1 class="session-title">ENTER SESSION CODE</h1>
     
     <div class="session-input-area">
       <input type="text" id="sessionInput" placeholder="session-1" />
       <button id="submitSession">START SESSION</button>
     </div>
     
     <div class="error-message" id="errorMsg"></div>
     
     <div class="available-sessions">
       <h2>AVAILABLE SESSIONS</h2>
       <div id="sessionList"></div>
     </div>
     
     <div class="admin-link">
       <a href="admin.html">ADMIN PANEL</a>
     </div>
   </div>
   ```

4. Style requirements:
   - Center everything vertically and horizontally
   - Large retro input box with border
   - Green button with hover effect
   - List sessions as clickable boxes
   - Match the retro aesthetic completely

Create the complete session-select.html file with inline styling if needed for session-specific components.
```

---

## 🎯 PROMPT 2: Session Selection Logic

### File: `session-select.js`

**Copilot Prompt:**
```
Implement the session selection logic for the retro Wordle game.

REQUIREMENTS:

1. On page load:
   - Load all sessions from localStorage 'sessionData'
   - Display available sessions in #sessionList
   - Set focus on session input

2. Session input handling:
   - When user types or clicks submit
   - Validate session ID format (e.g., "session-1" to "session-5")
   - Check if session exists in localStorage
   - If valid: save to localStorage 'currentSession' and navigate to level-select.html
   - If invalid: show error "SESSION NOT FOUND! Enter session-1 to session-5"

3. Display available sessions:
   - Show each session as a clickable card
   - Display: Session ID, Session Name, Completion status (X/3 levels)
   - Click on session card → auto-fill input and submit

4. Functions to implement:
   ```javascript
   function loadSessions() {
     // Load from localStorage 'sessionData'
     // Return object with all sessions
   }
   
   function displaySessionList(sessions) {
     // Create clickable cards for each session
     // Show completion status
   }
   
   function validateSessionId(sessionId) {
     // Check format and existence
     // Return true/false
   }
   
   function selectSession(sessionId) {
     // Save to localStorage 'currentSession'
     // Navigate to level-select.html
   }
   
   function showError(message) {
     // Display error in #errorMsg
     // Auto-hide after 3 seconds
   }
   ```

5. Event listeners:
   - Submit button click
   - Enter key in input
   - Session card clicks

6. Error handling:
   - No sessions configured → show message to visit admin
   - Invalid session ID → show error
   - localStorage not available → fallback message

Create the complete session-select.js implementation.
```

---

## 🎯 PROMPT 3: Create Level Selection Screen

### File: `level-select.html`

**Copilot Prompt:**
```
Create a level selection screen for the retro Wordle session system.

REQUIREMENTS:

1. Page structure:
   - Display current session name/ID
   - Show 3 level cards (Level 1, Level 2, Level 3)
   - Each card shows:
     * Level number
     * Lock icon if not unlocked
     * Checkmark if completed
     * Best score (number of guesses) if completed
   - Back to session select button

2. Visual design:
   - Use 3 large boxes in a row (or column on mobile)
   - Level 1: Always unlocked, green border
   - Level 2: Locked until Level 1 complete, gray border
   - Level 3: Locked until Level 2 complete, gray border
   - Completed levels: Show green checkmark
   - Current playable level: Pulsing animation

3. HTML structure:
   ```html
   <div class="level-select-container">
     <h1 class="session-name" id="sessionName">SESSION 1</h1>
     <p class="session-subtitle">SELECT LEVEL</p>
     
     <div class="levels-grid">
       <div class="level-card" data-level="1">
         <div class="level-number">LEVEL 1</div>
         <div class="level-status"></div>
         <div class="level-score"></div>
       </div>
       
       <div class="level-card" data-level="2">
         <div class="level-number">LEVEL 2</div>
         <div class="level-status">🔒 LOCKED</div>
         <div class="level-score"></div>
       </div>
       
       <div class="level-card" data-level="3">
         <div class="level-number">LEVEL 3</div>
         <div class="level-status">🔒 LOCKED</div>
         <div class="level-score"></div>
       </div>
     </div>
     
     <div class="progress-display">
       <span id="progressText">0/3 LEVELS COMPLETED</span>
     </div>
     
     <button class="back-button" id="backBtn">BACK TO SESSION SELECT</button>
   </div>
   ```

4. Styling:
   - Center the grid
   - Each card 200px x 250px
   - Locked levels: gray, not clickable
   - Unlocked levels: green border, clickable
   - Completed levels: show ✓ and score
   - Add hover effect on clickable cards

Create the complete level-select.html with retro styling.
```

---

## 🎯 PROMPT 4: Level Selection Logic

### File: `level-select.js`

**Copilot Prompt:**
```
Implement the level selection logic for the session-based Wordle game.

REQUIREMENTS:

1. On page load:
   - Load current session from localStorage 'currentSession'
   - Load session data from localStorage 'sessionData'
   - Display session name
   - Render all 3 levels with correct status:
     * Level 1: Always unlocked
     * Level 2: Unlocked if Level 1 completed
     * Level 3: Unlocked if Level 2 completed
   - Show completion count

2. Level card rendering:
   ```javascript
   function renderLevelCards(sessionData) {
     // For each of 3 levels:
     // - Check if unlocked (previous level completed or level 1)
     // - Check if completed
     // - Show lock icon, checkmark, or play button
     // - Display best score if completed
     // - Add click handler if unlocked
   }
   ```

3. Level selection:
   - Click on unlocked level → save level to currentSession → navigate to game.html
   - Click on locked level → show "Complete previous level first!" message
   - Show pulsing animation on next available level

4. Progress tracking:
   ```javascript
   function calculateProgress(sessionData) {
     // Count completed levels (0-3)
     // Return "X/3 LEVELS COMPLETED"
   }
   
   function isLevelUnlocked(levelNumber, sessionData) {
     // Level 1: always true
     // Level 2: return sessionData.levels[0].completed
     // Level 3: return sessionData.levels[1].completed
   }
   ```

5. Navigation:
   - Back button → session-select.html
   - Level click (if unlocked) → game.html with level info

6. Functions to implement:
   ```javascript
   function loadCurrentSession() {
     // Load from localStorage 'currentSession'
     // Get session ID
   }
   
   function loadSessionData(sessionId) {
     // Load specific session from localStorage 'sessionData'
   }
   
   function renderLevelCards(sessionData) {
     // Render all 3 levels with status
   }
   
   function selectLevel(levelNumber) {
     // Update 'currentSession' with selected level
     // Navigate to game.html
   }
   
   function showMessage(message) {
     // Show temporary message overlay
   }
   ```

Create the complete level-select.js implementation.
```

---

## 🎯 PROMPT 5: Update Game Screen for Levels

### File: Modify `game.html`

**Copilot Prompt:**
```
Update the game.html to support level-based gameplay.

CHANGES NEEDED:

1. Add level indicator in header:
   ```html
   <div class="game-header">
     <div class="session-info">
       <span class="session-id" id="sessionId">SESSION 1</span>
       <span class="level-indicator" id="levelIndicator">LEVEL 1</span>
     </div>
     <h1 class="game-title">WORDLE</h1>
   </div>
   ```

2. Update modal to show level completion:
   - Win: "LEVEL X COMPLETE!"
   - Loss: "LEVEL X FAILED"
   - Add "NEXT LEVEL" button (if not level 3)
   - Add "BACK TO LEVELS" button

3. Add progress indicator:
   ```html
   <div class="level-progress">
     <div class="progress-dot completed" data-level="1"></div>
     <div class="progress-dot current" data-level="2"></div>
     <div class="progress-dot locked" data-level="3"></div>
   </div>
   ```

4. Update modal buttons:
   ```html
   <div class="modal-content">
     <h2 class="modal-title"></h2>
     <p class="modal-text"></p>
     
     <div class="modal-stats">...</div>
     
     <div class="modal-buttons">
       <button class="modal-button" id="nextLevelBtn">NEXT LEVEL</button>
       <button class="modal-button" id="retryLevelBtn">RETRY LEVEL</button>
       <button class="modal-button" id="backToLevelsBtn">LEVEL SELECT</button>
     </div>
   </div>
   ```

Provide the updated game.html with these additions.
```

---

## 🎯 PROMPT 6: Update Game Logic for Levels

### File: Modify `game.js`

**Copilot Prompt:**
```
Update game.js to support level-based progression system.

MAJOR CHANGES NEEDED:

1. Update initGame():
   ```javascript
   function initGame() {
     // Load currentSession from localStorage
     // Get sessionId and currentLevel
     // Load session data
     // Get target word for current level: sessionData.levels[currentLevel-1].word
     // Display session info and level indicator
     // Load saved level progress if exists
     // Render level progress dots
   }
   ```

2. Update game completion logic:
   ```javascript
   function handleGameWin() {
     // Mark current level as completed in sessionData
     // Save best score (number of guesses)
     // Update localStorage 'sessionData'
     // Show level complete modal
     // Check if more levels available
     // Show "NEXT LEVEL" or "SESSION COMPLETE" button
   }
   
   function handleGameLoss() {
     // Show level failed modal
     // Increment attempts for this level
     // Show "RETRY LEVEL" and "BACK TO LEVELS" buttons
   }
   ```

3. Update modal handling:
   ```javascript
   function showModal(won) {
     // Get current session and level info
     // Title: "LEVEL X COMPLETE!" or "LEVEL X FAILED"
     // Show word if lost
     // Show score (guesses used) if won
     
     // Button logic:
     // - Next Level: if won and level < 3
     // - Retry Level: always available
     // - Back to Levels: always available
   }
   
   function nextLevel() {
     // Increment currentLevel in localStorage
     // Check if level unlocked
     // If yes: reload page with new level
     // If no (session complete): go to level-select
   }
   
   function retryLevel() {
     // Reset game state
     // Keep same level
     // Reload game
   }
   
   function backToLevels() {
     // Navigate to level-select.html
   }
   ```

4. Update state persistence:
   ```javascript
   function saveGameState() {
     // Save to localStorage 'currentSession' with:
     // - sessionId
     // - currentLevel
     // - levelProgress (guesses, currentRow, gameStatus)
   }
   
   function loadGameState() {
     // Load saved progress for current level
     // If day changed or session changed, clear old state
   }
   ```

5. Update display functions:
   ```javascript
   function updateLevelDisplay() {
     // Update #sessionId text
     // Update #levelIndicator text
     // Update progress dots (completed, current, locked)
   }
   
   function renderProgressDots() {
     // Show 3 dots for 3 levels
     // Completed: green checkmark
     // Current: pulsing
     // Locked: gray
   }
   ```

6. Add session completion detection:
   ```javascript
   function checkSessionComplete(sessionData) {
     // Check if all 3 levels completed
     // Return true/false
   }
   
   function showSessionCompleteModal() {
     // Special modal for completing entire session
     // Confetti animation (optional)
     // "SESSION COMPLETE! 3/3 LEVELS"
     // Button to return to session select
   }
   ```

7. Update statistics:
   - Track per-level instead of overall
   - Store in sessionData for each level
   - Show level-specific stats in modal

CRITICAL: Ensure level progression is saved correctly and levels unlock properly.

Provide the complete updated game.js with all level-based functionality.
```

---

## 🎯 PROMPT 7: Update Admin Panel for Sessions

### File: Modify `admin.html`

**Copilot Prompt:**
```
Update admin.html to manage sessions and levels instead of daily words.

NEW STRUCTURE:

1. Replace word list section with session management:
   ```html
   <div class="admin-section">
     <h2 class="section-title">SESSION MANAGEMENT</h2>
     
     <!-- Session Selector -->
     <div class="session-selector">
       <label>SELECT SESSION:</label>
       <select id="sessionSelect">
         <option value="session-1">Session 1</option>
         <option value="session-2">Session 2</option>
         <option value="session-3">Session 3</option>
         <option value="session-4">Session 4</option>
         <option value="session-5">Session 5</option>
       </select>
     </div>
     
     <!-- Session Name -->
     <div class="setting-row">
       <label>SESSION NAME:</label>
       <input type="text" id="sessionName" placeholder="Beginner Challenge" />
     </div>
     
     <!-- Level Words -->
     <div class="levels-config">
       <h3>LEVEL WORDS (5 LETTERS EACH)</h3>
       
       <div class="level-input">
         <label>LEVEL 1:</label>
         <input type="text" id="level1Word" maxlength="5" placeholder="CRANE" />
       </div>
       
       <div class="level-input">
         <label>LEVEL 2:</label>
         <input type="text" id="level2Word" maxlength="5" placeholder="SLATE" />
       </div>
       
       <div class="level-input">
         <label>LEVEL 3:</label>
         <input type="text" id="level3Word" maxlength="5" placeholder="AUDIO" />
       </div>
     </div>
   </div>
   ```

2. Add session overview section:
   ```html
   <div class="admin-section">
     <h2 class="section-title">SESSION OVERVIEW</h2>
     <div id="sessionOverview" class="session-overview-grid">
       <!-- Will be populated by JS -->
     </div>
   </div>
   ```

3. Update buttons:
   - Save Session
   - Load Session
   - Create All Default Sessions
   - Clear All Sessions
   - Reset Session Progress
   - Back to Game

4. Remove daily rotation settings (no longer needed)

Provide the complete updated admin.html.
```

---

## 🎯 PROMPT 8: Update Admin Logic for Sessions

### File: Modify `admin.js`

**Copilot Prompt:**
```
Update admin.js to manage session-based system instead of daily words.

REQUIREMENTS:

1. Initialize default sessions:
   ```javascript
   function createDefaultSessions() {
     const defaultSessions = {
       "session-1": {
         "sessionId": "session-1",
         "sessionName": "Beginner Challenge",
         "levels": [
           { levelNumber: 1, word: "CRANE", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 2, word: "SLATE", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 3, word: "AUDIO", completed: false, attempts: 0, bestScore: null }
         ]
       },
       "session-2": {
         "sessionId": "session-2",
         "sessionName": "Intermediate Quest",
         "levels": [
           { levelNumber: 1, word: "THINK", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 2, word: "WORLD", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 3, word: "PLANT", completed: false, attempts: 0, bestScore: null }
         ]
       },
       "session-3": {
         "sessionId": "session-3",
         "sessionName": "Advanced Trial",
         "levels": [
           { levelNumber: 1, word: "BRAVE", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 2, word: "QUICK", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 3, word: "FROST", completed: false, attempts: 0, bestScore: null }
         ]
       },
       "session-4": {
         "sessionId": "session-4",
         "sessionName": "Expert Challenge",
         "levels": [
           { levelNumber: 1, word: "GRACE", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 2, word: "PRIDE", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 3, word: "TRIBE", completed: false, attempts: 0, bestScore: null }
         ]
       },
       "session-5": {
         "sessionId": "session-5",
         "sessionName": "Master Tournament",
         "levels": [
           { levelNumber: 1, word: "STORM", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 2, word: "CLAIM", completed: false, attempts: 0, bestScore: null },
           { levelNumber: 3, word: "BEAST", completed: false, attempts: 0, bestScore: null }
         ]
       }
     };
     
     localStorage.setItem('sessionData', JSON.stringify(defaultSessions));
     return defaultSessions;
   }
   ```

2. Session loading and saving:
   ```javascript
   function loadSession(sessionId) {
     // Load from localStorage 'sessionData'
     // Populate form with session name and 3 level words
     // Show in UI
   }
   
   function saveSession() {
     // Validate all 3 words (5 letters, A-Z only)
     // Update sessionData in localStorage
     // Show success/error message
   }
   ```

3. Session overview display:
   ```javascript
   function displaySessionOverview() {
     // Show all 5 sessions in a grid
     // For each session show:
     // - Session ID
     // - Session Name
     // - Completion: X/3 levels
     // - Edit button
   }
   ```

4. Validation:
   ```javascript
   function validateSessionData(sessionName, level1, level2, level3) {
     // Check all 3 words are 5 letters
     // Check all are A-Z only
     // Check no duplicates within session
     // Return { valid: boolean, errors: array }
   }
   ```

5. Reset progress:
   ```javascript
   function resetSessionProgress(sessionId) {
     // Reset all completion flags to false
     // Reset attempts to 0
     // Reset best scores to null
     // Confirm with user first
   }
   
   function resetAllProgress() {
     // Reset all sessions
     // Confirm with user
   }
   ```

6. Event handlers:
   - Session select dropdown change → load that session
   - Save button → validate and save current session
   - Create defaults button → create all 5 default sessions
   - Reset progress button → reset selected session
   - Clear all → clear everything

7. UI updates:
   ```javascript
   function updateSessionSelector() {
     // Populate dropdown with available sessions
   }
   
   function showStatus(message, type) {
     // Show save/error messages
   }
   ```

Provide the complete updated admin.js implementation.
```

---

## 🎯 PROMPT 9: Update Navigation Flow

### File: Modify `index.html`

**Copilot Prompt:**
```
Update the title screen to navigate to session selection instead of character screen.

CHANGE NEEDED:

In title.js, update the navigation:
- Click anywhere → navigate to 'session-select.html' (not character.html)
- Keep character screen accessible but make it optional

OR create a flow:
- Title screen → Character screen → Session select

Your choice. Update index.html and title.js accordingly.

Also update character.js to navigate to session-select.html instead of game.html.
```

---

## 🎯 PROMPT 10: Add Level Transitions & Polish

**Copilot Prompt:**
```
Add smooth transitions and polish for the level-based system.

FEATURES TO ADD:

1. Level unlock animation:
   - When completing a level, show next level card "unlocking"
   - Fade in with a shine effect
   - Sound effect (retro beep)

2. Level transition screen:
   - Between levels, show "LEVEL X COMPLETE!"
   - Display score
   - "LOADING LEVEL Y..."
   - 2 second delay with animation

3. Session complete celebration:
   - Special screen when all 3 levels done
   - Animated "SESSION COMPLETE!" banner
   - Show total time or total guesses
   - Confetti effect (retro style - falling squares)

4. Progress saving indicators:
   - Show "SAVING..." when progress updates
   - Auto-save after each guess

5. Level preview on selection:
   - Hover over level card shows previous attempts
   - Click shows "Are you sure?" if retrying

6. Keyboard shortcuts:
   - ESC: Back to level select (from game)
   - N: Next level (after win)
   - R: Retry (after loss)

Implement these features with retro aesthetics matching the existing game.
```

---

## TESTING CHECKLIST

### Session Selection:
- [ ] Can enter session ID and navigate
- [ ] Invalid session shows error
- [ ] Available sessions display correctly
- [ ] Click on session card auto-fills and submits

### Level Selection:
- [ ] All 3 levels display
- [ ] Level 1 always unlocked
- [ ] Levels 2-3 locked until previous complete
- [ ] Completed levels show checkmark and score
- [ ] Click on locked level shows message
- [ ] Progress count shows correctly (X/3)

### Game Play:
- [ ] Session and level indicators display
- [ ] Correct word loads for each level
- [ ] Game plays normally
- [ ] Progress dots show correct status
- [ ] Win: level marked complete in localStorage
- [ ] Win: Next Level button appears (if level < 3)
- [ ] Win: score saved correctly
- [ ] Loss: Retry button works
- [ ] Back to Levels button works

### Level Progression:
- [ ] Complete Level 1 → Level 2 unlocks
- [ ] Complete Level 2 → Level 3 unlocks
- [ ] Complete Level 3 → Session complete message
- [ ] Can replay completed levels
- [ ] Progress persists on refresh

### Admin Panel:
- [ ] Can select session from dropdown
- [ ] Session data loads into form
- [ ] Can edit session name
- [ ] Can edit all 3 level words
- [ ] Validation works (5 letters, A-Z)
- [ ] Save updates localStorage
- [ ] Default sessions create correctly
- [ ] Reset progress works
- [ ] Session overview displays all sessions

### Navigation:
- [ ] Title → Session Select flows correctly
- [ ] Session Select → Level Select flows correctly
- [ ] Level Select → Game flows correctly
- [ ] Game → Level Select back button works
- [ ] Level Select → Session Select back button works

---

## DEPLOYMENT NOTES

After implementing all changes:

1. **Test extensively** - the level system is complex
2. **Clear localStorage** before testing fresh
3. **Create default sessions** via admin panel
4. **Test all 5 sessions**
5. **Test level unlocking progression**
6. **Deploy same as before** (GitHub Pages/Netlify)

---

## ESTIMATED TIME: 3-4 HOURS

- Session/Level selection screens: 45 min
- Game logic updates: 60 min
- Admin panel updates: 45 min  
- Transitions and polish: 30 min
- Testing: 60 min

---

## BONUS: SESSION THEMES (OPTIONAL)

Add different color schemes per session:
- Session 1: Green theme (beginner)
- Session 2: Yellow theme
- Session 3: Orange theme  
- Session 4: Red theme (hard)
- Session 5: Purple theme (master)

Apply theme colors to tiles, borders, and backgrounds.

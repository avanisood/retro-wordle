// Game Logic JavaScript
// This file contains the core Wordle game logic for retro 1985-style gameplay
//
// ==================== FEATURES ====================
// ✅ Complete Wordle gameplay with official algorithm
// ✅ Session-based multi-level progression system
// ✅ Progressive level unlocking (complete L1 to unlock L2, etc.)
// ✅ Automatic game state persistence per level
// ✅ Statistics tracking per level (attempts, best scores)
// ✅ Tile flip animations with sequential reveal
// ✅ Retro sound effects for all interactions
// ✅ Level completion and session progress tracking
// ✅ Error handling and validation
// ✅ Resume interrupted games
// ✅ Keyboard shortcuts (ESC = back to levels)
// ✅ localStorage with fallback handling
//
// ==================== DATA STRUCTURE ====================
// localStorage keys:
//   - 'sessionData': { session-1: { sessionId, sessionName, levels: [...] }, ... }
//   - 'currentSession': { sessionId, currentLevel, levelProgress: {...} }
//   - 'wordleStats': { gamesPlayed, gamesWon, currentStreak, maxStreak, guessDistribution }
//
// ==================== KEYBOARD CONTROLS ====================
// A-Z: Type letters
// Enter: Submit guess
// Backspace: Delete last letter
// ESC: Back to level select
// ==================================================

// Global game state - tracks all game data
let gameState = {
    sessionId: '',            // Current session (e.g., "session-1")
    currentLevel: 1,          // Current level (1-3)
    targetWord: '',           // The 5-letter word to guess
    guesses: [],              // Array of submitted guesses
    currentRow: 0,            // Current row (0-5)
    currentGuess: '',         // Current input string
    gameStatus: 'playing',    // 'playing', 'won', 'lost'
    isAnimating: false        // Prevents input during animations
};

// Load current session and level data
function loadCurrentSession() {
    try {
        if (typeof localStorage === 'undefined') {
            console.error('localStorage not available');
            return null;
        }
        
        const currentSession = localStorage.getItem('currentSession');
        
        if (!currentSession) {
            console.error('No current session found - redirecting to session select');
            window.location.href = 'session-select.html';
            return null;
        }
        
        const session = JSON.parse(currentSession);
        
        if (!session.sessionId || !session.currentLevel) {
            console.error('Invalid session data');
            window.location.href = 'session-select.html';
            return null;
        }
        
        return session;
    } catch (e) {
        console.error('Error loading current session:', e);
        window.location.href = 'session-select.html';
        return null;
    }
}

// Load session data from sessionData storage
function loadSessionData(sessionId) {
    try {
        if (typeof localStorage === 'undefined') {
            console.error('localStorage not available');
            return null;
        }
        
        const sessionData = localStorage.getItem('sessionData');
        
        if (!sessionData) {
            console.error('No session data found');
            return null;
        }
        
        const allSessions = JSON.parse(sessionData);
        
        if (!allSessions[sessionId]) {
            console.error('Session not found:', sessionId);
            return null;
        }
        
        return allSessions[sessionId];
    } catch (e) {
        console.error('Error loading session data:', e);
        return null;
    }
}

// Get target word for current level
function getLevelWord(sessionId, levelNumber) {
    const sessionData = loadSessionData(sessionId);
    
    if (!sessionData || !sessionData.levels) {
        console.error('Invalid session data');
        return 'CRANE'; // Fallback
    }
    
    const level = sessionData.levels.find(l => l.levelNumber === levelNumber);
    
    if (!level || !level.word) {
        console.error('Level not found or no word set');
        return 'CRANE'; // Fallback
    }
    
    return level.word.toUpperCase();
}

// Load saved game state from localStorage
function loadSavedGame() {
    try {
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage not available - starting fresh game');
            return null;
        }
        
        const currentSession = loadCurrentSession();
        
        if (!currentSession || !currentSession.levelProgress) {
            return null;
        }
        
        const saved = currentSession.levelProgress;
        
        // Validate saved game structure
        if (!Array.isArray(saved.guesses) || 
            typeof saved.currentRow !== 'number' || !saved.gameStatus) {
            console.error('Corrupted saved game data - starting fresh');
            return null;
        }
        
        console.log('Valid saved game found for level', currentSession.currentLevel);
        return {
            sessionId: currentSession.sessionId,
            currentLevel: currentSession.currentLevel,
            ...saved
        };
        
    } catch (e) {
        console.error('Error loading saved game:', e);
        return null;
    }
}

// ==================== POLISH FEATURES ====================

// Show saving indicator
function showSavingIndicator() {
    const indicator = document.getElementById('savingIndicator');
    if (!indicator) return;
    
    indicator.classList.add('show');
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 1000);
}

// Show level transition screen
function showLevelTransition(currentLevel, score, nextLevel) {
    const transition = document.getElementById('levelTransition');
    const title = document.getElementById('transitionTitle');
    const scoreText = document.getElementById('transitionScore');
    const loading = document.getElementById('transitionLoading');
    
    if (!transition) return Promise.resolve();
    
    return new Promise((resolve) => {
        // Set content
        title.textContent = `LEVEL ${currentLevel} COMPLETE!`;
        scoreText.textContent = `SCORE: ${score}/6`;
        
        if (nextLevel) {
            loading.textContent = `LOADING LEVEL ${nextLevel}...`;
            loading.style.display = 'block';
        } else {
            loading.style.display = 'none';
        }
        
        // Show transition
        transition.classList.add('show');
        
        // Hide after 2 seconds
        setTimeout(() => {
            transition.classList.remove('show');
            resolve();
        }, 2000);
    });
}

// Create confetti effect (retro style)
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    const colors = ['#00ff00', '#00ffff', '#ffff00', '#ff00ff', '#ffffff'];
    const numPieces = 50;
    
    for (let i = 0; i < numPieces; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        piece.style.animationDelay = (Math.random() * 0.5) + 's';
        container.appendChild(piece);
    }
    
    // Remove confetti after animations complete
    setTimeout(() => {
        container.remove();
    }, 5000);
}

// Play unlock sound effect
function playUnlockSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create rising unlock sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// ==================== END POLISH FEATURES ====================

// Save current game state to localStorage
function saveGame() {
    try {
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage not available - game will not be saved');
            return;
        }
        
        // Validate game state before saving
        if (!gameState.sessionId || !gameState.targetWord || !Array.isArray(gameState.guesses)) {
            console.error('Invalid game state - cannot save');
            return;
        }
        
        // Load current session
        const currentSessionStr = localStorage.getItem('currentSession');
        
        if (!currentSessionStr) {
            console.error('No current session found');
            return;
        }
        
        const currentSession = JSON.parse(currentSessionStr);
        
        // Update level progress
        currentSession.levelProgress = {
            guesses: gameState.guesses,
            currentRow: gameState.currentRow,
            currentGuess: gameState.currentGuess,
            gameStatus: gameState.gameStatus,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentSession', JSON.stringify(currentSession));
        console.log('Game saved successfully');
        
        // Show saving indicator
        showSavingIndicator();
        
    } catch (e) {
        // Handle quota exceeded errors
        if (e.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded');
        } else {
            console.error('Error saving game:', e);
        }
    }
}

// Update session data with level completion
function updateLevelCompletion(won, guessCount) {
    try {
        const sessionDataStr = localStorage.getItem('sessionData');
        if (!sessionDataStr) return;
        
        const allSessions = JSON.parse(sessionDataStr);
        const session = allSessions[gameState.sessionId];
        
        if (!session) return;
        
        const levelIndex = gameState.currentLevel - 1;
        const level = session.levels[levelIndex];
        
        if (won) {
            level.completed = true;
            
            // Update best score if better or first completion
            if (level.bestScore === null || guessCount < level.bestScore) {
                level.bestScore = guessCount;
            }
        }
        
        // Increment attempts
        level.attempts = (level.attempts || 0) + 1;
        
        // Save updated session data
        localStorage.setItem('sessionData', JSON.stringify(allSessions));
        console.log('Level completion updated:', level);
        
    } catch (e) {
        console.error('Error updating level completion:', e);
    }
}

// Check if all levels in session are complete
function checkSessionComplete() {
    try {
        const sessionData = loadSessionData(gameState.sessionId);
        if (!sessionData || !sessionData.levels) return false;
        
        return sessionData.levels.every(level => level.completed);
    } catch (e) {
        console.error('Error checking session completion:', e);
        return false;
    }
}

// Initialize game on page load
// Initialize game on page load
function initGame() {
    console.log('Initializing Retro Wordle 1985 - Level System...');
    
    // Load current session
    const currentSession = loadCurrentSession();
    
    if (!currentSession) {
        console.error('Failed to load session - redirecting');
        return;
    }
    
    gameState.sessionId = currentSession.sessionId;
    gameState.currentLevel = currentSession.currentLevel;
    
    // Get target word for current level
    gameState.targetWord = getLevelWord(gameState.sessionId, gameState.currentLevel);
    
    // Try to load saved game progress
    const savedGame = loadSavedGame();
    
    if (savedGame && savedGame.gameStatus !== 'playing') {
        // Resume completed game
        gameState.guesses = savedGame.guesses;
        gameState.currentRow = savedGame.currentRow;
        gameState.currentGuess = savedGame.currentGuess || '';
        gameState.gameStatus = savedGame.gameStatus;
        gameState.isAnimating = false;
        
        console.log('Resumed completed game');
        
        // Restore display for all guesses
        for (let i = 0; i < gameState.guesses.length; i++) {
            updateTileDisplay(i, gameState.guesses[i]);
            const colors = evaluateGuess(gameState.guesses[i], gameState.targetWord);
            applyTileColors(i, colors);
        }
        
        // Update display
        updateLevelDisplay();
        renderProgressDots();
        
        // Show modal immediately
        setTimeout(() => {
            showModal(gameState.gameStatus === 'won');
        }, 500);
        
    } else if (savedGame && savedGame.gameStatus === 'playing') {
        // Resume game in progress
        gameState.guesses = savedGame.guesses;
        gameState.currentRow = savedGame.currentRow;
        gameState.currentGuess = savedGame.currentGuess || '';
        gameState.gameStatus = 'playing';
        gameState.isAnimating = false;
        
        console.log('Resumed game in progress');
        
        // Restore display for all previous guesses
        for (let i = 0; i < gameState.guesses.length; i++) {
            updateTileDisplay(i, gameState.guesses[i]);
            const colors = evaluateGuess(gameState.guesses[i], gameState.targetWord);
            applyTileColors(i, colors);
        }
        
        // Restore current guess if any
        if (gameState.currentGuess) {
            updateTileDisplay(gameState.currentRow, gameState.currentGuess);
            updateInputDisplay();
        }
        
        // Update display
        updateLevelDisplay();
        renderProgressDots();
        
    } else {
        // Start fresh game for this level
        gameState.guesses = [];
        gameState.currentRow = 0;
        gameState.currentGuess = '';
        gameState.gameStatus = 'playing';
        gameState.isAnimating = false;
        
        console.log('Started new game for level', gameState.currentLevel);
        
        // Update display
        updateLevelDisplay();
        renderProgressDots();
    }
    
    // Log target word for testing (remove in production)
    console.log('%c🎮 DEBUG MODE - Target word: ' + gameState.targetWord, 'color: #00ff00; font-weight: bold; font-size: 14px;');
    console.log('%c📊 Session: ' + gameState.sessionId + ' | Level: ' + gameState.currentLevel, 'color: #00ffff; font-weight: bold;');
    console.log('%c⌨️  KEYBOARD READY - Type letters directly', 'color: #00ffff; font-weight: bold;');
    console.log('%c🔧 Shortcuts: ESC = Back to levels | Ctrl+R = Reset animation', 'color: #ffff00;');
    
    // Set up keyboard listener
    setupKeyboardListener();
    
    // Initialize mobile keyboard
    initMobileKeyboard();
}

// Initialize mobile on-screen keyboard
function initMobileKeyboard() {
    const keyboard = document.getElementById('mobileKeyboard');
    if (!keyboard) return;
    
    const keys = keyboard.querySelectorAll('.key-btn');
    
    keys.forEach(key => {
        key.addEventListener('click', (e) => {
            e.preventDefault();
            const keyValue = key.getAttribute('data-key');
            
            if (keyValue === 'ENTER') {
                submitGuess();
            } else if (keyValue === 'BACK') {
                handleBackspace();
            } else {
                handleKeyPress(keyValue);
            }
            
            // Add visual feedback
            key.style.transform = 'scale(0.95)';
            setTimeout(() => {
                key.style.transform = 'scale(1)';
            }, 100);
        });
    });
    
    console.log('📱 Mobile keyboard initialized');
}

// Update keyboard colors based on guesses
function updateKeyboardColors(letter, status) {
    const keyboard = document.getElementById('mobileKeyboard');
    if (!keyboard) return;
    
    const key = keyboard.querySelector(`[data-key="${letter}"]`);
    if (!key) return;
    
    // Only update if new status is better
    if (status === 'correct') {
        key.classList.remove('present', 'absent');
        key.classList.add('correct');
    } else if (status === 'present' && !key.classList.contains('correct')) {
        key.classList.remove('absent');
        key.classList.add('present');
    } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
        key.classList.add('absent');
    }
}

// Update level display (session ID and level indicator)
function updateLevelDisplay() {
    const sessionIdEl = document.getElementById('sessionId');
    const levelIndicatorEl = document.getElementById('levelIndicator');
    
    if (sessionIdEl) {
        sessionIdEl.textContent = gameState.sessionId.toUpperCase().replace('-', ' ');
    }
    
    if (levelIndicatorEl) {
        levelIndicatorEl.textContent = `LEVEL ${gameState.currentLevel}`;
    }
}

// Render progress dots for all 3 levels
function renderProgressDots() {
    const sessionData = loadSessionData(gameState.sessionId);
    
    if (!sessionData || !sessionData.levels) {
        console.error('Cannot render progress dots - no session data');
        return;
    }
    
    const progressDots = document.querySelectorAll('.progress-dot');
    
    progressDots.forEach((dot, index) => {
        const levelNumber = index + 1;
        const level = sessionData.levels[index];
        
        // Remove all classes
        dot.className = 'progress-dot';
        
        if (level.completed) {
            dot.classList.add('completed');
        } else if (levelNumber === gameState.currentLevel) {
            dot.classList.add('current');
        } else {
            dot.classList.add('locked');
        }
    });
}

// Set up keyboard listener
function setupKeyboardListener() {
    console.log('%c  • Ctrl+R - Reset animation flag (if stuck)', 'color: #ffff00;');
    console.log('%c  • Ctrl+Shift+D - Clear all data and stats', 'color: #ffff00;');
    console.log('%c🔧 Game State:', 'color: #ff00ff; font-weight: bold;', {
        status: gameState.gameStatus,
        isAnimating: gameState.isAnimating,
        currentRow: gameState.currentRow,
        currentGuess: gameState.currentGuess,
        guesses: gameState.guesses
    });
    
    // Set up keyboard event listener
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Set up global keyboard shortcuts
    document.addEventListener('keydown', handleGlobalShortcuts);
    
    // Ensure the page has focus for keyboard input
    window.focus();
    
    // Add click handler to ensure focus when clicking anywhere on the page
    document.body.addEventListener('click', () => {
        window.focus();
        console.log('Page focused - keyboard input enabled');
    });
    
    // Add a focus indicator
    document.body.style.outline = 'none';
    document.body.setAttribute('tabindex', '0');
    document.body.focus();
    
    // Initial display update
    updateInputDisplay();
}

// Handle global keyboard shortcuts
function handleGlobalShortcuts(e) {
    // ESC key - back to level select
    if (e.key === 'Escape') {
        e.preventDefault();
        
        // Confirm if game is in progress
        if (gameState.gameStatus === 'playing' && gameState.guesses.length > 0) {
            const confirmed = confirm('Return to level select? Your game progress will be saved.');
            if (confirmed) {
                window.location.href = 'level-select.html';
            }
        } else {
            window.location.href = 'level-select.html';
        }
    }
    
    // N key - Next level (after winning)
    if (e.key === 'n' || e.key === 'N') {
        if (gameState.gameStatus === 'won') {
            e.preventDefault();
            const nextLevelBtn = document.getElementById('nextLevelBtn');
            if (nextLevelBtn && nextLevelBtn.style.display !== 'none') {
                nextLevel();
            }
        }
    }
    
    // R key - Retry level (after losing or winning)
    if (e.key === 'r' || e.key === 'R') {
        if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
            e.preventDefault();
            retryLevel();
        }
    }
    
    // CTRL + R - Force reset animation flag (debug feature)
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (gameState.isAnimating) {
            console.log('%c🔧 Force resetting animation flag', 'color: #ff9900; font-weight: bold;');
            gameState.isAnimating = false;
            alert('Animation flag reset! You can now type again.');
        } else {
            console.log('%c✅ Animation flag is already false', 'color: #00ff00;');
        }
    }
    
    // CTRL + N - Retry level (testing mode - kept for compatibility)
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        console.log('%c🎮 Retrying level (testing mode)', 'color: #00ffff; font-weight: bold;');
        retryLevel();
    }
    
    // CTRL + ALT + A - Access admin panel (hidden shortcut)
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        console.log('%c🔧 Opening admin panel...', 'color: #ffff00; font-weight: bold;');
        window.location.href = 'admin.html';
    }
    
    // CTRL + D - Clear all saved data (testing mode)
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const confirmed = confirm('⚠️ Clear ALL saved game data and stats? This cannot be undone!');
        if (confirmed) {
            localStorage.removeItem('currentGame');
            localStorage.removeItem('wordleStats');
            console.log('%c🗑️ All game data cleared!', 'color: #ff0000; font-weight: bold;');
            alert('All game data cleared! Refreshing...');
            location.reload();
        }
    }
}

// Handle all keyboard input
function handleKeyboardInput(e) {
    // Debug logging to track keyboard events
    console.log('Key pressed:', e.key, 'Status:', gameState.gameStatus, 'Animating:', gameState.isAnimating);
    
    // Prevent input if game is over or animating
    if (gameState.gameStatus !== 'playing' || gameState.isAnimating) {
        console.log('Input blocked - game not playing or animating');
        return;
    }
    
    const key = e.key;
    
    // Handle letter input (A-Z)
    if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault(); // Prevent any default behavior
        handleKeyPress(key.toUpperCase());
    }
    // Handle Enter key (submit guess)
    else if (key === 'Enter') {
        e.preventDefault();
        submitGuess();
    }
    // Handle Backspace (delete letter)
    else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
    }
}

// ==================== INPUT HANDLING FUNCTIONS ====================

// Handle letter key press (A-Z)
function handleKeyPress(letter) {
    // Only accept if we haven't filled the current guess yet
    if (gameState.currentGuess.length >= 5) {
        return; // Already have 5 letters
    }
    
    // Only accept A-Z letters
    if (!/^[A-Z]$/.test(letter)) {
        return;
    }
    
    // Add letter to current guess
    gameState.currentGuess += letter;
    
    // Update the input display area
    updateInputDisplay();
    
    // Update the tile display with pop animation
    updateTileDisplay(gameState.currentRow, gameState.currentGuess);
    
    // Add pop animation to the newly added letter
    const col = gameState.currentGuess.length - 1;
    const tile = document.querySelector(`[data-row="${gameState.currentRow}"] [data-col="${col}"]`);
    if (tile) {
        tile.classList.add('pop');
        // Remove animation class after it completes
        setTimeout(() => {
            tile.classList.remove('pop');
        }, 100);
    }
    
    // Play retro beep sound for feedback
    playInputBeep();
}

// Handle backspace key press
function handleBackspace() {
    // Only process if there's something to delete
    if (gameState.currentGuess.length === 0) {
        return;
    }
    
    // Remove last letter from current guess
    gameState.currentGuess = gameState.currentGuess.slice(0, -1);
    
    // Update the input display area
    updateInputDisplay();
    
    // Update the tile display
    updateTileDisplay(gameState.currentRow, gameState.currentGuess);
    
    // Play subtle delete sound
    playDeleteBeep();
}

// Update the input label display with current guess and cursor
function updateInputDisplay() {
    const inputLabel = document.querySelector('.input-label');
    
    if (!inputLabel) {
        return;
    }
    
    // Show current guess with blinking cursor
    if (gameState.currentGuess.length < 5) {
        inputLabel.textContent = gameState.currentGuess + '_';
    } else {
        inputLabel.textContent = gameState.currentGuess;
    }
}

// Update tiles in a row with letters from guess
function updateTileDisplay(row, guess) {
    // Get all tiles in the specified row
    for (let col = 0; col < 5; col++) {
        // Fix: data-row is on parent, data-col is on tile
        const tile = document.querySelector(`[data-row="${row}"] [data-col="${col}"]`);
        
        if (!tile) {
            console.warn(`Tile not found at row ${row}, col ${col}`);
            continue;
        }
        
        if (col < guess.length) {
            // Fill tile with letter
            tile.textContent = guess[col];
            tile.classList.add('filled');
        } else {
            // Clear empty tiles
            tile.textContent = '';
            tile.classList.remove('filled');
        }
    }
}

// Play retro beep sound for letter input
function playInputBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Play subtle delete sound
function playDeleteBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.04);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// ==================== GUESS VALIDATION & SUBMISSION ====================

// Validate guess before submission
function validateGuess(guess) {
    // Check if guess is exactly 5 letters
    if (guess.length !== 5) {
        showError('Not enough letters');
        shakeRow(gameState.currentRow);
        return false;
    }
    
    // Note: Word dictionary validation could be added here
    // For now, accept any 5-letter combination
    
    return true;
}

// Show error message to user
function showError(message) {
    const inputLabel = document.querySelector('.input-label');
    
    if (!inputLabel) {
        return;
    }
    
    // Store original text
    const originalText = inputLabel.textContent;
    
    // Show error message
    inputLabel.textContent = message;
    inputLabel.style.color = '#ff0000';
    
    // Play error sound
    playErrorBeep();
    
    // Restore after 2 seconds
    setTimeout(() => {
        inputLabel.style.color = '';
        updateInputDisplay();
    }, 2000);
}

// Trigger shake animation on invalid guess
function shakeRow(row) {
    const tiles = document.querySelectorAll(`[data-row="${row}"]`);
    
    tiles.forEach(tile => {
        tile.classList.add('shake');
    });
    
    // Remove shake class after animation completes
    setTimeout(() => {
        tiles.forEach(tile => {
            tile.classList.remove('shake');
        });
    }, 500);
}

// Submit the current guess
function submitGuess() {
    const guess = gameState.currentGuess;
    
    // Validate the guess
    if (!validateGuess(guess)) {
        return;
    }
    
    // Prevent further input during animation
    gameState.isAnimating = true;
    
    // Evaluate the guess against target word
    const results = evaluateGuess(guess, gameState.targetWord);
    
    // Add guess to guesses array
    gameState.guesses.push(guess);
    
    // Animate tile flips with color reveal
    animateTileFlip(gameState.currentRow, results, () => {
        // After animation completes:
        
        // Check if user won (all tiles are correct)
        if (results.every(result => result === 'correct')) {
            gameState.gameStatus = 'won';
            
            // Update level completion
            updateLevelCompletion(true, gameState.guesses.length);
            
            saveGame();
            
            // Check if this was the last level (level 3) and if all levels are now complete
            if (gameState.currentLevel === 3 && checkSessionComplete()) {
                // Show special session complete modal with wizard!
                setTimeout(() => {
                    showSessionCompleteModal();
                }, 500);
            } else {
                // Show regular win modal
                setTimeout(() => {
                    showModal(true);
                }, 500);
            }
            return;
        }
        
        // Move to next row
        gameState.currentRow++;
        gameState.currentGuess = '';
        
        // Check if user lost (used all 6 guesses)
        if (gameState.currentRow >= 6) {
            gameState.gameStatus = 'lost';
            
            // Update level attempts (but not completed)
            updateLevelCompletion(false, gameState.guesses.length);
            
            saveGame();
            
            // Show loss modal after short delay
            setTimeout(() => {
                showModal(false);
            }, 500);
            return;
        }
        
        // Game continues - reset for next guess
        gameState.isAnimating = false;
        updateInputDisplay();
        saveGame();
    });
}

// Evaluate guess and return color array - MATCHES OFFICIAL WORDLE ALGORITHM
function evaluateGuess(guess, target) {
    // Initialize result array with all 'absent'
    const result = Array(5).fill('absent');
    
    // Create mutable arrays for tracking
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    
    // FIRST PASS: Mark exact matches (green/correct)
    // This must happen first to properly handle duplicate letters
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result[i] = 'correct';
            targetLetters[i] = null; // Mark as used so it won't match in second pass
        }
    }
    
    // SECOND PASS: Mark present letters (yellow)
    // Only for letters that weren't exact matches
    for (let i = 0; i < 5; i++) {
        if (result[i] !== 'correct') {
            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = 'present';
                targetLetters[index] = null; // Mark as used
            }
            // If not found, it remains 'absent' (already set)
        }
    }
    
    return result; // Array of: 'correct', 'present', or 'absent'
}

// Animate tile flips with sequential color reveal
function animateTileFlip(row, results, callback) {
    const tiles = [];
    
    // Collect all tiles in the row
    for (let col = 0; col < 5; col++) {
        const tile = document.querySelector(`[data-row="${row}"] [data-col="${col}"]`);
        if (tile) {
            tiles.push(tile);
        }
    }
    
    // Safeguard: if no tiles found, reset animation flag and exit
    if (tiles.length === 0) {
        console.error('No tiles found for animation at row', row);
        gameState.isAnimating = false;
        if (callback) callback();
        return;
    }
    
    // Animate each tile sequentially with 150ms delay between each
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            // Add flip animation class
            tile.classList.add('flip');
            
            // Apply color class at the midpoint of the flip
            setTimeout(() => {
                const colorClass = results[index]; // 'correct', 'present', or 'absent'
                tile.classList.add(colorClass);
                
                // Update mobile keyboard colors
                const letter = tile.textContent.toUpperCase();
                updateKeyboardColors(letter, colorClass);
                
                // Play reveal sound
                playRevealBeep(results[index]);
                
                // If this is the last tile, call callback after flip completes
                if (index === 4) {
                    setTimeout(() => {
                        if (callback) {
                            callback();
                        }
                    }, 250); // Wait for flip to complete
                }
            }, 250); // Halfway through 500ms flip animation
            
        }, index * 150); // 150ms delay between each tile
    });
}

// Apply colors to tiles (used when restoring saved game)
function applyTileColors(row, results) {
    for (let col = 0; col < 5; col++) {
        const tile = document.querySelector(`[data-row="${row}"] [data-col="${col}"]`);
        if (tile) {
            tile.classList.add(results[col]); // 'correct', 'present', or 'absent'
        }
    }
}

// Play error sound for invalid guess
function playErrorBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Play reveal sound for tile flips (different tones for different results)
function playRevealBeep(result) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        
        // Different frequencies for different results
        if (result === 'correct') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High pitch for correct
        } else if (result === 'present') {
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime); // Medium pitch for present
        } else {
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Low pitch for absent
        }
        
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// ==================== STATISTICS & GAME END ====================

// Load statistics from localStorage
function loadStats() {
    try {
        const stats = localStorage.getItem('wordleStats');
        
        if (!stats) {
            // Initialize default stats
            return {
                gamesPlayed: 0,
                gamesWon: 0,
                currentStreak: 0,
                maxStreak: 0,
                guessDistribution: [0, 0, 0, 0, 0, 0], // Index 0 = 1 guess, Index 5 = 6 guesses
                lastPlayedDate: null
            };
        }
        
        return JSON.parse(stats);
        
    } catch (e) {
        console.error('Error loading stats:', e);
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0],
            lastPlayedDate: null
        };
    }
}

// Save statistics to localStorage
function saveStats(stats) {
    try {
        localStorage.setItem('wordleStats', JSON.stringify(stats));
    } catch (e) {
        console.error('Error saving stats:', e);
    }
}

// Update statistics after game ends
function updateStats(won, guessCount) {
    const stats = loadStats();
    
    stats.gamesPlayed++;
    
    if (won) {
        stats.gamesWon++;
        stats.currentStreak++;
        
        // Update max streak if current streak is higher
        if (stats.currentStreak > stats.maxStreak) {
            stats.maxStreak = stats.currentStreak;
        }
        
        // Update guess distribution (guessCount is 1-6, array index is 0-5)
        if (guessCount >= 1 && guessCount <= 6) {
            stats.guessDistribution[guessCount - 1]++;
        }
    } else {
        // Lost - reset current streak
        stats.currentStreak = 0;
    }
    
    // Store today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.lastPlayedDate = today.toISOString();
    
    saveStats(stats);
    return stats;
}

// Show win/loss modal
function showModal(won) {
    const modal = document.getElementById('gameModal');
    const modalTitle = document.querySelector('.modal-title');
    const modalMessage = document.querySelector('.modal-text');
    
    if (!modal || !modalTitle || !modalMessage) {
        console.error('Modal elements not found');
        return;
    }
    
    const guessCount = gameState.guesses.length;
    
    // Update modal content for level-based system
    if (won) {
        modalTitle.textContent = `LEVEL ${gameState.currentLevel} COMPLETE!`;
        
        // Show congratulatory message based on guess count
        let message = '';
        
        if (guessCount === 1) {
            message = 'GENIUS! Got it in 1 guess!';
        } else if (guessCount === 2) {
            message = 'MAGNIFICENT! Got it in 2 guesses!';
        } else if (guessCount === 3) {
            message = 'IMPRESSIVE! Got it in 3 guesses!';
        } else if (guessCount === 4) {
            message = 'SPLENDID! Got it in 4 guesses!';
        } else if (guessCount === 5) {
            message = 'GREAT! Got it in 5 guesses!';
        } else {
            message = 'PHEW! Got it in 6 guesses!';
        }
        
        modalMessage.textContent = message;
        
        // Play victory sound
        playVictorySound();
        
        // Check if session is complete
        if (checkSessionComplete()) {
            setTimeout(() => {
                showSessionCompleteModal();
            }, 1500);
            return;
        }
    } else {
        modalTitle.textContent = `LEVEL ${gameState.currentLevel} FAILED`;
        modalMessage.textContent = `The word was: ${gameState.targetWord}`;
        
        // Play defeat sound
        playDefeatSound();
    }
    
    // Update statistics
    const stats = updateStats(won, gameState.guesses.length);
    updateStatsDisplay(stats);
    
    // Setup button visibility and handlers
    setupModalButtons(won);
    
    // Prevent background scrolling
    document.body.classList.add('modal-open');
    
    // Show modal
    modal.style.display = 'flex';
}

// Update statistics display in modal
function updateStatsDisplay(stats) {
    const gamesPlayedEl = document.getElementById('gamesPlayed');
    const winRateEl = document.getElementById('winRate');
    const currentStreakEl = document.getElementById('currentStreak');
    const maxStreakEl = document.getElementById('maxStreak');
    
    if (gamesPlayedEl) {
        gamesPlayedEl.textContent = stats.gamesPlayed;
    }
    
    if (winRateEl) {
        const winRate = stats.gamesPlayed > 0 
            ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
            : 0;
        winRateEl.textContent = winRate + '%';
    }
    
    if (currentStreakEl) {
        currentStreakEl.textContent = stats.currentStreak;
    }
    
    if (maxStreakEl) {
        maxStreakEl.textContent = stats.maxStreak;
    }
    
    // Update guess distribution chart
    updateGuessDistribution(stats.guessDistribution);
}

// Update guess distribution chart
function updateGuessDistribution(distribution) {
    const maxGuesses = Math.max(...distribution, 1); // Avoid division by zero
    
    for (let i = 0; i < 6; i++) {
        const bar = document.getElementById(`dist-${i + 1}`);
        const count = document.getElementById(`count-${i + 1}`);
        
        if (bar && count) {
            const percentage = (distribution[i] / maxGuesses) * 100;
            bar.style.width = percentage + '%';
            count.textContent = distribution[i];
            
            // Highlight the current game's guess count
            if (gameState.gameStatus === 'won' && gameState.guesses.length === i + 1) {
                bar.style.backgroundColor = '#00ff00'; // Bright green for current win
            }
        }
    }
}

// Set up modal button handlers
function setupModalButtons(won) {
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    const retryLevelBtn = document.getElementById('retryLevelBtn');
    const backToLevelsBtn = document.getElementById('backToLevelsBtn');
    
    // Next Level button - show only if won and not on level 3
    if (nextLevelBtn) {
        if (won && gameState.currentLevel < 3) {
            nextLevelBtn.style.display = 'block';
            nextLevelBtn.onclick = nextLevel;
        } else {
            nextLevelBtn.style.display = 'none';
        }
    }
    
    // Retry Level button - always available
    if (retryLevelBtn) {
        retryLevelBtn.style.display = 'block';
        retryLevelBtn.onclick = retryLevel;
    }
    
    // Back to Levels button - always available
    if (backToLevelsBtn) {
        backToLevelsBtn.style.display = 'block';
        backToLevelsBtn.onclick = backToLevels;
    }
}

// Navigate to next level
function nextLevel() {
    console.log('Navigating to next level...');
    
    try {
        // Load current session
        const currentSessionStr = localStorage.getItem('currentSession');
        if (!currentSessionStr) {
            console.error('No current session');
            window.location.href = 'level-select.html';
            return;
        }
        
        const currentSession = JSON.parse(currentSessionStr);
        
        // Check if next level exists
        if (currentSession.currentLevel >= 3) {
            console.log('Already at final level - returning to level select');
            window.location.href = 'level-select.html';
            return;
        }
        
        const currentLevel = currentSession.currentLevel;
        const nextLevelNum = currentLevel + 1;
        const score = gameState.guesses.length;
        
        // Show transition screen, then navigate
        showLevelTransition(currentLevel, score, nextLevelNum).then(() => {
            // Increment level
            currentSession.currentLevel = nextLevelNum;
            
            // Clear level progress for new level
            currentSession.levelProgress = {
                guesses: [],
                currentRow: 0,
                gameStatus: 'playing'
            };
            
            // Save updated session
            localStorage.setItem('currentSession', JSON.stringify(currentSession));
            
            // Play unlock sound
            playUnlockSound();
            
            // Reload page to start new level
            setTimeout(() => {
                window.location.reload();
            }, 300);
        });
        
    } catch (e) {
        console.error('Error navigating to next level:', e);
        window.location.href = 'level-select.html';
    }
}

// Retry current level
function retryLevel() {
    console.log('Retrying level...');
    
    try {
        // Load current session
        const currentSessionStr = localStorage.getItem('currentSession');
        if (!currentSessionStr) {
            window.location.href = 'level-select.html';
            return;
        }
        
        const currentSession = JSON.parse(currentSessionStr);
        
        // Clear level progress
        currentSession.levelProgress = {
            guesses: [],
            currentRow: 0,
            gameStatus: 'playing'
        };
        
        // Save and reload
        localStorage.setItem('currentSession', JSON.stringify(currentSession));
        window.location.reload();
        
    } catch (e) {
        console.error('Error retrying level:', e);
        window.location.reload();
    }
}

// Back to level select
function backToLevels() {
    console.log('Returning to level select...');
    window.location.href = 'level-select.html';
}

// Show session complete modal with wizard celebration!
function showSessionCompleteModal() {
    console.log('Session complete! Showing wizard celebration...');
    
    const modal = document.getElementById('sessionCompleteModal');
    if (!modal) {
        console.error('Session complete modal not found!');
        return;
    }
    
    // Get session info
    const sessionData = loadSessionData(gameState.sessionId);
    const sessionName = sessionData ? sessionData.sessionName : gameState.sessionId.toUpperCase().replace('-', ' ');
    
    // Update session name in modal
    const sessionNameEl = document.getElementById('completedSessionName');
    if (sessionNameEl) {
        sessionNameEl.textContent = sessionName;
    }
    
    // Calculate stats for this session
    if (sessionData && sessionData.levels) {
        const levels = sessionData.levels;
        const played = levels.length;
        const completed = levels.filter(l => l.completed).length;
        const winRate = Math.round((completed / played) * 100);
        
        document.getElementById('sessionPlayed').textContent = played;
        document.getElementById('sessionWinRate').textContent = winRate;
        document.getElementById('sessionStreak').textContent = completed;
    }
    
    // Setup button handlers
    const backToSessionsBtn = document.getElementById('backToSessionsBtn');
    const replaySessionBtn = document.getElementById('replaySessionBtn');
    
    if (backToSessionsBtn) {
        backToSessionsBtn.onclick = () => {
            // Allow background scrolling
            document.body.classList.remove('modal-open');
            window.location.href = 'level-select.html';
        };
    }
    
    if (replaySessionBtn) {
        replaySessionBtn.onclick = () => {
            // Allow background scrolling
            document.body.classList.remove('modal-open');
            // Reset all levels in this session
            if (confirm('Reset all levels in this session and play again?')) {
                resetSessionProgress();
                window.location.href = 'level-select.html';
            }
        };
    }
    
    // Show the modal
    modal.classList.add('show');
    
    // Prevent background scrolling
    document.body.classList.add('modal-open');
    
    // Play celebration sound (optional)
    playWinSound();
    
    // Keyboard shortcuts for session complete modal
    const handleSessionCompleteKeys = (e) => {
        if (e.key === 'Enter') {
            backToSessionsBtn.click();
        } else if (e.key.toLowerCase() === 'r') {
            replaySessionBtn.click();
        }
    };
    
    document.addEventListener('keydown', handleSessionCompleteKeys);
    
    // Remove listener when modal closes
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.removeEventListener('keydown', handleSessionCompleteKeys);
        }
    });
}

// Reset progress for current session (for replay)
function resetSessionProgress() {
    try {
        const sessionDataStr = localStorage.getItem('sessionData');
        if (!sessionDataStr) return;
        
        const allSessions = JSON.parse(sessionDataStr);
        const session = allSessions[gameState.sessionId];
        
        if (!session) return;
        
        // Reset all levels
        session.levels.forEach(level => {
            level.completed = false;
            level.attempts = 0;
            level.bestScore = null;
        });
        
        // Save updated data
        localStorage.setItem('sessionData', JSON.stringify(allSessions));
        
        // Reset currentSession to level 1
        const currentSession = {
            sessionId: gameState.sessionId,
            currentLevel: 1,
            levelProgress: {
                guesses: [],
                currentRow: 0,
                gameStatus: 'playing'
            }
        };
        localStorage.setItem('currentSession', JSON.stringify(currentSession));
        
        console.log('Session progress reset');
    } catch (e) {
        console.error('Error resetting session:', e);
    }
}

// Add celebration sound for session complete
function playCelebrationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play a 4-note celebration melody
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave higher)
        const duration = 0.2;
        
        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'square';
            
            const startTime = audioContext.currentTime + (index * duration);
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    } catch (e) {
        console.error('Error playing celebration sound:', e);
    }
}
    
    // Update input display
    updateInputDisplay();
    
    // Clear saved game to force fresh start
    localStorage.removeItem('currentGame');
    
    // Save new game state
    saveGame();
    
    // Hide modal if showing
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.style.display = 'none';
        // Allow background scrolling
        document.body.classList.remove('modal-open');
    }

// Clear the game board
function clearBoard() {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
            const tile = document.querySelector(`[data-row="${row}"] [data-col="${col}"]`);
            
            if (tile) {
                tile.textContent = '';
                tile.className = 'tile'; // Reset to base class, remove all color/animation classes
            }
        }
    }
}

// Share results with emoji grid
function shareResults() {
    const guessCount = gameState.guesses.length;
    const won = gameState.gameStatus === 'won';
    
    // Build result string
    let resultText = `Retro Wordle ${won ? guessCount : 'X'}/6\n\n`;
    
    // Generate emoji grid for each guess
    gameState.guesses.forEach(guess => {
        const results = evaluateGuess(guess, gameState.targetWord);
        
        results.forEach(result => {
            if (result === 'correct') {
                resultText += '🟩'; // Green square
            } else if (result === 'present') {
                resultText += '🟨'; // Yellow square
            } else {
                resultText += '⬛'; // Black square
            }
        });
        
        resultText += '\n';
    });
    
    // Copy to clipboard
    copyToClipboard(resultText);
}

// Copy text to clipboard
function copyToClipboard(text) {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showCopyMessage('Copied to clipboard!');
            })
            .catch(() => {
                // Fallback to older method
                fallbackCopyToClipboard(text);
            });
    } else {
        // Use fallback for older browsers
        fallbackCopyToClipboard(text);
    }
}

// Fallback clipboard copy method
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyMessage('Copied to clipboard!');
    } catch (err) {
        showCopyMessage('Failed to copy');
    }
    
    document.body.removeChild(textArea);
}

// Show "Copied!" message
function showCopyMessage(message) {
    const shareBtn = document.getElementById('shareBtn');
    
    if (!shareBtn) {
        return;
    }
    
    const originalText = shareBtn.textContent;
    shareBtn.textContent = message;
    shareBtn.style.backgroundColor = '#00ff00';
    
    setTimeout(() => {
        shareBtn.textContent = originalText;
        shareBtn.style.backgroundColor = '';
    }, 2000);
}

// Play victory sound
function playVictorySound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create ascending victory fanfare
        const notes = [523, 659, 784, 1047]; // C, E, G, High C
        
        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
            
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + index * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + index * 0.15);
            oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
        });
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Play defeat sound
function playDefeatSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create descending "sad" sound
        const notes = [392, 349, 294, 262]; // G, F, D, C (descending)
        
        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
            
            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime + index * 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.4);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + index * 0.2);
            oscillator.stop(audioContext.currentTime + index * 0.2 + 0.4);
        });
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initGame);

// Level Selection Logic JavaScript
// This file handles level selection and progression for the session-based Wordle system
//
// ==================== FEATURES ====================
// ✅ Load and display session levels
// ✅ Progressive level unlocking
// ✅ Track completion status
// ✅ Show best scores and attempts
// ✅ Navigate to game with level info
// ✅ Visual feedback for locked/unlocked states
// ==================================================

// Current session data
let currentSessionData = null;
let currentSessionId = null;

// Load current session from localStorage
function loadCurrentSession() {
    try {
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage not available');
            return null;
        }
        
        const currentSession = localStorage.getItem('currentSession');
        
        if (!currentSession) {
            console.warn('No current session found');
            return null;
        }
        
        const session = JSON.parse(currentSession);
        
        if (!session.sessionId) {
            console.error('Invalid session data - no session ID');
            return null;
        }
        
        console.log('Loaded current session:', session.sessionId);
        return session;
        
    } catch (e) {
        console.error('Error loading current session:', e);
        return null;
    }
}

// Load session data by ID
function loadSessionData(sessionId) {
    try {
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage not available');
            return null;
        }
        
        const allSessions = localStorage.getItem('sessionData');
        
        if (!allSessions) {
            console.warn('No session data found');
            return null;
        }
        
        const sessions = JSON.parse(allSessions);
        const sessionData = sessions[sessionId];
        
        if (!sessionData) {
            console.error('Session not found:', sessionId);
            return null;
        }
        
        console.log('Loaded session data:', sessionData);
        return sessionData;
        
    } catch (e) {
        console.error('Error loading session data:', e);
        return null;
    }
}

// Check if a level is unlocked
function isLevelUnlocked(levelNumber, sessionData) {
    // Level 1 is always unlocked
    if (levelNumber === 1) {
        return true;
    }
    
    // Level 2 is unlocked if Level 1 is completed
    if (levelNumber === 2) {
        return sessionData.levels[0].completed;
    }
    
    // Level 3 is unlocked if Level 2 is completed
    if (levelNumber === 3) {
        return sessionData.levels[1].completed;
    }
    
    return false;
}

// Calculate progress (completed levels)
function calculateProgress(sessionData) {
    const completedCount = sessionData.levels.filter(level => level.completed).length;
    const totalLevels = sessionData.levels.length;
    return `${completedCount}/${totalLevels} LEVELS COMPLETED`;
}

// Find the next available (unlocked but not completed) level
function findNextAvailableLevel(sessionData) {
    for (let i = 0; i < sessionData.levels.length; i++) {
        const level = sessionData.levels[i];
        const levelNumber = i + 1;
        
        if (!level.completed && isLevelUnlocked(levelNumber, sessionData)) {
            return levelNumber;
        }
    }
    return null; // All levels completed
}

// Render level cards
function renderLevelCards(sessionData) {
    const levelsGrid = document.getElementById('levelsGrid');
    
    if (!levelsGrid) {
        console.error('Levels grid not found');
        return;
    }
    
    // Clear existing cards
    levelsGrid.innerHTML = '';
    
    // Find next available level for pulsing animation
    const nextAvailable = findNextAvailableLevel(sessionData);
    
    // Render each level
    sessionData.levels.forEach((level, index) => {
        const levelNumber = index + 1;
        const isUnlocked = isLevelUnlocked(levelNumber, sessionData);
        const isCompleted = level.completed;
        const isCurrent = nextAvailable === levelNumber;
        
        const card = createLevelCard(level, levelNumber, isUnlocked, isCompleted, isCurrent);
        levelsGrid.appendChild(card);
    });
    
    console.log('Rendered', sessionData.levels.length, 'level cards');
}

// Create a level card element
function createLevelCard(level, levelNumber, isUnlocked, isCompleted, isCurrent) {
    const card = document.createElement('div');
    card.className = 'level-card';
    card.setAttribute('data-level', levelNumber);
    
    // Apply appropriate classes
    if (isCompleted) {
        card.classList.add('completed', 'unlocked');
    } else if (isUnlocked) {
        card.classList.add('unlocked');
        if (isCurrent) {
            card.classList.add('current');
        }
    } else {
        card.classList.add('locked');
    }
    
    // Level number
    const numberDiv = document.createElement('div');
    numberDiv.className = 'level-number';
    numberDiv.textContent = `LEVEL ${levelNumber}`;
    
    // Status icon
    const statusDiv = document.createElement('div');
    statusDiv.className = 'level-status';
    
    if (isCompleted) {
        statusDiv.classList.add('check-icon');
        statusDiv.textContent = '✓';
    } else if (isUnlocked) {
        statusDiv.classList.add('play-icon');
        statusDiv.textContent = '▶';
    } else {
        statusDiv.classList.add('lock-icon');
        statusDiv.textContent = '🔒';
    }
    
    // Score information
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'level-score';
    
    if (isCompleted && level.bestScore) {
        scoreDiv.innerHTML = `BEST: ${level.bestScore} GUESS${level.bestScore !== 1 ? 'ES' : ''}`;
        
        if (level.attempts > 1) {
            const attemptsDiv = document.createElement('div');
            attemptsDiv.className = 'level-attempts';
            attemptsDiv.textContent = `${level.attempts} ATTEMPT${level.attempts !== 1 ? 'S' : ''}`;
            scoreDiv.appendChild(attemptsDiv);
        }
    } else if (isCompleted) {
        scoreDiv.textContent = 'COMPLETED';
    } else if (isUnlocked) {
        if (level.attempts > 0) {
            scoreDiv.textContent = `${level.attempts} ATTEMPT${level.attempts !== 1 ? 'S' : ''}`;
        } else {
            scoreDiv.textContent = 'START';
        }
    } else {
        scoreDiv.textContent = 'LOCKED';
    }
    
    // Append elements
    card.appendChild(numberDiv);
    card.appendChild(statusDiv);
    card.appendChild(scoreDiv);
    
    // Add click handler
    if (isUnlocked) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            handleLevelClick(levelNumber);
        });
        
        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play Level ${levelNumber}`);
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLevelClick(levelNumber);
            }
        });
    } else {
        card.style.cursor = 'not-allowed';
        card.addEventListener('click', () => {
            showMessage('COMPLETE PREVIOUS LEVEL FIRST!');
        });
    }
    
    return card;
}

// Handle level card click
function handleLevelClick(levelNumber) {
    console.log('Level clicked:', levelNumber);
    
    // Play selection sound
    playSelectBeep();
    
    // Brief delay for visual feedback
    setTimeout(() => {
        selectLevel(levelNumber);
    }, 200);
}

// Select a level and navigate to game
function selectLevel(levelNumber) {
    try {
        console.log('Selecting level:', levelNumber);
        
        // Load current session
        const currentSession = loadCurrentSession();
        
        if (!currentSession) {
            showMessage('ERROR LOADING SESSION!');
            return;
        }
        
        // Update current level
        currentSession.currentLevel = levelNumber;
        
        // Reset level progress (fresh start for this level)
        currentSession.levelProgress = {
            guesses: [],
            currentRow: 0,
            gameStatus: 'playing'
        };
        
        // Save updated session
        localStorage.setItem('currentSession', JSON.stringify(currentSession));
        
        console.log('Level selected, navigating to game...');
        
        // Play success sound
        playSuccessBeep();
        
        // Navigate to game
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 300);
        
    } catch (e) {
        console.error('Error selecting level:', e);
        showMessage('ERROR SELECTING LEVEL!');
    }
}

// Show temporary message overlay
function showMessage(message) {
    const overlay = document.getElementById('messageOverlay');
    
    if (!overlay) {
        console.error('Message overlay not found');
        return;
    }
    
    overlay.textContent = message;
    overlay.classList.add('show');
    
    // Play error sound
    playErrorBeep();
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 3000);
}

// Check if session is complete (all levels done)
function checkSessionComplete(sessionData) {
    return sessionData.levels.every(level => level.completed);
}

// Show session complete banner
function showSessionCompleteBanner() {
    const banner = document.getElementById('completeBanner');
    
    if (!banner) {
        return;
    }
    
    banner.classList.add('show');
    
    // Play celebration sound
    playCelebrationSound();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        banner.classList.remove('show');
    }, 5000);
}

// Initialize level selection screen
function initLevelSelect() {
    console.log('Initializing level selection screen...');
    
    // Check if any sessions exist at all
    let sessionsExist = false;
    try {
        const sessionData = localStorage.getItem('sessionData');
        if (sessionData) {
            const parsed = JSON.parse(sessionData);
            sessionsExist = parsed && Object.keys(parsed).length > 0;
        }
    } catch (e) {
        console.error('Error checking session data:', e);
    }
    
    // If no sessions exist, create the default sample session
    if (!sessionsExist) {
        console.log('No sessions found - creating default sample session...');
        const defaultSession = {
            "session-1": {
                "sessionId": "session-1",
                "sessionName": "Sample Session",
                "levels": [
                    { levelNumber: 1, word: "CRANE", completed: false, attempts: 0, bestScore: null },
                    { levelNumber: 2, word: "SLATE", completed: false, attempts: 0, bestScore: null },
                    { levelNumber: 3, word: "AUDIO", completed: false, attempts: 0, bestScore: null }
                ]
            }
        };
        
        try {
            localStorage.setItem('sessionData', JSON.stringify(defaultSession));
            console.log('Default sample session created successfully');
        } catch (e) {
            console.error('Error creating default session:', e);
            showMessage('ERROR CREATING SESSION!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
    }
    
    // Load current session
    let currentSession = loadCurrentSession();
    
    // If no current session, auto-select session-1 for normal users
    if (!currentSession) {
        console.log('No current session found, auto-selecting session-1...');
        
        // Create currentSession with session-1
        currentSession = {
            sessionId: 'session-1',
            currentLevel: 1,
            levelProgress: {
                guesses: [],
                currentRow: 0,
                gameStatus: 'playing'
            }
        };
        
        // Save it
        localStorage.setItem('currentSession', JSON.stringify(currentSession));
        console.log('Auto-created currentSession for session-1');
    }
    
    currentSessionId = currentSession.sessionId;
    
    // Load session data
    const sessionData = loadSessionData(currentSessionId);
    
    if (!sessionData) {
        console.error('Session data not found');
        showMessage('SESSION DATA NOT FOUND!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    currentSessionData = sessionData;
    
    // Display session name
    const sessionNameEl = document.getElementById('sessionName');
    if (sessionNameEl) {
        sessionNameEl.textContent = sessionData.sessionName || sessionData.sessionId.toUpperCase();
    }
    
    // Display progress
    const progressTextEl = document.getElementById('progressText');
    if (progressTextEl) {
        progressTextEl.textContent = calculateProgress(sessionData);
    }
    
    // Render level cards
    renderLevelCards(sessionData);
    
    // Check if session is complete
    if (checkSessionComplete(sessionData)) {
        console.log('🎉 Session complete!');
        showSessionCompleteBanner();
    }
    
    // Set up back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            playSelectBeep();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 200);
        });
    }
    
    // Log status
    console.log('%c🎮 LEVEL SELECT - Ready', 'color: #00ff00; font-weight: bold; font-size: 14px;');
    console.log('%cSession:', 'color: #00ffff;', sessionData.sessionName);
    console.log('%cProgress:', 'color: #00ffff;', calculateProgress(sessionData));
    
    const nextLevel = findNextAvailableLevel(sessionData);
    if (nextLevel) {
        console.log('%cNext available level:', 'color: #ffff00;', nextLevel);
    } else {
        console.log('%c✨ All levels completed!', 'color: #ffff00; font-weight: bold;');
    }
}

// ==================== SOUND EFFECTS ====================

// Play selection sound
function playSelectBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Play success sound
function playSuccessBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        [600, 800].forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
            
            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime + index * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.15);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + index * 0.1 + 0.15);
        });
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Play error sound
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

// Play celebration sound (for session complete)
function playCelebrationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Victory fanfare
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', initLevelSelect);

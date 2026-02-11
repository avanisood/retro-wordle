// Session Selection Logic JavaScript
// This file handles session selection and navigation for the level-based Wordle system
//
// ==================== FEATURES ====================
// ✅ Load and display available sessions
// ✅ Validate session ID input
// ✅ Navigate to level selection
// ✅ Show session completion status
// ✅ Error handling and user feedback
// ✅ Keyboard shortcuts (Enter key)
// ==================================================

// Load all sessions from localStorage
function loadSessions() {
    try {
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage not available');
            return null;
        }
        
        const sessionData = localStorage.getItem('sessionData');
        
        if (!sessionData) {
            console.log('No session data found in localStorage');
            return null;
        }
        
        const sessions = JSON.parse(sessionData);
        
        // Validate session data structure
        if (!sessions || typeof sessions !== 'object') {
            console.error('Invalid session data structure');
            return null;
        }
        
        console.log('Loaded sessions:', Object.keys(sessions).length);
        return sessions;
        
    } catch (e) {
        console.error('Error loading sessions:', e);
        return null;
    }
}

// Display available sessions as clickable cards
function displaySessionList(sessions) {
    const sessionList = document.getElementById('sessionList');
    
    if (!sessionList) {
        console.error('Session list element not found');
        return;
    }
    
    // Clear existing content
    sessionList.innerHTML = '';
    
    // Check if sessions exist
    if (!sessions || Object.keys(sessions).length === 0) {
        sessionList.innerHTML = `
            <div class="no-sessions-message">
                <p>NO SESSIONS CONFIGURED</p>
                <p>Visit the <a href="admin.html" style="color: #00ffff; text-decoration: underline;">ADMIN PANEL</a> to create sessions</p>
            </div>
        `;
        return;
    }
    
    // Create cards for each session
    Object.values(sessions).forEach(session => {
        const card = createSessionCard(session);
        sessionList.appendChild(card);
    });
    
    console.log('Displayed', Object.keys(sessions).length, 'session cards');
}

// Create a session card element
function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    
    // Calculate completion status
    const completedLevels = session.levels.filter(level => level.completed).length;
    const totalLevels = session.levels.length;
    const isCompleted = completedLevels === totalLevels;
    
    // Add completed class if all levels done
    if (isCompleted) {
        card.classList.add('completed');
    }
    
    // Session ID
    const idElement = document.createElement('div');
    idElement.className = 'session-card-id';
    idElement.textContent = session.sessionId.toUpperCase();
    
    // Session name
    const nameElement = document.createElement('div');
    nameElement.className = 'session-card-name';
    nameElement.textContent = session.sessionName || 'Unnamed Session';
    
    // Progress status
    const progressElement = document.createElement('div');
    progressElement.className = 'session-card-progress';
    progressElement.textContent = `${completedLevels}/${totalLevels} LEVELS COMPLETED`;
    
    // Append elements
    card.appendChild(idElement);
    card.appendChild(nameElement);
    card.appendChild(progressElement);
    
    // Add click handler
    card.addEventListener('click', () => {
        handleSessionCardClick(session.sessionId);
    });
    
    // Add keyboard accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Select ${session.sessionName}, ${completedLevels} of ${totalLevels} levels completed`);
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSessionCardClick(session.sessionId);
        }
    });
    
    return card;
}

// Handle session card click
function handleSessionCardClick(sessionId) {
    console.log('Session card clicked:', sessionId);
    
    // Auto-fill input
    const input = document.getElementById('sessionInput');
    if (input) {
        input.value = sessionId;
        
        // Trigger visual feedback
        input.focus();
    }
    
    // Play selection sound
    playSelectBeep();
    
    // Submit after brief delay for visual feedback
    setTimeout(() => {
        selectSession(sessionId);
    }, 200);
}

// Validate session ID format and existence
function validateSessionId(sessionId) {
    // Normalize input
    const normalizedId = sessionId.trim().toLowerCase();
    
    // Check if empty
    if (!normalizedId) {
        showError('PLEASE ENTER A SESSION ID');
        return false;
    }
    
    // Check format (session-1 to session-5)
    const validFormat = /^session-[1-5]$/.test(normalizedId);
    
    if (!validFormat) {
        showError('INVALID FORMAT! Enter session-1 to session-5');
        return false;
    }
    
    // Check if session exists in localStorage
    const sessions = loadSessions();
    
    if (!sessions) {
        showError('NO SESSIONS FOUND! Visit admin panel to create sessions');
        return false;
    }
    
    if (!sessions[normalizedId]) {
        showError('SESSION NOT FOUND! Enter session-1 to session-5');
        return false;
    }
    
    return true;
}

// Select a session and navigate to level selection
function selectSession(sessionId) {
    // Normalize session ID
    const normalizedId = sessionId.trim().toLowerCase();
    
    console.log('Attempting to select session:', normalizedId);
    
    // Validate session
    if (!validateSessionId(normalizedId)) {
        return;
    }
    
    try {
        // Load session data
        const sessions = loadSessions();
        const selectedSession = sessions[normalizedId];
        
        if (!selectedSession) {
            showError('SESSION NOT FOUND!');
            return;
        }
        
        // Create currentSession object
        const currentSession = {
            sessionId: normalizedId,
            currentLevel: 1, // Default to level 1
            levelProgress: {
                guesses: [],
                currentRow: 0,
                gameStatus: 'playing'
            }
        };
        
        // Save to localStorage
        localStorage.setItem('currentSession', JSON.stringify(currentSession));
        
        console.log('Session selected:', normalizedId);
        console.log('Navigating to level-select.html...');
        
        // Play success sound
        playSuccessBeep();
        
        // Navigate to level selection screen
        setTimeout(() => {
            window.location.href = 'level-select.html';
        }, 300);
        
    } catch (e) {
        console.error('Error selecting session:', e);
        showError('ERROR SELECTING SESSION! Try again');
    }
}

// Show error message
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    
    if (!errorMsg) {
        console.error('Error message element not found');
        return;
    }
    
    // Set error text
    errorMsg.textContent = message;
    
    // Show error
    errorMsg.classList.add('show');
    
    // Play error sound
    playErrorBeep();
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        errorMsg.classList.remove('show');
    }, 3000);
}

// Handle submit button click
function handleSubmit() {
    const input = document.getElementById('sessionInput');
    
    if (!input) {
        console.error('Session input not found');
        return;
    }
    
    const sessionId = input.value;
    selectSession(sessionId);
}

// Initialize page
function initSessionSelect() {
    console.log('Initializing session selection screen...');
    
    // Check password every time
    const password = prompt('Enter admin password to access session selection:');
    
    if (password !== 'wordle1985') {
        alert('Invalid password! Redirecting to home page.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Password verified, loading sessions...');
    
    // Load sessions, create default if none exist
    let sessions = loadSessions();
    
    if (!sessions || Object.keys(sessions).length === 0) {
        console.log('No sessions found, creating default sample session...');
        sessions = createDefaultSession();
    }
    
    // Display sessions
    displaySessionList(sessions);
    
    // Get input element
    const input = document.getElementById('sessionInput');
    const submitBtn = document.getElementById('submitSession');
    
    // Set focus on input
    if (input) {
        input.focus();
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        });
        
        // Convert to lowercase as user types
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase();
        });
    }
    
    // Handle submit button click
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // Log helpful info to console
    console.log('%c🎮 SESSION SELECT - Ready', 'color: #00ff00; font-weight: bold; font-size: 14px;');
    console.log('%cEnter a session ID (session-1 to session-5) to begin', 'color: #00ffff;');
    
    // Check if sessions exist
    if (!sessions || Object.keys(sessions).length === 0) {
        console.log('%c⚠️  No sessions found! Visit admin panel to create sessions', 'color: #ffff00; font-weight: bold;');
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
        
        // Two-tone success beep
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

// Create default sample session if none exist
function createDefaultSession() {
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
        console.log('Created default sample session');
        return defaultSession;
    } catch (e) {
        console.error('Error creating default session:', e);
        return null;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initSessionSelect);

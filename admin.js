// Admin Panel JavaScript - Session Management
// This file handles session and level management for the retro Wordle game
//
// ==================== FEATURES ====================
// ✅ Password-protected access
// ✅ 5 sessions with 3 levels each
// ✅ Session name and word configuration
// ✅ Real-time validation
// ✅ Session overview grid
// ✅ Progress reset functionality
// ✅ Default session creation
// ==================================================

// Check authentication on page load
function checkAuth() {
    // Always prompt for password (no caching)
    const password = prompt('Enter admin password:');
    
    if (password === 'littyandwitty') {
        // Show admin content
        const adminContent = document.getElementById('adminContent');
        if (adminContent) {
            adminContent.style.display = 'block';
        }
        return true;
    } else if (password !== null) {
        // User entered wrong password (not cancelled)
        alert('Invalid password! Redirecting to home page.');
        window.location.href = 'index.html';
        return false;
    } else {
        // User cancelled prompt
        window.location.href = 'index.html';
        return false;
    }
}

// Create default sessions
function createDefaultSessions() {
    const confirmed = confirm('Create default sessions? This will overwrite any existing session configuration (but not progress data).');
    
    if (!confirmed) return;
    
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
    
    // Preserve existing progress if sessions already exist
    try {
        const existingData = localStorage.getItem('sessionData');
        if (existingData) {
            const existing = JSON.parse(existingData);
            
            // For each default session, preserve progress from existing data
            Object.keys(defaultSessions).forEach(sessionId => {
                if (existing[sessionId] && existing[sessionId].levels) {
                    // Copy progress data from existing levels
                    defaultSessions[sessionId].levels.forEach((level, index) => {
                        if (existing[sessionId].levels[index]) {
                            level.completed = existing[sessionId].levels[index].completed || false;
                            level.attempts = existing[sessionId].levels[index].attempts || 0;
                            level.bestScore = existing[sessionId].levels[index].bestScore || null;
                        }
                    });
                }
            });
        }
    } catch (e) {
        console.error('Error preserving progress:', e);
    }
    
    localStorage.setItem('sessionData', JSON.stringify(defaultSessions));
    
    showStatus('Default sessions created successfully!', 'success');
    
    // Reload current session and overview
    loadCurrentSession();
    displaySessionOverview();
    
    console.log('Default sessions created');
}

// Load all sessions from localStorage
function loadAllSessions() {
    try {
        const sessionData = localStorage.getItem('sessionData');
        
        if (!sessionData) {
            console.log('No session data found');
            return null;
        }
        
        return JSON.parse(sessionData);
    } catch (e) {
        console.error('Error loading sessions:', e);
        return null;
    }
}

// Load current selected session into form
function loadCurrentSession() {
    const sessionSelect = document.getElementById('sessionSelect');
    const sessionId = sessionSelect.value;
    
    const allSessions = loadAllSessions();
    
    if (!allSessions || !allSessions[sessionId]) {
        console.log('Session not found:', sessionId);
        showStatus('Session not found. Click "Create Default Sessions" to initialize.', 'error');
        return;
    }
    
    const session = allSessions[sessionId];
    
    // Populate form fields
    document.getElementById('sessionName').value = session.sessionName || '';
    document.getElementById('level1Word').value = session.levels[0]?.word || '';
    document.getElementById('level2Word').value = session.levels[1]?.word || '';
    document.getElementById('level3Word').value = session.levels[2]?.word || '';
    
    console.log('Loaded session:', sessionId);
}

// NEW FUNCTIONS START HERE FOR REPLACEMENT

// Save current session
function saveCurrentSession() {
    const sessionId = document.getElementById('sessionSelect').value;
    const sessionName = document.getElementById('sessionName').value.trim();
    const level1Word = document.getElementById('level1Word').value.trim().toUpperCase();
    const level2Word = document.getElementById('level2Word').value.trim().toUpperCase();
    const level3Word = document.getElementById('level3Word').value.trim().toUpperCase();
    
    // Validate
    const validation = validateSessionData(sessionName, level1Word, level2Word, level3Word);
    
    if (!validation.valid) {
        showStatus('Error: ' + validation.errors.join(', '), 'error');
        return;
    }
    
    // Load all sessions
    let allSessions = loadAllSessions();
    
    if (!allSessions) {
        allSessions = {};
    }
    
    // Update or create session
    if (!allSessions[sessionId]) {
        allSessions[sessionId] = {
            sessionId: sessionId,
            sessionName: sessionName,
            levels: [
                { levelNumber: 1, word: level1Word, completed: false, attempts: 0, bestScore: null },
                { levelNumber: 2, word: level2Word, completed: false, attempts: 0, bestScore: null },
                { levelNumber: 3, word: level3Word, completed: false, attempts: 0, bestScore: null }
            ]
        };
    } else {
        // Preserve progress data
        const existingLevels = allSessions[sessionId].levels;
        
        allSessions[sessionId].sessionName = sessionName;
        allSessions[sessionId].levels[0].word = level1Word;
        allSessions[sessionId].levels[1].word = level2Word;
        allSessions[sessionId].levels[2].word = level3Word;
        
        // Keep existing progress
        allSessions[sessionId].levels.forEach((level, index) => {
            if (existingLevels[index]) {
                level.completed = existingLevels[index].completed;
                level.attempts = existingLevels[index].attempts;
                level.bestScore = existingLevels[index].bestScore;
            }
        });
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('sessionData', JSON.stringify(allSessions));
        showStatus('Session saved successfully!', 'success');
        
        // Refresh overview
        displaySessionOverview();
        
        console.log('Session saved:', sessionId);
    } catch (e) {
        console.error('Error saving session:', e);
        showStatus('Error saving session: ' + e.message, 'error');
    }
}

// Validate session data
function validateSessionData(sessionName, level1, level2, level3) {
    const errors = [];
    
    // Check session name
    if (!sessionName || sessionName.length === 0) {
        errors.push('Session name is required');
    }
    
    if (sessionName.length > 30) {
        errors.push('Session name too long (max 30 characters)');
    }
    
    // Check all words are 5 letters
    const words = [level1, level2, level3];
    words.forEach((word, index) => {
        if (!word || word.length !== 5) {
            errors.push(`Level ${index + 1} word must be exactly 5 letters`);
        } else if (!/^[A-Z]{5}$/.test(word)) {
            errors.push(`Level ${index + 1} word must contain only letters A-Z`);
        }
    });
    
    // Check for duplicates within session
    if (level1 && level2 && level1 === level2) {
        errors.push('Level 1 and Level 2 cannot have the same word');
    }
    if (level1 && level3 && level1 === level3) {
        errors.push('Level 1 and Level 3 cannot have the same word');
    }
    if (level2 && level3 && level2 === level3) {
        errors.push('Level 2 and Level 3 cannot have the same word');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Display session overview grid
function displaySessionOverview() {
    const container = document.getElementById('sessionOverview');
    const allSessions = loadAllSessions();
    
    if (!allSessions) {
        container.innerHTML = '<p style="color: var(--retro-orange); font-size: 10px;">No sessions found. Click "Create Default Sessions" to initialize.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    const currentSessionId = document.getElementById('sessionSelect').value;
    
    Object.values(allSessions).forEach(session => {
        const card = document.createElement('div');
        card.className = 'session-card';
        
        if (session.sessionId === currentSessionId) {
            card.classList.add('selected');
        }
        
        // Calculate progress
        const completedCount = session.levels.filter(l => l.completed).length;
        const progressText = `${completedCount}/3`;
        
        // Build card HTML
        card.innerHTML = `
            <div class="session-card-header">
                <span class="session-card-id">${session.sessionId.toUpperCase().replace('-', ' ')}</span>
                <span class="session-card-progress">${progressText}</span>
            </div>
            <div class="session-card-name">${session.sessionName}</div>
            <div class="session-card-levels">
                ${session.levels.map(level => `
                    <div class="level-status-dot ${level.completed ? 'completed' : 'incomplete'}" 
                         title="Level ${level.levelNumber}: ${level.word}${level.completed ? ' (Best: ' + level.bestScore + ')' : ''}">
                    </div>
                `).join('')}
            </div>
        `;
        
        // Click to load session
        card.addEventListener('click', () => {
            document.getElementById('sessionSelect').value = session.sessionId;
            loadCurrentSession();
            displaySessionOverview(); // Refresh to show selected
        });
        
        container.appendChild(card);
    });
}

// Reset session progress
function resetSessionProgress() {
    const sessionId = document.getElementById('sessionSelect').value;
    
    const confirmed = confirm(`Reset all progress for ${sessionId.toUpperCase().replace('-', ' ')}? This will clear completion status, attempts, and best scores.`);
    
    if (!confirmed) return;
    
    const allSessions = loadAllSessions();
    
    if (!allSessions || !allSessions[sessionId]) {
        showStatus('Session not found', 'error');
        return;
    }
    
    // Reset all levels
    allSessions[sessionId].levels.forEach(level => {
        level.completed = false;
        level.attempts = 0;
        level.bestScore = null;
    });
    
    // Save
    try {
        localStorage.setItem('sessionData', JSON.stringify(allSessions));
        showStatus('Session progress reset successfully!', 'success');
        
        // Refresh overview
        displaySessionOverview();
        
        console.log('Session progress reset:', sessionId);
    } catch (e) {
        console.error('Error resetting progress:', e);
        showStatus('Error resetting progress: ' + e.message, 'error');
    }
}

// Clear all sessions
function clearAllSessions() {
    const confirmed = confirm('⚠️ CLEAR ALL SESSIONS? This will delete all session data and progress. This cannot be undone!');
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm('Are you absolutely sure? This will permanently delete everything!');
    
    if (!doubleConfirm) return;
    
    try {
        localStorage.removeItem('sessionData');
        localStorage.removeItem('currentSession');
        
        showStatus('All sessions cleared!', 'success');
        
        // Clear form
        document.getElementById('sessionName').value = '';
        document.getElementById('level1Word').value = '';
        document.getElementById('level2Word').value = '';
        document.getElementById('level3Word').value = '';
        
        // Clear overview
        displaySessionOverview();
        
        console.log('All sessions cleared');
    } catch (e) {
        console.error('Error clearing sessions:', e);
        showStatus('Error clearing sessions: ' + e.message, 'error');
    }
}

// Show status message
function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'status-message ' + type;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'status-message';
    }, 5000);
}

// Real-time validation for word inputs
function setupValidation() {
    const wordInputs = [
        document.getElementById('level1Word'),
        document.getElementById('level2Word'),
        document.getElementById('level3Word')
    ];
    
    wordInputs.forEach(input => {
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase();
            e.target.value = value;
            
            // Validate
            if (value.length === 5 && /^[A-Z]{5}$/.test(value)) {
                e.target.classList.remove('invalid');
            } else if (value.length > 0) {
                e.target.classList.add('invalid');
            } else {
                e.target.classList.remove('invalid');
            }
        });
    });
}

// Initialize admin panel
function init() {
    console.log('Initializing admin panel...');
    
    // Check authentication
    if (!checkAuth()) {
        console.log('Authentication failed, returning');
        return;
    }
    
    console.log('Authentication successful');
    
    // Set up event listeners
    const sessionSelect = document.getElementById('sessionSelect');
    const saveBtn = document.getElementById('saveSessionBtn');
    const createBtn = document.getElementById('createDefaultsBtn');
    const resetBtn = document.getElementById('resetProgressBtn');
    const clearBtn = document.getElementById('clearAllBtn');
    const backBtn = document.getElementById('backBtn');
    
    console.log('Button elements:', {
        sessionSelect: !!sessionSelect,
        saveBtn: !!saveBtn,
        createBtn: !!createBtn,
        resetBtn: !!resetBtn,
        clearBtn: !!clearBtn,
        backBtn: !!backBtn
    });
    
    if (sessionSelect) {
        sessionSelect.addEventListener('change', loadCurrentSession);
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('Save button clicked');
            saveCurrentSession();
        });
    }
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            console.log('Create defaults button clicked');
            createDefaultSessions();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            console.log('Reset progress button clicked');
            resetSessionProgress();
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            console.log('Clear all button clicked');
            clearAllSessions();
        });
    }
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log('Back button clicked');
            window.location.href = 'session-select.html';
        });
    }
    
    // Set up validation
    setupValidation();
    
    // Load initial data
    loadCurrentSession();
    displaySessionOverview();
    
    console.log('Admin panel ready');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);


   
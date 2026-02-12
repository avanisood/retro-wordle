// Character Screen JavaScript
// This file handles the wizard animation and auto-advance to level select screen

// Track navigation state and timer
let isNavigating = false;
let autoAdvanceTimer = null;

// Optional: Play retro magic sound effect
function playMagicSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Create a "magical" sweeping sound (frequency rises then falls)
        oscillator.type = 'sine'; // Smoother sine wave for magic effect
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
        // Silently fail if Web Audio API is not supported
        console.log('Audio not supported');
    }
}

// Navigate to session select screen with fade-out transition
function navigateToGame() {
    // Prevent multiple navigation attempts
    if (isNavigating) return;
    isNavigating = true;
    
    // Clear the auto-advance timer if user clicked early
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
    
    // Play magic sound effect
    playMagicSound();
    
    // Add fade-out transition
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';
    
    // Navigate to level selection after fade-out completes
    setTimeout(function() {
        window.location.href = 'level-select.html';
    }, 500); // Match the 0.5s transition duration
}

// Auto-advance to level select screen after 4 seconds
autoAdvanceTimer = setTimeout(function() {
    navigateToGame();
}, 4000);

// Allow user to click anywhere to skip immediately
document.addEventListener('click', function() {
    navigateToGame();
});

// Also support Enter/Space key to skip
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent page scroll on space
        navigateToGame();
    }
});

// Admin access shortcut: Ctrl + Alt + A
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        window.location.href = 'admin.html';
    }
});

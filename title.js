// Title Screen JavaScript
// This file handles the title screen interactions with retro 1985 style

// Track if navigation has already started to prevent double-clicks
let isNavigating = false;

// Optional: Create retro beep sound using Web Audio API
function playRetroBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configure retro beep sound (short, high-pitched)
        oscillator.type = 'square'; // Square wave for retro sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz
        
        // Configure volume envelope (quick fade out)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        // Connect nodes and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Silently fail if Web Audio API is not supported
        console.log('Audio not supported');
    }
}

// Add fade-out transition and navigate to character screen
function navigateToCharacterScreen() {
    // Prevent double-clicks
    if (isNavigating) return;
    isNavigating = true;
    
    // Play retro beep sound
    playRetroBeep();
    
    // Add fade-out class to body
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';
    
    // Navigate after fade-out completes
    setTimeout(function() {
        window.location.href = 'character.html';
    }, 500); // Match the 0.5s transition duration
}

// Click anywhere to proceed to character screen
document.addEventListener('click', navigateToCharacterScreen);

// Also support Enter/Space key for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent page scroll on space
        navigateToCharacterScreen();
    }
});

// Admin access shortcut: Ctrl + Alt + A
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        window.location.href = 'admin.html';
    }
});

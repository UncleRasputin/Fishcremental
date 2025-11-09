// Audio system

const audioSystem = {
    enabled: true,
    volume: 0.5,
    sounds: {},
    currentReel: null // Track the current reel sound
};

// Initialize audio files
function initAudio() {
    const soundFiles = {
        cast: 'audio/cast.mp3',
        snap: 'audio/snap.mp3',
        reel: 'audio/reel.mp3',
        splash: 'audio/splash.mp3'
    };
    
    // Preload all sounds
    for (const [name, path] of Object.entries(soundFiles)) {
        const audio = new Audio(path);
        audio.volume = audioSystem.volume;
        audio.preload = 'auto';
        
        // Handle loading errors gracefully
        audio.addEventListener('error', () => {
            console.warn(`Could not load sound: ${path}`);
        });
        
        audioSystem.sounds[name] = audio;
    }
    
    // Load mute preference from localStorage
    const savedMute = localStorage.getItem('fishcremental_mute');
    if (savedMute === 'true') {
        audioSystem.enabled = false;
        updateMuteButton();
    }
}

function playSound(soundName) {
    if (!audioSystem.enabled) return;
    
    const sound = audioSystem.sounds[soundName];
    if (!sound) {
        console.warn(`Sound not found: ${soundName}`);
        return;
    }
    
    // Clone the audio to allow overlapping sounds
    const clone = sound.cloneNode();
    clone.volume = audioSystem.volume;
    clone.play().catch(err => {
        // Ignore autoplay errors (browser restrictions)
        console.debug('Audio play prevented:', err);
    });
    
    // Track reel sound so we can stop it
    if (soundName === 'reel') {
        stopReelSound(); // Stop any existing reel sound first
        audioSystem.currentReel = clone;
    }
    
    return clone;
}

function stopReelSound() {
    if (audioSystem.currentReel) {
        audioSystem.currentReel.pause();
        audioSystem.currentReel.currentTime = 0;
        audioSystem.currentReel = null;
    }
}

function toggleMute() {
    audioSystem.enabled = !audioSystem.enabled;
    localStorage.setItem('fishcremental_mute', !audioSystem.enabled);
    updateMuteButton();
    
    if (audioSystem.enabled) {
        addLog('Sound enabled');
    } else {
        addLog('Sound muted');
    }
}

function updateMuteButton() {
    const btn = document.getElementById('mute-button');
    if (btn) {
        btn.textContent = audioSystem.enabled ? '🔊' : '🔇';
        btn.title = audioSystem.enabled ? 'Mute' : 'Unmute';
    }
}

function setVolume(vol) {
    audioSystem.volume = Math.max(0, Math.min(1, vol));
    
    // Update all preloaded sounds
    for (const sound of Object.values(audioSystem.sounds)) {
        sound.volume = audioSystem.volume;
    }
}
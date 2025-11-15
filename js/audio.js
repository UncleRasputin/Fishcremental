const audioSystem = {
    enabled: true,
    volume: 0.5,
    sounds: {},
    currentReel: null 
};

function initAudio()
{
    const soundFiles = {
        cast: 'audio/cast.mp3',
        snap: 'audio/snap.mp3',
        reel: 'audio/reel.mp3',
        splash: 'audio/splash.mp3',
        sell: 'audio/sell.mp3',
        level: 'audio/chime.mp3',
        quest: 'audio/quest.mp3',
        achievement: 'audio/achievement.mp3'
    };
    
    for (const [name, path] of Object.entries(soundFiles))
    {
        const audio = new Audio(path);
        audio.volume = audioSystem.volume;
        audio.preload = 'auto';
        audioSystem.sounds[name] = audio;
    }
    
    const savedMute = localStorage.getItem('fishcremental_mute');
    if (savedMute === 'true')
    {
        audioSystem.enabled = false;
        updateMuteButton();
    }
}

function playSound(soundName)
{
    if (!audioSystem.enabled)
        return;
   
    const sound = audioSystem.sounds[soundName];

    if (!sound) 
        return;
    
    const clone = sound.cloneNode();
    clone.volume = audioSystem.volume;

    clone.play().catch(err => {
        console.debug('Audio play prevented:', err);
    });

    if (soundName === 'reel')
    {
        stopReelSound(); 
        audioSystem.currentReel = clone;
    }
    return clone;
}

function stopReelSound()
{
    if (audioSystem.currentReel)
    {
        audioSystem.currentReel.pause();
        audioSystem.currentReel.currentTime = 0;
        audioSystem.currentReel = null;
    }
}

function toggleMute()
{
    audioSystem.enabled = !audioSystem.enabled;
    localStorage.setItem('fishcremental_mute', !audioSystem.enabled);
    updateMuteButton();
    addLog(`Sound ${(audioSystem.enabled)?"enabled":"muted"}`);
}

function updateMuteButton()
{
    if (UI.muteButton)
    {
        UI.muteButton.textContent = audioSystem.enabled ? '🔊' : '🔇';
        UI.muteButton.title = audioSystem.enabled ? 'Mute' : 'Unmute';
    }
}

function setVolume(vol)
{
    audioSystem.volume = Math.max(0, Math.min(1, vol));
   
    for (const sound of Object.values(audioSystem.sounds)) {
        sound.volume = audioSystem.volume;
    }
}
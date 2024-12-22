class SoundManager {
    constructor() {
        this.sounds = {
            move: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA'),
            rotate: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA'),
            drop: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA'),
            clear: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA'),
            gameOver: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA'),
            levelUp: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA')
        };
        
        this.muted = false;
        this.loadSounds();
    }

    loadSounds() {
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.3;
        });
    }

    play(soundName) {
        if (this.muted || !this.sounds[soundName]) {
            return;
        }
        
        try {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.sounds[soundName].volume;
            sound.play().catch(e => {
                console.warn('Sound play failed:', e);
            });
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    setVolume(volume) {
        const normalizedVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = normalizedVolume;
        });
    }
}

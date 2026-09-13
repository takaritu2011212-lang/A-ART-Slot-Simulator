// 音声管理システム

class AudioManager {
    constructor() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = AudioContextClass ? new AudioContextClass() : null;
        this.bgmAudio = null;
        this.currentBGM = null;
        this.isBGMPlaying = false;
    }

    playTone(startFrequency, endFrequency, duration) {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(startFrequency, now);
        if (endFrequency !== startFrequency) {
            osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
        }
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.start(now);
        osc.stop(now + duration);
    }

    playBetSound() {
        this.playTone(600, 400, 0.1);
    }

    playStartSound() {
        this.playTone(800, 1200, 0.15);
    }

    playWinSound() {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        const play = (frequency, start, duration) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.setValueAtTime(frequency, start);
            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
            osc.start(start);
            osc.stop(start + duration);
        };
        play(500, now, 0.1);
        play(800, now + 0.12, 0.1);
    }

    playBonusSound() {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        [800, 1000, 1200, 1000].forEach((frequency, i) => {
            const start = now + i * 0.15;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.setValueAtTime(frequency, start);
            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);
            osc.start(start);
            osc.stop(start + 0.12);
        });
    }

    playARTSound() {
        this.playTone(600, 1200, 0.3);
    }

    playBGM(filename = 'ART_BGM.mp3') {
        if (this.isBGMPlaying) this.stopBGM();
        this.bgmAudio = new Audio(`audio/${filename}`);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.5;
        this.bgmAudio.play().then(() => {
            this.isBGMPlaying = true;
            this.currentBGM = filename;
        }).catch((error) => {
            console.warn(`BGM再生失敗: ${filename}`, error);
            this.isBGMPlaying = false;
            this.currentBGM = null;
        });
    }

    stopBGM() {
        if (!this.bgmAudio) return;
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
        this.isBGMPlaying = false;
        this.currentBGM = null;
    }

    setBGMVolume(volume) {
        if (this.bgmAudio) this.bgmAudio.volume = Math.max(0, Math.min(1, volume));
    }

    isBGMActive() {
        return this.isBGMPlaying;
    }
}

const audioManager = new AudioManager();

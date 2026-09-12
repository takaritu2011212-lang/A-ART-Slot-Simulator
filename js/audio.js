// 音声管理システム

class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.bgmAudio = null;
        this.currentBGM = null;
        this.isBGMPlaying = false;
    }

    // 効果音生成 - BET音
    playBetSound() {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // 効果音生成 - スタート音（高音）
    playStartSound() {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // 効果音生成 - 役成立音（ピンポン）
    playWinSound() {
        const now = this.audioContext.currentTime;
        
        // 低音
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        osc1.frequency.setValueAtTime(500, now);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc1.start(now);
        osc1.stop(now + 0.1);
        
        // 高音
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.frequency.setValueAtTime(800, now + 0.12);
        gain2.gain.setValueAtTime(0.3, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.22);
    }

    // 効果音生成 - ボーナス音（ファンファーレ）
    playBonusSound() {
        const now = this.audioContext.currentTime;
        const frequencies = [800, 1000, 1200, 1000];
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            const startTime = now + (i * 0.15);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
            
            osc.start(startTime);
            osc.stop(startTime + 0.12);
        });
    }

    // 効果音生成 - ART突入音（上昇音）
    playARTSound() {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // BGM再生開始
    playBGM(filename = 'ART_BGM.mp3') {
        if (this.isBGMPlaying) {
            this.stopBGM();
        }

        this.bgmAudio = new Audio();
        this.bgmAudio.src = `audio/${filename}`;
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.5;
        
        this.bgmAudio.play().then(() => {
            this.isBGMPlaying = true;
            this.currentBGM = filename;
        }).catch((error) => {
            console.warn(`BGM再生失敗: ${filename}`, error);
            // ファイルがない場合は ART_BGM.mp3 を試す
            if (filename !== 'ART_BGM.mp3') {
                this.playBGM('ART_BGM.mp3');
            }
        });
    }

    // BGM停止
    stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
            this.isBGMPlaying = false;
            this.currentBGM = null;
        }
    }

    // BGM音量変更
    setBGMVolume(volume) {
        if (this.bgmAudio) {
            this.bgmAudio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    // BGM確認
    isBGMActive() {
        return this.isBGMPlaying;
    }
}

const audioManager = new AudioManager();

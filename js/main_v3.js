class GameControllerV3 {
    constructor() {
        this.isSpinning = false;
        this.stoppedReels = new Set();
        this.initializeElements();
        this.attach();
        this.load();
    }

    initializeElements() {
        this.elements = {
            maxBetBtn: document.getElementById('maxBetBtn'),
            addCreditBtn: document.getElementById('addCreditBtn'),
            startBtn: document.getElementById('startBtn'),
            stop1Btn: document.getElementById('stop1Btn'),
            stop2Btn: document.getElementById('stop2Btn'),
            stop3Btn: document.getElementById('stop3Btn'),
            resetBtn: document.getElementById('resetBtn'),
            settingSelect: document.getElementById('settingSelect')
        };
    }

    attach() {
        this.elements.maxBetBtn.addEventListener('click', () => this.bet());
        this.elements.addCreditBtn.addEventListener('click', () => this.addCredit());
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.stop1Btn.addEventListener('click', () => this.stop(1));
        this.elements.stop2Btn.addEventListener('click', () => this.stop(2));
        this.elements.stop3Btn.addEventListener('click', () => this.stop(3));
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.settingSelect.addEventListener('change', e => {
            game.setSetting(Number(e.target.value));
            renderer.update();
        });
    }

    load() {
        const s = storage.getStats();
        game.setting = s.setting;
        game.credit = s.credit;
        this.elements.settingSelect.value = s.setting;
        this.refreshButtons();
        renderer.update();
    }

    refreshButtons() {
        const normal = game.state === GAME_STATE.NORMAL;
        const hasBet = game.bet > 0;
        const busy = this.isSpinning;

        this.elements.maxBetBtn.disabled = busy || !normal || hasBet;
        this.elements.startBtn.disabled = busy || (normal && !hasBet) || game.state === GAME_STATE.ART;

        this.elements.stop1Btn.disabled = !busy || this.stoppedReels.has(1);
        this.elements.stop2Btn.disabled = !busy || !this.stoppedReels.has(1) || this.stoppedReels.has(2);
        this.elements.stop3Btn.disabled = !busy || !this.stoppedReels.has(1) || this.stoppedReels.has(3);
    }

    addCredit() {
        if (this.isSpinning) return;
        if (game.addCredit(1000)) {
            renderer.update();
            this.refreshButtons();
        }
    }

    bet() {
        if (this.isSpinning || game.state !== GAME_STATE.NORMAL || game.bet > 0) return;
        if (!game.placeBet()) {
            alert('クレジット不足です');
            return;
        }
        renderer.setEffectText('レバーを叩いてください。');
        renderer.update();
        this.refreshButtons();
    }

    start() {
        if (this.isSpinning) return;

        try {
            let ok = false;
            if (game.state === GAME_STATE.NORMAL) {
                ok = game.rollNormal();
            } else if (game.state === GAME_STATE.BONUS_BIG || game.state === GAME_STATE.BONUS_REG) {
                ok = game.startBonusSpin();
            } else if (game.state === GAME_STATE.CHALLENGE) {
                ok = game.startChallengeSpin();
            }

            if (!ok) return;

            // ここを最優先で確定させる。リール開始後の表示更新で止まらない構造にする。
            this.isSpinning = true;
            this.stoppedReels.clear();
            this.refreshButtons();

            renderer.clearResult();
            renderer.startReels();
            renderer.startSpinEffect();
        } catch (error) {
            console.error('レバー処理エラー:', error);
            this.isSpinning = false;
            this.stoppedReels.clear();
            game.spinInProgress = false;
            this.refreshButtons();
        }
    }

    stop(n) {
        if (!this.isSpinning || this.stoppedReels.has(n)) return;
        if (n !== 1 && !this.stoppedReels.has(1)) return;

        try {
            this.stoppedReels.add(n);
            renderer.stopReel(n);
            renderer.onReelStopped(n);
            this.refreshButtons();

            if (this.stoppedReels.size === 3) {
                setTimeout(() => this.endSpin(), 260);
            }
        } catch (error) {
            console.error(`停止${n}処理エラー:`, error);
        }
    }

    endSpin() {
        if (!this.isSpinning) return;

        this.isSpinning = false;
        renderer.stopAllReels();
        const state = game.state;

        if (state === GAME_STATE.NORMAL) {
            const payout = game.currentRole?.payment || 0;
            game.credit += payout;
            storage.addGame(game.bet, payout);
            game.bet = 0;

            const announce = game.advancePresentation();
            if (announce) {
                game.announceBonus();
                renderer.showBonus(game.bonusType);
            } else {
                renderer.showNormalResult();
            }
        } else if (state === GAME_STATE.BONUS_BIG || state === GAME_STATE.BONUS_REG) {
            const result = game.finishBonusSpin();
            if (result === 'CHALLENGE') renderer.showChallenge();
        } else if (state === GAME_STATE.CHALLENGE) {
            const result = game.finishChallengeSpin();
            if (result === 'ART') {
                renderer.setEffectText('――ART、突入。', 'bonus');
            } else if (result === 'NORMAL') {
                renderer.setEffectText('5G、終了。通常時へ戻る。', 'normal');
            } else {
                renderer.setEffectText(`残り${game.challengeG}G。まだ終わらない。`, 'chance');
            }
        }

        renderer.update();
        this.refreshButtons();
    }

    reset() {
        if (!confirm('データをリセットしますか？')) return;
        storage.resetData();
        game.credit = 0;
        game.reset();
        this.isSpinning = false;
        this.stoppedReels.clear();
        this.refreshButtons();
        renderer.update();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameControllerV3();
});

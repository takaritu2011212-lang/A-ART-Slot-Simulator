// メイン・イベントハンドラー

class GameController {
    constructor() {
        this.isSpinning = false;
        this.stopsCount = 0;
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialState();
    }

    initializeElements() {
        this.elements = {
            betBtn: document.getElementById('betBtn'),
            startBtn: document.getElementById('startBtn'),
            stop1Btn: document.getElementById('stop1Btn'),
            stop2Btn: document.getElementById('stop2Btn'),
            stop3Btn: document.getElementById('stop3Btn'),
            resetBtn: document.getElementById('resetBtn'),
            settingSelect: document.getElementById('settingSelect'),
        };
    }

    attachEventListeners() {
        this.elements.betBtn.addEventListener('click', () => this.onBet());
        this.elements.startBtn.addEventListener('click', () => this.onStart());
        this.elements.stop1Btn.addEventListener('click', () => this.onStop1());
        this.elements.stop2Btn.addEventListener('click', () => this.onStop2());
        this.elements.stop3Btn.addEventListener('click', () => this.onStop3());
        this.elements.resetBtn.addEventListener('click', () => this.onReset());
        this.elements.settingSelect.addEventListener('change', (e) => this.onSettingChange(e));
    }

    loadInitialState() {
        const stats = storage.getStats();
        game.setSetting(stats.setting);
        game.credit = stats.credit;
        this.elements.settingSelect.value = stats.setting;
        renderer.updateAll();
    }

    onBet() {
        if (game.state !== GAME_STATE.NORMAL) {
            alert('ゲーム中のベットはできません');
            return;
        }

        if (game.credit < BET_AMOUNT) {
            alert('クレジット不足です');
            return;
        }

        game.bet();
        this.elements.betBtn.disabled = true;
        this.elements.startBtn.disabled = false;
        renderer.updateCredit();
    }

    onStart() {
        if (game.bet === 0) {
            alert('先にBETしてください');
            return;
        }

        this.isSpinning = true;
        this.stopsCount = 0;

        // ゲーム実行
        game.roll();

        // ボーナス判定
        if (game.hasBonus) {
            game.startBonus();
        }

        // UI更新
        this.elements.betBtn.disabled = true;
        this.elements.startBtn.disabled = true;
        this.elements.stop1Btn.disabled = false;
        this.elements.stop2Btn.disabled = false;
        this.elements.stop3Btn.disabled = false;

        renderer.updateAll();
    }

    onStop1() {
        this.stopsCount++;
        this.updateStopButtons();
        
        if (this.stopsCount === 3) {
            this.endSpin();
        }
    }

    onStop2() {
        this.stopsCount++;
        this.updateStopButtons();
        
        if (this.stopsCount === 3) {
            this.endSpin();
        }
    }

    onStop3() {
        this.stopsCount++;
        this.updateStopButtons();
        
        if (this.stopsCount === 3) {
            this.endSpin();
        }
    }

    updateStopButtons() {
        this.elements.stop1Btn.disabled = this.stopsCount >= 1;
        this.elements.stop2Btn.disabled = this.stopsCount >= 2;
        this.elements.stop3Btn.disabled = this.stopsCount >= 3;
    }

    endSpin() {
        this.isSpinning = false;
        this.stopsCount = 0;

        // 払出処理
        if (game.payment > 0 && !game.currentRole.isLose) {
            game.credit += game.payment;
            storage.addGame(0, game.payment);
        }

        // UI更新
        this.elements.betBtn.disabled = false;
        this.elements.startBtn.disabled = false;
        this.elements.stop1Btn.disabled = true;
        this.elements.stop2Btn.disabled = true;
        this.elements.stop3Btn.disabled = true;
        game.bet = 0;

        renderer.updateAll();

        // 次ゲームへ
        setTimeout(() => {
            game.reset();
            renderer.updateAll();
        }, 500);
    }

    onReset() {
        if (confirm('データをリセットしますか？')) {
            storage.resetData();
            game.credit = 0;
            game.reset();
            renderer.updateAll();
            alert('データをリセットしました');
        }
    }

    onSettingChange(e) {
        const newSetting = parseInt(e.target.value);
        game.setSetting(newSetting);
        storage.setSetting(newSetting);
        renderer.updateStats();
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    const controller = new GameController();
    console.log('🎰 A+ART パチスロシミュレーター 起動完了');
});

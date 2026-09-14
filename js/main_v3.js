class GameControllerV3 {
    constructor() {
        this.isSpinning = false;
        this.stoppedReels = new Set();
        this.initializeElements();
        this.attach();
        this.load();
        this.debug('INIT', 'GameControllerV3 initialized');
    }
    debug(type, message, detail = '') { window.__AART_LOG__?.(type, message, detail); }
    fail(code, error, detail = '') {
        const message = error?.message || String(error || 'unknown error');
        const stack = error?.stack || '';
        window.__AART_ERROR_CODE__ = code;
        window.__AART_LAST_ERROR__ = { code, message, stack, detail, time: new Date().toISOString() };
        this.debug('ERROR', `[${code}] ${message}`, detail || stack);
        const status = document.getElementById('aartDebugStatus');
        if (status) { status.className = 'aart-debug-row error'; status.textContent = `ERROR CODE: ${code} | ${message}`; }
    }
    initializeElements() {
        this.elements = {
            maxBetBtn: document.getElementById('maxBetBtn'), addCreditBtn: document.getElementById('addCreditBtn'),
            startBtn: document.getElementById('startBtn'), stop1Btn: document.getElementById('stop1Btn'),
            stop2Btn: document.getElementById('stop2Btn'), stop3Btn: document.getElementById('stop3Btn'),
            resetBtn: document.getElementById('resetBtn'), settingSelect: document.getElementById('settingSelect')
        };
        for (const [name, el] of Object.entries(this.elements)) if (!el) throw new Error(`DOM element missing: ${name}`);
        this.debug('DOM', 'All controller elements found');
    }
    attach() {
        this.debug('ATTACH', 'Binding control events');
        this.elements.maxBetBtn.addEventListener('click', () => { this.debug('HANDLER', 'MAXBET handler entered'); this.bet(); });
        this.elements.addCreditBtn.addEventListener('click', () => { this.debug('HANDLER', 'Credit handler entered'); this.addCredit(); });
        this.elements.startBtn.addEventListener('click', () => { this.debug('HANDLER', 'Lever handler entered'); this.start(); });
        this.elements.stop1Btn.addEventListener('click', () => { this.debug('HANDLER', 'Stop1 handler entered'); this.stop(1); });
        this.elements.stop2Btn.addEventListener('click', () => { this.debug('HANDLER', 'Stop2 handler entered'); this.stop(2); });
        this.elements.stop3Btn.addEventListener('click', () => { this.debug('HANDLER', 'Stop3 handler entered'); this.stop(3); });
        this.elements.resetBtn.addEventListener('click', () => { this.debug('HANDLER', 'Reset handler entered'); this.reset(); });
        this.elements.settingSelect.addEventListener('change', e => { this.debug('HANDLER', 'Setting change', e.target.value); game.setSetting(Number(e.target.value)); renderer.update(); });
        this.debug('ATTACH', 'All control events bound');
    }
    load() {
        this.debug('LOAD', 'Loading saved state');
        const s = storage.getStats(); game.setting = s.setting; game.credit = s.credit; this.elements.settingSelect.value = s.setting;
        this.refreshButtons(); renderer.update(); this.debug('LOAD', `credit=${game.credit}, state=${game.state}, bet=${game.bet}`);
    }
    refreshButtons() {
        const normal = game.state === GAME_STATE.NORMAL, hasBet = game.bet > 0, busy = this.isSpinning;
        this.elements.maxBetBtn.disabled = busy || !normal || hasBet;
        this.elements.startBtn.disabled = busy || (normal && !hasBet) || game.state === GAME_STATE.ART;
        this.elements.stop1Btn.disabled = !busy || this.stoppedReels.has(1);
        this.elements.stop2Btn.disabled = !busy;
        this.elements.stop3Btn.disabled = !busy;
        this.debug('BUTTONS', `busy=${busy}, state=${game.state}, bet=${game.bet}`, `start=${this.elements.startBtn.disabled}, stops=${this.elements.stop1Btn.disabled}/${this.elements.stop2Btn.disabled}/${this.elements.stop3Btn.disabled}`);
    }
    addCredit() {
        try { if (this.isSpinning) return this.debug('BLOCK', 'Credit blocked: spinning'); if (game.addCredit(1000)) { renderer.update(); this.refreshButtons(); this.debug('CREDIT', `credit=${game.credit}`); } }
        catch (error) { this.fail('CREDIT-001', error); }
    }
    bet() {
        try { if (this.isSpinning || game.state !== GAME_STATE.NORMAL || game.bet > 0) return; if (!game.placeBet()) { alert('クレジット不足です'); return; } renderer.setEffectText('レバーを叩いてください。', 'normal'); renderer.update(); this.refreshButtons(); this.debug('BET', `bet=${game.bet}, credit=${game.credit}`); }
        catch (error) { this.fail('BET-001', error); }
    }
    start() {
        this.debug('START', `entered state=${game.state}, spinning=${this.isSpinning}, bet=${game.bet}`);
        if (this.isSpinning) return this.debug('BLOCK', 'Lever blocked: already spinning');
        try {
            let ok = false;
            this.debug('START', 'Calling game roll/start');
            if (game.state === GAME_STATE.NORMAL) ok = game.rollNormal();
            else if (game.state === GAME_STATE.BONUS_BIG || game.state === GAME_STATE.BONUS_REG) ok = game.startBonusSpin();
            else if (game.state === GAME_STATE.CHALLENGE) ok = game.startChallengeSpin();
            this.debug('GAME', `game start returned ${ok}`, `spinInProgress=${game.spinInProgress}`);
            if (!ok) return this.debug('BLOCK', 'Game rejected lever input');
            this.isSpinning = true; this.stoppedReels.clear(); this.refreshButtons(); this.debug('REELS', 'Controller entered spinning state');
            this.debug('RENDER', 'clearResult'); renderer.clearResult();
            this.debug('RENDER', 'startReels'); renderer.startReels();
            this.debug('RENDER', 'startSpinEffect'); renderer.startSpinEffect();
            this.debug('START', 'Lever sequence completed');
        } catch (error) {
            this.fail('START-001', error, `state=${game.state}, bet=${game.bet}`);
            this.isSpinning = false; this.stoppedReels.clear(); game.spinInProgress = false;
            try { renderer.stopAllReels(); } catch (e) { this.fail('START-002', e); }
            this.refreshButtons();
        }
    }
    stop(n) {
        this.debug('STOP', `stop(${n}) entered`, `spinning=${this.isSpinning}`);
        if (!this.isSpinning || this.stoppedReels.has(n)) return this.debug('BLOCK', `Stop${n} blocked`);
        if (n > 1 && !this.stoppedReels.has(n - 1)) { this.debug('BLOCK', `Stop${n} blocked: previous reel not stopped`); renderer.setEffectText('まだそのリールは止められない。', 'chance'); return; }
        try {
            this.stoppedReels.add(n); renderer.stopReel(n); renderer.onReelStopped(n); this.refreshButtons();
            this.debug('STOP', `stop${n} completed`, `stopped=${[...this.stoppedReels].join(',')}`);
            if (this.stoppedReels.size === 3) { this.debug('STOP', 'All reels stopped'); setTimeout(() => this.endSpin(), 260); }
        } catch (error) { this.fail(`STOP-00${n}`, error); this.stoppedReels.delete(n); this.refreshButtons(); }
    }
    endSpin() {
        if (!this.isSpinning) return;
        try {
            this.isSpinning = false;
            // 通常時スピンもゲーム側ロックを必ず解除する。これがないと2回目以降のレバーが拒否される。
            game.spinInProgress = false;
            renderer.stopAllReels(); const state = game.state; this.debug('END', `Ending spin state=${state}`);
            if (state === GAME_STATE.NORMAL) {
                const payout = game.currentRole?.payment || 0; game.credit += payout; storage.addGame(game.bet, payout); game.bet = 0;
                const announce = game.advancePresentation(); if (announce) { game.announceBonus(); renderer.showBonus(game.bonusType); } else renderer.showNormalResult();
            } else if (state === GAME_STATE.BONUS_BIG || state === GAME_STATE.BONUS_REG) {
                const result = game.finishBonusSpin(); if (result === 'CHALLENGE') renderer.showChallenge();
            } else if (state === GAME_STATE.CHALLENGE) {
                const result = game.finishChallengeSpin(); if (result === 'ART') renderer.setEffectText('――ART、突入。', 'bonus'); else if (result === 'NORMAL') renderer.setEffectText('5G、終了。通常時へ戻る。', 'normal'); else renderer.setEffectText(`残り${game.challengeG}G。まだ終わらない。`, 'chance');
            }
            renderer.update(); this.refreshButtons(); this.debug('END', 'Spin finished');
        } catch (error) { this.fail('END-001', error); this.isSpinning = false; game.spinInProgress = false; this.stoppedReels.clear(); try { renderer.stopAllReels(); } catch (_) {} this.refreshButtons(); }
    }
    reset() {
        try { if (!confirm('データをリセットしますか？')) return; storage.resetData(); game.credit = 0; game.reset(); this.isSpinning = false; this.stoppedReels.clear(); renderer.stopAllReels(); this.refreshButtons(); renderer.update(); this.debug('RESET', 'Data reset completed'); }
        catch (error) { this.fail('RESET-001', error); }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.gameController = new GameControllerV3(); window.__AART_LOG__?.('BOOT', 'main_v3.js loaded successfully');
        const status = document.getElementById('aartDebugStatus'); if (status) { status.className = 'aart-debug-row'; status.textContent = 'OK: main_v3.js 起動完了'; }
    } catch (error) {
        window.__AART_ERROR_CODE__ = 'BOOT-001'; window.__AART_LAST_ERROR__ = { code:'BOOT-001', message:error?.message||String(error), stack:error?.stack||'' };
        window.__AART_LOG__?.('ERROR', '[BOOT-001] main_v3.js 起動失敗', error?.stack || error);
        const status = document.getElementById('aartDebugStatus'); if (status) { status.className='aart-debug-row error'; status.textContent=`ERROR CODE: BOOT-001 | ${error?.message||error}`; }
    }
});

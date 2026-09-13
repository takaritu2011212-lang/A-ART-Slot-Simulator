// ゲームロジック・状態管理

class SlotGame {
    constructor() {
        this.setting = 1;
        this.state = GAME_STATE.NORMAL;
        this.currentG = 0;
        this.artG = 0;
        this.credit = 0;
        this.artStock = 0;
        this.bet = 0;
        this.result = null;
        this.hintRole = null;
        this.currentRole = null;
        this.payment = 0;
        this.hasBonus = false;
        this.bonusType = null;
        this.bonusPending = false;
        this.bonusCountdown = 0;
        this.bonusSourceRole = null;
        this.fakePrecursorG = 0;
        this.fakePrecursorKind = null;
        this.spinInProgress = false;
        this.inAttackTime = false;
        this.inReverse = false;
        this.burstStock = 0;
        this.challengeG = 0;
        this.pendingPayout = 0;
        this.bonusGameG = 0;
        this.bonusPayout = 0;
        this.bonusStarted = false;
        this.presentation = null;
    }

    setSetting(setting) {
        if (setting < 1 || setting > 6) return;
        this.setting = setting;
        storage.setSetting(setting);
    }

    placeBet() {
        if (this.state !== GAME_STATE.NORMAL || this.bet > 0 || this.credit < BET_AMOUNT) return false;
        this.bet = BET_AMOUNT;
        this.credit -= BET_AMOUNT;
        this.payment = 0;
        this.result = null;
        return true;
    }

    drawRole() {
        const roles = this.state === GAME_STATE.NORMAL ? NORMAL_ROLES : ART_ROLES;
        const entries = Object.values(roles);
        const totalProb = entries.reduce((sum, role) => sum + role.prob, 0);
        const rand = Math.random() * totalProb;
        let cumulative = 0;
        for (const role of entries) {
            cumulative += role.prob;
            if (rand < cumulative) return role;
        }
        return entries[entries.length - 1];
    }

    roll() {
        if (this.state !== GAME_STATE.NORMAL || this.bet <= 0) return false;
        this.currentRole = this.drawRole();
        this.hintRole = this.currentRole;
        this.payment = this.currentRole.payment || 0;
        this.hasBonus = false;
        this.bonusType = null;
        this.pendingPayout = 0;
        this.spinInProgress = true;
        this.checkBonus();
        return true;
    }

    checkBonus() {
        if (!this.currentRole || this.bonusPending) return;
        const rates = BONUS_TRIGGER_RATES[this.setting];
        let rate = 0;
        const name = this.currentRole.name;
        if (name.includes('チャンス目')) rate = rates.CHANCE;
        else if (name.includes('強チェリー')) rate = rates.STRONG_CHERRY;
        else if (name.includes('スイカ')) rate = rates.WATERMELON;
        else if (name.includes('弱チェリー')) rate = rates.WEAK_CHERRY;
        else if (this.currentRole.isLose) rate = rates.LOSE;
        if (Math.random() < rate) {
            this.hasBonus = true;
            this.bonusPending = true;
            this.bonusType = Math.random() < 0.4 ? 'BIG' : 'REG';
            this.bonusCountdown = 2 + Math.floor(Math.random() * 4);
            this.bonusSourceRole = this.currentRole;
            this.fakePrecursorG = 0;
        } else {
            this.startFakePrecursorIfNeeded();
        }
    }

    startFakePrecursorIfNeeded() {
        if (this.bonusPending || this.fakePrecursorG > 0) return;
        const name = this.currentRole?.name || '';
        let chance = 0.045;
        if (name.includes('強チェリー') || name.includes('チャンス目')) chance = 0.34;
        else if (name.includes('スイカ') || name.includes('弱チェリー')) chance = 0.16;
        if (Math.random() < chance) this.fakePrecursorG = 2 + Math.floor(Math.random() * 3);
    }

    advanceNormalPresentation() {
        if (this.bonusPending) {
            this.bonusCountdown--;
            return this.bonusCountdown <= 0;
        }
        if (this.fakePrecursorG > 0) this.fakePrecursorG--;
        return false;
    }

    announceBonus() {
        if (!this.bonusPending) return false;
        this.bonusPayout = this.bonusType === 'BIG' ? BIG_PAYMENT : REG_PAYMENT;
        this.pendingPayout = this.bonusPayout;
        this.bonusPending = false;
        this.bonusCountdown = 0;
        this.bonusStarted = true;
        this.hasBonus = true;
        this.state = this.bonusType === 'BIG' ? GAME_STATE.BONUS_BIG : GAME_STATE.BONUS_REG;
        return true;
    }

    startBonus() { return this.announceBonus(); }

    finishBonus() {
        this.state = GAME_STATE.CHALLENGE;
        this.challengeG = CHALLENGE_G;
        this.bonusStarted = false;
    }

    processBonus() { return false; }
    processArt() { this.artG = Math.max(0, this.artG - 1); if (this.artG <= 0) this.endArt(); }
    processArtAddon() {}
    processSansen() { this.currentG--; if (this.currentG <= 0) this.state = GAME_STATE.ART; }
    processBurst() { this.currentG--; if (this.currentG <= 0) this.state = GAME_STATE.ART; }
    endBurst() { this.state = GAME_STATE.ART; }
    selectBurstTable() { return 'A'; }
    processAttackTime() { this.currentG--; if (this.currentG <= 0) this.state = GAME_STATE.ART; }

    processChallenge() {
        if (this.challengeG <= 0) this.challengeG = CHALLENGE_G;
        this.challengeG--;
        if (this.challengeG <= 0) this.state = GAME_STATE.NORMAL;
    }

    startArt() {
        this.state = GAME_STATE.ART;
        this.artG = ART_INITIAL_G;
        storage.addArt(ART_INITIAL_G);
    }

    endArt() {
        this.artG = 0;
        this.state = GAME_STATE.NORMAL;
    }

    resetSpin() {
        this.state = GAME_STATE.NORMAL;
        this.currentG = 0;
        this.artG = 0;
        this.bet = 0;
        this.result = null;
        this.hintRole = null;
        this.currentRole = null;
        this.payment = 0;
        this.hasBonus = false;
        this.bonusType = null;
        this.bonusPending = false;
        this.bonusCountdown = 0;
        this.bonusSourceRole = null;
        this.fakePrecursorG = 0;
        this.fakePrecursorKind = null;
        this.spinInProgress = false;
        this.pendingPayout = 0;
        this.challengeG = 0;
        this.bonusGameG = 0;
        this.bonusPayout = 0;
        this.bonusStarted = false;
    }

    reset() { this.resetSpin(); this.artStock = 0; this.burstStock = 0; }

    addCredit(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return false;
        this.credit += amount;
        storage.addCredit(amount);
        return true;
    }
}

const game = new SlotGame();

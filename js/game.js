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
        this.inAttackTime = false;
        this.inReverse = false;
        this.burstStock = 0;
        this.challengeG = 0;
        this.pendingPayout = 0;
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

    roll() {
        if (this.state !== GAME_STATE.NORMAL || this.bet <= 0) return false;
        this.currentRole = this.drawRole();
        this.hintRole = this.getHintRole();
        this.payment = this.currentRole.payment || 0;
        this.hasBonus = false;
        this.bonusType = null;
        this.pendingPayout = 0;
        this.checkBonus();
        if (this.hasBonus) {
            this.pendingPayout = this.bonusType === 'BIG' ? BIG_PAYMENT : REG_PAYMENT;
            this.payment = this.pendingPayout;
        }
        return true;
    }

    drawRole() {
        const roles = this.state === GAME_STATE.NORMAL ? NORMAL_ROLES : ART_ROLES;
        const entries = Object.values(roles);
        const totalProb = entries.reduce((sum, role) => sum + role.prob, 0);
        const rand = Math.random() * totalProb;
        let cumProb = 0;
        for (const role of entries) {
            cumProb += role.prob;
            if (rand < cumProb) return role;
        }
        return entries[entries.length - 1];
    }

    getHintRole() {
        const roles = this.state === GAME_STATE.NORMAL ? NORMAL_ROLES : ART_ROLES;
        const values = Object.values(roles);
        return values[Math.floor(Math.random() * values.length)];
    }

    checkBonus() {
        if (!this.currentRole) return;
        const triggerRates = BONUS_TRIGGER_RATES[this.setting];
        let bonusRate = 0;
        if (this.currentRole.name.includes('チャンス目')) bonusRate = triggerRates.CHANCE;
        else if (this.currentRole.name.includes('強チェリー')) bonusRate = triggerRates.STRONG_CHERRY;
        else if (this.currentRole.name.includes('スイカ')) bonusRate = triggerRates.WATERMELON;
        else if (this.currentRole.name.includes('弱チェリー')) bonusRate = triggerRates.WEAK_CHERRY;
        else if (this.currentRole.isLose) bonusRate = triggerRates.LOSE;

        if (Math.random() < bonusRate) {
            this.hasBonus = true;
            this.bonusType = Math.random() < 0.4 ? 'BIG' : 'REG';
        }
    }

    processArt() {
        this.artG = Math.max(0, this.artG - 1);
        this.processArtAddon();
        if (this.artG <= 0) {
            if (this.artStock > 0) {
                this.artStock--;
                this.artG = ART_INITIAL_G;
            } else {
                this.endArt();
            }
        }
    }

    processArtAddon() {
        if (!this.currentRole || this.currentRole.isLose) return;
        const name = this.currentRole.name;
        let info = null;
        if (name.includes('弱チェリー')) info = ART_ADDON_RATES.WEAK_CHERRY;
        else if (name.includes('スイカ')) info = ART_ADDON_RATES.WATERMELON;
        else if (name.includes('強チェリー')) info = ART_ADDON_RATES.STRONG_CHERRY;
        else if (name.includes('チャンス目')) info = ART_ADDON_RATES.CHANCE;
        if (!info || Math.random() >= info.normal) return;
        const table = this.highProbUpGame > 0 ? info.tables.highG : info.tables.normal;
        const rand = Math.random();
        let cum = 0;
        for (const entry of table) {
            cum += entry.prob;
            if (rand < cum) {
                this.artG += entry.add;
                break;
            }
        }
    }

    processSansen() {
        this.currentG--;
        if (this.currentG <= 0) {
            this.state = GAME_STATE.ART;
            this.currentG = 0;
        }
    }

    processBurst() {
        this.currentG--;
        const name = this.currentRole?.name || '';
        if (name.includes('弱チェリー')) this.burstStock++;
        else if (name.includes('強チェリー') || name.includes('チャンス目')) this.burstStock += 2;
        else if (name.includes('ベル') && Math.random() < 0.5) this.burstStock++;
        if (this.currentG <= 0) this.endBurst();
    }

    endBurst() {
        this.state = GAME_STATE.ART;
        this.currentG = 0;
        if (this.burstStock <= 0) {
            this.state = GAME_STATE.REVERSE;
            this.inReverse = true;
            return;
        }
        const table = this.selectBurstTable();
        const amounts = BURST_REWARD_AMOUNTS[table];
        this.artG += amounts[Math.floor(Math.random() * amounts.length)];
    }

    selectBurstTable() {
        const tables = BURST_REWARD_TABLES[Math.min(this.burstStock, 6)];
        const rand = Math.random();
        let cum = 0;
        for (const [table, prob] of Object.entries(tables)) {
            cum += prob;
            if (rand < cum) return table;
        }
        return 'A';
    }

    processAttackTime() {
        if (this.currentG <= 0) return;
        this.currentG--;
        const name = this.currentRole?.name || '';
        let addon = ATTACK_TIME_ADDON.REPLAY;
        if (name.includes('弱チェリー')) addon = ATTACK_TIME_ADDON.WEAK_CHERRY;
        else if (name.includes('強チェリー')) addon = ATTACK_TIME_ADDON.STRONG_CHERRY;
        else if (name.includes('ベル')) addon = ATTACK_TIME_ADDON.BELL_11;
        this.artG += addon;
        if (this.currentG <= 0) {
            this.state = GAME_STATE.ART;
            this.inAttackTime = false;
        }
    }

    processChallenge() {
        if (this.challengeG <= 0) this.challengeG = CHALLENGE_G;
        this.challengeG--;
        if (this.currentRole && Math.random() < (1 / 3)) {
            this.artStock++;
            this.challengeG = 0;
            storage.addChallengeWin();
            this.startArt();
            return;
        }
        if (this.challengeG <= 0) {
            this.state = GAME_STATE.NORMAL;
            this.currentG = 0;
            this.challengeG = 0;
        }
    }

    startBonus() {
        const type = this.bonusType || 'REG';
        this.pendingPayout = type === 'BIG' ? BIG_PAYMENT : REG_PAYMENT;
        this.payment = this.pendingPayout;
        this.hasBonus = false;
        this.state = type === 'BIG' ? GAME_STATE.BONUS_BIG : GAME_STATE.BONUS_REG;
    }

    startArt() {
        this.state = GAME_STATE.ART;
        this.artG = ART_INITIAL_G;
        this.currentG = 0;
        this.inAttackTime = false;
        this.inReverse = false;
        storage.addArt(ART_INITIAL_G);
    }

    endArt() {
        this.artG = 0;
        this.state = GAME_STATE.NORMAL;
        this.currentG = 0;
        this.inAttackTime = false;
        this.inReverse = false;
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
        this.pendingPayout = 0;
        this.challengeG = 0;
        this.inAttackTime = false;
        this.inReverse = false;
    }

    reset() {
        this.resetSpin();
        this.artStock = 0;
        this.burstStock = 0;
    }

    addCredit(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return false;
        this.credit += amount;
        storage.addCredit(amount);
        return true;
    }
}

const game = new SlotGame();

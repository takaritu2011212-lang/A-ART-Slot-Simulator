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

        // 高確管理
        this.highProbUpProb = 0;        // 上乗せ確率高確
        this.highProbUpGame = 0;        // 上乗せゲーム数高確
        this.highProbSansen = 0;        // 参戦高確
        this.highProbZone = 0;          // ゾーン高確

        // 各種フラグ
        this.hasBonus = false;
        this.bonusType = null;
        this.inAttackTime = false;
        this.inReverse = false;
        this.burstStock = 0;
    }

    setSetting(setting) {
        this.setting = setting;
        storage.setSetting(setting);
    }

    bet() {
        this.bet = BET_AMOUNT;
        this.credit -= BET_AMOUNT;
        storage.addGame(BET_AMOUNT, 0);
        return true;
    }

    roll() {
        if (this.bet === 0) return false;

        // 役を抽選
        this.currentRole = this.drawRole();
        this.hintRole = this.getHintRole();
        
        // ボーナス抽選（通常時）
        if (this.state === GAME_STATE.NORMAL) {
            this.checkBonus();
        }

        // 特殊状態の処理
        if (this.state === GAME_STATE.ART) {
            this.processArt();
        } else if (this.state === GAME_STATE.SANSEN) {
            this.processSansen();
        } else if (this.state === GAME_STATE.BURST) {
            this.processBurst();
        } else if (this.state === GAME_STATE.ATTACK_TIME) {
            this.processAttackTime();
        } else if (this.state === GAME_STATE.CHALLENGE) {
            this.processChallenge();
        }

        this.payment = this.currentRole.payment;
        return true;
    }

    drawRole() {
        const roles = this.state === GAME_STATE.NORMAL ? NORMAL_ROLES : ART_ROLES;
        const rand = Math.random();
        let cumProb = 0;

        for (const [key, role] of Object.entries(roles)) {
            cumProb += role.prob;
            if (rand < cumProb) {
                return role;
            }
        }
        return roles.REPLAY;
    }

    getHintRole() {
        const roles = this.state === GAME_STATE.NORMAL ? NORMAL_ROLES : ART_ROLES;
        const roleArray = Object.values(roles);
        return roleArray[Math.floor(Math.random() * roleArray.length)];
    }

    checkBonus() {
        if (this.currentRole.color === 'white') return;

        const triggerRates = BONUS_TRIGGER_RATES[this.setting];
        let bonusRate = 0;

        if (this.currentRole.name.includes('チャンス目')) {
            bonusRate = triggerRates.CHANCE;
        } else if (this.currentRole.name.includes('強チェリー')) {
            bonusRate = triggerRates.STRONG_CHERRY;
        } else if (this.currentRole.name.includes('スイカ')) {
            bonusRate = triggerRates.WATERMELON;
        } else if (this.currentRole.name.includes('弱チェリー')) {
            bonusRate = triggerRates.WEAK_CHERRY;
        } else if (this.currentRole.isLose) {
            bonusRate = triggerRates.LOSE;
        }

        if (Math.random() < bonusRate) {
            this.hasBonus = true;
            this.bonusType = Math.random() < 0.4 ? 'BIG' : 'REG';
        }
    }

    processArt() {
        this.artG--;

        // ボーナス抽選
        if (this.currentRole && !this.currentRole.isLose) {
            this.checkBonus();
        }

        // 参戦ゾーン抽選
        if (Math.random() < SANSEN_TRIGGER_RATES[this.currentRole?.name?.split(' ')[0]] || 0) {
            this.state = GAME_STATE.SANSEN;
            this.currentG = SANSEN_G;
            storage.addSanku();
            return;
        }

        // バースト抽選
        if (Math.random() < BURST_TRIGGER_RATES[this.currentRole?.name?.split(' ')[0]] || 0) {
            this.state = GAME_STATE.BURST;
            this.currentG = BURST_G;
            this.burstStock = 0;
            storage.addBurst();
            return;
        }

        // Attack Time抽選
        if (Math.random() < ATTACK_TIME_TRIGGER_RATES[this.currentRole?.name?.split(' ')[0]] || 0) {
            this.state = GAME_STATE.ATTACK_TIME;
            this.currentG = ATTACK_TIME_G;
            this.inAttackTime = true;
            return;
        }

        // 通常上乗せ
        this.processArtAddon();

        // ART終了判定
        if (this.artG <= 0) {
            if (this.artStock > 0) {
                this.artStock--;
                this.artG = ART_INITIAL_G;
                this.inAttackTime = true;
                this.state = GAME_STATE.ATTACK_TIME;
                this.currentG = ATTACK_TIME_G;
            } else {
                this.endArt();
            }
        }
    }

    processArtAddon() {
        if (!this.currentRole || this.currentRole.isLose) return;

        const roleName = this.currentRole.name;
        let addonInfo = null;

        if (roleName.includes('弱チェリー')) {
            addonInfo = ART_ADDON_RATES.WEAK_CHERRY;
        } else if (roleName.includes('スイカ')) {
            addonInfo = ART_ADDON_RATES.WATERMELON;
        } else if (roleName.includes('強チェリー')) {
            addonInfo = ART_ADDON_RATES.STRONG_CHERRY;
        } else if (roleName.includes('チャンス目')) {
            addonInfo = ART_ADDON_RATES.CHANCE;
        }

        if (!addonInfo) return;

        const hitRate = Math.random() < addonInfo.normal ? true : false;
        if (!hitRate) return;

        const table = this.highProbUpGame > 0 ? addonInfo.tables.highG : addonInfo.tables.normal;
        let cumProb = 0;
        const rand = Math.random();

        for (const entry of table) {
            cumProb += entry.prob;
            if (rand < cumProb) {
                this.artG += entry.add;
                break;
            }
        }
    }

    processSansen() {
        this.currentG--;
        // 参戦ゾーン専用処理（簡略版）
        if (this.currentG <= 0) {
            this.state = GAME_STATE.ART;
            this.currentG = 0;
        }
    }

    processBurst() {
        // バースト中はARTゲーム数を減らさない
        if (this.artG > 0) {
            this.artG--;
        }

        // ストック抽選
        const roleName = this.currentRole?.name || '';
        if (roleName.includes('弱チェリー')) {
            this.burstStock++;
        } else if (roleName.includes('強チェリー')) {
            this.burstStock += 2;
        } else if (roleName.includes('チャンス目')) {
            this.burstStock += 2;
        } else if (roleName.includes('ベル') && Math.random() < 0.5) {
            this.burstStock++;
        }

        this.currentG--;

        if (this.currentG <= 0) {
            this.endBurst();
        }
    }

    endBurst() {
        this.state = GAME_STATE.ART;
        this.currentG = 0;

        if (this.burstStock === 0) {
            this.state = GAME_STATE.REVERSE;
            this.inReverse = true;
        } else {
            // バースト報酬抽選
            const table = this.selectBurstTable();
            const amounts = BURST_REWARD_AMOUNTS[table];
            const reward = amounts[Math.floor(Math.random() * amounts.length)];
            this.artG += reward;
        }
    }

    selectBurstTable() {
        const stockCount = Math.min(this.burstStock, 6);
        const tables = BURST_REWARD_TABLES[stockCount];
        let cumProb = 0;
        const rand = Math.random();

        for (const [table, prob] of Object.entries(tables)) {
            cumProb += prob;
            if (rand < cumProb) {
                return table;
            }
        }
        return 'A';
    }

    processAttackTime() {
        if (this.currentG === 0) return;

        this.currentG--;

        // Attack Time上乗せ
        const roleName = this.currentRole?.name || '';
        let addon = ATTACK_TIME_ADDON.REPLAY;

        if (roleName.includes('弱チェリー')) {
            addon = ATTACK_TIME_ADDON.WEAK_CHERRY;
        } else if (roleName.includes('強チェリー')) {
            addon = ATTACK_TIME_ADDON.STRONG_CHERRY;
        } else if (roleName.includes('ベル')) {
            addon = ATTACK_TIME_ADDON.BELL_11;
        }

        this.artG += addon;

        if (this.currentG <= 0) {
            this.state = GAME_STATE.ART;
            this.inAttackTime = false;
        }
    }

    processChallenge() {
        storage.addChallenge();

        let success = false;
        const roleName = this.currentRole?.name || '';

        if (!this.currentRole.isLose) {
            success = Math.random() < (1/3);
        }

        if (success) {
            this.artStock++;
            storage.addChallengeWin();
            this.startArt();
        } else {
            this.state = GAME_STATE.NORMAL;
            this.currentG = 0;
        }
    }

    startBonus() {
        if (this.bonusType === 'BIG') {
            this.state = GAME_STATE.BONUS_BIG;
            this.payment = BIG_PAYMENT;
            this.credit += BIG_PAYMENT;
            storage.addBig();
            storage.addGame(0, BIG_PAYMENT);

            // Episode Bonus判定
            if (Math.random() < EPISODE_BONUS_RATES[this.setting]) {
                this.startArt();
                storage.addEpisode();
            } else {
                this.state = GAME_STATE.CHALLENGE;
            }
        } else if (this.bonusType === 'REG') {
            this.state = GAME_STATE.BONUS_REG;
            this.payment = REG_PAYMENT;
            this.credit += REG_PAYMENT;
            storage.addReg();
            storage.addGame(0, REG_PAYMENT);

            // REG後のChallenge抽選
            if (Math.random() < REG_CHALLENGE_RATES[this.setting]) {
                this.state = GAME_STATE.CHALLENGE;
            } else {
                this.state = GAME_STATE.NORMAL;
            }
        }

        this.hasBonus = false;
        this.bonusType = null;
    }

    startArt() {
        this.state = GAME_STATE.ART;
        this.artG = ART_INITIAL_G;
        this.state = GAME_STATE.ATTACK_TIME;
        this.currentG = ATTACK_TIME_G;
        this.inAttackTime = true;
        storage.addArt(ART_INITIAL_G);
    }

    endArt() {
        storage.addArt(0);
        this.artG = 0;
        this.state = GAME_STATE.NORMAL;
        this.currentG = 0;
        this.inAttackTime = false;
        this.inReverse = false;
    }

    reset() {
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
        this.artStock = 0;
    }

    addCredit(amount) {
        this.credit += amount;
        storage.loadData();
        this.credit = storage.data.credit;
    }
}

const game = new SlotGame();

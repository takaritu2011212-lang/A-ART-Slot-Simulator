// 画面表示・レンダラー

class Renderer {
    constructor() {
        this.elements = {
            gameState: document.getElementById('gameState'),
            currentG: document.getElementById('currentG'),
            reel1: document.getElementById('reel1'),
            reel2: document.getElementById('reel2'),
            reel3: document.getElementById('reel3'),
            hintBox: document.getElementById('hintBox'),
            resultRole: document.getElementById('resultRole'),
            resultPayment: document.getElementById('resultPayment'),
            betDisplay: document.getElementById('betDisplay'),
            credit: document.getElementById('credit'),
            totalGames: document.getElementById('totalGames'),
            totalBet: document.getElementById('totalBet'),
            totalPayout: document.getElementById('totalPayout'),
            percentage: document.getElementById('percentage'),
            bigCount: document.getElementById('bigCount'),
            regCount: document.getElementById('regCount'),
            artCount: document.getElementById('artCount'),
            artTotalG: document.getElementById('artTotalG'),
            avgArtG: document.getElementById('avgArtG'),
            sankuCount: document.getElementById('sankuCount'),
            burstCount: document.getElementById('burstCount'),
            settingDisplay: document.getElementById('settingDisplay'),
        };
    }

    updateGameState() {
        // 状態バッジ更新
        const stateBadge = this.elements.gameState;
        stateBadge.classList.remove('state-normal', 'state-bonus', 'state-art', 'state-special');

        switch (game.state) {
            case GAME_STATE.NORMAL:
                stateBadge.textContent = '通常時';
                stateBadge.classList.add('state-normal');
                break;
            case GAME_STATE.BONUS_BIG:
                stateBadge.textContent = 'BIG';
                stateBadge.classList.add('state-bonus');
                break;
            case GAME_STATE.BONUS_REG:
                stateBadge.textContent = 'REG';
                stateBadge.classList.add('state-bonus');
                break;
            case GAME_STATE.BONUS_EPISODE:
                stateBadge.textContent = 'EPISODE BONUS';
                stateBadge.classList.add('state-bonus');
                break;
            case GAME_STATE.CHALLENGE:
                stateBadge.textContent = 'Challenge';
                stateBadge.classList.add('state-art');
                break;
            case GAME_STATE.ART:
                stateBadge.textContent = 'ART';
                stateBadge.classList.add('state-art');
                break;
            case GAME_STATE.SANSEN:
                stateBadge.textContent = '参戦ゾーン';
                stateBadge.classList.add('state-special');
                break;
            case GAME_STATE.BURST:
                stateBadge.textContent = 'Burst Mode';
                stateBadge.classList.add('state-special');
                break;
            case GAME_STATE.ATTACK_TIME:
                stateBadge.textContent = 'Attack Time';
                stateBadge.classList.add('state-special');
                break;
            case GAME_STATE.REVERSE:
                stateBadge.textContent = '反転の刻';
                stateBadge.classList.add('state-special');
                break;
        }

        // ゲーム数表示
        const displayG = game.inAttackTime ? game.currentG : game.artG;
        if (displayG > 0) {
            this.elements.currentG.textContent = `残り: ${displayG}G`;
        } else {
            this.elements.currentG.textContent = '残り: --G';
        }
    }

    updateReels() {
        // リール表示（簡略版：役の名前を表示）
        const display = game.currentRole?.name || '---';
        this.elements.reel1.textContent = game.currentRole?.color?.[0] || '-';
        this.elements.reel2.textContent = game.currentRole?.name?.substring(0, 2) || '-';
        this.elements.reel3.textContent = game.currentRole?.payment || '-';
    }

    updateHint() {
        const hintBox = this.elements.hintBox;
        hintBox.classList.remove('hint-white', 'hint-blue', 'hint-yellow', 'hint-green', 
                                   'hint-pink', 'hint-red', 'hint-purple', 'hint-rainbow', 'active');

        if (game.hintRole) {
            const color = game.hintRole.color;
            hintBox.classList.add(`hint-${color}`, 'active');
            hintBox.textContent = `${game.hintRole.name} 示唆`;
        }
    }

    updateResult() {
        if (game.currentRole) {
            this.elements.resultRole.textContent = game.currentRole.name;
            this.elements.resultPayment.textContent = `${game.payment}枚`;

            // 矛盾判定
            if (game.hintRole && game.hintRole.name !== game.currentRole.name) {
                this.elements.resultRole.style.color = '#ff6b6b';
                this.elements.resultRole.textContent += ' 🎯 CHANCE!';
            } else {
                this.elements.resultRole.style.color = '#2a5298';
            }
        }
    }

    updateCredit() {
        this.elements.betDisplay.textContent = `${game.bet * BET_AMOUNT}枚`;
        this.elements.credit.textContent = game.credit;
    }

    updateStats() {
        const stats = storage.getStats();
        this.elements.totalGames.textContent = stats.totalGames;
        this.elements.totalBet.textContent = stats.totalBet;
        this.elements.totalPayout.textContent = stats.totalPayout;
        this.elements.percentage.textContent = `${stats.percentage}%`;
        this.elements.bigCount.textContent = stats.bigCount;
        this.elements.regCount.textContent = stats.regCount;
        this.elements.artCount.textContent = stats.artCount;
        this.elements.artTotalG.textContent = stats.artTotalG;
        this.elements.avgArtG.textContent = `${stats.avgArt}G`;
        this.elements.sankuCount.textContent = stats.sankuCount;
        this.elements.burstCount.textContent = stats.burstCount;
        this.elements.settingDisplay.textContent = stats.setting;
    }

    updateAll() {
        this.updateGameState();
        this.updateReels();
        this.updateHint();
        this.updateResult();
        this.updateCredit();
        this.updateStats();
    }
}

const renderer = new Renderer();

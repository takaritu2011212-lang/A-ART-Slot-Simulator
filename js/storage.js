// データ永続化・管理

class GameStorage {
    constructor() {
        this.STORAGE_KEY = 'aart_game_data';
        this.loadData();
    }

    loadData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            this.data = JSON.parse(data);
        } else {
            this.data = this.getDefaultData();
        }
    }

    getDefaultData() {
        return {
            setting: 1,
            totalGames: 0,
            totalBet: 0,
            totalPayout: 0,
            credit: 0,
            bigCount: 0,
            regCount: 0,
            episodeCount: 0,
            artCount: 0,
            artTotalG: 0,
            sankuCount: 0,
            burstCount: 0,
            challengeCount: 0,
            challengeWinCount: 0,
        };
    }

    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    resetData() {
        this.data = this.getDefaultData();
        this.saveData();
    }

    setSetting(setting) {
        this.data.setting = setting;
        this.saveData();
    }

    addGame(bet, payout) {
        this.data.totalGames++;
        this.data.totalBet += bet;
        this.data.totalPayout += payout;
        this.data.credit += payout - bet;
        this.saveData();
    }

    addCredit(amount) {
        this.data.credit += amount;
        this.saveData();
    }

    addBig() {
        this.data.bigCount++;
        this.saveData();
    }

    addReg() {
        this.data.regCount++;
        this.saveData();
    }

    addEpisode() {
        this.data.episodeCount++;
        this.saveData();
    }

    addArt(g) {
        this.data.artCount++;
        this.data.artTotalG += g;
        this.saveData();
    }

    addSanku() {
        this.data.sankuCount++;
        this.saveData();
    }

    addBurst() {
        this.data.burstCount++;
        this.saveData();
    }

    addChallenge() {
        this.data.challengeCount++;
        this.saveData();
    }

    addChallengeWin() {
        this.data.challengeWinCount++;
        this.saveData();
    }

    getStats() {
        const percentage = this.data.totalBet > 0 
            ? ((this.data.totalPayout / this.data.totalBet) * 100).toFixed(2)
            : '0.00';
        
        const avgArt = this.data.artCount > 0
            ? (this.data.artTotalG / this.data.artCount).toFixed(1)
            : '0.0';

        return {
            totalGames: this.data.totalGames,
            totalBet: this.data.totalBet,
            totalPayout: this.data.totalPayout,
            percentage: percentage,
            credit: this.data.credit,
            bigCount: this.data.bigCount,
            regCount: this.data.regCount,
            episodeCount: this.data.episodeCount,
            artCount: this.data.artCount,
            artTotalG: this.data.artTotalG,
            avgArt: avgArt,
            sankuCount: this.data.sankuCount,
            burstCount: this.data.burstCount,
            setting: this.data.setting,
        };
    }
}

const storage = new GameStorage();

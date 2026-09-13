// メイン・イベントハンドラー

class GameController {
    constructor() {
        this.isSpinning = false;
        this.stoppedReels = new Set();
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialState();
        this.setIdleButtons();
    }

    initializeElements() {
        this.elements = {
            betBtn: document.getElementById('betBtn'), maxBetBtn: document.getElementById('maxBetBtn'), addCreditBtn: document.getElementById('addCreditBtn'),
            startBtn: document.getElementById('startBtn'), stop1Btn: document.getElementById('stop1Btn'), stop2Btn: document.getElementById('stop2Btn'), stop3Btn: document.getElementById('stop3Btn'),
            resetBtn: document.getElementById('resetBtn'), settingSelect: document.getElementById('settingSelect')
        };
    }

    attachEventListeners() {
        this.elements.betBtn.addEventListener('click',()=>this.onBet()); this.elements.maxBetBtn.addEventListener('click',()=>this.onMaxBet());
        this.elements.addCreditBtn.addEventListener('click',()=>this.onAddCredit()); this.elements.startBtn.addEventListener('click',()=>this.onStart());
        this.elements.stop1Btn.addEventListener('click',()=>this.onStop(1)); this.elements.stop2Btn.addEventListener('click',()=>this.onStop(2)); this.elements.stop3Btn.addEventListener('click',()=>this.onStop(3));
        this.elements.resetBtn.addEventListener('click',()=>this.onReset()); this.elements.settingSelect.addEventListener('change',e=>this.onSettingChange(e));
    }

    loadInitialState(){const s=storage.getStats();game.setting=s.setting;game.credit=s.credit;this.elements.settingSelect.value=s.setting;renderer.updateAll();}

    setIdleButtons(){
        const hasBet=game.bet>0;this.elements.betBtn.disabled=hasBet||this.isSpinning;this.elements.maxBetBtn.disabled=hasBet||this.isSpinning;
        this.elements.startBtn.disabled=!hasBet||this.isSpinning;this.elements.stop1Btn.disabled=true;this.elements.stop2Btn.disabled=true;this.elements.stop3Btn.disabled=true;
    }

    onAddCredit(){if(this.isSpinning)return;if(game.addCredit(1000))renderer.updateAll();}

    onBet(){
        if(this.isSpinning||game.state!==GAME_STATE.NORMAL||game.bet>0)return;
        if(!game.placeBet()){alert('クレジット不足です');return;}
        this.elements.betBtn.disabled=true;this.elements.maxBetBtn.disabled=true;this.elements.startBtn.disabled=false;renderer.updateAll();
    }

    onMaxBet(){this.onBet();}

    onStart(){
        if(this.isSpinning||game.bet<=0)return;if(!game.roll())return;
        this.isSpinning=true;this.stoppedReels.clear();
        this.elements.betBtn.disabled=true;this.elements.maxBetBtn.disabled=true;this.elements.startBtn.disabled=true;
        this.elements.stop1Btn.disabled=false;this.elements.stop2Btn.disabled=true;this.elements.stop3Btn.disabled=true;
        renderer.startReels();renderer.startSpinEffect();renderer.updateHint();
    }

    onStop(reelNumber){
        if(!this.isSpinning||this.stoppedReels.has(reelNumber))return;
        if(reelNumber!==1&&!this.stoppedReels.has(1))return;
        this.stoppedReels.add(reelNumber);
        renderer.stopReel(reelNumber);renderer.onReelStopped(reelNumber);this.updateStopButtons();
        if(this.stoppedReels.size===3)this.endSpin();
    }

    updateStopButtons(){
        const first=this.stoppedReels.has(1);this.elements.stop1Btn.disabled=!this.isSpinning||first;
        this.elements.stop2Btn.disabled=!this.isSpinning||!first||this.stoppedReels.has(2);this.elements.stop3Btn.disabled=!this.isSpinning||!first||this.stoppedReels.has(3);
    }

    endSpin(){
        if(!this.isSpinning)return;this.isSpinning=false;renderer.stopAllReels();
        const bet=game.bet,rolePayment=game.currentRole?.payment||0,bonusPayment=game.pendingPayout||0,payout=Math.max(rolePayment,bonusPayment);
        game.credit+=payout;storage.addGame(bet,payout);
        if(game.hasBonus||game.pendingPayout>0){if(game.bonusType==='BIG')storage.addBig();else if(game.bonusType==='REG')storage.addReg();}
        game.bet=0;game.state=GAME_STATE.NORMAL;game.hasBonus=false;game.bonusType=null;game.pendingPayout=0;game.inAttackTime=false;game.inReverse=false;this.stoppedReels.clear();
        this.setIdleButtons();renderer.updateAll();
    }

    onReset(){
        if(!confirm('データをリセットしますか？'))return;renderer.stopAllReels();storage.resetData();game.credit=0;game.reset();this.isSpinning=false;this.stoppedReels.clear();
        this.elements.settingSelect.value=game.setting;this.setIdleButtons();renderer.updateAll();alert('データをリセットしました');
    }

    onSettingChange(e){game.setSetting(parseInt(e.target.value,10));renderer.updateAll();}
}

document.addEventListener('DOMContentLoaded',()=>{window.gameController=new GameController();console.log('A+ART パチスロシミュレーター 起動完了');});

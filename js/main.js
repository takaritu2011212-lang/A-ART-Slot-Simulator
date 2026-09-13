// メイン・イベントハンドラー
class GameController {
    constructor(){this.isSpinning=false;this.stoppedReels=new Set();this.bonusTimer=null;this.challengeTimer=null;this.initializeElements();this.attachEventListeners();this.loadInitialState();this.setIdleButtons();}
    initializeElements(){this.elements={betBtn:document.getElementById('betBtn'),maxBetBtn:document.getElementById('maxBetBtn'),addCreditBtn:document.getElementById('addCreditBtn'),startBtn:document.getElementById('startBtn'),stop1Btn:document.getElementById('stop1Btn'),stop2Btn:document.getElementById('stop2Btn'),stop3Btn:document.getElementById('stop3Btn'),resetBtn:document.getElementById('resetBtn'),settingSelect:document.getElementById('settingSelect')};}
    attachEventListeners(){this.elements.betBtn.addEventListener('click',()=>this.onBet());this.elements.maxBetBtn.addEventListener('click',()=>this.onMaxBet());this.elements.addCreditBtn.addEventListener('click',()=>this.onAddCredit());this.elements.startBtn.addEventListener('click',()=>this.onStart());this.elements.stop1Btn.addEventListener('click',()=>this.onStop(1));this.elements.stop2Btn.addEventListener('click',()=>this.onStop(2));this.elements.stop3Btn.addEventListener('click',()=>this.onStop(3));this.elements.resetBtn.addEventListener('click',()=>this.onReset());this.elements.settingSelect.addEventListener('change',e=>this.onSettingChange(e));}
    loadInitialState(){const s=storage.getStats();game.setting=s.setting;game.credit=s.credit;this.elements.settingSelect.value=s.setting;renderer.updateAll();}
    setIdleButtons(){const hasBet=game.bet>0,locked=game.state!==GAME_STATE.NORMAL||this.isSpinning;this.elements.betBtn.disabled=hasBet||locked;this.elements.maxBetBtn.disabled=hasBet||locked;this.elements.startBtn.disabled=!hasBet||this.isSpinning||game.state!==GAME_STATE.NORMAL;this.elements.stop1Btn.disabled=true;this.elements.stop2Btn.disabled=true;this.elements.stop3Btn.disabled=true;}
    onAddCredit(){if(this.isSpinning||game.state!==GAME_STATE.NORMAL)return;if(game.addCredit(1000))renderer.updateAll();}
    onBet(){if(this.isSpinning||game.state!==GAME_STATE.NORMAL||game.bet>0)return;if(!game.placeBet()){alert('クレジット不足です');return;}this.elements.betBtn.disabled=true;this.elements.maxBetBtn.disabled=true;this.elements.startBtn.disabled=false;renderer.setEffectText('レバーを叩いてください。');renderer.updateAll();}
    onMaxBet(){this.onBet();}
    onStart(){
        if(this.isSpinning||game.bet<=0||game.state!==GAME_STATE.NORMAL)return;
        if(!game.roll())return;
        this.isSpinning=true;this.stoppedReels.clear();
        this.elements.betBtn.disabled=true;this.elements.maxBetBtn.disabled=true;this.elements.startBtn.disabled=true;
        this.elements.stop1Btn.disabled=false;this.elements.stop2Btn.disabled=true;this.elements.stop3Btn.disabled=true;
        renderer.clearResult();renderer.startReels();renderer.startSpinEffect();renderer.updateAll();
    }
    onStop(n){if(!this.isSpinning||this.stoppedReels.has(n))return;if(n!==1&&!this.stoppedReels.has(1))return;this.stoppedReels.add(n);renderer.stopReel(n);renderer.onReelStopped(n);this.updateStopButtons();if(this.stoppedReels.size===3)setTimeout(()=>this.endSpin(),280);}
    updateStopButtons(){const first=this.stoppedReels.has(1);this.elements.stop1Btn.disabled=!this.isSpinning||first;this.elements.stop2Btn.disabled=!this.isSpinning||!first||this.stoppedReels.has(2);this.elements.stop3Btn.disabled=!this.isSpinning||!first||this.stoppedReels.has(3);}

    endSpin(){
        if(!this.isSpinning)return;
        this.isSpinning=false;renderer.stopAllReels();game.spinInProgress=false;
        const bet=game.bet,rolePayment=game.currentRole?.payment||0;
        // 通常役の払出だけをこのゲームで精算。ボーナスは前兆終了時まで内部保持する。
        game.credit+=rolePayment;storage.addGame(bet,rolePayment);
        game.bet=0;this.stoppedReels.clear();

        if(game.bonusPending){
            const announce=game.advanceNormalPresentation();
            if(announce){
                game.announceBonus();
                game.credit+=game.bonusPayout;
                renderer.showBonus(game.bonusType);
                this.setBonusButtons();
                clearTimeout(this.bonusTimer);
                this.bonusTimer=setTimeout(()=>this.finishBonusFlow(),1800);
                renderer.updateAll();
                return;
            }
        }else{
            game.advanceNormalPresentation();
        }

        game.state=GAME_STATE.NORMAL;game.hasBonus=false;game.pendingPayout=0;game.inAttackTime=false;game.inReverse=false;
        this.setIdleButtons();renderer.showNormalResult();renderer.updateAll();
    }

    setBonusButtons(){this.elements.betBtn.disabled=true;this.elements.maxBetBtn.disabled=true;this.elements.startBtn.disabled=true;this.elements.stop1Btn.disabled=true;this.elements.stop2Btn.disabled=true;this.elements.stop3Btn.disabled=true;}
    finishBonusFlow(){if(game.state!==GAME_STATE.BONUS_BIG&&game.state!==GAME_STATE.BONUS_REG)return;game.finishBonus();game.challengeG=CHALLENGE_G;renderer.showChallenge(game.bonusType==='BIG');this.startChallengeDisplay();renderer.updateAll();}
    startChallengeDisplay(){clearInterval(this.challengeTimer);let g=CHALLENGE_G;this.challengeTimer=setInterval(()=>{if(game.state!==GAME_STATE.CHALLENGE){clearInterval(this.challengeTimer);return;}g--;game.challengeG=g;renderer.showChallenge(game.bonusType==='BIG');if(g<=0){clearInterval(this.challengeTimer);if(Math.random()<0.41){game.startArt();renderer.setEffectText('――ART、突入。');}else{game.state=GAME_STATE.NORMAL;game.challengeG=0;game.bonusType=null;renderer.setEffectText('静かな通常時へ戻った。');}game.bet=0;game.pendingPayout=0;this.stoppedReels.clear();this.setIdleButtons();renderer.updateAll();}},500);}
    onReset(){if(!confirm('データをリセットしますか？'))return;clearTimeout(this.bonusTimer);clearInterval(this.challengeTimer);renderer.stopAllReels();storage.resetData();game.credit=0;game.reset();this.isSpinning=false;this.stoppedReels.clear();this.elements.settingSelect.value=game.setting;this.setIdleButtons();renderer.updateAll();alert('データをリセットしました');}
    onSettingChange(e){game.setSetting(parseInt(e.target.value,10));renderer.updateAll();}
}
document.addEventListener('DOMContentLoaded',()=>{window.gameController=new GameController();console.log('A+ART パチスロシミュレーター 起動完了');});

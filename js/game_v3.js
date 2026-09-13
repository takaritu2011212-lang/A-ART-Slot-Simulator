class SlotGameV3 extends SlotGame {
    drawAbsolute(roles){
        let r=Math.random(),c=0;const a=Object.values(roles);
        for(const role of a){c+=role.prob;if(r<c)return role;}
        return roles.LOSE||roles.ART_LOSE||a[a.length-1];
    }
    rollNormal(){
        if(this.state!==GAME_STATE.NORMAL||this.bet<=0)return false;
        this.currentRole=this.drawAbsolute(NORMAL_ROLES);this.hintRole=this.currentRole;this.payment=this.currentRole.payment||0;this.spinInProgress=true;
        this.hasBonus=false;this.bonusType=null;this.pendingPayout=0;this.checkBonusV3();return true;
    }
    checkBonusV3(){
        const r=BONUS_TRIGGER_RATES[this.setting],n=this.currentRole?.name||'';let p=0;
        if(n.includes('チャンス目'))p=r.CHANCE;else if(n.includes('強チェリー'))p=r.STRONG_CHERRY;else if(n.includes('スイカ'))p=r.WATERMELON;else if(n.includes('弱チェリー'))p=r.WEAK_CHERRY;else if(this.currentRole?.isLose)p=r.LOSE;
        if(Math.random()<p){this.bonusPending=true;this.hasBonus=true;this.bonusType=Math.random()<.4?'BIG':'REG';this.bonusCountdown=2+Math.floor(Math.random()*4);this.bonusSourceRole=this.currentRole;this.fakePrecursorG=0;}
        else {let f=n.includes('強チェリー')||n.includes('チャンス目')?.34:n.includes('スイカ')||n.includes('弱チェリー')?.16:.045;if(Math.random()<f)this.fakePrecursorG=2+Math.floor(Math.random()*3);}
    }
    advancePresentation(){
        if(this.bonusPending){this.bonusCountdown--;return this.bonusCountdown<=0;}
        if(this.fakePrecursorG>0){this.fakePrecursorG--;if(this.fakePrecursorG===0)this.fakePrecursorKind=null;}
        return false;
    }
    announceBonusV3(){
        if(!this.bonusPending)return false;this.bonusPayout=this.bonusType==='BIG'?BIG_PAYMENT:REG_PAYMENT;this.bonusPending=false;this.bonusCountdown=0;this.bonusRemaining=this.bonusPayout;this.bonusStarted=true;this.state=this.bonusType==='BIG'?GAME_STATE.BONUS_BIG:GAME_STATE.BONUS_REG;if(this.bonusType==='BIG')storage.addBig();else storage.addReg();return true;
    }
    startBonusSpinV3(){
        if((this.state!==GAME_STATE.BONUS_BIG&&this.state!==GAME_STATE.BONUS_REG)||this.spinInProgress||this.bonusRemaining<=0)return false;
        this.currentRole={name:'押し順ベル',payment:Math.min(BONUS_BELL_PAYMENT,this.bonusRemaining),color:'yellow'};this.hintRole=this.currentRole;this.spinInProgress=true;this.payment=0;return true;
    }
    finishBonusSpinV3(){
        if(!this.spinInProgress)return false;const p=this.currentRole?.payment||0;this.spinInProgress=false;this.credit+=p;storage.addPayout(p);this.bonusRemaining-=p;this.bonusGameG++;
        if(this.bonusRemaining<=0){this.bonusStarted=false;this.state=GAME_STATE.CHALLENGE;this.challengeG=CHALLENGE_G;storage.addChallenge();return'CHALLENGE';}return'BONUS';
    }
    startChallengeSpinV3(){
        if(this.state!==GAME_STATE.CHALLENGE||this.spinInProgress||this.challengeG<=0)return false;const small=Math.random()<CHALLENGE_SMALL_ROLE_PROB;let role;
        if(small){let r=Math.random(),c=0;for(const[k,v]of Object.entries(CHALLENGE_ROLE_RATES)){c+=v;if(r<c){role=NORMAL_ROLES[k];break;}}role=role||NORMAL_ROLES.BELL_3;}else role=Math.random()<.5?NORMAL_ROLES.REPLAY:NORMAL_ROLES.LOSE;
        this.challengeSmall=small;this.currentRole=role;this.hintRole=role;this.spinInProgress=true;this.challengeSuccess=false;this.payment=0;return true;
    }
    finishChallengeSpinV3(){
        if(!this.spinInProgress)return false;this.spinInProgress=false;
        if(this.challengeSmall&&Math.random()<CHALLENGE_SUCCESS_RATE){this.challengeSuccess=true;this.challengeG=0;storage.addChallengeWin();this.startArt();return'ART';}
        this.challengeG--;if(this.challengeG<=0){this.state=GAME_STATE.NORMAL;this.challengeG=0;this.bonusType=null;this.hasBonus=false;return'NORMAL';}return'CHALLENGE';
    }
}
const gameV3=new SlotGameV3();

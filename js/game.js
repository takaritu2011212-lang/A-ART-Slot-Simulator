// ゲームロジック・状態管理

class SlotGame {
    constructor() {
        this.setting=1; this.state=GAME_STATE.NORMAL; this.currentG=0; this.artG=0;
        this.credit=0; this.artStock=0; this.bet=0; this.result=null;
        this.hintRole=null; this.currentRole=null; this.payment=0;
        this.hasBonus=false; this.bonusType=null;
        this.bonusPending=false; this.bonusCountdown=0; this.bonusSourceRole=null;
        this.fakePrecursorG=0; this.fakePrecursorKind=null; this.spinInProgress=false;
        this.inAttackTime=false; this.inReverse=false; this.burstStock=0; this.challengeG=0;
        this.pendingPayout=0; this.bonusGameG=0; this.bonusPayout=0; this.bonusStarted=false;
        this.presentation=null;
    }

    setSetting(setting){ if(setting<1||setting>6)return; this.setting=setting; storage.setSetting(setting); }

    placeBet(){
        if(this.state!==GAME_STATE.NORMAL||this.bet>0||this.credit<BET_AMOUNT)return false;
        this.bet=BET_AMOUNT; this.credit-=BET_AMOUNT; this.payment=0; this.result=null; this.presentation=null; return true;
    }

    roll(){
        if(this.state!==GAME_STATE.NORMAL||this.bet<=0)return false;
        this.currentRole=this.drawRole(); this.hintRole=this.currentRole;
        this.payment=this.currentRole.payment||0; this.result=null; this.hasBonus=false;
        this.bonusType=null; this.pendingPayout=0; this.bonusStarted=false; this.spinInProgress=true;
        this.checkBonus(); return true;
    }

    drawRole(){
        const roles=this.state===GAME_STATE.NORMAL?NORMAL_ROLES:ART_ROLES;
        const entries=Object.values(roles); const totalProb=entries.reduce((s,r)=>s+r.prob,0);
        const rand=Math.random()*totalProb; let cum=0;
        for(const role of entries){cum+=role.prob;if(rand<cum)return role;}
        return entries[entries.length-1];
    }

    getHintRole(){return this.currentRole||null;}

    checkBonus(){
        if(!this.currentRole||this.bonusPending)return;
        const rates=BONUS_TRIGGER_RATES[this.setting]; let rate=0;
        if(this.currentRole.name.includes('チャンス目'))rate=rates.CHANCE;
        else if(this.currentRole.name.includes('強チェリー'))rate=rates.STRONG_CHERRY;
        else if(this.currentRole.name.includes('スイカ'))rate=rates.WATERMELON;
        else if(this.currentRole.name.includes('弱チェリー'))rate=rates.WEAK_CHERRY;
        else if(this.currentRole.isLose)rate=rates.LOSE;
        if(Math.random()<rate){
            this.hasBonus=true; this.bonusPending=true; this.bonusType=Math.random()<0.4?'BIG':'REG';
            this.bonusCountdown=2+Math.floor(Math.random()*4); this.bonusSourceRole=this.currentRole;
            this.pendingPayout=0; this.fakePrecursorG=0; this.fakePrecursorKind=null;
        }else this.startFakePrecursorIfNeeded();
    }

    startFakePrecursorIfNeeded(){
        if(this.bonusPending||this.fakePrecursorG>0)return;
        const n=this.currentRole?.name||''; let chance=0;
        if(n.includes('強チェリー')||n.includes('チャンス目'))chance=0.28;
        else if(n.includes('スイカ')||n.includes('弱チェリー'))chance=0.12;
        else if(Math.random()<0.035)chance=1;
        if(Math.random()<chance){
            this.fakePrecursorG=2+Math.floor(Math.random()*3);
            this.fakePrecursorKind=Math.random()<0.55?'investigate':'notice';
        }
    }

    advanceNormalPresentation(){
        if(this.bonusPending){
            this.bonusCountdown--;
            if(this.bonusCountdown<=0)return true;
        }else if(this.fakePrecursorG>0){
            this.fakePrecursorG--;
            if(this.fakePrecursorG<=0){this.fakePrecursorKind=null;return false;}
        }
        return false;
    }

    announceBonus(){
        if(!this.bonusPending)return false;
        const type=this.bonusType||'REG'; this.bonusPayout=type==='BIG'?BIG_PAYMENT:REG_PAYMENT;
        this.pendingPayout=this.bonusPayout; this.payment=this.bonusPayout; this.bonusPending=false;
        this.bonusCountdown=0; this.bonusStarted=true; this.hasBonus=true; storage.addPayout(this.bonusPayout);
        if(type==='BIG')storage.addBig(); else storage.addReg();
        this.state=type==='BIG'?GAME_STATE.BONUS_BIG:GAME_STATE.BONUS_REG; return true;
    }

    startBonus(){return this.announceBonus();}

    finishBonus(){
        this.state=GAME_STATE.CHALLENGE; this.challengeG=CHALLENGE_G; this.bonusGameG=0; this.bonusStarted=false; this.hasBonus=false;
    }

    processBonus(){if(!this.bonusStarted)return false;this.bonusGameG--;if(this.bonusGameG<=0)this.finishBonus();return true;}

    processArt(){
        this.artG=Math.max(0,this.artG-1); this.processArtAddon();
        if(this.artG<=0){if(this.artStock>0){this.artStock--;this.artG=ART_INITIAL_G;}else this.endArt();}
    }

    processArtAddon(){
        if(!this.currentRole||this.currentRole.isLose)return; const n=this.currentRole.name; let info=null;
        if(n.includes('弱チェリー'))info=ART_ADDON_RATES.WEAK_CHERRY; else if(n.includes('スイカ'))info=ART_ADDON_RATES.WATERMELON;
        else if(n.includes('強チェリー'))info=ART_ADDON_RATES.STRONG_CHERRY; else if(n.includes('チャンス目'))info=ART_ADDON_RATES.CHANCE;
        if(!info||Math.random()>=info.normal)return; const table=(this.highProbUpGame||0)>0?info.tables.highG:info.tables.normal;
        const rand=Math.random();let cum=0;for(const entry of table){cum+=entry.prob;if(rand<cum){this.artG+=entry.add;break;}}
    }

    processSansen(){this.currentG--;if(this.currentG<=0){this.state=GAME_STATE.ART;this.currentG=0;}}
    processBurst(){this.currentG--;const n=this.currentRole?.name||'';if(n.includes('弱チェリー'))this.burstStock++;else if(n.includes('強チェリー')||n.includes('チャンス目'))this.burstStock+=2;else if(n.includes('ベル')&&Math.random()<0.5)this.burstStock++;if(this.currentG<=0)this.endBurst();}
    endBurst(){this.state=GAME_STATE.ART;this.currentG=0;if(this.burstStock<=0){this.state=GAME_STATE.REVERSE;this.inReverse=true;return;}const t=this.selectBurstTable();const a=BURST_REWARD_AMOUNTS[t];this.artG+=a[Math.floor(Math.random()*a.length)];}
    selectBurstTable(){const tables=BURST_REWARD_TABLES[Math.min(this.burstStock,6)];const r=Math.random();let c=0;for(const[t,p]of Object.entries(tables)){c+=p;if(r<c)return t;}return'A';}
    processAttackTime(){if(this.currentG<=0)return;this.currentG--;const n=this.currentRole?.name||'';let a=ATTACK_TIME_ADDON.REPLAY;if(n.includes('弱チェリー'))a=ATTACK_TIME_ADDON.WEAK_CHERRY;else if(n.includes('強チェリー'))a=ATTACK_TIME_ADDON.STRONG_CHERRY;else if(n.includes('ベル'))a=ATTACK_TIME_ADDON.BELL_11;this.artG+=a;if(this.currentG<=0){this.state=GAME_STATE.ART;this.inAttackTime=false;}}

    processChallenge(){
        if(this.challengeG<=0)this.challengeG=CHALLENGE_G; this.challengeG--;
        if(this.currentRole&&Math.random()<(1/3)){this.artStock++;this.challengeG=0;storage.addChallengeWin();this.startArt();return;}
        if(this.challengeG<=0){this.state=GAME_STATE.NORMAL;this.currentG=0;this.challengeG=0;this.bonusType=null;}
    }

    startArt(){this.state=GAME_STATE.ART;this.artG=ART_INITIAL_G;this.currentG=0;this.inAttackTime=false;this.inReverse=false;storage.addArt(ART_INITIAL_G);}
    endArt(){this.artG=0;this.state=GAME_STATE.NORMAL;this.currentG=0;this.inAttackTime=false;this.inReverse=false;}

    resetSpin(){
        this.state=GAME_STATE.NORMAL;this.currentG=0;this.artG=0;this.bet=0;this.result=null;this.hintRole=null;this.currentRole=null;this.payment=0;
        this.hasBonus=false;this.bonusType=null;this.bonusPending=false;this.bonusCountdown=0;this.bonusSourceRole=null;this.fakePrecursorG=0;this.fakePrecursorKind=null;this.spinInProgress=false;
        this.pendingPayout=0;this.challengeG=0;this.inAttackTime=false;this.inReverse=false;this.bonusGameG=0;this.bonusPayout=0;this.bonusStarted=false;this.presentation=null;
    }
    reset(){this.resetSpin();this.artStock=0;this.burstStock=0;}
    addCredit(amount){if(!Number.isFinite(amount)||amount<=0)return false;this.credit+=amount;storage.addCredit(amount);return true;}
}

const game=new SlotGame();

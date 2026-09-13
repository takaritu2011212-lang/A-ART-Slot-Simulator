// 実機風リール・通常時演出・ボーナス前兆表示
class Renderer {
    constructor(){
        this.elements={gameState:document.getElementById('gameState'),currentG:document.getElementById('currentG'),reel1:document.getElementById('reelStrip1'),reel2:document.getElementById('reelStrip2'),reel3:document.getElementById('reelStrip3'),hintBox:document.getElementById('hintBox'),resultRole:document.getElementById('resultRole'),resultPayment:document.getElementById('resultPayment'),betDisplay:document.getElementById('betDisplay'),credit:document.getElementById('credit'),effectText:document.getElementById('演出テキスト'),totalGames:document.getElementById('totalGames'),totalBet:document.getElementById('totalBet'),totalPayout:document.getElementById('totalPayout'),percentage:document.getElementById('percentage'),bigCount:document.getElementById('bigCount'),regCount:document.getElementById('regCount'),artCount:document.getElementById('artCount'),artTotalG:document.getElementById('artTotalG'),avgArtG:document.getElementById('avgArtG'),sankuCount:document.getElementById('sankuCount'),burstCount:document.getElementById('burstCount'),settingDisplay:document.getElementById('settingDisplay')};
        this.reelWindows=[1,2,3].map(i=>this.elements[`reel${i}`].parentElement);this.reelTimers=[null,null,null];this.lastEffectKind='normal';
        this.normalLines=[
            '静かな時間が流れている。','いつもと変わらない一日だ。','蒼生は、何気なく前を見た。','小さな風が、通り抜けた。','遠くで何かの音がした。','気のせいだろうか。','一瞬だけ、視線が止まった。','何もない。そう思った。','店内に、いつもの音が響く。','ただ、時間だけが進んでいく。','ふと、時計を見る。','変わったことは何もない。','どこかで小さな物音がした。','そのまま、静かに時が流れる。','蒼生は気にせず歩き出した。'
        ];
        this.chanceLines=[
            '……今、何か見えなかったか。','ほんの少しだけ、空気が変わった。','視界の端に、妙な違和感。','何かが起こる気配がする。','まだ、はっきりとは分からない。','もう一度、確かめてみよう。','偶然にしては、少し気になる。','静かなままなのが、かえって気になる。'
        ];
        this.strongLines=[
            '何かがおかしい。','さっきと同じ気配がした。','これは、見過ごせない。','もう一度だ。今度は確かに感じた。','空気が変わった。','ここまで続くなら、偶然ではない。','まだ終わっていない。','――何か来る。'
        ];
    }

    pick(a){return a[Math.floor(Math.random()*a.length)];}
    updateGameState(){
        const b=this.elements.gameState;b.classList.remove('state-normal','state-bonus','state-art','state-special');
        const m={NORMAL:['通常時','state-normal'],BONUS_BIG:['BIG','state-bonus'],BONUS_REG:['REG','state-bonus'],BONUS_EPISODE:['EPISODE BONUS','state-bonus'],CHALLENGE:['ART CHALLENGE','state-art'],ART:['ART','state-art'],SANSEN:['参戦ゾーン','state-special'],BURST:['BURST MODE','state-special'],ATTACK_TIME:['ATTACK TIME','state-special'],REVERSE:['反転の刻','state-special']};
        const x=m[game.state]||m.NORMAL;b.textContent=x[0];b.classList.add(x[1]);
        const g=game.state===GAME_STATE.CHALLENGE?game.challengeG:(game.inAttackTime?game.currentG:game.artG);this.elements.currentG.textContent=g>0?`残り: ${g}G`:'残り: --G';
    }

    symbolForRole(role){
        if(!role)return['-','-','-'];const n=role.name||'';
        if(n.includes('BIG'))return['7','7','7'];if(n.includes('REG'))return['BAR','BAR','BAR'];if(n.includes('チャンス'))return['BAR','7','BAR'];
        if(n.includes('強チェリー'))return['7','チェリー','チェリー'];if(n.includes('弱チェリー'))return['BAR','チェリー','チェリー'];
        if(n.includes('スイカ'))return['スイカ','スイカ','スイカ'];if(n.includes('ベル'))return['ベル','ベル','ベル'];if(n.includes('リプレイ'))return['リプ','リプ','リプ'];return['BAR','7','BAR'];
    }
    symbols(){return['7','BAR','ベル','リプ','スイカ','チェリー'];}
    setReelSymbol(i,symbol){const s=this.elements[`reel${i}`];if(!s)return;s.innerHTML=`<div class="reel-symbol">${symbol}</div><div class="reel-symbol">${symbol}</div><div class="reel-symbol">${symbol}</div>`;s.style.transform='translateY(-70px)';}
    startReels(){this.reelWindows.forEach((w,i)=>{w.classList.remove('stopped','stopping');w.classList.add('spinning');clearInterval(this.reelTimers[i]);this.reelTimers[i]=setInterval(()=>{const s=this.elements[`reel${i+1}`],a=this.symbols(),r=()=>a[Math.floor(Math.random()*a.length)];s.innerHTML=`<div class="reel-symbol">${r()}</div><div class="reel-symbol">${r()}</div><div class="reel-symbol">${r()}</div>`;},70);});}
    stopReel(i){const w=this.reelWindows[i-1];if(!w)return;clearInterval(this.reelTimers[i-1]);this.reelTimers[i-1]=null;w.classList.remove('spinning');w.classList.add('stopping');this.setReelSymbol(i,this.symbolForRole(game.currentRole)[i-1]);setTimeout(()=>w.classList.remove('stopping'),240);w.classList.add('stopped');}
    stopAllReels(){[1,2,3].forEach(i=>{clearInterval(this.reelTimers[i-1]);this.reelTimers[i-1]=null;this.reelWindows[i-1].classList.remove('spinning');});}

    clearResult(){this.elements.resultRole.textContent='---';this.elements.resultPayment.textContent='0枚';this.elements.resultRole.style.color='';}
    showNormalResult(){if(!game.currentRole)return;this.elements.resultRole.textContent=game.currentRole.name;this.elements.resultPayment.textContent=`${game.payment||0}枚`;this.elements.resultRole.style.color='';}

    setEffectText(t,kind='normal'){
        const e=this.elements.effectText;if(!e)return;e.classList.remove('flash','effect-normal','effect-chance','effect-strong','effect-bonus');void e.offsetWidth;e.textContent=t;e.classList.add('flash',`effect-${kind}`);this.lastEffectKind=kind;
    }

    presentationKind(){
        if(game.bonusPending){return game.bonusCountdown<=1?'strong':'chance';}
        if(game.fakePrecursorG>0)return game.fakePrecursorG===1?'strong':'chance';
        const n=game.currentRole?.name||'';
        if(n.includes('強チェリー')||n.includes('チャンス目'))return Math.random()<0.45?'chance':'normal';
        if(n.includes('スイカ')||n.includes('弱チェリー'))return Math.random()<0.28?'chance':'normal';
        return 'normal';
    }

    startSpinEffect(){
        const kind=this.presentationKind();
        const line=kind==='strong'?this.pick(this.strongLines):kind==='chance'?this.pick(this.chanceLines):this.pick(this.normalLines);
        this.setEffectText(line,kind);
        this.updateHint();
    }

    onReelStopped(i){
        const kind=this.presentationKind();
        const normal={1:['蒼生は、ふと視線を上げた。','そのまま、静かな時間が続く。'],2:['何かの気配がした。','だが、まだ何も見えない。'],3:['――何事もなく、時が流れた。','――そして、すべてが止まった。']};
        const chance={1:['……何かいる？','一瞬、違和感が走った。'],2:['まだ何かが残っている。','もう一度、同じ気配がした。'],3:['――気のせいではないのかもしれない。','――次の瞬間、何かが起きる。']};
        const strong={1:['――何かが動いた。','確かに、今のは違った。'],2:['まだ終わっていない。','その気配は消えなかった。'],3:[game.bonusPending?'――来る。':'……気のせいか。',game.bonusPending?'――ここからだ。':'――静かな時間に戻った。']};
        const table=kind==='strong'?strong:kind==='chance'?chance:normal;this.setEffectText(this.pick(table[i]),kind);
    }

    showBonus(type){this.setEffectText(type==='BIG'?'――BONUS――  BIG 250枚':'――BONUS――  REG 70枚','bonus');this.elements.resultRole.textContent=type;this.elements.resultPayment.textContent=type==='BIG'?'250枚':'70枚';this.elements.gameState.classList.add('bonus-flash');}
    showChallenge(fromBig){this.setEffectText(fromBig?'最後の5G。ここで運命が決まる。':'5GのART CHALLENGE。小役を引き当てろ。','chance');this.elements.resultRole.textContent='ART CHALLENGE';this.elements.resultPayment.textContent=`${game.challengeG}G`;}

    updateReels(){if(this.reelWindows.some(w=>w.classList.contains('spinning')))return;if(game.currentRole&&!game.spinInProgress)this.symbolForRole(game.currentRole).forEach((s,i)=>this.setReelSymbol(i+1,s));}
    updateHint(){
        const b=this.elements.hintBox;b.classList.remove('hint-white','hint-blue','hint-yellow','hint-green','hint-pink','hint-red','hint-purple','hint-rainbow','active');
        if(game.currentRole){b.classList.add(`hint-${game.currentRole.color}`,'active');
            if(game.bonusPending)b.textContent=game.bonusCountdown<=1?'前兆：強':'前兆：継続';
            else if(game.fakePrecursorG>0)b.textContent='前兆示唆';
            else b.textContent='予告';
        }else b.textContent='';
    }
    updateResult(){if(game.spinInProgress)return;if(game.state===GAME_STATE.BONUS_BIG||game.state===GAME_STATE.BONUS_REG||game.state===GAME_STATE.CHALLENGE)return;if(game.currentRole)this.showNormalResult();}
    updateCredit(){this.elements.betDisplay.textContent=`${game.bet}枚`;this.elements.credit.textContent=game.credit;}
    updateStats(){const s=storage.getStats();this.elements.totalGames.textContent=s.totalGames;this.elements.totalBet.textContent=s.totalBet;this.elements.totalPayout.textContent=s.totalPayout;this.elements.percentage.textContent=`${s.percentage}%`;this.elements.bigCount.textContent=s.bigCount;this.elements.regCount.textContent=s.regCount;this.elements.artCount.textContent=s.artCount;this.elements.artTotalG.textContent=s.artTotalG;this.elements.avgArtG.textContent=`${s.avgArt}G`;this.elements.sankuCount.textContent=s.sankuCount;this.elements.burstCount.textContent=s.burstCount;this.elements.settingDisplay.textContent=s.setting;}
    updateAll(){this.updateGameState();this.updateReels();this.updateHint();this.updateResult();this.updateCredit();this.updateStats();}
}
const renderer=new Renderer();

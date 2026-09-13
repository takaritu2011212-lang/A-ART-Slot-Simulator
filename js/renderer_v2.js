// 実機風リールと段階演出を担当するレンダラー
class Renderer {
    constructor() {
        this.elements = {
            gameState: document.getElementById('gameState'), currentG: document.getElementById('currentG'),
            reel1: document.getElementById('reelStrip1'), reel2: document.getElementById('reelStrip2'), reel3: document.getElementById('reelStrip3'),
            hintBox: document.getElementById('hintBox'), resultRole: document.getElementById('resultRole'), resultPayment: document.getElementById('resultPayment'),
            betDisplay: document.getElementById('betDisplay'), credit: document.getElementById('credit'), effectText: document.getElementById('演出テキスト'),
            totalGames: document.getElementById('totalGames'), totalBet: document.getElementById('totalBet'), totalPayout: document.getElementById('totalPayout'), percentage: document.getElementById('percentage'),
            bigCount: document.getElementById('bigCount'), regCount: document.getElementById('regCount'), artCount: document.getElementById('artCount'), artTotalG: document.getElementById('artTotalG'),
            avgArtG: document.getElementById('avgArtG'), sankuCount: document.getElementById('sankuCount'), burstCount: document.getElementById('burstCount'), settingDisplay: document.getElementById('settingDisplay')
        };
        this.reelWindows=[this.elements.reel1,this.elements.reel2,this.elements.reel3].map(el=>el.parentElement);
        this.reelTimers=[null,null,null];
    }
    updateGameState(){
        const b=this.elements.gameState;b.classList.remove('state-normal','state-bonus','state-art','state-special');
        const m={NORMAL:['通常時','state-normal'],BONUS_BIG:['BIG','state-bonus'],BONUS_REG:['REG','state-bonus'],BONUS_EPISODE:['EPISODE BONUS','state-bonus'],CHALLENGE:['Challenge','state-art'],ART:['ART','state-art'],SANSEN:['参戦ゾーン','state-special'],BURST:['Burst Mode','state-special'],ATTACK_TIME:['Attack Time','state-special'],REVERSE:['反転の刻','state-special']};
        const x=m[game.state]||m.NORMAL;b.textContent=x[0];b.classList.add(x[1]);const g=game.inAttackTime?game.currentG:game.artG;this.elements.currentG.textContent=g>0?`残り: ${g}G`:'残り: --G';
    }
    symbolForRole(role){
        if(!role)return ['-','-','-'];const n=role.name||'';
        if(n.includes('リプレイ'))return ['REPLAY','リプ','REPLAY'];if(n.includes('ベル'))return ['ベル','ベル','ベル'];if(n.includes('スイカ'))return ['スイカ','スイカ','スイカ'];if(n.includes('チェリー'))return ['チェリー','チェリー','チェリー'];if(n.includes('チャンス'))return ['BAR','7','BAR'];if(n.includes('BIG'))return ['7','7','7'];if(n.includes('REG'))return ['BAR','BAR','BAR'];return ['BAR','7','BAR'];
    }
    setReelSymbol(i,symbol){const s=this.elements[`reel${i}`];if(!s)return;s.innerHTML=`<div class="reel-symbol">${symbol}</div><div class="reel-symbol">${symbol}</div><div class="reel-symbol">${symbol}</div>`;s.style.transform='translateY(-70px)';}
    startReels(){
        this.reelWindows.forEach((w,i)=>{w.classList.remove('stopped','stopping');w.classList.add('spinning');clearInterval(this.reelTimers[i]);this.reelTimers[i]=setInterval(()=>{const s=this.elements[`reel${i+1}`],a=['7','BAR','ベル','リプ','スイカ','チェリー'],r=()=>a[Math.floor(Math.random()*a.length)];s.innerHTML=`<div class="reel-symbol">${r()}</div><div class="reel-symbol">${r()}</div><div class="reel-symbol">${r()}</div>`;},85);});
    }
    stopReel(i){const n=i-1,w=this.reelWindows[n];if(!w)return;clearInterval(this.reelTimers[n]);this.reelTimers[n]=null;w.classList.remove('spinning');w.classList.add('stopping');this.setReelSymbol(i,this.symbolForRole(game.currentRole)[n]);setTimeout(()=>w.classList.remove('stopping'),240);w.classList.add('stopped');}
    stopAllReels(){[1,2,3].forEach(i=>this.stopReel(i));}
    setEffectText(t){const e=this.elements.effectText;if(!e)return;e.classList.remove('flash');void e.offsetWidth;e.textContent=t;e.classList.add('flash');}
    startSpinEffect(){const n=game.hintRole?.name||'';let t='いつもと変わらない、静かな時間だった。';if(n.includes('強チェリー')||n.includes('チャンス目'))t='……何かが、いつもと違う。';else if(n.includes('スイカ')||n.includes('弱チェリー'))t='ふと、視界の端に違和感を覚えた。';else if(n.includes('ベル'))t='風が吹いた。';this.setEffectText(t);}
    onReelStopped(i){const strong=game.currentRole?.name?.includes('強チェリー')||game.currentRole?.name?.includes('チャンス目');const t={1:'蒼生は、ふと足を止めた。',2:'その違和感は、まだ消えない。',3:'――その先に、何かがある。'};if(strong){t[2]='もう一度、同じ気配がした。';t[3]='……来る。';}this.setEffectText(t[i]);}
    updateReels(){if(this.reelWindows.some(w=>w.classList.contains('spinning')))return;this.symbolForRole(game.currentRole).forEach((s,i)=>this.setReelSymbol(i+1,s));}
    updateHint(){const b=this.elements.hintBox;b.classList.remove('hint-white','hint-blue','hint-yellow','hint-green','hint-pink','hint-red','hint-purple','hint-rainbow','active');if(game.hintRole){b.classList.add(`hint-${game.hintRole.color}`,'active');b.textContent=`${game.hintRole.name} 示唆`;}}
    updateResult(){if(!game.currentRole)return;this.elements.resultRole.textContent=game.currentRole.name;this.elements.resultPayment.textContent=`${game.payment}枚`;this.elements.resultRole.style.color='#2a5298';}
    updateCredit(){this.elements.betDisplay.textContent=`${game.bet}枚`;this.elements.credit.textContent=game.credit;}
    updateStats(){const s=storage.getStats();this.elements.totalGames.textContent=s.totalGames;this.elements.totalBet.textContent=s.totalBet;this.elements.totalPayout.textContent=s.totalPayout;this.elements.percentage.textContent=`${s.percentage}%`;this.elements.bigCount.textContent=s.bigCount;this.elements.regCount.textContent=s.regCount;this.elements.artCount.textContent=s.artCount;this.elements.artTotalG.textContent=s.artTotalG;this.elements.avgArtG.textContent=`${s.avgArt}G`;this.elements.sankuCount.textContent=s.sankuCount;this.elements.burstCount.textContent=s.burstCount;this.elements.settingDisplay.textContent=s.setting;}
    updateAll(){this.updateGameState();this.updateReels();this.updateHint();this.updateResult();this.updateCredit();this.updateStats();}
}
const renderer=new Renderer();

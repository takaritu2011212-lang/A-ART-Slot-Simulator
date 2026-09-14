class RendererV5 {
    constructor() {
        this.e = {
            gameState:document.getElementById('gameState'), currentG:document.getElementById('currentG'),
            r1:document.getElementById('reelStrip1'), r2:document.getElementById('reelStrip2'), r3:document.getElementById('reelStrip3'),
            role:document.getElementById('resultRole'), pay:document.getElementById('resultPayment'), bet:document.getElementById('betDisplay'),
            credit:document.getElementById('credit'), text:document.getElementById('演出テキスト'), totalGames:document.getElementById('totalGames'),
            totalBet:document.getElementById('totalBet'), totalPayout:document.getElementById('totalPayout'), percentage:document.getElementById('percentage'),
            big:document.getElementById('bigCount'), reg:document.getElementById('regCount'), art:document.getElementById('artCount'),
            artG:document.getElementById('artTotalG'), avg:document.getElementById('avgArtG'), sanku:document.getElementById('sankuCount'),
            burst:document.getElementById('burstCount'), setting:document.getElementById('settingDisplay')
        };
        this.w=[1,2,3].map(i=>this.e['r'+i].parentElement); this.t=[null,null,null];
        this.catalog=this.buildPresentations();
        this.lastPresentation=null;
        this.installDebugStyle();
    }

    installDebugStyle(){
        if(document.getElementById('rendererV5Style'))return;
        const s=document.createElement('style'); s.id='rendererV5Style';
        s.textContent='#aartDebugToggle{position:fixed;right:12px;bottom:12px;z-index:100001;background:#263238;color:#fff;border:1px solid #78909c;border-radius:7px;padding:8px 12px;font:12px monospace;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.35)}#aartDebugToggle.active{background:#b71c1c;border-color:#ef5350}.aart-debug-hidden{display:none!important}';
        document.head.appendChild(s);
    }

    buildPresentations(){
        const C=(t,r)=>({tier:'common',text:t,roles:r});
        const S=(t,r)=>({tier:'strong',text:t,roles:r});
        const P=(t,r)=>({tier:'premium',text:t,roles:r});
        return [
            // ===== 通常演出 60種 =====
            C('青い光が一度だけ揺れた。',['ベル','リプレイ']),
            C('同じ音が二度、重なった気がする。',['リプレイ','ベル']),
            C('軽い金属音。ベルかもしれない。',['ベル']),
            C('視線が中央へ流れた。',['ベル','リプレイ']),
            C('一瞬だけ音が途切れた。',['ハズレ','リプレイ']),
            C('もう一度、という感覚が残った。',['リプレイ']),
            C('静かな繰り返しが始まる。',['リプレイ','ハズレ']),
            C('同じ景色を見たような気がする。',['リプレイ']),
            C('緑が端に残った。',['スイカ','ベル']),
            C('淡い緑の光が横切る。',['スイカ']),
            C('何かが弾けるような気配。',['スイカ','チャンス目']),
            C('緑と青、どちらかが反応した。',['スイカ','ベル']),
            C('赤い点が一つだけ浮かんだ。',['弱チェリー','強チェリー']),
            C('赤い光が端をかすめる。',['弱チェリー','チェリー']),
            C('小さな赤い違和感。',['弱チェリー']),
            C('一瞬だけ赤、その後は静かだ。',['弱チェリー','ハズレ']),
            C('チェリーらしい気配が残った。',['弱チェリー','強チェリー']),
            C('赤か、ただの反射か。',['弱チェリー','ハズレ']),
            C('図柄の間に小さなズレ。',['チャンス目','ハズレ']),
            C('揃わないのに、形だけが気になる。',['チャンス目','ハズレ']),
            C('一つだけ噛み合わない。',['チャンス目']),
            C('視線が図柄の境目で止まった。',['チャンス目','リプレイ']),
            C('何もないはずなのに引っ掛かる。',['チャンス目','ハズレ']),
            C('音と図柄が少しだけずれた。',['チャンス目','リプレイ']),
            C('小さなベル音が先に聞こえた。',['ベル']),
            C('短い音が三つ続いた。',['ベル','リプレイ']),
            C('軽い振動が一度だけ伝わった。',['ベル','ハズレ']),
            C('音だけなら、いつも通りだ。',['ベル','ハズレ']),
            C('静かな一回転。何かを待っている。',['ハズレ','リプレイ']),
            C('時計の針が妙に気になった。',['ハズレ','リプレイ']),
            C('店内の音に一つだけ違う音。',['ベル','ハズレ']),
            C('右側だけが少し明るく見えた。',['スイカ','チェリー']),
            C('左側に淡い色が残った。',['スイカ','弱チェリー']),
            C('中央だけ、妙に静かだ。',['リプレイ','ハズレ']),
            C('赤と緑、どちらかが潜んでいる。',['弱チェリー','スイカ']),
            C('青と緑、どちらかが先に動いた。',['リプレイ','スイカ']),
            C('青と赤、どちらかを見ろ。',['リプレイ','弱チェリー']),
            C('ベルかリプレイ、その程度の違和感。',['ベル','リプレイ']),
            C('ベルかスイカ、色だけが残った。',['ベル','スイカ']),
            C('スイカかチェリー、片方の気配。',['スイカ','弱チェリー']),
            C('赤い気配か、何もないか。',['弱チェリー','ハズレ']),
            C('緑の気配か、何もないか。',['スイカ','ハズレ']),
            C('青い気配か、何もないか。',['リプレイ','ハズレ']),
            C('音の長さがいつもと少し違う。',['ベル','リプレイ']),
            C('一度だけ画面が瞬いた。',['スイカ','弱チェリー']),
            C('視界の端で赤が跳ねた。',['弱チェリー','強チェリー']),
            C('視界の端で緑が跳ねた。',['スイカ','チャンス目']),
            C('図柄を見る前に違和感が来た。',['チャンス目','リプレイ']),
            C('何かを引いたような、引いていないような。',['チャンス目','ハズレ']),
            C('いつもの音。だが一拍だけ長い。',['ベル','ハズレ']),
            C('同じ音が戻ってきた。',['リプレイ']),
            C('静かな再来。',['リプレイ','ハズレ']),
            C('赤いものが一瞬だけ見えた。',['弱チェリー','強チェリー']),
            C('緑のものが一瞬だけ見えた。',['スイカ']),
            C('中央に小さな違和感。',['チャンス目','ベル']),
            C('端から端へ、光が走った。',['スイカ','弱チェリー']),
            C('何も揃わない音がした。',['ハズレ','チャンス目']),
            C('次の一手を促すような音。',['ベル','リプレイ']),
            C('気のせいなら、それで終わる。',['ハズレ','チャンス目']),

            // ===== 強演出 30種 =====
            S('赤い光が三度続けて瞬いた。',['強チェリー','チャンス目']),
            S('一度消えた光が、もう一度戻った。',['強チェリー','チャンス目']),
            S('明らかに長い違和感が残っている。',['強チェリー','チャンス目']),
            S('音が一拍遅れて追いついた。',['チャンス目','リプレイ']),
            S('赤と緑が同時に視界へ入った。',['強チェリー','スイカ']),
            S('図柄が揃う前から答えを急かしている。',['チャンス目','強チェリー']),
            S('左だけが強く反応した。',['強チェリー','弱チェリー']),
            S('中央だけが強く反応した。',['スイカ','チャンス目']),
            S('右だけが強く反応した。',['強チェリー','チャンス目']),
            S('静かなはずなのに、音圧だけが残る。',['強チェリー','チャンス目']),
            S('一度目より二度目のほうが明らかに強い。',['リプレイ','強チェリー']),
            S('同じ違和感が連続した。',['チャンス目','強チェリー']),
            S('赤い光が消えない。',['強チェリー','弱チェリー']),
            S('緑の光が消えない。',['スイカ','チャンス目']),
            S('ベルの音だけが妙に大きく響いた。',['ベル','強チェリー']),
            S('何もない場所で一度だけ停止音がした。',['チャンス目','ハズレ']),
            S('図柄の間隔がいつもと違う。',['チャンス目','強チェリー']),
            S('一つだけ、明らかに場違いな音。',['チャンス目','強チェリー']),
            S('赤、赤、最後だけ無音。',['強チェリー','チャンス目']),
            S('緑、青、そしてもう一度緑。',['スイカ','リプレイ']),
            S('青い光が一瞬で二度走った。',['リプレイ','チャンス目']),
            S('チェリーの気配が弱まらない。',['強チェリー','弱チェリー']),
            S('スイカの気配が一段深くなった。',['スイカ','チャンス目']),
            S('この違和感だけは見逃せない。',['強チェリー','チャンス目']),
            S('三つの音が、最後だけ違った。',['チャンス目','リプレイ']),
            S('揃わない。それでも期待だけが残る。',['チャンス目','強チェリー']),
            S('一度外れたように見えて、気配が戻った。',['強チェリー','チャンス目']),
            S('赤い光のあとに、静寂が来た。',['強チェリー','チャンス目']),
            S('普段なら気にしない音が、今日は気になる。',['強チェリー','スイカ']),
            S('ここだけ、明らかに法則が違う。',['チャンス目','強チェリー']),

            // ===== プレミア・確定レベル 10種 =====
            P('――停止音が、完全に消えた。BONUS。',['BIG','REG']),
            P('――画面の光が一度だけ白く抜けた。BONUS確定。',['BIG','REG']),
            P('――最後の音だけが逆に響いた。BONUS確定。',['BIG','REG']),
            P('――赤と金が同時に走った。BONUS確定。',['BIG','REG']),
            P('――三つ目の停止で、答えが先に見えた。BONUS確定。',['BIG','REG']),
            P('――静寂のあと、BIGの気配。',['BIG']),
            P('――BARの気配だけが残った。REGの気配。',['REG']),
            P('――BONUSの先に、もう一段ある。EPISODE昇格濃厚。',['BIG','REG']),
            P('――通常ではあり得ない光り方。EPISODE昇格濃厚。',['BIG','REG']),
            P('――最後の一瞬だけ、特別な音。EPISODE昇格濃厚。',['BIG','REG'])
        ];
    }

    pick(a){return a[Math.floor(Math.random()*a.length)];}
    roleKey(n){
        if(!n)return 'ハズレ';
        if(n.includes('チャンス目'))return 'チャンス目';
        if(n.includes('強チェリー'))return '強チェリー';
        if(n.includes('弱チェリー'))return '弱チェリー';
        if(n.includes('スイカ'))return 'スイカ';
        if(n.includes('リプレイ'))return 'リプレイ';
        if(n.includes('ベル'))return 'ベル';
        if(n.includes('BIG'))return 'BIG'; if(n.includes('REG'))return 'REG';
        return 'ハズレ';
    }
    weightedPresentation(){
        const normal=this.catalog.filter(x=>x.tier==='common');
        const strong=this.catalog.filter(x=>x.tier==='strong');
        const premium=this.catalog.filter(x=>x.tier==='premium');
        let pool,roll=Math.random();
        if(game.bonusPending && roll<0.02) pool=premium;
        else if(roll<0.18) pool=strong;
        else pool=normal;
        return this.pick(pool);
    }
    presentationResult(p){
        const role=this.roleKey(game.currentRole?.name||'');
        const match=p.roles.includes(role);
        const bonus=game.bonusPending;
        if(p.tier==='premium') return {kind:'bonus',text:p.text,match:true};
        if(match) return {kind:p.tier==='strong'?'strong':'normal',text:p.text,match:true};
        if(bonus && p.tier==='strong') return {kind:'strong',text:p.text+'　――さらに、何かが近い。',match:false};
        return {kind:'chance',text:p.text+'　――法則崩れ。これはチャンス。',match:false};
    }
    setEffectText(text,kind='normal',pointer=null){
        const x=this.e.text;if(!x)return;
        x.classList.remove('flash','effect-normal','effect-chance','effect-strong','effect-bonus');
        void x.offsetWidth;
        if(pointer){const escaped=pointer.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&');x.innerHTML=text.replace(new RegExp(escaped),`<span class="text-hint-${kind}">${pointer}</span>`);}else x.textContent=text;
        x.classList.add('flash','effect-'+kind);
    }
    clearResult(){this.e.role.textContent='---';this.e.pay.textContent='0枚';}
    showNormalResult(){this.updateResult();}
    symbols(){return ['7','BAR','ベル','リプ','スイカ','チェリー'];}
    target(role,i){
        const n=role?.name||'';
        if(n.includes('BIG'))return '7'; if(n.includes('REG'))return 'BAR';
        if(n.includes('ベル'))return 'ベル'; if(n.includes('リプレイ'))return 'リプ';
        if(n.includes('スイカ'))return 'スイカ'; if(n.includes('チェリー'))return 'チェリー';
        if(n.includes('チャンス'))return i===2?'7':'BAR'; return i===2?'7':'BAR';
    }
    setSymbol(i,s){const x=this.e['r'+i];if(!x)return;x.innerHTML=`<div class="reel-symbol">${s}</div><div class="reel-symbol">${s}</div><div class="reel-symbol">${s}</div>`;x.style.transform='translateY(-70px)';}
    startReels(){for(let i=0;i<3;i++){const w=this.w[i],x=this.e['r'+(i+1)];clearInterval(this.t[i]);this.t[i]=null;w.classList.remove('stopped','stopping');x.classList.remove('spinning');x.classList.add('spinning');this.t[i]=setInterval(()=>{const a=this.symbols(),q=()=>a[Math.floor(Math.random()*a.length)];x.innerHTML=`<div class="reel-symbol">${q()}</div><div class="reel-symbol">${q()}</div><div class="reel-symbol">${q()}</div>`;},65);}}
    stopReel(i){const k=i-1;if(k<0||k>2)return;clearInterval(this.t[k]);this.t[k]=null;const w=this.w[k],x=this.e['r'+i];x.classList.remove('spinning');w.classList.add('stopping');this.setSymbol(i,this.target(game.currentRole,i));w.classList.add('stopped');}
    stopAllReels(){for(let i=0;i<3;i++){clearInterval(this.t[i]);this.t[i]=null;this.w[i].classList.remove('spinning','stopping');this.e['r'+(i+1)].classList.remove('spinning');}}
    startSpinEffect(){
        if(game.state!==GAME_STATE.NORMAL){this.setEffectText(game.state===GAME_STATE.CHALLENGE?'5GのART CHALLENGE。小役を引き当てろ。':'ボーナス消化中。','normal');return;}
        const p=this.weightedPresentation(); this.lastPresentation=p; const r=this.presentationResult(p);
        let pointer=null;
        if(r.kind==='chance'||r.kind==='strong'){
            const words=r.text.match(/[一-龠ぁ-んァ-ヶA-Za-z0-9]{2,}/g)||[];
            if(words.length)pointer=this.pick(words);
        }
        this.setEffectText(r.text,r.kind,pointer);
    }
    onReelStopped(i){
        if(!this.lastPresentation){this.startSpinEffect();}
        const p=this.lastPresentation;
        let text;
        if(i===1) text=p.text;
        else if(i===2) text=p.text+'　――まだ続く。';
        else {
            const role=this.roleKey(game.currentRole?.name||'');
            if(game.bonusPending && game.bonusCountdown<=1) text=p.tier==='premium'?p.text:'――最後まで見ろ。BONUSの可能性。';
            else if(!p.roles.includes(role)) text=p.text+'　――法則崩れ、チャンス。';
            else text=p.text+'　――最終確認。';
        }
        const kind=!p.roles.includes(this.roleKey(game.currentRole?.name||''))?'chance':(p.tier==='strong'?'strong':'normal');
        this.setEffectText(text,kind);
    }
    showBonus(type){
        if(type==='BIG')this.setEffectText('――BONUS――　BIG 250枚','bonus');
        else this.setEffectText('――BONUS――　REG 70枚','bonus');
        this.e.role.textContent=type; this.e.pay.textContent=type==='BIG'?'残り250枚':'残り70枚';
    }
    showChallenge(){this.setEffectText('5GのART CHALLENGE。自分で回して引き当てろ。','chance');this.e.role.textContent='ART CHALLENGE';this.e.pay.textContent=`残り${game.challengeG}G`;}
    updateState(){
        const m={NORMAL:['通常時','state-normal'],BONUS_BIG:['BIG','state-bonus'],BONUS_REG:['REG','state-bonus'],CHALLENGE:['ART CHALLENGE','state-art'],ART:['ART','state-art']};
        const x=m[game.state]||['通常時','state-normal']; this.e.gameState.textContent=x[0]; this.e.gameState.className='state-badge '+x[1];
        const g=game.state===GAME_STATE.CHALLENGE?game.challengeG:game.state===GAME_STATE.BONUS_BIG||game.state===GAME_STATE.BONUS_REG?Math.ceil(game.bonusRemaining/Math.max(1,BONUS_BELL_PAYMENT)):game.artG;
        this.e.currentG.textContent=g>0?`残り: ${g}G`:'残り: --G';
    }
    updateResult(){
        if(game.spinInProgress)return;
        if(game.state===GAME_STATE.BONUS_BIG||game.state===GAME_STATE.BONUS_REG){this.e.role.textContent=game.bonusType;this.e.pay.textContent=`残り${game.bonusRemaining}枚`;return;}
        if(game.state===GAME_STATE.CHALLENGE){this.e.role.textContent='ART CHALLENGE';this.e.pay.textContent=`残り${game.challengeG}G`;return;}
        if(game.currentRole){this.e.role.textContent=game.currentRole.name;this.e.pay.textContent=`${game.payment||0}枚`;}
    }
    update(){
        this.updateState();this.updateResult();this.e.bet.textContent=`${game.bet}枚`;this.e.credit.textContent=game.credit;
        const s=storage.getStats(); this.e.totalGames.textContent=s.totalGames;this.e.totalBet.textContent=s.totalBet;this.e.totalPayout.textContent=s.totalPayout;this.e.percentage.textContent=s.percentage+'%';
        this.e.big.textContent=s.bigCount;this.e.reg.textContent=s.regCount;this.e.art.textContent=s.artCount;this.e.artG.textContent=s.artTotalG;this.e.avg.textContent=s.avgArtG+'G';this.e.sanku.textContent=s.sankuCount;this.e.burst.textContent=s.burstCount;this.e.setting.textContent=game.setting;
    }
}
const renderer=new RendererV5();

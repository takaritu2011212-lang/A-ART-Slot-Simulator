class RendererV7 {
    constructor(){
        this.e={gameState:document.getElementById('gameState'),currentG:document.getElementById('currentG'),r1:document.getElementById('reelStrip1'),r2:document.getElementById('reelStrip2'),r3:document.getElementById('reelStrip3'),role:document.getElementById('resultRole'),pay:document.getElementById('resultPayment'),bet:document.getElementById('betDisplay'),credit:document.getElementById('credit'),text:document.getElementById('演出テキスト'),totalGames:document.getElementById('totalGames'),totalBet:document.getElementById('totalBet'),totalPayout:document.getElementById('totalPayout'),percentage:document.getElementById('percentage'),big:document.getElementById('bigCount'),reg:document.getElementById('regCount'),art:document.getElementById('artCount'),artG:document.getElementById('artTotalG'),avg:document.getElementById('avgArtG'),sanku:document.getElementById('sankuCount'),burst:document.getElementById('burstCount'),setting:document.getElementById('settingDisplay')};
        this.w=[1,2,3].map(i=>this.e['r'+i].parentElement);this.t=[null,null,null];this.catalog=this.buildCatalog();this.currentPresentation=null;this.pendingMismatch=false;
    }
    buildCatalog(){
        const C=(text,roles)=>({tier:'common',text,roles}),S=(text,roles)=>({tier:'strong',text,roles}),P=(text,roles)=>({tier:'premium',text,roles});
        const commonBase=[
            ['青い光が一度だけ揺れた。',['ベル','リプレイ']],['同じ音が二度、重なった気がする。',['リプレイ','ベル']],['軽い金属音が残った。',['ベル']],['視線が中央へ流れた。',['ベル','リプレイ']],['一瞬だけ音が途切れた。',['ハズレ','リプレイ']],['もう一度、という感覚が残った。',['リプレイ']],['静かな繰り返しが始まる。',['リプレイ','ハズレ']],['緑が端に残った。',['スイカ','ベル']],['淡い緑の光が横切る。',['スイカ']],['何かが弾けるような気配。',['スイカ','チャンス目']],['赤い点が一つだけ浮かんだ。',['弱チェリー','強チェリー']],['赤い光が端をかすめる。',['弱チェリー','強チェリー']],['小さな赤い違和感。',['弱チェリー']],['一瞬だけ赤、その後は静かだ。',['弱チェリー','ハズレ']],['チェリーらしい気配が残った。',['弱チェリー','強チェリー']],['図柄の間に小さなズレ。',['チャンス目','ハズレ']],['揃わないのに、形だけが気になる。',['チャンス目','ハズレ']],['一つだけ噛み合わない。',['チャンス目']],['視線が図柄の境目で止まった。',['チャンス目','リプレイ']],['何もないはずなのに引っ掛かる。',['チャンス目','ハズレ']]
        ];
        const common=[];commonBase.forEach((x,i)=>{common.push(C(x[0],x[1]));common.push(C(x[0].replace('。','、まだ気のせいかもしれない。'),x[1]));common.push(C(x[0].replace('。','。ただ、少しだけ気になる。'),x[1]));});
        const strong=[
            ['赤い光が三度続けて瞬いた。',['強チェリー','チャンス目']],['一度消えた光が、もう一度戻った。',['強チェリー','チャンス目']],['明らかに長い違和感が残っている。',['強チェリー','チャンス目']],['音が一拍遅れて追いついた。',['チャンス目','リプレイ']],['赤と緑が同時に視界へ入った。',['強チェリー','スイカ']],['図柄が揃う前から答えを急かしている。',['チャンス目','強チェリー']],['左だけが強く反応した。',['強チェリー','弱チェリー']],['中央だけが強く反応した。',['スイカ','チャンス目']],['右だけが強く反応した。',['強チェリー','チャンス目']],['静かなはずなのに、音圧だけが残る。',['強チェリー','チャンス目']],['一度目より二度目のほうが明らかに強い。',['リプレイ','強チェリー']],['同じ違和感が連続した。',['チャンス目','強チェリー']],['赤い光が消えない。',['強チェリー','弱チェリー']],['緑の光が消えない。',['スイカ','チャンス目']],['ベルの音だけが妙に大きく響いた。',['ベル','強チェリー']],['何もない場所で一度だけ停止音がした。',['チャンス目','ハズレ']],['図柄の間隔がいつもと違う。',['チャンス目','強チェリー']],['一つだけ、明らかに場違いな音。',['チャンス目','強チェリー']],['赤、赤、最後だけ無音。',['強チェリー','チャンス目']],['緑、青、そしてもう一度緑。',['スイカ','リプレイ']],['青い光が一瞬で二度走った。',['リプレイ','チャンス目']],['チェリーの気配が弱まらない。',['強チェリー','弱チェリー']],['スイカの気配が一段深くなった。',['スイカ','チャンス目']],['この違和感だけは見逃せない。',['強チェリー','チャンス目']],['三つの音が、最後だけ違った。',['チャンス目','リプレイ']],['揃わない。それでも期待だけが残る。',['チャンス目','強チェリー']],['一度外れたように見えて、気配が戻った。',['強チェリー','チャンス目']],['赤い光のあとに、静寂が来た。',['強チェリー','チャンス目']],['普段なら気にしない音が、今日は気になる。',['強チェリー','スイカ']],['同じ演出なのに、今回は空気が違う。',['チャンス目','強チェリー']]
        ].map(x=>S(x[0],x[1]));
        const premium=[P('停止音が、完全に消えた。BONUS確定。',['BIG','REG']),P('画面の光が一度だけ白く抜けた。BONUS確定。',['BIG','REG']),P('最後の音だけが逆に響いた。BONUS確定。',['BIG','REG']),P('赤と金が同時に走った。BONUS確定。',['BIG','REG']),P('三つ目の停止で、答えが先に見えた。BONUS確定。',['BIG','REG']),P('静寂のあと、BIGだけが残った。',['BIG']),P('BARの気配だけが残った。REG確定級。',['REG']),P('BONUSの先に、もう一段ある。EPISODE昇格濃厚。',['BIG','REG']),P('通常ではあり得ない光り方。EPISODE昇格濃厚。',['BIG','REG']),P('最後の一瞬だけ、特別な音。EPISODE昇格濃厚。',['BIG','REG'])];
        return common.concat(strong,premium);
    }
    pick(a){return a[Math.floor(Math.random()*a.length)];}
    roleKey(n){if(!n)return'ハズレ';if(n.includes('チャンス目'))return'チャンス目';if(n.includes('強チェリー'))return'強チェリー';if(n.includes('弱チェリー'))return'弱チェリー';if(n.includes('スイカ'))return'スイカ';if(n.includes('リプレイ'))return'リプレイ';if(n.includes('ベル'))return'ベル';return'ハズレ';}
    setText(s,kind='normal'){if(!this.e.text)return;this.e.text.className='演出-text '+kind;this.e.text.textContent=s;void this.e.text.offsetWidth;this.e.text.classList.add('flash');}
    isRare(){const n=game.currentRole?.name||'';return n.includes('強チェリー')||n.includes('チャンス目')||n.includes('スイカ')||n.includes('弱チェリー');}
    choosePresentation(){
        const r=Math.random();
        let tier=r<0.30?'strong':'common';
        // プレミアは通常抽選ではほぼ出さず、ボーナス本前兆など重要局面でのみ選ばれる。
        if(game.bonusPending && Math.random()<0.045)tier='premium';
        const list=this.catalog.filter(x=>x.tier===tier);return this.pick(list);
    }
    evaluateLaw(){
        if(!this.currentPresentation||game.state!==GAME_STATE.NORMAL)return;
        const key=this.roleKey(game.currentRole?.name||'');
        if(this.currentPresentation.roles.includes(key))return;
        // 法則ハズレをその場で告知しない。強レア役・本前兆などの重要局面だけ次ゲームへ持ち越す。
        const important=game.bonusPending||key==='強チェリー'||key==='チャンス目'||(this.isRare()&&Math.random()<0.12);
        if(important)this.pendingMismatch=true;
    }
    startSpinEffect(){
        if(this.pendingMismatch){this.pendingMismatch=false;this.currentPresentation=null;this.setText(this.pick(['さっきの回転、何か引っ掛からなかったか。','前の回転だけ、妙に印象に残っている。','今のところ、少しだけ違和感がある。','一つ前の回転が頭から離れない。','何かを見落とした気がする。']),'chance');return;}
        this.currentPresentation=this.choosePresentation();this.setText(this.currentPresentation.text,this.currentPresentation.tier==='strong'?'strong':this.currentPresentation.tier==='premium'?'premium':'normal');
    }
    startReels(){for(let i=0;i<3;i++){clearInterval(this.t[i]);const x=this.e['r'+(i+1)];x.classList.add('spinning');this.t[i]=setInterval(()=>{const a=['7','BAR','ベル','リプ','スイカ','チェリー'];x.innerHTML=`<div class="reel-symbol">${this.pick(a)}</div><div class="reel-symbol">${this.pick(a)}</div><div class="reel-symbol">${this.pick(a)}</div>`;},65);}}
    target(role,i){const n=role?.name||'';if(n.includes('BIG'))return'7';if(n.includes('REG'))return'BAR';if(n.includes('ベル'))return'ベル';if(n.includes('リプレイ'))return'リプ';if(n.includes('スイカ'))return'スイカ';if(n.includes('チェリー'))return'チェリー';if(n.includes('チャンス'))return i===3?'7':'BAR';return i===3?'7':'BAR';}
    stopReel(i){const k=i-1;if(k<0||k>2)return;clearInterval(this.t[k]);this.t[k]=null;const x=this.e['r'+i];x.classList.remove('spinning');const s=this.target(game.currentRole,i);x.innerHTML=`<div class="reel-symbol">${s}</div><div class="reel-symbol">${s}</div><div class="reel-symbol">${s}</div>`;this.w[k].classList.add('stopped');}
    onReelStopped(i){
        // 毎停止で台詞を進めない。強演出の一部だけ、独立した追加変化を低確率で発生させる。
        if(!this.currentPresentation||this.currentPresentation.tier==='common'||Math.random()>0.22)return;
        this.setText(this.pick(i===1?['一瞬だけ、空気が変わった。','まだ何も断定できない。']:i===2?['気配が続いている。','もう少しだけ見ておこう。']:['最後まで、何かが残った。','この回転は少し気になる。']),this.currentPresentation.tier==='premium'?'premium':'strong');
    }
    stopAllReels(){for(let i=0;i<3;i++){clearInterval(this.t[i]);this.t[i]=null;this.w[i].classList.remove('spinning','stopping');this.e['r'+(i+1)].classList.remove('spinning');}}
    clearResult(){this.e.role.textContent='---';this.e.pay.textContent='0枚';}
    showNormalResult(){this.evaluateLaw();this.updateResult();}
    showBonus(type){this.currentPresentation=null;this.setText(type==='BIG'?'BONUS　BIG 250枚':'BONUS　REG 70枚','bonus');this.e.role.textContent=type;this.e.pay.textContent=type==='BIG'?'残り250枚':'残り70枚';}
    showChallenge(){this.currentPresentation=null;this.setText('5G ART CHALLENGE。小役を引き当てろ。','strong');this.e.role.textContent='ART CHALLENGE';this.e.pay.textContent=`残り${game.challengeG}G`;}
    updateState(){const m={NORMAL:['通常時','state-normal'],BONUS_BIG:['BIG','state-bonus'],BONUS_REG:['REG','state-bonus'],BONUS_EPISODE:['EPISODE BONUS','state-bonus'],CHALLENGE:['ART CHALLENGE','state-art'],ART:['ART','state-art'],SANSEN:['参戦ゾーン','state-special'],BURST:['BURST','state-special'],ATTACK_TIME:['ATTACK TIME','state-special'],REVERSE:['反転の刻','state-special']};const x=m[game.state]||m.NORMAL;this.e.gameState.textContent=x[0];this.e.gameState.className='state-badge '+x[1];const g=game.state===GAME_STATE.CHALLENGE?game.challengeG:game.state===GAME_STATE.BONUS_BIG||game.state===GAME_STATE.BONUS_REG?Math.ceil(game.bonusRemaining/Math.max(1,BONUS_BELL_PAYMENT)):game.artG;this.e.currentG.textContent=g>0?`残り: ${g}G`:'残り: --G';}
    updateResult(){if(game.spinInProgress)return;if(game.state===GAME_STATE.BONUS_BIG||game.state===GAME_STATE.BONUS_REG){this.e.role.textContent=game.bonusType;this.e.pay.textContent=`残り${game.bonusRemaining}枚`;return;}if(game.state===GAME_STATE.CHALLENGE){this.e.role.textContent='ART CHALLENGE';this.e.pay.textContent=`残り${game.challengeG}G`;return;}if(game.currentRole){this.e.role.textContent=game.currentRole.name;this.e.pay.textContent=`${game.payment||0}枚`;}}
    update(){this.updateState();this.updateResult();this.e.bet.textContent=`${game.bet}枚`;this.e.credit.textContent=game.credit;const s=storage.getStats();this.e.totalGames.textContent=s.totalGames;this.e.totalBet.textContent=s.totalBet;this.e.totalPayout.textContent=s.totalPayout;this.e.percentage.textContent=s.percentage+'%';this.e.big.textContent=s.bigCount;this.e.reg.textContent=s.regCount;this.e.art.textContent=s.artCount;this.e.artG.textContent=s.artTotalG;this.e.avg.textContent=s.avgArt+'G';this.e.sanku.textContent=s.sankuCount;this.e.burst.textContent=s.burstCount;this.e.setting.textContent=s.setting;}
}
const renderer=new RendererV7();

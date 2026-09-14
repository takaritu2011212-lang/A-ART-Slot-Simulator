(function(){
  function install(){
    const style=document.createElement('style');
    style.id='aart-ui-fixes-style';
    style.textContent=`
      #aartDebugToggle{position:fixed;right:18px;bottom:18px;z-index:100001;min-width:150px;min-height:58px;padding:14px 24px;border:3px solid #fff;border-radius:14px;background:#222;color:#fff;font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.45)}
      #aartDebugToggle.debug-on,#aartDebugToggle.active{background:#b71c1c;transform:scale(1.04)}
      #aartDebugPanel{z-index:100000!important;right:18px!important;bottom:88px!important;width:min(760px,calc(100vw - 36px))!important;max-height:55vh!important;font-size:13px!important}
      #maxBetBtn{min-height:58px;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      #maxBetBtn:not(:disabled){filter:brightness(1.04)}
      .演出-text.effect-precursor{border-color:#ffb300;box-shadow:inset 0 0 30px rgba(255,160,0,.55),0 0 22px rgba(255,180,0,.5);animation:precursorPulse .38s ease-in-out infinite alternate}
      .演出-text.effect-precursor::before{content:'●  ●  ●';position:absolute;top:4px;left:0;right:0;text-align:center;color:#ffd54f;font-size:12px;letter-spacing:12px;animation:precursorDots .5s linear infinite}
      .演出-text.effect-premium{animation:premiumPulse .25s ease-in-out infinite alternate}
      @keyframes precursorPulse{from{transform:scale(1);filter:brightness(1)}to{transform:scale(1.018);filter:brightness(1.28)}}
      @keyframes precursorDots{from{opacity:.35;transform:translateX(-8px)}to{opacity:1;transform:translateX(8px)}}
      @keyframes premiumPulse{from{transform:scale(1);filter:brightness(1)}to{transform:scale(1.035);filter:brightness(1.45)}}
    `;
    document.head.appendChild(style);

    const toggles=[...document.querySelectorAll('#aartDebugToggle')];
    const btn=toggles[0];
    toggles.slice(1).forEach(x=>x.remove());
    const panel=document.getElementById('aartDebugPanel');
    if(btn){btn.classList.add('aart-debug-ready');}

    if(window.__AART_LOG__ && !window.__AART_LOG__._patched){
      const old=window.__AART_LOG__;
      const patched=function(type,message,detail){
        old(type,message,detail);
        const p=document.getElementById('aartDebugPanel');
        const box=document.getElementById('aartDebugLog');
        if(window.__AART_DEBUG__?.enabled && p && box){p.hidden=false;p.scrollTop=p.scrollHeight;box.scrollTop=box.scrollHeight;}
      };
      patched._patched=true;
      window.__AART_LOG__=patched;
    }

    const max=document.getElementById('maxBetBtn');
    if(max){
      max.addEventListener('pointerdown',function(e){
        if(max.disabled)return;
        if(window.gameController && !window.gameController.isSpinning && game.state===GAME_STATE.NORMAL && game.bet===0){
          e.preventDefault();
          window.gameController.bet();
        }
      });
    }

    if(typeof RendererV7!=='undefined'){
      const proto=RendererV7.prototype;
      const roleOf=()=>{
        const n=game.currentRole?.name||'';
        if(n.includes('チャンス目'))return'チャンス目';
        if(n.includes('強チェリー'))return'強チェリー';
        if(n.includes('弱チェリー'))return'弱チェリー';
        if(n.includes('スイカ'))return'スイカ';
        if(n.includes('リプレイ'))return'リプレイ';
        if(n.includes('ベル'))return'ベル';
        return'ハズレ';
      };
      proto.choosePresentation=function(){
        const precursor=!!game.bonusPending || game.fakePrecursorG>0;
        const actual=roleOf();
        const r=Math.random();
        if(precursor){
          const tier=r<0.68?'strong':r<0.88?'premium':'common';
          return this.pick(this.catalog.filter(x=>x.tier===tier));
        }
        const tier=r<0.30?'strong':'common';
        const pool=this.catalog.filter(x=>x.tier===tier);
        const compatible=pool.filter(x=>x.roles.includes(actual));
        const mismatch=pool.filter(x=>!x.roles.includes(actual));
        // 通常時の役違い演出は原則抑える。法則ハズレはレア役など重要局面でだけ意味を持つ。
        if(compatible.length&&mismatch.length){
          const mismatchRate=this.isRare()?0.08:0.02;
          return this.pick(Math.random()<mismatchRate?mismatch:compatible);
        }
        return this.pick(compatible.length?compatible:pool);
      };
      proto.startSpinEffect=function(){
        if(this.pendingMismatch){
          this.pendingMismatch=false;this.currentPresentation=null;
          this.setText(this.pick(['さっきの回転、何か引っ掛からなかったか。','前の回転だけ、妙に印象に残っている。','今のところ、少しだけ違和感がある。','一つ前の回転が頭から離れない。','何かを見落とした気がする。']),'chance');
          return;
        }
        const precursor=!!game.bonusPending || game.fakePrecursorG>0;
        this.currentPresentation=this.choosePresentation();
        let kind=this.currentPresentation.tier==='premium'?'premium':this.currentPresentation.tier==='strong'?'strong':'normal';
        if(precursor) kind='precursor';
        this.setText(this.currentPresentation.text,kind);
      };
      const oldSet=proto.setText;
      proto.setText=function(s,kind='normal'){
        oldSet.call(this,s,kind);
        if(this.e.text && kind==='precursor'){this.e.text.classList.remove('flash');void this.e.text.offsetWidth;this.e.text.classList.add('flash');}
      };
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();

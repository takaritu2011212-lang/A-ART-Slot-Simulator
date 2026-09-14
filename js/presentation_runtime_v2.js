(function(){
'use strict';

function installPresentationRuntime(){
  if(typeof RendererV7==='undefined' || typeof game==='undefined') return false;
  const proto=RendererV7.prototype;
  if(proto.__presentationRuntimeV5) return true;
  proto.__presentationRuntimeV5=true;

  const roleOf=()=>game.currentRole?.name||'ハズレ';
  const isRareRole=()=>/強チェリー|弱チェリー|スイカ|チャンス目/.test(roleOf());
  const isPrelude=()=>!!game.bonusPending || game.fakePrecursorG>0;

  // 「レア役」は個別の役をまとめた共通対応として扱う。
  // それ以外は完全一致のみ。別の役の演出へ逃がさない。
  const matches=(item,role)=>{
    const roles=item?.roles||[];
    if(roles.includes(role)) return true;
    if(roles.includes('レア役') && isRareRole()) return true;
    return false;
  };
  const pick=a=>a.length?a[Math.floor(Math.random()*a.length)]:null;

  proto.choosePresentation=function(){
    if(!this.catalog?.some(x=>x && x.series) && typeof this.buildCatalog==='function'){
      this.catalog=this.buildCatalog();
    }
    const catalog=(this.catalog||[]).filter(x=>x && x.series);
    if(!catalog.length)return null;

    const role=roleOf();
    const rare=isRareRole();
    const prelude=isPrelude();

    // まず「現在の成立役に対応する演出」だけに絞る。
    // ここを最優先にすることで、強チェリーでベル演出などが出ることを防ぐ。
    const matched=catalog.filter(x=>matches(x,role));
    if(!matched.length)return null;

    let pool;

    if(rare){
      // レア役時は対応する通常/強/プレミアの中から選択。
      // プレミアは成立役そのものではなくBONUS濃厚の特殊演出なので、
      // BONUS前兆中またはBONUS成立時だけ許可する。
      if(game.bonusPending){
        pool=matched.filter(x=>x.tier==='premium');
        if(!pool.length)pool=matched.filter(x=>x.tier==='strong');
      }else{
        const r=Math.random();
        const tier=r<0.08?'strong':r<0.48?'strong':'common';
        pool=matched.filter(x=>x.tier===tier);
        if(!pool.length)pool=matched.filter(x=>x.tier==='common'||x.tier==='strong');
      }
    }else if(prelude){
      // 前兆中は対応役の通常/強演出のみ。プレミアはBONUS成立時に限定。
      pool=matched.filter(x=>x.tier!=='premium');
    }else{
      // 通常時は成立役に対応する通常演出のみ。
      pool=matched.filter(x=>x.tier==='common');
    }

    // 対応役の中で選べるものがなければ、同じ役の演出へだけフォールバック。
    if(!pool.length)pool=matched;
    const item=pick(pool);
    if(!item)return null;

    return {
      ...item,
      step:0,
      seriesName:item.series,
      intro:`${item.series}の演出が始まる。`
    };
  };

  proto.startSpinEffect=function(){
    const p=this.choosePresentation();
    this.currentPresentation=p;
    if(!p){
      this.setText('演出準備中……','normal');
      return;
    }
    p.step=0;
    this.setText(`【${p.series}】${p.intro}`,'normal');
  };

  proto.onReelStopped=function(i){
    const p=this.currentPresentation;
    if(!p)return;

    // 1回の回転で選ばれた演出法則を固定し、停止順だけを進行させる。
    p.step=Math.min(p.step+1,3);
    let text;
    if(p.step===1){
      text=p.text;
    }else if(p.step===2){
      text=`${p.text}　まだ、この先がある。`;
    }else{
      text=`${p.text}　――最後まで確認しよう。`;
    }
    const kind=p.tier==='premium'?'premium':p.tier==='strong'?'strong':'normal';
    this.setText(`【${p.series}】${text}`,kind);
  };

  const oldShowNormalResult=proto.showNormalResult;
  proto.showNormalResult=function(){
    if(this.currentPresentation)this.currentPresentation.step=99;
    return oldShowNormalResult.call(this);
  };

  return true;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installPresentationRuntime);
else installPresentationRuntime();
})();

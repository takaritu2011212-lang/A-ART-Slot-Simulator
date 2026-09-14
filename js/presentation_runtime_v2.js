(function(){
'use strict';

function installPresentationRuntime(){
  if(typeof RendererV7==='undefined' || typeof game==='undefined') return false;
  const proto=RendererV7.prototype;
  if(proto.__presentationRuntimeV4) return true;
  proto.__presentationRuntimeV4=true;

  const roleOf=()=>game.currentRole?.name||'ハズレ';
  const isRareRole=()=>/強チェリー|弱チェリー|スイカ|チャンス目/.test(roleOf());
  const isPrelude=()=>!!game.bonusPending || game.fakePrecursorG>0;
  const matches=(item,role)=>{
    const roles=item?.roles||[];
    return roles.includes(role) || (roles.includes('レア役') && isRareRole());
  };
  const pick=a=>a.length?a[Math.floor(Math.random()*a.length)]:null;

  proto.choosePresentation=function(){
    if(!this.catalog?.some(x=>x && x.series) && typeof this.buildCatalog==='function'){
      this.catalog=this.buildCatalog();
    }
    const catalog=(this.catalog||[]).filter(x=>x && x.series);
    if(!catalog.length)return null;

    const rare=isRareRole();
    const prelude=isPrelude();
    let pool;
    if(rare){
      const r=Math.random();
      const tier=r<0.08?'premium':r<0.48?'strong':'common';
      pool=catalog.filter(x=>x.tier===tier && matches(x,roleOf()));
    }else if(prelude){
      pool=catalog.filter(x=>x.tier!=='premium' && matches(x,roleOf()));
    }else{
      pool=catalog.filter(x=>x.tier==='common' && matches(x,roleOf()));
    }
    if(!pool.length)pool=catalog.filter(x=>x.tier==='common' && matches(x,roleOf()));
    if(!pool.length)pool=catalog.filter(x=>x.tier==='common');

    const item=pick(pool);
    if(!item)return null;

    // 1回の回転で選ばれた「法則」は最後まで固定する。
    // 別の段階の法則へ勝手に飛ばすと、対応役と示唆が破綻するため、
    // 停止ボタンでは同じパターンの進行だけを表示する。
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

    // 停止1～3で明示的に1段ずつ進む。タイマーやsetTextでは進めない。
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

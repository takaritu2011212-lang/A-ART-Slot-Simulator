(function(){
'use strict';

function installPresentationRuntime(){
  if(typeof RendererV7==='undefined' || typeof game==='undefined') return false;
  const proto=RendererV7.prototype;
  if(proto.__presentationRuntimeV3) return true;
  proto.__presentationRuntimeV3=true;

  const roleOf=()=>game.currentRole?.name||'ハズレ';
  const isRareRole=()=>/強チェリー|弱チェリー|スイカ|チャンス目/.test(roleOf());
  const isPrelude=()=>!!game.bonusPending || game.fakePrecursorG>0;
  const matches=(item,role)=>{
    const roles=item?.roles||[];
    return roles.includes(role) || (roles.includes('レア役') && isRareRole());
  };
  const pick=a=>a.length?a[Math.floor(Math.random()*a.length)]:null;

  proto.choosePresentation=function(){
    // presentation_system_v1.js は RendererV7 の生成後に buildCatalog を差し替えるため、
    // ここで古いカタログを検出したら必ず再構築する。
    if(!this.catalog?.some(x=>x && x.series) && typeof this.buildCatalog==='function'){
      this.catalog=this.buildCatalog();
    }

    const catalog=this.catalog||[];
    const valid=catalog.filter(x=>x && x.series);
    if(!valid.length) return null;

    const rare=isRareRole();
    const prelude=isPrelude();
    let pool;
    if(rare){
      const r=Math.random();
      const tier=r<0.08?'premium':r<0.48?'strong':'common';
      pool=valid.filter(x=>x.tier===tier && matches(x,roleOf()));
    }else if(prelude){
      pool=valid.filter(x=>x.tier!=='premium' && matches(x,roleOf()));
    }else{
      pool=valid.filter(x=>x.tier==='common' && matches(x,roleOf()));
    }

    if(!pool.length) pool=valid.filter(x=>x.tier==='common' && matches(x,roleOf()));
    if(!pool.length) pool=valid.filter(x=>x.tier==='common');

    const item=pick(pool);
    if(!item) return null;

    const series=valid
      .filter(x=>x.series===item.series)
      .sort((a,b)=>(a.index||0)-(b.index||0));
    const compatible=series.filter(x=>matches(x,roleOf()));
    const route=[];
    const add=x=>{if(x && !route.some(y=>y.index===x.index))route.push(x);};
    add(item);
    compatible.forEach(add);
    series.forEach(add);

    return {
      ...item,
      step:0,
      steps:route.slice(0,5),
      intro:`${item.series}の演出が始まる。`,
      seriesName:item.series
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
    if(!p) return;
    p.step=Math.min(p.step+1,p.steps.length);
    const stage=p.steps[p.step-1]||p.steps[p.steps.length-1]||p;
    const kind=stage.tier==='premium'?'premium':stage.tier==='strong'?'strong':'normal';
    this.setText(`【${p.series}】${stage.text}`,kind);
  };

  const oldShowNormalResult=proto.showNormalResult;
  proto.showNormalResult=function(){
    if(this.currentPresentation) this.currentPresentation.step=99;
    return oldShowNormalResult.call(this);
  };

  return true;
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installPresentationRuntime);
else installPresentationRuntime();
})();

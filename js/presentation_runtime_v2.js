(function(){
'use strict';

function installPresentationRuntime(){
  if(typeof RendererV7==='undefined' || !window.game) return false;
  const proto=RendererV7.prototype;
  if(proto.__presentationRuntimeV2) return true;
  proto.__presentationRuntimeV2=true;

  const roleOf=()=>game.currentRole?.name||'';
  const isRareRole=()=>/強チェリー|弱チェリー|スイカ|チャンス目/.test(roleOf());
  const isPrelude=()=>!!game.bonusPending || game.fakePrecursorG>0;
  const matches=(item,role)=>{
    const roles=item?.roles||[];
    if(roles.includes(role)) return true;
    return roles.includes('レア役') && /強チェリー|弱チェリー|スイカ|チャンス目/.test(role);
  };
  const compatible=(pool)=>pool.filter(x=>matches(x,roleOf()));
  const pick=a=>a.length?a[Math.floor(Math.random()*a.length)]:null;

  proto.choosePresentation=function(){
    const rare=isRareRole();
    const prelude=isPrelude();
    let allowed;
    if(rare||prelude){
      const r=Math.random();
      const tier=r<0.16?'premium':r<0.72?'strong':'normal';
      allowed=this.catalog.filter(x=>x.tier===tier && matches(x,roleOf()));
      if(!allowed.length) allowed=this.catalog.filter(x=>x.tier!=='premium' && matches(x,roleOf()));
    }else{
      allowed=this.catalog.filter(x=>x.tier==='common' && matches(x,roleOf()));
    }
    if(!allowed.length) allowed=this.catalog.filter(x=>x.tier==='common');
    const item=pick(allowed);
    if(!item) return null;

    const seriesItems=this.catalog.filter(x=>x.series===item.series);
    const sameSeries=compatible(seriesItems);
    const route=[];
    if(item) route.push(item);
    for(const x of sameSeries){
      if(route.length>=3) break;
      if(!route.some(y=>y.text===x.text)) route.push(x);
    }
    return {
      ...item,
      index:item.index||1,
      step:0,
      steps:route,
      intro:`${item.series}の演出が始まる。${item.law||''}`
    };
  };

  proto.startSpinEffect=function(){
    const p=this.choosePresentation();
    this.currentPresentation=p;
    if(!p) return;
    p.step=0;
    this.setText(`【${p.series}】${p.intro}`,'normal');
  };

  proto.onReelStopped=function(i){
    const p=this.currentPresentation;
    if(!p) return;
    p.step=Math.min(p.step+1,3);
    const route=p.steps||[];
    let text;
    if(p.step===1){
      text=`【${p.series}】${p.law||'気配を追う。'}`;
    }else if(p.step===2){
      const x=route[0]||p;
      text=`【${p.series}】${x.text}`;
    }else{
      const x=route[Math.min(1,route.length-1)]||route[0]||p;
      text=`【${p.series}】${x.text}`;
    }
    const kind=p.tier==='premium'?'premium':p.tier==='strong'?'strong':'normal';
    this.setText(text,kind);
  };

  const oldShowNormalResult=proto.showNormalResult;
  proto.showNormalResult=function(){
    if(this.currentPresentation) this.currentPresentation.step=4;
    return oldShowNormalResult.call(this);
  };

  return true;
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installPresentationRuntime);
else installPresentationRuntime();
})();

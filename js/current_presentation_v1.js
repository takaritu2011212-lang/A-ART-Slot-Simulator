(function(){
'use strict';

function installCurrentPresentation(){
  if(typeof RendererV7==='undefined') return false;
  if(RendererV7.prototype.__currentPresentationPatchedV2) return true;

  const proto=RendererV7.prototype;
  const originalSetText=proto.setText;
  if(typeof originalSetText!=='function') return false;
  proto.__currentPresentationPatchedV2=true;

  const style=document.createElement('style');
  style.textContent=`
    #aartCurrentPresentation{margin:8px auto 0;width:min(760px,92vw);padding:8px 12px;box-sizing:border-box;border:1px solid #777;border-radius:8px;background:#20242a;color:#fff;text-align:center;font-size:14px;font-weight:700;line-height:1.4}
    #aartCurrentPresentation .label{opacity:.72;margin-right:6px;font-weight:600}
    #aartCurrentPresentation .name{letter-spacing:.03em}
  `;
  document.head.appendChild(style);

  const text=document.getElementById('演出テキスト');
  if(!text||!text.parentElement)return false;
  let box=document.getElementById('aartCurrentPresentation');
  if(!box){
    box=document.createElement('div');
    box.id='aartCurrentPresentation';
    box.innerHTML='<span class="label">現在の演出</span><span class="name">待機中</span>';
    text.parentElement.insertBefore(box,text.nextSibling);
  }

  function updateBox(renderer){
    const name=box.querySelector('.name');
    if(!name)return;
    const p=renderer.currentPresentation;
    name.textContent=p?.seriesName||p?.series||'なし';
  }

  proto.setText=function(s,kind='normal'){
    originalSetText.call(this,s,kind);
    updateBox(this);
  };

  // setTextを通らずcurrentPresentationだけ変更された場合にも更新できるようにする。
  proto.updateCurrentPresentationBox=function(){updateBox(this);};
  updateBox({currentPresentation:null});
  return true;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installCurrentPresentation);
else installCurrentPresentation();
})();

(function(){
'use strict';
function install(){
  if(typeof game==='undefined'||typeof GameControllerV3==='undefined') return;
  const style=document.createElement('style');
  style.textContent=`
    #aartTestControls{margin:14px auto 0;width:min(760px,92vw);padding:12px;box-sizing:border-box;border:1px solid #666;border-radius:10px;background:#181b20}
    #aartTestControls .title{font-weight:800;margin-bottom:8px}
    #aartTestControls .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    #aartTestControls select,#aartTestControls button{min-height:42px;padding:8px 12px;border-radius:7px;border:1px solid #777;background:#292d33;color:#fff;font-weight:700}
    #aartTestControls button{cursor:pointer}
    #aartTestControls button.active{background:#9b1c1c}
    #aartForceStatus{font-size:12px;opacity:.8;margin-top:7px}
  `;
  document.head.appendChild(style);
  const target=document.getElementById('aartCurrentPresentation')?.parentElement||document.querySelector('.reel-machine')?.parentElement;
  if(!target)return;
  const box=document.createElement('div');box.id='aartTestControls';
  box.innerHTML=`<div class="title">強制・オート</div><div class="row"><select id="aartForceRole"><option value="">次回役を固定しない</option><option value="LOSE">ハズレ</option><option value="BELL_3">3枚ベル</option><option value="REPLAY">リプレイ</option><option value="WATERMELON">スイカ</option><option value="WEAK_CHERRY">弱チェリー</option><option value="STRONG_CHERRY">強チェリー</option><option value="CHANCE">チャンス目</option></select><button id="aartForceOnce">次回だけ固定</button><button id="aartAuto">オート回転 OFF</button></div><div id="aartForceStatus">テスト機能。通常の抽選確率・統計仕様は変更しません。</div>`;
  target.insertBefore(box,target.firstChild);

  const originalRoll=game.rollNormal.bind(game);
  game.rollNormal=function(){
    const key=this.__forcedRoleKey;
    if(key && NORMAL_ROLES[key]){
      this.__forcedRoleKey=null;
      const originalDraw=this.draw;
      this.draw=()=>NORMAL_ROLES[key];
      try{return originalRoll();}finally{this.draw=originalDraw;}
    }
    return originalRoll();
  };

  const select=box.querySelector('#aartForceRole');
  const once=box.querySelector('#aartForceOnce');
  const auto=box.querySelector('#aartAuto');
  const status=box.querySelector('#aartForceStatus');
  once.addEventListener('click',()=>{
    const key=select.value;
    if(!key){status.textContent='固定する役を選択してください。';return;}
    game.__forcedRoleKey=key;
    status.textContent=`次の通常時1Gを「${NORMAL_ROLES[key].name}」に固定します。`;
  });

  let autoTimer=null,autoStopping=false;
  function stopAuto(){
    if(autoTimer){clearInterval(autoTimer);autoTimer=null;}
    autoStopping=false;auto.classList.remove('active');auto.textContent='オート回転 OFF';
  }
  function autoSpin(){
    if(game.state!==GAME_STATE.NORMAL||!window.gameController)return;
    const c=window.gameController;
    if(c.isSpinning)return;
    if(game.bet===0){
      c.bet();
      if(game.bet===0)return;
    }
    c.start();
    setTimeout(()=>c.stop(1),170);
    setTimeout(()=>c.stop(2),310);
    setTimeout(()=>c.stop(3),450);
  }
  auto.addEventListener('click',()=>{
    if(autoTimer){stopAuto();return;}
    auto.classList.add('active');auto.textContent='オート回転 ON';
    autoSpin();
    autoTimer=setInterval(autoSpin,850);
  });
  window.addEventListener('beforeunload',stopAuto);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

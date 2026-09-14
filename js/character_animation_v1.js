/* A+ART Character Animation v1
 * Prototype: 大塚蒼生 / 山中和也 only.
 * Missing character assets automatically fall back to /404.png.
 */
(function(){
  'use strict';

  const FALLBACK = '404.png';
  const BASE = 'assets/characters/';
  const CHARACTERS = {
    otsuka: { name:'大塚蒼生', dir:BASE+'otsuka/', files:{normal:'normal.png',talk:'talk.png',sit:'sit.png',walk:'walk.png',walk2:'walk2.png',serious:'serious.png',dagger:'dagger.png',daggerAction:'dagger_action.png'} },
    yamanaka: { name:'山中和也', dir:BASE+'yamanaka/', files:{normal:'normal.png',walk:'walk.png',walk2:'walk2.png',talk:'talk.png',serious:'serious.png',sit:'sit.png',sword:'sword.png',guard:'guard.png'} }
  };

  let root=null, slots={}, walkTimer=null, currentMode='normal', step=0;

  function log(type,message){ if(window.__AART_LOG__) window.__AART_LOG__(type,message); }

  function injectStyles(){
    if(document.getElementById('aartCharacterAnimationStyle')) return;
    const style=document.createElement('style');
    style.id='aartCharacterAnimationStyle';
    style.textContent=`
#aartCharacterStage{margin:18px auto 8px;max-width:760px;padding:10px 14px 14px;background:linear-gradient(180deg,#202020,#101010);border:2px solid #444;border-radius:8px;box-shadow:inset 0 0 18px rgba(0,0,0,.65),0 4px 12px rgba(0,0,0,.2);overflow:hidden}
.aart-character-header{text-align:center;color:#bbb;font-size:.82em;letter-spacing:.12em;margin-bottom:5px}
.aart-character-pair{display:flex;align-items:flex-end;justify-content:center;gap:26px;min-height:245px;padding:8px 10px 0;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,0));border-radius:5px}
.aart-character-slot{width:46%;max-width:310px;min-height:225px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative;transition:transform .18s ease,filter .18s ease}
.aart-character-name{font-size:.8em;font-weight:bold;color:#ddd;margin-bottom:3px;text-shadow:0 2px 3px #000}
.aart-character-stage{width:100%;height:205px;display:flex;align-items:flex-end;justify-content:center;position:relative;overflow:hidden}
.aart-character-stage::after{content:'';position:absolute;bottom:2px;left:15%;right:15%;height:9px;border-radius:50%;background:rgba(0,0,0,.5);filter:blur(4px);pointer-events:none}
.aart-character-image{display:block;max-width:100%;height:200px;width:auto;object-fit:contain;image-rendering:auto;position:relative;z-index:2;filter:drop-shadow(0 3px 2px rgba(0,0,0,.45));transform-origin:50% 100%;transition:opacity .12s ease,transform .16s ease,filter .16s ease}
.aart-character-slot.character-walk .aart-character-image{animation:aartCharacterStep .26s ease-in-out infinite alternate}
.aart-character-slot.character-talk .aart-character-image{animation:aartCharacterTalk .55s ease-in-out infinite}
.aart-character-slot.character-serious .aart-character-image{filter:drop-shadow(0 3px 2px rgba(0,0,0,.55)) brightness(.92);transform:scale(1.015)}
.aart-character-slot.character-battle .aart-character-image{animation:aartCharacterBattle .7s ease-in-out infinite}
.aart-character-slot.character-action .aart-character-image{animation:aartCharacterAction .3s ease-out 1}
.aart-character-slot.character-enter{animation:aartCharacterEnter .25s ease-out}
@keyframes aartCharacterStep{from{transform:translateY(0) translateX(-2px)}to{transform:translateY(-2px) translateX(2px)}}
@keyframes aartCharacterTalk{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px) scale(1.006)}}
@keyframes aartCharacterBattle{0%,100%{transform:translateX(0) rotate(0)}50%{transform:translateX(2px) rotate(.6deg)}}
@keyframes aartCharacterAction{0%{transform:translateX(18px) scale(.98);opacity:.65}100%{transform:translateX(0) scale(1);opacity:1}}
@keyframes aartCharacterEnter{from{transform:translateY(8px);opacity:.2}to{transform:translateY(0);opacity:1}}
@media(max-width:768px){#aartCharacterStage{margin-top:12px}.aart-character-pair{gap:8px;min-height:205px;padding:4px}.aart-character-slot{min-height:190px}.aart-character-stage{height:175px}.aart-character-image{height:170px}.aart-character-name{font-size:.72em}}
`;
    document.head.appendChild(style);
  }

  function asset(character,key){ const c=CHARACTERS[character]; return c ? c.dir+(c.files[key]||FALLBACK) : FALLBACK; }

  function makeSlot(character){
    const c=CHARACTERS[character], wrap=document.createElement('div');
    wrap.className='aart-character-slot'; wrap.dataset.character=character;
    wrap.innerHTML='<div class="aart-character-name"></div><div class="aart-character-stage"><img class="aart-character-image" alt=""></div>';
    wrap.querySelector('.aart-character-name').textContent=c.name;
    const img=wrap.querySelector('img'); img.alt=c.name;
    img.addEventListener('error',function(){
      if(img.dataset.fallbackApplied==='1') return;
      img.dataset.fallbackApplied='1'; img.src=FALLBACK;
    });
    slots[character]={wrap,img}; return wrap;
  }

  function create(){
    injectStyles();
    if(root || !document.querySelector('.game-section')) return;
    root=document.createElement('div'); root.id='aartCharacterStage';
    root.innerHTML='<div class="aart-character-header">キャラクター演出</div><div class="aart-character-pair"></div>';
    const pair=root.querySelector('.aart-character-pair'); pair.appendChild(makeSlot('otsuka')); pair.appendChild(makeSlot('yamanaka'));
    const reel=document.querySelector('.reel-machine');
    if(reel&&reel.parentNode) reel.parentNode.insertBefore(root,reel); else document.querySelector('.game-section').appendChild(root);
    setMode('normal'); log('CHARACTER','character stage initialized');
  }

  function setImage(character,key,extraClass){
    const s=slots[character]; if(!s) return;
    s.img.dataset.fallbackApplied='0'; s.img.src=asset(character,key);
    s.wrap.classList.remove('character-walk','character-talk','character-serious','character-battle','character-action','character-enter');
    if(extraClass) s.wrap.classList.add(extraClass);
  }
  function stopWalking(){ if(walkTimer){clearInterval(walkTimer);walkTimer=null;} Object.keys(slots).forEach(k=>slots[k].wrap.classList.remove('character-walk')); }
  function startWalking(){
    stopWalking(); let flip=false;
    const tick=()=>{flip=!flip;setImage('otsuka',flip?'walk':'walk2','character-walk');setImage('yamanaka',flip?'walk':'walk2','character-walk');};
    tick(); walkTimer=setInterval(tick,260);
  }
  function rare(){ return !!(window.game&&window.game.currentRole&&/強チェリー|弱チェリー|スイカ|チャンス目/.test(window.game.currentRole.name||'')); }
  function setMode(mode){
    create(); currentMode=mode; stopWalking();
    if(mode==='spin'){startWalking();return;}
    if(mode==='talk'){setImage('otsuka','talk','character-talk');setImage('yamanaka','talk','character-talk');return;}
    if(mode==='serious'){setImage('otsuka','serious','character-serious');setImage('yamanaka','serious','character-serious');return;}
    if(mode==='battle'){setImage('otsuka','dagger','character-battle');setImage('yamanaka','guard','character-battle');return;}
    if(mode==='action'){setImage('otsuka','daggerAction','character-action');setImage('yamanaka','guard','character-battle');return;}
    setImage('otsuka','normal','character-enter');setImage('yamanaka','normal','character-enter');
  }
  function start(){create();setMode(rare()?'serious':'spin');}
  function stop(reelNo){
    step=reelNo;
    if(currentMode==='spin'&&reelNo===1)setMode('talk');
    if(reelNo>=2)setMode(rare()?'battle':'normal');
  }
  function finish(){stopWalking();const role=window.game&&window.game.currentRole?window.game.currentRole.name||'':'';if(/強チェリー|チャンス目/.test(role))setMode('battle');else if(/スイカ|弱チェリー/.test(role))setMode('serious');else setMode('normal');}

  window.aartCharacters={create,setMode,start,stop,finish,getMode:()=>currentMode,assets:CHARACTERS};
  document.addEventListener('DOMContentLoaded',create);

  function patch(proto){
    if(!proto||proto.__aartCharacterPatched)return; proto.__aartCharacterPatched=true;
    const os=proto.startSpinEffect, or=proto.stopReel, oo=proto.onReelStopped, on=proto.showNormalResult, ob=proto.showBonus, oc=proto.showChallenge;
    proto.startSpinEffect=function(){const r=os?os.apply(this,arguments):undefined;window.aartCharacters.start();return r;};
    proto.stopReel=function(i){const r=or?or.apply(this,arguments):undefined;window.aartCharacters.stop(i);return r;};
    proto.onReelStopped=function(i){const r=oo?oo.apply(this,arguments):undefined;window.aartCharacters.stop(i);return r;};
    proto.showNormalResult=function(){const r=on?on.apply(this,arguments):undefined;window.aartCharacters.finish();return r;};
    proto.showBonus=function(){const r=ob?ob.apply(this,arguments):undefined;window.aartCharacters.setMode('battle');return r;};
    proto.showChallenge=function(){const r=oc?oc.apply(this,arguments):undefined;window.aartCharacters.setMode('battle');return r;};
  }
  if(window.RendererV7)patch(window.RendererV7.prototype);
  document.addEventListener('DOMContentLoaded',function(){if(window.RendererV7)patch(window.RendererV7.prototype);});
})();

/* A+ART Character Animation v1
 * Prototype: 大塚蒼生 / 山中和也 only.
 * Missing character assets automatically fall back to /404.png.
 */
(function(){
  'use strict';

  const FALLBACK = '404.png';
  const BASE = 'assets/characters/';
  const CHARACTERS = {
    otsuka: {
      name: '大塚蒼生',
      dir: BASE + 'otsuka/',
      files: {
        normal: 'normal.png',
        talk: 'talk.png',
        sit: 'sit.png',
        walk: 'walk.png',
        walk2: 'walk2.png',
        serious: 'serious.png',
        dagger: 'dagger.png',
        daggerAction: 'dagger_action.png'
      }
    },
    yamanaka: {
      name: '山中和也',
      dir: BASE + 'yamanaka/',
      files: {
        normal: 'normal.png',
        walk: 'walk.png',
        walk2: 'walk2.png',
        talk: 'talk.png',
        serious: 'serious.png',
        sit: 'sit.png',
        sword: 'sword.png',
        guard: 'guard.png'
      }
    }
  };

  let root = null;
  let slots = {};
  let walkTimer = null;
  let currentMode = 'normal';
  let step = 0;

  function log(type, message){
    if(window.__AART_LOG__) window.__AART_LOG__(type, message);
  }

  function asset(character, key){
    const c = CHARACTERS[character];
    return c ? c.dir + (c.files[key] || FALLBACK) : FALLBACK;
  }

  function makeSlot(id, character){
    const c = CHARACTERS[character];
    const wrap = document.createElement('div');
    wrap.className = 'aart-character-slot';
    wrap.dataset.character = character;
    wrap.innerHTML = '<div class="aart-character-name"></div><div class="aart-character-stage"><img class="aart-character-image" alt=""></div>';
    wrap.querySelector('.aart-character-name').textContent = c.name;
    const img = wrap.querySelector('img');
    img.alt = c.name;
    img.addEventListener('error', function(){
      if(img.dataset.fallbackApplied === '1') return;
      img.dataset.fallbackApplied = '1';
      img.src = FALLBACK;
    });
    slots[character] = {wrap, img};
    return wrap;
  }

  function create(){
    if(root || !document.querySelector('.game-section')) return;
    root = document.createElement('div');
    root.id = 'aartCharacterStage';
    root.innerHTML = '<div class="aart-character-header">キャラクター演出</div><div class="aart-character-pair"></div>';
    const pair = root.querySelector('.aart-character-pair');
    pair.appendChild(makeSlot('otsukaSlot','otsuka'));
    pair.appendChild(makeSlot('yamanakaSlot','yamanaka'));
    const reel = document.querySelector('.reel-machine');
    if(reel && reel.parentNode) reel.parentNode.insertBefore(root, reel);
    else document.querySelector('.game-section').appendChild(root);
    setMode('normal');
    log('CHARACTER','character stage initialized');
  }

  function setImage(character, key, extraClass){
    const s = slots[character];
    if(!s) return;
    const src = asset(character, key);
    s.img.dataset.fallbackApplied = '0';
    s.img.src = src;
    s.wrap.classList.remove('character-walk','character-talk','character-serious','character-battle','character-action','character-enter');
    if(extraClass) s.wrap.classList.add(extraClass);
  }

  function stopWalking(){
    if(walkTimer){ clearInterval(walkTimer); walkTimer = null; }
    Object.keys(slots).forEach(k=>slots[k].wrap.classList.remove('character-walk'));
  }

  function startWalking(){
    stopWalking();
    let flip = false;
    const tick = function(){
      flip = !flip;
      setImage('otsuka', flip ? 'walk' : 'walk2', 'character-walk');
      setImage('yamanaka', flip ? 'walk' : 'walk2', 'character-walk');
    };
    tick();
    walkTimer = setInterval(tick, 260);
  }

  function setMode(mode){
    create();
    currentMode = mode;
    stopWalking();
    if(mode === 'spin'){
      startWalking();
      return;
    }
    if(mode === 'talk'){
      setImage('otsuka','talk','character-talk');
      setImage('yamanaka','talk','character-talk');
      return;
    }
    if(mode === 'serious'){
      setImage('otsuka','serious','character-serious');
      setImage('yamanaka','serious','character-serious');
      return;
    }
    if(mode === 'battle'){
      setImage('otsuka','dagger','character-battle');
      setImage('yamanaka','guard','character-battle');
      return;
    }
    if(mode === 'action'){
      setImage('otsuka','daggerAction','character-action');
      setImage('yamanaka','guard','character-battle');
      return;
    }
    setImage('otsuka','normal','character-enter');
    setImage('yamanaka','normal','character-enter');
  }

  function start(){
    create();
    const rare = !!(window.game && window.game.currentRole && /強チェリー|弱チェリー|スイカ|チャンス目/.test(window.game.currentRole.name || ''));
    setMode(rare ? 'serious' : 'spin');
  }

  function stop(reelNo){
    step = reelNo;
    if(currentMode === 'spin' && reelNo === 1) setMode('talk');
    if(reelNo === 2){
      const rare = !!(window.game && window.game.currentRole && /強チェリー|弱チェリー|スイカ|チャンス目/.test(window.game.currentRole.name || ''));
      setMode(rare ? 'battle' : 'normal');
    }
    if(reelNo === 3){
      const rare = !!(window.game && window.game.currentRole && /強チェリー|弱チェリー|スイカ|チャンス目/.test(window.game.currentRole.name || ''));
      setMode(rare ? 'battle' : 'normal');
    }
  }

  function finish(){
    stopWalking();
    const role = window.game && window.game.currentRole ? window.game.currentRole.name || '' : '';
    if(/強チェリー|チャンス目/.test(role)) setMode('battle');
    else if(/スイカ|弱チェリー/.test(role)) setMode('serious');
    else setMode('normal');
  }

  window.aartCharacters = {
    create,
    setMode,
    start,
    stop,
    finish,
    getMode: function(){ return currentMode; },
    assets: CHARACTERS
  };

  document.addEventListener('DOMContentLoaded', create);

  function patch(proto){
    if(!proto || proto.__aartCharacterPatched) return;
    proto.__aartCharacterPatched = true;
    const originalStart = proto.startSpinEffect;
    const originalStop = proto.stopReel;
    const originalOnStop = proto.onReelStopped;
    const originalNormal = proto.showNormalResult;
    const originalBonus = proto.showBonus;
    const originalChallenge = proto.showChallenge;
    proto.startSpinEffect = function(){
      const r = originalStart ? originalStart.apply(this, arguments) : undefined;
      window.aartCharacters.start();
      return r;
    };
    proto.stopReel = function(i){
      const r = originalStop ? originalStop.apply(this, arguments) : undefined;
      window.aartCharacters.stop(i);
      return r;
    };
    proto.onReelStopped = function(i){
      const r = originalOnStop ? originalOnStop.apply(this, arguments) : undefined;
      window.aartCharacters.stop(i);
      return r;
    };
    proto.showNormalResult = function(){
      const r = originalNormal ? originalNormal.apply(this, arguments) : undefined;
      window.aartCharacters.finish();
      return r;
    };
    proto.showBonus = function(){
      const r = originalBonus ? originalBonus.apply(this, arguments) : undefined;
      window.aartCharacters.setMode('battle');
      return r;
    };
    proto.showChallenge = function(){
      const r = originalChallenge ? originalChallenge.apply(this, arguments) : undefined;
      window.aartCharacters.setMode('battle');
      return r;
    };
  }

  if(window.RendererV7) patch(window.RendererV7.prototype);
  document.addEventListener('DOMContentLoaded', function(){
    if(window.RendererV7) patch(window.RendererV7.prototype);
  });
})();

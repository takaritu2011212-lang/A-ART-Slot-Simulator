(function(){
'use strict';

const SERIES=[
 {name:'気配',desc:'色や音の小さな変化で成立役を示唆。',items:[
  ['青い気配が一度だけ揺れた。',['ベル','リプレイ'],'normal'],['光が少しだけ強くなった。',['ベル','リプレイ'],'normal'],['緑の気配が端をかすめる。',['スイカ'],'normal'],['赤い気配が残った。',['弱チェリー','強チェリー'],'strong'],['気配が消えずに残っている。',['スイカ','強チェリー'],'strong'],['すべての音が、一瞬だけ消えた。',['BIG','REG'],'premium'] ]},
 {name:'探索',desc:'視線の移動先と発見内容に注目。',items:[
  ['近くを少し探してみる。',['ベル','リプレイ'],'normal'],['もう少し奥まで探してみよう。',['レア役'],'normal'],['足を止めて、何かを探している。',['スイカ','弱チェリー'],'strong'],['「……あれ？」と足を止めた。',['強チェリー','チャンス目'],'strong'],['見つけたように見えて、何もない。',['レア役'],'strong'],['探していた本人が、先に画面の外から現れた。',['BIG','REG'],'premium'] ]},
 {name:'会話',desc:'台詞の内容と会話の組み合わせで前兆を示唆。',items:[
  ['「今日は静かだな」',['ハズレ','ベル'],'normal'],['「なんか変じゃない？」',['リプレイ','レア役'],'normal'],['「さっきから妙な感じがする」',['レア役'],'strong'],['「ちょっと確認してくる」',['レア役'],'strong'],['「……誰もいない？」',['レア役'],'strong'],['「もう分かってるんだろ？」',['BIG','REG'],'premium'] ]},
 {name:'視線',desc:'誰がどこを見るかで対応役と期待度を示唆。',items:[
  ['視線が中央へ流れた。',['ベル','リプレイ'],'normal'],['一度だけ横を見た。',['弱チェリー','リプレイ'],'normal'],['視線が図柄の境目で止まった。',['チャンス目'],'strong'],['全員の視線が同じ場所へ集まる。',['強チェリー','スイカ'],'strong'],['誰もこちらを見ないまま、空気だけが変わった。',['レア役'],'strong'],['全員が同時にこちらを見た。',['BIG','REG'],'premium'] ]},
 {name:'調査',desc:'調べる対象が強いほどレア役・前兆期待度アップ。',items:[
  ['いつもの場所を確認する。',['ベル','リプレイ'],'normal'],['少し気になる場所を調べる。',['弱チェリー','スイカ'],'normal'],['念入りに調べ始めた。',['レア役'],'strong'],['調査対象が妙に絞られている。',['強チェリー','チャンス目'],'strong'],['調べたはずなのに、結果が残らない。',['レア役'],'strong'],['調査対象そのものが「BONUS」だった。',['BIG','REG'],'premium'] ]},
 {name:'電話',desc:'着信の種類と応答先で成立役や前兆を示唆。',items:[
  ['短い着信音が一度だけ鳴った。',['リプレイ'],'normal'],['少し長い着信が入った。',['ベル','弱チェリー'],'normal'],['電話が鳴り続けている。',['レア役'],'strong'],['知らない番号から着信があった。',['強チェリー','チャンス目'],'strong'],['誰も出ていないのに、通話が続いている。',['レア役'],'strong'],['着信表示に、存在しない名前が出た。',['BIG','REG'],'premium'] ]},
 {name:'買い物',desc:'商品や選択結果が成立役に対応。',items:[
  ['いつもの商品を手に取った。',['ベル','ハズレ'],'normal'],['少し珍しい商品を見つけた。',['リプレイ','弱チェリー'],'normal'],['奥の商品に手を伸ばした。',['スイカ'],'strong'],['特別な商品を見つけた。',['強チェリー','チャンス目'],'strong'],['買うはずのない商品を選んだ。',['レア役'],'strong'],['棚の一番奥に「BONUS」が置かれていた。',['BIG','REG'],'premium'] ]},
 {name:'本棚',desc:'本の位置・色・種類が成立役や前兆に対応。',items:[
  ['一冊だけ本を取り出した。',['ベル','リプレイ'],'normal'],['背表紙の色が少し違う。',['弱チェリー','スイカ'],'normal'],['奥の本に手を伸ばした。',['スイカ'],'strong'],['禁じられた本を見つけた。',['強チェリー','チャンス目'],'strong'],['本を戻したのに、一冊だけ位置が変わっている。',['レア役'],'strong'],['本を開くと最初のページに「WIN」と書かれていた。',['BIG','REG'],'premium'] ]},
 {name:'時計',desc:'針の動きや時間の違和感で前兆を示唆。',items:[
  ['時計の秒針が一つ進んだ。',['ベル','リプレイ'],'normal'],['秒針が一瞬だけ速くなった。',['弱チェリー','リプレイ'],'normal'],['針が一度だけ大きく跳ねた。',['レア役'],'strong'],['時計が少しだけ遅れている。',['強チェリー','チャンス目'],'strong'],['同じ時刻をもう一度指した。',['レア役'],'strong'],['時計の針が逆向きに回り始めた。',['BIG','REG'],'premium'] ]},
 {name:'写真',desc:'写真の内容と違和感が役・前兆に対応。',items:[
  ['何気ない写真を一枚見る。',['ハズレ','ベル'],'normal'],['写真の端に光が写っている。',['リプレイ','弱チェリー'],'normal'],['見覚えのない場所が写っている。',['スイカ'],'strong'],['写真の中に知らない人物がいる。',['強チェリー','チャンス目'],'strong'],['撮った覚えのない写真が増えている。',['レア役'],'strong'],['写真の中に、今ここにいる人物が写っていた。',['BIG','REG'],'premium'] ]},
 {name:'端末',desc:'画面表示・通知・通信状態で期待度を示唆。',items:[
  ['通知が一件届いた。',['リプレイ','ベル'],'normal'],['画面が一瞬だけ明るくなった。',['弱チェリー','スイカ'],'normal'],['見慣れない通知が表示された。',['レア役'],'strong'],['通信エラーが一度だけ出た。',['強チェリー','チャンス目'],'strong'],['閉じたはずの画面がもう一度開いた。',['レア役'],'strong'],['画面中央に一瞬だけ「WIN」と表示された。',['BIG','REG'],'premium'] ]},
 {name:'選択',desc:'選択肢の位置と選ばれ方に対応法則あり。',items:[
  ['左を選んだ。',['ベル','ハズレ'],'normal'],['中央を選んだ。',['リプレイ'],'normal'],['右を選んだ。',['弱チェリー','スイカ'],'strong'],['普段は選ばない選択肢を選んだ。',['強チェリー','チャンス目'],'strong'],['選択肢が一つだけ残った。',['レア役'],'strong'],['選択肢そのものが消え、「BONUS」だけが残った。',['BIG','REG'],'premium'] ]},
 {name:'ルーレット',desc:'止まる位置だけでなく、回転量や見え方にも注目。',items:[
  ['ゆっくりとルーレットが回る。',['ベル','リプレイ'],'normal'],['少しだけ回転が速い。',['弱チェリー','スイカ'],'normal'],['回転速度が明らかに速い。',['レア役'],'strong'],['停止直前に一度だけ跳ねた。',['強チェリー','チャンス目'],'strong'],['本来ないはずの「！」が見えた。',['レア役'],'strong'],['すべてのマスが「BONUS」になった。',['BIG','REG'],'premium'] ]},
 {name:'レーダー',desc:'反応の強さと位置が対応役・前兆を示唆。',items:[
  ['小さな反応が一つ出た。',['リプレイ','ベル'],'normal'],['反応が少し広がった。',['弱チェリー','スイカ'],'normal'],['強い反応が一度だけ走った。',['レア役'],'strong'],['画面の端まで反応が広がった。',['強チェリー','チャンス目'],'strong'],['反応が消えた後、別の場所に出た。',['レア役'],'strong'],['レーダー中央に「WIN」の反応が出た。',['BIG','REG'],'premium'] ]},
 {name:'街の異変',desc:'背景の小さな変化が成立役や前兆を示唆。',items:[
  ['街灯が一つだけ点いた。',['ベル','リプレイ'],'normal'],['遠くの明かりが揺れた。',['弱チェリー','スイカ'],'normal'],['人影が一瞬だけ増えた。',['レア役'],'strong'],['街の音が一斉に止まった。',['強チェリー','チャンス目'],'strong'],['さっきまでいた人影が一つだけ消えた。',['レア役'],'strong'],['街全体から人の気配が消えた。',['BIG','REG'],'premium'] ]},
 {name:'光景',desc:'一瞬の風景変化と見えているものの矛盾に注目。',items:[
  ['いつもの景色が流れていく。',['ハズレ','ベル'],'normal'],['遠くで光が一つ瞬いた。',['リプレイ','弱チェリー'],'normal'],['景色が一瞬だけ別の場所に見えた。',['スイカ'],'strong'],['一瞬だけ画面全体が赤く染まった。',['強チェリー','チャンス目'],'strong'],['戻った景色に、一つだけ違う物がある。',['レア役'],'strong'],['景色そのものが一瞬だけ「WIN」に変わった。',['BIG','REG'],'premium'] ]},
 {name:'カットイン',desc:'発生時点で高期待度。段階が進むほど期待度上昇。',items:[
  ['小さなカットインが入った。',['レア役'],'strong'],['カットインが一段階強くなった。',['レア役'],'strong'],['人物の表情が変わった。',['強チェリー','スイカ'],'strong'],['画面いっぱいにカットインが入った。',['強チェリー','チャンス目'],'strong'],['最終カットインまで到達した。',['BIG','REG'],'strong'],['見たことのない専用カットインが発生した。',['BIG','REG'],'premium'] ]},
 {name:'暗転',desc:'暗転後の展開が状態・ボーナスを示唆。',items:[
  ['一瞬だけ画面が暗くなった。',['リプレイ','ベル'],'normal'],['暗転が少し長い。',['弱チェリー','スイカ'],'normal'],['暗転してから元に戻った。',['レア役'],'strong'],['暗転後も画面が戻らない。',['強チェリー','チャンス目'],'strong'],['暗転したのに何も変わっていない。',['レア役'],'strong'],['暗転後、そのままBONUS画面へ切り替わった。',['BIG','REG'],'premium'] ]},
 {name:'連続演出',desc:'発展後は結果までの進行と法則に注目。',items:[
  ['1G目で様子を見る。',['レア役'],'strong'],['2G目まで展開が続く。',['レア役'],'strong'],['3G目でチャンスアップが入る。',['レア役'],'strong'],['最終ゲームで強い攻撃が入る。',['強チェリー','チャンス目'],'strong'],['敗北したように見えて演出が続く。',['BIG','REG'],'strong'],['開始画面の時点で「WIN」が出ている。',['BIG','REG'],'premium'] ]},
 {name:'次回予告',desc:'発生時点で激熱。内容によって最終結果を示唆。',items:[
  ['短い予告音が入る。',['レア役'],'strong'],['次の展開を示す文字が出る。',['レア役'],'strong'],['背景付きの予告が発生する。',['強チェリー','スイカ'],'strong'],['画面いっぱいに予告が表示される。',['強チェリー','チャンス目'],'strong'],['次ゲームへの予告が最後まで続く。',['BIG','REG'],'strong'],['予告文が「BONUS」そのものになっている。',['BIG','REG'],'premium'] ]}
];

function buildCatalog(){
 const out=[];
 SERIES.forEach(s=>s.items.forEach((it,i)=>{
   const tier=it[2]==='premium'?'premium':it[2]==='strong'?'strong':'common';
   out.push({tier,text:it[0],roles:it[1],series:s.name,law:s.desc,index:i+1});
 }));
 return out;
}

function installRenderer(){
 if(typeof RendererV7==='undefined') return false;
 RendererV7.prototype.buildCatalog=buildCatalog;
 return true;
}

function installGuide(){
 if(document.getElementById('aartLawButton')) return;
 const style=document.createElement('style');
 style.textContent=`#aartLawButton{margin:10px auto 0;display:block;padding:10px 16px;border:1px solid #777;border-radius:8px;background:#20242a;color:#fff;cursor:pointer;font-weight:700}#aartLawOverlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;display:none;padding:20px;box-sizing:border-box}#aartLawOverlay.open{display:flex;align-items:center;justify-content:center}#aartLawPanel{width:min(920px,96vw);height:min(88vh,900px);overflow:auto;background:#15181d;color:#eee;border:1px solid #555;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.5);padding:20px;box-sizing:border-box}#aartLawPanel h2{margin:0 0 6px}#aartLawPanel .law-note{font-size:13px;opacity:.78;margin-bottom:16px}#aartLawClose{float:right;background:none;color:#fff;border:1px solid #777;border-radius:6px;padding:6px 10px;cursor:pointer}.law-series{border:1px solid #3b4149;border-radius:10px;margin:10px 0;overflow:hidden}.law-series h3{margin:0;padding:10px 12px;background:#20252c}.law-desc{padding:7px 12px;font-size:13px;opacity:.78}.law-row{display:grid;grid-template-columns:42px 1fr 150px;gap:8px;padding:8px 12px;border-top:1px solid #30353c;font-size:14px}.law-row.premium{font-weight:700;background:#2b2630}.law-tier{opacity:.7}.law-roles{font-weight:700}@media(max-width:600px){#aartLawPanel{padding:14px}.law-row{grid-template-columns:30px 1fr}.law-roles{grid-column:2}.law-tier{grid-column:2}}`;
 document.head.appendChild(style);
 const btn=document.createElement('button');btn.id='aartLawButton';btn.type='button';btn.textContent='演出法則を見る';
 const anchor=document.getElementById('演出テキスト');
 if(anchor&&anchor.parentElement) anchor.parentElement.insertBefore(btn,anchor.nextSibling); else document.body.appendChild(btn);
 const overlay=document.createElement('div');overlay.id='aartLawOverlay';
 overlay.innerHTML='<div id="aartLawPanel"><button id="aartLawClose" type="button">閉じる</button><h2>演出法則</h2><div class="law-note">演出は成立役を示唆します。対応役と異なる成立役が出た場合は、前兆や発展につながる可能性があります。プレミアはBONUS濃厚パターンです。</div><div id="aartLawList"></div></div>';
 document.body.appendChild(overlay);
 const list=overlay.querySelector('#aartLawList');
 SERIES.forEach(s=>{const box=document.createElement('section');box.className='law-series';box.innerHTML='<h3>'+s.name+'</h3><div class="law-desc">'+s.desc+'</div>';s.items.forEach((it,i)=>{const row=document.createElement('div');row.className='law-row '+(it[2]==='premium'?'premium':'');const label=it[2]==='premium'?'プレミア':(i+1)+'段階';row.innerHTML='<div class="law-tier">'+label+'</div><div>'+it[0]+'</div><div class="law-roles">'+it[1].join(' / ')+'</div>';box.appendChild(row)});list.appendChild(box)});
 btn.addEventListener('click',()=>overlay.classList.add('open'));
 overlay.querySelector('#aartLawClose').addEventListener('click',()=>overlay.classList.remove('open'));
 overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
}

function init(){installRenderer();installGuide();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

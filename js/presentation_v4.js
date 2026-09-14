/* A+ART Presentation Pack v4: large-volume sub LCD / text演出 */
class PresentationV4 {
    constructor(renderer) {
        this.renderer = renderer;
        this.sub = null;
        this.mode = 'normal';
        this.ensureSubLCD();
    }

    ensureSubLCD() {
        if (document.getElementById('subLcd')) {
            this.sub = document.getElementById('subLcd');
            return;
        }
        const text = document.getElementById('演出テキスト');
        if (!text) return;
        const wrap = document.createElement('div');
        wrap.id = 'subLcd';
        wrap.className = 'sub-lcd';
        wrap.innerHTML = '<div class="sub-lcd-head"><span class="sub-lcd-title">SUB LCD</span><span class="sub-lcd-mode">NORMAL</span></div><div class="sub-lcd-main">待機中</div><div class="sub-lcd-sub">演出なし</div><div class="sub-lcd-tags"></div>';
        text.parentNode.insertBefore(wrap, text);
        this.sub = wrap;
    }

    pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    chance(p) { return Math.random() < p; }

    data() {
        return {
            idle: [
                '店内はいつも通り。','静かな時間が流れる。','何も起こらない、ように見える。','蒼生はレバーへ手を伸ばした。',
                '視線だけが一瞬動いた。','時計の秒針が進む。','小さな違和感。気のせいかもしれない。','今日も淡々と始まる。',
                '聞き慣れた音がする。','まだ何も始まっていない。','いつもの一枚。','次の一手へ。'
            ],
            small: [
                'ベルの気配。','リプレイか？','スイカの予感。','チェリーの気配。','小役成立の気配。','何かが引っ掛かった。',
                'いつもより少しだけ違う。','視界の端が揺れた。','音が一つ多い。','一瞬だけ違和感。','まだ弱い。','ほんの少しだけ期待。'
            ],
            chance: [
                '何かを示している？','この違和感、偶然か。','いつもと同じではない。','もう一度、同じ気配。','視線を誘う何か。',
                '一つだけ妙なところがある。','気付けば、そこを見ていた。','静かな予告。','まだ断定はできない。','少しだけ強い。',
                '何かを待っているようだ。','このままでは終わらない？','予兆だけが残った。','微かな光が差した。'
            ],
            strong: [
                '――空気が変わった。','――今のは明らかに違う。','――何かが来る。','――偶然ではない。','――この先を見ろ。',
                '――気配が濃くなった。','――静かすぎる。','――もう後戻りはできない。','――何かが待っている。','――本当に来るのか。',
                '――一度では終わらない。','――決定的な違和感。'
            ],
            reel: [
                '左リール、停止。','まだ続く。','中リール、停止。','最後の一つ。','ここで変わる。','そのまま見ろ。',
                '残るのは右だけ。','違和感は消えない。','結果を待て。','最後まで確認。','停止音が響く。','判定の瞬間。'
            ],
            pairs: [
                ['ベル','リプレイ'],['ベル','スイカ'],['ベル','チェリー'],['リプレイ','スイカ'],['リプレイ','チェリー'],['スイカ','チェリー'],
                ['ベル','ハズレ'],['リプレイ','ハズレ'],['スイカ','ハズレ'],['チェリー','ハズレ'],['ベル','チャンス目'],['チェリー','チャンス目'],
                ['弱チェリー','強チェリー'],['スイカ','チャンス目'],['強チェリー','チャンス目']
            ],
            bonus: [
                ['BIG','REG'],['BIG','EPISODE昇格'],['REG','EPISODE昇格'],['BIG','REG','EPISODE昇格'],
                ['BIG濃厚','REG否定'],['REG濃厚','BIG否定'],['BONUS','EPISODE?'],['BONUS TYPE','判定中']
            ],
            tiny: [
                'NEXT','WAIT','LOOK','CHECK','CHANCE','MAYBE','TRACE','SIGN','LINK','PULSE','NOTICE','SHIFT','FLASH','STEP','LOCK','OPEN','FINAL'
            ]
        };
    }

    targetPair(role) {
        const n = role?.name || '';
        if (n.includes('強チェリー')) return ['弱チェリー','強チェリー'];
        if (n.includes('チャンス目')) return ['チェリー','チャンス目'];
        if (n.includes('弱チェリー')) return ['弱チェリー','強チェリー'];
        if (n.includes('スイカ')) return ['スイカ','ベル'];
        if (n.includes('リプレイ')) return ['リプレイ','ベル'];
        if (n.includes('ベル')) return ['ベル','リプレイ'];
        return this.pick(this.data().pairs.slice(0, 10));
    }

    setLCD(main, sub = '', tags = [], mode = 'NORMAL', cls = '') {
        this.ensureSubLCD();
        if (!this.sub) return;
        this.sub.className = 'sub-lcd ' + cls;
        const head = this.sub.querySelector('.sub-lcd-mode');
        const m = this.sub.querySelector('.sub-lcd-main');
        const s = this.sub.querySelector('.sub-lcd-sub');
        const t = this.sub.querySelector('.sub-lcd-tags');
        if (head) head.textContent = mode;
        if (m) m.textContent = main;
        if (s) s.textContent = sub;
        if (t) t.innerHTML = tags.map(x => `<span>${x}</span>`).join('');
        this.sub.classList.remove('lcd-flash');
        void this.sub.offsetWidth;
        this.sub.classList.add('lcd-flash');
    }

    spinStart(role) {
        const d = this.data();
        const pair = this.targetPair(role);
        const n = role?.name || '';
        let mode = 'NORMAL', cls = 'lcd-normal', main = this.pick(d.tiny), sub = this.pick(d.small);
        let tags = [pair[0], pair[1]];

        if (n.includes('強チェリー') || n.includes('チャンス目')) {
            mode = 'CHANCE'; cls = 'lcd-chance'; main = this.pick(['TWO SIGNS','DOUBLE TRACE','CHANCE LINK','TRACE FOUND','SUSPICION']);
            sub = this.pick(['二つの候補を追跡','どちらか一方を示唆','片方だけが強く反応','まだ答えは出ない','この二択を見ろ']);
        } else if (n.includes('スイカ') || n.includes('弱チェリー') || n.includes('リプレイ') || n.includes('ベル')) {
            mode = this.chance(.28) ? 'NOTICE' : 'NORMAL'; cls = mode === 'NOTICE' ? 'lcd-notice' : cls;
            main = this.pick(['ROLE CHECK','SMALL ROLE','SIGNAL','SUB TRACE','ROLE?']);
            sub = this.pick(['子役候補を表示','二択で示唆','小役の気配','片方が少し強い','成立役を追跡']);
        }
        if (game.bonusPending) {
            const b = this.pick(d.bonus);
            mode = game.bonusCountdown <= 1 ? 'FINAL' : 'PRE-BONUS';
            cls = 'lcd-bonus'; tags = b; main = game.bonusCountdown <= 1 ? 'BONUS TYPE' : 'BONUS TRACE';
            sub = game.bonusCountdown <= 1 ? 'BIG / REG / EPISODE昇格を示唆' : 'ボーナスへの接近を示唆';
        } else if (game.fakePrecursorG > 0) {
            mode = 'FAKE?'; cls = 'lcd-fake'; main = this.pick(['PRECURSOR','FAKE TRACE','RESIDUAL','SIGNAL?']); sub = '前兆らしき気配';
        }
        this.setLCD(main, sub, tags, mode, cls);
    }

    reelStop(i, role) {
        const d = this.data();
        const pair = this.targetPair(role);
        const n = role?.name || '';
        let main = i === 3 ? this.pick(['RESULT','JUDGEMENT','FINAL CHECK','ANSWER']) : this.pick(d.reel);
        let sub = i === 3 ? this.pick(['最終停止','ここで結果判定','最後の一手','全てが揃う']) : this.pick(['停止位置を確認','まだ候補は残る','示唆は継続','次のリールへ']);
        let mode = i === 3 ? 'JUDGEMENT' : 'REEL ' + i;
        let cls = i === 3 ? 'lcd-judgement' : 'lcd-normal';
        let tags = pair;
        if (n.includes('強チェリー') || n.includes('チャンス目')) cls = 'lcd-chance';
        if (game.bonusPending && i === 3) { cls = 'lcd-bonus'; mode = game.bonusCountdown <= 1 ? 'FINAL' : 'BONUS'; main = game.bonusCountdown <= 1 ? this.pick(['BIG?','REG?','EPISODE?']) : 'BONUS TRACE'; sub = '最後の示唆'; tags = this.pick(d.bonus); }
        this.setLCD(main, sub, tags, mode, cls);
    }

    bonus(type) {
        const d = this.data();
        const isBig = type === 'BIG';
        const main = isBig ? this.pick(['BIG','BIG BONUS','BIG START','BIG SIGNAL']) : this.pick(['REG','REG BONUS','REG START','REG SIGNAL']);
        const tags = isBig ? ['BIG','250枚'] : ['REG','70枚'];
        this.setLCD(main, this.pick(['ボーナスタイプ確定','ここから消化開始','払い出し開始','BONUS START']), tags, 'BONUS', 'lcd-bonus');
    }

    challenge() {
        const small = game.challengeSmall;
        this.setLCD(this.pick(['ART CHALLENGE','5G CHALLENGE','CHALLENGE MODE']), small ? '小役成立なら成功抽選' : '通常役でも5G継続', ['5G','SUCCESS?','ART'], 'CHALLENGE', 'lcd-challenge');
    }

    idle() {
        this.setLCD(this.pick(['READY','WAIT','NORMAL','STANDBY']), this.pick(this.data().idle), [], 'NORMAL', 'lcd-normal');
    }
}

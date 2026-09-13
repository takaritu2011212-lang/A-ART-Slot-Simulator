// ゲーム定数・設定値

// 通常時の役確率。記載値は「全ゲームに対する絶対確率」。
// 不足分はハズレとして扱い、役同士を勝手に正規化しない。
const NORMAL_ROLES = {
    REPLAY: { prob: 1/8.2, name: 'リプレイ', payment: 0, color: 'blue' },
    BELL_3: { prob: 1/15.4, name: '3枚ベル', payment: 3, color: 'yellow', isLose: false },
    WATERMELON: { prob: 1/70.9, name: 'スイカ', payment: 5, color: 'green' },
    WEAK_CHERRY: { prob: 1/70.3, name: '弱チェリー', payment: 3, color: 'pink' },
    STRONG_CHERRY: { prob: 1/170.7, name: '強チェリー', payment: 3, color: 'red' },
    CHANCE: { prob: 1/170.7, name: 'チャンス目', payment: 0, color: 'purple' },
    LOSE: { prob: 1 - (1/8.2 + 1/15.4 + 1/70.9 + 1/70.3 + 1/170.7 + 1/170.7), name: 'ハズレ', payment: 0, color: 'white', isLose: true },
};

// ART中。押し順ベル以外の絶対確率は通常時と同じ。
const ART_ROLES = {
    ART_REPLAY: { prob: 1/2.1, name: 'ART リプレイ', payment: 0, color: 'blue' },
    BELL_11: { prob: 1/14.0, name: '11枚ベル', payment: 11, color: 'red' },
    BELL_3: { prob: 1/15.4, name: '3枚ベル', payment: 3, color: 'yellow', isLose: false },
    WATERMELON: { prob: 1/70.9, name: 'スイカ', payment: 5, color: 'green' },
    WEAK_CHERRY: { prob: 1/70.3, name: '弱チェリー', payment: 3, color: 'pink' },
    STRONG_CHERRY: { prob: 1/170.7, name: '強チェリー', payment: 3, color: 'red' },
    CHANCE: { prob: 1/170.7, name: 'チャンス目', payment: 1, color: 'purple' },
    ART_LOSE: { prob: 1 - (1/2.1 + 1/14.0 + 1/15.4 + 1/70.9 + 1/70.3 + 1/170.7 + 1/170.7), name: 'ハズレ', payment: 0, color: 'white', isLose: true },
};

// ボーナス確率。設計目標は BIG 1/366.4、REG 1/436.1。
const BONUS_PROBS = {
    1: { BIG: 1/366.4, REG: 1/436.1, combined: 1/198.98 },
    2: { BIG: 1/365.0, REG: 1/434.0, combined: 1/(1/365.0 + 1/434.0) },
    3: { BIG: 1/360.0, REG: 1/420.0, combined: 1/(1/360.0 + 1/420.0) },
    4: { BIG: 1/350.0, REG: 1/405.0, combined: 1/(1/350.0 + 1/405.0) },
    5: { BIG: 1/340.0, REG: 1/390.0, combined: 1/(1/340.0 + 1/390.0) },
    6: { BIG: 1/330.0, REG: 1/365.0, combined: 1/(1/330.0 + 1/365.0) },
};

// 役の絶対確率から上記ボーナス合算値になるよう調整済み。
const BONUS_TRIGGER_RATES = {
    1: { CHANCE: 0.38594390, STRONG_CHERRY: 0.11578317, WATERMELON: 0.06754018, WEAK_CHERRY: 0.04824299, LOSE: 0.00057892 },
    2: { CHANCE: 0.38594390, STRONG_CHERRY: 0.11578317, WATERMELON: 0.06754018, WEAK_CHERRY: 0.04824299, LOSE: 0.00057892 },
    3: { CHANCE: 0.36554591, STRONG_CHERRY: 0.11423310, WATERMELON: 0.06579826, WEAK_CHERRY: 0.04752097, LOSE: 0.00082248 },
    4: { CHANCE: 0.34946837, STRONG_CHERRY: 0.11357722, WATERMELON: 0.06552532, WEAK_CHERRY: 0.04805190, LOSE: 0.00104841 },
    5: { CHANCE: 0.33279198, STRONG_CHERRY: 0.11231729, WATERMELON: 0.06489444, WEAK_CHERRY: 0.04825484, LOSE: 0.00133117 },
    6: { CHANCE: 0.31779948, STRONG_CHERRY: 0.11122982, WATERMELON: 0.06355990, WEAK_CHERRY: 0.04766992, LOSE: 0.00158900 },
};

// ART CHALLENGE。5G中、各Gの「通常小役」成立率を約30.045%に設定。
// 成立時の成功抽選を1/3とすることで、5Gの総合成功率は約41.0%。
const CHALLENGE_SMALL_ROLE_PROB = 0.30045;
const CHALLENGE_SUCCESS_RATE = 1/3;
const CHALLENGE_ROLE_RATES = {
    BELL_3: 0.50,
    WATERMELON: 0.15,
    WEAK_CHERRY: 0.20,
    STRONG_CHERRY: 0.10,
    CHANCE: 0.05,
};

const REG_CHALLENGE_RATES = { 1:0.40, 2:0.44, 3:0.48, 4:0.52, 5:0.56, 6:0.60 };
const EPISODE_BONUS_RATES = { 1:0.05, 2:0.08, 3:0.07, 4:0.10, 5:0.09, 6:0.12 };

const ART_ADDON_RATES = {
    WEAK_CHERRY:{normal:0.75,tables:{normal:[{add:5,prob:0.55},{add:10,prob:0.30},{add:20,prob:0.12},{add:30,prob:0.03}],highG:[{add:10,prob:0.55},{add:20,prob:0.30},{add:30,prob:0.12},{add:50,prob:0.03}]}},
    WATERMELON:{normal:0.40,tables:{normal:[{add:20,prob:0.60},{add:30,prob:0.25},{add:50,prob:0.12},{add:100,prob:0.03}],highG:[{add:30,prob:0.60},{add:50,prob:0.25},{add:70,prob:0.12},{add:150,prob:0.03}]}},
    STRONG_CHERRY:{normal:1.00,tables:{normal:[{add:10,prob:0.55},{add:20,prob:0.30},{add:30,prob:0.12},{add:50,prob:0.025},{add:100,prob:0.005}],highG:[{add:20,prob:0.55},{add:30,prob:0.30},{add:40,prob:0.12},{add:70,prob:0.025},{add:150,prob:0.005}]}},
    CHANCE:{normal:1.00,tables:{normal:[{add:5,prob:0.70},{add:10,prob:0.25},{add:20,prob:0.04},{add:30,prob:0.01}],highG:[{add:10,prob:0.70},{add:20,prob:0.25},{add:30,prob:0.04},{add:50,prob:0.01}]}}
};

const HIGH_PROB_RATES={WEAK_CHERRY:0.05,WATERMELON:0.08,STRONG_CHERRY:0.15,CHANCE:0.20};
const HIGH_PROB_TYPES={
    WEAK_CHERRY:{UP_PROB:0.35,UP_GAME:0.35,SANSEN:0.25,ZONE:0.05},
    WATERMELON:{UP_PROB:0.25,UP_GAME:0.40,SANSEN:0.25,ZONE:0.10},
    STRONG_CHERRY:{UP_PROB:0.30,UP_GAME:0.30,SANSEN:0.25,ZONE:0.15},
    CHANCE:{UP_PROB:0.15,UP_GAME:0.20,SANSEN:0.30,ZONE:0.35}
};
const SANSEN_TRIGGER_RATES={WEAK_CHERRY:0.05,WATERMELON:0.07,STRONG_CHERRY:0.12,CHANCE:0.40};
const SANSEN_CHARACTER_RATES={A:0.25,B:0.25,C:0.25,D:0.0833,E:0.0833,F:0.0833};
const BURST_TRIGGER_RATES={WEAK_CHERRY:0,WATERMELON:0,STRONG_CHERRY:0.15,CHANCE:0.15};
const BURST_REWARD_TABLES={1:{A:0.70,B:0.25,C:0.05,D:0,E:0},2:{A:0.20,B:0.55,C:0.22,D:0.03,E:0},3:{A:0.05,B:0.25,C:0.50,D:0.18,E:0.02},4:{A:0,B:0.10,C:0.35,D:0.45,E:0.10},5:{A:0,B:0,C:0.15,D:0.50,E:0.35},6:{A:0,B:0,C:0.05,D:0.30,E:0.65}};
const BURST_REWARD_AMOUNTS={A:[60,70,80,100],B:[70,80,100,120],C:[80,100,120,150],D:[100,120,150,200],E:[150,200,250,300]};
const ATTACK_TIME_ADDON={LOSE:3,REPLAY:5,BELL_11:5,WEAK_CHERRY:10,STRONG_CHERRY:20};
const ATTACK_TIME_TRIGGER_RATES={WEAK_CHERRY:0.20,WATERMELON:0.20,STRONG_CHERRY:0,CHANCE:0};

const GAME_STATE={NORMAL:'NORMAL',BONUS_BIG:'BONUS_BIG',BONUS_REG:'BONUS_REG',BONUS_EPISODE:'BONUS_EPISODE',CHALLENGE:'CHALLENGE',ART:'ART',SANSEN:'SANSEN',BURST:'BURST',ATTACK_TIME:'ATTACK_TIME',REVERSE:'REVERSE'};
const BET_AMOUNT=3;
const BIG_PAYMENT=250;
const REG_PAYMENT=70;
const BONUS_BELL_PAYMENT=7;
const ART_INITIAL_G=60;
const CHALLENGE_G=5;
const SANSEN_G=10;
const BURST_G=25;
const ATTACK_TIME_G=3;
const HIGH_PROB_DURATION=20;

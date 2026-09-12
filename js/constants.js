// ゲーム定数・設定値

// ============ 小役確率 ============
const NORMAL_ROLES = {
    REPLAY: { prob: 1/8.2, name: 'リプレイ', payment: 0, color: 'blue' },
    BELL_3: { prob: 1/15.4, name: '3枚ベル', payment: 3, color: 'yellow', isLose: true },
    WATERMELON: { prob: 1/70.9, name: 'スイカ', payment: 5, color: 'green' },
    WEAK_CHERRY: { prob: 1/70.3, name: '弱チェリー', payment: 3, color: 'pink' },
    STRONG_CHERRY: { prob: 1/170.7, name: '強チェリー', payment: 3, color: 'red' },
    CHANCE: { prob: 1/170.7, name: 'チャンス目', payment: 0, color: 'purple' },
};

const ART_ROLES = {
    ART_REPLAY: { prob: 1/2.1, name: 'ART リプレイ', payment: 0, color: 'blue' },
    BELL_11: { prob: 1/14.0, name: '11枚ベル', payment: 11, color: 'red' },
    BELL_3: { prob: 1/15.4, name: '3枚ベル', payment: 3, color: 'yellow', isLose: true },
    WATERMELON: { prob: 1/70.9, name: 'スイカ', payment: 5, color: 'green' },
    WEAK_CHERRY: { prob: 1/70.3, name: '弱チェリー', payment: 3, color: 'pink' },
    STRONG_CHERRY: { prob: 1/170.7, name: '強チェリー', payment: 3, color: 'red' },
    CHANCE: { prob: 1/170.7, name: 'チャンス目', payment: 1, color: 'purple' },
};

// ============ ボーナス確率（設定別） ============
const BONUS_PROBS = {
    1: { BIG: 1/330, REG: 1/505, combined: 1/199.7 },
    2: { BIG: 1/328, REG: 1/510, combined: 1/199.7 },
    3: { BIG: 1/325, REG: 1/500, combined: 1/198.0 },
    4: { BIG: 1/322, REG: 1/495, combined: 1/194.9 },
    5: { BIG: 1/318, REG: 1/485, combined: 1/190.9 },
    6: { BIG: 1/315, REG: 1/475, combined: 1/188.1 },
};

// ============ ボーナス契機別当選率 ============
const BONUS_TRIGGER_RATES = {
    1: {
        CHANCE: 0.40,
        STRONG_CHERRY: 0.12,
        WATERMELON: 0.07,
        WEAK_CHERRY: 0.05,
        LOSE: 0.0006,
    },
    2: {
        CHANCE: 0.40,
        STRONG_CHERRY: 0.12,
        WATERMELON: 0.07,
        WEAK_CHERRY: 0.05,
        LOSE: 0.0006,
    },
    3: {
        CHANCE: 0.40,
        STRONG_CHERRY: 0.125,
        WATERMELON: 0.072,
        WEAK_CHERRY: 0.052,
        LOSE: 0.0009,
    },
    4: {
        CHANCE: 0.40,
        STRONG_CHERRY: 0.13,
        WATERMELON: 0.075,
        WEAK_CHERRY: 0.055,
        LOSE: 0.0012,
    },
    5: {
        CHANCE: 0.40,
        STRONG_CHERRY: 0.135,
        WATERMELON: 0.078,
        WEAK_CHERRY: 0.058,
        LOSE: 0.0016,
    },
    6: {
        CHANCE: 0.40,
        STRONG_CHERRY: 0.14,
        WATERMELON: 0.08,
        WEAK_CHERRY: 0.06,
        LOSE: 0.0020,
    },
};

// ============ REG後のART Challenge突入率（設定別） ============
const REG_CHALLENGE_RATES = {
    1: 0.40,
    2: 0.44,
    3: 0.48,
    4: 0.52,
    5: 0.56,
    6: 0.60,
};

// ============ Episode Bonus昇格率（設定別） ============
const EPISODE_BONUS_RATES = {
    1: 0.05,
    2: 0.08,
    3: 0.07,
    4: 0.10,
    5: 0.09,
    6: 0.12,
};

// ============ ART上乗せ確率 ============
const ART_ADDON_RATES = {
    WEAK_CHERRY: {
        normal: 0.75,
        tables: {
            normal: [
                { add: 5, prob: 0.55 },
                { add: 10, prob: 0.30 },
                { add: 20, prob: 0.12 },
                { add: 30, prob: 0.03 },
            ],
            highG: [
                { add: 10, prob: 0.55 },
                { add: 20, prob: 0.30 },
                { add: 30, prob: 0.12 },
                { add: 50, prob: 0.03 },
            ],
        }
    },
    WATERMELON: {
        normal: 0.40,
        tables: {
            normal: [
                { add: 20, prob: 0.60 },
                { add: 30, prob: 0.25 },
                { add: 50, prob: 0.12 },
                { add: 100, prob: 0.03 },
            ],
            highG: [
                { add: 30, prob: 0.60 },
                { add: 50, prob: 0.25 },
                { add: 70, prob: 0.12 },
                { add: 150, prob: 0.03 },
            ],
        }
    },
    STRONG_CHERRY: {
        normal: 1.00,
        tables: {
            normal: [
                { add: 10, prob: 0.55 },
                { add: 20, prob: 0.30 },
                { add: 30, prob: 0.12 },
                { add: 50, prob: 0.025 },
                { add: 100, prob: 0.005 },
            ],
            highG: [
                { add: 20, prob: 0.55 },
                { add: 30, prob: 0.30 },
                { add: 40, prob: 0.12 },
                { add: 70, prob: 0.025 },
                { add: 150, prob: 0.005 },
            ],
        }
    },
    CHANCE: {
        normal: 1.00,
        tables: {
            normal: [
                { add: 5, prob: 0.70 },
                { add: 10, prob: 0.25 },
                { add: 20, prob: 0.04 },
                { add: 30, prob: 0.01 },
            ],
            highG: [
                { add: 10, prob: 0.70 },
                { add: 20, prob: 0.25 },
                { add: 30, prob: 0.04 },
                { add: 50, prob: 0.01 },
            ],
        }
    },
};

// ============ 高確獲得率（通常） ============
const HIGH_PROB_RATES = {
    WEAK_CHERRY: 0.05,
    WATERMELON: 0.08,
    STRONG_CHERRY: 0.15,
    CHANCE: 0.20,
};

// ============ 高確種類振り分け ============
const HIGH_PROB_TYPES = {
    WEAK_CHERRY: {
        UP_PROB: 0.35,
        UP_GAME: 0.35,
        SANSEN: 0.25,
        ZONE: 0.05,
    },
    WATERMELON: {
        UP_PROB: 0.25,
        UP_GAME: 0.40,
        SANSEN: 0.25,
        ZONE: 0.10,
    },
    STRONG_CHERRY: {
        UP_PROB: 0.30,
        UP_GAME: 0.30,
        SANSEN: 0.25,
        ZONE: 0.15,
    },
    CHANCE: {
        UP_PROB: 0.15,
        UP_GAME: 0.20,
        SANSEN: 0.30,
        ZONE: 0.35,
    },
};

// ============ 参戦ゾーン突入率 ============
const SANSEN_TRIGGER_RATES = {
    WEAK_CHERRY: 0.05,
    WATERMELON: 0.07,
    STRONG_CHERRY: 0.12,
    CHANCE: 0.40,
};

// ============ 参戦ゾーンキャラクター出現率 ============
const SANSEN_CHARACTER_RATES = {
    A: 0.25,
    B: 0.25,
    C: 0.25,
    D: 0.0833,
    E: 0.0833,
    F: 0.0833,
};

// ============ バースト突入率 ============
const BURST_TRIGGER_RATES = {
    WEAK_CHERRY: 0,
    WATERMELON: 0,
    STRONG_CHERRY: 0.15,
    CHANCE: 0.15,
};

// ============ バースト報酬テーブル ============
const BURST_REWARD_TABLES = {
    1: {
        A: 0.70, B: 0.25, C: 0.05, D: 0, E: 0,
    },
    2: {
        A: 0.20, B: 0.55, C: 0.22, D: 0.03, E: 0,
    },
    3: {
        A: 0.05, B: 0.25, C: 0.50, D: 0.18, E: 0.02,
    },
    4: {
        A: 0, B: 0.10, C: 0.35, D: 0.45, E: 0.10,
    },
    5: {
        A: 0, B: 0, C: 0.15, D: 0.50, E: 0.35,
    },
    6: {
        A: 0, B: 0, C: 0.05, D: 0.30, E: 0.65,
    },
};

const BURST_REWARD_AMOUNTS = {
    A: [60, 70, 80, 100],
    B: [70, 80, 100, 120],
    C: [80, 100, 120, 150],
    D: [100, 120, 150, 200],
    E: [150, 200, 250, 300],
};

// ============ Attack Time上乗せ ============
const ATTACK_TIME_ADDON = {
    LOSE: 3,
    REPLAY: 5,
    BELL_11: 5,
    WEAK_CHERRY: 10,
    STRONG_CHERRY: 20,
};

// ============ Attack Time突入率 ============
const ATTACK_TIME_TRIGGER_RATES = {
    WEAK_CHERRY: 0.20,
    WATERMELON: 0.20,
    STRONG_CHERRY: 0,
    CHANCE: 0,
};

// ============ ゲーム状態定義 ============
const GAME_STATE = {
    NORMAL: 'NORMAL',
    BONUS_BIG: 'BONUS_BIG',
    BONUS_REG: 'BONUS_REG',
    BONUS_EPISODE: 'BONUS_EPISODE',
    CHALLENGE: 'CHALLENGE',
    ART: 'ART',
    SANSEN: 'SANSEN',
    BURST: 'BURST',
    ATTACK_TIME: 'ATTACK_TIME',
    REVERSE: 'REVERSE',
};

// ============ その他定数 ============
const BET_AMOUNT = 3;
const BIG_PAYMENT = 250;
const REG_PAYMENT = 70;
const ART_INITIAL_G = 60;
const CHALLENGE_G = 5;
const SANSEN_G = 10;
const BURST_G = 25;
const ATTACK_TIME_G = 3;
const HIGH_PROB_DURATION = 20;

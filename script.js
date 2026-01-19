const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const redSuits = new Set(['♥', '♦']);

// 降伏時の主張メッセージ配列
const SURRENDER_CLAIMS_WEAK = [
    'やはり相手のカードが強い。ここは潔く降伏だ。',
    '相手の方が手が強そうだ。これ以上は損切りだ。',
    '相手に勝算がない。戦略的撤退を選ぶ。',
    'リスク回避が最優先。ここは降伏が賢明だ。',
    '相手の札が明らかに優位。降伏が利口な判断だ。'
];

const SURRENDER_CLAIMS_STRONG = [
    'これは相手に勝つチャンスだ。だが降伏を選ぶ。',
    '自分のカードも悪くないが、ここは慎重に降伏だ。',
    '互角かもしれないが、潔く降伏しよう。',
    '迷いもあるが、戦略的に降伏を選択する。',
    '自分のカードは悪くないが、降伏が得策だ。'
];

// AI名前リスト（英語）
const AI_NAMES = ['Alex', 'Blake', 'Casey', 'Dakota', 'Everett', 'Finley', 'Grayson', 'Harper', 'Indigo', 'Jamie', 'Kai', 'Logan', 'Morgan', 'Nolan', 'Oscar', 'Parker', 'Quinn', 'Rowan', 'Sage', 'Taylor', 'Ulysses', 'Veda', 'Wesley', 'Xavier', 'Yara', 'Zephyr'];

// AI会話メッセージ
const AI_MESSAGES = [
    'さてどうなるか…',
    'やっぱりこのゲームは奥が深いな。',
    'まだまだ先は長い。',
    'うーん、悩ましいところだ。',
    'そろそろ真価が問われるね。',
    'リスク管理が大事だな。',
    'ここからが勝負だ。',
    '運も味方につけたい。',
    'もう一度チャンスが欲しい。',
    'どうなることやら。',
    '慎重に進めよう。',
    'ツキがまわってきた感じ。',
    'こういうときもあるよな。',
    '次のターンに期待。',
];

// AI手札が強い場合のメッセージ
const AI_MESSAGES_STRONG = [
    '俺に勝てるものか。',
    'この手札なら勝てるぞ。',
    '今のところ優位だ。',
    'いい流れが来てる。',
    '手札がいい感じだな。',
    '勝ちが見えてきた。',
    'このまま押し切るぞ。',
    'いい展開だ。',
    '相手より上手く立ち回ってる。',
    '俺のペースだ。'
];

// AI手札が弱い場合のメッセージ
const AI_MESSAGES_WEAK = [
    'どんなカードが来るかな…',
    'ツキはこっちだ。',
    '相手の動きが見えてる。',
    '戦略が上手くいってる。',
    'この流れなら大丈夫。',
    '次で逆転できそうだ。',
    '心配ないさ。',
    '堂々とやろう。',
    'リードは失わない。',
    'まだまだこれからだ。'
];

const TABLES = [
    { id: 't50', name: '$50', betFixed: 50, min: 50, difficulty: 0 },
    { id: 't100', name: '$100', betFixed: 100, min: 100, difficulty: 1 },
    { id: 't500', name: '$500', betFixed: 500, min: 500, difficulty: 2 },
    { id: 't1000', name: '$1000', betFixed: 1000, min: 1000, difficulty: 3 },
    { id: 't2000', name: '$2000', betFixed: 2000, min: 2000, difficulty: 3 },
    { id: 't5000', name: '$5000', betFixed: 5000, min: 5000, difficulty: 4 },
    { id: 'free', name: 'フリーテーブル', betFixed: null, min: 100, difficulty: 4, requiresBalance: 100 }
];

const STORE_ITEMS = [
    { key: 'warm', name: 'Warm テーマ', cost: 300, type: 'bg', desc: '暖色系' },
    { key: 'emerald', name: 'Emerald テーマ', cost: 500, type: 'bg', desc: 'エメラルド系' },
    { key: 'midnight', name: 'Midnight テーマ', cost: 1000, type: 'bg', desc: '深夜ブルー' },
    { key: 'grad_gold', name: 'Gold グラデ', cost: 2000, type: 'bg', desc: 'ゴールドグラデーション' },
    { key: 'grad_purple', name: 'Purple グラデ', cost: 5000, type: 'bg', desc: 'パープルグラデーション' },
    { key: 'card_neon', name: 'Neon カード', cost: 300, type: 'card', desc: 'ネオンカード' },
    { key: 'card_gold', name: 'Gold カード', cost: 1000, type: 'card', desc: 'ゴールドカード' },
    { key: 'card_rainbow', name: 'Rainbow カード', cost: 2000, type: 'card', desc: 'レインボーカード' }
];

let state = {
    deck: [], player: [], dealer: [], hold: new Set(), stage: 'idle', balance: 1000, bet: 50, stats: { win: 0, lose: 0, tie: 0 },
    turn: 0, selectedTable: null, theme: 'classic', cardSkin: 'classic', purchases: { classic: true }, aiName: '', messageCount: 0
};

const $ = id => document.getElementById(id);
const playerRow = $('playerRow'), dealerRow = $('dealerRow'), resultEl = $('result'), handLabel = $('handLabel'), historyEl = $('history');
const balanceEl = $('balance'), betInput = $('betAmount'), dealBtn = $('dealBtn'), drawBtn = $('drawBtn'), surrenderBtn = $('surrenderBtn'),
    newRoundBtn = $('newRound'), changeTableBtn = $('changeTableBtn'), statsEl = $('stats'), turnLabel = $('turnLabel');
const tableOverlay = $('tableOverlay'), tableGrid = $('tableGrid'), tableConfirm = $('tableConfirm');
const tableInfo = $('tableInfo'), storeBtn = $('storeBtn'), storeOverlay = $('storeOverlay'), storeGrid = $('storeGrid'), closeStore = $('closeStore');
const themeContainer = $('themes'), cardSkinContainer = $('cardSkins'), themeArea = $('themeArea'), cardSkinArea = $('cardSkinArea');
const messagePanel = $('messagePanel');

function addMessage(text, isAI = false, senderName = null) {
    const msg = document.createElement('div');
    msg.className = `message-item ${isAI ? 'ai' : ''}`;
    const displayName = senderName || (isAI ? state.aiName : 'あなた');
    msg.innerHTML = `<div class="message-sender">${displayName}</div><div>${text}</div>`;
    messagePanel.appendChild(msg);
    messagePanel.scrollTop = messagePanel.scrollHeight;
    if (messagePanel.children.length > 50) {
        messagePanel.removeChild(messagePanel.firstChild);
    }
}

function getRandomAIName() {
    return AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
}

function tryAddAIMessage() {
    // 毎ターン約60%の確率で表示
    if (Math.random() < 0.7) {
        // AIの手札とプレイヤーの手札を評価
        const comparison = compareHands(state.player, state.dealer);

        let msg = '';

        // AIが強い場合（60%で強気）、弱い場合（30%ではったり）
        if (comparison < 0) {
            // AIが勝ってる状態
            if (Math.random() < 0.6) {
                msg = AI_MESSAGES_STRONG[Math.floor(Math.random() * AI_MESSAGES_STRONG.length)];
            } else {
                msg = AI_MESSAGES[Math.floor(Math.random() * AI_MESSAGES.length)];
            }
        } else {
            // AIが負けてるか同等の状態
            if (Math.random() < 0.3) {
                msg = AI_MESSAGES_WEAK[Math.floor(Math.random() * AI_MESSAGES_WEAK.length)];
            } else {
                msg = AI_MESSAGES[Math.floor(Math.random() * AI_MESSAGES.length)];
            }
        }

        if (msg) {
            addMessage(msg, true);
        }
    }
    state.messageCount++;
}

function mkDeck() { const d = []; for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r, rankIndex: RANKS.indexOf(r) }); return d; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function draw(n) { return state.deck.splice(0, n); }
function resetPanes() { playerRow.innerHTML = ''; dealerRow.innerHTML = ''; }

function renderCard(card, idx, owner = 'player') {
    const el = document.createElement('div');
    el.className = 'card ' + (redSuits.has(card.suit) ? 'suit-red' : '');
    el.dataset.idx = idx;

    // apply card skin styles
    if (state.cardSkin === 'card_neon') {
        el.style.background = 'linear-gradient(180deg, #30ff97, #c4e4ff)';
        el.style.color = '#000';
    } else if (state.cardSkin === 'card_gold') {
        el.style.background = 'linear-gradient(180deg, #ffd700, #ffed4e)';
        el.style.color = '#333';
    } else if (state.cardSkin === 'card_rainbow') {
        el.style.background = 'linear-gradient(180deg, #ff0080, #ff8c00, #40e0d0, #0080ff)';
        el.style.color = '#fff';
    }

    el.innerHTML = `<div class="rank">${card.rank}</div><div class="suit" aria-hidden="true">${card.suit}</div>`;
    if (owner === 'player') {
        const btn = document.createElement('div');
        btn.className = 'hold-toggle';
        btn.textContent = state.hold.has(idx) ? '保持中' : '保持';
        btn.addEventListener('click', () => toggleHold(idx, el));
        el.appendChild(btn);
        el.addEventListener('click', () => toggleHold(idx, el));
    }
    return el;
}
function toggleHold(idx, el) {
    if (!['turn'].includes(state.stage)) return;
    if (state.hold.has(idx)) { state.hold.delete(idx); el.classList.remove('hold'); el.querySelector('.hold-toggle').textContent = '保持'; }
    else { state.hold.add(idx); el.classList.add('hold'); el.querySelector('.hold-toggle').textContent = '保持中'; }
}

function render() {
    resetPanes();
    state.dealer.forEach((c, i) => {
        let el;
        if (state.stage === 'show') el = renderCard(c, i, 'dealer');
        else { el = document.createElement('div'); el.className = 'card back'; el.textContent = 'CPU'; }
        dealerRow.appendChild(el);
    });
    state.player.forEach((c, i) => playerRow.appendChild(renderCard(c, i, 'player')));
    balanceEl.textContent = state.balance;
    betInput.value = state.bet;
    statsEl.textContent = `勝${state.stats.win} 敗${state.stats.lose} 引${state.stats.tie}`;
    turnLabel.textContent = state.stage === 'turn' ? `ターン: ${state.turn}/5` : 'ターン: -';
    historyEl.scrollTop = historyEl.scrollHeight;
    const tableSelected = !!state.selectedTable;
    $('dealBtn').disabled = !tableSelected || state.stage !== 'idle';
    betInput.disabled = !(tableSelected && !state.selectedTable.betFixed);
    newRoundBtn.disabled = !tableSelected;
    changeTableBtn.disabled = !tableSelected;
    surrenderBtn.disabled = state.stage !== 'turn';
    tableInfo.textContent = state.selectedTable ? `${state.selectedTable.name}（CPU強度 ${state.selectedTable.difficulty}）` : 'テーブルを選択してください';
    renderThemeList();
    renderCardSkinList();
}

function buildTableGrid() {
    tableGrid.innerHTML = '';
    TABLES.forEach(t => {
        const btn = document.createElement('div');
        btn.className = 'table-btn';
        btn.innerHTML = `<div style="font-weight:700">${t.name}</div><div class="small" style="opacity:0.8; margin-top:6px">${t.betFixed ? `固定ベット ${t.betFixed}` : `ミニマム ${t.min}（VIP）`}</div>`;
        btn.addEventListener('click', () => {
            Array.from(tableGrid.children).forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            tableConfirm.disabled = false;
            tableConfirm.dataset.sel = t.id;
        });
        tableGrid.appendChild(btn);
    });
}
buildTableGrid();

/* --- ゲーム内トースト通知 --- */
function showToast(msg, type = 'info', duration = 3500) {
    const container = $('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    container.appendChild(t);
    // 自動削除
    setTimeout(() => {
        t.style.transition = 'opacity .25s, transform .25s';
        t.style.opacity = '0';
        t.style.transform = 'translateY(-8px)';
        setTimeout(() => { try { container.removeChild(t); } catch (e) { } }, 260);
    }, duration);
    return t;
}

// tableConfirm handler
tableConfirm.addEventListener('click', () => {
    const id = tableConfirm.dataset.sel;
    const t = TABLES.find(x => x.id === id);
    if (!t) return;
    if (t.requiresBalance && state.balance < (t.requiresBalance || 0)) { showToast(`${t.name} の利用には最低${t.requiresBalance}コイン必要です`, 'error'); return; }
    state.selectedTable = { ...t };
    if (t.betFixed) { state.bet = t.betFixed; betInput.value = state.bet; betInput.disabled = true; }
    else { betInput.disabled = false; betInput.value = Math.min(state.balance, 5000); state.bet = Number(betInput.value); }
    tableOverlay.style.display = 'none';
    saveToLocal();
    render();
});

changeTableBtn.addEventListener('click', () => {
    tableOverlay.style.display = 'flex';
    tableConfirm.disabled = true;
    Array.from(tableGrid.children).forEach((btn, idx) => {
        if (state.selectedTable && TABLES[idx].id === state.selectedTable.id) btn.classList.add('active');
    });
});

const THEME_MAP = {
    classic: { bg1: 'linear-gradient(180deg,#071026 0%, #0b1426 50%)', bg2: 'radial-gradient(600px 300px at 10% 10%, rgba(255,204,51,0.04), transparent)' },
    warm: { bg1: 'linear-gradient(180deg,#2b0f05 0%, #5c1b07 50%)', bg2: 'radial-gradient(600px 300px at 10% 10%, rgba(255,120,20,0.06), transparent)' },
    emerald: { bg1: 'linear-gradient(180deg,#042b22 0%, #0b3f33 50%)', bg2: 'radial-gradient(600px 300px at 10% 10%, rgba(20,200,120,0.04), transparent)' },
    midnight: { bg1: 'linear-gradient(180deg,#0b1630 0%, #071b3a 50%)', bg2: 'radial-gradient(600px 300px at 10% 10%, rgba(150,170,255,0.03), transparent)' },
    grad_gold: { bg1: 'linear-gradient(180deg, #FFD700, #FFA500, #FF6347)', bg2: 'radial-gradient(600px 300px at 10% 10%, rgba(255,215,0,0.08), transparent)' },
    grad_purple: { bg1: 'linear-gradient(180deg, #6A0DAD, #9932CC, #BA55D3)', bg2: 'radial-gradient(600px 300px at 10% 10%, rgba(153,50,204,0.08), transparent)' }
};

function buildStore() {
    storeGrid.innerHTML = '';
    STORE_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'store-item' + (state.purchases[item.key] ? ' owned' : '');

        let previewHTML = '';
        if (item.type === 'bg') {
            const t = THEME_MAP[item.key] || { bg1: '#333', bg2: '' };
            previewHTML = `<div class="store-preview" style="background: ${t.bg1}"></div>`;
        } else if (item.type === 'card') {
            previewHTML = `<div class="store-preview" style="background: linear-gradient(180deg, var(--preview-bg1), var(--preview-bg2)); position:relative; overflow:hidden;">
    <span style="position:absolute; top:5px; left:5px; font-weight:700; font-size:14px;">K</span>
    <span style="position:absolute; bottom:5px; right:5px; font-weight:700; font-size:14px; transform:rotate(180deg);">♠</span>
  </div>`;
        }

        div.innerHTML = `<div style="font-weight:700">${item.name}</div><div class="small" style="opacity:0.9;margin-top:6px">${item.desc}</div>${previewHTML}<div style="margin-top:10px;font-weight:800">${item.cost} コイン</div><div style="margin-top:10px"><button class="btn buyBtn">${state.purchases[item.key] ? '購入済み' : '購入'}</button></div>`;
        const btn = div.querySelector('.buyBtn');
        btn.disabled = !!state.purchases[item.key];
        // 購入確認ダイアログを廃止し、クリックで即購入（残高不足はトースト）
        btn.addEventListener('click', () => {
            if (state.balance < item.cost) { showToast('残高が足りません', 'error'); return; }
            // そのまま購入処理
            state.balance -= item.cost;
            state.purchases[item.key] = true;
            saveToLocal();
            buildStore();
            render();
            showToast(`${item.name} を購入しました`, 'success');
        });
        storeGrid.appendChild(div);
    });
}
storeBtn.addEventListener('click', () => { buildStore(); storeOverlay.style.display = 'flex'; });
closeStore.addEventListener('click', () => storeOverlay.style.display = 'none');

function renderThemeList() {
    themeContainer.innerHTML = '';
    ['classic', 'warm', 'emerald', 'midnight', 'grad_gold', 'grad_purple'].forEach(key => {
        if (!state.purchases[key]) return;
        const sw = document.createElement('div');
        sw.className = 'theme-swatch';
        sw.title = key;
        const bg = THEME_MAP[key] || THEME_MAP.classic;
        sw.style.background = bg.bg1;
        sw.dataset.theme = key;
        sw.addEventListener('click', () => applyTheme(key));
        if (state.theme === key) sw.style.outline = '3px solid rgba(255,204,51,0.12)';
        themeContainer.appendChild(sw);
    });
    themeArea.style.display = themeContainer.children.length > 0 ? 'block' : 'none';
}

function renderCardSkinList() {
    cardSkinContainer.innerHTML = '';
    ['classic', 'card_neon', 'card_gold', 'card_rainbow'].forEach(key => {
        if (!state.purchases[key]) return;
        const sw = document.createElement('div');
        sw.className = 'theme-swatch';
        sw.title = key;
        if (key === 'classic') { sw.style.background = '#fff'; }
        else if (key === 'card_neon') { sw.style.background = 'linear-gradient(180deg, #00ff88, #0088ff)'; }
        else if (key === 'card_gold') { sw.style.background = 'linear-gradient(180deg, #ffd700, #ffed4e)'; }
        else if (key === 'card_rainbow') { sw.style.background = 'linear-gradient(180deg, #ff0080, #ff8c00, #40e0d0, #0080ff)'; }
        sw.dataset.key = key;
        sw.addEventListener('click', () => applyCardSkin(key));
        if (state.cardSkin === key) sw.style.outline = '3px solid rgba(255,204,51,0.12)';
        cardSkinContainer.appendChild(sw);
    });
    cardSkinArea.style.display = cardSkinContainer.children.length > 0 ? 'block' : 'none';
}

function applyTheme(key) {
    if (key !== 'classic' && !state.purchases[key]) { showToast('このテーマは未購入です。ストアで購入してください', 'info'); return; }
    const t = THEME_MAP[key] || THEME_MAP.classic;
    document.documentElement.style.setProperty('--bg-1', t.bg1);
    document.documentElement.style.setProperty('--bg-2', t.bg2);
    state.theme = key;
    saveToLocal();
    render();
}
function applyCardSkin(key) {
    if (key !== 'classic' && !state.purchases[key]) { showToast('このカードスキンは未購入です。ストアで購入してください', 'info'); return; }
    state.cardSkin = key;
    saveToLocal();
    render();
}

function startDeal() {
    if (!state.selectedTable) { showToast('テーブルを選択してください', 'info'); return; }
    const minAllowed = state.selectedTable.min || 1;
    const betVal = state.selectedTable.betFixed ? state.selectedTable.betFixed : Math.max(minAllowed, Math.min(state.balance, Number(betInput.value) || minAllowed));
    if (betVal > state.balance) { showToast('残高不足', 'error'); return; }
    state.bet = betVal;
    state.balance -= state.bet;
    state.deck = shuffle(mkDeck());
    state.player = draw(5);
    state.dealer = draw(5);
    state.hold = new Set();
    state.stage = 'turn';
    state.turn = 1;
    state.messageCount = 0;
    if (!state.aiName) state.aiName = getRandomAIName();
    drawBtn.disabled = false;
    dealBtn.disabled = true;
    resultEl.textContent = `ターン ${state.turn} - カードを保持して「ドロー」`;
    handLabel.textContent = '-';
    const startMsgs = ['ゲーム開始！', '開始！！！'];
    addMessage(startMsgs[Math.floor(Math.random() * startMsgs.length)], false, 'Gr3njaPorker');
    render();
}

function evaluateHand(cards) {
    const ranks = cards.map(c => c.rankIndex).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    const counts = {};
    for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
    const countVals = Object.values(counts).sort((a, b) => b - a);
    const isFlush = new Set(suits).size === 1;
    let isStraight = false;
    let isSeq = true;
    for (let i = 1; i < ranks.length; i++) { if (ranks[i] !== ranks[i - 1] + 1) { isSeq = false; break; } }
    const aceLow = JSON.stringify(ranks) === JSON.stringify([0, 1, 2, 3, 12]);
    if (isSeq || aceLow) isStraight = true;
    const getName = (r) => ['', 'ハイカード', 'ペア', 'ツーペア', 'スリーカード', 'ストレート', 'フラッシャ', 'フルハウス', 'フォーカード', 'ストレートフラッシュ'][r] || '';
    let rank = 1; let tiebreak = [];
    if (isStraight && isFlush) { rank = 9; tiebreak = [Math.max(...ranks)]; }
    else if (countVals[0] === 4) { rank = 8; const four = Number(Object.keys(counts).find(k => counts[k] === 4)); const kicker = Number(Object.keys(counts).find(k => counts[k] === 1)); tiebreak = [four, kicker]; }
    else if (countVals[0] === 3 && countVals[1] === 2) { rank = 7; const three = Number(Object.keys(counts).find(k => counts[k] === 3)); tiebreak = [three]; }
    else if (isFlush) { rank = 6; tiebreak = ranks.slice().reverse(); }
    else if (isStraight) { rank = 5; tiebreak = [Math.max(...ranks)]; }
    else if (countVals[0] === 3) { rank = 4; const three = Number(Object.keys(counts).find(k => counts[k] === 3)); const kickers = Object.keys(counts).filter(k => counts[k] === 1).map(Number).sort((a, b) => b - a); tiebreak = [three, ...kickers]; }
    else if (countVals[0] === 2 && countVals[1] === 2) { rank = 3; const pairs = Object.keys(counts).filter(k => counts[k] === 2).map(Number).sort((a, b) => b - a); const kicker = Number(Object.keys(counts).find(k => counts[k] === 1)); tiebreak = [...pairs, kicker]; }
    else if (countVals[0] === 2) { rank = 2; const pair = Number(Object.keys(counts).find(k => counts[k] === 2)); const kickers = Object.keys(counts).filter(k => counts[k] === 1).map(Number).sort((a, b) => b - a); tiebreak = [pair, ...kickers]; }
    else { rank = 1; tiebreak = ranks.slice().reverse(); }
    return { rank, name: getName(rank), tiebreak };
}
function compareHands(playerCards, dealerCards) {
    const p = evaluateHand(playerCards);
    const d = evaluateHand(dealerCards);
    if (p.rank > d.rank) return 1;
    if (p.rank < d.rank) return -1;
    for (let i = 0; i < Math.max(p.tiebreak.length, d.tiebreak.length); i++) {
        const a = p.tiebreak[i] || 0, b = d.tiebreak[i] || 0;
        if (a > b) return 1;
        if (a < b) return -1;
    }
    return 0;
}

function cpuHoldStrategy(cards, difficulty) {
    const counts = {};
    cards.forEach(c => counts[c.rankIndex] = (counts[c.rankIndex] || 0) + 1);
    const hold = new Set();
    for (let i = 0; i < cards.length; i++) if (counts[cards[i].rankIndex] >= 2) hold.add(i);
    const suitCounts = {}; cards.forEach((c, i) => suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1);
    const bestSuit = Object.keys(suitCounts).sort((a, b) => suitCounts[b] - suitCounts[a])[0];
    if (suitCounts[bestSuit] >= 4) cards.forEach((c, i) => { if (c.suit === bestSuit) hold.add(i); });
    const ranks = cards.map(c => c.rankIndex).sort((a, b) => a - b);
    for (let i = 0; i < 5; i++) {
        const subset = ranks.slice(0, 4);
        if ((subset[3] - subset[0]) <= 4) { cards.forEach((c, idx) => { if (subset.includes(c.rankIndex)) hold.add(idx); }); }
    }
    if (difficulty >= 2) {
        if (Object.values(counts).every(v => v === 1)) {
            const sortedIdx = cards.map((c, i) => ({ i, rank: c.rankIndex })).sort((a, b) => b.rank - a.rank).slice(0, difficulty >= 3 ? 3 : 2);
            sortedIdx.forEach(x => hold.add(x.i));
        }
    }
    if (difficulty >= 4) {
        // VIP: very aggressive strategy
        const hasHigh = cards.some(c => c.rankIndex >= 10);
        if (!hasHigh && Object.values(counts).every(v => v === 1)) {
            cards.forEach((c, i) => { if (c.rankIndex >= 8) hold.add(i); });
        }
    }
    return hold;
}

function doDraw() {
    if (state.stage !== 'turn') return;
    const replacements = [];
    for (let i = 0; i < 5; i++) if (!state.hold.has(i)) replacements.push(i);
    const newCards = draw(replacements.length);
    replacements.forEach((idx, i) => state.player[idx] = newCards[i]);
    const cpuHold = cpuHoldStrategy(state.dealer, state.selectedTable ? state.selectedTable.difficulty : 0);
    const cpuReplacements = [];
    for (let i = 0; i < 5; i++) if (!cpuHold.has(i)) cpuReplacements.push(i);
    const cpuNew = draw(cpuReplacements.length);
    cpuReplacements.forEach((idx, i) => state.dealer[idx] = cpuNew[i]);

    if (state.turn < 5) {
        state.turn++;
        state.hold = new Set();
        resultEl.textContent = `ターン ${state.turn} - カードを保持して「ドロー」`;
        tryAddAIMessage();
    } else {
        state.stage = 'show';
        drawBtn.disabled = true;
        dealBtn.disabled = false;
        const res = compareHands(state.player, state.dealer);
        const pEval = evaluateHand(state.player);
        const dEval = evaluateHand(state.dealer);
        let text = '';
        if (res > 0) { state.balance += state.bet * 2; state.stats.win++; text = `勝ち！(${pEval.name} > ${dEval.name})`; addMessage(`やられたね…`, true); }
        else if (res < 0) { state.stats.lose++; text = `負け… (${pEval.name} < ${dEval.name})`; addMessage(`勝った！`, true); }
        else { state.balance += state.bet; state.stats.tie++; text = `引き分け (${pEval.name} = ${dEval.name})`; addMessage(`相討ちか…`, true); }
        resultEl.textContent = text;
        handLabel.textContent = pEval.name;
        addHistory({ player: state.player.slice(), dealer: state.dealer.slice(), result: text });
        saveToLocal();
    }
    render();
}

function doSurrender() {
    if (state.stage !== 'turn') return;
    state.stage = 'surrender';
    drawBtn.disabled = true;
    dealBtn.disabled = false;
    surrenderBtn.disabled = true;

    const pEval = evaluateHand(state.player);
    const dEval = evaluateHand(state.dealer);
    const res = compareHands(state.player, state.dealer);

    // 相手のカード強度に基づいて60%/40%で主張を選択
    const isStrongOpponent = res < 0;
    const claimArray = isStrongOpponent ? SURRENDER_CLAIMS_WEAK : SURRENDER_CLAIMS_STRONG;
    const randomIndex = Math.floor(Math.random() * claimArray.length);
    const claim = claimArray[randomIndex];

    // 降伏時に掛け金の50%を還元
    const refund = Math.floor(state.bet * 0.5);
    state.balance += refund;

    const text = `降伏 - ${refund} コイン返金`;
    resultEl.innerHTML = `${claim}<br><br>${text}`;
    handLabel.textContent = pEval.name;
    addHistory({ player: state.player.slice(), dealer: state.dealer.slice(), result: `降伏（${claim}）` });
    addMessage('そっか、降伏か。また次の勝負だ。', true);
    state.stats.tie++;
    saveToLocal();
    render();
}

function addHistory(entry) {
    const el = document.createElement('div');
    el.className = 'hand-highlight';
    const ph = entry.player.map(c => c.rank + c.suit).join(' ');
    const dh = entry.dealer.map(c => c.rank + c.suit).join(' ');
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><div class="small">P: ${ph}</div><div class="small">CPU: ${dh}</div></div><div class="small" style="margin-top:6px">${entry.result}</div>`;
    historyEl.appendChild(el);
    if (historyEl.children.length > 50) historyEl.removeChild(historyEl.firstChild);
}

function newRound() {
    if (!state.selectedTable) { showToast('テーブルを選択してください', 'info'); return; }
    state.stage = 'idle';
    state.player = []; state.dealer = []; state.deck = [];
    state.hold = new Set();
    state.turn = 0;
    state.messageCount = 0;
    messagePanel.innerHTML = '';
    resultEl.textContent = 'ベットしてディールしてください';
    handLabel.textContent = '-';
    drawBtn.disabled = true;
    dealBtn.disabled = false;
    render();
}

/* ローカルストレージ保存（IndexedDB より安定） */
function saveToLocal() {
    const payload = {
        balance: state.balance,
        stats: state.stats,
        theme: state.theme,
        cardSkin: state.cardSkin,
        selectedTableId: state.selectedTable ? state.selectedTable.id : null,
        purchases: state.purchases,
        lastBonus: state.lastBonus || null
    };
    localStorage.setItem('poker_data', JSON.stringify(payload));
}

function loadFromLocal() {
    const saved = localStorage.getItem('poker_data');
    if (!saved) return false;
    try {
        const p = JSON.parse(saved);
        if (p.balance != null) state.balance = p.balance;
        if (p.stats) state.stats = p.stats;
        if (p.purchases) state.purchases = p.purchases;
        if (p.theme && (state.purchases[p.theme] || p.theme === 'classic')) state.theme = p.theme;
        if (p.cardSkin && (state.purchases[p.cardSkin] || p.cardSkin === 'classic')) state.cardSkin = p.cardSkin;
        if (p.selectedTableId) {
            const t = TABLES.find(x => x.id === p.selectedTableId);
            if (t) state.selectedTable = { ...t };
        }
        if (p.lastBonus) state.lastBonus = p.lastBonus;
        // apply theme
        if (state.theme) {
            const bg = THEME_MAP[state.theme] || THEME_MAP.classic;
            document.documentElement.style.setProperty('--bg-1', bg.bg1);
            document.documentElement.style.setProperty('--bg-2', bg.bg2);
        }
        return true;
    } catch (e) { return false; }
}

/* イベント */
dealBtn.addEventListener('click', startDeal);
drawBtn.addEventListener('click', () => {
    drawBtn.disabled = true;
    setTimeout(() => drawBtn.disabled = false, 200);
    doDraw();
});
surrenderBtn.addEventListener('click', doSurrender);
newRoundBtn.addEventListener('click', newRound);
betInput.addEventListener('change', () => {
    const minAllowed = state.selectedTable ? (state.selectedTable.min || 1) : 1;
    state.bet = Math.max(minAllowed, Math.min(state.balance, Number(betInput.value) || minAllowed));
    betInput.value = state.bet;
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'd') dealBtn.click();
    if (e.key === ' ') { if (!drawBtn.disabled) drawBtn.click(); }
});

/* --- 15分ボーナス機能 --- */
const BONUS_INTERVAL = 15 * 60 * 1000; // 15分
const BONUS_AMOUNT = 200;
const bonusBtn = (function () { try { return $('bonusBtn'); } catch (e) { return null; } })();
const bonusTimerEl = (function () { try { return $('bonusTimer'); } catch (e) { return null; } })();

function canClaimBonus() { return !state.lastBonus || (Date.now() - state.lastBonus) >= BONUS_INTERVAL; }
function formatMs(ms) {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
function updateBonusUI() {
    if (!bonusBtn || !bonusTimerEl) return;
    if (canClaimBonus()) {
        bonusBtn.disabled = false;
        bonusTimerEl.textContent = 'ボーナス受け取り可能';
    } else {
        bonusBtn.disabled = true;
        const rem = BONUS_INTERVAL - (Date.now() - state.lastBonus);
        bonusTimerEl.textContent = `次回: ${formatMs(rem)}`;
    }
}

if (bonusBtn) {
    bonusBtn.addEventListener('click', () => {
        if (!canClaimBonus()) return;
        state.balance += BONUS_AMOUNT;
        state.lastBonus = Date.now();
        saveToLocal();
        render();
        updateBonusUI();
        showToast(`${BONUS_AMOUNT} ゴールドを受け取りました`, 'success');
    });
    setInterval(updateBonusUI, 1000);
}

/* 初期化 */
(function init() {
    state.purchases = { classic: true };
    loadFromLocal();
    // ensure defaults
    if (!state.theme) state.theme = 'classic';
    if (!state.cardSkin) state.cardSkin = 'classic';
    // set bet input min according to selected table
    if (state.selectedTable && !state.selectedTable.betFixed) {
        betInput.min = state.selectedTable.min || 1;
    } else {
        betInput.min = 1;
    }
    tableOverlay.style.display = state.selectedTable ? 'none' : 'flex';
    render();
    updateBonusUI();
})();

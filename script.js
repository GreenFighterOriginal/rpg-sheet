// script.js
const SHEET_ID = '1KN-5MPQgaycA6VTSFjU0k9Z91nO5DjUeelMw9qk3jbQ';

// ==========================================
// DOM
// ==========================================

const table = document.getElementById('data-table');

const avatar = document.getElementById('avatar');
const characterName = document.getElementById('character-name');

const hpFill = document.getElementById('hp-fill');
const mpFill = document.getElementById('mp-fill');

const hpText = document.getElementById('hp-text');
const mpText = document.getElementById('mp-text');

const tabs = document.querySelectorAll('.tab');

// ==========================================
// FETCH SHEET
// ==========================================

async function fetchSheet(range) {

  const [sheet, cells] = range.split('!');

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${sheet}&range=${cells}&tqx=out:json`;

  console.log('FETCH URL:', url);

  const res = await fetch(url);
  const text = await res.text();

  console.log('RAW RESPONSE:', text.slice(0, 200));

  const json =
    JSON.parse(text.substring(47, text.length - 2));

  console.log('PARSED JSON:', json);

  return json.table.rows || [];
}

// ==========================================
// SAFE CELL READER
// ==========================================

function getCell(cell) {

  if (!cell) return '';

  console.log('CELL RAW:', cell);

  if (cell.f !== undefined && cell.f !== null && cell.f !== '') {
    console.log('CELL F USED:', cell.f);
    return String(cell.f);
  }

  if (cell.v !== undefined && cell.v !== null) {
    console.log('CELL V USED:', cell.v);
    return String(cell.v);
  }

  return '';
}

// ==========================================
// LOAD TABLE
// ==========================================

async function loadRange(range) {

  const rows = await fetchSheet(range);

  console.log('TABLE ROWS:', rows);

  table.innerHTML = '';

  rows.forEach((row, i) => {

    const tr = document.createElement('tr');

    const cells = row.c || [];

    cells.forEach(cell => {

      const el = document.createElement(i === 0 ? 'th' : 'td');

      const value = getCell(cell);

      console.log(`TABLE CELL [${i}]:`, value);

      el.textContent = value;

      tr.appendChild(el);
    });

    table.appendChild(tr);
  });
}

// ==========================================
// LOAD CONFIG (FULL DEBUG)
// ==========================================

async function loadConfig() {

  const rows = await fetchSheet('Config!A:B');

  console.log('CONFIG ROWS RAW:', rows);

  const config = {};

  for (const row of rows) {

    const cells = row.c || [];

    const keyCell = cells[0];
    const valCell = cells[1];

    const rawKey = getCell(keyCell);
    const rawVal = getCell(valCell);

    console.log('KEY RAW:', rawKey, 'VALUE RAW:', rawVal);

    const key = String(rawKey || '').trim().toLowerCase();
    const value = String(rawVal || '').trim();

    if (!key) {
      console.log('SKIP EMPTY KEY');
      continue;
    }

    config[key] = value;
  }

  console.log('FINAL CONFIG OBJECT:', config);

  // ==========================================
  // APPLY UI
  // ==========================================

console.log('NAME CHECK:', config.name);

if (!config.name) {
  console.warn('NAME IS EMPTY');
}

characterName.innerText = '';
characterName.innerText = String(config.name);

console.log('NAME IN DOM:', characterName.innerText);

  console.log('NAME APPLIED:', characterName.textContent);

  if (config.avatar) {
    avatar.src = config.avatar;
    console.log('AVATAR SET:', config.avatar);
  } else {
    console.log('NO AVATAR');
  }

  const hp = Number(config.hp || 0);
  const maxhp = Number(config.maxhp || 1);

  const mp = Number(config.mp || 0);
  const maxmp = Number(config.maxmp || 1);

  const hpPercent = (hp / maxhp) * 100;
  const mpPercent = (mp / maxmp) * 100;

  hpFill.style.width = hpPercent + '%';
  mpFill.style.width = mpPercent + '%';

  hpText.textContent = `${hp}/${maxhp}`;
  mpText.textContent = `${mp}/${maxmp}`;

  console.log('HP/MP LOADED:', { hp, maxhp, mp, maxmp });
}

// ==========================================
// TABS
// ==========================================

tabs.forEach(tab => {

  tab.addEventListener('click', () => {

    tabs.forEach(t => t.classList.remove('active'));

    tab.classList.add('active');

    console.log('TAB CLICKED:', tab.dataset.range);

    loadRange(tab.dataset.range);
  });
});

// ==========================================
// INIT
// ==========================================

loadConfig();
loadRange('Inventory!A:D');

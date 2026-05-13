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

  const res = await fetch(url);

  const text = await res.text();

  const json =
    JSON.parse(text.substring(47, text.length - 2));

  return json.table.rows || [];
}

// ==========================================
// SAFE CELL READ
// ==========================================

function getCell(cell) {
  if (!cell) return '';
  if (cell.v !== undefined) return cell.v;
  if (cell.f !== undefined) return cell.f;
  return '';
}

// ==========================================
// LOAD TABLES (INVENTORY ETC)
// ==========================================

async function loadRange(range) {

  const rows = await fetchSheet(range);

  table.innerHTML = '';

  rows.forEach((row, i) => {

    const tr = document.createElement('tr');

    const cells = row.c || [];

    cells.forEach(cell => {

      const tag = i === 0 ? 'th' : 'td';
      const el = document.createElement(tag);

      el.textContent = getCell(cell);

      tr.appendChild(el);
    });

    table.appendChild(tr);
  });
}

// ==========================================
// LOAD CONFIG (FIXED)
// ==========================================

async function loadConfig() {

  const rows = await fetchSheet('Config!A:B');

  const config = {};

  rows.forEach(row => {

    if (!row.c || !row.c[0]) return;

    const key = String(getCell(row.c[0])).trim().toLowerCase();
    const value = row.c[1] ? String(getCell(row.c[1])).trim() : '';

    if (key) config[key] = value;
  });

  console.log('CONFIG:', config);

  // NAME
  characterName.textContent =
    config.name || 'Безымянный';

  // AVATAR
  if (config.avatar) {
    avatar.src = config.avatar;
  }

  // HP / MP
  const hp = Number(config.hp || 0);
  const maxhp = Number(config.maxhp || 1);

  const mp = Number(config.mp || 0);
  const maxmp = Number(config.maxmp || 1);

  hpFill.style.width = (hp / maxhp) * 100 + '%';
  mpFill.style.width = (mp / maxmp) * 100 + '%';

  hpText.textContent = `${hp}/${maxhp}`;
  mpText.textContent = `${mp}/${maxmp}`;
}

// ==========================================
// TABS
// ==========================================

tabs.forEach(tab => {

  tab.addEventListener('click', () => {

    tabs.forEach(t => t.classList.remove('active'));

    tab.classList.add('active');

    loadRange(tab.dataset.range);
  });
});

// ==========================================
// INIT
// ==========================================

loadConfig();
loadRange('Inventory!A:D');

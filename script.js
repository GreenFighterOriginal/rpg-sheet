// script.js
const SHEET_ID = '1KN-5MPQgaycA6VTSFjU0k9Z91nO5DjUeelMw9qk3jbQ';

const table = document.getElementById('data-table');

const avatar = document.getElementById('avatar');
const characterName = document.getElementById('character-name');

const hpFill = document.getElementById('hp-fill');
const mpFill = document.getElementById('mp-fill');

const hpText = document.getElementById('hp-text');
const mpText = document.getElementById('mp-text');

const tabs = document.querySelectorAll('.tab');

// ==========================================
// GOOGLE SHEETS FETCH
// ==========================================

async function fetchSheet(range) {

  const [sheet, cells] = range.split('!');

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${sheet}&range=${cells}&tqx=out:json`;

  const response = await fetch(url);

  const text = await response.text();

  const json =
    JSON.parse(text.substr(47).slice(0, -2));

  return json.table.rows;
}

// ==========================================
// GET CELL VALUE
// ==========================================

function getCellValue(cell) {

  if (!cell) return '';

  // formatted value
  if (cell.f !== undefined) return cell.f;

  // raw value
  if (cell.v !== undefined) return cell.v;

  return '';
}

// ==========================================
// LOAD TABLE
// ==========================================

async function loadRange(range) {

  const rows = await fetchSheet(range);

  renderTable(rows);
}

// ==========================================
// RENDER TABLE
// ==========================================

function renderTable(rows) {

  table.innerHTML = '';

  rows.forEach((row, index) => {

    const tr = document.createElement('tr');

    row.c.forEach(cell => {

      const element =
        document.createElement(
          index === 0 ? 'th' : 'td'
        );

      element.textContent =
        getCellValue(cell);

      tr.appendChild(element);
    });

    table.appendChild(tr);
  });
}

// ==========================================
// LOAD CONFIG
// ==========================================

async function loadConfig() {

  const rows =
    await fetchSheet('Config!A:B');

  const config = {};

  rows.forEach(row => {

    const key =
      getCellValue(row.c[0]);

    const value =
      getCellValue(row.c[1]);

    if (key) {
      config[key.toLowerCase()] = value;
    }
  });

  // ==========================================
  // NAME
  // ==========================================

  characterName.textContent =
    config.name || 'Безымянный';

  // ==========================================
  // AVATAR
  // ==========================================

  avatar.src =
    config.avatar || '';

  // ==========================================
  // HP / MP
  // ==========================================

  const hp =
    Number(config.hp || 0);

  const maxhp =
    Number(config.maxhp || 1);

  const mp =
    Number(config.mp || 0);

  const maxmp =
    Number(config.maxmp || 1);

  const hpPercent =
    (hp / maxhp) * 100;

  const mpPercent =
    (mp / maxmp) * 100;

  hpFill.style.width =
    hpPercent + '%';

  mpFill.style.width =
    mpPercent + '%';

  hpText.textContent =
    `${hp}/${maxhp}`;

  mpText.textContent =
    `${mp}/${maxmp}`;
}

// ==========================================
// TABS
// ==========================================

tabs.forEach(tab => {

  tab.addEventListener('click', () => {

    tabs.forEach(t =>
      t.classList.remove('active')
    );

    tab.classList.add('active');

    loadRange(tab.dataset.range);
  });
});

// ==========================================
// INIT
// ==========================================

loadConfig();

loadRange('Inventory!A:D');

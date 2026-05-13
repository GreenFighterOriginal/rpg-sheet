// script.js
const SHEET_ID = '1CqwG8KHjC4_TvZvbDuhaQfvbTU63MDIUM_dI1G9Z5V0';

// ==========================================

const CONFIG_RANGE = 'Config!A1:B20';

const table = document.getElementById('data-table');

const avatar = document.getElementById('avatar');
const characterName = document.getElementById('character-name');

const hpFill = document.getElementById('hp-fill');
const mpFill = document.getElementById('mp-fill');

const hpText = document.getElementById('hp-text');
const mpText = document.getElementById('mp-text');

const tabs = document.querySelectorAll('.tab');

async function loadRange(range) {

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${range.split('!')[0]}&range=${range.split('!')[1]}&tqx=out:json`;

  const response = await fetch(url);

  const text = await response.text();

  const json = JSON.parse(text.substr(47).slice(0, -2));

  const rows = json.table.rows;

  renderTable(rows);
}

function renderTable(rows) {

  table.innerHTML = '';

  rows.forEach((row, index) => {

    const tr = document.createElement('tr');

    row.c.forEach(cell => {

      const element = document.createElement(
        index === 0 ? 'th' : 'td'
      );

      element.textContent = cell ? cell.v : '';

      tr.appendChild(element);
    });

    table.appendChild(tr);
  });
}

async function loadConfig() {

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Config&range=A1:B20&tqx=out:json`;

  const response = await fetch(url);

  const text = await response.text();

  const json = JSON.parse(text.substr(47).slice(0, -2));

  const rows = json.table.rows;

  const config = {};

  rows.forEach(row => {

    const key = row.c[0]?.v;
    const value = row.c[1]?.v;

    if (key) {
      config[key] = value;
    }
  });

  characterName.textContent = config.name;

  avatar.src = config.avatar;

  const hpPercent =
    (config.hp / config.maxhp) * 100;

  const mpPercent =
    (config.mp / config.maxmp) * 100;

  hpFill.style.width = hpPercent + '%';
  mpFill.style.width = mpPercent + '%';

  hpText.textContent =
    `${config.hp}/${config.maxhp}`;

  mpText.textContent =
    `${config.mp}/${config.maxmp}`;
}

tabs.forEach(tab => {

  tab.addEventListener('click', () => {

    tabs.forEach(t => t.classList.remove('active'));

    tab.classList.add('active');

    loadRange(tab.dataset.range);
  });
});

loadConfig();

loadRange('Inventory!A1:D20');

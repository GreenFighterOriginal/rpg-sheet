// script.js

const SHEET_ID = '1KN-5MPQgaycA6VTSFjU0k9Z91nO5DjUeelMw9qk3jbQ';

// ==========================
// DOM
// ==========================

const table = document.getElementById('data-table');

const avatar = document.getElementById('avatar');
const characterName = document.getElementById('character-name');

const hpFill = document.getElementById('hp-fill');
const mpFill = document.getElementById('mp-fill');

const hpText = document.getElementById('hp-text');
const mpText = document.getElementById('mp-text');

const tabs = document.querySelectorAll('.tab');

const equipmentScreen = document.getElementById('equipment-screen');
const tableScreen = document.getElementById('table-screen');

const inventoryGrid = document.getElementById('inventory-grid');

const tooltip = document.getElementById('tooltip');

// ==========================
// DATABASE
// ==========================

const itemsDB = {};

const equipment = {
  head: null,
  chest: null,
  legs: null,
  boots: null,
  gloves: null,
  weapon: null,
  shield: null,
  amulet: null,
  belt: null,
  ring1: null,
  ring2: null,
};

const beltSlots = [null, null, null, null, null, null];

const inventory = [];

// ==========================
// FETCH SHEET
// ==========================

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

// ==========================
// SAFE GET
// ==========================

function getCell(cell) {

  if (!cell) return '';

  if (cell.v !== undefined && cell.v !== null) {
    return String(cell.v);
  }

  if (cell.f !== undefined && cell.f !== null) {
    return String(cell.f);
  }

  return '';
}

// ==========================
// LOAD CONFIG
// ==========================

async function loadConfig() {

  const rows = await fetchSheet('Config!A:B');

  const config = {};

  for (const row of rows) {

    const cells = row.c || [];

    const key =
      cells[0]
        ? getCell(cells[0]).trim().toLowerCase()
        : '';

    const value =
      cells[1]
        ? getCell(cells[1]).trim()
        : '';

    if (!key) continue;

    config[key] = value;
  }

  // NAME

  const name = config.name;

  characterName.innerText =
    name && name.trim().length > 0
      ? name
      : 'Безымянный';

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

// ==========================
// LOAD ITEMS DATABASE
// ==========================

async function loadItemsDatabase() {

  const rows = await fetchSheet('Items!A:G');

  rows.slice(1).forEach(row => {

    const c = row.c || [];

    const item = {

      id: getCell(c[0]),
      name: getCell(c[1]),
      slot: getCell(c[2]),
      icon: getCell(c[3]),
      rarity: getCell(c[4]),
      type: getCell(c[5]),
      description: getCell(c[6]),
    };

    itemsDB[item.id] = item;
  });
}

// ==========================
// LOAD CHARACTER INVENTORY
// ==========================

async function loadCharacterInventory() {

  const rows =
    await fetchSheet('CharacterInventory!A:C');

  rows.slice(1).forEach(row => {

    const c = row.c || [];

    const itemId = getCell(c[0]);

    const location = getCell(c[1]);

    const slot = getCell(c[2]);

    const item = itemsDB[itemId];

    if (!item) return;

    // EQUIPMENT

    if (location === 'equipment') {

      equipment[slot] = item;
    }

    // BELT

    else if (location === 'belt') {

      beltSlots[Number(slot)] = item;
    }

    // INVENTORY

    else {

      inventory.push(item);
    }
  });
}

// ==========================
// CREATE ITEM ELEMENT
// ==========================

function createItemElement(item) {

  const img = document.createElement('img');

  img.src = `./assets/${item.icon}`;

  img.className =
    `item-icon rarity-${item.rarity}`;

  img.draggable = true;

  img.dataset.itemId = item.id;

  // DRAG

  img.addEventListener('dragstart', e => {

    e.dataTransfer.setData('itemId', item.id);
  });

  // TOOLTIP

  img.addEventListener('mouseenter', e => {

    showTooltip(item, e);
  });

  img.addEventListener('mousemove', e => {

    moveTooltip(e);
  });

  img.addEventListener('mouseleave', () => {

    hideTooltip();
  });

  return img;
}

// ==========================
// TOOLTIP
// ==========================

function showTooltip(item, e) {

  tooltip.innerHTML = `
    <div class="tooltip-title">
      ${item.name}
    </div>

    <div class="tooltip-description">
      ${item.description}
    </div>
  `;

  tooltip.classList.remove('hidden');

  moveTooltip(e);
}

function moveTooltip(e) {

  tooltip.style.left =
    e.clientX + 20 + 'px';

  tooltip.style.top =
    e.clientY + 20 + 'px';
}

function hideTooltip() {

  tooltip.classList.add('hidden');
}

// ==========================
// RENDER EQUIPMENT
// ==========================

function renderEquipment() {

  // EQUIPMENT SLOTS

  document.querySelectorAll('.slot').forEach(slotEl => {

    slotEl.innerHTML = '';

    const slot = slotEl.dataset.slot;

    const item = equipment[slot];

    if (item) {

      slotEl.appendChild(
        createItemElement(item)
      );
    }

    // DRAG OVER

    slotEl.addEventListener('dragover', e => {

      e.preventDefault();
    });

    // DROP

    slotEl.addEventListener('drop', e => {

      e.preventDefault();

      const itemId =
        e.dataTransfer.getData('itemId');

      const item = itemsDB[itemId];

      if (!item) return;

      // SLOT VALIDATION

      const valid =
        item.slot === slot ||
        (
          item.slot === 'ring' &&
          (slot === 'ring1' || slot === 'ring2')
        );

      if (!valid) return;

      // REMOVE OLD EQUIPPED

      Object.keys(equipment).forEach(key => {

        if (equipment[key]?.id === item.id) {

          equipment[key] = null;
        }
      });

      // REMOVE FROM INVENTORY

      const inventoryIndex =
        inventory.findIndex(i => i.id === item.id);

      if (inventoryIndex !== -1) {

        inventory.splice(inventoryIndex, 1);
      }

      // EQUIP

      equipment[slot] = item;

      renderEquipment();
      renderInventory();
    });
  });

  // BELT SLOTS

  document.querySelectorAll('.belt-slot').forEach(slotEl => {

    slotEl.innerHTML = '';

    const index =
      Number(slotEl.dataset.belt);

    const item = beltSlots[index];

    if (item) {

      slotEl.appendChild(
        createItemElement(item)
      );
    }

    slotEl.addEventListener('dragover', e => {

      e.preventDefault();
    });

    slotEl.addEventListener('drop', e => {

      e.preventDefault();

      const itemId =
        e.dataTransfer.getData('itemId');

      const item = itemsDB[itemId];

      if (!item) return;

      beltSlots[index] = item;

      const inventoryIndex =
        inventory.findIndex(i => i.id === item.id);

      if (inventoryIndex !== -1) {

        inventory.splice(inventoryIndex, 1);
      }

      renderEquipment();
      renderInventory();
    });
  });
}

// ==========================
// RENDER INVENTORY
// ==========================

function renderInventory() {

  inventoryGrid.innerHTML = '';

  inventory.forEach(item => {

    const slot = document.createElement('div');

    slot.className = 'inventory-slot';

    slot.appendChild(
      createItemElement(item)
    );

    inventoryGrid.appendChild(slot);
  });
}

// ==========================
// LOAD TABLE
// ==========================

async function loadRange(range) {

  const rows = await fetchSheet(range);

  table.innerHTML = '';

  rows.forEach((row, i) => {

    const tr = document.createElement('tr');

    const cells = row.c || [];

    cells.forEach(cell => {

      const el =
        document.createElement(
          i === 0 ? 'th' : 'td'
        );

      el.textContent = getCell(cell);

      tr.appendChild(el);
    });

    table.appendChild(tr);
  });
}

// ==========================
// TABS
// ==========================

tabs.forEach(tab => {

  tab.addEventListener('click', async () => {

    tabs.forEach(t => {

      t.classList.remove('active');
    });

    tab.classList.add('active');

    // EQUIPMENT SCREEN

    if (tab.dataset.screen === 'equipment') {

      equipmentScreen.classList.remove('hidden');

      tableScreen.classList.add('hidden');

      renderEquipment();
      renderInventory();
    }

    // TABLE SCREEN

    else {

      equipmentScreen.classList.add('hidden');

      tableScreen.classList.remove('hidden');

      loadRange(tab.dataset.range);
    }
  });
});

// ==========================
// INIT
// ==========================

async function init() {

  try {

    await loadConfig();

    await loadItemsDatabase();

    await loadCharacterInventory();

    renderEquipment();

    renderInventory();

    console.log('RPG UI initialized');
  }

  catch (err) {

    console.error('INIT ERROR:', err);
  }
}

init();

// ==========================
// DEBUG
// ==========================

window.itemsDB = itemsDB;
window.equipment = equipment;
window.inventory = inventory;
window.beltSlots = beltSlots;

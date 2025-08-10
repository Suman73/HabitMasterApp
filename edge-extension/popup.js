import { startOfWeek, addDays, formatDateKey, formatLabel, getWeekRangeLabel } from './date-utils.js';
import { storage } from './storage.js';

// Data model in extension storage
// habits: Array<{ id: string, name: string, weight: number, days?: Record<dateKey, true> }>

const STORAGE_KEY = 'habitmaster:habits';

let habits = [];
let weekOffset = 0;
let currentWeekDays = [];

// DOM refs
const formAddHabit = document.getElementById('form-add-habit');
const inputHabitName = document.getElementById('input-habit-name');
const inputHabitWeight = document.getElementById('input-habit-weight');
const gridContainer = document.getElementById('grid');
const habitsEmpty = document.getElementById('habits-empty');
const btnPrevWeek = document.getElementById('btn-prev-week');
const btnNextWeek = document.getElementById('btn-next-week');
const weekLabel = document.getElementById('week-label');
const todayScoreText = document.getElementById('today-score-text');
const todayProgressEl = document.getElementById('today-progress');
const todayScoreIcon = document.getElementById('today-score-icon');
const kpiWeekAvg = document.getElementById('kpi-week-avg');
const kpiBestDay = document.getElementById('kpi-best-day');
const kpiCompletedCount = document.getElementById('kpi-completed-count');
const weeklyBars = document.getElementById('weekly-bars');
const btnExportWeek = document.getElementById('btn-export-week');
const btnExportAll = document.getElementById('btn-export-all');
const btnReset = document.getElementById('btn-reset');

init().catch(console.error);

async function init() {
  habits = await storage.get(STORAGE_KEY, []);
  renderGrid();
  wireEvents();
}

function wireEvents() {
  formAddHabit?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = inputHabitName.value.trim();
    if (!name) return;
    const weight = Math.max(0, Number(inputHabitWeight?.value ?? 1) || 1);
    const habit = { id: crypto.randomUUID(), name, weight, createdAt: Date.now() };
    habits.push(habit);
    await persist();
    inputHabitName.value = '';
    if (inputHabitWeight) inputHabitWeight.value = '1';
    renderGrid();
  });

  btnPrevWeek?.addEventListener('click', () => { weekOffset -= 1; renderGrid(); });
  btnNextWeek?.addEventListener('click', () => { weekOffset += 1; renderGrid(); });

  btnExportWeek?.addEventListener('click', () => downloadCsv({ scope: 'week' }));
  btnExportAll?.addEventListener('click', () => downloadCsv({ scope: 'all' }));

  btnReset?.addEventListener('click', async () => {
    if (!confirm('Reset all habits and progress?')) return;
    habits = [];
    await persist();
    renderGrid();
  });
}

async function persist() {
  await storage.set(STORAGE_KEY, habits);
}

function renderGrid() {
  const weekStart = startOfWeek(new Date(), weekOffset);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  currentWeekDays = days;
  weekLabel.textContent = getWeekRangeLabel(weekStart);

  const sorted = [...habits].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || String(a.name || '').localeCompare(String(b.name || '')));

  const hasHabits = sorted.length > 0;
  habitsEmpty.classList.toggle('hidden', hasHabits);

  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const habitTh = document.createElement('th');
  habitTh.textContent = 'Habit';
  habitTh.className = 'habit';
  headRow.appendChild(habitTh);
  for (const d of days) {
    const th = document.createElement('th');
    th.textContent = formatLabel(d);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const habit of sorted) {
    const tr = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.className = 'habit';
    const nameWrap = document.createElement('div');
    nameWrap.className = 'habit-name';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = habit.name || '';

    const actions = document.createElement('div');
    actions.className = 'habit-actions';
    const btnRename = document.createElement('button'); btnRename.className = 'btn'; btnRename.textContent = 'Rename';
    const btnEdit = document.createElement('button'); btnEdit.className = 'btn'; btnEdit.textContent = 'Edit';
    const btnDelete = document.createElement('button'); btnDelete.className = 'btn'; btnDelete.textContent = 'Delete';

    btnRename.addEventListener('click', () => renameHabit(habit));
    btnEdit.addEventListener('click', () => editHabit(habit));
    btnDelete.addEventListener('click', () => deleteHabit(habit));

    const weightBadge = document.createElement('span');
    weightBadge.className = 'weight-badge';
    weightBadge.title = 'Weight';
    weightBadge.textContent = String(habit.weight ?? 1);

    actions.append(btnRename, btnEdit, btnDelete);
    nameWrap.append(nameSpan, weightBadge, actions);
    nameCell.appendChild(nameWrap);
    tr.appendChild(nameCell);

    for (const d of days) {
      const td = document.createElement('td');
      const checkbox = renderCheckbox(habit, d);
      td.appendChild(checkbox);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  const tfoot = document.createElement('tfoot');
  const totalRow = document.createElement('tr');
  const totalLabel = document.createElement('td');
  totalLabel.className = 'habit total-label';
  totalLabel.textContent = 'Total';
  totalRow.appendChild(totalLabel);
  for (const d of days) {
    const td = document.createElement('td');
    const key = formatDateKey(d);
    td.id = `total-${key}`;
    td.textContent = String(computeTotalForDate(key));
    totalRow.appendChild(td);
  }
  tfoot.appendChild(totalRow);
  table.appendChild(tfoot);

  gridContainer.innerHTML = '';
  gridContainer.appendChild(table);

  updateTodayTotal();
  updateDayTotals();
  updateStats(days);
}

function renderCheckbox(habit, date) {
  const el = document.createElement('div');
  el.className = 'checkbox';
  const inner = document.createElement('div'); inner.className = 'dot'; el.appendChild(inner);

  const dateKey = formatDateKey(date);
  let checked = Boolean(habit?.days?.[dateKey]);
  if (checked) el.classList.add('checked');

  el.addEventListener('click', async () => {
    const newValue = !checked;
    setChecked(newValue);

    if (newValue) {
      if (!habit.days) habit.days = {};
      habit.days[dateKey] = true;
    } else {
      if (habit.days) delete habit.days[dateKey];
    }

    await persist();

    checked = newValue;
    updateTodayTotal();
    updateDayTotals();
    updateStats(currentWeekDays);
  });

  function setChecked(v) { el.classList.toggle('checked', v); }

  return el;
}

function computeTotalForDate(dateKey) {
  let totalCheckedWeight = 0;
  let totalWeightAll = 0;
  for (const h of habits) {
    const weight = Math.max(0, Number(h.weight ?? 1) || 1);
    totalWeightAll += weight;
    if (Boolean(h?.days?.[dateKey])) totalCheckedWeight += weight;
  }
  if (totalWeightAll === 0) return 0;
  return Math.round((totalCheckedWeight / totalWeightAll) * 100);
}

function updateDayTotals() {
  if (!currentWeekDays || currentWeekDays.length === 0) return;
  for (const d of currentWeekDays) {
    const key = formatDateKey(d);
    const cell = document.getElementById(`total-${key}`);
    if (cell) cell.textContent = String(computeTotalForDate(key));
  }
}

function updateTodayTotal() {
  const todayKey = formatDateKey(new Date());
  let totalCheckedWeight = 0;
  let totalWeightAll = 0;
  for (const h of habits) {
    const weight = Math.max(0, Number(h.weight ?? 1) || 1);
    const checked = Boolean(h?.days?.[todayKey]);
    totalWeightAll += weight;
    if (checked) totalCheckedWeight += weight;
  }
  const percent = totalWeightAll > 0 ? Math.round((totalCheckedWeight / totalWeightAll) * 100) : 0;
  todayScoreText.textContent = `Today's Score: ${percent} / 100`;
  todayProgressEl.style.width = `${percent}%`;
  todayScoreIcon.textContent = percent >= 90 ? '🏆' : percent >= 70 ? '💪' : percent >= 40 ? '🙂' : '😴';
}

function updateStats(days) {
  const dayKeys = days.map((d) => formatDateKey(d));
  const dayPercents = dayKeys.map((k) => computeTotalForDate(k));
  const weekAvg = dayPercents.length ? Math.round(dayPercents.reduce((a,b)=>a+b,0) / dayPercents.length) : 0;
  const bestDay = dayPercents.length ? Math.max(...dayPercents) : 0;
  const todayKey = formatDateKey(new Date());
  let completedCount = 0;
  for (const h of habits) {
    if (h?.days?.[todayKey]) completedCount += 1;
  }
  if (kpiWeekAvg) kpiWeekAvg.textContent = `${weekAvg}%`;
  if (kpiBestDay) kpiBestDay.textContent = `${bestDay}%`;
  if (kpiCompletedCount) kpiCompletedCount.textContent = String(completedCount);
  if (weeklyBars) {
    weeklyBars.innerHTML = '';
    for (let i = 0; i < days.length; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${dayPercents[i]}%`;
      bar.dataset.label = formatLabel(days[i]).split('\n')[0];
      weeklyBars.appendChild(bar);
    }
  }
}

function downloadCsv({ scope }) {
  const rows = [];
  const header = ['Habit','Weight','Date','Checked'];
  rows.push(header);
  const today = new Date();
  const weekStart = startOfWeek(today, weekOffset);
  const days = scope === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : null;
  const allDatesSet = new Set();
  if (scope === 'week') {
    for (const d of days) allDatesSet.add(formatDateKey(d));
  }
  for (const h of habits) {
    const weight = Number(h.weight ?? 1) || 1;
    const dayMap = h.days || {};
    const keys = scope === 'week' ? Array.from(allDatesSet) : Object.keys(dayMap);
    if (keys.length === 0 && scope === 'week') {
      for (const d of days) {
        const k = formatDateKey(d);
        rows.push([h.name, String(weight), k, '0']);
      }
    } else {
      for (const k of keys) {
        rows.push([h.name, String(weight), k, dayMap[k] ? '1' : '0']);
      }
    }
  }
  const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = scope === 'week' ? 'habits-week.csv' : 'habits-all.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function renameHabit(habit) {
  const next = prompt('Rename habit:', habit.name);
  if (next == null) return;
  const name = next.trim();
  if (!name) return;
  habit.name = name;
  await persist();
  renderGrid();
}

async function editHabit(habit) {
  const currentName = habit.name || '';
  const currentWeight = Number(habit.weight ?? 1) || 1;
  const name = prompt('Edit habit name:', currentName);
  if (name == null) return;
  const weightStr = prompt('Edit habit weight (integer ≥ 0):', String(currentWeight));
  if (weightStr == null) return;
  const weight = Math.max(0, Math.floor(Number(weightStr)) || 0);
  habit.name = name.trim() || currentName;
  habit.weight = weight;
  await persist();
  renderGrid();
}

async function deleteHabit(habit) {
  if (!confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;
  habits = habits.filter(h => h.id !== habit.id);
  await persist();
  renderGrid();
}

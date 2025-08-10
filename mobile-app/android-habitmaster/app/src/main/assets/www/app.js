// Copied from project root
import { getApp, getAuthState, signInWithGoogle, signInAnonymouslyEasy, signOutUser, db } from './firebase-config.js';
import { startOfWeek, addDays, formatDateKey, formatLabel, getWeekRangeLabel } from './date-utils.js';

// DOM refs
const btnSignIn = document.getElementById('btn-sign-in');
const btnSignOut = document.getElementById('btn-sign-out');
const btnGuest = document.getElementById('btn-guest');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const setupWarning = document.getElementById('setup-warning');

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
const motivationText = document.getElementById('motivation-text');
const btnExportWeek = document.getElementById('btn-export-week');
const btnExportAll = document.getElementById('btn-export-all');

// State
let authState = null; // { user }
let habits = []; // [{id, name, weight}]
let weekOffset = 0; // 0 = current week, -1 previous, +1 next
let currentWeekDays = [];

function showSetupWarning(msg) {
  setupWarning.classList.remove('hidden');
  setupWarning.textContent = msg;
}

function hideSetupWarning() {
  setupWarning.classList.add('hidden');
}

// Firebase listeners
getAuthState((state) => {
  authState = state;
  updateAuthUI();
  if (authState?.user) {
    subscribeToHabits();
  } else {
    unsubscribeFromHabits();
    habits = [];
    renderGrid();
  }
});

btnSignIn?.addEventListener('click', async () => {
  try {
    await signInWithGoogle();
  } catch (e) {
    console.error(e);
    alert('Sign-in failed. Check console.');
  }
});

btnGuest?.addEventListener('click', async () => {
  try {
    await signInAnonymouslyEasy();
  } catch (e) {
    console.error(e);
    alert('Guest sign-in failed. Check console.');
  }
});

btnSignOut?.addEventListener('click', async () => {
  try {
    await signOutUser();
  } catch (e) {
    console.error(e);
  }
});

function updateAuthUI() {
  const user = authState?.user;
  const hasUser = Boolean(user);
  document.getElementById('btn-sign-in').classList.toggle('hidden', hasUser);
  document.getElementById('btn-guest').classList.toggle('hidden', hasUser);
  userInfo.classList.toggle('hidden', !hasUser);
  if (hasUser) {
    userName.textContent = user.displayName || user.email || (user.isAnonymous ? 'Guest' : 'User');
    userAvatar.src = user.photoURL || '';
    userAvatar.classList.toggle('hidden', !user.photoURL);
  }
}

// Firestore live subscriptions
let unsubscribeHabits = null;
function subscribeToHabits() {
  if (!authState?.user) return;
  if (unsubscribeHabits) unsubscribeHabits();

  const { onSnapshot, collection, query, where } = db.firestore;
  const uid = authState.user.uid;

  const q = query(
    collection(db.store, 'habits'),
    where('uid', '==', uid)
  );

  unsubscribeHabits = onSnapshot(q, (snap) => {
    habits = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        if (ta !== tb) return ta - tb;
        return (a.name || '').localeCompare(b.name || '');
      });
    normalizeHabitsWeights(habits).finally(() => {
      renderGrid();
    });
  });
}
function unsubscribeFromHabits() { if (unsubscribeHabits) unsubscribeHabits(); unsubscribeHabits = null; }

// Add habit
formAddHabit?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = inputHabitName.value.trim();
  if (!name || !authState?.user) return;

  const { addDoc, collection, serverTimestamp } = db.firestore;
  try {
    const weightNum = Number(inputHabitWeight?.value ?? 1) || 1;
    await addDoc(collection(db.store, 'habits'), {
      uid: authState.user.uid,
      name,
      weight: weightNum,
      createdAt: serverTimestamp(),
    });
    inputHabitName.value = '';
    if (inputHabitWeight) inputHabitWeight.value = '1';
  } catch (e) {
    console.error(e);
    alert('Failed to add habit');
  }
});

// Week navigation
btnPrevWeek?.addEventListener('click', () => { weekOffset -= 1; renderGrid(); });
btnNextWeek?.addEventListener('click', () => { weekOffset += 1; renderGrid(); });

// Grid rendering
function renderGrid() {
  const user = authState?.user;
  const weekStart = startOfWeek(new Date(), weekOffset);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  currentWeekDays = days;
  weekLabel.textContent = getWeekRangeLabel(weekStart);

  const hasHabits = habits.length > 0;
  habitsEmpty.classList.toggle('hidden', hasHabits);

  const table = document.createElement('table');

  // Header
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

  // Body
  const tbody = document.createElement('tbody');
  for (const habit of habits) {
    const tr = document.createElement('tr');

    // Habit name + actions
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

    // 7-day cells
    for (const d of days) {
      const td = document.createElement('td');
      const checkbox = renderCheckbox(habit, user, d);
      td.appendChild(checkbox);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  // Footer totals per day
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

  // After rendering, update today's total (client-side only)
  updateTodayTotal();
  updateDayTotals();
  updateStats(days);
}

function renderCheckbox(habit, user, date) {
  const el = document.createElement('div');
  el.className = 'checkbox';
  const inner = document.createElement('div'); inner.className = 'dot'; el.appendChild(inner);

  const dateKey = formatDateKey(date);
  let checked = Boolean(habit?.days?.[dateKey]);
  if (checked) el.classList.add('checked');

  el.addEventListener('click', async () => {
    if (!user) {
      alert('Please sign in to track progress.');
      return;
    }
    const newValue = !checked;
    const prevValue = checked;
    setChecked(newValue);
    // Optimistically update local model so client-side total reflects immediately
    if (newValue) {
      if (!habit.days) habit.days = {};
      habit.days[dateKey] = true;
    } else {
      if (habit.days) delete habit.days[dateKey];
    }
    updateTodayTotal();
    updateDayTotals();
    updateStats(currentWeekDays);
    try {
      await setHabitDay(habit.id, dateKey, newValue);
      checked = newValue;
    } catch (e) {
      console.error(e);
      // revert on failure
      setChecked(checked);
      // revert local model as well
      if (prevValue) {
        if (!habit.days) habit.days = {};
        habit.days[dateKey] = true;
      } else {
        if (habit.days) delete habit.days[dateKey];
      }
      updateTodayTotal();
      updateDayTotals();
      updateStats(currentWeekDays);
      alert('Sync failed. Check console.');
    }
  });

  function setChecked(v) {
    el.classList.toggle('checked', v);
  }

  return el;
}

async function setHabitDay(habitId, dateKey, value) {
  const { doc, updateDoc, deleteField, serverTimestamp } = db.firestore;
  const ref = db.firestore.doc(db.store, 'habits', habitId);
  const fieldPath = `days.${dateKey}`;
  try {
    await updateDoc(ref, {
      [fieldPath]: value ? serverTimestamp() : deleteField(),
    });
  } catch (e) {
    // If update fails because the field doesn't exist (first time), fallback to set merge
    const { setDoc } = db.firestore;
    await setDoc(ref, {
      updatedAt: serverTimestamp(),
      days: { [dateKey]: value ? serverTimestamp() : undefined },
    }, { merge: true });
  }
}

// Client-side: compute today's total = sum(weight * isCheckedToday)
function updateTodayTotal() {
  if (!todayScoreText || !todayProgressEl) return;
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
  if (todayScoreIcon) {
    todayScoreIcon.textContent = percent >= 90 ? '🏆' : percent >= 70 ? '💪' : percent >= 40 ? '🙂' : '😴';
  }
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
  if (motivationText) {
    const percent = computeTotalForDate(todayKey);
    motivationText.textContent = getMotivationMessage(percent);
  }
}

function getMotivationMessage(percent) {
  if (percent >= 90) return 'Elite performance! Keep the momentum 🏆';
  if (percent >= 70) return 'Strong progress—finish strong today! 💪';
  if (percent >= 40) return 'Nice start—keep stacking wins 🙂';
  return 'Tiny steps beat zero. You got this! 🚀';
}

btnExportWeek?.addEventListener('click', () => downloadCsv({ scope: 'week' }));
btnExportAll?.addEventListener('click', () => downloadCsv({ scope: 'all' }));

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
  const { doc, updateDoc } = db.firestore;
  await updateDoc(doc(db.store, 'habits', habit.id), { name });
}

async function editHabit(habit) {
  const currentName = habit.name || '';
  const currentWeight = Number(habit.weight ?? 1) || 1;
  const name = prompt('Edit habit name:', currentName);
  if (name == null) return;
  const weightStr = prompt('Edit habit weight (integer ≥ 0):', String(currentWeight));
  if (weightStr == null) return;
  const weight = Math.max(0, Math.floor(Number(weightStr)) || 0);
  const { doc, updateDoc } = db.firestore;
  await updateDoc(doc(db.store, 'habits', habit.id), { name: name.trim() || currentName, weight });
}

async function deleteHabit(habit) {
  if (!confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;
  const { doc, deleteDoc } = db.firestore;
  await deleteDoc(doc(db.store, 'habits', habit.id));
}

// Ensure each habit has a numeric weight; if missing, try to parse from name like "(w=10)" and persist
async function normalizeHabitsWeights(items) {
  const { doc, updateDoc } = db.firestore;
  const updates = [];
  for (const h of items) {
    if (typeof h.weight === 'number') continue;
    const name = String(h.name || '');
    const match = name.match(/\(\s*w\s*=\s*(\d+)\s*\)/i);
    if (match) {
      const weight = Math.max(0, parseInt(match[1], 10) || 0);
      const cleaned = name.replace(/\(\s*w\s*=\s*\d+\s*\)/i, '').trim();
      h.weight = weight;
      updates.push(updateDoc(doc(db.store, 'habits', h.id), { weight, name: cleaned }));
      h.name = cleaned;
    } else {
      h.weight = 1;
    }
  }
  if (updates.length > 0) {
    try { await Promise.allSettled(updates); } catch {}
  }
}

// Detect missing config and show a helpful message
try {
  const app = getApp();
  hideSetupWarning();
} catch (e) {
  console.warn(e);
  showSetupWarning('Firebase is not configured. Edit firebase-config.js with your project settings.');
}

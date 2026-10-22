'use strict';
window.MenuAnalytics = (() => {
  const key = 'impossible-menu-showcase-v1';
  const statuses = ['running', 'completed', 'abandoned', 'interrupted'];
  const fields = ['actions', 'changes', 'backtracks', 'optionsShown', 'conflicts', 'activeMs'];
  const validCount = value => Number.isFinite(value) && value >= 0 && value <= 1e12;
  const validDate = value => typeof value === 'string' && value.length < 40 && Number.isFinite(Date.parse(value));
  function validate(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.sessions) || value.sessions.length > 200) return null;
    const sessions = [];
    for (const row of value.sessions) {
      if (!row || typeof row.id !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(row.id)
        || !['simple', 'impossible'].includes(row.mode) || !statuses.includes(row.status)
        || !validDate(row.startedAt) || (row.endedAt !== null && !validDate(row.endedAt))
        || (row.status === 'running' ? row.endedAt !== null : row.endedAt === null)
        || !fields.every(field => validCount(row[field]) && (field === 'activeMs' || Number.isInteger(row[field])))) return null;
      sessions.push(Object.fromEntries(['id', 'mode', 'status', 'startedAt', 'endedAt', ...fields].map(field => [field, row[field]])));
    }
    return { version: 1, sessions };
  }
  let data = { version: 1, sessions: [] };
  let storageAvailable = true;
  let warning = '';
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const restored = validate(JSON.parse(raw));
      if (restored) data = restored;
      else warning = 'Incompatible or corrupt showcase data was ignored.';
    }
  } catch {
    storageAvailable = false;
    warning = 'Local storage is unavailable or unreadable. This visit uses memory only.';
  }
  let current = null;
  let tick = null;
  let enabled = true;
  let dirty = null;
  let newSession = false;
  const now = () => performance.now();
  function readLatest() {
    const raw = localStorage.getItem(key);
    if (!raw) return { version: 1, sessions: [] };
    const latest = validate(JSON.parse(raw));
    if (latest) return latest;
    warning = 'Incompatible or corrupt showcase data was ignored.';
    return { version: 1, sessions: [] };
  }
  function adopt(latest) {
    data = latest;
    const index = current ? latest.sessions.findIndex(row => row.id === current.id) : -1;
    if (current && !newSession && index < 0) {
      current = null;
      tick = null;
      dirty = null;
      return true;
    } else if (current && index >= 0) data.sessions[index] = current;
    return false;
  }
  function save() {
    if (!storageAvailable) return true;
    try {
      const latest = readLatest();
      const discarded = Boolean(dirty && !newSession && !latest.sessions.some(row => row.id === dirty.id));
      // Only this tab owns its session. Missing existing records indicate a clear
      // or retention eviction, and must not be resurrected by a delayed timer.
      if (dirty && (newSession || latest.sessions.some(row => row.id === dirty.id))) {
        const index = latest.sessions.findIndex(row => row.id === dirty.id);
        if (index < 0) latest.sessions.push(dirty);
        else latest.sessions[index] = dirty;
        latest.sessions = latest.sessions.slice(-200);
        localStorage.setItem(key, JSON.stringify(latest));
      }
      dirty = null;
      newSession = false;
      const canceled = adopt(latest);
      if (discarded || canceled) window.dispatchEvent(new Event('showcase-storage-change'));
      return !discarded && !canceled;
    }
    catch {
      storageAvailable = false;
      warning = 'Storage could not be written. Data is kept in memory for this visit.';
      return true;
    }
  }
  window.addEventListener('storage', event => {
    if (!storageAvailable || (event.key !== key && event.key !== null)) return;
    try {
      adopt(readLatest());
      window.dispatchEvent(new Event('showcase-storage-change'));
    } catch {
      storageAvailable = false;
      warning = 'Local storage is unavailable or unreadable. This visit uses memory only.';
    }
  });
  function flush() {
    if (current && tick !== null) {
      const elapsed = Math.max(0, now() - tick);
      if (elapsed > 0) { current.activeMs += elapsed; dirty = current; }
    }
    tick = null;
  }
  function sync() {
    flush();
    save();
    if (current && enabled && !document.hidden && document.hasFocus()) tick = now();
  }
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('focus', sync);
  window.addEventListener('blur', sync);
  let interval = window.setInterval(sync, 1000);
  const downloadURLs = new Set();
  window.addEventListener('pageshow', event => {
    if (event.persisted) interval = window.setInterval(sync, 1000);
  });
  function finish(status) {
    if (!current) return null;
    flush();
    current.status = status;
    current.endedAt = new Date().toISOString();
    dirty = current;
    const result = { ...current };
    current = null;
    return save() ? result : null;
  }
  window.addEventListener('pagehide', () => {
    finish('interrupted');
    window.clearInterval(interval);
    downloadURLs.forEach(url => URL.revokeObjectURL(url));
    downloadURLs.clear();
  });
  function begin(mode) {
    finish('interrupted');
    current = {
      id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      mode, status: 'running', startedAt: new Date().toISOString(), endedAt: null,
      actions: 0, changes: 0, backtracks: 0, optionsShown: 0, conflicts: 0, activeMs: 0,
    };
    if (data.sessions.length >= 200) data.sessions.shift();
    data.sessions.push(current);
    dirty = current;
    newSession = true;
    enabled = true;
    sync();
  }
  function record(type, amount = 1) {
    if (!current || !['actions', 'changes', 'backtracks', 'optionsShown', 'conflicts'].includes(type)) return;
    current[type] += amount;
    dirty = current;
    save();
  }
  function snapshot() { sync(); return JSON.parse(JSON.stringify(data)); }
  const cell = value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  function exportData(format) {
    const value = snapshot();
    const columns = ['id', 'mode', 'status', 'startedAt', 'endedAt', ...fields];
    const body = format === 'json' ? JSON.stringify(value, null, 2)
      : [columns, ...value.sessions.map(row => columns.map(column => row[column]))].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([body], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' }));
    downloadURLs.add(url);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `impossible-menu-showcase.${format}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => { URL.revokeObjectURL(url); downloadURLs.delete(url); }, 1000);
  }
  return {
    begin, finish, record, snapshot, exportData, cell, validate,
    pause: () => { enabled = false; sync(); },
    resume: () => { enabled = true; sync(); },
    running: () => Boolean(current),
    warning: () => warning,
    clear: () => {
      current = null; tick = null; dirty = null; newSession = false;
      data = { version: 1, sessions: [] };
      if (!storageAvailable) return;
      try { localStorage.setItem(key, JSON.stringify(data)); }
      catch { storageAvailable = false; warning = 'Storage could not be written. Data is kept in memory for this visit.'; }
    },
  };
})();

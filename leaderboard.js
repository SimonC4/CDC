(function (root) {
  'use strict';
  function parseCSV(text) {
    const rows = []; let row = [], cell = '', quoted = false, closed = false;
    text = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') { quoted = false; closed = true; }
        else cell += c;
      } else if (c === ',' || c === '\n' || c === '\r') {
        row.push(cell); cell = ''; closed = false;
        if (c !== ',') { rows.push(row); row = []; if (c === '\r' && text[i + 1] === '\n') i++; }
      } else if (c === '"' && cell === '' && !closed) quoted = true;
      else { if (closed || c === '"') throw new Error('The sheet returned malformed CSV.'); cell += c; }
    }
    if (quoted) throw new Error('The sheet returned incomplete CSV.');
    if (cell !== '' || row.length || closed) { row.push(cell); rows.push(row); }
    return rows;
  }
  function validDate(value) {
    // Require ISO dates to avoid ambiguous day/month interpretation.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function readRecords(csv) {
    const rows = parseCSV(csv), header = rows.shift() || [];
    const names = header.map(s => s.trim().toLowerCase());
    if (![2,3].includes(names.length) || new Set(names).size !== names.length || !names.includes('player') || !names.includes('date') || names.some(n => !['player','date','count'].includes(n)))
      throw new Error('Use columns Player and Date, with an optional Count column.');
    const pi = names.indexOf('player'), di = names.indexOf('date'), ci = names.indexOf('count'), records = [], invalidRows = [];
    rows.forEach((row, i) => {
      if (row.every(s => !s.trim())) return;
      const player = (row[pi] || '').trim().replace(/\s+/g, ' '), date = (row[di] || '').trim();
      const rawCount = ci < 0 ? '' : (row[ci] || '').trim();
      const count = rawCount === '' ? 1 : Number(rawCount);
      const countValid = rawCount === '' || (/^\d+$/.test(rawCount) && Number.isSafeInteger(count) && count > 0);
      // An undated row must explicitly specify its opening total.
      if (row.length > names.length || !player || !countValid || (date ? !validDate(date) : rawCount === '')) { invalidRows.push(i + 2); return; }
      records.push({ player, date, count, row: i + 2 });
    });
    return { records, invalidRows };
  }
  function summarise(records) {
    const map = new Map();
    for (const r of records) {
      const key = r.player.toLocaleLowerCase('en-NZ');
      if (!map.has(key)) map.set(key, { player: r.player, total: 0 });
      map.get(key).total += r.count ?? 1;
    }
    const standings = [...map.values()].sort((a,b) => b.total-a.total || a.player.localeCompare(b.player, 'en-NZ'));
    standings.forEach((p,i) => p.rank = i && p.total === standings[i-1].total ? standings[i-1].rank : i+1);
    const recent = records.filter(r => r.date).sort((a,b) => b.date.localeCompare(a.date) || b.row-a.row).slice(0,10);
    return { standings, recent, total: records.reduce((sum,r) => sum + (r.count ?? 1),0), latest: recent[0]?.date || null };
  }
  const api = { parseCSV, validDate, readRecords, summarise };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Darts = api;
})(globalThis);

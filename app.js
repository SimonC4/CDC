'use strict';
const config = window.CLUB_CONFIG || {}, demoMode = !config.sheetCsvUrl;
const $ = id => document.getElementById(id);
let busy = false, lastSuccess = null;
const dateFormat = new Intl.DateTimeFormat('en-NZ', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const formatDate = date => dateFormat.format(new Date(date + 'T12:00:00Z'));
const el = (tag, text, className) => { const node = document.createElement(tag); node.textContent = text; if(className) node.className = className; return node; };
$('demo').hidden = !demoMode;
function render(data) {
  const {standings,recent,total,latest} = Darts.summarise(data.records);
  $('total').textContent = total; $('players').textContent = standings.length; $('latest').textContent = latest ? formatDate(latest) : '—';
  $('standings').replaceChildren(...standings.map(p => {
    const row = document.createElement('tr'); if(p.rank === 1) row.className = 'leader';
    row.append(el('td', String(p.rank).padStart(2,'0')), el('td',p.player), el('td',p.total,'number')); return row;
  }));
  $('recent-list').replaceChildren(...recent.map(r => {
    const item = document.createElement('li'), details = document.createElement('div'), time = el('time',formatDate(r.date)); time.dateTime = r.date;
    details.append(el('strong',r.player),time); item.append(details,el('span',r.count > 1 ? `${r.count} × 180` : '180','maximum')); return item;
  }));
  $('empty').hidden = standings.length > 0; $('empty').textContent = 'No 180s recorded yet.';
  $('recent-empty').hidden = recent.length > 0; $('recent-empty').textContent = 'No dated 180s recorded yet.';
  $('warning').hidden = data.invalidRows.length === 0;
  $('warning').textContent = data.invalidRows.length ? `${data.invalidRows.length} invalid row(s) excluded (sheet rows ${data.invalidRows.slice(0,12).join(', ')}${data.invalidRows.length > 12 ? ', …' : ''}). Use a player and a date such as 1 Sep 2026 or 2026-09-01, or leave Date blank and enter a positive whole number in Count for a starting total.` : '';
}
function sourceUrl() {
  if (demoMode) return new URL('sample-records.csv',location.href);
  const url = new URL(config.sheetCsvUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !/^\/spreadsheets\/d\/e\/[^/]+\/pub$/.test(url.pathname) || url.searchParams.get('output') !== 'csv' || !url.searchParams.has('gid') || url.searchParams.get('single') !== 'true')
    throw new Error('Connect the dedicated Records tab using its published Google Sheets CSV link.');
  return url;
}
async function refresh() {
  if (busy) return;
  busy = true; $('refresh').disabled = true;
  $('status').textContent = 'Checking for updates…';
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),15000);
  try {
    const url = sourceUrl(); url.searchParams.set('_',Date.now());
    const response = await fetch(url, {cache:'no-store',credentials:'omit',signal:controller.signal});
    if (!response.ok) throw new Error(`The sheet could not be read (HTTP ${response.status}).`);
    const data = Darts.readRecords(await response.text()); render(data); lastSuccess = new Date();
    $('status').textContent = `${demoMode ? 'Sample records loaded' : 'Sheet checked'} · ${lastSuccess.toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit'})}`;
  } catch (error) {
    $('status').textContent = lastSuccess ? `Update failed · Showing records last checked at ${lastSuccess.toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit'})}. Retrying automatically.` : 'Unable to load records. Retrying automatically.';
    $('warning').hidden = false; $('warning').textContent = error.name === 'AbortError' ? 'The request timed out. Try Refresh now.' : error.message + ' Check the connection and that the sheet is still published.';
    if (!lastSuccess) { $('empty').textContent = 'The leaderboard is unavailable.'; $('recent-empty').textContent = 'Recent 180s are unavailable.'; }
  } finally { clearTimeout(timeout); busy = false; $('refresh').disabled = false; }
}
$('refresh').addEventListener('click',refresh);
document.addEventListener('visibilitychange',() => {if(!document.hidden) refresh();});
setInterval(() => {if(!document.hidden) refresh();}, Math.max(60000, Number(config.refreshMs) || 60000));
refresh();

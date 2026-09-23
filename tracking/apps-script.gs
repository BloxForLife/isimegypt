// iSim Egypt site tracking: receives events from the website and adds a
// row to the "Events" tab. Setup steps are in SETUP.md next to this file.

var EVENTS = ['page_view', 'book_continue', 'call_tap', 'whatsapp_tap'];

function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return ContentService.createTextOutput('bad request'); }
  if (EVENTS.indexOf(d.event) === -1) return ContentService.createTextOutput('ignored');

  var clip = function (v) { return String(v || '').slice(0, 100); };
  eventsSheet().appendRow([new Date(), d.event, clip(d.detail), clip(d.page), clip(d.device), clip(d.ref)]);
  return ContentService.createTextOutput('ok');
}

// Opening the web app URL in a browser shows which spreadsheet it writes to.
function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ContentService.createTextOutput('Tracking is running. Events go to "' + ss.getName() + '": ' + ss.getUrl());
}

// The Events tab, created with a header row if it doesn't exist yet.
function eventsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ev = ss.getSheetByName('Events');
  if (!ev) {
    try { ev = ss.insertSheet('Events'); } catch (err) { ev = ss.getSheetByName('Events'); }
  }
  if (ev.getLastRow() === 0) {
    ev.appendRow(['Time', 'Event', 'Detail', 'Page', 'Device', 'Came from']);
    ev.setFrozenRows(1);
  }
  return ev;
}

// Run once from the Apps Script editor: creates the Events and Summary tabs.
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Africa/Cairo');

  eventsSheet().getRange(1, 1, 1, 6).setFontWeight('bold');

  var sum = ss.getSheetByName('Summary') || ss.insertSheet('Summary', 0);
  sum.clear();
  var count = function (event) {
    return ['=COUNTIFS(Events!B:B,"' + event + '",Events!A:A,">="&(TODAY()-7))',
            '=COUNTIF(Events!B:B,"' + event + '")'];
  };
  sum.getRange(1, 1, 5, 3).setValues([
    ['', 'Last 7 days', 'All time'],
    ['Page visits'].concat(count('page_view')),
    ['Booking forms filled in'].concat(count('book_continue')),
    ['Call button taps'].concat(count('call_tap')),
    ['WhatsApp taps'].concat(count('whatsapp_tap'))
  ]);
  sum.getRange('A7').setValue('Call taps by session (all time)');
  sum.getRange('A8').setFormula(
    '=IFERROR(QUERY(Events!A:F,"select C, count(B) where B = \'call_tap\' group by C ' +
    'order by count(B) desc label C \'Session\', count(B) \'Taps\'",1),"No call taps yet")');
  sum.getRange('A1:C1').setFontWeight('bold');
  sum.getRange('A7').setFontWeight('bold');
  sum.setColumnWidth(1, 240);

  var blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);
}

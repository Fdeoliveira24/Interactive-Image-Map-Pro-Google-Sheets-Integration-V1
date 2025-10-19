/**
 * ============================================================================
 * STORAGE CAVES — GOOGLE SHEETS → IMAGE MAP PRO INTEGRATION (v3.5)
 * ============================================================================
 * Multi-location JSON API + Sidebar Launcher
 * Fully compatible with Image Map Pro fetch logic from v1.
 * ============================================================================
 */

const SHEET_MAP = {
  Buford: "Buford - GA",
  FortMill: "Fort Mill - SC",
  Concord: "Concord - NC",
  Concord2: "Concord 2 - NC",
  LakeNorman: "Lake Norman - NC",
  Lexington: "Lexington - NC",
  Nashville: "Nashville - TN"
};

/* ---------------------------------------------------------------------------
   SECTION 1: PUBLIC JSON API  (Used by Image Map Pro)
--------------------------------------------------------------------------- */
function doGet(e) {
  const out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);

  try {
    // Determine which sheet to read
    const locParam = e?.parameter?.sheet || e?.parameter?.location;
    const sheetName = SHEET_MAP[locParam] || locParam || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    // Read all rows
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();

    const jsonData = [];
    data.forEach(row => {
      if (!row[0]) return; // skip empty rows
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      jsonData.push(obj);
    });

    const response = {
      success: true,
      sheet: sheetName,
      lastUpdated: new Date().toISOString(),
      totalUnits: jsonData.length,
      data: jsonData
    };

    out.setContent(JSON.stringify(response));
  } catch (err) {
    out.setContent(JSON.stringify({ success: false, error: err.message }));
  }

  return out;
}

/* ---------------------------------------------------------------------------
   SECTION 2: STATISTICS (for sidebar only)
--------------------------------------------------------------------------- */
function getUnitStats(location) {
  const sheetName = SHEET_MAP[location] || location;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { available: 0, reserved: 0, sold: 0, leased: 0 };

  const rows = sheet.getDataRange().getValues();
  const stats = { available: 0, reserved: 0, sold: 0, leased: 0 };

  for (let i = 1; i < rows.length; i++) {
    const s = (rows[i][1] || "").toString().toLowerCase();
    if (stats.hasOwnProperty(s)) stats[s]++;
  }
  return stats;
}

/* ---------------------------------------------------------------------------
   SECTION 3: SHEET MENU + SIDEBAR
--------------------------------------------------------------------------- */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Storage Caves Map")
    .addItem("Open Sidebar", "showSidebar")
    .addItem("Open Large Dialog", "showDialog")
    .addItem("Open External Map", "openExternalMap")
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("mapSidebar").setTitle("Storage Caves");
  SpreadsheetApp.getUi().showSidebar(html);
}

function showDialog() {
  const html = HtmlService.createHtmlOutputFromFile("mapSidebar").setWidth(900).setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, "Storage Caves Interactive Map");
}

function openExternalMap() {
  const html = HtmlService.createHtmlOutput(
    `<script>
       window.open('https://pxl360.com/interactive-map/storage-caves-v3.html', '_blank');
       google.script.host.close();
     </script>`
  );
  SpreadsheetApp.getUi().showModalDialog(html, "Opening Map...");
}

/* ---------------------------------------------------------------------------
   SECTION 4: CLIENT HELPERS
--------------------------------------------------------------------------- */
function getUnitStatsFor(loc) { return getUnitStats(loc); }

function getLocationCatalog() {
  const locations = Object.values(SHEET_MAP);
  return { locations, defaultLocation: locations[0] };
}
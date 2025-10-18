/**
 * ============================================================
 * STORAGE CAVES — GOOGLE SHEETS + IMAGE MAP PRO INTEGRATION (v2)
 * ============================================================
 *
 * VERSION NOTES:
 *  - This version supports a **single project/location**.
 *  - It connects one Google Sheet to Image Map Pro through a JSON API.
 *  - It also adds a custom **sidebar menu** to view the live map and
 *    display basic statistics (Available, Reserved, Sold, Leased).
 *
 * NEXT PLANNED VERSION (v3):
 *  - Add multi-location support (Buford, Fort Mill, Concord, etc.)
 *  - Add dropdown selector, global sync, and location-based stats.
 *
 * ============================================================
 * DEPLOYMENT INSTRUCTIONS:
 * ------------------------------------------------------------
 * 1️⃣  Open your Google Sheet that holds the unit data
 * 2️⃣  Go to **Extensions → Apps Script**
 * 3️⃣  Delete any old code
 * 4️⃣  Paste this full script
 * 5️⃣  Save your project (e.g., "App-Script-Image-Pro-Google-Sheets-Integration-V2")
 * 6️⃣  Click **Deploy → New Deployment**
 * 7️⃣  Choose “Web app” as the deployment type
 * 8️⃣  Set “Execute as” to **Me (your account)**
 * 9️⃣  Set “Who has access” to **Anyone**
 * 🔟  Click **Deploy** and copy the Web App URL
 *
 * 🔗 Use that URL inside your Image Map Pro integration
 *     (index.html → SHEET_JSON_URL variable)
 * ============================================================
 */


/**
 * doGet()
 * ------------------------------------------------------------
 * Returns the active Sheet data as a JSON object for external use.
 * This endpoint is used by Image Map Pro to fetch live unit data.
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const jsonData = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty or blank rows

      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      jsonData.push(obj);
    }

    const response = {
      success: true,
      lastUpdated: new Date().toISOString(),
      totalUnits: jsonData.length,
      data: jsonData
    };

    output.setContent(JSON.stringify(response));

  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: "Failed to fetch data from Google Sheet"
    };
    output.setContent(JSON.stringify(errorResponse));
  }

  return output;
}


/**
 * getUnitStats()
 * ------------------------------------------------------------
 * Summarizes all unit statuses in the active sheet.
 * Used by the sidebar to show quick overview stats.
 *
 * NOTE:
 * - Looks for column B (status)
 * - Counts: Available / Sold / Reserved / Leased
 */
function getUnitStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  const stats = { available: 0, sold: 0, reserved: 0, leased: 0 };

  for (let i = 1; i < data.length; i++) {
    const status = data[i][1];
    if (status) {
      const s = status.toLowerCase();
      if (stats.hasOwnProperty(s)) stats[s]++;
    }
  }

  return stats;
}


/**
 * showInteractiveMapSidebar()
 * ------------------------------------------------------------
 * Opens a sidebar in Google Sheets showing the live Image Map Pro
 * via an embedded iframe. Also displays real-time stats and
 * includes a “Refresh” button to reload both the map and stats.
 *
 * The sidebar content is loaded from the HTML file named:
 *  → "mapSidebar.html"
 */
function showInteractiveMapSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('mapSidebar')
    .setTitle('Storage Caves Interactive Map');
  SpreadsheetApp.getUi().showSidebar(html);
}


/**
 * onOpen()
 * ------------------------------------------------------------
 * Automatically runs when the Sheet is opened.
 * Adds a custom menu “Storage Caves Map” to the toolbar
 * for quick access to the interactive map sidebar.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Storage Caves Map')
    .addItem('Open Interactive Map', 'showInteractiveMapSidebar')
    .addToUi();
}
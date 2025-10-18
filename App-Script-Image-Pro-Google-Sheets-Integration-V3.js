/**
 * =================================================================================================
 * STORAGE CAVES — GOOGLE SHEETS + IMAGE MAP PRO INTEGRATION (VERSION 3)
 * =================================================================================================
 *
 * OVERVIEW:
 * -------------------------------------------------------------------------------------------------
 * This version extends the single-location implementation (V2) to support multiple properties
 * or sites under one unified Google Sheets document. Each location (e.g., Buford, Fort Mill,
 * Concord) corresponds to a separate sheet tab and can be selected dynamically from the sidebar.
 *
 * The script generates:
 *  - A JSON API endpoint for each sheet (via ?location= parameter)
 *  - A sidebar interface for live map display and statistics
 *  - Real-time summary counts (Available, Reserved, Sold, Leased)
 *
 * -------------------------------------------------------------------------------------------------
 * KEY FEATURES:
 *  - Multi-location support using sheet names (e.g., "Buford", "FortMill", "Concord")
 *  - Centralized sidebar for map visualization and statistics
 *  - Location selector to dynamically switch sites
 *  - Refresh button to reload both map and statistics
 *  - Compatible with Image Map Pro front-end integrations
 *
 * -------------------------------------------------------------------------------------------------
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open the Google Sheet containing all site tabs.
 * 2. Go to **Extensions → Apps Script**.
 * 3. Replace any existing script with this entire file.
 * 4. Save the project as **App-Script-Image-Pro-Google-Sheets-Integration-V3**.
 * 5. Click **Deploy → New Deployment**.
 * 6. Select “Web app” as the deployment type.
 * 7. Set:
 *      - **Execute as:** Me (your account)
 *      - **Who has access:** Anyone
 * 8. Click **Deploy**, authorize if prompted, and copy the generated Web App URL.
 * 9. Paste that URL into your website integration or test tool.
 *
 * -------------------------------------------------------------------------------------------------
 * AUTHOR:
 * Francisco De Oliveira
 *
 * DATE:
 * Version 3 Release
 *
 * VERSION HISTORY:
 * V1.0 — Base JSON API
 * V2.0 — Single-location sidebar + stats integration
 * V3.0 — Multi-location support with dynamic maps and statistics
 * =================================================================================================
 */


/* ================================================================================================
 * SECTION 1: MAIN API ENDPOINT (MULTI-SHEET SUPPORT)
 * ================================================================================================
 */

/**
 * doGet()
 * -------------------------------------------------------------------------------------------------
 * Responds to HTTP GET requests at the published Apps Script Web App URL.
 * Supports an optional `location` query parameter to target specific sheets.
 *
 * Example URLs:
 *   /exec?location=Buford
 *   /exec?location=FortMill
 *   /exec?location=Concord
 *
 * If no `location` is provided, the first sheet is used by default.
 *
 * @param {Object} e - The HTTP GET event object (includes query parameters).
 * @returns {TextOutput} - JSON output containing sheet data and metadata.
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const location = e?.parameter?.location || ss.getSheets()[0].getName();
    const sheet = ss.getSheetByName(location);

    if (!sheet) {
      throw new Error(`Sheet not found for location: ${location}`);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const jsonData = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      jsonData.push(obj);
    }

    const response = {
      success: true,
      location: location,
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


/* ================================================================================================
 * SECTION 2: STATISTICS GENERATOR (PER LOCATION)
 * ================================================================================================
 */

/**
 * getUnitStats()
 * -------------------------------------------------------------------------------------------------
 * Returns summary statistics (Available, Sold, Reserved, Leased) for a given sheet location.
 * If no location is specified, defaults to the first available sheet.
 *
 * @param {string} [location] - The sheet name corresponding to a location (e.g., "Buford").
 * @returns {Object} - An object with status totals.
 *
 * Example:
 * {
 *   "available": 28,
 *   "sold": 12,
 *   "reserved": 7,
 *   "leased": 3
 * }
 */
function getUnitStats(location) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = location
    ? ss.getSheetByName(location)
    : ss.getSheets()[0]; // default to first tab

  if (!sheet) {
    throw new Error(`Sheet not found for location: ${location || "Default"}`);
  }

  const data = sheet.getDataRange().getValues();
  const stats = { available: 0, sold: 0, reserved: 0, leased: 0 };

  for (let i = 1; i < data.length; i++) {
    const status = (data[i][1] || "").toString().toLowerCase();
    if (stats.hasOwnProperty(status)) {
      stats[status]++;
    }
  }

  return stats;
}


/* ================================================================================================
 * SECTION 3: SIDEBAR INTERFACE (LIVE MAP + STATISTICS)
 * ================================================================================================
 */

/**
 * showInteractiveMapSidebar()
 * -------------------------------------------------------------------------------------------------
 * Opens a sidebar interface inside the Google Sheet that:
 *  - Embeds the interactive map for the selected location.
 *  - Displays real-time statistics below the map.
 *  - Allows users to switch between different property locations.
 */
function showInteractiveMapSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('mapSidebar')
    .setTitle('Storage Caves Map (Multi-Location)');
  SpreadsheetApp.getUi().showSidebar(html);
}


/* ================================================================================================
 * SECTION 4: CUSTOM MENU SETUP
 * ================================================================================================
 */

/**
 * onOpen()
 * -------------------------------------------------------------------------------------------------
 * Automatically adds a custom menu to the Sheet toolbar on open.
 * Provides quick access to the "Storage Caves Map" sidebar.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Storage Caves Map')
    .addItem('Open Interactive Map', 'showInteractiveMapSidebar')
    .addToUi();
}
/**
 * =================================================================================================
 * STORAGE CAVES — GOOGLE SHEETS TO JSON API (VERSION 1)
 * =================================================================================================
 * 
 * OVERVIEW:
 * -------------------------------------------------------------------------------------------------
 * This Google Apps Script transforms a Google Sheet into a live JSON API endpoint that can be 
 * consumed by web-based systems, such as an Image Map Pro interactive map. It reads all rows 
 * and columns from the active sheet, converts them into structured JSON, and returns the data 
 * through a public Web App URL.
 *
 * This version (V1) is the initial release designed for single-location integration.
 * It provides foundational functionality without sidebar integration or multiple sheet support.
 *
 * -------------------------------------------------------------------------------------------------
 * KEY FEATURES:
 * - Converts spreadsheet data into JSON for use in external web applications.
 * - Includes metadata (timestamp and total units).
 * - Supports dynamic fetching with proper JSON response formatting.
 * - Optional built-in statistics summary function for unit availability.
 *
 * -------------------------------------------------------------------------------------------------
 * FILE STRUCTURE:
 *   App-Script-Image-Pro-Google-Sheets-Integration-V1.js
 *
 * -------------------------------------------------------------------------------------------------
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open the desired Google Sheet containing your data.
 * 2. Go to **Extensions → Apps Script**.
 * 3. Delete any existing script content.
 * 4. Paste this entire script into the editor.
 * 5. Save the project (e.g., “App-Script-Image-Pro-Google-Sheets-Integration-V1”).
 * 6. Click **Deploy → New Deployment**.
 * 7. Under "Select type", choose **Web app**.
 * 8. Set:
 *      - **Execute as:** Me (your account)
 *      - **Who has access:** Anyone
 * 9. Click **Deploy** and authorize access if prompted.
 * 10. Copy the generated Web App URL.
 * 11. Paste that URL in your front-end integration (e.g., `SHEET_JSON_URL` in index.html).
 * 
 * -------------------------------------------------------------------------------------------------
 * AUTHOR:
 * Francisco De Oliveira
 *
 * DATE:
 * Initial release
 * 
 * VERSION HISTORY:
 * V1.0  — Core single-sheet JSON API and stats function.
 * =================================================================================================
 */


/* ================================================================================================
 * SECTION 1: MAIN API ENDPOINT (doGet)
 * ================================================================================================
 */

/**
 * doGet()
 * -------------------------------------------------------------------------------------------------
 * Handles HTTP GET requests to the deployed Apps Script URL.
 * Returns a JSON-formatted response containing all rows of the active Google Sheet.
 * 
 * @param {Object} e - The HTTP GET event object (optional).
 * @returns {TextOutput} - A JSON response containing the spreadsheet data and metadata.
 * 
 * JSON STRUCTURE EXAMPLE:
 * {
 *   "success": true,
 *   "lastUpdated": "2025-10-18T17:25:31.000Z",
 *   "totalUnits": 74,
 *   "data": [
 *     { "unit_id": "A1", "status": "AVAILABLE", "price": "By Request", ... },
 *     { "unit_id": "A2", "status": "RESERVED", "price": "—", ... }
 *   ]
 * }
 */
function doGet(e) {
  // Prepare JSON response output
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Retrieve all data from the active sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Extract headers (first row)
    const headers = data[0];
    const jsonData = [];

    // Loop through each row and map to key-value pairs
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip rows with no ID or missing data

      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      jsonData.push(obj);
    }

    // Construct the JSON response with metadata
    const response = {
      success: true,
      lastUpdated: new Date().toISOString(),
      totalUnits: jsonData.length,
      data: jsonData
    };

    // Output JSON content
    output.setContent(JSON.stringify(response));

  } catch (error) {
    // Error handling with structured JSON message
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
 * SECTION 2: STATISTICS SUMMARY FUNCTION
 * ================================================================================================
 */

/**
 * getUnitStats()
 * -------------------------------------------------------------------------------------------------
 * Provides a quick statistical summary of unit availability based on the “status” column.
 * This helper function is optional and can be called manually from the Apps Script editor or
 * integrated into future UI features (e.g., sidebar dashboards).
 * 
 * It assumes that column B contains the unit status values.
 *
 * @returns {Object} - An object containing total counts for each unit status category.
 * 
 * EXAMPLE RETURN VALUE:
 * {
 *   "available": 32,
 *   "sold": 10,
 *   "reserved": 8,
 *   "leased": 4
 * }
 */
function getUnitStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Initialize status counters
  const stats = {
    available: 0,
    sold: 0,
    reserved: 0,
    leased: 0
  };

  // Process each row (skipping header)
  for (let i = 1; i < data.length; i++) {
    const status = data[i][1]; // Column B holds status
    if (status) {
      const normalized = status.toString().toLowerCase();
      if (stats.hasOwnProperty(normalized)) {
        stats[normalized]++;
      }
    }
  }

  return stats;
}


/* ================================================================================================
 * SECTION 3: USAGE NOTES AND FUTURE ENHANCEMENTS
 * ================================================================================================
 *
 * USAGE:
 * - Deploy this script as a Web App to generate a public JSON endpoint.
 * - Use the Web App URL as the data source in your front-end environment.
 * - Example JavaScript fetch call:
 *
 *   fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec')
 *     .then(res => res.json())
 *     .then(data => console.log(data));
 *
 * FUTURE ENHANCEMENTS (V2 and beyond):
 * -------------------------------------------------------------------------------------------------
 * 1. Add an integrated sidebar with live map preview and refresh controls.
 * 2. Introduce location-based filtering for multiple sites (Buford, Fort Mill, Concord, etc.).
 * 3. Include user authentication options (OAuth2 or restricted access).
 * 4. Add error logging and webhook triggers for automatic updates.
 * 5. Implement server-side caching for performance optimization.
 *
 * This file serves as the foundation for all future versions.
 * ================================================================================================
 */
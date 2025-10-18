/**
 * Storage Caves - Google Sheets to JSON API
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire script
 * 5. Click Deploy > New Deployment
 * 6. Select "Web app" as deployment type
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click Deploy and copy the Web App URL
 * 10. Paste that URL in the modified index.html file
 */

function doGet(e) {
  // Allow CORS for cross-origin requests
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Get headers from first row
    const headers = data[0];
    
    // Convert rows to objects
    const jsonData = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[0]) continue;
      
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      jsonData.push(obj);
    }
    
    // Create response with metadata
    const response = {
      success: true,
      lastUpdated: new Date().toISOString(),
      totalUnits: jsonData.length,
      data: jsonData
    };
    
    output.setContent(JSON.stringify(response));
    
  } catch (error) {
    // Error handling
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
 * Optional: Function to get statistics about unit availability
 * Can be called by modifying the doGet function to accept parameters
 */
function getUnitStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  const stats = {
    available: 0,
    sold: 0,
    reserved: 0,
    leased: 0
  };
  
  for (let i = 1; i < data.length; i++) {
    const status = data[i][1]; // Status is in column B (index 1)
    if (status) {
      const statusLower = status.toLowerCase();
      if (stats.hasOwnProperty(statusLower)) {
        stats[statusLower]++;
      }
    }
  }
  
  return stats;
}

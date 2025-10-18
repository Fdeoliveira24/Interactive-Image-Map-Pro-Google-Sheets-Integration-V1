# 🗺️ Interactive Image Map Pro Google Sheets Integration V1README.md

**Dynamic Unit Availability Map Powered by Image Map Pro + Google Sheets**

# 🗺️ Interactive Image Map Pro Google Sheets Integration V1

This project integrates **Image Map Pro** with a live **Google Sheets** data source to automatically update the availability, pricing, and specifications of units displayed on an interactive SVG site plan. The system dynamically updates colors, tooltips, and contact links in real-time — no manual editing inside Image Map Pro required.**Dynamic Unit Availability Map Powered by Image Map Pro + Google Sheets**



---This project integrates **Image Map Pro** with a live **Google Sheets** data source to automatically update the availability, pricing, and specifications of units displayed on an interactive SVG site plan. The system dynamically updates colors, tooltips, and contact links in real-time — no manual editing inside Image Map Pro required.



## 📦 Project Overview---



| Component | Description |## 📦 Project Overview

|------------|-------------|

| **index.html** | Main map file embedding Image Map Pro and connecting to Google Sheets || Component | Description |

| **image-map-pro.min.js** | Core Image Map Pro library (loaded locally or via CDN) ||------------|-------------|

| **Google Apps Script** | Backend API that converts a Google Sheet into JSON for the map || **index.html** | Main map file embedding Image Map Pro and connecting to Google Sheets |

| **Google Sheet** | Master data source with live information about each unit || **image-map-pro.min.js** | Core Image Map Pro library (loaded locally or via CDN) |

| **Google Apps Script** | Backend API that converts a Google Sheet into JSON for the map |

## ⚙️ Features| **Google Sheet** | Master data source with live information about each unit |



✅ **Live Data Sync** – Automatically updates unit status, price, and specs from Google Sheets  ## ⚙️ Features

✅ **Dynamic Tooltip Builder** – Compact and responsive tooltips built on the fly from Sheet data  

✅ **Color Coding** – Visual status indicators (Green: Available, Red: Sold, Orange: Reserved, Blue: Leased)  ✅ **Live Data Sync** – Automatically updates unit status, price, and specs from Google Sheets  

✅ **Interactive Contact Button** – Automatically appears for available units  ✅ **Dynamic Tooltip Builder** – Compact and responsive tooltips built on the fly from Sheet data  

✅ **Mobile Optimized** – Fully responsive tooltip and layout  ✅ **Color Coding** – Visual status indicators (Green: Available, Red: Sold, Orange: Reserved, Blue: Leased)  

✅ **Fail-Safe Loading** – Retries fetch requests and prevents double initialization  ✅ **Interactive Contact Button** – Automatically appears for available units  

✅ **No Manual Updates** – All data managed in Google Sheets  ✅ **Mobile Optimized** – Fully responsive tooltip and layout  

✅ **Fail-Safe Loading** – Retries fetch requests and prevents double initialization  

---✅ **No Manual Updates** – All data managed in Google Sheets  



## 🚀 Quick Start---



### 1. Google Sheets Setup## 🧭 Folder Structure

1. Create a new Google Sheet with these columns in Row 1:

   ```/interactive-map/

   unit_id | status | price | size | total_sqft | depth | width | ceiling_height | lease_rate | description | climate_note├── image-map-pro.min.js

   ```├── storage-caves-v3.html

└── (optional assets: background images, SVG, etc.)

2. Add your unit data (e.g., A1, A2, B1, B2, etc.)

The HTML file can be embedded as an `<iframe>` in WebWave or any website.

3. Go to **Extensions → Apps Script** and paste the code from `App-Script-Image-Pro-Google-Sheets-Integration-V1.js`

---

4. Deploy as Web App:

   - **Execute As:** Me## 🧰 Google Sheets Setup

   - **Access:** Anyone

   - Copy the Web App URL1. Create a new Google Sheet and add the following **columns in Row 1**:



### 2. HTML Integrationunit_id | status | price | size | total_sqft | depth | width | ceiling_height | lease_rate | description | climate_note

1. Update the `SHEET_JSON_URL` in the HTML file with your Web App URL

2. Host the HTML file or embed as iframe2. Add data for each unit (e.g., A1, A2, B1, B2, etc.).

3. Your map will now update live from Google Sheets!

3. Go to **Extensions → Apps Script**, and replace the default code with the following:

---

```js

## 📁 Files Includedfunction doGet(e) {

  const output = ContentService.createTextOutput();

- **`Image-Pro-Google-Sheets-Integration-V1.html`** - Complete interactive map with dynamic Google Sheets integration  output.setMimeType(ContentService.MimeType.JSON);

- **`App-Script-Image-Pro-Google-Sheets-Integration-V1.js`** - Google Apps Script for Sheets-to-JSON API

- **`README.md`** - This documentation  try {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

---    const data = sheet.getDataRange().getValues();

    const headers = data[0];

## 🎨 Status Color Codes    const jsonData = [];



| Status | Color | Hex Code |    for (let i = 1; i < data.length; i++) {

|--------|--------|----------|      const row = data[i];

| Available | 🟩 Green | #75FB4C |      if (!row[0]) continue;

| Sold | 🟥 Red | #C12928 |      const obj = {};

| Reserved | 🟧 Orange | #FFAE42 |      for (let j = 0; j < headers.length; j++) {

| Leased | 🟦 Blue | #4C9AFF |        obj[headers[j]] = row[j];

      }

---      jsonData.push(obj);

    }

## 📱 Mobile Responsive

    const response = {

All tooltips are dynamically generated with compact spacing, ensuring consistent appearance across desktop and mobile devices.      success: true,

      lastUpdated: new Date().toISOString(),

---      totalUnits: jsonData.length,

      data: jsonData

## 🧩 Credits    };



**Developed by:** 360 Virtual Tour Solutions      output.setContent(JSON.stringify(response));

**Author:** Francisco De Oliveira    } catch (error) {

**Libraries:** Image Map Pro      const errorResponse = {

**Backend:** Google Apps Script (Sheets → JSON API)      success: false,

      error: error.toString(),

---      message: "Failed to fetch data from Google Sheet"

    };

## 📘 License    output.setContent(JSON.stringify(errorResponse));

  }

This integration is for interactive real estate maps and may be reused or modified under a non-exclusive license agreement with 360 Virtual Tour Solutions.
  return output;
}

	4.	Click Deploy → New Deployment
	•	Type: Web App
	•	Execute As: Me
	•	Access: Anyone
	•	Copy the Web App URL — you’ll need this for the HTML file.

⸻

🌐 HTML Integration (index.html)

The main map file (storage-caves-v3.html) includes:
	•	The Image Map Pro export configuration (window.EXPORT_CONFIG)
	•	A dynamic JavaScript module that:
	•	Fetches Google Sheet data
	•	Updates tooltips, colors, and button visibility
	•	Initializes the map once data is loaded

To update your Google Sheet URL, edit this line in the script:

const SHEET_JSON_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';


⸻

🎨 Status Color Codes

Status	Color	Hex Code
Available	🟩 Green	#75FB4C
Sold	🟥 Red	#C12928
Reserved	🟧 Orange	#FFAE42
Leased	🟦 Blue	#4C9AFF


⸻

📱 Responsive Tooltip Design

All tooltip rows are generated dynamically with compact boxModel spacing, ensuring consistent appearance across desktop and mobile.

Example Tooltip Layout:

UNIT B10
RESERVED
Not a Climate Control Unit
Price: $155,000
Size: 22x55
Total Sq Ft: 1,210 sq ft
Interior Depth: 55 ft
Interior Width: 22 ft
Minimum Ceiling Height: 16 ft
Lease Rate: Inquire
Reserved until March

If status = Available → adds:
[Contact Us Button → https://storagecaves.com/contact]

⸻

🧪 Testing
	•	Refresh page multiple times to verify dynamic data loads correctly.
	•	Test on both desktop and mobile resolutions.
	•	Confirm color changes match status fields.
	•	Check that the last updated timestamp appears in the bottom-right corner.

⸻

🚀 Deployment
	1.	Host this folder (interactive-map) on your web server.
	2.	Embed the map using an <iframe>:

<iframe src="https://yourdomain.com/interactive-map/storage-caves-v3.html" width="100%" height="800"></iframe>


	3.	Update the Google Sheet any time — changes appear live within seconds.

⸻

🧩 Credits

Developed by: 360 Virtual Tour Solutions
Author: Francisco De Oliveira
Libraries: Image Map Pro
Backend: Google Apps Script (Sheets → JSON API)

⸻

📘 License

This integration is for Storage Caves and may be reused or modified for other interactive real estate maps under a non-exclusive license agreement with 360 Virtual Tour Solutions.

⸻

🧠 Notes for GitHub Copilot

When creating this repository:
	•	Name it: Interactive-Image-Map-Pro-Google-Sheets-Integration-V1

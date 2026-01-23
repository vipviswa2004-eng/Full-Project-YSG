const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_URL = "http://localhost:5000/api";

const check = async () => {
    let report = "DEPLOYMENT READINESS REPORT\n";
    report += "==========================\n\n";

    try {
        const cats = await axios.get(`${API_URL}/shop-categories`);
        report += `[PASS] Shop Categories: ${cats.data.length} found\n`;
    } catch (e) { report += `[FAIL] Shop Categories: ${e.message}\n`; }

    try {
        const prods = await axios.get(`${API_URL}/products?limit=1`);
        report += `[PASS] Products API: ${prods.data.length} found\n`;
    } catch (e) { report += `[FAIL] Products API: ${e.message}\n`; }

    try {
        const secs = await axios.get(`${API_URL}/sections`);
        report += `[PASS] Sections API: ${secs.data.length} found\n`;
    } catch (e) { report += `[FAIL] Sections API: ${e.message}\n`; }

    fs.writeFileSync('ready_report.txt', report);
    console.log("Report generated.");
};

check();

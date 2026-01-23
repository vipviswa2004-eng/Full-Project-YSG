const axios = require('axios');
const fs = require('fs');

const API_URL = "http://localhost:5000/api";

const check = async () => {
    try {
        const catsRes = await axios.get(`${API_URL}/shop-categories`);
        const cats = catsRes.data;

        fs.writeFileSync('cat_sample.json', JSON.stringify(cats.slice(0, 5), null, 2));
    } catch (e) {
        console.error('API call failed:', e.message);
    }
};

check();

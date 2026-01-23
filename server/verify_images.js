const axios = require('axios');

const check = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/shop-categories');
        const mapped = res.data.filter(c => c.image && c.image.startsWith('/categories/'));
        console.log(`✅ Categories with local images: ${mapped.length}`);
        mapped.forEach(c => console.log(`  - ${c.name.trim()}: ${c.image}`));
    } catch (e) {
        console.error('Error:', e.message);
    }
};

check();

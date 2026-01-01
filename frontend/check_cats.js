const fetchCats = async () => {
    try {
        const r = await fetch('http://localhost:5000/api/shop-categories');
        const cats = await r.json();
        const personal = cats.filter(c => (c.sectionIds || [c.sectionId] || []).includes('sec_personalised'));
        console.log('Total Personalised:', personal.length);
        personal.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
    } catch (e) { console.error(e); }
};
fetchCats();

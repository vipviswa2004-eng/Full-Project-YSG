const fetchInfo = async () => {
    try {
        const [sR, cR] = await Promise.all([
            fetch('http://localhost:5000/api/sections'),
            fetch('http://localhost:5000/api/shop-categories')
        ]);
        const sections = await sR.json();
        const categories = await cR.json();
        console.log('Sections:', sections.map(s => ({ id: s.id || s._id, title: s.title || s.name })));
        console.log('Categories Total:', categories.length);
        const perSection = {};
        sections.forEach(s => {
            const id = s.id || s._id;
            perSection[s.title || s.name] = categories.filter(c => (c.sectionIds || [c.sectionId] || []).includes(id)).map(c => c.name);
        });
        console.log(perSection);
    } catch (e) { console.error(e); }
};
fetchInfo();

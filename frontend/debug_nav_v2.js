async function debug() {
    const [sec, occ] = await Promise.all([
        fetch('http://localhost:5000/api/sections').then(r => r.json()),
        fetch('http://localhost:5000/api/special-occasions').then(r => r.json())
    ]);
    console.log('--- SECTIONS ---');
    sec.forEach(s => console.log(`ID: ${s.id || s._id} | Title: ${s.title || s.name} | Image: ${s.image || 'None'}`));
    console.log('--- OCCASIONS ---');
    occ.forEach(o => console.log(`ID: ${o.id || o._id} | Name: ${o.name} | Image: ${o.image || 'None'}`));
}
debug();

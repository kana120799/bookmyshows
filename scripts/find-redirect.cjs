
try {
    const dist = require('next/dist/client/components/redirect');
    console.log('Keys in dist/redirect:', Object.keys(dist));
} catch (e) { console.log('dist/redirect failed:', e.message) }

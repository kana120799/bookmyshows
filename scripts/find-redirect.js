
try {
    const nav = require('next/navigation');
    console.log('In navigation:', !!nav.isRedirectError);
} catch (e) { console.log('navigation failed:', e.message) }

try {
    const dist = require('next/dist/client/components/redirect');
    console.log('In dist/redirect:', !!dist.isRedirectError);
} catch (e) { console.log('dist/redirect failed:', e.message) }

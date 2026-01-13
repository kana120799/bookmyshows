
const React = require('react');

module.exports = new Proxy({}, {
    get: (target, prop) => {
        return () => React.createElement('div', { 'data-testid': `icon-${String(prop)}` });
    }
});

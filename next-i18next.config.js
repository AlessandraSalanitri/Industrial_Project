// next-i18next.config.js
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'ro'],
  },
  localePath: path.resolve('./public/locales'), // ✅ ensures correct path
};

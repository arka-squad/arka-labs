/* eslint-disable */
const { readFileSync } = require('fs');
const { join } = require('path');
const content = readFileSync(join(__dirname, '..', 'app', 'login', 'page.tsx'), 'utf8');
if (!content.includes("router.push('/console')")) {
  console.error('Expected login page to redirect to /console');
  process.exit(1);
}

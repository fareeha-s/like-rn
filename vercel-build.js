const fs = require('fs');
const path = require('path');

const content = `
// This is a dummy file to satisfy Vercel's build process
console.warn('Dummy firebase_creds file loaded. This should not happen in production.');
export default {};
`;

const directory = '/vercel/path0/src';
const filePath = path.join(directory, 'firebase_creds.js');

try {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`Created dummy firebase_creds.js at ${filePath}`);
} catch (error) {
  console.error('Error creating firebase_creds.js:', error);
}

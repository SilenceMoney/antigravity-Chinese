const fs = require('fs');
const path = require('path');
const os = require('os');

const homedir = os.homedir();
const resourcesPath = path.join(homedir, 'AppData/Local/Programs/antigravity/resources');
const asarPath = path.join(resourcesPath, 'app.asar');
const backupPath = path.join(resourcesPath, 'app.asar.bak');

console.log('--- Antigravity Chinese Localization Uninstaller ---');
console.log('Resolving resources directory:', resourcesPath);

if (!fs.existsSync(backupPath)) {
  console.log('Error: Original backup file (app.asar.bak) not found.');
  console.log('Your client is already in the original state, or you may need to re-install Antigravity.');
  process.exit(1);
}

try {
  console.log('Restoring app.asar from backup...');
  fs.copyFileSync(backupPath, asarPath);
  
  console.log('Deleting backup file...');
  fs.rmSync(backupPath, { force: true });
  
  console.log('\n==============================================');
  console.log('Uninstallation Complete!');
  console.log('Client has been restored to the original English version.');
  console.log('Please restart your Antigravity client to apply!');
  console.log('==============================================');
} catch (err) {
  console.error('Error during uninstallation:', err.message);
  process.exit(1);
}

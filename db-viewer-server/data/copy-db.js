const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create a directory to store the database
const dbDir = path.join(__dirname, 'db-viewer-server', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Path where the database will be copied
const localDbPath = path.join(dbDir, 'habitosdeleitura.db');

// Command to pull the database from the Android device
const adbCommand = 'adb pull /data/user/0/host.exp.exponent/files/SQLite/habitosdeleitura.db ' + localDbPath;

console.log('Copying database from Android device...');
exec(adbCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Error copying database:', error);
    return;
  }
  if (stderr) {
    console.error('Error:', stderr);
    return;
  }
  console.log('Database copied successfully to:', localDbPath);
});
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create a directory to store the database
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Path where the database will be copied
const localDbPath = path.join(dbDir, 'habitosdeleitura.db');

// Command to pull the database from the Android device
const adbCommand = `adb pull "/data/user/0/host.exp.exponent/files/SQLite/habitosdeleitura.db" "${localDbPath}"`;

console.log('Copying database from Android device...');
console.log('Source:', '/data/user/0/host.exp.exponent/files/SQLite/habitosdeleitura.db');
console.log('Destination:', localDbPath);

exec(adbCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Error copying database:', error);
    return;
  }
  if (stderr && !stderr.includes('pulled')) {
    console.error('Error:', stderr);
    return;
  }
  console.log('Database copied successfully to:', localDbPath);
  
  // Verify the file was copied
  if (fs.existsSync(localDbPath)) {
    const stats = fs.statSync(localDbPath);
    console.log('Copied file size:', stats.size, 'bytes');
  } else {
    console.error('File was not copied successfully');
  }
});
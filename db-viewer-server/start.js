const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to copy database
function copyDatabase() {
  return new Promise((resolve, reject) => {
    const dbDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const localDbPath = path.join(dbDir, 'habitosdeleitura.db');
    const adbCommand = `adb pull "/data/user/0/host.exp.exponent/files/SQLite/habitosdeleitura.db" "${localDbPath}"`;

    console.log('Copying database from Android device...');
    console.log('Source:', '/data/user/0/host.exp.exponent/files/SQLite/habitosdeleitura.db');
    console.log('Destination:', localDbPath);

    exec(adbCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error copying database:', error);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('pulled')) {
        console.error('Error:', stderr);
        reject(new Error(stderr));
        return;
      }
      console.log('Database copied successfully to:', localDbPath);
      
      // Verify the file was copied
      if (fs.existsSync(localDbPath)) {
        const stats = fs.statSync(localDbPath);
        console.log('Copied file size:', stats.size, 'bytes');
        resolve();
      } else {
        reject(new Error('File was not copied successfully'));
      }
    });
  });
}

// Function to start server
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('\nStarting server...');
    const server = exec('node src/index.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error starting server:', error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error('Server error:', stderr);
        reject(new Error(stderr));
        return;
      }
      console.log(stdout);
      resolve();
    });

    // Forward server output
    server.stdout.pipe(process.stdout);
    server.stderr.pipe(process.stderr);
  });
}

// Main function
async function main() {
  try {
    // First copy the database
    await copyDatabase();
    
    // Then start the server
    await startServer();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 
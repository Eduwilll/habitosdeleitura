const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const dbPath = path.join(__dirname, '..', 'data', 'test.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  console.log('Please run copy-db.js first to copy the database from your Android device');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Routes
app.get('/api/tables', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(tables);
  });
});

app.get('/api/table/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/table/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const data = req.body;
  
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);

  const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
  
  db.run(query, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/table/:tableName/:id', (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  const data = req.body;
  
  const setClause = Object.keys(data)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(data), id];

  const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/table/:tableName/:id', (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  
  db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
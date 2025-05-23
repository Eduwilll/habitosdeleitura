import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase | null = null;

const getDatabase = () => {
  if (!db) {
    try {
      console.log('Opening database...');
      db = openDatabaseSync('habitosdeleitura.db');
      console.log('Database opened successfully');
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
};

export const createTable = () => {
  try {
    console.log('Creating table...');
    const database = getDatabase();
    database.execAsync('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT);')
      .then(() => console.log('Table created successfully'))
      .catch(err => console.error('Error creating table:', err));
  } catch (error) {
    console.error('Error in createTable:', error);
  }
};

export const listAllUsers = (callback: (error: Error | null, users?: any[]) => void) => {
    try {
      const database = getDatabase();
      database.getAllAsync('SELECT * FROM users')
        .then(users => {
          console.log('Users from getAllAsync:', users);
          callback(null, users);
        })
        .catch(err => {
          console.error('Erro ao listar usuários:', err);
          callback(err);
        });
    } catch (error) {
      console.error('Erro geral em listAllUsers:', error);
      callback(error instanceof Error ? error : new Error('Erro desconhecido'));
    }
  };
  
  

export const insertUser = (username: string, password: string, callback: (error: Error | null, result?: any) => void) => {
  try {
    console.log('Inserting user:', { username, password });
    const database = getDatabase();
    const sql = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
    console.log('Executing SQL:', sql);
    database.execAsync(sql)
      .then(resultSet => {
        console.log('Insert result:', resultSet);
        callback(null, resultSet);
      })
      .catch(err => {
        console.error('Error inserting user:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in insertUser:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const getUser = (username: string, password: string, callback: (error: Error | null, user?: any) => void) => {
  try {
    console.log('Getting user:', { username, password });
    const database = getDatabase();
    const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('Executing SQL:', sql);
    database.getAllAsync(sql)
      .then(results => {
        console.log('Query results:', results);
        if (!results || results.length === 0) {
          console.log('No user found');
          callback(null, null);
        } else {
          callback(null, results[0]);
        }
      })
      .catch(err => {
        console.error('Error executing query:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in getUser:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
}; 
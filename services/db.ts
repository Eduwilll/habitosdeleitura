import * as FileSystem from 'expo-file-system';
import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { Book } from './googleBooks';

let db: SQLiteDatabase | null = null;

interface BookRow {
  id: string;
  title: string;
  authors: string;
  description: string | null;
  thumbnail: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  categories: string;
  averageRating: number | null;
  status: string;
  dateAdded: string;
}

interface ReminderRow {
  id: string;
  bookId: string;
  bookTitle: string;
  time: string;
  daysOfWeek: string;
  isEnabled: number;
}

const getDatabase = () => {
  if (!db) {
    try {
      console.log('Opening database...');
      db = openDatabaseSync('habitosdeleitura.db');
      console.log('Database opened successfully');

      // Add this to your app where you initialize the database
      console.log('Database path:', FileSystem.documentDirectory + 'SQLite/habitosdeleitura.db');
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
};

export const createTables = () => {
  try {
    console.log('Creating tables...');
    const database = getDatabase();
    
    // Create users table
    database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
      );
    `).then(() => console.log('Users table created successfully'))
      .catch(err => console.error('Error creating users table:', err));

    // Create books table
    database.execAsync(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT,
        description TEXT,
        thumbnail TEXT,
        publishedDate TEXT,
        pageCount INTEGER,
        categories TEXT,
        averageRating REAL,
        status TEXT DEFAULT 'to-read',
        dateAdded TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `).then(() => console.log('Books table created successfully'))
      .catch(err => console.error('Error creating books table:', err));

    // Create reminders table
    database.execAsync(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        bookId TEXT NOT NULL,
        bookTitle TEXT NOT NULL,
        time TEXT NOT NULL,
        daysOfWeek TEXT NOT NULL,
        isEnabled INTEGER DEFAULT 1,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
      );
    `).then(() => console.log('Reminders table created successfully'))
      .catch(err => console.error('Error creating reminders table:', err));
  } catch (error) {
    console.error('Error in createTables:', error);
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
  
  

export const insertUser = (username: string, email: string, password: string, callback: (error: Error | null, result?: any) => void) => {
  try {
    console.log('Inserting user:', { username, email, password });
    const database = getDatabase();
    const sql = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
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

export const addBookToLibrary = (book: Book, callback: (error: Error | null, result?: any) => void) => {
  try {
    console.log('Adding book to library:', book);
    const database = getDatabase();
    
    // First, ensure the tables exist
    createTables();

    // Validate required fields
    if (!book.id || !book.title) {
      const error = new Error('Book ID and title are required');
      console.error('Validation error:', error);
      callback(error);
      return;
    }

    // Prepare the data
    const bookData = {
      id: book.id,
      title: book.title,
      authors: book.authors ? JSON.stringify(book.authors) : '[]',
      description: book.description || '',
      thumbnail: book.thumbnail || '',
      publishedDate: book.publishedDate || '',
      pageCount: book.pageCount || 0,
      categories: book.categories ? JSON.stringify(book.categories) : '[]',
      averageRating: book.averageRating || 0,
      status: 'to-read'
    };

    // Log the data for debugging
    console.log('Book data to insert:', bookData);

    // Use a simpler SQL statement with direct values
    const sql = `
      INSERT OR REPLACE INTO books (
        id, title, authors, description, thumbnail,
        publishedDate, pageCount, categories, averageRating,
        status
      ) VALUES (
        '${bookData.id}',
        '${bookData.title.replace(/'/g, "''")}',
        '${bookData.authors.replace(/'/g, "''")}',
        '${bookData.description.replace(/'/g, "''")}',
        '${bookData.thumbnail.replace(/'/g, "''")}',
        '${bookData.publishedDate}',
        ${bookData.pageCount},
        '${bookData.categories.replace(/'/g, "''")}',
        ${bookData.averageRating},
        '${bookData.status}'
      )
    `;

    console.log('Executing SQL:', sql);

    database.execAsync(sql)
      .then(resultSet => {
        console.log('Book added successfully:', resultSet);
        callback(null, resultSet);
      })
      .catch(err => {
        console.error('Error adding book:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in addBookToLibrary:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const getLibraryBooks = (callback: (error: Error | null, books?: Book[]) => void) => {
  try {
    console.log('Getting library books...');
    const database = getDatabase();
    
    const sql = 'SELECT * FROM books ORDER BY dateAdded DESC';
    console.log('Executing SQL:', sql);

    database.getAllAsync<BookRow>(sql)
      .then(results => {
        // console.log('Raw database results:', results);
        
        const books = results.map(row => {
          try {
            const book: Book = {
              id: row.id,
              title: row.title,
              authors: row.authors ? JSON.parse(row.authors) : [],
              description: row.description || undefined,
              thumbnail: row.thumbnail || undefined,
              publishedDate: row.publishedDate || undefined,
              pageCount: row.pageCount || undefined,
              categories: row.categories ? JSON.parse(row.categories) : [],
              averageRating: row.averageRating || undefined,
              status: row.status as 'reading' | 'completed' | 'to-read'
            };
            // console.log('Parsed book:', book);
            return book;
          } catch (parseError) {
            console.error('Error parsing book row:', row, parseError);
            return null;
          }
        }).filter((book): book is Book => book !== null);

        // console.log('Final parsed books:', books);
        callback(null, books);
      })
      .catch(err => {
        console.error('Error getting library books:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in getLibraryBooks:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const updateBookStatus = (bookId: string, status: 'reading' | 'completed' | 'to-read', callback: (error: Error | null, result?: any) => void) => {
  try {
    const database = getDatabase();
    const sql = `UPDATE books SET status = '${status}' WHERE id = '${bookId}'`;
    database.execAsync(sql)
      .then(resultSet => {
        console.log('Book status updated successfully:', resultSet);
        callback(null, resultSet);
      })
      .catch(err => {
        console.error('Error updating book status:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in updateBookStatus:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const removeBookFromLibrary = (bookId: string, callback: (error: Error | null, result?: any) => void) => {
  try {
    const database = getDatabase();
    const sql = `DELETE FROM books WHERE id = '${bookId}'`;
    database.execAsync(sql)
      .then(resultSet => {
        console.log('Book removed successfully:', resultSet);
        callback(null, resultSet);
      })
      .catch(err => {
        console.error('Error removing book:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in removeBookFromLibrary:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const addReadingReminder = (
  bookId: string,
  bookTitle: string,
  time: string,
  daysOfWeek: number[],
  callback: (error: Error | null, result?: any) => void
) => {
  try {
    const database = getDatabase();
    const reminderId = `reminder_${Date.now()}`;
    const daysOfWeekStr = JSON.stringify(daysOfWeek);
    
    const sql = `
      INSERT INTO reminders (id, bookId, bookTitle, time, daysOfWeek, isEnabled)
      VALUES ('${reminderId}', '${bookId}', '${bookTitle.replace(/'/g, "''")}', '${time}', '${daysOfWeekStr}', 1)
    `;

    database.execAsync(sql)
      .then(resultSet => {
        console.log('Reminder added successfully:', resultSet);
        callback(null, resultSet);
      })
      .catch(err => {
        console.error('Error adding reminder:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in addReadingReminder:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const getBookReminders = (
  bookId: string,
  callback: (error: Error | null, reminders?: ReminderRow[]) => void
) => {
  try {
    const database = getDatabase();
    const sql = `SELECT * FROM reminders WHERE bookId = '${bookId}'`;

    database.getAllAsync<ReminderRow>(sql)
      .then(results => {
        console.log('Reminders retrieved:', results);
        callback(null, results);
      })
      .catch(err => {
        console.error('Error getting reminders:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in getBookReminders:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const updateReminder = (
  reminderId: string,
  time: string,
  daysOfWeek: number[],
  isEnabled: boolean,
  callback: (error: Error | null, result?: any) => void
) => {
  try {
    const database = getDatabase();
    const daysOfWeekStr = JSON.stringify(daysOfWeek);
    
    const sql = `
      UPDATE reminders 
      SET time = '${time}', 
          daysOfWeek = '${daysOfWeekStr}', 
          isEnabled = ${isEnabled ? 1 : 0}
      WHERE id = '${reminderId}'
    `;

    database.execAsync(sql)
      .then(resultSet => {
        console.log('Reminder updated successfully:', resultSet);
        callback(null, resultSet);
      })
      .catch(err => {
        console.error('Error updating reminder:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in updateReminder:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
};

export const deleteReminder = (
  reminderId: string,
  callback: (error: Error | null, result?: any) => void
) => {
  try {
    const database = getDatabase();
    const sql = `DELETE FROM reminders WHERE id = '${reminderId}'`;

    database.execAsync(sql)
      .then(resultSet => {
        console.log('Reminder deleted successfully:', resultSet);
        callback(null, resultSet);
      })
      .catch(err => {
        console.error('Error deleting reminder:', err);
        callback(err);
      });
  } catch (error) {
    console.error('Error in deleteReminder:', error);
    callback(error instanceof Error ? error : new Error('Database error'));
  }
}; 
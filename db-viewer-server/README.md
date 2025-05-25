# SQLite Database Viewer Web Service

A web-based interface for viewing and managing your SQLite database. This service provides a modern UI for viewing, adding, editing, and deleting records in your database tables.

## Features

- View all tables in your SQLite database
- Browse table contents
- Add new records
- Edit existing records
- Delete records
- Modern, responsive UI with Tailwind CSS
- Real-time updates

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to the project directory:
   ```bash
   cd db-viewer-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Make sure your SQLite database file (`habitosdeleitura.db`) is in the correct location:
   - The database file should be in the `SQLite` directory of your React Native app
   - The server will look for the database at: `../../SQLite/habitosdeleitura.db` relative to the server's location

2. Start the server:
   ```bash
   npm start
   ```

3. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /api/tables` - Get list of all tables
- `GET /api/table/:tableName` - Get all records from a table
- `POST /api/table/:tableName` - Add a new record
- `PUT /api/table/:tableName/:id` - Update a record
- `DELETE /api/table/:tableName/:id` - Delete a record

## Security Note

This service is intended for development and debugging purposes only. Do not expose it to the public internet without proper security measures in place.

## License

MIT 
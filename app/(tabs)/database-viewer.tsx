import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLibraryBooks, listAllUsers } from '../../services/db';
import { Book } from '../../services/googleBooks';

export default function DatabaseViewer() {
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DatabaseViewer mounted');
    loadUsers();
    loadBooks();
  }, []);

  const loadUsers = () => {
    console.log('Loading users...');
    listAllUsers((err, result) => {
      if (err) {
        console.error('Error in loadUsers:', err);
        setError(err.message);
      } else {
        console.log('Users loaded:', result);
        setUsers(result || []);
      }
    });
  };

  const loadBooks = () => {
    console.log('Loading books...');
    getLibraryBooks((err, result) => {
      if (err) {
        console.error('Error in loadBooks:', err);
        setError(err.message);
      } else {
        console.log('Books loaded:', result);
        setBooks(result || []);
      }
    });
  };

  console.log('Current users state:', users);
  console.log('Current books state:', books);
  console.log('Current error state:', error);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Database Contents</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}

      {/* Users Table */}
      <Text style={styles.sectionTitle}>Users</Text>
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={styles.headerCell}>ID</Text>
          <Text style={styles.headerCell}>Username</Text>
          <Text style={styles.headerCell}>Password</Text>
          <Text style={styles.headerCell}>Email</Text>
        </View>
        {users.length === 0 ? (
          <View style={styles.row}>
            <Text style={styles.cell}>No users found</Text>
          </View>
        ) : (
          users.map((user, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{user.id}</Text>
              <Text style={styles.cell}>{user.username}</Text>
              <Text style={styles.cell}>{user.password}</Text>
              <Text style={styles.cell}>{user.email}</Text>
            </View>
          ))
        )}
      </View>

      {/* Books Table */}
      <Text style={styles.sectionTitle}>Library Books</Text>
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={styles.headerCell}>ID</Text>
          <Text style={styles.headerCell}>Title</Text>
          <Text style={styles.headerCell}>Authors</Text>
          <Text style={styles.headerCell}>Status</Text>
        </View>
        {books.length === 0 ? (
          <View style={styles.row}>
            <Text style={styles.cell}>No books found</Text>
          </View>
        ) : (
          books.map((book, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{book.id}</Text>
              <Text style={styles.cell}>{book.title}</Text>
              <Text style={styles.cell}>{book.authors?.join(', ')}</Text>
              <Text style={styles.cell}>{book.status}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
  },
}); 
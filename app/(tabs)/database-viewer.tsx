import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { listAllUsers } from '../../services/db';

export default function DatabaseViewer() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DatabaseViewer mounted');
    loadUsers();
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

  console.log('Current users state:', users);
  console.log('Current error state:', error);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Database Contents</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={styles.headerCell}>ID</Text>
          <Text style={styles.headerCell}>Username</Text>
          <Text style={styles.headerCell}>Password</Text>
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
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
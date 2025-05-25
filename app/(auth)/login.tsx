import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/styles/global';

const deleteDatabase = async () => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/habitosdeleitura.db`;
  const fileInfo = await FileSystem.getInfoAsync(dbPath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(dbPath);
    console.log('Banco deletado com sucesso.');
  } else {
    console.log('Banco não encontrado.');
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // // use to delete the database SQLite
  // useEffect(() => {
  //   deleteDatabase();
  // }, []);

  // Navigate to tabs if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    login(email, password, (err) => {
      if (err) {
        Alert.alert('Erro ao fazer login', err.message);
        console.log(err);
      } else {
        router.replace('/(tabs)');
      }
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={[globalStyles.authContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={{ marginTop: 20 }}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={globalStyles.authContainer}>
      <ThemedText style={globalStyles.authTitle}>Login</ThemedText>
      
      <TextInput
        style={globalStyles.authInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={globalStyles.authInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={globalStyles.authButton} onPress={handleLogin}>
        <ThemedText style={globalStyles.authButtonText}>Login</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={globalStyles.authLink}
        onPress={() => router.push('/register')}
      >
        <ThemedText style={globalStyles.authLinkText}>
          Don't have an account? Register
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
} 
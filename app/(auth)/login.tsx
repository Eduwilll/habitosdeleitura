import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, TextInput, TouchableOpacity } from 'react-native';
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
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // // use to delete the database SQLite
  // useEffect(() => {
  //   deleteDatabase();
  // }, []);

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
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        router.push('/(tabs)');
      }
    });
  };

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
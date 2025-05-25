import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput, TouchableOpacity } from 'react-native';
import { createTables, insertUser } from '../../services/db';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors, globalStyles } from '@/styles/global';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    createTables();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = () => {
    if (!username || !password || !email || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }

    setEmailError('');

    insertUser(username, email, password, (err, result) => {
      if (err) {
        Alert.alert('Erro ao registrar', err.message);
        console.log(err);
      } else {
        Alert.alert('Sucesso', 'Usuário registrado!');
        router.push('/login');
      }
    });
  };

  return (
    <ThemedView style={globalStyles.authContainer}>
      <ThemedText style={globalStyles.authTitle}>Register</ThemedText>
      
      <TextInput
        style={globalStyles.authInput}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
      />
      
      <TextInput
        style={[
          globalStyles.authInput,
          emailError ? { borderColor: colors.danger } : {}
        ]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {emailError ? (
        <ThemedText style={{ color: colors.danger, marginBottom: 10 }}>
          {emailError}
        </ThemedText>
      ) : null}
      
      <TextInput
        style={globalStyles.authInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={globalStyles.authInput}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={globalStyles.authButton} onPress={handleRegister}>
        <ThemedText style={globalStyles.authButtonText}>Register</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={globalStyles.authLink}
        onPress={() => router.push('/login')}
      >
        <ThemedText style={globalStyles.authLinkText}>
          Already have an account? Login
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
} 
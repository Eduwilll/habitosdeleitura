import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput, TouchableOpacity } from 'react-native';
import { createTables, insertUser } from '../../services/db';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { strings } from '@/constants/strings';
import { colors, globalStyles } from '@/styles/global';

const string = strings.auth.register;

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
      Alert.alert(strings.common.error, string.errorEmptyFields);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(strings.common.error, string.errorPasswordsDontMatch);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }

    setEmailError('');

    insertUser(username, email, password, (err, result) => {
      if (err) {
        Alert.alert(strings.common.error, string.errorRegistrationFailed);
        console.log(err);
      } else {
        Alert.alert(strings.common.success, 'Usuário registrado!');
        router.push('/login');
      }
    });
  };

  return (
    <ThemedView style={globalStyles.authContainer}>
      <ThemedText style={globalStyles.authTitle}>{string.title}</ThemedText>
      
      <TextInput
        style={globalStyles.authInput}
        placeholder={string.usernamePlaceholder}
        value={username}
        onChangeText={setUsername}
      />
      
      <TextInput
        style={[
          globalStyles.authInput,
          emailError ? { borderColor: colors.danger } : {}
        ]}
        placeholder={string.emailPlaceholder}
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
        placeholder={string.passwordPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={globalStyles.authInput}
        placeholder={string.confirmPasswordPlaceholder}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={globalStyles.authButton} onPress={handleRegister}>
        <ThemedText style={globalStyles.authButtonText}>{string.registerButton}</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={globalStyles.authLink}
        onPress={() => router.push('/login')}
      >
        <ThemedText style={globalStyles.authLinkText}>
          {string.loginLink}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
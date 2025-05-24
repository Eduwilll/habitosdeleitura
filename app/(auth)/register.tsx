import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { createTables, insertUser } from '../../services/db';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  useEffect(() => {
    createTables();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = () => {
    if (!username || !password || !email) {
      Alert.alert('Erro', 'Preencha todos os campos');
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Registro</Text>
      <TextInput
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          { borderWidth: 1, padding: 8, marginVertical: 10 },
          emailError ? { borderColor: 'red' } : {}
        ]}
      />
      {emailError ? <Text style={{ color: 'red', marginBottom: 10 }}>{emailError}</Text> : null}
      <TextInput
        placeholder="Senha"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />
      <Button title="Registrar" onPress={handleRegister} />
      <View style={{ marginTop: 10 }}>
        <Button title="Voltar para Login" onPress={() => router.push('/login')} />
      </View>
    </View>
  );
} 
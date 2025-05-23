import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    login(username, password, (err) => {
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Login</Text>
      <TextInput
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />
      <Button title="Entrar" onPress={handleLogin} />
      <View style={{ marginTop: 10 }}>
        <Button title="Ir para Registro" onPress={() => router.push('/register')} />
      </View>
    </View>
  );
} 
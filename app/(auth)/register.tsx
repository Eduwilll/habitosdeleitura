import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { createTable, insertUser } from '../../services/db';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    createTable();
  }, []);

  const handleRegister = () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    insertUser(username, password, (err, result) => {
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
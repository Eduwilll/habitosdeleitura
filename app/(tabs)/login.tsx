import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { getUser, insertUser } from '../../services/db';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    useEffect(() => {
      insertUser('teste', '1234', (err, res) => {
        if (err) {
          console.error('Erro ao inserir usuário de teste:', err);
        } else {
          console.log('Usuário de teste inserido:', res);
        }
      });
    }, []);
    getUser(username, password, (err, user) => {
      if (err) {
        Alert.alert('Erro ao fazer login', err.message);
        console.log(err);
      } else if (user) {
        Alert.alert('Sucesso', `Bem-vindo, ${user.username}`);
        // Aqui você pode redirecionar para a home ou dashboard
        router.push('/explore');
            
      } else {
        Alert.alert('Falha', 'Usuário ou senha inválidos');
        console.log(err);
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
      <View style={{ marginTop: 10 }}>
        <Button title="Ver Banco de Dados" onPress={() => router.push('/database-viewer')} />
      </View>
    </View>
  );
}

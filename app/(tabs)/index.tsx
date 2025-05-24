import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <ThemedText type="title">Bem-vindo, {user?.username}</ThemedText>
        <TouchableOpacity style={styles.addButton}>
          <FontAwesome name="plus" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Reading Progress Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Progresso Semanal</ThemedText>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <ThemedText>3/5 dias de leitura</ThemedText>
        </View>
      </ThemedView>

      {/* Current Book Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Livro Atual</ThemedText>
        <View style={styles.currentBook}>
          <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={styles.bookCover}
          />
          <View style={styles.bookInfo}>
            <ThemedText type="defaultSemiBold">O Nome do Vento</ThemedText>
            <ThemedText>Patrick Rothfuss</ThemedText>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '45%' }]} />
            </View>
            <ThemedText>45% concluído</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Reading Goals Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Metas de Leitura</ThemedText>
        <View style={styles.goalsContainer}>
          <View style={styles.goalItem}>
            <FontAwesome name="book" size={24} color="#007AFF" />
            <View style={styles.goalInfo}>
              <ThemedText type="defaultSemiBold">Livros por Mês</ThemedText>
              <ThemedText>2/4 livros</ThemedText>
            </View>
          </View>
          <View style={styles.goalItem}>
            <FontAwesome name="clock-o" size={24} color="#007AFF" />
            <View style={styles.goalInfo}>
              <ThemedText type="defaultSemiBold">Minutos Diários</ThemedText>
              <ThemedText>30/60 minutos</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    padding: 10,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  currentBook: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  goalsContainer: {
    marginTop: 12,
    gap: 16,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goalInfo: {
    flex: 1,
  },
});

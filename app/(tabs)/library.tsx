import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Mock data for books
const mockBooks = [
  {
    id: 1,
    title: 'O Nome do Vento',
    author: 'Patrick Rothfuss',
    genre: 'Fantasia',
    cover: require('@/assets/images/adaptive-icon.png'),
    status: 'reading',
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    genre: 'Ficção Científica',
    cover: require('@/assets/images/adaptive-icon.png'),
    status: 'completed',
  },
  {
    id: 3,
    title: 'O Senhor dos Anéis',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasia',
    cover: require('@/assets/images/adaptive-icon.png'),
    status: 'to-read',
  },
];

type BookStatus = 'all' | 'reading' | 'completed' | 'to-read';

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = ['all', ...new Set(mockBooks.map(book => book.genre))];

  const filteredBooks = mockBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'to-read':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar livros..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipSelected]}
          onPress={() => setSelectedStatus('all')}>
          <ThemedText style={selectedStatus === 'all' && styles.filterChipTextSelected}>
            Todos
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'reading' && styles.filterChipSelected]}
          onPress={() => setSelectedStatus('reading')}>
          <ThemedText style={selectedStatus === 'reading' && styles.filterChipTextSelected}>
            Lendo
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'completed' && styles.filterChipSelected]}
          onPress={() => setSelectedStatus('completed')}>
          <ThemedText style={selectedStatus === 'completed' && styles.filterChipTextSelected}>
            Concluídos
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'to-read' && styles.filterChipSelected]}
          onPress={() => setSelectedStatus('to-read')}>
          <ThemedText style={selectedStatus === 'to-read' && styles.filterChipTextSelected}>
            Para Ler
          </ThemedText>
        </TouchableOpacity>
      </ScrollView> */}

      {/* Genre Filters */}
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {genres.map(genre => (
          <TouchableOpacity
            key={genre}
            style={[styles.filterChip, selectedGenre === genre && styles.filterChipSelected]}
            onPress={() => setSelectedGenre(genre)}>
            <ThemedText style={selectedGenre === genre && styles.filterChipTextSelected}>
              {genre === 'all' ? 'Todos' : genre}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      {/* Books Grid */}
      <ScrollView style={styles.booksContainer}>
        <View style={styles.booksGrid}>
          {filteredBooks.map(book => (
            <TouchableOpacity key={book.id} style={styles.bookCard}>
              <Image source={book.cover} style={styles.bookCover} />
              <View style={styles.bookInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={2}>
                  {book.title}
                </ThemedText>
                <ThemedText style={styles.authorText} numberOfLines={1}>
                  {book.author}
                </ThemedText>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(book.status) }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
  },
  filterChipTextSelected: {
    color: 'white',
  },
  booksContainer: {
    flex: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookCover: {
    width: '100%',
    height: 200,
  },
  bookInfo: {
    padding: 8,
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
}); 
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getLibraryBooks, removeBookFromLibrary, updateBookStatus } from '@/services/db';
import { Book } from '@/services/googleBooks';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type BookStatusFilter = 'all' | 'reading' | 'completed' | 'to-read';

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookStatusFilter>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibraryBooks();
  }, []);

  const loadLibraryBooks = () => {
    setLoading(true);
    getLibraryBooks((error, books) => {
      if (error) {
        Alert.alert('Erro', 'Falha ao carregar livros da biblioteca.');
        console.error('Error loading library books:', error);
      } else if (books) {
        setBooks(books);
      }
      setLoading(false);
    });
  };

  // Get unique genres from books
  const genres = ['all', ...new Set(books.map(book => book.categories?.[0]).filter((genre): genre is string => Boolean(genre)))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.authors?.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    const matchesGenre = selectedGenre === 'all' || book.categories?.[0] === selectedGenre;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const getStatusColor = (status: Book['status']) => {
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

  const handleStatusChange = (bookId: string, newStatus: 'reading' | 'completed' | 'to-read') => {
    updateBookStatus(bookId, newStatus, (error) => {
      if (error) {
        Alert.alert('Erro', 'Falha ao atualizar status do livro.');
        console.error('Error updating book status:', error);
      } else {
        loadLibraryBooks();
      }
    });
  };

  const handleRemoveBook = (bookId: string) => {
    Alert.alert(
      'Remover Livro',
      'Tem certeza que deseja remover este livro da biblioteca?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeBookFromLibrary(bookId, (error) => {
              if (error) {
                Alert.alert('Erro', 'Falha ao remover livro da biblioteca.');
                console.error('Error removing book:', error);
              } else {
                loadLibraryBooks();
              }
            });
          }
        }
      ]
    );
  };

  const openBook = async (book: Book) => {
    setCurrentBook(book);
    setIsReaderOpen(true);
    
    if (book.status === 'to-read') {
      handleStatusChange(book.id, 'reading');
    }
  };

  const closeReader = () => {
    setIsReaderOpen(false);
    setCurrentBook(null);
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar livros..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'reading', 'completed', 'to-read'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, selectedStatus === status && styles.selectedFilter]}
              onPress={() => setSelectedStatus(status)}
            >
              <ThemedText style={[styles.filterText, selectedStatus === status && styles.selectedFilterText]}>
                {status === 'all' ? 'Todos' :
                 status === 'reading' ? 'Lendo' :
                 status === 'completed' ? 'Concluídos' : 'Para Ler'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Genre Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[styles.filterButton, selectedGenre === genre && styles.selectedFilter]}
              onPress={() => setSelectedGenre(genre)}
            >
              <ThemedText style={[styles.filterText, selectedGenre === genre && styles.selectedFilterText]}>
                {genre === 'all' ? 'Todos os Gêneros' : genre}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Books Grid */}
      <ScrollView style={styles.booksContainer}>
        <View style={styles.booksGrid}>
          {filteredBooks.map(book => (
            <TouchableOpacity 
              key={book.id} 
              style={styles.bookCard}
              onPress={() => openBook(book)}
            >
              {book.thumbnail ? (
                <Image
                  source={{ uri: book.thumbnail }}
                  style={styles.bookCover}
                  contentFit="cover"
                />
              ) : (
                <ThemedView style={styles.bookCoverPlaceholder}>
                  <FontAwesome name="book" size={24} color="#808080" />
                </ThemedView>
              )}
              <View style={styles.bookInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={2}>
                  {book.title}
                </ThemedText>
                <ThemedText style={styles.authorText} numberOfLines={1}>
                  {book.authors?.join(', ')}
                </ThemedText>
                <View style={styles.statusRow}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(book.status) }]} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveBook(book.id)}
                  >
                    <FontAwesome name="trash" size={14} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Reader Modal */}
      <Modal
        visible={isReaderOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeReader}
      >
        <View style={styles.readerContainer}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={closeReader} style={styles.closeButton}>
              <FontAwesome name="arrow-left" size={24} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.bookTitleContainer}>
              <ThemedText style={styles.readerTitle} numberOfLines={1}>
                {currentBook?.title}
              </ThemedText>
              <ThemedText style={styles.readerAuthor} numberOfLines={1}>
                {currentBook?.authors?.join(', ')}
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <FontAwesome name="ellipsis-v" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.readerContent}>
            {currentBook?.description ? (
              <ScrollView style={styles.descriptionContainer}>
                <ThemedText style={styles.descriptionText}>
                  {currentBook.description}
                </ThemedText>
              </ScrollView>
            ) : (
              <View style={styles.noContentContainer}>
                <ThemedText style={styles.noContentText}>
                  Nenhum conteúdo disponível para este livro.
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterText: {
    color: '#fff',
  },
  booksContainer: {
    flex: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  bookCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  bookCover: {
    width: '100%',
    height: 200,
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    padding: 10,
  },
  authorText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  removeButton: {
    padding: 4,
  },
  readerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  bookTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  readerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  readerAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  readerContent: {
    flex: 1,
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noContentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
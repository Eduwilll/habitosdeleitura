import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getLibraryBooks, removeBookFromLibrary, updateBookStatus } from '@/services/db';
import { Book } from '@/services/googleBooks';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Linking, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type BookStatusFilter = 'all' | 'reading' | 'completed' | 'to-read';

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookStatusFilter>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loadLibraryBooks = useCallback(() => {
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
  }, []);

  // Load books when screen mounts
  useEffect(() => {
    loadLibraryBooks();
  }, [loadLibraryBooks]);

  // Refresh books when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLibraryBooks();
    }, [loadLibraryBooks])
  );

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
    // Update local state immediately for faster UI response
    setCurrentBook(prev => prev ? { ...prev, status: newStatus } : null);
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId ? { ...book, status: newStatus } : book
      )
    );

    // Update database in the background
    updateBookStatus(bookId, newStatus, (error) => {
      if (error) {
        Alert.alert('Erro', 'Falha ao atualizar status do livro.');
        console.error('Error updating book status:', error);
        // Revert changes if update fails
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
                closeReader();
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
    //Quando acionado o livro é atribuido para 'reading'
    // if (book.status === 'to-read') {
    //   handleStatusChange(book.id, 'reading');
    // }
  };

  const closeReader = () => {
    setIsReaderOpen(false);
    setCurrentBook(null);
    // Refresh library list when closing the modal
    loadLibraryBooks();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openInGooglePlayBooks = useCallback(() => {
    if (currentBook?.id) {
      const url = `https://play.google.com/store/books/details?id=${currentBook.id}`;
      Linking.openURL(url).catch((err) => {
        Alert.alert('Erro', 'Não foi possível abrir o Google Play Livros.');
        console.error('Error opening Google Play Books:', err);
      });
    }
  }, [currentBook]);

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
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                <FontAwesome name="ellipsis-v" size={20} color="#007AFF" />
              </TouchableOpacity>
              {isMenuOpen && (
                <View style={styles.menuOptions}>
                  <TouchableOpacity 
                    style={styles.menuOption}
                    onPress={() => {
                      openInGooglePlayBooks();
                      setIsMenuOpen(false);
                    }}
                  >
                    <FontAwesome name="book" size={16} color="#007AFF" style={styles.menuIcon} />
                    <ThemedText style={styles.menuText}>
                      Ler no Google Play Livros
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.menuOption}
                    onPress={() => {
                      if (currentBook) {
                        handleRemoveBook(currentBook.id);
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    <FontAwesome name="trash" size={16} color="#FF3B30" style={styles.menuIcon} />
                    <ThemedText style={[styles.menuText, styles.deleteText]}>
                      Remover da Biblioteca
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <ScrollView style={styles.readerContent}>
            {/* Book Cover */}
            <View style={styles.readerCoverContainer}>
              {currentBook?.thumbnail ? (
                <Image
                  source={{ uri: currentBook.thumbnail }}
                  style={styles.readerCover}
                  contentFit="cover"
                />
              ) : (
                <ThemedView style={styles.readerCoverPlaceholder}>
                  <FontAwesome name="book" size={48} color="#808080" />
                </ThemedView>
              )}
            </View>

            {/* Status Buttons */}
            <View style={styles.statusButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  currentBook?.status === 'to-read' && styles.statusButtonActive,
                  { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }
                ]}
                onPress={() => currentBook && handleStatusChange(currentBook.id, 'to-read')}
              >
                <FontAwesome 
                  name="bookmark" 
                  size={16} 
                  color={currentBook?.status === 'to-read' ? '#fff' : '#FF9500'} 
                />
                <ThemedText style={[
                  styles.statusButtonText,
                  currentBook?.status === 'to-read' && styles.statusButtonTextActive
                ]}>
                  Para Ler
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  currentBook?.status === 'reading' && styles.statusButtonActive,
                ]}
                onPress={() => currentBook && handleStatusChange(currentBook.id, 'reading')}
              >
                <FontAwesome 
                  name="book" 
                  size={16} 
                  color={currentBook?.status === 'reading' ? '#fff' : '#007AFF'} 
                />
                <ThemedText style={[
                  styles.statusButtonText,
                  currentBook?.status === 'reading' && styles.statusButtonTextActive
                ]}>
                  Lendo
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  currentBook?.status === 'completed' && styles.statusButtonActive,
                  { borderTopRightRadius: 8, borderBottomRightRadius: 8 }
                ]}
                onPress={() => currentBook && handleStatusChange(currentBook.id, 'completed')}
              >
                <FontAwesome 
                  name="check" 
                  size={16} 
                  color={currentBook?.status === 'completed' ? '#fff' : '#34C759'} 
                />
                <ThemedText style={[
                  styles.statusButtonText,
                  currentBook?.status === 'completed' && styles.statusButtonTextActive
                ]}>
                  Concluído
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Book Description */}
            {currentBook?.description ? (
              <View style={styles.descriptionContainer}>
                <ThemedText style={styles.descriptionText}>
                  {currentBook.description}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.noContentContainer}>
                <ThemedText style={styles.noContentText}>
                  Nenhum conteúdo disponível para este livro.
                </ThemedText>
              </View>
            )}
          </ScrollView>
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
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
  },
  menuOptions: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minWidth: 200,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
  },
  deleteText: {
    color: '#FF3B30',
  },
  readerContent: {
    flex: 1,
  },
  readerCoverContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  readerCover: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  readerCoverPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
  statusButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
});
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useDebounce } from '../../hooks/useDebounce';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Book, searchBooks } from '@/services/googleBooks';

// Predefined genres for initial loading
const GENRES = [
  'Ficção',
  'Ficção Científica',
  'Fantasia',
  'Mistério',
  'Romance',
  'Biografia',
  'História',
  'Ciência',
  'Tecnologia',
  'Filosofia'
];

// Initial books for each genre
const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'O Grande Gatsby',
    authors: ['F. Scott Fitzgerald'],
    description: 'Uma história sobre o fabulosamente rico Jay Gatsby e seu amor pela bela Daisy Buchanan.',
    thumbnail: 'https://books.google.com/books/content?id=1yx1tgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    publishedDate: '1925-04-10',
    pageCount: 180,
    categories: ['Ficção', 'Clássico'],
    averageRating: 4.2
  },
  {
    id: '2',
    title: '1984',
    authors: ['George Orwell'],
    description: 'Um romance distópico de ficção científica e um conto de advertência.',
    thumbnail: 'https://books.google.com/books/content?id=1yx1tgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    publishedDate: '1949-06-08',
    pageCount: 328,
    categories: ['Ficção Científica', 'Distopia'],
    averageRating: 4.5
  },
  // Add more initial books here
];

// Memoized Book Item Component
const BookItem = memo(({ item, onPress }: { item: Book; onPress: (book: Book) => void }) => (
  <TouchableOpacity 
    style={styles.bookCard}
    onPress={() => onPress(item)}
  >
    {item.thumbnail ? (
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.bookCover}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    ) : (
      <ThemedView style={styles.bookCoverPlaceholder}>
        <FontAwesome name="book" size={24} color="#808080" />
      </ThemedView>
    )}
    <View style={styles.bookInfo}>
      <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.bookTitle}>
        {item.title}
        </ThemedText>
      {item.authors && (
        <ThemedText style={styles.authorText} numberOfLines={1}>
          {item.authors.join(', ')}
        </ThemedText>
      )}
      {item.categories && item.categories.length > 0 && (
        <ThemedText style={styles.categoryText} numberOfLines={1}>
          {item.categories[0]}
        </ThemedText>
      )}
    </View>
  </TouchableOpacity>
));

// Memoized Genre Button Component
const GenreButton = memo(({ 
  genre, 
  isSelected, 
  onPress 
}: { 
  genre: string; 
  isSelected: boolean; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.genreButton, isSelected && styles.selectedGenre]}
    onPress={onPress}
  >
    <ThemedText style={[styles.genreText, isSelected && styles.selectedGenreText]}>
      {genre}
        </ThemedText>
  </TouchableOpacity>
));

export default function TabTwoScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const debouncedSearch = useDebounce(async (query: string) => {
    if (!query.trim()) {
      setBooks(INITIAL_BOOKS);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchBooks(query, 1, 'pt-BR');
      setBooks(results.items);
      setHasMore(results.items.length === 20);
    } catch (err) {
      setError('Falha ao buscar livros. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 500);

  const loadMoreBooks = async () => {
    if (loading || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const results = await searchBooks(
        searchQuery || selectedGenre,
        nextPage,
        'pt-BR'
      );
      
      if (results.items.length > 0) {
        // Filter out duplicate books by ID
        const newBooks = results.items.filter(
          newBook => !books.some(existingBook => existingBook.id === newBook.id)
        );
        
        setBooks(prevBooks => [...prevBooks, ...newBooks]);
        setCurrentPage(nextPage);
        setHasMore(results.items.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more books:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    setCurrentPage(1);
    setHasMore(true);

    if (genre === 'all') {
      setBooks(INITIAL_BOOKS);
      return;
    }

    try {
      setLoading(true);
      const results = await searchBooks(genre, 1, 'pt-BR');
      setBooks(results.items);
      setHasMore(results.items.length === 20);
    } catch (err) {
      setError('Falha ao carregar livros do gênero. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book-details',
      params: { book: JSON.stringify(book) }
    });
  };

  const renderHeader = useCallback(() => (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Books</ThemedText>
      </ThemedView>
      <ThemedView style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por livros..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#8E8E93"
        />
      </ThemedView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genresContainer}
        contentContainerStyle={styles.genresContent}
      >
        <GenreButton
          genre="All"
          isSelected={selectedGenre === 'all'}
          onPress={() => handleGenreSelect('all')}
        />
        {GENRES.map((genre) => (
          <GenreButton
            key={genre}
            genre={genre}
            isSelected={selectedGenre === genre}
            onPress={() => handleGenreSelect(genre)}
          />
        ))}
      </ScrollView>
    </ThemedView>
  ), [searchQuery, selectedGenre, handleSearch, handleGenreSelect]);

  const renderBookItem = useCallback(({ item }: { item: Book }) => (
    <BookItem item={item} onPress={handleBookPress} />
  ), [handleBookPress]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
      </ThemedView>
    );
  }, [loading]);

  const keyExtractor = useCallback((item: Book) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        numColumns={2}
        columnWrapperStyle={styles.bookRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        extraData={[loading, isLoadingMore]}
      />
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
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
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
  genresContainer: {
    marginBottom: 16,
  },
  genresContent: {
    paddingRight: 16,
  },
  genreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedGenre: {
    backgroundColor: '#007AFF',
  },
  genreText: {
    fontSize: 14,
    color: '#666',
  },
  selectedGenreText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  bookRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookCard: {
    width: CARD_WIDTH,
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
  bookTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

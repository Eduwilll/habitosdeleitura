import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { strings } from '@/constants/strings';
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

// Popular and bestselling books queries
const POPULAR_QUERIES = [
  'subject:mais-vendidos-brasil',
  'subject:best-seller-brasil',
  'subject:literatura-brasileira',
  'subject:romance-brasileiro',
  'subject:contos-brasileiros',
  'subject:poesia-brasileira',
  'subject:história-do-brasil',
  'subject:biografia-brasileira',
  'subject:ficção-brasileira',
  'subject:crônicas-brasileiras'
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

const SearchBar = memo(({ 
  onSearch 
}: { 
  onSearch: (text: string) => void;
}) => {
  const [inputText, setInputText] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Only search if text is at least 3 characters or empty
    if (text.length >= 3 || text.length === 0) {
      searchTimeout.current = setTimeout(() => {
        onSearch(text);
      }, 300);
    }
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setInputText('');
    onSearch('');
    // Focus the input after clearing
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [onSearch]);

  const handleSubmit = useCallback(() => {
    if (inputText.length > 0) {
      onSearch(inputText);
    }
  }, [inputText, onSearch]);

  return (
    <ThemedView style={styles.searchBarContainer}>
      <ThemedView style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={strings.library.searchPlaceholder}
          value={inputText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmit}
          placeholderTextColor="#8E8E93"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          selectTextOnFocus={true}
          keyboardType="default"
        />
        {inputText.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClear}
          >
            <FontAwesome name="times-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </ThemedView>
      {inputText.length > 0 && inputText.length < 3 && (
        <ThemedText style={styles.searchHint}>
          {strings.common.search}
        </ThemedText>
      )}
    </ThemedView>
  );
});

export default function TabTwoScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPopularBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch books for each popular query with sorting
      const popularBooksPromises = POPULAR_QUERIES.map(query => 
        searchBooks(query, 1, 'pt-BR', 'relevance') // Use relevance for Brazilian market
      );
      
      const results = await Promise.all(popularBooksPromises);
      
      // Combine and deduplicate books
      const allBooks = results.flatMap(result => result.items);
      
      // Sort books by availability in Brazil, rating, and then by publishedDate
      const sortedBooks = allBooks
        .filter((book, index, self) =>
          index === self.findIndex(b => b.id === book.id)
        )
        .sort((a, b) => {
          // First sort by availability in Brazil (has saleInfo)
          if (a.saleInfo && !b.saleInfo) return -1;
          if (!a.saleInfo && b.saleInfo) return 1;
          
          // Then sort by rating
          if (a.averageRating && b.averageRating) {
            return b.averageRating - a.averageRating;
          }
          if (a.averageRating) return -1;
          if (b.averageRating) return 1;
          
          // Finally sort by publication date (newest first)
          if (a.publishedDate && b.publishedDate) {
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
          }
          if (a.publishedDate) return -1;
          if (b.publishedDate) return 1;
          
          return 0;
        });
      
      setBooks(sortedBooks);
      setHasMore(true);
      setCurrentPage(1);
    } catch (err) {
      setError(strings.common.error);
      console.error('Error fetching popular books:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load popular books on initial mount
  useEffect(() => {
    fetchPopularBooks();
  }, [fetchPopularBooks]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchPopularBooks();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchBooks(query, 1, 'pt-BR');
      setBooks(results.items);
      setHasMore(results.items.length === 20);
      setCurrentPage(1);
    } catch (err) {
      setError(strings.common.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchPopularBooks]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    performSearch(text);
  }, [performSearch]);

  const loadMoreBooks = async () => {
    if (loading || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const query = searchQuery || selectedGenre;
      
      if (!query) {
        // Load more popular books
        const results = await Promise.all(
          POPULAR_QUERIES.map(q => searchBooks(q, nextPage, 'pt-BR', 'relevance'))
        );
        
        const newBooks = results.flatMap(result => result.items);
        const uniqueNewBooks = newBooks.filter(
          newBook => !books.some(existingBook => existingBook.id === newBook.id)
        );
        
        // Sort new books using the same criteria
        const sortedNewBooks = uniqueNewBooks.sort((a, b) => {
          if (a.saleInfo && !b.saleInfo) return -1;
          if (!a.saleInfo && b.saleInfo) return 1;
          
          if (a.averageRating && b.averageRating) {
            return b.averageRating - a.averageRating;
          }
          if (a.averageRating) return -1;
          if (b.averageRating) return 1;
          
          if (a.publishedDate && b.publishedDate) {
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
          }
          if (a.publishedDate) return -1;
          if (b.publishedDate) return 1;
          
          return 0;
        });
        
        setBooks(prevBooks => [...prevBooks, ...sortedNewBooks]);
        setCurrentPage(nextPage);
        setHasMore(uniqueNewBooks.length > 0);
      } else {
        // Load more search results
        const results = await searchBooks(query, nextPage, 'pt-BR', 'relevance');
        const newBooks = results.items.filter(
          newBook => !books.some(existingBook => existingBook.id === newBook.id)
        );
        
        setBooks(prevBooks => [...prevBooks, ...newBooks]);
        setCurrentPage(nextPage);
        setHasMore(results.items.length === 20);
      }
    } catch (err) {
      console.error('Error loading more books:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    setCurrentPage(1);
    setHasMore(true);

    if (genre === 'all') {
      fetchPopularBooks();
      return;
    }

    try {
      setLoading(true);
      const results = await searchBooks(genre, 1, 'pt-BR');
      setBooks(results.items);
      setHasMore(results.items.length === 20);
    } catch (err) {
      setError(strings.common.error);
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
        <ThemedText type="title">Explore</ThemedText>
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
  ), [selectedGenre, handleGenreSelect]);

  const renderBookItem = useCallback(({ item }: { item: Book }) => (
    <BookItem item={item} onPress={handleBookPress} />
  ), [handleBookPress]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
        <ThemedText style={styles.loadingText}>{strings.common.loading}</ThemedText>
      </ThemedView>
    );
  }, [loading]);

  const keyExtractor = useCallback((item: Book) => item.id, []);

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
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
        keyboardShouldPersistTaps="handled"
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
  searchBarContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#fff',
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
  clearButton: {
    padding: 4,
    marginLeft: 8,
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
  searchHint: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 12,
  },
  loadingText: {
    marginTop: 8,
  },
});

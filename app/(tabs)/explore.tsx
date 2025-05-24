import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useDebounce } from '../../hooks/useDebounce';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Book, searchBooks } from '@/services/googleBooks';

export default function TabTwoScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(async (query: string) => {
    if (!query.trim()) {
      setBooks([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchBooks(query);
      setBooks(results.items);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 500);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book-details',
      params: { book: JSON.stringify(book) }
    });
  };

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Books</ThemedText>
      </ThemedView>
      <ThemedView style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for books..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#8E8E93"
        />
      </ThemedView>
    </ThemedView>
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={styles.bookItem}
      onPress={() => handleBookPress(item)}
    >
      {item.thumbnail ? (
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.bookThumbnail}
          contentFit="cover"
        />
      ) : (
        <ThemedView style={styles.bookThumbnailPlaceholder}>
          <IconSymbol name="book" size={24} color="#808080" />
        </ThemedView>
      )}
      <ThemedView style={styles.bookInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.bookTitle}>
          {item.title}
        </ThemedText>
        {item.authors && (
          <ThemedText numberOfLines={1} style={styles.authorText}>
            {item.authors.join(', ')}
          </ThemedText>
        )}
        {item.categories && item.categories.length > 0 && (
          <ThemedText numberOfLines={1} style={styles.genreText}>
            {item.categories[0]}
          </ThemedText>
        )}
        {item.publishedDate && (
          <ThemedText style={styles.publishedDate}>
            {new Date(item.publishedDate).getFullYear()}
          </ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </ThemedView>
      );
    }

    if (error) {
      return (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      );
    }

    if (searchQuery && books.length === 0) {
      return (
        <ThemedView style={styles.noResultsContainer}>
          <ThemedText>No books found. Try a different search term.</ThemedText>
        </ThemedView>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

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
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookThumbnail: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  bookThumbnailPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  genreText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  publishedDate: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

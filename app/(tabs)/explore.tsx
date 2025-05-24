import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useDebounce } from '../../hooks/useDebounce';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Book, searchBooks } from '@/services/googleBooks';

export default function TabTwoScreen() {
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

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <IconSymbol
        size={100}
        color="#808080"
        name="book"
        style={styles.headerIcon}
      />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Books</ThemedText>
      </ThemedView>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for books..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#808080"
        />
      </ThemedView>
    </ThemedView>
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <ThemedView style={styles.bookItem}>
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
        <ThemedText type="defaultSemiBold" numberOfLines={2}>
          {item.title}
        </ThemedText>
        {item.authors && (
          <ThemedText numberOfLines={1} style={styles.authorText}>
            {item.authors.join(', ')}
          </ThemedText>
        )}
        {item.publishedDate && (
          <ThemedText style={styles.publishedDate}>
            Published: {item.publishedDate}
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#D0D0D0',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    flexGrow: 1,
  },
  bookItem: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  bookThumbnail: {
    width: 80,
    height: 120,
    borderRadius: 4,
  },
  bookThumbnailPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  authorText: {
    fontSize: 14,
    opacity: 0.8,
  },
  publishedDate: {
    fontSize: 12,
    opacity: 0.6,
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

import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addBookToLibrary } from '@/services/db';
import { Book } from '@/services/googleBooks';

export default function BookDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const book: Book = JSON.parse(params.book as string);
  const [isInLibrary, setIsInLibrary] = useState(false);

  const handleAddToLibrary = () => {
    addBookToLibrary(book, (error) => {
      if (error) {
        Alert.alert('Erro', 'Falha ao adicionar livro à biblioteca.');
        console.error('Error adding book to library:', error);
      } else {
        setIsInLibrary(true);
        Alert.alert('Sucesso', 'Livro adicionado à sua biblioteca!');
      }
    });
  };

  const handleReadBook = () => {
    const url = `https://play.google.com/store/books/details?id=${book.id}`;
    Linking.openURL(url).catch((err) => {
      Alert.alert('Erro', 'Não foi possível abrir o Google Play Livros.');
      console.error('Error opening Google Play Books:', err);
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Book Cover and Basic Info */}
        <View style={styles.coverSection}>
          {book.thumbnail ? (
            <Image
              source={{ uri: book.thumbnail }}
              style={styles.coverImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <FontAwesome name="book" size={50} color="#808080" />
            </View>
          )}
          <View style={styles.basicInfo}>
            <ThemedText type="title" style={styles.title}>
              {book.title}
            </ThemedText>
            {book.authors && (
              <ThemedText style={styles.authors}>
                Por {book.authors.join(', ')}
              </ThemedText>
            )}
            {book.publishedDate && (
              <ThemedText style={styles.publishedDate}>
                Publicado em: {new Date(book.publishedDate).getFullYear()}
              </ThemedText>
            )}
            {book.pageCount && (
              <ThemedText style={styles.pageCount}>
                {book.pageCount} páginas
              </ThemedText>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.readButton]}
            onPress={handleReadBook}
          >
            <FontAwesome name="book" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>Ler</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isInLibrary ? styles.addedButton : styles.addButton]}
            onPress={handleAddToLibrary}
            disabled={isInLibrary}
          >
            <FontAwesome
              name={isInLibrary ? 'check' : 'plus'}
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <ThemedText style={styles.buttonText}>
              {isInLibrary ? 'Adicionado à Biblioteca' : 'Adicionar à Biblioteca'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {book.description && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Description
            </ThemedText>
            <ThemedText style={styles.description}>{book.description}</ThemedText>
          </View>
        )}

        {/* Categories */}
        {book.categories && book.categories.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Categories
            </ThemedText>
            <View style={styles.categoriesContainer}>
              {book.categories.map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <ThemedText style={styles.categoryText}>{category}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Additional Information
          </ThemedText>
          <View style={styles.infoGrid}>
            {book.averageRating && (
              <View style={styles.infoItem}>
                <FontAwesome name="star" size={20} color="#FFD700" />
                <ThemedText style={styles.infoText}>
                  {book.averageRating.toFixed(1)} / 5
                </ThemedText>
              </View>
            )}
            {book.pageCount && (
              <View style={styles.infoItem}>
                <FontAwesome name="file-text-o" size={20} color="#007AFF" />
                <ThemedText style={styles.infoText}>{book.pageCount} pages</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  coverSection: {
    padding: 16,
    alignItems: 'center',
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  coverPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  basicInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  authors: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  publishedDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  pageCount: {
    fontSize: 14,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  readButton: {
    backgroundColor: '#007AFF',
  },
  addButton: {
    backgroundColor: '#34C759',
  },
  addedButton: {
    backgroundColor: '#8E8E93',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
}); 
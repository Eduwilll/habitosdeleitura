import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addBookToLibrary } from '@/services/db';
import { Book } from '@/services/googleBooks';
import { colors, globalStyles, spacing, typography } from '@/styles/global';

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
    <ThemedView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={globalStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color={colors.primary} />
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
              <FontAwesome name="book" size={50} color={colors.gray.medium} />
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
            style={[globalStyles.button, styles.readButton]}
            onPress={handleReadBook}
          >
            <FontAwesome name="book" size={20} color="white" style={globalStyles.buttonIcon} />
            <ThemedText style={globalStyles.buttonText}>Ler</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.button,
              isInLibrary ? styles.addedButton : styles.addButton
            ]}
            onPress={handleAddToLibrary}
            disabled={isInLibrary}
          >
            <FontAwesome
              name={isInLibrary ? 'check' : 'plus'}
              size={20}
              color="white"
              style={globalStyles.buttonIcon}
            />
            <ThemedText style={globalStyles.buttonText}>
              {isInLibrary ? 'Adicionado à Biblioteca' : 'Adicionar à Biblioteca'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {book.description && (
          <View style={globalStyles.section}>
            <ThemedText type="defaultSemiBold" style={globalStyles.sectionTitle}>
              Description
            </ThemedText>
            <ThemedText style={globalStyles.description}>{book.description}</ThemedText>
          </View>
        )}

        {/* Categories */}
        {book.categories && book.categories.length > 0 && (
          <View style={globalStyles.section}>
            <ThemedText type="defaultSemiBold" style={globalStyles.sectionTitle}>
              Categories
            </ThemedText>
            <View style={globalStyles.categoriesContainer}>
              {book.categories.map((category, index) => (
                <View key={index} style={globalStyles.categoryTag}>
                  <ThemedText style={globalStyles.categoryText}>{category}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Info */}
        <View style={globalStyles.section}>
          <ThemedText type="defaultSemiBold" style={globalStyles.sectionTitle}>
            Additional Information
          </ThemedText>
          <View style={globalStyles.infoGrid}>
            {book.averageRating && (
              <View style={globalStyles.infoItem}>
                <FontAwesome name="star" size={20} color="#FFD700" />
                <ThemedText style={globalStyles.infoText}>
                  {book.averageRating.toFixed(1)} / 5
                </ThemedText>
              </View>
            )}
            {book.pageCount && (
              <View style={globalStyles.infoItem}>
                <FontAwesome name="file-text-o" size={20} color={colors.primary} />
                <ThemedText style={globalStyles.infoText}>{book.pageCount} pages</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: spacing.sm,
  },
  coverSection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  coverPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  basicInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  authors: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  publishedDate: {
    fontSize: typography.caption.fontSize,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  pageCount: {
    fontSize: typography.caption.fontSize,
    color: colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  readButton: {
    backgroundColor: colors.primary,
  },
  addButton: {
    backgroundColor: colors.success,
  },
  addedButton: {
    backgroundColor: colors.gray.medium,
  },
}); 
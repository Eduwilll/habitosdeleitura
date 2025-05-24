import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Image, ImageSource } from 'expo-image';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Define the Book type
interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  cover: ImageSource | number;
  status: 'reading' | 'completed' | 'to-read';
  uri?: string;
  fileType?: 'pdf' | 'epub';
  localUri?: string; // For copied files
}

// Mock data for books
const initialBooks: Book[] = [
  {
    id: '1',
    title: 'O Nome do Vento',
    author: 'Patrick Rothfuss',
    genre: 'Fantasia',
    cover: require('@/assets/images/adaptive-icon.png'),
    status: 'reading',
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Ficção Científica',
    cover: require('@/assets/images/adaptive-icon.png'),
    status: 'completed',
  },
  {
    id: '3',
    title: 'O Senhor dos Anéis',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasia',
    cover: require('@/assets/images/adaptive-icon.png'),
    status: 'to-read',
  },
];

type BookStatusFilter = 'all' | 'reading' | 'completed' | 'to-read';

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookStatusFilter>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  const genres = ['all', ...new Set(books.map(book => book.genre).filter(g => g !== 'Imported')), 'Imported'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
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

  const copyFileToDocuments = async (uri: string, fileName: string): Promise<string> => {
    const documentsDir = FileSystem.documentDirectory;
    const localUri = `${documentsDir}books/${fileName}`;
    
    // Create books directory if it doesn't exist
    const booksDir = `${documentsDir}books/`;
    const dirInfo = await FileSystem.getInfoAsync(booksDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
    }

    // Copy file to local storage
    await FileSystem.copyAsync({
      from: uri,
      to: localUri,
    });

    return localUri;
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip'],
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        const fileName = asset.name || 'Unknown Document';
        const titleWithoutExtension = fileName.includes('.') 
            ? fileName.substring(0, fileName.lastIndexOf('.')) 
            : fileName;

        try {
          // Copy file to app's documents directory for persistent access
          const localUri = await copyFileToDocuments(asset.uri, fileName);

          const newBook: Book = {
            id: Date.now().toString(), // Use timestamp as ID
            title: titleWithoutExtension,
            author: 'Unknown Author',
            genre: 'Imported',
            cover: require('@/assets/images/adaptive-icon.png'),
            status: 'to-read',
            uri: asset.uri,
            localUri: localUri,
            fileType: fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 
                     fileName.toLowerCase().endsWith('.epub') ? 'epub' : undefined,
          };

          if (newBook.fileType) {
            setBooks(prevBooks => [...prevBooks, newBook]);
            Alert.alert("Success", `${newBook.title} was added to your library!`);
          } else {
            Alert.alert("Unsupported File", "The selected file type is not supported.");
          }
        } catch (copyError) {
          console.error('Error copying file:', copyError);
          Alert.alert("Error", "Failed to save the book to your library.");
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert("Error", "An error occurred while picking the document.");
    }
  };

  const renderPDFViewer = (fileUri: string) => {
    // Create a simple HTML viewer that uses the file URI directly
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body { margin: 0; padding: 0; background: #f0f0f0; }
            .pdf-container { 
              width: 100%; 
              height: 100vh; 
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .pdf-viewer {
              width: 100%;
              height: 100%;
              border: none;
            }
            .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            <div class="loading">Loading PDF...</div>
            <object
              class="pdf-viewer"
              data="${fileUri}"
              type="application/pdf"
            >
              <p>Unable to display PDF file. <a href="${fileUri}">Download</a> instead.</p>
            </object>
          </div>
        </body>
      </html>
    `;

    return (
      <View style={styles.pdfContainer}>
        <WebView
          source={{ html: htmlContent }}
          style={styles.pdf}
          onError={(error) => {
            console.error('WebView error:', error);
            Alert.alert("Error", "Failed to load PDF. Please try again.");
          }}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
        />
      </View>
    );
  };

  const renderEPUBViewer = (fileUri: string) => {
    // For EPUB, we'll create a simple HTML viewer
    // In a production app, you'd want to use a proper EPUB library
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6; 
              padding: 20px; 
              background: white;
              color: #333;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .error { color: #ff4444; text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">
              <h2>EPUB Reader</h2>
              <p>EPUB files require a specialized reader. This is a placeholder.</p>
              <p>Consider using a library like react-native-epub-reader for full EPUB support.</p>
              <p>File: ${currentBook?.title}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return (
      <WebView
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
      />
    );
  };

  const openBook = async (book: Book) => {
    if (!book.localUri && !book.uri) {
      Alert.alert("No File", "This book does not have an associated file to open.");
      return;
    }

    setCurrentBook(book);
    setIsReaderOpen(true);
    
    // Update book status to reading if it was to-read
    if (book.status === 'to-read') {
      setBooks(prevBooks => 
        prevBooks.map(b => 
          b.id === book.id ? { ...b, status: 'reading' as const } : b
        )
      );
    }
  };

  const closeReader = () => {
    setIsReaderOpen(false);
    setCurrentBook(null);
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
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Books Grid */}
      <ScrollView style={styles.booksContainer}>
        <View style={styles.booksGrid}>
          {filteredBooks.map(book => (
            <TouchableOpacity 
              key={book.id} 
              style={styles.bookCard}
              onPress={() => openBook(book)}
            >
              <Image source={book.cover} style={styles.bookCover} contentFit="cover" />
              <View style={styles.bookInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={2}>
                  {book.title}
                </ThemedText>
                <ThemedText style={styles.authorText} numberOfLines={1}>
                  {book.author}
                </ThemedText>
                {book.genre !== 'Imported' && (
                    <ThemedText style={styles.genreText} numberOfLines={1}>
                        {book.genre}
                    </ThemedText>
                )}
                <View style={styles.statusRow}>
                  {book.fileType && (
                    <ThemedText style={styles.fileTypeText}>
                      {book.fileType.toUpperCase()}
                    </ThemedText>
                  )}
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(book.status) }]} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add Book Button (FAB) */}
      <TouchableOpacity style={styles.addButton} onPress={pickDocument}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Reader Modal */}
      <Modal
        visible={isReaderOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeReader}
      >
        <View style={styles.readerContainer}>
          {/* Reader Header */}
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={closeReader} style={styles.closeButton}>
              <FontAwesome name="arrow-left" size={24} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.bookTitleContainer}>
              <ThemedText style={styles.readerTitle} numberOfLines={1}>
                {currentBook?.title}
              </ThemedText>
              <ThemedText style={styles.readerAuthor} numberOfLines={1}>
                {currentBook?.author}
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <FontAwesome name="ellipsis-v" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Reader Content */}
          <View style={styles.readerContent}>
            {currentBook?.fileType === 'pdf' && currentBook.localUri && 
              renderPDFViewer(currentBook.localUri)
            }
            {currentBook?.fileType === 'epub' && currentBook.localUri && 
              renderEPUBViewer(currentBook.localUri)
            }
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
  bookInfo: {
    padding: 10,
  },
  authorText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  genreText: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  fileTypeText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: 'bold',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
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
    paddingTop: 50, // Account for status bar
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
  pdfContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    backgroundColor: '#fff',
  },
});
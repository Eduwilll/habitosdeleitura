import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { strings } from '@/constants/strings';
import { addReadingReminder, deleteReminder, getBookReminders, getLibraryBooks, removeBookFromLibrary, updateBookStatus } from '@/services/db';
import { Book } from '@/services/googleBooks';
import { cancelReadingReminder, requestNotificationPermissions, scheduleReadingReminder } from '@/services/notifications';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);

  const loadLibraryBooks = useCallback(() => {
    setLoading(true);
    getLibraryBooks((error, books) => {
      if (error) {
        Alert.alert(strings.common.error, strings.library.errorLoadingBooks);
        console.error('Error loading library books:', error);
      } else if (books) {
        setBooks(books);
      }
      setLoading(false);
    });
  }, []);

  const loadBookReminders = useCallback((bookId: string) => {
    getBookReminders(bookId, (error, reminders) => {
      if (error) {
        console.error('Error loading reminders:', error);
      } else if (reminders) {
        setReminders(reminders);
      }
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
        Alert.alert(strings.common.error, strings.library.errorUpdatingStatus);
        console.error('Error updating book status:', error);
        // Revert changes if update fails
        loadLibraryBooks();
      }
    });
  };

  const handleRemoveBook = (bookId: string) => {
    Alert.alert(
      strings.library.bookDetails.deleteConfirmTitle,
      strings.library.bookDetails.deleteConfirmMessage,
      [
        { text: strings.common.cancel, style: 'cancel' },
        {
          text: strings.common.delete,
          style: 'destructive',
          onPress: () => {
            removeBookFromLibrary(bookId, (error) => {
              if (error) {
                Alert.alert(strings.common.error, strings.library.errorRemovingBook);
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

  const handleAddReminder = async () => {
    if (!currentBook) return;
    
    if (selectedDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana');
      return;
    }

    const timeString = selectedTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    // First, add the reminder to the database
    addReadingReminder(
      currentBook.id,
      currentBook.title,
      timeString,
      selectedDays,
      async (error) => {
        if (error) {
          Alert.alert('Erro', 'Falha ao adicionar lembrete');
          console.error('Error adding reminder:', error);
        } else {
          // Then, schedule the notification
          const success = await scheduleReadingReminder(
            `reminder_${Date.now()}`,
            currentBook.title,
            timeString,
            selectedDays
          );

          if (success) {
            Alert.alert('Sucesso', 'Lembrete adicionado com sucesso');
            loadBookReminders(currentBook.id);
            setIsReminderModalOpen(false);
          } else {
            Alert.alert('Erro', 'Falha ao agendar notificação');
          }
        }
      }
    );
  };

  const handleDeleteReminder = async (reminderId: string) => {
    // First, cancel the notification
    await cancelReadingReminder(reminderId);

    // Then, remove from database
    deleteReminder(reminderId, (error) => {
      if (error) {
        Alert.alert('Erro', 'Falha ao remover lembrete');
        console.error('Error deleting reminder:', error);
      } else {
        loadBookReminders(currentBook!.id);
      }
    });
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const openBook = async (book: Book) => {
    setCurrentBook(book);
    setIsReaderOpen(true);
    loadBookReminders(book.id);
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

  useEffect(() => {
    // Request notification permissions when the app starts
    requestNotificationPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={strings.library.searchPlaceholder}
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
                {status === 'all' ? strings.library.filters.all :
                 status === 'reading' ? strings.library.filters.reading :
                 status === 'completed' ? strings.library.filters.completed : 
                 strings.library.filters.toRead}
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

            {/* Reminders Section */}
            <View style={styles.remindersSection}>
              <View style={styles.remindersHeader}>
                <ThemedText style={styles.remindersTitle}>Lembretes de Leitura</ThemedText>
                <TouchableOpacity
                  style={styles.addReminderButton}
                  onPress={() => setIsReminderModalOpen(true)}
                >
                  <FontAwesome name="plus" size={16} color="#007AFF" />
                  <ThemedText style={styles.addReminderText}>Adicionar Lembrete</ThemedText>
                </TouchableOpacity>
              </View>

              {reminders.map(reminder => (
                <View key={reminder.id} style={styles.reminderItem}>
                  <View style={styles.reminderInfo}>
                    <ThemedText style={styles.reminderTime}>
                      {reminder.time}
                    </ThemedText>
                    <ThemedText style={styles.reminderDays}>
                      {JSON.parse(reminder.daysOfWeek).map((day: number) => {
                        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                        return days[day];
                      }).join(', ')}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteReminder(reminder.id)}
                    style={styles.deleteReminderButton}
                  >
                    <FontAwesome name="trash" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
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

      {/* Reminder Setup Modal */}
      <Modal
        visible={isReminderModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReminderModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{strings.reminders.addReminder}</ThemedText>
              <TouchableOpacity
                onPress={() => setIsReminderModalOpen(false)}
                style={styles.closeModalButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <ThemedText style={styles.timePickerText}>
                {selectedTime.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </ThemedText>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    setSelectedTime(selectedDate);
                  }
                }}
              />
            )}

            <View style={styles.daysContainer}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(index) && styles.selectedDayButton
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <ThemedText
                    style={[
                      styles.dayButtonText,
                      selectedDays.includes(index) && styles.selectedDayButtonText
                    ]}
                  >
                    {day}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveReminderButton}
              onPress={handleAddReminder}
            >
              <ThemedText style={styles.saveReminderText}>{strings.common.save}</ThemedText>
            </TouchableOpacity>
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
  remindersSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addReminderText: {
    color: '#007AFF',
    marginLeft: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderDays: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteReminderButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeModalButton: {
    padding: 8,
  },
  timePickerButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  timePickerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  selectedDayButton: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  saveReminderButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveReminderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
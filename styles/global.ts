import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = (width - 48) / 2;

export const colors = {
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  gray: {
    light: '#f5f5f5',
    medium: '#8E8E93',
    dark: '#666',
  },
  text: {
    primary: '#000',
    secondary: '#666',
    tertiary: '#888',
  },
  background: {
    primary: '#fff',
    secondary: '#f9f9f9',
  },
  border: '#f0f0f0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
  small: {
    fontSize: 12,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBarContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray.light,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text.primary,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  searchHint: {
    color: colors.gray.medium,
    fontSize: 12,
    marginTop: -12,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterContent: {
    paddingRight: spacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray.light,
    marginRight: spacing.sm,
  },
  selectedFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  selectedFilterText: {
    color: colors.background.primary,
  },
  bookCard: {
    width: CARD_WIDTH,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.text.primary,
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
    backgroundColor: colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    padding: spacing.sm,
  },
  bookTitle: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  authorText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  readerContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 50,
  },
  readerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  readerAuthor: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  readerContent: {
    flex: 1,
  },
  readerCoverContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  statusButtonText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusButtonTextActive: {
    color: colors.background.primary,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: spacing.sm,
  },
  menuOptions: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: spacing.sm,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minWidth: 200,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuText: {
    fontSize: 16,
  },
  deleteText: {
    color: colors.danger,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 8,
    flex: 1,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryTag: {
    backgroundColor: colors.gray.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  authContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  authInput: {
    backgroundColor: colors.gray.light,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  authButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  authLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  authLinkText: {
    color: colors.primary,
    fontSize: 16,
  },
}); 
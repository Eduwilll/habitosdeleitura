import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors, globalStyles } from '@/styles/global';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Implement logout logic here
    router.replace('/login');
  };

  return (
    <ThemedView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <ThemedText type="title">Profile</ThemedText>
      </View>

      <View style={styles.profileContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={80} color={colors.primary} />
          </View>
          <ThemedText type="subtitle" style={styles.username}>
            User Name
          </ThemedText>
          <ThemedText style={styles.email}>user@example.com</ThemedText>
        </View>

        <TouchableOpacity style={globalStyles.authButton} onPress={handleLogout}>
          <ThemedText style={globalStyles.authButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center' as const,
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  username: {
    marginBottom: 8,
  },
  email: {
    color: colors.text.secondary,
  },
}); 
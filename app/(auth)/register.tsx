import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput, TouchableOpacity } from 'react-native';
import { createTables, insertUser } from '../../services/db';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { strings } from '@/constants/strings';
import { colors, globalStyles } from '@/styles/global';

const string = strings.auth.register;

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    createTables();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters (including numbers) and 1 uppercase letter
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);

    return hasMinLength && hasUpperCase;
  };

  const validateUsername = (username: string): boolean => {
    // 3-20 characters, letters, numbers, underscores, hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números, underscores e hífens';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'A senha deve ter pelo menos 8 caracteres (letras ou números) e uma letra maiúscula';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleRegister = async () => {
    if (isSubmitting) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      insertUser(formData.username, formData.email, formData.password, (err, result) => {
        if (err) {
          Alert.alert(strings.common.error, string.errorRegistrationFailed);
          console.error('Registration error:', err);
        } else {
          Alert.alert(strings.common.success, 'Usuário registrado com sucesso!');
          router.push('/login');
        }
        setIsSubmitting(false);
      });
    } catch (error) {
      Alert.alert(strings.common.error, string.errorRegistrationFailed);
      console.error('Registration error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={globalStyles.authContainer}>
      <ThemedText style={globalStyles.authTitle}>{string.title}</ThemedText>
      
      <TextInput
        style={[
          globalStyles.authInput,
          errors.username ? { borderColor: colors.danger } : {}
        ]}
        placeholder={string.usernamePlaceholder}
        value={formData.username}
        onChangeText={(value) => handleInputChange('username', value)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.username && (
        <ThemedText style={{ color: colors.danger, marginBottom: 10, fontSize: 12 }}>
          {errors.username}
        </ThemedText>
      )}
      
      <TextInput
        style={[
          globalStyles.authInput,
          errors.email ? { borderColor: colors.danger } : {}
        ]}
        placeholder={string.emailPlaceholder}
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.email && (
        <ThemedText style={{ color: colors.danger, marginBottom: 10, fontSize: 12 }}>
          {errors.email}
        </ThemedText>
      )}
      
      <TextInput
        style={[
          globalStyles.authInput,
          errors.password ? { borderColor: colors.danger } : {}
        ]}
        placeholder={string.passwordPlaceholder}
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry
      />
      {errors.password && (
        <ThemedText style={{ color: colors.danger, marginBottom: 10, fontSize: 12 }}>
          {errors.password}
        </ThemedText>
      )}

      <TextInput
        style={[
          globalStyles.authInput,
          errors.confirmPassword ? { borderColor: colors.danger } : {}
        ]}
        placeholder={string.confirmPasswordPlaceholder}
        value={formData.confirmPassword}
        onChangeText={(value) => handleInputChange('confirmPassword', value)}
        secureTextEntry
      />
      {errors.confirmPassword && (
        <ThemedText style={{ color: colors.danger, marginBottom: 10, fontSize: 12 }}>
          {errors.confirmPassword}
        </ThemedText>
      )}
      
      <TouchableOpacity 
        style={[
          globalStyles.authButton,
          isSubmitting && { opacity: 0.7 }
        ]} 
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        <ThemedText style={globalStyles.authButtonText}>
          {isSubmitting ? 'Registrando...' : string.registerButton}
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={globalStyles.authLink}
        onPress={() => router.push('/login')}
      >
        <ThemedText style={globalStyles.authLinkText}>
          {string.loginLink}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
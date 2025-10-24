/**
 * Update Password Screen
 * Allows users to set a new password after requesting a reset
 */

import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { validatePassword, checkPasswordRequirements } from '../lib/passwordValidator';

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const passwordStrength = validatePassword(password);
  const requirements = checkPasswordRequirements(password);

  const handleUpdatePassword = async () => {
    // Validate password
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!passwordStrength.isValid) {
      Alert.alert('Weak Password', 'Please choose a stronger password that meets all requirements');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your password has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔑</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            Choose a strong password that you haven't used before.
          </Text>

          {/* New Password Input */}
          <TextInput
            style={styles.input}
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onFocus={() => setShowRequirements(true)}
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          )}

          {/* Password Requirements */}
          {showRequirements && password.length > 0 && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must have:</Text>
              <RequirementItem met={requirements.minLength} text="At least 8 characters" />
              <RequirementItem met={requirements.hasUppercase} text="Uppercase letter (A-Z)" />
              <RequirementItem met={requirements.hasLowercase} text="Lowercase letter (a-z)" />
              <RequirementItem met={requirements.hasNumber} text="Number (0-9)" />
              <RequirementItem met={requirements.hasSpecialChar} text="Special character (!@#$...)" />
              <RequirementItem met={requirements.notCommon} text="Not a common password" />
            </View>
          )}

          {/* Confirm Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <Text style={[
              styles.matchText,
              { color: password === confirmPassword ? '#34C759' : '#FF3B30' }
            ]}>
              {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </Text>
          )}

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.button, (!passwordStrength.isValid || loading) && styles.buttonDisabled]}
            onPress={handleUpdatePassword}
            disabled={!passwordStrength.isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirementItem}>
      <Text style={[styles.requirementIcon, { color: met ? '#34C759' : '#999' }]}>
        {met ? '✓' : '○'}
      </Text>
      <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  strengthContainer: {
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  requirementsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
  },
  requirementTextMet: {
    color: '#34C759',
  },
  matchText: {
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

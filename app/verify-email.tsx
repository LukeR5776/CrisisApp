/**
 * Email Verification Pending Screen
 * Shown to users who have signed up but haven't verified their email yet
 */

import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, signOut, resendVerificationEmail } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      await resendVerificationEmail(user.email);
      Alert.alert(
        'Email Sent',
        'We\'ve sent another verification email. Please check your inbox and spam folder.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Check your email</Text>

        {/* Message */}
        <Text style={styles.message}>
          We've sent a verification link to:
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Text style={styles.instructions}>
          Click the link in the email to verify your account and access the app.
        </Text>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Didn't receive the email?</Text>
          <Text style={styles.tipText}>• Check your spam or junk folder</Text>
          <Text style={styles.tipText}>• Make sure the email address is correct</Text>
          <Text style={styles.tipText}>• Wait a few minutes and check again</Text>
        </View>

        {/* Resend Button */}
        <TouchableOpacity
          style={[styles.resendButton, loading && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0066FF" />
          ) : (
            <Text style={styles.resendButtonText}>Resend Verification Email</Text>
          )}
        </TouchableOpacity>

        {/* Sign Out Link */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066FF',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  resendButton: {
    width: '100%',
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#0066FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#0066FF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signOutButton: {
    padding: 12,
  },
  signOutText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

/**
 * Sign In Screen
 * Initial landing page with email/password and OAuth options
 */

import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  // Handle sign in - currently just navigates to main app
  // TODO: Implement actual authentication with Supabase
  const handleSignIn = () => {
    if (email.trim()) {
      router.replace('/(tabs)/home');
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    router.replace('/(tabs)/home');
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign In
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* App Name */}
        <Text style={styles.appName}>App name</Text>

        {/* Create Account Section */}
        <View style={styles.formSection}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Enter your email to sign up for this app</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="email@domain.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSignIn}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          {/* Divider */}
          <Text style={styles.divider}>or</Text>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.oauthButtonText}>G</Text>
            <Text style={styles.oauthButtonLabel}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Apple Sign In */}
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleAppleSignIn}
          >
            <Text style={styles.oauthButtonText}></Text>
            <Text style={styles.oauthButtonLabel}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By clicking continue, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  appName: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 80,
  },
  formSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 24,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  oauthButtonText: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
    width: 24,
  },
  oauthButtonLabel: {
    fontSize: 16,
    color: '#000',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});

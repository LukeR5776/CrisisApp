/**
 * Root layout component
 * Manages app-wide navigation and initial route
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const { initialize, loading, initialized, user, isEmailVerified } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [isHandlingUrl, setIsHandlingUrl] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  // Handle deep links for email verification
  useEffect(() => {
    // Handle initial URL (app opened from email link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle subsequent URLs (app already open)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    try {
      console.log('Deep link received:', url);
      setIsHandlingUrl(true);

      // Parse the URL to check if it's an auth callback
      const urlObj = new URL(url);

      // Check for Supabase auth tokens in the URL
      // Format: crisisapp://callback#access_token=...&refresh_token=...
      // Or: crisisapp://callback?token_hash=...&type=...
      const hash = urlObj.hash.substring(1); // Remove leading #
      const search = urlObj.search.substring(1); // Remove leading ?

      const hashParams = new URLSearchParams(hash);
      const searchParams = new URLSearchParams(search);

      // Check for PKCE flow tokens
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
      const type = searchParams.get('type') || hashParams.get('type');

      if (accessToken && refreshToken) {
        // Handle magic link / email verification (older flow)
        console.log('Setting session from deep link tokens');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
        } else {
          console.log('Session set successfully from deep link');
          // Auth state change listener will handle navigation
        }
      } else if (tokenHash && type === 'email') {
        // Handle PKCE flow email verification
        console.log('Verifying email with token hash');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        });

        if (error) {
          console.error('Error verifying email:', error);
        } else {
          console.log('Email verified successfully');
          // Auth state change listener will handle navigation
        }
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    } finally {
      setIsHandlingUrl(false);
    }
  };

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inVerifyEmail = segments[0] === 'verify-email';
    const inPasswordReset = segments[0] === 'reset-password' || segments[0] === 'update-password';

    // User is signed in
    if (user) {
      // DEMO MODE: Email verification disabled for demo purposes
      // To re-enable: uncomment the 4 lines below
      // if (!isEmailVerified() && !inVerifyEmail) {
      //   // Redirect to verify email screen
      //   router.replace('/verify-email');
      // } else if (isEmailVerified() && !inAuthGroup && !inPasswordReset) {
      if (!inAuthGroup && !inPasswordReset) {
        // Email verified, redirect to home
        router.replace('/(tabs)/home');
      }
    } else {
      // Not signed in, redirect to sign in
      if (inAuthGroup || inVerifyEmail) {
        router.replace('/');
      }
    }
  }, [user, initialized]);

  if (loading || !initialized || isHandlingUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="family/[id]" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="update-password" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

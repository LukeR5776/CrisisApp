/**
 * Root layout component
 * Manages app-wide navigation and initial route
 */

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { initialize, loading, initialized, user, isEmailVerified } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inVerifyEmail = segments[0] === 'verify-email';
    const inPasswordReset = segments[0] === 'reset-password' || segments[0] === 'update-password';

    // User is signed in
    if (user) {
      // Check if email is verified
      if (!isEmailVerified() && !inVerifyEmail) {
        // Redirect to verify email screen
        router.replace('/verify-email');
      } else if (isEmailVerified() && !inAuthGroup && !inPasswordReset) {
        // Email verified, redirect to home
        router.replace('/(tabs)/home');
      }
    } else {
      // Not signed in, redirect to sign in
      if (inAuthGroup || inVerifyEmail) {
        router.replace('/');
      }
    }
  }, [user, initialized, segments]);

  if (loading || !initialized) {
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

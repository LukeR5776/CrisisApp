/**
 * Rate Limiting for Authentication Attempts
 * Prevents brute force attacks by limiting failed login attempts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const STORAGE_KEY = '@auth_rate_limit';

interface RateLimitData {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

async function getRateLimitData(): Promise<RateLimitData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading rate limit data:', error);
  }

  return {
    attempts: 0,
    lockedUntil: null,
    lastAttempt: 0,
  };
}

async function setRateLimitData(data: RateLimitData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
}

export async function checkRateLimit(): Promise<{
  isLocked: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
  timeRemaining: number; // seconds
}> {
  const data = await getRateLimitData();
  const now = Date.now();

  // Check if currently locked
  if (data.lockedUntil && now < data.lockedUntil) {
    const timeRemaining = Math.ceil((data.lockedUntil - now) / 1000);
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockedUntil: data.lockedUntil,
      timeRemaining,
    };
  }

  // If lockout expired, reset
  if (data.lockedUntil && now >= data.lockedUntil) {
    const resetData = {
      attempts: 0,
      lockedUntil: null,
      lastAttempt: 0,
    };
    await setRateLimitData(resetData);
    return {
      isLocked: false,
      remainingAttempts: MAX_ATTEMPTS,
      lockedUntil: null,
      timeRemaining: 0,
    };
  }

  // Not locked
  return {
    isLocked: false,
    remainingAttempts: MAX_ATTEMPTS - data.attempts,
    lockedUntil: null,
    timeRemaining: 0,
  };
}

export async function recordFailedAttempt(): Promise<{
  isLocked: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
}> {
  const data = await getRateLimitData();
  const now = Date.now();

  data.attempts += 1;
  data.lastAttempt = now;

  // Lock if max attempts reached
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = now + LOCKOUT_DURATION;
    await setRateLimitData(data);

    return {
      isLocked: true,
      remainingAttempts: 0,
      lockedUntil: data.lockedUntil,
    };
  }

  await setRateLimitData(data);

  return {
    isLocked: false,
    remainingAttempts: MAX_ATTEMPTS - data.attempts,
    lockedUntil: null,
  };
}

export async function resetRateLimit(): Promise<void> {
  const data: RateLimitData = {
    attempts: 0,
    lockedUntil: null,
    lastAttempt: 0,
  };
  await setRateLimitData(data);
}

export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

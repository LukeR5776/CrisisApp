/**
 * Sign In Screen
 * Initial landing page with email/password and OAuth options
 * Includes password strength checking and rate limiting
 */

import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { validatePassword, checkPasswordRequirements } from '../lib/passwordValidator';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, formatTimeRemaining } from '../lib/rateLimiter';

export default function SignIn() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Rate limiting state
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  // Password validation
  const passwordStrength = validatePassword(password);
  const requirements = checkPasswordRequirements(password);

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimitStatus();
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (isLocked && lockoutTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setRemainingAttempts(5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTimeRemaining]);

  const checkRateLimitStatus = async () => {
    const status = await checkRateLimit();
    setIsLocked(status.isLocked);
    setRemainingAttempts(status.remainingAttempts);
    setLockoutTimeRemaining(status.timeRemaining);
  };

  const handleAuth = async () => {
    setError('');

    // Check if locked out
    if (isLocked) {
      setError(`Too many attempts. Try again in ${formatTimeRemaining(lockoutTimeRemaining)}`);
      return;
    }

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && !displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    // For sign up, enforce strong password
    if (isSignUp && !passwordStrength.isValid) {
      setError('Please choose a stronger password that meets all requirements');
      return;
    }

    // For sign in, just check minimum length
    if (!isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email.trim(), password, displayName.trim());
        if (!result.error) {
          // Reset rate limit on successful signup
          await resetRateLimit();
          // Root layout will handle redirect to verify-email
        } else {
          setError(result.error.message);
        }
      } else {
        result = await signIn(email.trim(), password);
        if (!result.error) {
          // Reset rate limit on successful login
          await resetRateLimit();
          // Root layout will handle redirect to home
        } else {
          // Record failed attempt
          const limitStatus = await recordFailedAttempt();
          setIsLocked(limitStatus.isLocked);
          setRemainingAttempts(limitStatus.remainingAttempts);

          if (limitStatus.isLocked) {
            setLockoutTimeRemaining(15 * 60); // 15 minutes in seconds
            setError('Too many failed attempts. Account locked for 15 minutes.');
          } else {
            setError(`${result.error.message}. ${limitStatus.remainingAttempts} attempts remaining.`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be available soon!');
  };

  const handleAppleSignIn = () => {
    Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* App Name */}
          <Text style={styles.appName}>CrisisApp</Text>

          {/* Auth Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.title}>
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Enter your details to sign up for this app'
                : 'Sign in to your account to continue'}
            </Text>

            {/* Display Name Input (Sign Up Only) */}
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLocked}
              />
            )}

            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="email@domain.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLocked}
            />

            {/* Password Input */}
            <TextInput
              style={styles.input}
              placeholder={isSignUp ? "Password (min 8 characters)" : "Password"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLocked}
              onFocus={() => isSignUp && setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}
            />

            {/* Password Strength Indicator (Sign Up Only) */}
            {isSignUp && password.length > 0 && (
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

            {/* Password Requirements (Sign Up Only) */}
            {isSignUp && showPasswordRequirements && password.length > 0 && (
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

            {/* Forgot Password Link (Sign In Only) */}
            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => router.push('/reset-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Rate Limit Warning */}
            {!isLocked && remainingAttempts < 5 && !isSignUp && (
              <Text style={styles.warningText}>
                ⚠️ {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </Text>
            )}

            {/* Lockout Message */}
            {isLocked && (
              <View style={styles.lockoutContainer}>
                <Text style={styles.lockoutIcon}>🔒</Text>
                <Text style={styles.lockoutText}>
                  Account temporarily locked
                </Text>
                <Text style={styles.lockoutTimer}>
                  Try again in {formatTimeRemaining(lockoutTimeRemaining)}
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Auth Button */}
            <TouchableOpacity
              style={[styles.continueButton, (loading || isLocked) && styles.continueButtonDisabled]}
              onPress={handleAuth}
              disabled={loading || isLocked}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Sign Up / Sign In */}
            <TouchableOpacity
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setShowPasswordRequirements(false);
              }}
              style={styles.toggleButton}
              disabled={isLocked}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <Text style={styles.divider}>or</Text>

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={handleGoogleSignIn}
              disabled={isLocked}
            >
              <Text style={styles.oauthButtonText}>G</Text>
              <Text style={styles.oauthButtonLabel}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple Sign In */}
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={handleAppleSignIn}
              disabled={isLocked}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper component for password requirements
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '500',
  },
  warningText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF4E5',
    borderRadius: 8,
  },
  lockoutContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  lockoutIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  lockoutTimer: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#666',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleText: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
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

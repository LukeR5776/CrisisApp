/**
 * Password Validation and Strength Checking
 */

// Common passwords to block (top 100 most common)
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1',
  'admin', 'welcome123', 'login', 'starwars', '123456789', 'admin123',
];

export interface PasswordStrength {
  score: number; // 0-4 (0=very weak, 4=very strong)
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string[];
  isValid: boolean;
}

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  notCommon: boolean;
}

export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };
}

export function validatePassword(password: string): PasswordStrength {
  const requirements = checkPasswordRequirements(password);
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (!requirements.minLength) {
    feedback.push('Use at least 8 characters');
  } else {
    score += 1;
  }

  // Check uppercase
  if (!requirements.hasUppercase) {
    feedback.push('Add uppercase letters (A-Z)');
  } else {
    score += 0.5;
  }

  // Check lowercase
  if (!requirements.hasLowercase) {
    feedback.push('Add lowercase letters (a-z)');
  } else {
    score += 0.5;
  }

  // Check numbers
  if (!requirements.hasNumber) {
    feedback.push('Add numbers (0-9)');
  } else {
    score += 1;
  }

  // Check special characters
  if (!requirements.hasSpecialChar) {
    feedback.push('Add special characters (!@#$...)');
  } else {
    score += 1;
  }

  // Check for common passwords
  if (!requirements.notCommon) {
    feedback.push('This password is too common');
    score = 0; // Override score for common passwords
  }

  // Bonus points for extra length
  if (password.length >= 12) {
    score += 0.5;
  }
  if (password.length >= 16) {
    score += 0.5;
  }

  // Normalize score to 0-4 range
  score = Math.min(4, score);

  // Determine label and color
  let label: PasswordStrength['label'];
  let color: string;

  if (score < 1) {
    label = 'Very Weak';
    color = '#FF3B30';
  } else if (score < 2) {
    label = 'Weak';
    color = '#FF9500';
  } else if (score < 3) {
    label = 'Fair';
    color = '#FFCC00';
  } else if (score < 4) {
    label = 'Strong';
    color = '#34C759';
  } else {
    label = 'Very Strong';
    color = '#007AFF';
  }

  // Password is valid if it meets all basic requirements
  const isValid = Object.values(requirements).every(req => req === true);

  if (feedback.length === 0 && isValid) {
    feedback.push('Great password!');
  }

  return {
    score,
    label,
    color,
    feedback,
    isValid,
  };
}

export function getPasswordStrengthPercentage(score: number): number {
  return (score / 4) * 100;
}

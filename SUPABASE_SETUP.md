# Supabase Setup Guide for Email Verification

This guide walks you through configuring your Supabase project to enable email verification and password reset functionality.

## Prerequisites

- Access to your Supabase dashboard at https://app.supabase.com
- Your project already created (CrisisApp)

## Step 1: Enable Email Confirmation

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. Find **Enable email confirmations**
5. Toggle it **ON**
6. Click **Save**

This ensures that new users must verify their email before accessing the app.

## Step 2: Configure Email Templates

### Confirmation Email Template

1. In the same **Authentication** → **Settings** page
2. Scroll to **Email Templates** section
3. Click on **Confirm signup** template
4. Customize the email subject and body if desired
5. Ensure the confirmation link is present: `{{ .ConfirmationURL }}`

### Password Reset Template

1. Click on **Reset password** template
2. Customize the email subject and body if desired
3. Ensure the reset link is present: `{{ .ConfirmationURL }}`

## Step 3: Configure Redirect URLs

1. In **Authentication** → **Settings**
2. Scroll to **Redirect URLs** section
3. Add your app's deep link scheme:
   ```
   crisisapp://update-password
   ```
4. For local development, also add:
   ```
   exp://localhost:8081/--/update-password
   ```
5. Click **Save**

## Step 4: Test Email Delivery (Optional)

For development, Supabase uses their built-in SMTP by default. For production:

1. Navigate to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your own SMTP provider (SendGrid, AWS SES, etc.)
4. Test email delivery

## Step 5: Configure Session Settings (Optional)

1. In **Authentication** → **Settings**
2. Review **JWT expiry** (default: 3600 seconds = 1 hour)
3. Review **Refresh token expiry** (default: 2592000 seconds = 30 days)
4. Adjust if needed for your security requirements

## Verification Checklist

- [ ] Email confirmations enabled
- [ ] Redirect URLs configured for password reset
- [ ] Email templates reviewed
- [ ] (Production only) Custom SMTP configured
- [ ] Test user sign up and receive verification email
- [ ] Test password reset flow
- [ ] Test rate limiting (5 failed attempts)

## Testing the Flow

### Email Verification Flow:
1. Sign up with a new account
2. Check email for verification link
3. Click link in email
4. App should redirect to home screen

### Password Reset Flow:
1. Click "Forgot password?" on sign-in screen
2. Enter email address
3. Check email for reset link
4. Click link in email
5. Enter new password
6. Sign in with new password

## Security Best Practices

1. **Enable RLS**: Ensure Row Level Security is enabled on all tables
2. **Limit Sign-Up**: Consider adding CAPTCHA for production
3. **Monitor Auth Logs**: Regularly check Authentication logs in Supabase Dashboard
4. **Rate Limiting**: The app has client-side rate limiting, but consider server-side too
5. **Password Policy**: Already enforced (8+ chars, complexity requirements)

## Troubleshooting

### Emails not arriving
- Check spam folder
- Verify SMTP settings in Supabase Dashboard
- Check Authentication logs for errors

### Redirect not working
- Ensure redirect URL is added to allowed list
- Check deep link configuration in app.json
- Verify URL scheme matches: `crisisapp://`

### Rate limiting not working
- Clear AsyncStorage: Delete and reinstall app
- Check browser/device storage permissions

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Deep Linking in Expo](https://docs.expo.dev/guides/linking/)

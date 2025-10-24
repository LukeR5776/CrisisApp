/**
 * Supabase Client Configuration
 * Handles authentication and database connections
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlthbhzfnozzrkvjxxuz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdGhiaHpmbm96enJrdmp4eHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM5MTMsImV4cCI6MjA3Njg5OTkxM30.63gt13cF4FaBjF_Jri9sniFjSfUKGkuozunkJf_U5I8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tznhxoumebhmgfbivhpp.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6bmh4b3VtZWJobWdmYml2aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjM3MjUsImV4cCI6MjA4NTczOTcyNX0.VPiSX6aXu81YotbU0VnPNY7kwOAXuh6yrrWxkK-kQvk'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
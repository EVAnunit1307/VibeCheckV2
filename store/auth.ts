import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  phone_number: string | null;
  full_name: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  commitment_score: number;
  created_at?: string;
}

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  checkProfile: (userId: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,

  setSession: (session) => set({ session }),
  
  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ session: null, user: null, loading: false, initialized: true });
        return;
      }

      if (session) {
        set({ session });
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          
          // If profile doesn't exist, create one for OAuth users
          if (profileError.code === 'PGRST116') {
            const userData = session.user;
            const newProfile = {
              id: userData.id,
              full_name: userData.user_metadata?.full_name || userData.user_metadata?.name || 'User',
              username: userData.user_metadata?.email?.split('@')[0] || `user${Date.now()}`,
              email: userData.email || null,
              phone_number: userData.phone || null,
              avatar_url: userData.user_metadata?.avatar_url || userData.user_metadata?.picture || null,
              commitment_score: 100,
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              set({ user: createdProfile });
            }
          }
        } else {
          set({ user: profile });
        }
      }

      set({ loading: false, initialized: true });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, initialized: true });
    }
  },

  checkProfile: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ session: null, user: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));

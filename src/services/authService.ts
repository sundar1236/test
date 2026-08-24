import { supabase } from '../lib/supabase';
import { UserRole } from '../types/database';

/**
 * Utility to compute environment-aware authentication redirect URLs
 */
export const getAuthRedirectUrl = (path: string = '/'): string => {
  const isProduction =
    window.location.hostname === 'mocktesttrial.netlify.app' ||
    import.meta.env.MODE === 'production';

  const baseUrl = isProduction
    ? 'https://mocktesttrial.netlify.app'
    : window.location.origin;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const authService = {
  async signUp(email: string, pass: string, fullName: string, role: UserRole = 'student') {
    const emailRedirectTo = getAuthRedirectUrl('/login');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: pass,
      options: {
        emailRedirectTo,
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      throw this.formatAuthError(error);
    }

    if (data.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          full_name: fullName,
          role: role,
        });
      } catch (profileErr) {
        console.warn('Profile sync non-blocking warning:', profileErr);
      }
    }

    return data;
  },

  async signIn(email: string, pass: string) {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (error) {
      throw this.formatAuthError(error);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw this.formatAuthError(error);
    }
  },

  async resetPassword(email: string) {
    const redirectTo = getAuthRedirectUrl('/reset-password');

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw this.formatAuthError(error);
    }

    return data;
  },

  async deleteAccount(): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      throw new Error('No active user session found to perform account deletion.');
    }

    // Call secure database RPC function to delete user data & auth record
    const { error: rpcError } = await supabase.rpc('delete_user_account');

    if (rpcError) {
      // Fallback: Delete application profile & user-owned rows directly via RLS
      try {
        await supabase.from('bookmarks').delete().eq('user_id', userId);
        await supabase.from('user_topic_progress').delete().eq('user_id', userId);
        await supabase.from('test_attempts').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
      } catch (err) {
        console.warn('Manual user row cleanup warning:', err);
      }
    }

    // Sign out user session completely
    await this.signOut();
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Profile fetch warning:', error.message);
    }

    return data;
  },

  formatAuthError(error: any): Error {
    const msg = typeof error === 'string' ? error : error?.message || 'Authentication request failed.';
    if (msg.includes('Failed to fetch') || error?.name === 'TypeError') {
      return new Error('Unable to connect to the authentication server. Please check your network connection.');
    }
    if (msg.includes('Invalid login credentials')) {
      return new Error('Invalid email or password. Please verify your credentials and try again.');
    }
    if (msg.includes('User already registered')) {
      return new Error('An account with this email address already exists.');
    }
    if (msg.includes('Password should be at least')) {
      return new Error('Password must be at least 6 characters long.');
    }
    if (msg.includes('Email not confirmed')) {
      return new Error('Please confirm your email address before logging in.');
    }
    return new Error(msg);
  },
};

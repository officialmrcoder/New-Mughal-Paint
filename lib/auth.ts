import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: 'user' | 'admin';
  created_at?: string;
}

// Cookie helpers
export const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Central Auth Service
export const authService = {

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        return {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          phone: session.user.user_metadata?.phone || '',
          address: '',
          role: 'user'
        };
      }

      return data as UserProfile;
    } catch (e) {
      console.error('getCurrentUser error:', e);
      return null;
    }
  },

  async signUp(email: string, password: string, name: string, phone: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone }
        }
      });

      if (error) throw error;

      const profile: UserProfile = {
        id: data.user?.id || '',
        email,
        name,
        phone,
        address: '',
        role: 'user'
      };

      setCookie('nmp_user_session', encodeURIComponent(JSON.stringify(profile)));
      return { success: true, message: 'Signup successful! Please log in.', user: data.user };
    } catch (e: any) {
      return { success: false, message: e.message || 'Signup failed.' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || '',
        role: profile?.role || 'user'
      };

      setCookie('nmp_user_session', encodeURIComponent(JSON.stringify(userSession)));
      return { success: true, message: 'Logged in successfully!', user: data.user };
    } catch (e: any) {
      return { success: false, message: e.message || 'Login failed.' };
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    removeCookie('nmp_user_session');
    window.location.href = '/login';
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account/reset-password`,
      });
      if (error) throw error;
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error sending reset email.' };
    }
  },

  async updateProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          address: profile.address
        })
        .eq('id', profile.id);

      if (error) throw error;
      return { success: true, message: 'Profile updated successfully!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to update profile.' };
    }
  }
};
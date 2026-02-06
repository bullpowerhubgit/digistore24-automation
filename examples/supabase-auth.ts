/**
 * Supabase Authentication Examples
 * 
 * This file demonstrates how to use Supabase authentication features
 * including sign up, sign in, sign out, and password reset.
 */

import { createClientSupabaseClient } from '@/lib/supabase';

/**
 * Sign up a new user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @returns User object and session if successful
 */
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClientSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Optional: Add email redirect URL for confirmation
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('Sign up error:', error.message);
    throw error;
  }

  console.log('User signed up successfully:', data.user?.email);
  return data;
}

/**
 * Sign in an existing user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns User object and session if successful
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClientSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    throw error;
  }

  console.log('User signed in successfully:', data.user?.email);
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClientSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error.message);
    throw error;
  }

  console.log('User signed out successfully');
}

/**
 * Get the current authenticated user
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser() {
  const supabase = createClientSupabaseClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error.message);
    return null;
  }

  return user;
}

/**
 * Get the current session
 * 
 * @returns Session object if user is authenticated, null otherwise
 */
export async function getSession() {
  const supabase = createClientSupabaseClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Get session error:', error.message);
    return null;
  }

  return session;
}

/**
 * Send password reset email
 * 
 * @param email - User's email address
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = createClientSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    console.error('Password reset error:', error.message);
    throw error;
  }

  console.log('Password reset email sent to:', email);
}

/**
 * Update user password
 * 
 * @param newPassword - New password (min 6 characters)
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClientSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Update password error:', error.message);
    throw error;
  }

  console.log('Password updated successfully');
}

/**
 * Update user metadata (profile information)
 * 
 * @param metadata - Object containing user metadata to update
 */
export async function updateUserMetadata(metadata: Record<string, any>) {
  const supabase = createClientSupabaseClient();

  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (error) {
    console.error('Update metadata error:', error.message);
    throw error;
  }

  console.log('User metadata updated:', data.user?.user_metadata);
  return data;
}

/**
 * Listen to authentication state changes
 * 
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const supabase = createClientSupabaseClient();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth state changed:', event);
      callback(event, session);
    }
  );

  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

// Example usage:
// 
// // Sign up a new user
// await signUpWithEmail('user@example.com', 'secure-password');
//
// // Sign in
// await signInWithEmail('user@example.com', 'secure-password');
//
// // Get current user
// const user = await getCurrentUser();
// console.log('Current user:', user);
//
// // Sign out
// await signOut();
//
// // Reset password
// await sendPasswordResetEmail('user@example.com');
//
// // Listen to auth changes
// const unsubscribe = onAuthStateChange((event, session) => {
//   console.log('Auth event:', event);
//   console.log('Session:', session);
// });
// // Later: unsubscribe();

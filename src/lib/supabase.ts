/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = typeof rawSupabaseUrl === 'string' ? rawSupabaseUrl.trim() : '';
const supabaseAnonKey = typeof rawSupabaseAnonKey === 'string' ? rawSupabaseAnonKey.trim() : '';

/**
 * Validates that both required environment variables exist, are non-empty,
 * and are not placeholder values.
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  supabaseAnonKey !== 'your-anon-key'
);

/**
 * Initialized Supabase client instance, or null if configuration is missing.
 * Prevents application startup crashes when environment variables are not yet provided.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Safe diagnostic summary that reveals configuration status without exposing sensitive keys.
 */
export function getSupabaseConfigStatus(): {
  configured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  message: string;
} {
  const hasUrl = supabaseUrl.length > 0;
  const hasAnonKey = supabaseAnonKey.length > 0;

  if (isSupabaseConfigured) {
    return {
      configured: true,
      hasUrl,
      hasAnonKey,
      message: 'Supabase client initialized successfully with valid environment variables.',
    };
  }

  return {
    configured: false,
    hasUrl,
    hasAnonKey,
    message:
      'Supabase is not configured. Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. The application continues running in public preview mode.',
  };
}

/**
 * Accessor that returns the initialized Supabase client or throws a descriptive error
 * when invoked in an unconfigured state.
 */
export function getRequiredSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase client is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
  }
  return supabase;
}

// Log a non-intrusive diagnostic warning in development if environment variables are missing
if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Supabase Configuration] Environment variables VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing or set to placeholders. Supabase features will be inactive until valid credentials are provided.'
  );
}

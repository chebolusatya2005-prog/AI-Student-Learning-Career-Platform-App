/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'student' | 'trainer' | 'admin' | string;

export interface UserProfile {
  id: string;
  email?: string | null;
  role: UserRole;
  full_name?: string | null;
  created_at?: string | null;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  dbErrorDetails?: string | null;
  role?: UserRole;
}

export interface SignUpResult {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  needsEmailConfirmation?: boolean;
  profileCreated?: boolean;
  role?: UserRole;
  error?: string;
  dbErrorDetails?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  dbErrorDetails: string | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbErrorDetails, setDbErrorDetails] = useState<string | null>(null);

  // In-flight promise tracker to deduplicate concurrent requests for the same user ID
  const inFlightFetchPromiseRef = useRef<Map<string, Promise<{ profile: UserProfile | null; error?: string; dbError?: string }>>>(new Map());

  const clearError = () => {
    setError(null);
    setDbErrorDetails(null);
  };

  /**
   * Queries ONLY the signed-in user's profile row from public.users using id = session.user.id.
   * If permission error occurs, captures exact database error details.
   */
  const fetchProfileForUser = async (
    userId: string
  ): Promise<{ profile: UserProfile | null; error?: string; dbError?: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      return { profile: null, error: 'Supabase is not configured' };
    }

    // Deduplicate in-flight fetch for the exact same user ID
    const existingPromise = inFlightFetchPromiseRef.current.get(userId);
    if (existingPromise) {
      return existingPromise;
    }

    const fetchPromise = (async () => {
      setIsProfileLoading(true);
      try {
        // Query columns available in public.users: id, email, role, full_name
        let { data, error: queryError, status } = await supabase
          .from('users')
          .select('id, email, role, full_name')
          .eq('id', userId)
          .maybeSingle();

        // If permission error or empty result occurred immediately upon sign-in, retry once after brief token propagation delay
        if ((queryError && (queryError.code === '42501' || queryError.message.includes('permission denied'))) || (!data && !queryError)) {
          await new Promise((r) => setTimeout(r, 250));
          const retryRes = await supabase
            .from('users')
            .select('id, email, role, full_name')
            .eq('id', userId)
            .maybeSingle();
          if (retryRes.data) {
            data = retryRes.data;
            queryError = null;
          } else if (retryRes.error) {
            queryError = retryRes.error;
          }
        }

        if (queryError) {
          const errorDetail = `[Database Error ${queryError.code || status}]: ${queryError.message}`;
          console.warn('[Auth] Permission or query error on public.users:', errorDetail);
          setDbErrorDetails(errorDetail);

          let userMsg = 'Permission denied when accessing user profile in public.users.';
          if (queryError.code === '42501' || queryError.message.includes('permission denied')) {
            userMsg =
              'Database permission denied on public.users. Your account is authenticated, but database RLS policies prevent reading your profile record.';
          }
          return { profile: null, error: userMsg, dbError: errorDetail };
        }

        if (data) {
          let resolvedRole = typeof data.role === 'string' ? data.role.trim().toLowerCase() : '';

          // If role column is empty, check trainers/students table as an authorized fallback
          if (!resolvedRole) {
            try {
              const { data: trainerCheck } = await supabase
                .from('trainers')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();
              if (trainerCheck) {
                resolvedRole = 'trainer';
              } else {
                const { data: studentCheck } = await supabase
                  .from('students')
                  .select('user_id')
                  .eq('user_id', userId)
                  .maybeSingle();
                if (studentCheck) {
                  resolvedRole = 'student';
                }
              }
            } catch {
              // Non-blocking fallback
            }
          }

          const userProfile: UserProfile = {
            id: data.id,
            email: data.email,
            role: resolvedRole || (data.role as UserRole),
            full_name: data.full_name,
            created_at: (data as Record<string, unknown>).created_at as string | undefined,
          };

          setProfile(userProfile);
          setRole(resolvedRole || null);
          setDbErrorDetails(null);
          return { profile: userProfile };
        }

        // Secondary fallback: if user is not in public.users or RLS blocked public.users, check if trainer record exists
        try {
          const { data: trainerCheck } = await supabase
            .from('trainers')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();
          if (trainerCheck) {
            const fallbackProfile: UserProfile = {
              id: userId,
              role: 'trainer',
            };
            setProfile(fallbackProfile);
            setRole('trainer');
            setDbErrorDetails(null);
            return { profile: fallbackProfile };
          }
        } catch {
          // Non-blocking fallback
        }

        setProfile(null);
        setRole(null);
        return {
          profile: null,
          error:
            'No profile record exists in public.users for this user ID. Please ensure your account has been added to public.users.',
        };
      } catch (err: unknown) {
        const errDetail = err instanceof Error ? err.message : String(err);
        console.warn('[Auth] Unexpected error querying public.users:', errDetail);
        setDbErrorDetails(errDetail);
        return {
          profile: null,
          error: 'An unexpected error occurred while loading user profile.',
          dbError: errDetail,
        };
      } finally {
        setIsProfileLoading(false);
        inFlightFetchPromiseRef.current.delete(userId);
      }
    })();

    inFlightFetchPromiseRef.current.set(userId, fetchPromise);
    return fetchPromise;
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (user?.id) {
      const res = await fetchProfileForUser(user.id);
      return res.profile;
    }
    return null;
  };

  // Rehydrate initial session and subscribe to auth lifecycle events
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Initial Session Check (safeguard: verify real session exists with user and token)
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error: sessionError }) => {
        if (!isMounted) return;

        if (sessionError) {
          console.warn('[Auth] Error checking initial session:', sessionError.message);
        }

        // Verify genuine active session
        if (initialSession && initialSession.user && initialSession.access_token) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfileForUser(initialSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      })
      .catch((err) => {
        console.warn('[Auth] Session initialization error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // 2. Auth State Change Listener with unmount cleanup
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !currentSession || !currentSession.user) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        clearError();
        return;
      }

      setSession(currentSession);
      setUser(currentSession.user);

      // Fetch profile only on relevant auth events (prevent duplicate runs)
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        await fetchProfileForUser(currentSession.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Real login with signInWithPassword and role verification
  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    clearError();

    if (!supabase || !isSupabaseConfigured) {
      const errMessage =
        'Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.';
      setError(errMessage);
      return { success: false, error: errMessage };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        const friendlyMessage =
          authError.message === 'Invalid login credentials'
            ? 'Invalid email or password. Please verify your credentials and try again.'
            : authError.message;
        setError(friendlyMessage);
        return { success: false, error: friendlyMessage };
      }

      if (!authData.user || !authData.session) {
        const errMessage = 'Authentication response did not contain an active user session.';
        setError(errMessage);
        return { success: false, error: errMessage };
      }

      // Query signed-in user's profile using id = session.user.id
      const { profile: userProfile, error: profileQueryError, dbError } = await fetchProfileForUser(authData.user.id);

      setUser(authData.user);
      setSession(authData.session);

      if (profileQueryError || !userProfile) {
        const finalError =
          profileQueryError ||
          'Account authenticated, but no profile record was found in public.users. Please contact an administrator.';
        setError(finalError);
        return {
          success: false,
          error: finalError,
          dbErrorDetails: dbError || null,
        };
      }

      if (!userProfile.role) {
        const roleErr = 'User profile exists in public.users, but the role column is empty or unassigned.';
        setError(roleErr);
        return { success: false, error: roleErr };
      }

      return {
        success: true,
        role: userProfile.role,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Real signup with strict student role and dual-branch session/confirmation handling
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<SignUpResult> => {
    clearError();

    if (!supabase || !isSupabaseConfigured) {
      const errMessage =
        'Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.';
      setError(errMessage);
      return { success: false, error: errMessage };
    }

    try {
      const trimmedEmail = email.trim();
      const trimmedName = fullName.trim();

      // Strictly lock public signup to student role in user metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            role: 'student',
          },
        },
      });

      if (signUpError) {
        let friendlyMessage = signUpError.message;
        const lowerMsg = signUpError.message.toLowerCase();
        if (
          lowerMsg.includes('already registered') ||
          lowerMsg.includes('email exists') ||
          lowerMsg.includes('identity already exists')
        ) {
          friendlyMessage = 'An account with this email address already exists. Please log in instead.';
        }
        setError(friendlyMessage);
        return { success: false, error: friendlyMessage };
      }

      if (!data.user) {
        const errMessage = 'Signup succeeded but no user data was returned by the auth service.';
        setError(errMessage);
        return { success: false, error: errMessage };
      }

      // Branch A: Email confirmation required (no active session returned)
      if (!data.session) {
        return {
          success: true,
          user: data.user,
          session: null,
          needsEmailConfirmation: true,
        };
      }

      // Branch B: Immediate active session issued (email confirmation disabled or pre-confirmed)
      setUser(data.user);
      setSession(data.session);

      // Attempt safe profile and role resolution from public.users
      const { profile: userProfile, error: profileQueryError, dbError } = await fetchProfileForUser(data.user.id);

      if (profileQueryError || !userProfile) {
        return {
          success: true,
          user: data.user,
          session: data.session,
          needsEmailConfirmation: false,
          profileCreated: false,
          error:
            profileQueryError ||
            'Account created, but your student profile has not yet been registered in public.users. Please sign in after an administrator configures your profile.',
          dbErrorDetails: dbError || null,
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        needsEmailConfirmation: false,
        profileCreated: true,
        role: userProfile.role || undefined,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Safe logout flow
  const signOut = async (): Promise<void> => {
    clearError();
    if (!supabase || !isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      return;
    }

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.warn('[Auth] Sign out error:', signOutError.message);
      }
    } catch (err) {
      console.warn('[Auth] Unexpected error during sign out:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isProfileLoading,
        isAuthenticated: Boolean(user && session),
        error,
        dbErrorDetails,
        signIn,
        signUp,
        signOut,
        clearError,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

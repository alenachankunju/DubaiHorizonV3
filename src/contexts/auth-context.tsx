
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session, User, AuthError, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, Subscription } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signUp: (credentials: SignUpWithPasswordCredentials & { data?: { first_name?: string; last_name?: string; } }) => Promise<{ error: AuthError | null; user: User | null }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
  isAuthModalOpen: boolean;
  openAuthModal: (defaultView?: 'signIn' | 'signUp' | 'forgotPassword') => void;
  closeAuthModal: () => void;
  authModalView: 'signIn' | 'signUp' | 'forgotPassword';
  setAuthModalView: (view: 'signIn' | 'signUp' | 'forgotPassword') => void;
  postLoginAction: (() => void) | null;
  setPostLoginAction: (action: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const { toast } = useToast();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);


  const openAuthModal = useCallback((defaultView: 'signIn' | 'signUp' | 'forgotPassword' = 'signIn') => {
    setAuthModalView(defaultView);
    setIsAuthModalOpen(true);
    setError(null);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setError(null);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError);
        console.error("Error getting session:", sessionError);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };
    getSession();

    const { data: authSubscriptionData } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          setError(null); // Clear any previous errors
          toast({
            title: "Signed In Successfully!",
            description: `Welcome back, ${currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.first_name || currentSession.user.email}!`
          });
          if (postLoginAction) {
            postLoginAction();
            setPostLoginAction(null);
          }
          closeAuthModal();
        } else if (event === 'PASSWORD_RECOVERY') {
          setError(null);
        } else if (event === 'USER_UPDATED') {
            setError(null);
        } else if (event === 'SIGNED_OUT') {
            setError(null);
        }
      }
    );

    return () => {
      authSubscriptionData?.subscription?.unsubscribe();
    };
  }, [postLoginAction, closeAuthModal, toast]);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
    setIsLoading(false);
    if (signInError) {
      setError(signInError);
      // Toast is now handled by onAuthStateChange or error display in modal
    }
    // Successful sign-in is handled by onAuthStateChange
    return { error: signInError };
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials & { data?: { first_name?: string; last_name?: string; } }) => {
    setIsLoading(true);
    setError(null);
    const { email, password, options, data: userData } = credentials;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        data: {
            ...userData,
            full_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim()
        }
      }
    });
    setIsLoading(false);

    if (signUpError) {
      setError(signUpError);
      return { error: signUpError, user: null };
    }
    
    setError(null); // Clear previous errors

    if (data.user && data.user.identities?.length === 0) { // Email confirmation needed
        toast({ title: "Verification Email Sent!", description: "Please check your email to verify your account, then sign in.", duration: 7000 });
        setAuthModalView('signIn'); 
    } else if (data.user) { // Auto-confirmed or already confirmed
       // If auto-confirmed, SIGNED_IN event will handle modal close & welcome toast.
       // If email confirmation is off, user is signed in.
       // If email confirmation is on but user already exists and is confirmed, it might be an error or re-verification.
       // For simplicity, we'll assume if `identities` is not empty, they might need to sign in.
       toast({ title: "Sign Up Successful!", description: "Please sign in to continue.", duration: 5000 });
       setAuthModalView('signIn');
    } else { // Fallback, should ideally not happen if user or error is present.
        toast({ title: "Verification Email Sent!", description: "Please check your email to verify your account, then sign in.", duration: 7000 });
        setAuthModalView('signIn');
    }
    return { error: null, user: data.user };
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    setIsLoading(false);
    if (signOutError) {
      setError(signOutError);
      toast({ title: "Sign Out Failed", description: signOutError.message, variant: "destructive" });
    } else {
      toast({ title: "Signed Out Successfully" });
    }
    setUser(null);
    setSession(null);
  };

  const sendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/update-password`,
    });
    setIsLoading(false);
    if (resetError) {
      setError(resetError);
      toast({ title: "Password Reset Failed", description: resetError.message, variant: "destructive" });
      return { error: resetError };
    }
    toast({ title: "Password Reset Email Sent", description: "Please check your inbox for instructions." });
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
        user,
        session,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        sendPasswordResetEmail,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalView,
        setAuthModalView,
        postLoginAction,
        setPostLoginAction
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

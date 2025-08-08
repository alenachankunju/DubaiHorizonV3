
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import SignInForm from "./sign-in-form";
import SignUpForm from "./sign-up-form";
import ForgotPasswordForm from "./forgot-password-form";
import { Button } from "../ui/button";
import { Separator } from "@/components/ui/separator";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalView, setAuthModalView, error, isLoading } = useAuth();

  const handleTabChange = (value: string) => {
    setAuthModalView(value as 'signIn' | 'signUp' | 'forgotPassword');
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(isOpen) => { if (!isOpen) closeAuthModal(); }}>
      <DialogContent className="sm:max-w-[450px] p-0">
        {authModalView === 'forgotPassword' ? (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-headline">Reset Your Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-0">
              <ForgotPasswordForm />
              <Button variant="link" onClick={() => setAuthModalView('signIn')} className="mt-4 w-full">
                Back to Sign In
              </Button>
            </div>
          </>
        ) : (
          <Tabs value={authModalView} onValueChange={handleTabChange} className="w-full">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-3xl font-headline text-center text-primary">
                    {authModalView === 'signIn' ? 'Welcome Back!' : 'Create Your Account'}
                </DialogTitle>
                <DialogDescription className="text-center">
                    {authModalView === 'signIn' ? 'Sign in to continue your adventure.' : 'Join us to discover amazing destinations.'}
                </DialogDescription>
            </DialogHeader>
            <div className="px-6 pt-2 pb-4">
                 <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="signIn">Sign In</TabsTrigger>
                    <TabsTrigger value="signUp">Sign Up</TabsTrigger>
                </TabsList>
            </div>

            <div className="p-6 pt-0">
              <TabsContent value="signIn">
                <SignInForm />
                <Button variant="link" onClick={() => setAuthModalView('forgotPassword')} className="mt-2 text-sm text-muted-foreground hover:text-primary w-full">
                    Forgot Password?
                </Button>
                {/* Google Sign-In button removed from here */}
              </TabsContent>
              <TabsContent value="signUp">
                <SignUpForm />
              </TabsContent>
            </div>
          </Tabs>
        )}
         {error && (
            <div className="px-6 pb-4 text-sm text-destructive text-center">
                {error.message}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

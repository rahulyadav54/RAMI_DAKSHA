
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!userLoading && user) {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = res.user;
        
        await updateProfile(newUser, { displayName });

        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          role: "student",
          gradeLevel: 1,
          totalPoints: 0,
          displayName: displayName
        });

        toast({
          title: "Account created!",
          description: `Welcome to SmartRead, ${displayName}!`,
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          role: "student",
          gradeLevel: 1,
          totalPoints: 0,
          displayName: user.displayName || "New Reader"
        });
      }
      
      toast({
        title: "Success",
        description: "Signed in with Google.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Google Auth Failed",
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute bottom-0 right-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_70%_70%,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50" />

      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-white/80 backdrop-blur-md rounded-[2rem]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-[1.5rem] text-white shadow-xl shadow-primary/20">
              <BookOpen className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold tracking-tight">
              {isLogin ? "Welcome Back" : "Start Learning"}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin 
                ? "Enter your credentials to access your study hub." 
                : "Create an account to begin your AI reading journey."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Username / Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="How should we call you?" 
                  className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Password must be at least 6 characters" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/20 mt-4 transition-transform hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground">
              <span className="bg-white px-4">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-14 rounded-2xl border-2 hover:bg-muted/50 transition-all font-bold" onClick={handleGoogle} disabled={isLoading}>
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google Account
          </Button>
        </CardContent>
        <CardFooter className="justify-center pb-8">
          <p className="text-sm text-muted-foreground font-medium">
            {isLogin ? "Don't have an account?" : "Already a member?"}{" "}
            <button 
              className="text-primary font-black hover:underline underline-offset-4 ml-1 transition-colors hover:text-accent"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Join Now" : "Sign In Here"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

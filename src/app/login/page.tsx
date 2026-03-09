
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Loader2, Sparkles, UserCircle, Users, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "parent">("student");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

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
        toast({ title: "Welcome back!", description: "Successfully signed in." });
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = res.user;
        await updateProfile(newUser, { displayName });
        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          role: role,
          displayName: displayName,
          totalPoints: 0,
          currentStreak: 0,
          createdAt: new Date().toISOString(),
          approved: role === "student" ? false : true
        });
        toast({ title: "Account created!", description: `Welcome to SmartRead, ${displayName}!` });
      }
      router.push("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Authentication Error", description: err.message });
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
          displayName: user.displayName || "New Reader",
          totalPoints: 0,
          currentStreak: 0,
          createdAt: new Date().toISOString()
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Google Auth Failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-[2rem] bg-white">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary p-4 rounded-2xl text-white">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Access your AI learning portal" : "Join the future of personalized literacy"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <Select value={role} onValueChange={(v: any) => setRole(v)}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button className="w-full h-12 rounded-xl mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {isLogin ? "Sign In" : "Register"}
            </Button>
          </form>
          <div className="relative my-6 text-center">
            <span className="bg-white px-2 text-xs text-muted-foreground uppercase">Or</span>
            <div className="absolute inset-0 -z-10 flex items-center"><div className="w-full border-t"></div></div>
          </div>
          <Button variant="outline" className="w-full h-12 rounded-xl" onClick={handleGoogle} disabled={isLoading}>
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <button className="text-sm font-medium text-primary hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

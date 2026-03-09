import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CheckCircle2, BrainCircuit, BarChart3, Sparkles, Star, Zap, ShieldCheck } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-image");

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <header className="px-6 lg:px-12 h-20 flex items-center justify-between container mx-auto sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">
            SmartRead <span className="text-primary">AI</span>
          </span>
        </Link>
        
        <nav className="hidden lg:flex gap-10 items-center">
          <Link className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#how-it-works">Methodology</Link>
          <div className="h-4 w-px bg-slate-200" />
          <Button variant="ghost" className="font-bold text-slate-600" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button className="rounded-2xl h-11 px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="container px-6 lg:px-12 mx-auto">
            <div className="flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Badge variant="outline" className="py-1.5 px-5 rounded-full text-primary border-primary/20 bg-primary/5 font-bold uppercase tracking-widest text-[10px] shadow-sm">
                  <Sparkles className="h-3 w-3 mr-2" /> The Future of Literacy
                </Badge>
                
                <h1 className="text-6xl lg:text-8xl font-headline font-black tracking-tighter leading-[0.85] text-slate-900">
                  Master Reading with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">AI Genius</span>
                </h1>
                
                <p className="max-w-2xl mx-auto text-slate-500 text-xl lg:text-2xl font-medium leading-relaxed">
                  Transform any document into a personalized interactive study ecosystem. Learn faster, remember longer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 w-full justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                <Button size="lg" className="h-16 px-12 rounded-[1.25rem] text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all group" asChild>
                  <Link href="/dashboard">
                    Start Learning Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-[1.25rem] text-lg font-bold border-2 hover:bg-slate-50 transition-all" asChild>
                  <Link href="#features">Explore Platform</Link>
                </Button>
              </div>

              <div className="flex flex-col items-center gap-4 pt-4 animate-in fade-in duration-1000 delay-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                      <img src={`https://picsum.photos/seed/user${i}/48/48`} alt="Trusted User" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <div className="flex text-orange-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p>Trusted by <span className="text-slate-900">2,000+</span> curious minds worldwide.</p>
                </div>
              </div>
            </div>

            {/* Visual Hero Mockup */}
            <div className="mt-24 relative max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-700">
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[4rem] opacity-30 blur-3xl" />
              <div className="relative bg-white p-2 md:p-4 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden group">
                <div className="aspect-[16/10] relative rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100">
                  <Image
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/edtech/1200/800"}
                    alt="SmartRead AI Interface"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                    priority
                    data-ai-hint="student study"
                  />
                  
                  {/* Floating UI Elements */}
                  <div className="absolute top-12 left-12 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4 animate-bounce duration-[3000ms]">
                    <div className="bg-green-500 h-12 w-12 rounded-2xl flex items-center justify-center text-white">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                      <p className="text-xl font-black text-slate-900">98.4%</p>
                    </div>
                  </div>

                  <div className="absolute bottom-12 right-12 bg-primary/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white/20 flex items-center gap-4">
                    <div className="bg-white/20 h-12 w-12 rounded-2xl flex items-center justify-center text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div className="text-white">
                      <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Active Streak</p>
                      <p className="text-xl font-black">12 Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-32 bg-slate-50/50">
          <div className="container px-6 lg:px-12 mx-auto">
            <div className="grid gap-16 lg:grid-cols-2 items-center mb-24">
              <div className="space-y-6">
                <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border-none font-bold uppercase tracking-widest text-[10px] py-1 px-4">Core Ecosystem</Badge>
                <h2 className="text-4xl lg:text-6xl font-headline font-black tracking-tighter text-slate-900 leading-none">
                  Academic Superpowers <br />
                  <span className="text-primary">Simplified.</span>
                </h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                  We've distilled complex cognitive science into simple, automated tools that work for you. No more endless scrolling—just active learning.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-900">Speed Quiz</h4>
                  <p className="text-sm text-slate-500">Rapid-fire recall tests.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-4 mt-8">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-900">AI Tutor</h4>
                  <p className="text-sm text-slate-500">24/7 dedicated support.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {[
                { icon: BrainCircuit, title: "Intelligent Quizzes", desc: "Adaptive assessments that target your unique knowledge gaps automatically.", color: "primary" },
                { icon: ShieldCheck, title: "Verified Content", desc: "AI-parsed material ensures accuracy based strictly on your source documents.", color: "accent" },
                { icon: BarChart3, title: "Growth Mapping", desc: "Visual analytics for students and parents to track mastery progression.", color: "primary" },
              ].map((f, i) => (
                <div key={i} className="group flex flex-col space-y-6 rounded-[3rem] bg-white p-12 transition-all hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 hover:-translate-y-2">
                  <div className={`p-5 w-fit bg-${f.color}/10 rounded-2xl text-${f.color}`}>
                    <f.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black font-headline text-slate-900">{f.title}</h3>
                  <p className="text-lg text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-20 border-t border-slate-100 bg-white relative z-10">
        <div className="container px-6 lg:px-12 mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
             <Link className="flex items-center gap-2.5" href="/">
               <div className="bg-primary p-2 rounded-xl text-white">
                 <BookOpen className="h-5 w-5" />
               </div>
               <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">SmartRead</span>
             </Link>
             <p className="text-slate-500 font-medium leading-relaxed">
               Empowering the next generation of scholars through personalized, AI-driven reading mastery.
             </p>
             <div className="flex gap-4">
                {[1,2,3].map(i => <div key={i} className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100" />)}
             </div>
          </div>
          
          <nav className="grid grid-cols-2 gap-20">
            <div className="space-y-6">
               <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Platform</p>
               <div className="flex flex-col gap-4">
                 <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#">Curriculum</Link>
                 <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#">Parent Portal</Link>
                 <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#">Teacher Hub</Link>
               </div>
            </div>
            <div className="space-y-6">
               <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Company</p>
               <div className="flex flex-col gap-4">
                 <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#">About Us</Link>
                 <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#">Security</Link>
                 <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#">Privacy Policy</Link>
               </div>
            </div>
          </nav>
        </div>
        <div className="container px-6 lg:px-12 mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">© 2026 developed by Ramiyaa S</p>
           <div className="flex gap-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: Operational</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version: 2.1.0</p>
           </div>
        </div>
      </footer>
    </div>
  );
}

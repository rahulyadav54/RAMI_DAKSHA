import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CheckCircle2, FileText, BrainCircuit, BarChart3, Sparkles } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-image");

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30">
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between container mx-auto sticky top-0 z-50 bg-white/70 backdrop-blur-md rounded-b-3xl">
        <Link className="flex items-center justify-center gap-3" href="/">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-foreground">SmartRead <span className="text-primary">AI</span></span>
        </Link>
        <nav className="hidden lg:flex gap-8 items-center">
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="#how-it-works">
            How it works
          </Link>
          <div className="flex items-center gap-4 border-l pl-8">
            <Button variant="ghost" className="font-bold" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button className="rounded-2xl h-11 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-16 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="container px-6 lg:px-12 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit py-1.5 px-4 rounded-full text-primary border-primary/20 bg-primary/5 font-bold uppercase tracking-widest text-[10px]">
                    <Sparkles className="h-3 w-3 mr-2" /> The Future of Literacy
                  </Badge>
                  <h1 className="text-5xl lg:text-7xl font-headline font-black tracking-tighter leading-[0.9] text-foreground">
                    Master Reading with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI Genius</span>
                  </h1>
                  <p className="max-w-[550px] text-muted-foreground text-xl lg:text-2xl font-medium leading-relaxed">
                    Upload any material and watch our AI transform it into a personalized interactive study ecosystem.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform" asChild>
                    <Link href="/dashboard">
                      Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-lg font-bold border-2" asChild>
                    <Link href="#features">Explore Platform</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-muted overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/40/40`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p>Join <span className="font-bold text-foreground">2,000+</span> students learning faster.</p>
                </div>
              </div>
              <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-accent rounded-[3rem] opacity-20 blur-3xl animate-pulse" />
                <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-primary/10 overflow-hidden transform hover:rotate-2 transition-transform duration-500">
                  <Image
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/edtech/1200/800"}
                    alt="SmartRead AI Interface"
                    width={800}
                    height={600}
                    className="rounded-[1.5rem] object-cover"
                    priority
                    data-ai-hint="student study"
                  />
                  <div className="absolute bottom-12 left-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-primary/10 flex items-center gap-4 animate-bounce">
                    <div className="bg-green-500 h-12 w-12 rounded-2xl flex items-center justify-center text-white">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mastery Level</p>
                      <p className="text-xl font-black text-foreground">Expert scholar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-24 lg:py-48 bg-white overflow-hidden">
          <div className="container px-6 lg:px-12 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-headline font-black tracking-tighter">Academic Superpowers</h2>
              <p className="max-w-[700px] text-muted-foreground text-xl lg:text-2xl leading-relaxed">
                We've combined advanced cognitive science with powerful LLMs to build the ultimate reading companion.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                { icon: BrainCircuit, title: "Intelligent Quizzes", desc: "Dynamic questions that adapt to your reading level and identify knowledge gaps." },
                { icon: CheckCircle2, title: "Semantic Feedback", desc: "Our AI understands the meaning behind your answers, not just the keywords." },
                { icon: BarChart3, title: "Deep Analytics", desc: "Visualize your growth with data-driven insights for students and parents." },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center space-y-6 rounded-[2rem] border-2 border-primary/5 bg-background p-10 transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  <div className="p-5 bg-primary/10 rounded-2xl text-primary">
                    <f.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black font-headline">{f.title}</h3>
                  <p className="text-lg text-muted-foreground text-center leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 border-t bg-muted/30">
        <div className="container px-6 lg:px-12 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
             <Link className="flex items-center gap-2" href="/">
               <BookOpen className="h-5 w-5 text-primary" />
               <span className="font-headline font-black text-xl tracking-tighter">SmartRead</span>
             </Link>
             <p className="text-sm text-muted-foreground max-w-[300px]">Empowering students through AI-driven reading mastery.</p>
          </div>
          <nav className="flex gap-12">
            <div className="flex flex-col gap-4">
               <p className="font-bold text-sm uppercase tracking-widest">Platform</p>
               <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Curriculum</Link>
               <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Parent Portal</Link>
            </div>
            <div className="flex flex-col gap-4">
               <p className="font-bold text-sm uppercase tracking-widest">Company</p>
               <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">About</Link>
               <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">Privacy</Link>
            </div>
          </nav>
        </div>
        <div className="container px-6 lg:px-12 mx-auto mt-12 pt-8 border-t text-center md:text-left">
           <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">© 2024 AI Smart Reading Tutor. Designed for Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
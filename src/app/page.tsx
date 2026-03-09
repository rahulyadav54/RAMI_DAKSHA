import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CheckCircle2, FileText, BrainCircuit, BarChart3 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-image");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between container mx-auto">
        <Link className="flex items-center justify-center gap-2" href="/">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-xl tracking-tighter">AI Smart Reading Tutor</span>
        </Link>
        <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            How it works
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Master Reading Comprehension with <span className="text-primary">AI Support</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl font-body">
                    Upload any text or PDF. Our AI generates personalized quizzes and evaluates your answers semantically to help you improve faster.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="px-8" asChild>
                    <Link href="/dashboard">
                      Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="px-8" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-2xl shadow-2xl transition-all hover:scale-[1.01]">
                <Image
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/edtech/1200/800"}
                  alt="Educational AI Platform"
                  width={600}
                  height={400}
                  className="object-cover"
                  priority
                  data-ai-hint="education technology"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/5 transition-colors" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Intelligent Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything students, parents, and teachers need to track and improve literacy.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">AI Quiz Generation</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Automatically generate MCQs, short answers, and true/false questions from any content.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Semantic Feedback</h3>
                <p className="text-sm text-muted-foreground text-center">
                  AI understands your unique answers and provides nuanced feedback on what was correct or missing.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Visualize progress with detailed dashboards for students, parents, and teachers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl">Simply Upload and Learn</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</div>
                    <div>
                      <h4 className="font-bold">Upload Content</h4>
                      <p className="text-muted-foreground">Paste text or upload PDF documents. Our AI extracts the core material instantly.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</div>
                    <div>
                      <h4 className="font-bold">Generate Quiz</h4>
                      <p className="text-muted-foreground">Select difficulty levels and question types. The AI builds a custom comprehension assessment.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</div>
                    <div>
                      <h4 className="font-bold">Get Instant Feedback</h4>
                      <p className="text-muted-foreground">Submit your answers and receive semantic evaluation and suggestions for improvement.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-8 rounded-3xl border">
                <div className="flex flex-col gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-3">
                    <FileText className="text-primary" />
                    <span className="text-sm font-medium">photosynthesis_article.pdf</span>
                    <span className="ml-auto text-xs text-green-600 font-bold uppercase">Extracted</span>
                  </div>
                  <div className="space-y-2 pt-4">
                    <p className="text-sm font-bold">Generated Question:</p>
                    <div className="bg-white p-4 rounded-lg shadow-inner text-sm italic">
                      "Explain photosynthesis in your own words focusing on the role of sunlight."
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Your Answer:</p>
                    <div className="bg-white p-4 rounded-lg shadow-inner text-sm">
                      "Plants use light to turn water into food for energy."
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start gap-3">
                    <div className="bg-green-100 p-1 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-green-800">Score: 85% - Great job!</p>
                      <p className="text-green-700">You correctly identified energy production. Consider mentioning chlorophyll next time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 border-t">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 AI Smart Reading Tutor. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
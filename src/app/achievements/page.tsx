
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, ShieldCheck, Zap, BookOpen, Clock } from "lucide-react";

const badges = [
  { name: "Speed Demon", description: "Completed 5 Speed Quizzes", icon: Zap, unlocked: true, progress: 100 },
  { name: "Literary Scholar", description: "Read 10,000 words", icon: BookOpen, unlocked: true, progress: 100 },
  { name: "Perfect Score", description: "Got 100% on a Standard Quiz", icon: Star, unlocked: true, progress: 100 },
  { name: "Early Bird", description: "Read before 8 AM", icon: Clock, unlocked: false, progress: 40 },
  { name: "Vocabulary King", description: "Mastered 50 new terms", icon: Trophy, unlocked: false, progress: 12 },
  { name: "Study Architect", description: "Generated 10 Study Guides", icon: ShieldCheck, unlocked: false, progress: 70 },
];

export default function AchievementsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-headline font-bold">Achievements</h1>
        <p className="text-muted-foreground text-lg">Collect badges and track your mastery milestones.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge, i) => (
          <Card key={i} className={`relative overflow-hidden border-2 transition-all hover:scale-[1.02] ${badge.unlocked ? 'border-primary/20 bg-primary/5 shadow-lg' : 'opacity-60 grayscale grayscale-50'}`}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`p-4 rounded-2xl ${badge.unlocked ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                <badge.icon className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline">{badge.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span>Progress</span>
                <span>{badge.progress}%</span>
              </div>
              <Progress value={badge.progress} className="h-2" />
              {!badge.unlocked && (
                <div className="absolute top-4 right-4 bg-muted px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">Locked</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30 border-none p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        <div className="bg-accent p-6 rounded-3xl text-white shadow-xl shadow-accent/20">
          <Trophy className="h-16 w-16" />
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-headline font-bold">The Ultimate Reader</h2>
          <p className="text-muted-foreground">Unlock all 12 legendary badges to earn the exclusive Academic Shield.</p>
          <div className="pt-4">
             <Progress value={25} className="h-4 bg-white" />
             <p className="text-xs mt-2 font-bold uppercase tracking-widest text-accent">3 of 12 Badges Earned</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

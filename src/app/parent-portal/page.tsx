
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, TrendingUp, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  { name: "Mon", sessions: 2 },
  { name: "Tue", sessions: 5 },
  { name: "Wed", sessions: 3 },
  { name: "Thu", sessions: 8 },
  { name: "Fri", sessions: 4 },
  { name: "Sat", sessions: 1 },
  { name: "Sun", sessions: 0 },
];

export default function ParentPortalPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-bold">Parent Portal</h1>
          <p className="text-muted-foreground text-lg">Monitoring Alex's academic growth and reading habits.</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-full">
          <Mail className="h-4 w-4" /> Share Progress Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-xl border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline">Activity Frequency</CardTitle>
            <CardDescription>Number of AI study sessions per day this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-green-100 p-2 rounded-lg h-fit">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">Comprehension is up</p>
                <p className="text-xs text-muted-foreground">Alex improved his vocabulary score by 12% this week.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-100 p-2 rounded-lg h-fit">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">Consistent Study</p>
                <p className="text-xs text-muted-foreground">Alex has logged in 5 days in a row.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-orange-100 p-2 rounded-lg h-fit">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">Suggested Focus</p>
                <p className="text-xs text-muted-foreground">Scientific articles seem to take Alex longer to process.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Users className="h-5 w-5" /> Family Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-muted rounded-full" />
                   <div>
                     <p className="text-sm font-bold">Alex Newman</p>
                     <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Student</p>
                   </div>
                 </div>
                 <Badge variant="secondary">Grade 9</Badge>
              </div>
              <Button className="w-full rounded-xl" variant="outline">Add Family Member</Button>
            </CardContent>
         </Card>

         <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">Family Premium Plan</p>
              <p className="text-xs text-muted-foreground">Unlimited GenAI processing and advanced parent analytics are active.</p>
              <div className="pt-2">
                <Badge className="bg-green-600">Active</Badge>
              </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserCheck, UserX, UserPlus, Mail, Filter, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function ClassroomPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "users"), where("role", "==", "student"));
    return onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
  }, [user, db]);

  const handleApprove = async (id: string, approved: boolean) => {
    if (!db) return;
    await updateDoc(doc(db, "users", id), { approved });
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto p-4 md:p-12 space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold">Classroom Management</h1>
          <p className="text-muted-foreground">Manage your student roster and account approvals.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button className="rounded-xl"><UserPlus className="h-4 w-4 mr-2" /> Invite Student</Button>
        </div>
      </div>

      <div className="grid gap-6">
        {students.length > 0 ? students.map((student) => (
          <Card key={student.id} className="rounded-3xl shadow-lg border-none overflow-hidden group transition-all hover:shadow-xl">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16 border-4 border-primary/10">
                  <AvatarImage src={`https://picsum.photos/seed/${student.id}/100/100`} />
                  <AvatarFallback>{student.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{student.displayName}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</span>
                    <Badge variant={student.approved ? "default" : "outline"} className="rounded-full">
                      {student.approved ? "Approved" : "Pending Approval"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {!student.approved ? (
                  <Button size="sm" className="rounded-xl bg-green-500 hover:bg-green-600" onClick={() => handleApprove(student.id, true)}>
                    <UserCheck className="h-4 w-4 mr-2" /> Approve
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="rounded-xl border-destructive text-destructive hover:bg-destructive/5" onClick={() => handleApprove(student.id, false)}>
                    <UserX className="h-4 w-4 mr-2" /> Revoke
                  </Button>
                )}
                <Button size="sm" variant="secondary" className="rounded-xl gap-2" asChild>
                  <Link href={`/teacher/classroom/${student.id}`}>
                    <BarChart2 className="h-4 w-4" /> View Stats
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed">
            <p className="text-muted-foreground">No students found in your roster.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Mic, Volume2, Sparkles, Languages, History, BrainCircuit, Search } from "lucide-react";
import { characterChat } from "@/ai/flows/character-chat";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CHARACTERS = [
  { 
    id: 'einstein', 
    name: 'Albert Einstein', 
    title: 'Theoretical Physicist',
    bio: 'A curious and eccentric theoretical physicist who explains complex things with simple metaphors and a bit of humor. I love talking about time, space, and why imagination is more important than knowledge!', 
    avatar: 'https://picsum.photos/seed/einstein/200/200',
    color: 'from-blue-500 to-indigo-600',
    greeting: "Greetings, young explorer! Ready to unravel the mysteries of the universe?"
  },
  { 
    id: 'athena', 
    name: 'Athena', 
    title: 'Goddess of Wisdom',
    bio: 'The Greek goddess of wisdom and strategy. Wise, noble, and speaks with authoritative kindness. I am here to guide your strategic thinking and help you find the path of truth.', 
    avatar: 'https://picsum.photos/seed/athena/200/200',
    color: 'from-yellow-500 to-orange-600',
    greeting: "Mortal, you seek wisdom? Speak, and we shall find the most strategic path together."
  },
  { 
    id: 'sherlock', 
    name: 'Sherlock Holmes', 
    title: 'Master Detective',
    bio: 'A brilliant detective who notices every detail. Analytical, slightly aloof, but incredibly helpful. I observe everything and deduce the truth from the smallest clues.', 
    avatar: 'https://picsum.photos/seed/sherlock/200/200',
    color: 'from-slate-700 to-slate-900',
    greeting: "The game is afoot! What puzzle have you brought for me to solve today?"
  },
  { 
    id: 'davinci', 
    name: 'Leonardo da Vinci', 
    title: 'Renaissance Master',
    bio: 'A polymath of the Renaissance. I am a painter, engineer, and scientist. I see art in science and science in art. Let us explore the beauty of invention!', 
    avatar: 'https://picsum.photos/seed/davinci/200/200',
    color: 'from-emerald-600 to-teal-800',
    greeting: "Ah, another curious mind! Shall we sketch out a new invention or discuss the anatomy of a flower?"
  },
];

export default function CharacterChatPage() {
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await characterChat({
        characterName: selectedChar.name,
        characterBio: selectedChar.bio,
        message: userMsg,
        history: messages
      });
      setMessages(prev => [...prev, { role: 'model', content: response.response }]);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "The character is deep in thought. Try again!" });
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedChar.id === 'einstein') {
        utterance.pitch = 1.1;
        utterance.rate = 0.9;
      } else if (selectedChar.id === 'athena') {
        utterance.pitch = 0.9;
        utterance.rate = 0.95;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-2rem)] flex flex-col max-w-6xl gap-6 animate-in fade-in duration-700">
      
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {CHARACTERS.map(char => (
          <button 
            key={char.id} 
            onClick={() => { 
              setSelectedChar(char); 
              setMessages([]); 
              window.speechSynthesis.cancel();
            }}
            className={cn(
              "flex-shrink-0 flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-300 border-2",
              selectedChar.id === char.id 
                ? "bg-white border-primary shadow-xl scale-105" 
                : "bg-white/50 border-transparent hover:bg-white hover:border-muted grayscale-[50%] hover:grayscale-0"
            )}
          >
            <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
              <AvatarImage src={char.avatar} />
              <AvatarFallback>{char.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="font-headline font-bold text-sm leading-tight">{char.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{char.title}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6 overflow-hidden">
        
        <Card className="hidden lg:flex flex-col border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-white to-muted/20 overflow-hidden">
          <div className={cn("h-32 w-full bg-gradient-to-r relative", selectedChar.color)}>
             <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          </div>
          <div className="-mt-16 px-8 pb-8 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-32 w-32 border-8 border-white shadow-2xl">
              <AvatarImage src={selectedChar.avatar} />
              <AvatarFallback>{selectedChar.name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-headline font-black">{selectedChar.name}</h2>
              <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary uppercase tracking-widest text-[10px] font-bold">
                {selectedChar.title}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{selectedChar.bio}"
            </p>
            <div className="pt-6 w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                <span>Knowledge Base</span>
                <span>Expert</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full w-[95%] bg-gradient-to-r", selectedChar.color)} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white relative">
          <CardHeader className={cn("bg-gradient-to-r p-6 text-white flex flex-row items-center justify-between", selectedChar.color)}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">Living History Chat</CardTitle>
                <p className="text-xs text-white/70">Powered by SmartRead Personality Engine</p>
              </div>
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setMessages([])}>
                 <History className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
                 <Search className="h-5 w-5" />
               </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-slate-50/30">
            <ScrollArea className="flex-1 p-6 md:p-10">
              <div className="space-y-8">
                {messages.length === 0 && (
                  <div className="text-center py-20 space-y-6 animate-in fade-in zoom-in-95 duration-1000">
                    <div className={cn("h-20 w-20 mx-auto rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3", selectedChar.color)}>
                      <Languages className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black font-headline">Conversation Awaits</h3>
                      <p className="text-muted-foreground max-w-xs mx-auto text-lg leading-relaxed">
                        {selectedChar.greeting}
                      </p>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex gap-4 animate-in slide-in-from-bottom-4 duration-500",
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  )}>
                    <Avatar className={cn(
                      "h-10 w-10 mt-1 shadow-md",
                      msg.role === 'model' ? "bg-white border-2 border-primary/10" : "bg-primary"
                    )}>
                      {msg.role === 'model' ? (
                        <AvatarImage src={selectedChar.avatar} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-white">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <AvatarFallback>{msg.role === 'model' ? selectedChar.name[0] : 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="relative group max-w-[80%]">
                      <div className={cn(
                        "rounded-[1.5rem] p-5 text-sm md:text-base shadow-lg leading-relaxed",
                        msg.role === 'model' 
                          ? 'bg-white text-foreground rounded-tl-none border-t border-l border-primary/5' 
                          : 'bg-primary text-primary-foreground rounded-tr-none'
                      )}>
                        {msg.content}
                      </div>
                      
                      {msg.role === 'model' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-xl rounded-full text-primary hover:text-primary hover:bg-muted"
                          onClick={() => speak(msg.content)}
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <Avatar className="bg-white border-2 border-primary/10 h-10 w-10 shadow-md">
                      <AvatarImage src={selectedChar.avatar} />
                    </Avatar>
                    <div className="bg-white p-5 rounded-[1.5rem] rounded-tl-none shadow-lg flex gap-1.5 items-center">
                      <span className={cn("h-2.5 w-2.5 rounded-full animate-bounce", selectedChar.color.split(' ')[0].replace('from-', 'bg-'))} />
                      <span className={cn("h-2.5 w-2.5 rounded-full animate-bounce [animation-delay:0.2s]", selectedChar.color.split(' ')[0].replace('from-', 'bg-'))} />
                      <span className={cn("h-2.5 w-2.5 rounded-full animate-bounce [animation-delay:0.4s]", selectedChar.color.split(' ')[0].replace('from-', 'bg-'))} />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-6 md:p-8 bg-white border-t">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                className="flex gap-4 items-center bg-muted/30 p-2 rounded-[2rem] border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all"
              >
                <div className="pl-4">
                   <Sparkles className="h-5 w-5 text-primary/40" />
                </div>
                <Input 
                  placeholder={`Speak with ${selectedChar.name.split(' ')[0]}...`} 
                  className="flex-1 h-12 rounded-full border-none bg-transparent text-lg focus-visible:ring-0 shadow-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn("h-12 w-12 rounded-full shadow-xl transition-transform active:scale-95", selectedChar.color)}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
              <div className="flex justify-center mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                   Conversations are analyzed for learning insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
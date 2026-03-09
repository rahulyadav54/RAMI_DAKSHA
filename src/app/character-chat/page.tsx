'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Volume2, Sparkles, BrainCircuit, History, Info } from "lucide-react";
import { characterChat } from "@/ai/flows/character-chat";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CHARACTERS = [
  { 
    id: 'einstein', 
    name: 'Albert Einstein', 
    title: 'Theoretical Physicist',
    bio: 'I am a theoretical physicist who loves to explain the beauty of the universe using simple metaphors. Imagination is more important than knowledge!', 
    avatar: 'https://picsum.photos/seed/einstein/400/400',
    color: 'from-blue-600 to-indigo-700',
    accent: 'text-blue-500',
    bg: 'bg-blue-50',
    greeting: "Greetings, young explorer! Ready to unravel the mysteries of time and space together? What puzzle is on your mind?"
  },
  { 
    id: 'athena', 
    name: 'Athena', 
    title: 'Goddess of Wisdom',
    bio: 'I am the goddess of wisdom and strategic warfare. I value truth, strategy, and noble pursuits above all else.', 
    avatar: 'https://picsum.photos/seed/athena/400/400',
    color: 'from-amber-500 to-orange-600',
    accent: 'text-amber-500',
    bg: 'bg-amber-50',
    greeting: "Mortal, you seek the path of wisdom? Speak, and let us devise a strategy to conquer the challenges before you."
  },
  { 
    id: 'sherlock', 
    name: 'Sherlock Holmes', 
    title: 'Master Detective',
    bio: 'I am the world\'s only consulting detective. I observe everything and deduce the truth from the smallest, most insignificant clues.', 
    avatar: 'https://picsum.photos/seed/sherlock/400/400',
    color: 'from-slate-700 to-slate-900',
    accent: 'text-slate-600',
    bg: 'bg-slate-50',
    greeting: "The game is afoot! What intriguing mystery or deduction have you brought to my doorstep today?"
  },
  { 
    id: 'davinci', 
    name: 'Leonardo da Vinci', 
    title: 'Renaissance Master',
    bio: 'I am an artist, inventor, and student of nature. I believe everything is connected. Shall we explore the engineering of a bird\'s wing?', 
    avatar: 'https://picsum.photos/seed/davinci/400/400',
    color: 'from-emerald-600 to-teal-800',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    greeting: "Ah, another curious soul! Shall we sketch out a new invention or discuss the divine geometry found in a simple leaf?"
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
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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
      toast({ 
        variant: "destructive", 
        title: "Connection Lost", 
        description: `${selectedChar.name} is deep in thought. Please try again!` 
      });
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
        utterance.pitch = 0.85;
        utterance.rate = 0.95;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Dynamic Header - Character Switcher */}
      <header className="bg-white border-b px-4 md:px-8 h-16 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[70%]">
          {CHARACTERS.map(char => (
            <button 
              key={char.id} 
              onClick={() => { 
                setSelectedChar(char); 
                setMessages([]); 
                window.speechSynthesis.cancel();
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all whitespace-nowrap border",
                selectedChar.id === char.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={char.avatar} />
                <AvatarFallback>{char.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-headline font-bold text-[10px] uppercase tracking-tight">{char.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="rounded-full font-bold text-[10px] h-8" onClick={() => setMessages([])}>
          <History className="h-3 w-3 mr-1" /> Clear
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Character Bio */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div className={cn("h-32 w-full rounded-2xl bg-gradient-to-br flex items-center justify-center p-3 shadow-inner", selectedChar.color)}>
              <Avatar className="h-20 w-20 border-2 border-white shadow-lg">
                <AvatarImage src={selectedChar.avatar} />
                <AvatarFallback>{selectedChar.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-headline font-black text-slate-900 leading-tight">{selectedChar.name}</h2>
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                {selectedChar.title}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 italic text-slate-600 text-xs leading-relaxed">
              "{selectedChar.bio}"
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Capabilities</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500 text-[9px]">History</Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500 text-[9px]">Wisdom</Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500 text-[9px]">Logic</Badge>
            </div>
          </div>
        </aside>

        {/* Main Chat Interface */}
        <main className="flex-1 flex flex-col relative bg-white">
          <ScrollArea className="flex-1 px-4 md:px-8">
            <div className="max-w-3xl mx-auto py-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 rotate-3", selectedChar.color)}>
                    <Bot className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-headline font-black text-slate-900 tracking-tight mb-2">The legend is listening...</h3>
                  <p className="text-base text-slate-500 font-medium max-w-md">
                    {selectedChar.greeting}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                )}>
                  <Avatar className={cn(
                    "h-8 w-8 shrink-0 shadow-md border border-white mt-1",
                    msg.role === 'model' ? "bg-white" : "bg-slate-900"
                  )}>
                    {msg.role === 'model' ? (
                      <AvatarImage src={selectedChar.avatar} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white bg-slate-900">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <AvatarFallback>{msg.role === 'model' ? selectedChar.name[0] : 'U'}</AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm border",
                      msg.role === 'model' 
                        ? 'bg-white text-slate-800 rounded-tl-none border-slate-100' 
                        : 'bg-slate-900 text-white rounded-tr-none border-slate-900'
                    )}>
                      {msg.content}
                    </div>
                    {msg.role === 'model' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary h-6"
                        onClick={() => speak(msg.content)}
                      >
                        <Volume2 className="h-2.5 w-2.5 mr-1" /> Speak
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0 shadow-md border border-white bg-white">
                    <AvatarImage src={selectedChar.avatar} />
                  </Avatar>
                  <div className="bg-white p-3 px-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} className="h-4" />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
            <div className="max-w-3xl mx-auto">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                className="flex gap-2 items-center bg-slate-100 p-1.5 rounded-full border border-transparent focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-md transition-all duration-300"
              >
                <Input 
                  placeholder={`Speak with ${selectedChar.name.split(' ')[0]}...`} 
                  className="flex-1 h-10 rounded-full border-none bg-transparent text-sm focus-visible:ring-0 shadow-none px-4"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn("h-10 w-10 rounded-full shadow-md transition-transform active:scale-95", selectedChar.color)}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-center mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center justify-center gap-1">
                 <BrainCircuit className="h-2 w-2" /> SmartRead Legend Engine
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

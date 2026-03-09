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
      <header className="bg-white border-b px-4 md:px-8 h-20 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar max-w-[70%]">
          {CHARACTERS.map(char => (
            <button 
              key={char.id} 
              onClick={() => { 
                setSelectedChar(char); 
                setMessages([]); 
                window.speechSynthesis.cancel();
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap border-2",
                selectedChar.id === char.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-md scale-105" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={char.avatar} />
                <AvatarFallback>{char.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-headline font-bold text-xs uppercase tracking-tight">{char.name}</span>
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="rounded-full font-bold text-xs" onClick={() => setMessages([])}>
          <History className="h-4 w-4 mr-2" /> Clear
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Character Bio */}
        <aside className="hidden lg:flex flex-col w-80 bg-white border-r p-8 space-y-8 overflow-y-auto">
          <div className="space-y-6">
            <div className={cn("h-48 w-full rounded-3xl bg-gradient-to-br flex items-center justify-center p-4 shadow-inner", selectedChar.color)}>
              <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                <AvatarImage src={selectedChar.avatar} />
                <AvatarFallback>{selectedChar.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-headline font-black text-slate-900">{selectedChar.name}</h2>
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                {selectedChar.title}
              </Badge>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
              "{selectedChar.bio}"
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">History</Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">Wisdom</Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">Logic</Badge>
            </div>
          </div>
        </aside>

        {/* Main Chat Interface */}
        <main className="flex-1 flex flex-col relative bg-white">
          <ScrollArea className="flex-1 px-4 md:px-12">
            <div className="max-w-4xl mx-auto py-12 space-y-12">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
                  <div className={cn("h-24 w-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl mb-8 rotate-3", selectedChar.color)}>
                    <Bot className="h-12 w-12" />
                  </div>
                  <h3 className="text-4xl font-headline font-black text-slate-900 tracking-tight mb-4">The legend is listening...</h3>
                  <p className="text-xl text-slate-500 font-medium max-w-lg">
                    {selectedChar.greeting}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500",
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                )}>
                  <Avatar className={cn(
                    "h-12 w-12 shrink-0 shadow-lg border-2 border-white mt-1",
                    msg.role === 'model' ? "bg-white" : "bg-slate-900"
                  )}>
                    {msg.role === 'model' ? (
                      <AvatarImage src={selectedChar.avatar} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white bg-slate-900">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <AvatarFallback>{msg.role === 'model' ? selectedChar.name[0] : 'U'}</AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "flex flex-col max-w-[85%] sm:max-w-[80%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-6 rounded-[2rem] text-lg leading-relaxed shadow-sm border",
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
                        className="mt-3 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary h-8"
                        onClick={() => speak(msg.content)}
                      >
                        <Volume2 className="h-3 w-3 mr-2" /> Listen to Voice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 md:gap-6">
                  <Avatar className="h-12 w-12 shrink-0 shadow-lg border-2 border-white bg-white">
                    <AvatarImage src={selectedChar.avatar} />
                  </Avatar>
                  <div className="bg-white p-6 rounded-[2rem] rounded-tl-none shadow-sm border border-slate-100 flex gap-2 items-center">
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} className="h-12" />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-6 md:p-10 bg-white border-t border-slate-100 shrink-0">
            <div className="max-w-4xl mx-auto">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                className="flex gap-4 items-center bg-slate-100 p-2 rounded-full border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-xl transition-all duration-300"
              >
                <Input 
                  placeholder={`Speak with ${selectedChar.name.split(' ')[0]}...`} 
                  className="flex-1 h-12 md:h-14 rounded-full border-none bg-transparent text-base md:text-lg focus-visible:ring-0 shadow-none px-6"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn("h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg transition-transform active:scale-90", selectedChar.color)}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-6 w-6" />
                </Button>
              </form>
              <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center justify-center gap-2">
                 <BrainCircuit className="h-3 w-3" /> SmartRead Legend Engine
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Volume2, Sparkles, Languages, History, BrainCircuit, Search, ArrowLeft, Lightbulb } from "lucide-react";
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
    accent: 'bg-indigo-500',
    greeting: "Greetings, young explorer! Ready to unravel the mysteries of time and space together? What puzzle is on your mind?"
  },
  { 
    id: 'athena', 
    name: 'Athena', 
    title: 'Goddess of Wisdom',
    bio: 'I am the goddess of wisdom and strategic warfare. I value truth, strategy, and noble pursuits above all else.', 
    avatar: 'https://picsum.photos/seed/athena/400/400',
    color: 'from-amber-500 to-orange-600',
    accent: 'bg-amber-500',
    greeting: "Mortal, you seek the path of wisdom? Speak, and let us devise a strategy to conquer the challenges before you."
  },
  { 
    id: 'sherlock', 
    name: 'Sherlock Holmes', 
    title: 'Master Detective',
    bio: 'I am the world\'s only consulting detective. I observe everything and deduce the truth from the smallest, most insignificant clues.', 
    avatar: 'https://picsum.photos/seed/sherlock/400/400',
    color: 'from-slate-700 to-slate-900',
    accent: 'bg-slate-700',
    greeting: "The game is afoot! What intriguing mystery or deduction have you brought to my doorstep today?"
  },
  { 
    id: 'davinci', 
    name: 'Leonardo da Vinci', 
    title: 'Renaissance Master',
    bio: 'I am an artist, inventor, and student of nature. I believe everything is connected. Shall we explore the engineering of a bird\'s wing?', 
    avatar: 'https://picsum.photos/seed/davinci/400/400',
    color: 'from-emerald-600 to-teal-800',
    accent: 'bg-emerald-600',
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
    <div className="flex flex-col h-screen bg-slate-50/50 overflow-hidden">
      {/* Dynamic Header Character Selector */}
      <header className="bg-white border-b px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
          {CHARACTERS.map(char => (
            <button 
              key={char.id} 
              onClick={() => { 
                setSelectedChar(char); 
                setMessages([]); 
                window.speechSynthesis.cancel();
              }}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap border-2",
                selectedChar.id === char.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Avatar className="h-6 w-6 border border-white/20">
                <AvatarImage src={char.avatar} />
                <AvatarFallback>{char.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-headline font-bold text-xs uppercase tracking-tight">{char.name}</span>
            </button>
          ))}
        </div>
        <div className="hidden md:flex gap-2">
           <Button variant="outline" size="sm" className="rounded-full border-slate-200 h-10 px-6 font-bold text-xs text-slate-500" onClick={() => setMessages([])}>
             <History className="h-4 w-4 mr-2" /> Reset Chat
           </Button>
        </div>
      </header>

      <div className="flex-1 flex container mx-auto p-4 md:p-6 gap-6 overflow-hidden">
        
        {/* Character Info Sidebar (Left) */}
        <Card className="hidden lg:flex flex-col w-80 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden shrink-0">
          <div className={cn("h-48 w-full bg-gradient-to-br relative", selectedChar.color)}>
             <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
             <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                <Avatar className="h-28 w-28 border-8 border-white shadow-2xl">
                  <AvatarImage src={selectedChar.avatar} />
                  <AvatarFallback>{selectedChar.name[0]}</AvatarFallback>
                </Avatar>
             </div>
          </div>
          <div className="mt-16 px-8 pb-10 flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">{selectedChar.name}</h2>
              <Badge className="rounded-full px-4 py-1 bg-slate-100 text-slate-500 uppercase tracking-[0.2em] text-[10px] font-black border-none">
                {selectedChar.title}
              </Badge>
            </div>
            
            <ScrollArea className="h-40 w-full px-2">
              <p className="text-sm text-slate-500 leading-relaxed italic font-medium">
                "{selectedChar.bio}"
              </p>
            </ScrollArea>

            <div className="pt-4 w-full space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Persona Depth</span>
                  <span className="text-slate-900">98%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full w-[98%] transition-all duration-1000", selectedChar.accent)} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                 <Badge variant="outline" className="rounded-full bg-white text-slate-400 border-slate-100 px-4 py-1 font-bold text-[10px]">HISTORY</Badge>
                 <Badge variant="outline" className="rounded-full bg-white text-slate-400 border-slate-100 px-4 py-1 font-bold text-[10px]">WISDOM</Badge>
                 <Badge variant="outline" className="rounded-full bg-white text-slate-400 border-slate-100 px-4 py-1 font-bold text-[10px]">LOGIC</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-2xl border-none overflow-hidden rounded-[3rem] bg-white relative">
          {/* Internal Header for Mobile/Tablet */}
          <div className={cn("lg:hidden p-5 text-white flex items-center justify-between shrink-0", selectedChar.color)}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src={selectedChar.avatar} />
                <AvatarFallback>{selectedChar.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-headline font-bold text-sm leading-none">{selectedChar.name}</h3>
                <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">{selectedChar.title}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setMessages([])}>
              <History className="h-5 w-5" />
            </Button>
          </div>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-slate-50/20">
            <ScrollArea className="flex-1 p-6 md:p-10">
              <div className="max-w-4xl mx-auto space-y-10">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center animate-in fade-in zoom-in-95 duration-1000">
                    <div className={cn("h-24 w-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3 mb-10", selectedChar.color)}>
                      <Bot className="h-12 w-12" />
                    </div>
                    <div className="space-y-4 px-6">
                      <h3 className="text-3xl md:text-5xl font-black font-headline text-slate-900 tracking-tighter">Start the Legend</h3>
                      <p className="text-slate-500 max-w-lg mx-auto text-lg md:text-2xl leading-relaxed font-medium">
                        {selectedChar.greeting}
                      </p>
                    </div>
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex gap-4 md:gap-6 animate-in slide-in-from-bottom-6 duration-500",
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  )}>
                    <Avatar className={cn(
                      "h-12 w-12 mt-1 shadow-lg shrink-0",
                      msg.role === 'model' ? "bg-white border-2 border-slate-100" : "bg-slate-900"
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
                    
                    <div className="relative group flex flex-col max-w-[85%] md:max-w-[70%]">
                      <div className={cn(
                        "rounded-[2.5rem] p-6 md:p-8 text-base md:text-xl shadow-xl leading-relaxed border-2",
                        msg.role === 'model' 
                          ? 'bg-white text-slate-800 rounded-tl-none border-white' 
                          : 'bg-slate-900 text-white rounded-tr-none border-slate-900'
                      )}>
                        {msg.content}
                      </div>
                      
                      {msg.role === 'model' && (
                        <div className="mt-3 flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 h-10 px-4 font-bold text-[10px] tracking-widest uppercase"
                            onClick={() => speak(msg.content)}
                          >
                            <Volume2 className="h-4 w-4 mr-2" /> Listen to Voice
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4 md:gap-6">
                    <Avatar className="bg-white border-2 border-slate-100 h-12 w-12 shadow-lg shrink-0">
                      <AvatarImage src={selectedChar.avatar} />
                    </Avatar>
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] rounded-tl-none shadow-xl border-2 border-white flex gap-2 items-center">
                      <span className={cn("h-3 w-3 rounded-full animate-pulse", selectedChar.accent)} />
                      <span className={cn("h-3 w-3 rounded-full animate-pulse [animation-delay:0.2s]", selectedChar.accent)} />
                      <span className={cn("h-3 w-3 rounded-full animate-pulse [animation-delay:0.4s]", selectedChar.accent)} />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} className="h-10" />
              </div>
            </ScrollArea>

            {/* Input Section */}
            <div className="p-6 md:p-10 bg-white border-t shrink-0">
              <div className="max-w-4xl mx-auto">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                  className="flex gap-4 items-center bg-slate-100 p-2.5 rounded-full border-2 border-transparent focus-within:border-slate-900/10 focus-within:bg-white focus-within:shadow-2xl transition-all duration-500"
                >
                  <div className="pl-5">
                     <Sparkles className="h-7 w-7 text-slate-300" />
                  </div>
                  <Input 
                    placeholder={`Speak with ${selectedChar.name.split(' ')[0]}...`} 
                    className="flex-1 h-14 rounded-full border-none bg-transparent text-lg md:text-xl font-medium focus-visible:ring-0 shadow-none placeholder:text-slate-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className={cn("h-14 w-14 rounded-full shadow-2xl transition-all active:scale-90 hover:scale-105 shrink-0", selectedChar.color)}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-7 w-7" />
                  </Button>
                </form>
                <div className="flex justify-center mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-2">
                     <BrainCircuit className="h-3 w-3" /> SmartRead Advanced Personality Engine
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


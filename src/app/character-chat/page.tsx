'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Mic, Volume2, Sparkles, Languages, History, BrainCircuit, Search, ArrowLeft } from "lucide-react";
import { characterChat } from "@/ai/flows/character-chat";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CHARACTERS = [
  { 
    id: 'einstein', 
    name: 'Albert Einstein', 
    title: 'Theoretical Physicist',
    bio: 'A curious and eccentric theoretical physicist who explains complex things with simple metaphors and a bit of humor. I love talking about time, space, and why imagination is more important than knowledge!', 
    avatar: 'https://picsum.photos/seed/einstein/400/400',
    color: 'from-blue-600 to-indigo-700',
    accent: 'bg-indigo-500',
    greeting: "Greetings, young explorer! Ready to unravel the mysteries of the universe?"
  },
  { 
    id: 'athena', 
    name: 'Athena', 
    title: 'Goddess of Wisdom',
    bio: 'The Greek goddess of wisdom and strategy. Wise, noble, and speaks with authoritative kindness. I am here to guide your strategic thinking and help you find the path of truth.', 
    avatar: 'https://picsum.photos/seed/athena/400/400',
    color: 'from-amber-500 to-orange-600',
    accent: 'bg-amber-500',
    greeting: "Mortal, you seek wisdom? Speak, and we shall find the most strategic path together."
  },
  { 
    id: 'sherlock', 
    name: 'Sherlock Holmes', 
    title: 'Master Detective',
    bio: 'A brilliant detective who notices every detail. Analytical, slightly aloof, but incredibly helpful. I observe everything and deduce the truth from the smallest clues.', 
    avatar: 'https://picsum.photos/seed/sherlock/400/400',
    color: 'from-slate-700 to-slate-900',
    accent: 'bg-slate-700',
    greeting: "The game is afoot! What puzzle have you brought for me to solve today?"
  },
  { 
    id: 'davinci', 
    name: 'Leonardo da Vinci', 
    title: 'Renaissance Master',
    bio: 'A polymath of the Renaissance. I am a painter, engineer, and scientist. I see art in science and science in art. Let us explore the beauty of invention!', 
    avatar: 'https://picsum.photos/seed/davinci/400/400',
    color: 'from-emerald-600 to-teal-800',
    accent: 'bg-emerald-600',
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
    <div className="flex flex-col h-screen bg-slate-50/50">
      {/* Dynamic Header Character Selector */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
          {CHARACTERS.map(char => (
            <button 
              key={char.id} 
              onClick={() => { 
                setSelectedChar(char); 
                setMessages([]); 
                window.speechSynthesis.cancel();
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 whitespace-nowrap border-2",
                selectedChar.id === char.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg scale-105" 
                  : "bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200"
              )}
            >
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarImage src={char.avatar} />
                <AvatarFallback>{char.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-headline font-bold text-sm">{char.name}</span>
            </button>
          ))}
        </div>
        <div className="hidden md:flex gap-2 ml-4">
           <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => setMessages([])}>
             <History className="h-4 w-4 mr-2" /> Clear Chat
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden container mx-auto p-4 md:p-6 gap-6">
        
        {/* Character Info Card (Left) */}
        <Card className="hidden lg:flex flex-col w-80 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden shrink-0">
          <div className={cn("h-40 w-full bg-gradient-to-br relative", selectedChar.color)}>
             <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <Avatar className="h-24 w-24 border-4 border-white shadow-2xl">
                  <AvatarImage src={selectedChar.avatar} />
                  <AvatarFallback>{selectedChar.name[0]}</AvatarFallback>
                </Avatar>
             </div>
          </div>
          <div className="mt-14 px-8 pb-8 flex flex-col items-center text-center space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-headline font-black text-slate-900">{selectedChar.name}</h2>
              <Badge variant="secondary" className="rounded-full px-3 py-0.5 bg-slate-100 text-slate-600 uppercase tracking-widest text-[10px] font-bold border-none">
                {selectedChar.title}
              </Badge>
            </div>
            
            <ScrollArea className="h-40 w-full pr-2">
              <p className="text-sm text-slate-500 leading-relaxed italic">
                "{selectedChar.bio}"
              </p>
            </ScrollArea>

            <div className="pt-4 w-full space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Persona Depth</span>
                  <span>98%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full w-[98%] transition-all duration-1000", selectedChar.accent)} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                 <Badge className="rounded-full bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100 transition-colors">History</Badge>
                 <Badge className="rounded-full bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100 transition-colors">Wisdom</Badge>
                 <Badge className="rounded-full bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100 transition-colors">Voice</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Chat Interface (Center/Right) */}
        <Card className="flex-1 flex flex-col shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white relative">
          <CardHeader className={cn("p-6 text-white flex flex-row items-center justify-between transition-colors duration-500 shrink-0", selectedChar.color)}>
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
               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
                 <Search className="h-5 w-5" />
               </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-slate-50/30">
            <ScrollArea className="flex-1 p-6 md:p-10">
              <div className="max-w-4xl mx-auto space-y-8">
                {messages.length === 0 && (
                  <div className="text-center py-20 space-y-6 animate-in fade-in zoom-in-95 duration-1000">
                    <div className={cn("h-24 w-24 mx-auto rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3", selectedChar.color)}>
                      <Languages className="h-12 w-12" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Conversation Awaits</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
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
                      "h-12 w-12 mt-1 shadow-md shrink-0",
                      msg.role === 'model' ? "bg-white border-2 border-slate-100" : "bg-slate-900"
                    )}>
                      {msg.role === 'model' ? (
                        <AvatarImage src={selectedChar.avatar} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-white">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <AvatarFallback>{msg.role === 'model' ? selectedChar.name[0] : 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="relative group max-w-[85%] md:max-w-[75%]">
                      <div className={cn(
                        "rounded-[2rem] p-6 text-base md:text-lg shadow-sm leading-relaxed",
                        msg.role === 'model' 
                          ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
                          : 'bg-slate-900 text-white rounded-tr-none'
                      )}>
                        {msg.content}
                      </div>
                      
                      {msg.role === 'model' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-lg rounded-full text-slate-900 hover:text-slate-900 hover:bg-slate-100"
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
                    <Avatar className="bg-white border-2 border-slate-100 h-12 w-12 shadow-md">
                      <AvatarImage src={selectedChar.avatar} />
                    </Avatar>
                    <div className="bg-white p-6 rounded-[2rem] rounded-tl-none shadow-sm flex gap-2 items-center">
                      <span className={cn("h-3 w-3 rounded-full animate-bounce", selectedChar.accent)} />
                      <span className={cn("h-3 w-3 rounded-full animate-bounce [animation-delay:0.2s]", selectedChar.accent)} />
                      <span className={cn("h-3 w-3 rounded-full animate-bounce [animation-delay:0.4s]", selectedChar.accent)} />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Section */}
            <div className="p-6 md:p-8 bg-white border-t">
              <div className="max-w-4xl mx-auto">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                  className="flex gap-4 items-center bg-slate-100 p-2 rounded-[2.5rem] border-2 border-transparent focus-within:border-slate-900/10 focus-within:bg-white focus-within:shadow-xl transition-all"
                >
                  <div className="pl-4">
                     <Sparkles className="h-6 w-6 text-slate-300" />
                  </div>
                  <Input 
                    placeholder={`Type your message to ${selectedChar.name.split(' ')[0]}...`} 
                    className="flex-1 h-14 rounded-full border-none bg-transparent text-lg focus-visible:ring-0 shadow-none placeholder:text-slate-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className={cn("h-14 w-14 rounded-full shadow-2xl transition-transform active:scale-95 shrink-0", selectedChar.color)}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                </form>
                <div className="flex justify-center mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                     Powered by SmartRead Advanced Personality Engine
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

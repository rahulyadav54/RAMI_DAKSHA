
'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Mic, Volume2, Sparkles, Languages } from "lucide-react";
import { characterChat } from "@/ai/flows/character-chat";
import { useToast } from "@/hooks/use-toast";

const CHARACTERS = [
  { id: 'einstein', name: 'Albert Einstein', bio: 'A curious and eccentric theoretical physicist who explains complex things with simple metaphors and a bit of humor.', avatar: 'https://picsum.photos/seed/einstein/100/100' },
  { id: 'athena', name: 'Athena', bio: 'The Greek goddess of wisdom and strategy. Wise, noble, and speaks with authoritative kindness.', avatar: 'https://picsum.photos/seed/athena/100/100' },
  { id: 'sherlock', name: 'Sherlock Holmes', bio: 'A brilliant detective who notices every detail. Analytical, slightly aloof, but helpful.', avatar: 'https://picsum.photos/seed/sherlock/100/100' },
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
      toast({ variant: "destructive", title: "Error", description: "Character is busy thinking!" });
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 h-screen flex flex-col max-w-5xl">
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {CHARACTERS.map(char => (
          <Button 
            key={char.id} 
            variant={selectedChar.id === char.id ? "default" : "outline"}
            className="flex-shrink-0 gap-2 h-14 rounded-2xl"
            onClick={() => { setSelectedChar(char); setMessages([]); }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={char.avatar} />
              <AvatarFallback>{char.name[0]}</AvatarFallback>
            </Avatar>
            {char.name}
          </Button>
        ))}
      </div>

      <Card className="flex-1 flex flex-col shadow-2xl border-none overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-md">
        <CardHeader className="bg-primary p-6 text-white flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={selectedChar.avatar} />
              <AvatarFallback>{selectedChar.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">{selectedChar.name}</CardTitle>
              <p className="text-xs text-white/70">Historical Character AI</p>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-xl">
             <Sparkles className="h-5 w-5" />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-8">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <Languages className="h-16 w-16 mx-auto text-primary/20" />
                  <h3 className="text-xl font-bold">Start a Conversation</h3>
                  <p className="text-muted-foreground">"Greetings, young scholar! What mysteries shall we unravel today?"</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={msg.role === 'model' ? 'bg-primary/10' : 'bg-muted'}>
                    {msg.role === 'model' ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />}
                  </Avatar>
                  <div className={`max-w-[75%] rounded-[1.5rem] p-4 text-sm shadow-sm relative group ${
                    msg.role === 'model' 
                    ? 'bg-muted text-foreground rounded-tl-none' 
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                  }`}>
                    {msg.content}
                    {msg.role === 'model' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => speak(msg.content)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </Avatar>
                  <div className="bg-muted p-4 rounded-[1.5rem] rounded-tl-none flex gap-1 items-center">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-muted/30">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
              <Input 
                placeholder={`Ask ${selectedChar.name.split(' ')[0]} a question...`} 
                className="flex-1 h-14 rounded-2xl shadow-inner border-none text-lg px-6"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/20" disabled={isLoading}>
                <Send className="h-6 w-6" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

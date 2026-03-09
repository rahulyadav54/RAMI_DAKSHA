
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { aiTutorChat } from "@/ai/flows/ai-tutor-chat";

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi there! I'm your AI Reading Tutor. Ask me anything about the text you just uploaded. I'm here to help you understand the tricky parts!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const content = sessionStorage.getItem("quiz_content") || "";

    try {
      const response = await aiTutorChat({
        content,
        query: userMsg,
        history: messages
      });
      setMessages(prev => [...prev, { role: 'model', content: response.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I ran into a bit of trouble. Could you try asking that again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 h-full flex flex-col max-w-4xl">
      <Card className="flex-1 flex flex-col shadow-2xl border-primary/10 overflow-hidden">
        <CardHeader className="bg-primary p-6 text-primary-foreground flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-xl">Personal AI Tutor</CardTitle>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Powered by SmartRead GenAI
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={msg.role === 'model' ? 'bg-primary/10' : 'bg-muted'}>
                    {msg.role === 'model' ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />}
                  </Avatar>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm ${
                    msg.role === 'model' 
                    ? 'bg-muted text-foreground rounded-tl-none' 
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <Avatar className="bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </Avatar>
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/30">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input 
                placeholder="Ask me about the text..." 
                className="flex-1 h-12 rounded-xl focus:ring-primary shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-xl" disabled={isTyping}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { queryBedrock } from "@/lib/bedrock";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
}

const AgentChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Consulta sobre los ",
      sender: "agent",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    // scroll to bottom smoothly
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");

    // Add a temporary 'typing' message
    const typingId = `t-${Date.now()}`;
    const typingMessage: Message = { id: typingId, content: "...", sender: "agent", timestamp: new Date() };
    setMessages(prev => [...prev, typingMessage]);

    // Try to call Bedrock via backend; fall back to simulated response on error
    (async () => {
      try {
        const history = messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'agent', content: m.content }));
        const reply = await queryBedrock(inputValue, history as any);
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: reply,
          sender: "agent",
          timestamp: new Date()
        };
        setMessages(prev => prev.map(m => m.id === typingId ? agentResponse : m));
      } catch (err) {
        // fallback simulated response
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Entendido. Te ayudo a resolver tu consulta sobre el módulo PCB. ¿Podrías proporcionar más detalles?",
          sender: "agent",
          timestamp: new Date()
        };
        setMessages(prev => prev.map(m => m.id === typingId ? agentResponse : m));
      }
    })();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-card border border-border shadow-medium h-[36rem]">
      <CardHeader className="bg-royal-blue-header text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agente RedSens
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[32rem]">
        {/* Messages Area */}
  <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "agent" && (
                <div className="w-8 h-8 bg-gradient-agent rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-royal-blue text-white"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 bg-royal-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              variant="agent" 
              size="icon"
              className="rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentChat;
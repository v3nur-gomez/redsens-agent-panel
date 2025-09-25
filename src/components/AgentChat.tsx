import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { queryBedrock, ConversationTurn } from "@/lib/bedrock";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
}

// Bluetooth service/characteristic del Aqua-Chip (ESP32)
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

interface SensorData {
  temperature: number;
  level: number;
  [key: string]: any;
}

const AgentChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestSensorData, setLatestSensorData] = useState<SensorData | null>(null);
  const [isBtConnected, setIsBtConnected] = useState(false);
  // Use any to avoid TS DOM lib Bluetooth type issues in some configs
  const deviceRef = useRef<any>(null);
  const charRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    // scroll to bottom smoothly
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // disconnect on unmount
  useEffect(() => {
    return () => {
      try {
        if (deviceRef.current?.gatt?.connected) {
          deviceRef.current.gatt.disconnect();
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    // push user message and clear input
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    // show typing indicator
    const typingId = `t-${Date.now()}`;
    const typingMessage: Message = { id: typingId, content: "...", sender: "agent", timestamp: new Date() };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      // build history from the current messages snapshot
      const history: ConversationTurn[] = [...messages, newMessage].map((m) => ({ role: m.sender === "user" ? "user" : "agent", content: m.content }));
      // si hay datos del sensor, añadimos un mensaje marcado como agente (para ajustarse al tipo) con la lectura
      if (latestSensorData) {
        history.unshift({ role: "agent", content: `SENSOR_DATA: ${JSON.stringify(latestSensorData)}` });
      }
      const reply = await queryBedrock(newMessage.content, history, { timeoutMs: 15000, maxRetries: 2 });

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: reply,
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages((prev) => prev.map((m) => (m.id === typingId ? agentResponse : m)));
    } catch (err) {
      // Log detailed error information if available (status, response body/headers)
      // queryBedrock now attaches non-enumerable properties: status, responseBody, responseHeaders
      console.error("queryBedrock error:", err);
      try {
        const e = err as any;
        if (e.status) console.error("status:", e.status);
        if (e.responseBody) console.error("responseBody:", e.responseBody);
        if (e.responseHeaders) console.error("responseHeaders:", e.responseHeaders);
      } catch (logErr) {
        // ignore logging errors
      }
      setError("No se pudo conectar con el servicio. Revisa CORS, la disponibilidad del endpoint o consulta la consola para más detalles.");
      // replace typing with fallback message
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Entendido. Te ayudo a resolver tu consulta sobre el módulo PCB. ¿Podrías proporcionar más detalles?",
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => prev.map((m) => (m.id === typingId ? agentResponse : m)));
    } finally {
      setIsLoading(false);
    }
  };

  // Conectar al Aqua-Chip (ESP32) via Web Bluetooth
  const connectToAquaChip = async () => {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
         filters: [{ name: 'Aqua-Chip' }],
         optionalServices: [SERVICE_UUID],
       });

      deviceRef.current = device;
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      charRef.current = characteristic;

      try {
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          try {
            const value = event.target.value;
            const decoder = new TextDecoder('utf-8');
            const bytes = value instanceof DataView ? new Uint8Array(value.buffer) : new Uint8Array(value);
            const jsonString = decoder.decode(bytes);
            const data = JSON.parse(jsonString);
            // Adaptar: usar 'temp' como temperatura y validar datos
            const temp = typeof data.temp === 'number' ? data.temp : Number(data.temp);
            const level = typeof data.level === 'number' ? data.level : Number(data.level);
            // Ignorar lecturas inválidas
            if (!isNaN(temp) && !isNaN(level) && level > 0 && temp > -40 && temp < 125) {
              setLatestSensorData({ temperature: temp, level });
              setIsBtConnected(true);
            }
          } catch (e) {
            console.error('Error parsing sensor payload', e);
          }
        });
        // Saludo de bienvenida al conectar exitosamente
        setMessages((prev) => [
          ...prev,
          {
            id: `welcome-${Date.now()}`,
            content: "¡Conexión exitosa! Soy tu asistente Aqua-Chip. ¿Qué te gustaría saber?",
            sender: "agent",
            timestamp: new Date(),
          },
        ]);
      } catch (notifErr) {
        console.error('Failed to start notifications', notifErr);
      }
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      setError('No se pudo conectar al Aqua-Chip. Asegúrate de que esté encendido y cerca.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-card border border-border shadow-medium h-[36rem]">
      <CardHeader className="bg-royal-blue-header text-white rounded-t-lg">
        <div className="flex items-center gap-2 w-full">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agente RedSens
          </CardTitle>
          <div className="ml-auto flex items-center gap-2">
            {latestSensorData ? (
              <div className="text-sm opacity-90">Temp: {latestSensorData.temperature}°C · Nivel: {latestSensorData.level}</div>
            ) : (
              <div className="text-sm opacity-60">Sensor: desconectado</div>
            )}
            <Button onClick={connectToAquaChip} size="sm" className="ml-2">
              {isBtConnected ? 'Reconectar' : 'Conectar Aqua-Chip'}
            </Button>
          </div>
        </div>
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
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              variant="agent"
              size="icon"
              className="rounded-full"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {isLoading && (
          <div className="p-2 text-sm text-muted-foreground">Agente escribiendo...</div>
        )}
        {error && (
          <div className="p-2 text-sm text-destructive">{error}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentChat;
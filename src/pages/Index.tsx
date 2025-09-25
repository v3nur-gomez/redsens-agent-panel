import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PCBModule, { ModuleData } from "@/components/PCBModule";
import ActionButtons from "@/components/ActionButtons";
import AgentChat from "@/components/AgentChat";

const Index = () => {
  const [showAgent, setShowAgent] = useState(false);
  const [moduleData, setModuleData] = useState<ModuleData | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);

  // Start with empty data (placeholders). Data will be populated and saved when the user presses Connect.

  const handleAgentClick = () => {
    setShowAgent(true);
  };

  const handleConnect = async () => {
    // Start connecting: show overlay with spinner for 1.5s
    setConnecting(true);
    await new Promise((res) => setTimeout(res, 1500));

    // Simulate received module data
    const received: ModuleData = {
      modelo: "RedSens-IOT-V2",
      version: "2.4.1",
      sensores: "Temp, Hum, CO2, Light",
      direccionIP: "192.168.1.100",
      wifi: "RedSens-Network"
    };

    setModuleData(received);
    try {
      localStorage.setItem("redsens:moduleData", JSON.stringify(received));
    } catch (e) {
      // ignore storage errors
    }
    setConnecting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content Container - fill remaining height */}
      <div className="relative flex-1 overflow-hidden">
        {/* Connecting overlay */}
        {connecting && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white border-t-transparent animate-spin" style={{ animationDuration: "1.5s" }}></div>
          </div>
        )}
        {/* Main Content - slides up when agent is active */}
        <div 
          className={`transition-transform duration-500 ease-in-out ${
            showAgent ? "transform -translate-y-full" : "transform translate-y-0"
          }`}
        >
            <div className="container mx-auto px-6 py-8 space-y-8 h-full flex flex-col justify-center">
            <PCBModule data={moduleData} />
            <ActionButtons onAgentClick={handleAgentClick} onConnect={handleConnect} />
          </div>
        </div>

        {/* Agent Chat - positioned below and slides up */}
        <div 
          role="region"
          aria-hidden={!showAgent}
          className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${
            showAgent ? "transform translate-y-0 pointer-events-auto" : "transform translate-y-full pointer-events-none"
          }`}
        >
          <div className="container mx-auto px-6 py-8 h-full flex flex-col">
            <div className="mb-6">
              <button
                onClick={() => setShowAgent(false)}
                className="text-royal-blue hover:text-royal-blue-dark font-medium mb-4 transition-colors"
              >
                ← Volver al módulo
              </button>
            </div>
            <div className="flex-1">
              <AgentChat />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

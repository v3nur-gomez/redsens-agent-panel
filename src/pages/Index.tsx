import { useState } from "react";
import Header from "@/components/Header";
import PCBModule from "@/components/PCBModule";
import ActionButtons from "@/components/ActionButtons";
import AgentChat from "@/components/AgentChat";

const Index = () => {
  const [showAgent, setShowAgent] = useState(false);

  const handleAgentClick = () => {
    setShowAgent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content Container */}
      <div className="relative overflow-hidden">
        {/* Main Content - slides up when agent is active */}
        <div 
          className={`transition-transform duration-500 ease-in-out ${
            showAgent ? "transform -translate-y-full" : "transform translate-y-0"
          }`}
        >
          <div className="container mx-auto px-6 py-8 space-y-8">
            <PCBModule />
            <ActionButtons onAgentClick={handleAgentClick} />
          </div>
        </div>

        {/* Agent Chat - positioned below and slides up */}
        <div 
          className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${
            showAgent ? "transform translate-y-0" : "transform translate-y-full"
          }`}
        >
          <div className="container mx-auto px-6 py-8">
            <div className="mb-6">
              <button
                onClick={() => setShowAgent(false)}
                className="text-royal-blue hover:text-royal-blue-dark font-medium mb-4 transition-colors"
              >
                ← Volver al módulo
              </button>
            </div>
            <AgentChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

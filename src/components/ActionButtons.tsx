import { Button } from "@/components/ui/button";
import { Activity, MessageCircle } from "lucide-react";

interface ActionButtonsProps {
  onAgentClick: () => void;
}

const ActionButtons = ({ onAgentClick }: ActionButtonsProps) => {
  return (
    <div className="flex gap-6 justify-center mt-8">
      {/* Sensores Button */}
      <Button 
        variant="sensor" 
        size="lg" 
        className="px-12 py-8 text-xl font-semibold min-w-48 rounded-full"
      >
        <Activity className="h-7 w-7 mr-4" />
        Sensores
      </Button>

      {/* Agente Button */}
      <Button 
        variant="agent" 
        size="lg" 
        className="px-12 py-8 text-xl font-semibold min-w-48 rounded-full"
        onClick={onAgentClick}
      >
        <MessageCircle className="h-7 w-7 mr-4" />
        Agente
      </Button>
    </div>
  );
};

export default ActionButtons;
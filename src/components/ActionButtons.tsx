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
        className="px-8 py-6 text-lg font-semibold min-w-32"
      >
        <Activity className="h-6 w-6 mr-3" />
        Sensores
      </Button>

      {/* Agente Button */}
      <Button 
        variant="agent" 
        size="lg" 
        className="px-8 py-6 text-lg font-semibold min-w-32"
        onClick={onAgentClick}
      >
        <MessageCircle className="h-6 w-6 mr-3" />
        Agente
      </Button>
    </div>
  );
};

export default ActionButtons;
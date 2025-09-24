import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onAgentClick: () => void;
}

const ActionButtons = ({ onAgentClick }: ActionButtonsProps) => {
  return (
    <div className="flex gap-8 justify-center mt-10">
      {/* Sensores Button - larger, no icon, bolder font */}
      <Button 
        variant="sensor" 
        size="lg" 
        className="px-16 py-6 text-2xl font-extrabold min-w-[220px] rounded-full"
      >
        Sensores
      </Button>

      {/* Agente Button - larger, no icon, bolder font */}
      <Button 
        variant="agent" 
        size="lg" 
        className="px-16 py-6 text-2xl font-extrabold min-w-[220px] rounded-full"
        onClick={onAgentClick}
      >
        Agente
      </Button>
    </div>
  );
};

export default ActionButtons;
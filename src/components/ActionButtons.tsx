import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onAgentClick: () => void;
  onConnect?: () => void;
}

const ActionButtons = ({ onAgentClick, onConnect }: ActionButtonsProps) => {
  return (
    <div className="flex gap-8 justify-center mt-10">
      {/* Conectar Button - placed first, blue gradient like Bluetooth */}
      <Button
        variant="royal"
        size="lg"
        className="px-20 py-7 text-3xl font-semibold min-w-[260px] rounded-full"
        onClick={onConnect}
      >
        Conectar
      </Button>

      {/* Sensores Button - larger, no icon, bolder font */}
      <Button 
        variant="sensor" 
        size="lg" 
        className="px-20 py-7 text-3xl font-semibold min-w-[260px] rounded-full"
      >
        Sensores
      </Button>

      {/* Agente Button - larger, no icon, bolder font */}
      <Button 
        variant="agent" 
        size="lg" 
        className="px-20 py-7 text-3xl font-semibold min-w-[260px] rounded-full"
        onClick={onAgentClick}
      >
        Agente
      </Button>
    </div>
  );
};

export default ActionButtons;
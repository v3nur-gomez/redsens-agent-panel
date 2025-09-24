import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Cpu, Network, Wifi } from "lucide-react";

const PCBModule = () => {
  const moduleData = {
    modelo: "RedSens-IOT-V2",
    version: "2.4.1",
    sensores: "Temp, Hum, CO2, Light",
    direccionIP: "192.168.1.100",
    wifi: "RedSens-Network"
  };

  return (
    <div className="space-y-6">
      {/* Module Title - left aligned and larger */}
      <div className="">
        <h2 className="text-3xl font-extrabold text-foreground mb-2 text-left">Módulo PCB</h2>
        <div className="h-px bg-border w-full"></div>
      </div>

      {/* Module Information Card */}
      <Card className="bg-card border border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Cpu className="h-5 w-5 text-royal-blue" />
            Información
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Modelo:</span>
                <span className="text-foreground font-semibold">{moduleData.modelo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Versión:</span>
                <span className="text-foreground font-semibold">{moduleData.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Sensores:</span>
                <span className="text-foreground font-semibold">{moduleData.sensores}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Network className="h-4 w-4" />
                  Dirección IP:
                </span>
                <span className="text-foreground font-semibold">{moduleData.direccionIP}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Wifi className="h-4 w-4" />
                  WiFi:
                </span>
                <span className="text-foreground font-semibold">{moduleData.wifi}</span>
              </div>
            </div>
          </div>
          
          {/* Configuration Button */}
          <div className="pt-4 border-t border-border">
            <Button variant="config" className="w-full md:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              Configuración del Módulo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PCBModule;
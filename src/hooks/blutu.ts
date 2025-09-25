import { useState } from 'react';

// Define la estructura de los datos del sensor
export interface SensorData {
  temp: number;
  level: number;
}

// Esta es la versión SIMULADA del hook de Bluetooth
export const useBluetooth = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Desconectado");

  // Esta función AHORA simula la conexión en lugar de buscar un dispositivo real
  const connect = async () => {
    setStatusMessage("Conectando (Modo Simulado)...");

    // Simula un retardo de conexión de 1.5 segundos
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Datos genéricos que usaremos para las pruebas
    const genericData: SensorData = {
      temp: 25.9,
      level: 80,
    };
    
    setSensorData(genericData);
    setIsConnected(true);
    setStatusMessage("Conectado (Modo Simulado)");
    
    return true; // Devuelve 'true' para indicar éxito
  };

  return { connect, sensorData, isConnected, statusMessage };
};
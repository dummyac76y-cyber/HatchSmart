import { useState, useEffect, useCallback } from 'react';

interface SensorReading {
  timestamp: Date;
  temperature: number;
  humidity: number;
  deviceId: string;
  sensorId: string;
  status: 'normal' | 'warning' | 'error';
}

interface CurrentData {
  temperature: number;
  humidity: number;
  tempStatus: 'normal' | 'warning' | 'critical';
  humidityStatus: 'normal' | 'warning' | 'critical';
}

interface IncubationProgress {
  currentDay: number;
  totalDays: number;
  percentage: number;
  species: string;
  startDate: string;
  estimatedHatch: string;
}

// Generate simulated sensor data for demo purposes
function generateDemoReading(baseTemp: number, baseHumidity: number): SensorReading {
  const tempVariation = (Math.random() - 0.5) * 0.8;
  const humidityVariation = (Math.random() - 0.5) * 6;
  const temperature = baseTemp + tempVariation;
  const humidity = Math.max(30, Math.min(80, baseHumidity + humidityVariation));

  return {
    timestamp: new Date(),
    temperature,
    humidity,
    deviceId: 'ESP32-INCUBATOR-001',
    sensorId: 'DHT22-PRIMARY',
    status: 'normal',
  };
}

function generateHistoryData(hours: number): SensorReading[] {
  const data: SensorReading[] = [];
  const now = new Date();
  const intervals = hours <= 1 ? 60 : hours <= 24 ? 48 : 168;
  const intervalMs = (hours * 60 * 60 * 1000) / intervals;

  for (let i = intervals; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    const baseTemp = 37.7 + Math.sin(i / 10) * 0.3;
    const baseHumidity = 58 + Math.sin(i / 15) * 5;
    const reading = generateDemoReading(baseTemp, baseHumidity);
    reading.timestamp = timestamp;
    data.push(reading);
  }
  return data;
}

export function useSensorData() {
  const [currentData, setCurrentData] = useState<CurrentData>({
    temperature: 37.7,
    humidity: 58,
    tempStatus: 'normal',
    humidityStatus: 'normal',
  });
  const [historyData, setHistoryData] = useState<SensorReading[]>([]);
  const [isOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('Just now');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | 'custom'>('24h');

  // Incubation progress (simulated - Day 12 of 21 for chicken eggs)
  const [incubationProgress] = useState<IncubationProgress>(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 12);
    const hatchDate = new Date(startDate);
    hatchDate.setDate(hatchDate.getDate() + 21);
    return {
      currentDay: 12,
      totalDays: 21,
      percentage: (12 / 21) * 100,
      species: 'Chicken (Gallus gallus domesticus)',
      startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      estimatedHatch: hatchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  });

  const isDemo = true; // Always demo in this build

  // Update current data periodically
  useEffect(() => {
    const updateData = () => {
      const reading = generateDemoReading(37.7, 58);
      const tempStatus: 'normal' | 'warning' | 'critical' =
        reading.temperature < 36.5 || reading.temperature > 39.0 ? 'critical' :
        reading.temperature < 37.0 || reading.temperature > 38.5 ? 'warning' : 'normal';
      const humidityStatus: 'normal' | 'warning' | 'critical' =
        reading.humidity < 40 || reading.humidity > 75 ? 'critical' :
        reading.humidity < 45 || reading.humidity > 70 ? 'warning' : 'normal';

      setCurrentData({
        temperature: reading.temperature,
        humidity: reading.humidity,
        tempStatus,
        humidityStatus,
      });
      setLastUpdate('Just now');
    };

    updateData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate history when time range changes
  useEffect(() => {
    const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
    setHistoryData(generateHistoryData(hours));
  }, [timeRange]);

  return {
    currentData,
    historyData,
    incubationProgress,
    isOnline,
    lastUpdate,
    timeRange,
    setTimeRange,
    isDemo,
  };
}

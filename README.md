# SmartHatch — IoT Egg Incubator Monitoring System

A professional, research-grade IoT monitoring platform for egg incubator management. Built with React, TypeScript, Firebase, and Recharts.

## 📋 Features

- **Secure Authentication** — Email/password, Google OAuth, Microsoft OAuth via Firebase
- **Real-time Dashboard** — Temperature, humidity, incubation progress monitoring
- **Environmental Charts** — Historical data visualization with Recharts
- **Alert System** — Threshold-based alerts with acknowledgment workflow
- **Sensor History** — Searchable, filterable data table with CSV export
- **Reports** — Summary statistics, daily trends, and incident logs
- **Settings** — Configurable thresholds, device settings, notification preferences
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Demo Mode** — Fully functional without Firebase configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (for production use)
- An ESP32 or compatible microcontroller (for IoT hardware integration)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd smarthatch

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase configuration
# (or leave defaults to run in Demo Mode)

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The built files will be in `dist/` and can be deployed to any static hosting service.

## 🔥 Firebase Configuration

### Setup Steps

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication providers:
   - Email/Password
   - Google (add authorized domains)
   - Microsoft (configure tenant ID if needed)
3. Create a Firestore database
4. Copy your web app configuration to `.env`

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sensor readings - only accessible to authenticated users
    match /sensorReadings/{readingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // Alerts - user can only access their own
    match /alerts/{alertId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // User settings
    match /users/{userId}/settings/{doc} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // Device configuration
    match /devices/{deviceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.ownerId;
    }
  }
}
```

## 📡 IoT Hardware Integration

### Data Flow

```
Sensor (DHT22/BME280) → ESP32 → MQTT/HTTP → Backend → Firestore → Web Dashboard
```

### Supported Hardware

- **Microcontroller:** ESP32 (recommended) or ESP8266
- **Temperature/Humidity Sensor:** DHT22, BME280, or SHT31
- **Communication:** MQTT over TLS or HTTPS POST

### MQTT Topic Structure

```
smarthatch/{device_id}/telemetry    — Sensor readings
smarthatch/{device_id}/status       — Device heartbeat
smarthatch/{device_id}/config       — Configuration updates
```

### Expected Telemetry Payload

```json
{
  "deviceId": "ESP32-INCUBATOR-001",
  "sensorId": "DHT22-PRIMARY",
  "temperature": 37.7,
  "humidity": 58.2,
  "timestamp": "2024-01-15T10:30:00Z",
  "batteryLevel": 95,
  "rssi": -42
}
```

### HTTP API Endpoint

```
POST /api/v1/telemetry
Content-Type: application/json
Authorization: Bearer <device-token>

{
  "deviceId": "ESP32-INCUBATOR-001",
  "sensorId": "DHT22-PRIMARY",
  "temperature": 37.7,
  "humidity": 58.2,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### ESP32 Example Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

const char* API_URL = "https://your-backend.com/api/v1/telemetry";
const char* DEVICE_TOKEN = "your-device-token";
const char* DEVICE_ID = "ESP32-INCUBATOR-001";

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASSWORD");
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (!isnan(temp) && !isnan(hum)) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);

    JsonDocument doc;
    doc["deviceId"] = DEVICE_ID;
    doc["sensorId"] = "DHT22-PRIMARY";
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["timestamp"] = getTimeString();

    String payload;
    serializeJson(doc, payload);
    http.POST(payload);
    http.end();
  }

  delay(30000); // Send every 30 seconds
}
```

## 📁 Project Structure

```
src/
├── App.tsx                    # Main app with routing
├── firebase.ts                # Firebase configuration
├── AuthContext.tsx             # Authentication state management
├── index.css                  # Global styles
├── main.tsx                   # Entry point
├── vite-env.d.ts              # TypeScript declarations
├── hooks/
│   └── useSensorData.ts       # Sensor data hook (demo + real)
└── components/
    ├── AuthPages.tsx           # Login, Register, Forgot Password
    ├── DashboardLayout.tsx     # Sidebar + Header layout
    ├── OverviewPage.tsx        # Dashboard overview
    ├── IncubatorPage.tsx       # Environmental monitoring
    ├── SensorHistoryPage.tsx   # Data table with export
    ├── AlertsPage.tsx          # Alert management
    ├── ReportsPage.tsx         # Reports & statistics
    └── SettingsPage.tsx        # Configuration
```

## 🧪 Testing Checklist

- [ ] Login with email/password works
- [ ] Registration creates account
- [ ] Google sign-in initiates OAuth flow
- [ ] Microsoft sign-in initiates OAuth flow
- [ ] Password reset sends email
- [ ] Logout clears session and redirects
- [ ] Unauthorized users cannot access dashboard
- [ ] Dashboard navigation works on all pages
- [ ] Charts render with data
- [ ] Sensor history table filters correctly
- [ ] CSV export downloads correct data
- [ ] Alerts can be acknowledged
- [ ] Settings save and persist
- [ ] Responsive on mobile (320px+)
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on desktop (1280px+)
- [ ] Demo mode works without Firebase
- [ ] Error states display correctly
- [ ] Loading states show during operations

## 🌐 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Environment Variables in Production

Set these in your hosting platform's dashboard:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Firebase security rules enforce user-data isolation
- Device tokens should be rotated periodically
- Use TLS for all MQTT/HTTP communication
- Validate all incoming sensor data on the backend
- Implement rate limiting for API endpoints

## 📄 License

This project is developed as part of an academic research thesis.

## 📞 Support

For issues related to Firebase configuration, refer to the [Firebase Documentation](https://firebase.google.com/docs).
For IoT hardware questions, consult the ESP32 documentation and sensor datasheets.

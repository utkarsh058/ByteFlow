/*
 * SMRITI-SETU Cognitive Gaming Platform — ESP32 Physical Button Controller
 * Firmware Version: v1.0.0-ner-stable
 * 
 * Hardware Pin Mapping:
 * - RED Button    -> GPIO 25 (D25)
 * - GREEN Button  -> GPIO 14 (D14)
 * - BLUE Button   -> GPIO 27 (D27)
 * - YELLOW Button -> GPIO 26 (D26)
 * 
 * Pin Mode: INPUT_PULLUP
 * Active State: LOW (Pressed = LOW, Released = HIGH)
 * 
 * Event Output (JSON via HTTP POST / WebSockets):
 * {
 *   "type": "BUTTON_PRESS",
 *   "button": "RED" | "GREEN" | "BLUE" | "YELLOW",
 *   "deviceId": "ESP32-NER-GW-001",
 *   "timestamp": 1234567890
 * }
 */

#include <WiFi.h>
#include <HTTPClient.h>

// =========================================================================
// CONFIGURATION (UPDATE THESE FOR YOUR NETWORK SETUP)
// =========================================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";       // Your 2.4GHz Wi-Fi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Your Wi-Fi Password
const char* SERVER_HOST   = "192.168.1.100";        // Backend Server IP Address (e.g. PC local IP)
const int   SERVER_PORT   = 5000;                   // Backend Server Port
const char* DEVICE_ID     = "ESP32-NER-GW-001";     // Unique Controller Device ID

// Endpoint path on Smriti-Setu Backend
const char* ACTION_ENDPOINT = "/api/devices/emit-test-button";

// =========================================================================
// HARDWARE PIN DEFINITIONS
// =========================================================================
const int PIN_RED    = 25; // D25
const int PIN_GREEN  = 14; // D14
const int PIN_BLUE   = 27; // D27
const int PIN_YELLOW = 26; // D26

// Debounce settings
const unsigned long DEBOUNCE_DELAY_MS = 50; // 50ms software debounce

// Structure for Button State Tracking
struct PhysicalButton {
  int pin;
  const char* name;
  bool lastReading;
  bool stableState;
  unsigned long lastDebounceTime;
};

PhysicalButton buttons[] = {
  { PIN_RED,    "RED",    HIGH, HIGH, 0 },
  { PIN_GREEN,  "GREEN",  HIGH, HIGH, 0 },
  { PIN_BLUE,   "BLUE",   HIGH, HIGH, 0 },
  { PIN_YELLOW, "YELLOW", HIGH, HIGH, 0 }
};

const int NUM_BUTTONS = sizeof(buttons) / sizeof(buttons[0]);

// Helper: Ensure Wi-Fi is connected
void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Connecting to Wi-Fi: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[Wi-Fi] 🟢 Connected successfully!");
      Serial.print("[Wi-Fi] IP Address: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("\n[Wi-Fi] ❌ Connection failed. Will retry...");
    }
  }
}

// Function to send normalized button press event to backend
void sendButtonPressEvent(const char* buttonName) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Cannot send event: Wi-Fi disconnected");
    return;
  }

  HTTPClient http;
  String url = "http://" + String(SERVER_HOST) + ":" + String(SERVER_PORT) + String(ACTION_ENDPOINT);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Construct normalized JSON payload
  String payload = "{";
  payload += "\"type\":\"BUTTON_PRESS\",";
  payload += "\"button\":\"" + String(buttonName) + "\",";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"timestamp\":" + String(millis());
  payload += "}";

  Serial.print("[HTTP] Sending event to ");
  Serial.print(url);
  Serial.print(" -> ");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("[HTTP] POST Response code: %d\n", httpCode);
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================================");
  Serial.println(" SMRITI-SETU ESP32 COGNITIVE GAME CONTROLLER FIRMWARE  ");
  Serial.println("========================================================");

  // Configure Button Pins with INPUT_PULLUP
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
    buttons[i].lastReading = digitalRead(buttons[i].pin);
    buttons[i].stableState = buttons[i].lastReading;
    Serial.printf("[HW] Pin D%d initialized for %s button (INPUT_PULLUP)\n", buttons[i].pin, buttons[i].name);
  }

  // Connect to Wi-Fi network
  checkWiFiConnection();
}

void loop() {
  // Maintain Wi-Fi Connection
  checkWiFiConnection();

  unsigned long now = millis();

  // Scan physical buttons with software debounce & state-change edge detection
  for (int i = 0; i < NUM_BUTTONS; i++) {
    bool currentReading = digitalRead(buttons[i].pin);

    // Check if raw pin reading changed (bounce or real press)
    if (currentReading != buttons[i].lastReading) {
      buttons[i].lastDebounceTime = now;
    }

    // Process state change after debounce delay
    if ((now - buttons[i].lastDebounceTime) > DEBOUNCE_DELAY_MS) {
      if (currentReading != buttons[i].stableState) {
        buttons[i].stableState = currentReading;

        // Active LOW transition: State changed to LOW means button was pressed!
        if (buttons[i].stableState == LOW) {
          Serial.printf("\n[HW] 🔘 Physical Button Pressed: %s (D%d)\n", buttons[i].name, buttons[i].pin);
          sendButtonPressEvent(buttons[i].name);
        } else {
          Serial.printf("[HW] 🔘 Physical Button Released: %s (D%d)\n", buttons[i].name, buttons[i].pin);
        }
      }
    }

    buttons[i].lastReading = currentReading;
  }

  // Short delay for high-responsiveness loop
  delay(10);
}

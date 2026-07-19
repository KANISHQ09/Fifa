/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { MATCHES } from "../data/knowledgeBase";
import type { MatchInfo } from "../data/knowledgeBase";

export interface ZoneTelemetry {
  name: string;
  occupancy: number; // percentage (0-100)
  peopleCount: number;
  capacity: number;
  status: "Normal" | "Warning" | "Critical";
}

export interface StadiumTelemetry {
  name: string;
  city: string;
  country: "USA" | "Canada" | "Mexico";
  overallOccupancy: number; // percentage
  weather: string;
  temperature: number; // Celsius
  activeMatch: MatchInfo | null;
  zones: ZoneTelemetry[];
  transitStatus: {
    metro: "On Time" | "Delayed" | "Suspended";
    shuttles: "On Time" | "Busy" | "Delayed";
    rideshareSurge: number; // multiplier (e.g. 1.2)
    parkingAvailability: number; // percentage free
  };
  sustainability: {
    energyKWh: number;
    waterLiters: number;
    wasteKg: number;
    baselineEnergy: number;
    baselineWater: number;
    baselineWaste: number;
  };
}

export interface AccessibilityRequest {
  id: string;
  fanName: string;
  type: "Wheelchair Escort" | "Sensory Bag Request" | "Assistive Listening" | "Elevator Assistance";
  stadiumName: string;
  location: string; // e.g. "Section 102"
  status: "Received" | "Assigned" | "En Route" | "Resolved";
  assignedVolunteer: string | null;
  urgency: "High" | "Medium" | "Low";
  timestamp: Date;
  durationMinutes: number; // simulated elapsed time
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "volunteer";
  text: string;
  timestamp: Date;
  translatedText?: string;
}

export interface SupportChat {
  id: string;
  fanName: string;
  stadiumName: string;
  status: "Waiting" | "Connected" | "Resolved";
  assignedVolunteer: string | null;
  messages: ChatMessage[];
  lastUpdated: Date;
}

export interface IncidentReport {
  id: string;
  stadiumName: string;
  zone: string;
  type: "Crowd Surge" | "Medical Incident" | "Lost Child" | "Facility Issue" | "Security Alarm";
  description: string;
  severity: "High" | "Medium" | "Low";
  status: "Active" | "Investigating" | "Resolved";
  timestamp: Date;
  aiMitigationPlaybook: string;
}

export interface EmergencyBroadcast {
  id: string;
  message: string;
  stadiumName: string;
  zone: string; // "All" or specific zone
  timestamp: Date;
  approved: boolean;
  status: "Pending" | "Sent";
}

interface SimulationContextProps {
  stadiums: StadiumTelemetry[];
  accessibilityRequests: AccessibilityRequest[];
  incidents: IncidentReport[];
  broadcasts: EmergencyBroadcast[];
  supportChats: SupportChat[];
  isSurgeSimulationActive: boolean;
  timeStep: number; // running tick
  isEnergySavingMode: boolean;
  cleanupStadiums: string[];
  toggleEnergySavingMode: () => void;
  dispatchCleanupCrew: (stadiumName: string) => void;
  triggerSurgeSimulation: (stadiumName: string) => void;
  stopSurgeSimulation: () => void;
  addAccessibilityRequest: (request: Omit<AccessibilityRequest, "id" | "status" | "assignedVolunteer" | "timestamp" | "durationMinutes">) => void;
  dispatchVolunteer: (requestId: string, volunteerName: string) => void;
  updateRequestStatus: (requestId: string, status: AccessibilityRequest["status"]) => void;
  reportIncident: (incident: Omit<IncidentReport, "id" | "status" | "timestamp" | "aiMitigationPlaybook">) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentReport["status"]) => void;
  createEmergencyBroadcast: (stadiumName: string, zone: string, message: string) => string;
  approveBroadcast: (broadcastId: string) => void;
  deleteBroadcast: (broadcastId: string) => void;
  addSupportChat: (fanName: string, stadiumName: string, initialMessage: string, translatedText?: string) => string;
  sendChatMessage: (chatId: string, sender: "user" | "ai" | "volunteer", text: string, translatedText?: string) => void;
  connectVolunteerToChat: (chatId: string, volunteerName: string) => void;
  resolveSupportChat: (chatId: string) => void;
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

const INITIAL_STADIUMS: StadiumTelemetry[] = [
  {
    name: "MetLife Stadium",
    city: "New York/New Jersey",
    country: "USA",
    overallOccupancy: 45,
    weather: "Clear Sky",
    temperature: 24,
    activeMatch: MATCHES.find(m => m.venue === "MetLife Stadium") || null,
    zones: [
      { name: "MetLife Gate (Zone 1)", occupancy: 42, peopleCount: 8400, capacity: 20000, status: "Normal" },
      { name: "Verizon Gate (Zone 3)", occupancy: 55, peopleCount: 11000, capacity: 20000, status: "Normal" },
      { name: "HCLTech Gate (Zone 4)", occupancy: 30, peopleCount: 6000, capacity: 20000, status: "Normal" },
      { name: "Bud Light Gate (Zone 5)", occupancy: 53, peopleCount: 10600, capacity: 20000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.0, parkingAvailability: 68 },
    sustainability: { energyKWh: 4200, waterLiters: 15000, wasteKg: 850, baselineEnergy: 4000, baselineWater: 14000, baselineWaste: 800 }
  },
  {
    name: "SoFi Stadium",
    city: "Los Angeles",
    country: "USA",
    overallOccupancy: 82,
    weather: "Sunny",
    temperature: 28,
    activeMatch: MATCHES.find(m => m.venue === "SoFi Stadium") || null,
    zones: [
      { name: "Gate A (Zone A)", occupancy: 88, peopleCount: 22000, capacity: 25000, status: "Warning" },
      { name: "Gate B (Zone C)", occupancy: 72, peopleCount: 18000, capacity: 25000, status: "Normal" },
      { name: "Gate C (Zone D)", occupancy: 94, peopleCount: 23500, capacity: 25000, status: "Critical" }
    ],
    transitStatus: { metro: "Delayed", shuttles: "Busy", rideshareSurge: 1.8, parkingAvailability: 12 },
    sustainability: { energyKWh: 6800, waterLiters: 31000, wasteKg: 1950, baselineEnergy: 5500, baselineWater: 24000, baselineWaste: 1400 }
  },
  {
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    overallOccupancy: 60,
    weather: "Partly Cloudy",
    temperature: 22,
    activeMatch: MATCHES.find(m => m.venue === "Estadio Azteca") || null,
    zones: [
      { name: "Gate 1 (Zone A)", occupancy: 50, peopleCount: 15000, capacity: 30000, status: "Normal" },
      { name: "Gate 2 (Zone C)", occupancy: 78, peopleCount: 23400, capacity: 30000, status: "Normal" },
      { name: "Gate 3 (Zone D)", occupancy: 52, peopleCount: 15600, capacity: 30000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.1, parkingAvailability: 45 },
    sustainability: { energyKWh: 3800, waterLiters: 18000, wasteKg: 1100, baselineEnergy: 3900, baselineWater: 18500, baselineWaste: 1050 }
  },
  {
    name: "BC Place",
    city: "Vancouver",
    country: "Canada",
    overallOccupancy: 12,
    weather: "Light Rain",
    temperature: 16,
    activeMatch: MATCHES.find(m => m.venue === "BC Place") || null,
    zones: [
      { name: "Gate A (Zone 1)", occupancy: 10, peopleCount: 1500, capacity: 15000, status: "Normal" },
      { name: "Gate B (Zone 2)", occupancy: 15, peopleCount: 2250, capacity: 15000, status: "Normal" },
      { name: "Gate C (Zone 3)", occupancy: 11, peopleCount: 1650, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.0, parkingAvailability: 85 },
    sustainability: { energyKWh: 1200, waterLiters: 5000, wasteKg: 120, baselineEnergy: 1300, baselineWater: 5500, baselineWaste: 150 }
  },
  {
    name: "BMO Field",
    city: "Toronto",
    country: "Canada",
    overallOccupancy: 35,
    weather: "Cloudy",
    temperature: 18,
    activeMatch: MATCHES.find(m => m.venue === "BMO Field") || null,
    zones: [
      { name: "Gate 1 (Zone East)", occupancy: 32, peopleCount: 3200, capacity: 10000, status: "Normal" },
      { name: "Gate 2 (Zone West)", occupancy: 38, peopleCount: 3800, capacity: 10000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.1, parkingAvailability: 50 },
    sustainability: { energyKWh: 2100, waterLiters: 9000, wasteKg: 450, baselineEnergy: 2000, baselineWater: 8500, baselineWaste: 400 }
  },
  {
    name: "Estadio Akron",
    city: "Guadalajara",
    country: "Mexico",
    overallOccupancy: 55,
    weather: "Sunny",
    temperature: 26,
    activeMatch: MATCHES.find(m => m.venue === "Estadio Akron") || null,
    zones: [
      { name: "Acceso A (Zone A)", occupancy: 50, peopleCount: 7500, capacity: 15000, status: "Normal" },
      { name: "Acceso B (Zone B)", occupancy: 60, peopleCount: 9000, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.2, parkingAvailability: 40 },
    sustainability: { energyKWh: 3100, waterLiters: 14000, wasteKg: 780, baselineEnergy: 3000, baselineWater: 13500, baselineWaste: 750 }
  },
  {
    name: "Estadio BBVA",
    city: "Monterrey",
    country: "Mexico",
    overallOccupancy: 48,
    weather: "Hot",
    temperature: 32,
    activeMatch: MATCHES.find(m => m.venue === "Estadio BBVA") || null,
    zones: [
      { name: "Poniente (Zone 1)", occupancy: 45, peopleCount: 6750, capacity: 15000, status: "Normal" },
      { name: "Oriente (Zone 2)", occupancy: 51, peopleCount: 7650, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.0, parkingAvailability: 60 },
    sustainability: { energyKWh: 3400, waterLiters: 16000, wasteKg: 890, baselineEnergy: 3200, baselineWater: 15000, baselineWaste: 800 }
  },
  {
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "USA",
    overallOccupancy: 74,
    weather: "Indoor",
    temperature: 21,
    activeMatch: MATCHES.find(m => m.venue === "Mercedes-Benz Stadium") || null,
    zones: [
      { name: "Gate 1 (Zone East)", occupancy: 70, peopleCount: 14000, capacity: 20000, status: "Normal" },
      { name: "Gate 2 (Zone West)", occupancy: 78, peopleCount: 15600, capacity: 20000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "Busy", rideshareSurge: 1.4, parkingAvailability: 35 },
    sustainability: { energyKWh: 5400, waterLiters: 22000, wasteKg: 1200, baselineEnergy: 5200, baselineWater: 21000, baselineWaste: 1100 }
  },
  {
    name: "Gillette Stadium",
    city: "Boston",
    country: "USA",
    overallOccupancy: 40,
    weather: "Windy",
    temperature: 19,
    activeMatch: MATCHES.find(m => m.venue === "Gillette Stadium") || null,
    zones: [
      { name: "Enclosure A (Zone A)", occupancy: 35, peopleCount: 5250, capacity: 15000, status: "Normal" },
      { name: "Enclosure B (Zone B)", occupancy: 45, peopleCount: 6750, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.0, parkingAvailability: 70 },
    sustainability: { energyKWh: 2800, waterLiters: 12000, wasteKg: 650, baselineEnergy: 2900, baselineWater: 12500, baselineWaste: 600 }
  },
  {
    name: "AT&T Stadium",
    city: "Dallas (Arlington)",
    country: "USA",
    overallOccupancy: 68,
    weather: "Clear Sky",
    temperature: 29,
    activeMatch: MATCHES.find(m => m.venue === "AT&T Stadium") || null,
    zones: [
      { name: "Entry A (Zone A)", occupancy: 65, peopleCount: 13000, capacity: 20000, status: "Normal" },
      { name: "Entry B (Zone B)", occupancy: 71, peopleCount: 14200, capacity: 20000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.3, parkingAvailability: 45 },
    sustainability: { energyKWh: 6100, waterLiters: 26000, wasteKg: 1550, baselineEnergy: 5800, baselineWater: 24000, baselineWaste: 1400 }
  },
  {
    name: "NRG Stadium",
    city: "Houston",
    country: "USA",
    overallOccupancy: 50,
    weather: "Humid",
    temperature: 27,
    activeMatch: MATCHES.find(m => m.venue === "NRG Stadium") || null,
    zones: [
      { name: "Gate A (Zone A)", occupancy: 48, peopleCount: 7200, capacity: 15000, status: "Normal" },
      { name: "Gate B (Zone B)", occupancy: 52, peopleCount: 7800, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.1, parkingAvailability: 55 },
    sustainability: { energyKWh: 4300, waterLiters: 18000, wasteKg: 950, baselineEnergy: 4100, baselineWater: 17000, baselineWaste: 900 }
  },
  {
    name: "Arrowhead Stadium",
    city: "Kansas City",
    country: "USA",
    overallOccupancy: 38,
    weather: "Sunny",
    temperature: 23,
    activeMatch: MATCHES.find(m => m.venue === "Arrowhead Stadium") || null,
    zones: [
      { name: "Gate 1 (Zone 1)", occupancy: 35, peopleCount: 5250, capacity: 15000, status: "Normal" },
      { name: "Gate 2 (Zone 2)", occupancy: 41, peopleCount: 6150, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.0, parkingAvailability: 72 },
    sustainability: { energyKWh: 3300, waterLiters: 13000, wasteKg: 720, baselineEnergy: 3100, baselineWater: 12000, baselineWaste: 680 }
  },
  {
    name: "Hard Rock Stadium",
    city: "Miami",
    country: "USA",
    overallOccupancy: 85,
    weather: "Tropical",
    temperature: 30,
    activeMatch: MATCHES.find(m => m.venue === "Hard Rock Stadium") || null,
    zones: [
      { name: "North Gate (Zone 1)", occupancy: 82, peopleCount: 16400, capacity: 20000, status: "Warning" },
      { name: "South Gate (Zone 2)", occupancy: 88, peopleCount: 17600, capacity: 20000, status: "Warning" }
    ],
    transitStatus: { metro: "Delayed", shuttles: "Busy", rideshareSurge: 1.7, parkingAvailability: 15 },
    sustainability: { energyKWh: 6500, waterLiters: 29000, wasteKg: 1800, baselineEnergy: 5500, baselineWater: 25000, baselineWaste: 1500 }
  },
  {
    name: "Lincoln Financial Field",
    city: "Philadelphia",
    country: "USA",
    overallOccupancy: 42,
    weather: "Cloudy",
    temperature: 20,
    activeMatch: MATCHES.find(m => m.venue === "Lincoln Financial Field") || null,
    zones: [
      { name: "Gate A (Zone A)", occupancy: 38, peopleCount: 5700, capacity: 15000, status: "Normal" },
      { name: "Gate B (Zone B)", occupancy: 46, peopleCount: 6900, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.1, parkingAvailability: 65 },
    sustainability: { energyKWh: 2900, waterLiters: 11000, wasteKg: 620, baselineEnergy: 2800, baselineWater: 10500, baselineWaste: 580 }
  },
  {
    name: "Levi's Stadium",
    city: "San Francisco Bay Area (Santa Clara)",
    country: "USA",
    overallOccupancy: 62,
    weather: "Sunny",
    temperature: 25,
    activeMatch: MATCHES.find(m => m.venue === "Levi's Stadium") || null,
    zones: [
      { name: "Intel Gate (Zone A)", occupancy: 58, peopleCount: 8700, capacity: 15000, status: "Normal" },
      { name: "Toyota Gate (Zone B)", occupancy: 66, peopleCount: 9900, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.3, parkingAvailability: 40 },
    sustainability: { energyKWh: 4900, waterLiters: 21000, wasteKg: 1150, baselineEnergy: 4500, baselineWater: 19000, baselineWaste: 1000 }
  },
  {
    name: "Lumen Field",
    city: "Seattle",
    country: "USA",
    overallOccupancy: 58,
    weather: "Overcast",
    temperature: 17,
    activeMatch: MATCHES.find(m => m.venue === "Lumen Field") || null,
    zones: [
      { name: "Gate A (Zone 1)", occupancy: 54, peopleCount: 8100, capacity: 15000, status: "Normal" },
      { name: "Gate B (Zone 2)", occupancy: 62, peopleCount: 9300, capacity: 15000, status: "Normal" }
    ],
    transitStatus: { metro: "On Time", shuttles: "On Time", rideshareSurge: 1.2, parkingAvailability: 48 },
    sustainability: { energyKWh: 3500, waterLiters: 15000, wasteKg: 850, baselineEnergy: 3200, baselineWater: 14000, baselineWaste: 780 }
  }
];

const INITIAL_ACCESSIBILITY: AccessibilityRequest[] = [
  {
    id: "ACC-101",
    fanName: "Maria Santos",
    type: "Wheelchair Escort",
    stadiumName: "SoFi Stadium",
    location: "Gate A Entry",
    status: "Assigned",
    assignedVolunteer: "Carlos Ruiz",
    urgency: "High",
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 mins ago
    durationMinutes: 8
  },
  {
    id: "ACC-102",
    fanName: "David Miller",
    type: "Sensory Bag Request",
    stadiumName: "MetLife Stadium",
    location: "Section 121 Info Desk",
    status: "Received",
    assignedVolunteer: null,
    urgency: "Medium",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    durationMinutes: 2
  }
];

const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: "INC-301",
    stadiumName: "SoFi Stadium",
    zone: "Gate C (Zone D)",
    type: "Crowd Surge",
    description: "Gate C concourse is bottlenecked due to ticketing terminal lag. Occupancy is 94%.",
    severity: "High",
    status: "Active",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    aiMitigationPlaybook: "GENAI MITIGATION PLAYBOOK:\n1. Direct security staff to open auxiliary Gate D.\n2. Dispatch Volunteer Team 2 to guide ticket holders to adjacent Gate B.\n3. Broadcast multilingual notification: 'Gate C is congested. Access is available via Gate B with a 2-minute walk.'"
  }
];

const INITIAL_SUPPORT_CHATS: SupportChat[] = [
  {
    id: "CHAT-401",
    fanName: "Lucas Silva",
    stadiumName: "SoFi Stadium",
    status: "Waiting",
    assignedVolunteer: null,
    messages: [
      { id: "msg-1-lucas", sender: "user", text: "Socorro, não consigo encontrar a sala sensorial perto do Portão A.", timestamp: new Date(Date.now() - 3 * 60 * 1000), translatedText: "Help, I cannot find the sensory room near Gate A." }
    ],
    lastUpdated: new Date(Date.now() - 3 * 60 * 1000)
  },
  {
    id: "CHAT-402",
    fanName: "Aiko Tanaka",
    stadiumName: "MetLife Stadium",
    status: "Connected",
    assignedVolunteer: "Carlos Ruiz",
    messages: [
      { id: "msg-1-aiko", sender: "user", text: "Hello, is there a shuttle to parking lot J?", timestamp: new Date(Date.now() - 5 * 60 * 1000) },
      { id: "msg-2-aiko", sender: "volunteer", text: "Hello Aiko! Yes, shuttles leave from Gate B every 10 minutes to Lot J.", timestamp: new Date(Date.now() - 4 * 60 * 1000) },
      { id: "msg-3-aiko", sender: "user", text: "Great, thanks! Do I need a special ticket for it?", timestamp: new Date(Date.now() - 2 * 60 * 1000) }
    ],
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000)
  }
];

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stadiums, setStadiums] = useState<StadiumTelemetry[]>(INITIAL_STADIUMS);
  const [accessibilityRequests, setAccessibilityRequests] = useState<AccessibilityRequest[]>(INITIAL_ACCESSIBILITY);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [broadcasts, setBroadcasts] = useState<EmergencyBroadcast[]>([]);
  const [supportChats, setSupportChats] = useState<SupportChat[]>(INITIAL_SUPPORT_CHATS);
  const [isSurgeSimulationActive, setIsSurgeSimulationActive] = useState(false);
  const [surgeStadium, setSurgeStadium] = useState<string | null>(null);
  const [timeStep, setTimeStep] = useState(0);

  // New Grid Control States
  const [isEnergySavingMode, setIsEnergySavingMode] = useState(false);
  const [cleanupStadiums, setCleanupStadiums] = useState<string[]>([]);

  const toggleEnergySavingMode = () => {
    setIsEnergySavingMode(prev => !prev);
  };

  const dispatchCleanupCrew = (stadiumName: string) => {
    setCleanupStadiums(prev => [...prev, stadiumName]);
    setTimeout(() => {
      // De-active cleanup after 15 seconds
      setCleanupStadiums(prev => prev.filter(name => name !== stadiumName));
    }, 15000);
  };

  // Background Telemetry Simulation Ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStep(prev => prev + 1);

      // 1. Update accessibility requests with real-time status transitions
      setAccessibilityRequests(prevRequests =>
        prevRequests.map(req => {
          if (req.status !== "Resolved") {
            const ageSeconds = Math.floor((Date.now() - req.timestamp.getTime()) / 1000);
            const elapsed = Math.floor(ageSeconds / 60);

            let nextStatus: AccessibilityRequest["status"] = req.status;
            let volunteer = req.assignedVolunteer;

            if (req.status === "Received" && ageSeconds > 8) {
              const volunteersList = ["Carlos Ruiz", "Emma Johnson", "Lucas Vance", "Sophia Chen", "Marcus Brody"];
              const randomVol = volunteersList[Math.floor(Math.random() * volunteersList.length)];
              nextStatus = "Assigned";
              volunteer = randomVol;
            } else if (req.status === "Assigned" && ageSeconds > 18) {
              nextStatus = "En Route";
            } else if (req.status === "En Route" && ageSeconds > 32) {
              nextStatus = "Resolved";
            }

            return {
              ...req,
              status: nextStatus,
              assignedVolunteer: volunteer,
              durationMinutes: elapsed,
              urgency: elapsed > 10 ? "High" : req.urgency
            };
          }
          return req;
        })
      );

      // 1.5. Update incident status progression automatically
      setIncidents(prevIncidents =>
        prevIncidents.map(inc => {
          if (inc.status !== "Resolved") {
            const ageSeconds = Math.floor((Date.now() - inc.timestamp.getTime()) / 1000);
            let nextStatus: IncidentReport["status"] = inc.status;
            if (inc.status === "Active" && ageSeconds > 12) {
              nextStatus = "Investigating";
            } else if (inc.status === "Investigating" && ageSeconds > 28) {
              nextStatus = "Resolved";
            }
            return { ...inc, status: nextStatus };
          }
          return inc;
        })
      );

      // 2. Modulate stadium occupancy and telemetry slightly to show live updates
      setStadiums(prevStadiums =>
        prevStadiums.map(stadium => {
          // If this is the active surge stadium, drive occupancy up!
          const isSurging = isSurgeSimulationActive && stadium.name === surgeStadium;
          
          const updatedZones = stadium.zones.map(zone => {
            let occupancyChange = Math.floor(Math.random() * 5) - 2; // -2% to +2%
            if (isSurging && zone.name.includes("Gate C")) {
              occupancyChange = Math.floor(Math.random() * 4) + 2; // +2% to +5% surge
            }
            
            const newOccupancy = Math.max(5, Math.min(100, zone.occupancy + occupancyChange));
            const newCount = Math.floor((newOccupancy / 100) * zone.capacity);
            
            let status: ZoneTelemetry["status"] = "Normal";
            if (newOccupancy > 90) status = "Critical";
            else if (newOccupancy > 75) status = "Warning";

            return {
              ...zone,
              occupancy: newOccupancy,
              peopleCount: newCount,
              status
            };
          });

          // Re-calculate overall occupancy as average of zones
          const sumOcc = updatedZones.reduce((sum, z) => sum + z.occupancy, 0);
          const avgOcc = Math.round(sumOcc / updatedZones.length);

          // Update sustainability metrics slightly
          const rateMultiplier = avgOcc / 50; // Higher occupancy = more resources
          
          // Energy Savings factor: if saving mode is active, reduce energy load
          const energyFactor = isEnergySavingMode ? 0.35 : 1.0;
          const energyDelta = Math.round(20 * rateMultiplier * (Math.random() * 1.5) * energyFactor);
          const waterDelta = Math.round(80 * rateMultiplier * (Math.random() * 1.5));
          
          // Cleanup Crew factor: if cleanup is active, waste goes down
          const isCleanupActive = cleanupStadiums.includes(stadium.name);
          let wasteDelta = Math.round(5 * rateMultiplier * (Math.random() * 1.5));
          let finalWaste = stadium.sustainability.wasteKg;

          if (isCleanupActive) {
            finalWaste = Math.max(stadium.sustainability.baselineWaste, stadium.sustainability.wasteKg - Math.round(80 + Math.random() * 40));
          } else {
            finalWaste = stadium.sustainability.wasteKg + wasteDelta;
          }

          // Inhibit rideshare rates or transit variables
          const rideshareDelta = (Math.random() * 0.2 - 0.1);
          const newRideshare = Math.max(1.0, Math.min(3.0, parseFloat((stadium.transitStatus.rideshareSurge + rideshareDelta).toFixed(1))));

          return {
            ...stadium,
            overallOccupancy: avgOcc,
            zones: updatedZones,
            transitStatus: {
              ...stadium.transitStatus,
              rideshareSurge: newRideshare,
              parkingAvailability: Math.max(0, Math.min(100, stadium.transitStatus.parkingAvailability + (Math.random() > 0.6 ? 1 : -1)))
            },
            sustainability: {
              ...stadium.sustainability,
              energyKWh: stadium.sustainability.energyKWh + energyDelta,
              waterLiters: stadium.sustainability.waterLiters + waterDelta,
              wasteKg: finalWaste
            }
          };
        })
      );
    }, 5000); // Trigger every 5 seconds for responsive feel

    return () => clearInterval(interval);
  }, [isSurgeSimulationActive, surgeStadium, isEnergySavingMode, cleanupStadiums]);

  // Trigger a crowd surge
  const triggerSurgeSimulation = (stadiumName: string) => {
    setIsSurgeSimulationActive(true);
    setSurgeStadium(stadiumName);
    
    // Automatically trigger a crowd surge incident
    const stadiumObj = stadiums.find(s => s.name === stadiumName);
    const targetZone = stadiumObj?.zones[stadiumObj.zones.length - 1]?.name || "Gate C";
    
    reportIncident({
      stadiumName,
      zone: targetZone,
      type: "Crowd Surge",
      description: `Rapid crowd surge detected at ${stadiumName} - ${targetZone}. Feeds indicate bottleneck near entrance security gates.`,
      severity: "High"
    });
  };

  const stopSurgeSimulation = () => {
    setIsSurgeSimulationActive(false);
    setSurgeStadium(null);
  };

  // Add an accessibility request
  const addAccessibilityRequest = (req: Omit<AccessibilityRequest, "id" | "status" | "assignedVolunteer" | "timestamp" | "durationMinutes">) => {
    const newRequest: AccessibilityRequest = {
      ...req,
      id: `ACC-${Math.floor(100 + Math.random() * 900)}`,
      status: "Received",
      assignedVolunteer: null,
      timestamp: new Date(),
      durationMinutes: 0
    };
    setAccessibilityRequests(prev => [newRequest, ...prev]);
  };

  // Dispatch volunteer
  const dispatchVolunteer = (requestId: string, volunteerName: string) => {
    setAccessibilityRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: "Assigned", assignedVolunteer: volunteerName }
          : req
      )
    );
  };

  // Update status (Assigned -> En Route -> Resolved)
  const updateRequestStatus = (requestId: string, status: AccessibilityRequest["status"]) => {
    setAccessibilityRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status }
          : req
      )
    );
  };

  // Report incident
  const reportIncident = (inc: Omit<IncidentReport, "id" | "status" | "timestamp" | "aiMitigationPlaybook">) => {
    const id = `INC-${Math.floor(300 + Math.random() * 700)}`;
    const newIncident: IncidentReport = {
      ...inc,
      id,
      status: "Active",
      timestamp: new Date(),
      aiMitigationPlaybook: `GENAI MITIGATION PLAYBOOK (${id}):\n1. Alert stadium supervisors for ${inc.zone}.\n2. Shift crowd direction indicators to secondary gates.\n3. Broadcast warning details: 'Congestion detected in ${inc.zone}. Alternative exit paths are active.'`
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  // Update incident status
  const updateIncidentStatus = (incidentId: string, status: IncidentReport["status"]) => {
    setIncidents(prev =>
      prev.map(inc =>
        inc.id === incidentId
          ? { ...inc, status }
          : inc
      )
    );
  };

  // Create emergency alert broadcast
  const createEmergencyBroadcast = (stadiumName: string, zone: string, message: string): string => {
    const id = `BRC-${Math.floor(500 + Math.random() * 500)}`;
    const newBroadcast: EmergencyBroadcast = {
      id,
      message,
      stadiumName,
      zone,
      timestamp: new Date(),
      approved: false,
      status: "Pending"
    };
    setBroadcasts(prev => [newBroadcast, ...prev]);
    return id;
  };

  // Approve broadcast
  const approveBroadcast = (broadcastId: string) => {
    setBroadcasts(prev =>
      prev.map(brc =>
        brc.id === broadcastId
          ? { ...brc, approved: true, status: "Sent" }
          : brc
      )
    );
  };

  // Delete broadcast
  const deleteBroadcast = (broadcastId: string) => {
    setBroadcasts(prev => prev.filter(brc => brc.id !== broadcastId));
  };

  const addSupportChat = (fanName: string, stadiumName: string, initialMessage: string, translatedText?: string): string => {
    const id = `CHAT-${Math.floor(400 + Math.random() * 600)}`;
    const newChat: SupportChat = {
      id,
      fanName,
      stadiumName,
      status: "Waiting",
      assignedVolunteer: null,
      messages: [
        {
          id: `msg-${Date.now()}-user`,
          sender: "user",
          text: initialMessage,
          timestamp: new Date(),
          translatedText
        }
      ],
      lastUpdated: new Date()
    };
    setSupportChats(prev => [newChat, ...prev]);
    return id;
  };

  const sendChatMessage = (chatId: string, sender: "user" | "ai" | "volunteer", text: string, translatedText?: string) => {
    setSupportChats(prev =>
      prev.map(chat => {
        if (chat.id === chatId) {
          const newMsg = {
            id: `msg-${Date.now()}-${sender}`,
            sender,
            text,
            timestamp: new Date(),
            translatedText
          };
          return {
            ...chat,
            messages: [...chat.messages, newMsg],
            lastUpdated: new Date()
          };
        }
        return chat;
      })
    );
  };

  const connectVolunteerToChat = (chatId: string, volunteerName: string) => {
    setSupportChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, status: "Connected", assignedVolunteer: volunteerName, lastUpdated: new Date() }
          : chat
      )
    );
  };

  const resolveSupportChat = (chatId: string) => {
    setSupportChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, status: "Resolved", lastUpdated: new Date() }
          : chat
      )
    );
  };

  return (
    <SimulationContext.Provider
      value={{
        stadiums,
        accessibilityRequests,
        incidents,
        broadcasts,
        supportChats,
        isSurgeSimulationActive,
        timeStep,
        isEnergySavingMode,
        cleanupStadiums,
        toggleEnergySavingMode,
        dispatchCleanupCrew,
        triggerSurgeSimulation,
        stopSurgeSimulation,
        addAccessibilityRequest,
        dispatchVolunteer,
        updateRequestStatus,
        reportIncident,
        updateIncidentStatus,
        createEmergencyBroadcast,
        approveBroadcast,
        deleteBroadcast,
        addSupportChat,
        sendChatMessage,
        connectVolunteerToChat,
        resolveSupportChat
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};

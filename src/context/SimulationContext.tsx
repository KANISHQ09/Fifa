import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MATCHES, MatchInfo } from "../data/knowledgeBase";

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
  isSurgeSimulationActive: boolean;
  timeStep: number; // running tick
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
    sustainability: { energyKWh: 6800, waterLiters: 31000, wasteKg: 1950, baselineEnergy: 5500, baselineWater: 24000, baselineWaste: 1400 } // Anomaly waste & water
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

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stadiums, setStadiums] = useState<StadiumTelemetry[]>(INITIAL_STADIUMS);
  const [accessibilityRequests, setAccessibilityRequests] = useState<AccessibilityRequest[]>(INITIAL_ACCESSIBILITY);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [broadcasts, setBroadcasts] = useState<EmergencyBroadcast[]>([]);
  const [isSurgeSimulationActive, setIsSurgeSimulationActive] = useState(false);
  const [surgeStadium, setSurgeStadium] = useState<string | null>(null);
  const [timeStep, setTimeStep] = useState(0);

  // Background Telemetry Simulation Ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStep(prev => prev + 1);

      // 1. Update accessibility duration timers and auto-escalate
      setAccessibilityRequests(prevRequests =>
        prevRequests.map(req => {
          if (req.status !== "Resolved") {
            const elapsed = Math.floor((Date.now() - req.timestamp.getTime()) / 60000);
            return {
              ...req,
              durationMinutes: elapsed,
              // If it takes more than 10 mins and still Assigned/Received, mark High urgency
              urgency: elapsed > 10 ? "High" : req.urgency
            };
          }
          return req;
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
          const energyDelta = Math.round(20 * rateMultiplier * (Math.random() * 1.5));
          const waterDelta = Math.round(80 * rateMultiplier * (Math.random() * 1.5));
          const wasteDelta = Math.round(5 * rateMultiplier * (Math.random() * 1.5));

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
              wasteKg: stadium.sustainability.wasteKg + wasteDelta
            }
          };
        })
      );
    }, 5000); // Trigger every 5 seconds for responsive feel

    return () => clearInterval(interval);
  }, [isSurgeSimulationActive, surgeStadium]);

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

  return (
    <SimulationContext.Provider
      value={{
        stadiums,
        accessibilityRequests,
        incidents,
        broadcasts,
        isSurgeSimulationActive,
        timeStep,
        triggerSurgeSimulation,
        stopSurgeSimulation,
        addAccessibilityRequest,
        dispatchVolunteer,
        updateRequestStatus,
        reportIncident,
        updateIncidentStatus,
        createEmergencyBroadcast,
        approveBroadcast,
        deleteBroadcast
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

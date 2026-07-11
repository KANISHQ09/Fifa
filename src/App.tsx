import React, { useState } from "react";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import { CommandCenter } from "./components/CommandCenter";
import { AIConcierge } from "./components/AIConcierge";
import { NavigationWayfinding } from "./components/NavigationWayfinding";
import { AccessibilityCoordinator } from "./components/AccessibilityCoordinator";
import { TransportationAssistant } from "./components/TransportationAssistant";
import { SustainabilityDashboard } from "./components/SustainabilityDashboard";
import { VolunteerCopilot } from "./components/VolunteerCopilot";
import { 
  Activity, 
  User, 
  Globe, 
  Heart, 
  LifeBuoy
} from "lucide-react";

type Role = "organizer" | "fan" | "volunteer" | "accessibility";

const AppContent: React.FC = () => {
  const [activeRole, setActiveRole] = useState<Role>("organizer");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const { incidents, accessibilityRequests } = useSimulation();

  const activeIncidents = incidents.filter(i => i.status !== "Resolved").length;
  const activeAccessibility = accessibilityRequests.filter(r => r.status !== "Resolved").length;

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <Globe style={{ color: "var(--fifa-gold)", strokeWidth: 2.5 }} />
            StadiumPulse AI
          </div>
          <span className="brand-badge">FIFA 2026 Smart Venue</span>
        </div>

        {/* Role Selectors */}
        <div className="controls-section">
          <div className="role-selector">
            <button 
              id="role-btn-organizer"
              className={`role-btn ${activeRole === "organizer" ? "active" : ""}`}
              onClick={() => { setActiveRole("organizer"); setActiveTab("dashboard"); }}
            >
              <Activity size={14} /> Organizer
            </button>
            <button 
              id="role-btn-fan"
              className={`role-btn ${activeRole === "fan" ? "active" : ""}`}
              onClick={() => { setActiveRole("fan"); setActiveTab("concierge"); }}
            >
              <User size={14} /> Fan View
            </button>
            <button 
              id="role-btn-volunteer"
              className={`role-btn ${activeRole === "volunteer" ? "active" : ""}`}
              onClick={() => { setActiveRole("volunteer"); setActiveTab("copilot"); }}
            >
              <LifeBuoy size={14} /> Volunteer
            </button>
            <button 
              id="role-btn-accessibility"
              className={`role-btn ${activeRole === "accessibility" ? "active" : ""}`}
              onClick={() => { setActiveRole("accessibility"); setActiveTab("dispatch"); }}
            >
              <Heart size={14} /> Accessibility
            </button>
          </div>

          {/* Quick status bar */}
          <div style={{ display: "flex", gap: "12px", fontSize: "12px", borderLeft: "1px solid var(--border-glass)", paddingLeft: "16px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span className={`pulse-indicator ${activeIncidents > 0 ? "alert" : ""}`} />
              <strong>{activeIncidents}</strong> Safety Incidents
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Heart size={12} style={{ color: "var(--fifa-gold)" }} />
              <strong>{activeAccessibility}</strong> PWD Requests
            </span>
          </div>
        </div>
      </header>

      {/* Role Sub-Navigation Tabs */}
      <div style={{ background: "rgba(14, 20, 47, 0.2)", borderBottom: "1px solid var(--border-glass)" }}>
        <div className="main-content" style={{ padding: "8px 24px", display: "flex", gap: "10px" }}>
          {activeRole === "organizer" && (
            <>
              <button 
                id="tab-btn-dashboard"
                className="btn-secondary" 
                style={{ 
                  padding: "6px 14px", 
                  fontSize: "13px", 
                  background: activeTab === "dashboard" ? "rgba(255,255,255,0.08)" : "transparent",
                  borderColor: activeTab === "dashboard" ? "var(--fifa-gold)" : "transparent"
                }}
                onClick={() => setActiveTab("dashboard")}
              >
                Ops Command Dashboard
              </button>
              <button 
                id="tab-btn-sustainability"
                className="btn-secondary" 
                style={{ 
                  padding: "6px 14px", 
                  fontSize: "13px", 
                  background: activeTab === "sustainability" ? "rgba(255,255,255,0.08)" : "transparent",
                  borderColor: activeTab === "sustainability" ? "var(--fifa-gold)" : "transparent"
                }}
                onClick={() => setActiveTab("sustainability")}
              >
                Sustainability & Resource Metrics
              </button>
            </>
          )}

          {activeRole === "fan" && (
            <>
              <button 
                id="tab-btn-concierge"
                className="btn-secondary" 
                style={{ 
                  padding: "6px 14px", 
                  fontSize: "13px", 
                  background: activeTab === "concierge" ? "rgba(255,255,255,0.08)" : "transparent",
                  borderColor: activeTab === "concierge" ? "var(--fifa-gold)" : "transparent"
                }}
                onClick={() => setActiveTab("concierge")}
              >
                AI Concierge Assistant
              </button>
              <button 
                id="tab-btn-navigation"
                className="btn-secondary" 
                style={{ 
                  padding: "6px 14px", 
                  fontSize: "13px", 
                  background: activeTab === "navigation" ? "rgba(255,255,255,0.08)" : "transparent",
                  borderColor: activeTab === "navigation" ? "var(--fifa-gold)" : "transparent"
                }}
                onClick={() => setActiveTab("navigation")}
              >
                Interactive Stadium Navigation
              </button>
              <button 
                id="tab-btn-transit"
                className="btn-secondary" 
                style={{ 
                  padding: "6px 14px", 
                  fontSize: "13px", 
                  background: activeTab === "transit" ? "rgba(255,255,255,0.08)" : "transparent",
                  borderColor: activeTab === "transit" ? "var(--fifa-gold)" : "transparent"
                }}
                onClick={() => setActiveTab("transit")}
              >
                multimodal Departure Planner
              </button>
            </>
          )}

          {activeRole === "volunteer" && (
            <button 
              id="tab-btn-copilot"
              className="btn-secondary" 
              style={{ 
                padding: "6px 14px", 
                fontSize: "13px", 
                background: "rgba(255,255,255,0.08)", 
                borderColor: "var(--fifa-gold)" 
              }}
              onClick={() => setActiveTab("copilot")}
            >
              Volunteer Copilot Console
            </button>
          )}

          {activeRole === "accessibility" && (
            <button 
              id="tab-btn-dispatch"
              className="btn-secondary" 
              style={{ 
                padding: "6px 14px", 
                fontSize: "13px", 
                background: "rgba(255,255,255,0.08)", 
                borderColor: "var(--fifa-gold)" 
              }}
              onClick={() => setActiveTab("dispatch")}
            >
              Accessibility Triage & Dispatch
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <main className="main-content">
        {activeRole === "organizer" && activeTab === "dashboard" && <CommandCenter />}
        {activeRole === "organizer" && activeTab === "sustainability" && <SustainabilityDashboard />}
        
        {activeRole === "fan" && activeTab === "concierge" && <AIConcierge />}
        {activeRole === "fan" && activeTab === "navigation" && <NavigationWayfinding />}
        {activeRole === "fan" && activeTab === "transit" && <TransportationAssistant />}
        
        {activeRole === "volunteer" && activeTab === "copilot" && <VolunteerCopilot />}
        
        {activeRole === "accessibility" && activeTab === "dispatch" && <AccessibilityCoordinator />}
      </main>

      <footer style={{ borderTop: "1px solid var(--border-glass)", padding: "16px 24px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center", background: "#04050d" }}>
        StadiumPulse AI Platform &bull; FIFA World Cup 2026 Venue Operations &bull; Designed for WCAG 2.2 AA Compliance
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}

import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import type { StadiumTelemetry } from "../context/SimulationContext";
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Send, 
  FileText, 
  TrendingUp, 
  Volume2, 
  Globe 
} from "lucide-react";

export const CommandCenter: React.FC = () => {
  const { 
    stadiums, 
    incidents, 
    broadcasts, 
    isSurgeSimulationActive, 
    triggerSurgeSimulation, 
    stopSurgeSimulation, 
    updateIncidentStatus,
    createEmergencyBroadcast,
    approveBroadcast,
    deleteBroadcast
  } = useSimulation();

  const [selectedStadium, setSelectedStadium] = useState<StadiumTelemetry>(stadiums[0]);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  
  // Broadcast Form State
  const [broadcastTargetZone, setBroadcastTargetZone] = useState<string>("All");
  const [broadcastMessage, setBroadcastMessage] = useState<string>("");
  const [broadcastStatusMessage, setBroadcastStatusMessage] = useState<string>("");

  const filteredStadiums = stadiums.filter(s => 
    selectedCountry === "All" || s.country === selectedCountry
  );

  // Generate a dynamic GenAI Status Summary
  const generateAISummary = (stadium: StadiumTelemetry) => {
    const activeIncidentsCount = incidents.filter(i => i.stadiumName === stadium.name && i.status !== "Resolved").length;
    const criticalZones = stadium.zones.filter(z => z.status === "Critical");
    const warningZones = stadium.zones.filter(z => z.status === "Warning");
    const wasteAnomaly = stadium.sustainability.wasteKg > stadium.sustainability.baselineWaste * 1.15;
    
    let summary = `[StadiumPulse AI Executive Report - ${stadium.name}]: `;
    
    if (activeIncidentsCount > 0 || criticalZones.length > 0) {
      summary += `🚨 HIGH ALERT. The venue is experiencing elevated operational pressure. `;
      if (criticalZones.length > 0) {
        summary += `${criticalZones.map(z => z.name).join(", ")} exceeded critical density limit (${criticalZones[0].occupancy}%). `;
      }
      if (activeIncidentsCount > 0) {
        summary += `There are ${activeIncidentsCount} active safety incidents requiring dispatcher attention. `;
      }
      summary += `AI Playbooks have been routed to concourse supervisors. Immediate crowd redirection is recommended.`;
    } else if (warningZones.length > 0) {
      summary += `⚠️ MODERATE ALERT. General crowd flow is stable, but density bottlenecks are building at ${warningZones.map(z => z.name).join(", ")}. `;
      summary += `Rerouting pathways are being calculated to maintain safety margins. Transit delays reported at LA/Metro networks.`;
    } else {
      summary += `🟢 NORMAL OPERATIONS. Crowd density is distributed evenly across all zones. `;
      summary += `Transit systems are operating within nominal schedules. Eco-telemetry reports baseline energy consumption.`;
    }

    if (wasteAnomaly) {
      summary += ` Eco-alert: Waste bins at Gate C/D are filling 25% faster than match-day baseline. Dispatching early cleaning crew recommended.`;
    }

    return summary;
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    createEmergencyBroadcast(selectedStadium.name, broadcastTargetZone, broadcastMessage);
    setBroadcastMessage("");
    setBroadcastStatusMessage("Alert queued! Awaiting coordinator approval (Human-in-the-Loop gating).");
    setTimeout(() => setBroadcastStatusMessage(""), 5000);
  };

  return (
    <div className="role-view-wrapper animated-entry">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Globe size={28} /> Operations Command Center
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time cross-venue command console for tournament operations & crowd safety coordination.
          </p>
        </div>

        {/* Simulator controls */}
        <div className="simulation-control-panel">
          <span style={{ fontSize: "13px", fontWeight: "600" }}>Simulation Engine:</span>
          {isSurgeSimulationActive ? (
            <button 
              className="btn-primary" 
              style={{ background: "var(--danger-red)", color: "#FFFFFF", padding: "6px 12px", borderRadius: "20px", fontSize: "12px" }}
              onClick={stopSurgeSimulation}
            >
              Stop Crowd Surge
            </button>
          ) : (
            <button 
              className="btn-primary" 
              style={{ background: "var(--fifa-gold)", color: "#000000", padding: "6px 12px", borderRadius: "20px", fontSize: "12px" }}
              onClick={() => triggerSurgeSimulation(selectedStadium.name)}
            >
              Simulate Crowd Surge
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
        
        {/* Left Sidebar: Venue list */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>
              Venues (16 Host Cities)
            </h3>
            
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {["All", "USA", "Mexico", "Canada"].map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  style={{
                    background: selectedCountry === c ? "var(--fifa-blue)" : "rgba(255,255,255,0.05)",
                    border: "none",
                    color: "#FFFFFF",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredStadiums.map(stadium => {
                const isSelected = selectedStadium.name === stadium.name;
                const activeAlerts = incidents.filter(i => i.stadiumName === stadium.name && i.status !== "Resolved").length;
                const criticalCount = stadium.zones.filter(z => z.status === "Critical").length;

                return (
                  <div
                    key={stadium.name}
                    onClick={() => setSelectedStadium(stadium)}
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      background: isSelected ? "rgba(212, 175, 55, 0.12)" : "rgba(255,255,255,0.02)",
                      border: isSelected ? "1px solid var(--fifa-gold)" : "1px solid var(--border-glass)",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", fontSize: "14px", color: isSelected ? "var(--fifa-gold)" : "var(--text-primary)" }}>
                        {stadium.name}
                      </span>
                      <span className="pulse-indicator" style={{ background: criticalCount > 0 ? "var(--danger-red)" : activeAlerts > 0 ? "var(--warning-orange)" : "var(--stadium-green)", boxShadow: `0 0 6px ${criticalCount > 0 ? "var(--danger-red)" : activeAlerts > 0 ? "var(--warning-orange)" : "var(--stadium-green)"}` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <span>{stadium.city}</span>
                      <span style={{ fontWeight: "600" }}>{stadium.overallOccupancy}% Cap</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Dashboard Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Top Section: Venue Snapshot & AI Executive Summary */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span className="badge-status info" style={{ marginBottom: "6px" }}>
                  Active Venue Dashboard
                </span>
                <h3 style={{ fontSize: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin style={{ color: "var(--fifa-gold)" }} /> {selectedStadium.name} ({selectedStadium.city}, {selectedStadium.country})
                </h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Current Temp</span>
                <p style={{ fontSize: "20px", fontWeight: "700" }}>{selectedStadium.temperature}°C - {selectedStadium.weather}</p>
              </div>
            </div>

            {/* GenAI Executive Summary Card */}
            <div 
              style={{ 
                background: "rgba(0, 125, 255, 0.08)", 
                borderLeft: "4px solid var(--fifa-blue)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start"
              }}
            >
              <FileText style={{ color: "var(--fifa-blue)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  GenAI Venue Summary (Refreshed Real-Time)
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {generateAISummary(selectedStadium)}
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Concourse Densities & Telemetry */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            {/* Zone/Gate Density Telemetry */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} style={{ color: "var(--stadium-green)" }} /> Concourse Gate Density Feeds
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedStadium.zones.map(zone => {
                  let barColor = "var(--stadium-green)";
                  if (zone.status === "Critical") barColor = "var(--danger-red)";
                  else if (zone.status === "Warning") barColor = "var(--warning-orange)";

                  return (
                    <div key={zone.name} style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600" }}>{zone.name}</span>
                        <span className={`badge-status ${zone.status === "Critical" ? "danger" : zone.status === "Warning" ? "warning" : "success"}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
                          {zone.status}
                        </span>
                      </div>
                      
                      <div style={{ background: "rgba(255,255,255,0.1)", height: "8px", borderRadius: "4px", overflow: "hidden", margin: "8px 0" }}>
                        <div style={{ background: barColor, height: "100%", width: `${zone.occupancy}%`, borderRadius: "4px", transition: "width 0.5s ease-in-out" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)" }}>
                        <span>{zone.peopleCount.toLocaleString()} / {zone.capacity.toLocaleString()} Fans</span>
                        <span>{zone.occupancy}% Occupied</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transit & Infrastructure Feeds */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={18} style={{ color: "var(--fifa-gold)" }} /> Transit & Infrastructure Telemetry
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", height: "calc(100% - 36px)" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>City Metro Line</span>
                  <p style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px", color: selectedStadium.transitStatus.metro === "Delayed" ? "var(--danger-red)" : "var(--stadium-green)" }}>
                    {selectedStadium.transitStatus.metro}
                  </p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Shuttle Frequencies</span>
                  <p style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px", color: selectedStadium.transitStatus.shuttles === "Busy" ? "var(--warning-orange)" : "var(--stadium-green)" }}>
                    {selectedStadium.transitStatus.shuttles}
                  </p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Rideshare Surge</span>
                  <p style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px", color: "var(--fifa-gold)" }}>
                    {selectedStadium.transitStatus.rideshareSurge}x
                  </p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Stadium Parking Spot</span>
                  <p style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px" }}>
                    {selectedStadium.transitStatus.parkingAvailability}% Empty
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Safety Incidents & Broadcast Approval Queue */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
            
            {/* Safety Incidents */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={18} style={{ color: "var(--danger-red)" }} /> Active Safety Incidents ({incidents.filter(i => i.status !== "Resolved").length})
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                {incidents.filter(i => i.status !== "Resolved").map(incident => (
                  <div key={incident.id} style={{ background: "rgba(255,255,255,0.01)", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,61,113,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span className="badge-status danger">{incident.type}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{incident.id}</span>
                    </div>

                    <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>{incident.stadiumName} - {incident.zone}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{incident.description}</p>
                    
                    {/* GenAI Playbook Abstraction */}
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "4px", fontSize: "11px", marginTop: "10px", borderLeft: "2px solid var(--fifa-gold)" }}>
                      <p style={{ fontWeight: "700", color: "var(--fifa-gold)", marginBottom: "4px" }}>GenAI Action Playbook:</p>
                      <p style={{ whiteSpace: "pre-line", color: "var(--text-secondary)" }}>{incident.aiMitigationPlaybook}</p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      {incident.status === "Active" && (
                        <button 
                          className="btn-secondary" 
                          style={{ padding: "6px 12px", fontSize: "11px" }}
                          onClick={() => updateIncidentStatus(incident.id, "Investigating")}
                        >
                          Investigate
                        </button>
                      )}
                      <button 
                        className="btn-primary" 
                        style={{ background: "var(--stadium-green)", padding: "6px 12px", fontSize: "11px" }}
                        onClick={() => updateIncidentStatus(incident.id, "Resolved")}
                      >
                        Resolve Incident
                      </button>
                    </div>
                  </div>
                ))}

                {incidents.filter(i => i.status !== "Resolved").length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No active safety incidents. All zones are safe.
                  </div>
                )}
              </div>
            </div>

            {/* Broadcast Dispatch & Approval Queue (Human-In-The-Loop) */}
            <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Volume2 size={18} style={{ color: "var(--fifa-blue)" }} /> Broadcast Alert Dispatch
              </h3>

              {/* Form */}
              <form onSubmit={handleCreateBroadcast} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Target Area</label>
                  <select 
                    value={broadcastTargetZone} 
                    onChange={e => setBroadcastTargetZone(e.target.value)}
                    style={{ padding: "8px", fontSize: "12px" }}
                  >
                    <option value="All">All Concourse Zones</option>
                    {selectedStadium.zones.map(z => (
                      <option key={z.name} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>Alert Broadcast Message</label>
                  <textarea 
                    rows={2}
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    placeholder="Describe safety alert details here..."
                    style={{ fontSize: "12px" }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "8px", fontSize: "12px", background: "var(--fifa-blue)", color: "#FFFFFF" }}>
                  <Send size={12} /> Queue Broadcast Draft
                </button>
                
                {broadcastStatusMessage && (
                  <p style={{ fontSize: "11px", color: "var(--stadium-green)", marginTop: "4px", textAlign: "center" }}>{broadcastStatusMessage}</p>
                )}
              </form>

              {/* Pending Queue */}
              <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "12px", flex: 1, maxHeight: "150px", overflowY: "auto" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                  Review Queue ({broadcasts.filter(b => !b.approved).length} Pending Approval)
                </span>
                
                {broadcasts.filter(b => !b.approved).map(brc => (
                  <div key={brc.id} style={{ padding: "8px", background: "rgba(0,125,255,0.05)", borderRadius: "4px", marginBottom: "6px", border: "1px solid rgba(0,125,255,0.15)" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700" }}>Target: {brc.zone}</p>
                    <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>"{brc.message}"</p>
                    
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: "4px 8px", fontSize: "10px", background: "var(--stadium-green)" }}
                        onClick={() => approveBroadcast(brc.id)}
                      >
                        Approve & Send
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: "4px 8px", fontSize: "10px" }}
                        onClick={() => deleteBroadcast(brc.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}

                {broadcasts.filter(b => !b.approved).length === 0 && (
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", padding: "10px" }}>
                    No drafts pending approval.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Activity, 
  Camera, 
  ShieldAlert, 
  UserCheck, 
  Sparkles,
  TrendingUp
} from "lucide-react";

export const CrowdIntelligence: React.FC = () => {
  const { stadiums, reportIncident, timeStep } = useSimulation();
  const [selectedStadiumName, setSelectedStadiumName] = useState(stadiums[0].name);
  const [activeCamera, setActiveCamera] = useState<string>("All");
  const [densityHistory, setDensityHistory] = useState<number[]>([40, 42, 45, 48, 50, 52]);

  const currentStadium = stadiums.find(s => s.name === selectedStadiumName) || stadiums[0];

  // Capture density history on simulation ticks to draw a live chart
  useEffect(() => {
    setDensityHistory(prev => {
      const next = [...prev, currentStadium.overallOccupancy];
      if (next.length > 8) {
        next.shift();
      }
      return next;
    });
  }, [timeStep, currentStadium.overallOccupancy]);

  const handleDispatchCrowdControl = (zoneName: string) => {
    reportIncident({
      stadiumName: currentStadium.name,
      zone: zoneName,
      type: "Crowd Surge",
      description: `Tactical crowd control unit and guest services dispatched to ${zoneName} to assist with queue management.`,
      severity: "Medium"
    });
  };

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;

  // Compute SVG Points for Density Line Chart
  const linePoints = densityHistory.map((val, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (densityHistory.length - 1 || 1);
    const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="role-view-wrapper animated-entry">
      
      {/* Header section */}
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={28} /> Crowd Intelligence Engine
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Live computer-vision analytics, aggregate counting camera telemetry, and predictive surge mitigation.
          </p>
        </div>

        <div>
          <select 
            value={selectedStadiumName} 
            onChange={e => {
              setSelectedStadiumName(e.target.value);
              // Reset density history
              const stadiumObj = stadiums.find(s => s.name === e.target.value) || stadiums[0];
              setDensityHistory([stadiumObj.overallOccupancy - 5, stadiumObj.overallOccupancy - 2, stadiumObj.overallOccupancy]);
            }}
            style={{ width: "220px", padding: "8px 12px" }}
          >
            {stadiums.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="responsive-grid-2col-unequal">
        
        {/* Left Side: CCTV Live Camera Feed Grid */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card-header-responsive">
            <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Camera size={18} style={{ color: "var(--fifa-blue)" }} /> Live Computer-Vision CCTV Feeds (Anonymized)
            </h3>
            
            <div className="card-header-actions">
              {["All", "Gate C", "Verizon Gate", "MetLife Gate"].map(cam => (
                <button
                  key={cam}
                  onClick={() => setActiveCamera(cam)}
                  style={{
                    background: activeCamera === cam ? "var(--fifa-blue)" : "rgba(255,255,255,0.03)",
                    border: "none",
                    color: "#FFFFFF",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  {cam}
                </button>
              ))}
            </div>
          </div>

          {/* 2x2 Feeds Grid */}
          <div 
            className="cctv-feeds-grid"
            style={{ 
              gridTemplateColumns: activeCamera === "All" ? undefined : "minmax(0, 1fr)" 
            }}
          >
            {[
              { id: "CAM-01", zone: "Gate C (Zone D)", desc: "Security Entrance Ring", baseCount: 154 },
              { id: "CAM-02", zone: "Verizon Gate (Zone 3)", desc: "Upper Concourse Outer Corridor", baseCount: 88 },
              { id: "CAM-03", zone: "MetLife Gate (Zone 1)", desc: "Main Turnstiles Area", baseCount: 204 },
              { id: "CAM-04", zone: "HCLTech Gate (Zone 4)", desc: "Lower Tier Access Ramp", baseCount: 65 }
            ]
              .filter(feed => activeCamera === "All" || feed.zone.includes(activeCamera))
              .map(feed => {
                const zoneObj = currentStadium.zones.find(z => feed.zone.includes(z.name.replace(/Gate/g, ""))) || currentStadium.zones[0];
                const occupancy = zoneObj ? zoneObj.occupancy : 50;
                const status = zoneObj ? zoneObj.status : "Normal";
                
                // Color depending on density status
                const boxColor = status === "Critical" ? "#D93025" : status === "Warning" ? "#E37400" : "#0F9D58";
                
                // Animate count slightly based on timeStep
                const currentCount = Math.round((occupancy / 100) * (zoneObj ? zoneObj.capacity : 1000));

                return (
                  <div 
                    key={feed.id} 
                    style={{ 
                      background: "#080B10", 
                      borderRadius: "8px", 
                      border: `1px solid ${status === "Critical" ? "rgba(217,48,37,0.3)" : "rgba(255,255,255,0.08)"}`,
                      position: "relative",
                      overflow: "hidden",
                      aspectRatio: "16/10",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "12px",
                      boxShadow: status === "Critical" ? "0 0 15px rgba(217, 48, 37, 0.15)" : "none"
                    }}
                  >
                    {/* Bounding box simulation overlays */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
                      
                      {/* Bounding Box 1 */}
                      <div style={{
                        position: "absolute",
                        border: `1.5px solid ${boxColor}`,
                        top: "25%",
                        left: "35%",
                        width: "50px",
                        height: "80px",
                        opacity: 0.6,
                        boxShadow: `0 0 8px ${boxColor}33`
                      }}>
                        <span style={{ fontSize: "8px", background: boxColor, color: "#FFFFFF", padding: "1px 3px", position: "absolute", top: "-10px", left: "-1px", whiteSpace: "nowrap" }}>
                          Person {feed.id}-12
                        </span>
                      </div>

                      {/* Bounding Box 2 */}
                      <div style={{
                        position: "absolute",
                        border: `1.5px solid ${boxColor}`,
                        top: "40%",
                        left: "60%",
                        width: "45px",
                        height: "75px",
                        opacity: 0.5,
                        boxShadow: `0 0 8px ${boxColor}33`
                      }}>
                        <span style={{ fontSize: "8px", background: boxColor, color: "#FFFFFF", padding: "1px 3px", position: "absolute", top: "-10px", left: "-1px", whiteSpace: "nowrap" }}>
                          Person {feed.id}-45
                        </span>
                      </div>

                      {/* CCTV scanline */}
                      <div style={{
                        width: "100%",
                        height: "1px",
                        background: "rgba(255,255,255,0.04)",
                        position: "absolute",
                        top: `${(timeStep * 15) % 100}%`,
                        left: 0,
                        boxShadow: "0 0 2px rgba(255,255,255,0.1)"
                      }} />
                    </div>

                    {/* Camera Header Overlay */}
                    <div style={{ display: "flex", justifyContent: "space-between", zIndex: 5 }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#FFFFFF" }}>{feed.id} // {feed.zone}</span>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px" }}>{feed.desc}</span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ 
                          width: "6px", 
                          height: "6px", 
                          borderRadius: "50%", 
                          background: "#D93025", 
                          animation: "pulse 1s infinite alternate" 
                        }} />
                        <span style={{ fontSize: "9px", color: "#D93025", fontWeight: "800" }}>LIVE</span>
                      </div>
                    </div>

                    {/* Camera Footer Overlay */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 5 }}>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        UTC -05:00 // FPS: 29.97
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-sidebar)", display: "block" }}>CV Crowd Est:</span>
                        <span style={{ fontSize: "16px", fontWeight: "800", color: boxColor }}>
                          {currentCount.toLocaleString()} <span style={{ fontSize: "9px", fontWeight: "500", color: "var(--text-muted)" }}>FANS</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Side: Telemetry Charts & Warnings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Live Line Chart */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} style={{ color: "var(--fifa-gold)" }} /> Live Density Trend (Overall Stadium %)
            </h3>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto" }}>
                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100].map(val => {
                  const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / 100;
                  return (
                    <g key={val}>
                      <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <text x={padding - 5} y={y + 3} fontSize="8" fill="var(--text-muted)" textAnchor="end">{val}%</text>
                    </g>
                  );
                })}
                
                {/* Chart Line Path */}
                {densityHistory.length > 1 && (
                  <>
                    {/* Shadow Area below line */}
                    <path
                      d={`M ${padding},${chartHeight - padding} L ${linePoints} L ${chartWidth - padding},${chartHeight - padding} Z`}
                      fill="url(#chartGrad)"
                      opacity="0.2"
                    />
                    {/* Main Line */}
                    <polyline
                      fill="none"
                      stroke="var(--fifa-blue)"
                      strokeWidth="2.5"
                      points={linePoints}
                      strokeLinecap="round"
                    />
                  </>
                )}
                
                {/* Definitions */}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--fifa-blue)" />
                    <stop offset="100%" stopColor="var(--fifa-blue)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)", marginTop: "6px" }}>
              <span>-30s ago</span>
              <span>-15s ago</span>
              <span>Live Tick ({currentStadium.overallOccupancy}%)</span>
            </div>
          </div>

          {/* Surge Warning Playbook widget */}
          <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} style={{ color: "var(--danger-red)" }} /> Predictive Surge Advisories
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
              {currentStadium.zones.filter(z => z.status === "Critical" || z.status === "Warning").map(zone => (
                <div 
                  key={zone.name} 
                  style={{ 
                    background: zone.status === "Critical" ? "rgba(217,48,37,0.06)" : "rgba(227,116,0,0.06)", 
                    border: `1px solid ${zone.status === "Critical" ? "var(--danger-red)" : "var(--warning-orange)"}`, 
                    padding: "14px", 
                    borderRadius: "8px" 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>{zone.name} Surge Risk</span>
                    <span className={`badge-status ${zone.status === "Critical" ? "danger" : "warning"}`} style={{ fontSize: "9px", padding: "1px 4px" }}>
                      {zone.status}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Density has reached **{zone.occupancy}%** with a projected surge risk model of **{(zone.occupancy * 1.05).toFixed(0)}%** over the next 10 minutes.
                  </p>

                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "4px", fontSize: "11px", marginTop: "10px", borderLeft: "2px solid var(--fifa-gold)" }}>
                    <p style={{ fontWeight: "700", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Sparkles size={11} /> AI Suggested Mitigation Strategy:
                    </p>
                    <p style={{ marginTop: "4px", color: "var(--text-primary)" }}>
                      1. Open adjacent relief turnstiles immediately.<br />
                      2. Shift path route anchors in Navigation guides to divert incoming fans.<br />
                      3. Dispatch staff to assist with manual ticketing overrides.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleDispatchCrowdControl(zone.name)}
                      style={{ padding: "6px 12px", fontSize: "11px", background: "var(--danger-red)", color: "#FFFFFF" }}
                    >
                      <UserCheck size={12} /> Dispatch Stewards Team
                    </button>
                  </div>
                </div>
              ))}

              {currentStadium.zones.filter(z => z.status === "Critical" || z.status === "Warning").length === 0 && (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "12px" }}>
                  🟢 General density distribution is within normal margins. Predictive algorithms anticipate no surge anomalies in the next 15 minutes.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

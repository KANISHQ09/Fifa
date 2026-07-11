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
  Globe, 
  Activity, 
  User, 
  Compass, 
  Heart, 
  Car, 
  Leaf, 
  LifeBuoy, 
  ShieldAlert, 
  Settings,
  Menu,
  Search,
  Bell,
  LogOut,
  Trophy,
  Users,
  AlertTriangle,
  CheckCircle,
  Flame,
  Activity as AnalyticsIcon,
  MessageSquare,
  List
} from "lucide-react";

// Types
type ActiveMenu = 
  | "overview" 
  | "command_center" 
  | "crowd_intelligence" 
  | "ai_concierge" 
  | "navigation" 
  | "accessibility" 
  | "transportation" 
  | "sustainability" 
  | "volunteers" 
  | "incidents"
  | "analytics"
  | "settings";

// --- Sub-Component: Overview Dashboard (Matches the reference image exactly) ---
const OverviewDashboard: React.FC = () => {
  const { stadiums, incidents, accessibilityRequests } = useSimulation();
  const [selectedMapStadium, setSelectedMapStadium] = useState<string>("MetLife Stadium");
  const [alertFilter, setAlertFilter] = useState<string>("All");

  const currentStadium = stadiums.find(s => s.name === selectedMapStadium) || stadiums[0];

  // Calculate Metrics
  const openIncidentsCount = incidents.filter(i => i.status !== "Resolved").length;
  const criticalIncidentsCount = incidents.filter(i => i.status !== "Resolved" && i.severity === "High").length;
  const activeAccessibilityCount = accessibilityRequests.filter(r => r.status !== "Resolved").length;

  // Filter Alerts & Feeds
  const getFilteredAlerts = () => {
    const rawAlerts = [
      { id: "A1", type: "Critical", text: "Crowd Surge Detected", details: "Concourse B, Gate 12 - MetLife Stadium", time: "2 min ago", icon: <Flame size={14} style={{ color: "var(--danger-red)" }} /> },
      { id: "A2", type: "Warning", text: "High Density Warning", details: "Lower Tier, Section 132 - AT&T Stadium", time: "5 min ago", icon: <AlertTriangle size={14} style={{ color: "var(--warning-orange)" }} /> },
      { id: "A3", type: "Info", text: "Accessibility Request", details: "Wheelchair Assistance - Gate 7", time: "6 min ago", icon: <Heart size={14} style={{ color: "var(--fifa-blue)" }} /> },
      { id: "A4", type: "Info", text: "Weather Alert", details: "Thunderstorm expected in 2 hrs - Miami", time: "15 min ago", icon: <Globe size={14} style={{ color: "var(--fifa-blue)" }} /> },
      { id: "A5", type: "Info", text: "System Update", details: "All systems operational", time: "30 min ago", icon: <CheckCircle size={14} style={{ color: "var(--stadium-green)" }} /> }
    ];

    // Push live simulator incidents in real time!
    incidents.filter(i => i.status !== "Resolved").forEach(inc => {
      rawAlerts.unshift({
        id: inc.id,
        type: inc.severity === "High" ? "Critical" : "Warning",
        text: inc.type,
        details: `${inc.zone} - ${inc.stadiumName}`,
        time: "Just Now",
        icon: inc.severity === "High" 
          ? <Flame size={14} style={{ color: "var(--danger-red)" }} />
          : <AlertTriangle size={14} style={{ color: "var(--warning-orange)" }} />
      });
    });

    return rawAlerts.filter(a => alertFilter === "All" || a.type === alertFilter);
  };

  // Seating colors based on occupancy level
  const getSeatColor = (occ: number) => {
    if (occ > 85) return "var(--danger-red)";
    if (occ > 60) return "var(--warning-orange)";
    return "var(--stadium-green)";
  };

  return (
    <div className="role-view-wrapper animated-entry" style={{ padding: "24px 32px" }}>
      
      {/* 1. Metrics Grid Row */}
      <div className="metrics-grid">
        {/* Metric 1 */}
        <div className="metric-widget">
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>TOTAL ATTENDANCE TODAY</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>457,892</h3>
            <span style={{ fontSize: "11px", color: "var(--stadium-green)", fontWeight: "700", display: "block", marginTop: "4px" }}>↑ 8.6% vs yesterday</span>
          </div>
          <div className="metric-circle-icon" style={{ background: "var(--neutral-purple-bg)" }}>
            <Users size={20} style={{ color: "var(--neutral-purple)" }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="metric-widget">
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>ACTIVE MATCHES</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>6</h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>Live across venues</span>
          </div>
          <div className="metric-circle-icon" style={{ background: "var(--stadium-green-bg)" }}>
            <Globe size={20} style={{ color: "var(--stadium-green)" }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="metric-widget">
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>CROWD DENSITY (AVG)</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>Medium</h3>
            <span style={{ fontSize: "11px", color: "var(--stadium-green)", fontWeight: "700", display: "block", marginTop: "4px" }}>↑ 12% vs yesterday</span>
          </div>
          <div className="metric-circle-icon" style={{ background: "var(--warning-orange-bg)" }}>
            <Flame size={20} style={{ color: "var(--warning-orange)" }} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="metric-widget">
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>OPEN INCIDENTS</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px", color: openIncidentsCount > 0 ? "var(--danger-red)" : "inherit" }}>
              {openIncidentsCount}
            </h3>
            <span style={{ fontSize: "11px", color: "var(--danger-red)", fontWeight: "700", display: "block", marginTop: "4px" }}>
              {criticalIncidentsCount} critical
            </span>
          </div>
          <div className="metric-circle-icon" style={{ background: "var(--danger-red-bg)" }}>
            <ShieldAlert size={20} style={{ color: "var(--danger-red)" }} />
          </div>
        </div>

        {/* Metric 5 */}
        <div className="metric-widget">
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>ACCESSIBILITY REQUESTS</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{32 + activeAccessibilityCount}</h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>↓ 6 vs yesterday</span>
          </div>
          <div className="metric-circle-icon" style={{ background: "var(--fifa-blue-bg)" }}>
            <Heart size={20} style={{ color: "var(--fifa-blue)" }} />
          </div>
        </div>

        {/* Metric 6 */}
        <div className="metric-widget">
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>SYSTEM HEALTH</span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>98.7%</h3>
            <span style={{ fontSize: "11px", color: "var(--stadium-green)", fontWeight: "700", display: "block", marginTop: "4px" }}>All systems operational</span>
          </div>
          <div className="metric-circle-icon" style={{ background: "var(--stadium-green-bg)" }}>
            <CheckCircle size={20} style={{ color: "var(--stadium-green)" }} />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Stadium Map & Seating Visualizer & Alerts Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1fr", gap: "24px" }}>
        
        {/* Widget 2.1: Stadium Map & Crowd Overview */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "450px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "700" }}>Stadium Map & Crowd Overview</h4>
              <span style={{ fontSize: "11px", color: "var(--stadium-green)", fontWeight: "700" }}>● Live</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <select style={{ fontSize: "12px", padding: "4px 8px", width: "120px" }} defaultValue="Crowd Density">
                <option value="Crowd Density">Crowd Density</option>
              </select>
              <select 
                value={selectedMapStadium}
                onChange={e => setSelectedMapStadium(e.target.value)}
                style={{ fontSize: "12px", padding: "4px 8px", width: "120px" }}
              >
                {stadiums.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* North American Map SVG Representation */}
          <div style={{ flex: 1, background: "#E2F1F8", borderRadius: "var(--radius-md)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            
            {/* Legend */}
            <div style={{ position: "absolute", top: "10px", right: "10px", background: "#FFFFFF", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "10px", display: "flex", gap: "10px", zIndex: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--stadium-green)" }} /> Low</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--warning-orange)" }} /> Medium</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--danger-red)" }} /> High</span>
            </div>

            <svg viewBox="0 0 400 250" width="100%" height="100%" style={{ zIndex: 5 }}>
              {/* Simplified North America Map Path Outline */}
              <path d="M 50 20 L 150 10 L 250 15 L 350 40 L 320 150 L 250 200 L 180 230 L 140 180 L 100 120 L 60 70 Z" fill="#CFD8DC" stroke="#B0BEC5" strokeWidth="2" />
              
              {/* City Markers mapping to SimulationContext occupancy */}
              {stadiums.map(st => {
                // Layout positions
                const coords: Record<string, { x: number, y: number }> = {
                  "MetLife Stadium": { x: 300, y: 110 },
                  "SoFi Stadium": { x: 90, y: 130 },
                  "Estadio Azteca": { x: 160, y: 210 },
                  "BC Place": { x: 80, y: 60 }
                };

                const point = coords[st.name] || { x: 200, y: 120 };
                const dotColor = st.overallOccupancy > 80 ? "var(--danger-red)" : st.overallOccupancy > 55 ? "var(--warning-orange)" : "var(--stadium-green)";

                return (
                  <g key={st.name} style={{ cursor: "pointer" }} onClick={() => setSelectedMapStadium(st.name)}>
                    <circle cx={point.x} cy={point.y} r="6" fill={dotColor} stroke="#FFFFFF" strokeWidth="1.5" />
                    {selectedMapStadium === st.name && (
                      <circle cx={point.x} cy={point.y} r="12" fill="none" stroke={dotColor} strokeWidth="1.5" style={{ animation: "pulse 1.5s infinite alternate" }} />
                    )}
                    <text x={point.x + 8} y={point.y + 4} fontSize="8" fontWeight="700" fill="#1A202C">{st.city}</text>
                  </g>
                );
              })}
            </svg>
            
            <span style={{ position: "absolute", bottom: "10px", left: "10px", fontSize: "10px", color: "var(--text-muted)" }}>
              Last updated: 2:30:45 PM
            </span>
          </div>
        </div>

        {/* Widget 2.2: Live Crowd Density Seating Bowl Visualizer */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "450px" }}>
          <div>
            <h4 style={{ fontSize: "16px", fontWeight: "700" }}>Live Crowd Density</h4>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{currentStadium.name}</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "16px 0" }}>
            {/* SVG Seating Bowl Visualizer */}
            <svg width="180" height="180" viewBox="0 0 200 200">
              {/* Outer seat tiers */}
              <path d="M 30 100 A 70 70 0 1 1 170 100 A 70 70 0 1 1 30 100" fill="none" stroke={getSeatColor(currentStadium.overallOccupancy)} strokeWidth="20" opacity="0.8" />
              {/* Mid seat tiers */}
              <path d="M 50 100 A 50 50 0 1 1 150 100 A 50 50 0 1 1 50 100" fill="none" stroke={getSeatColor(currentStadium.zones[0]?.occupancy || 50)} strokeWidth="16" opacity="0.9" />
              {/* Inner seat tiers */}
              <path d="M 65 100 A 35 35 0 1 1 135 100 A 35 35 0 1 1 65 100" fill="none" stroke={getSeatColor(currentStadium.zones[1]?.occupancy || 40)} strokeWidth="12" />
              
              {/* Pitch */}
              <rect x="75" y="80" width="50" height="40" rx="3" fill="#A1D99B" stroke="#74C476" strokeWidth="2" />
              <line x1="100" y1="80" x2="100" y2="120" stroke="#74C476" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="10" fill="none" stroke="#74C476" strokeWidth="1.5" />
            </svg>

            {/* Metrics */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-around", marginTop: "12px", textAlign: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Overall Density</span>
                <strong style={{ fontSize: "14px", color: getSeatColor(currentStadium.overallOccupancy) }}>{currentStadium.overallOccupancy}%</strong>
                <p style={{ fontSize: "9px", color: "var(--text-secondary)" }}>Medium</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>People in Stadium</span>
                <strong style={{ fontSize: "14px" }}>{Math.round(currentStadium.overallOccupancy * 825).toLocaleString()}</strong>
                <p style={{ fontSize: "9px", color: "var(--text-secondary)" }}>/ 82,500</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Density Trend</span>
                <strong style={{ fontSize: "14px", color: "var(--stadium-green)" }}>↑ 12%</strong>
                <p style={{ fontSize: "9px", color: "var(--text-secondary)" }}>vs 30 min ago</p>
              </div>
            </div>
          </div>

          <a href="#" style={{ fontSize: "12px", fontWeight: "700", color: "var(--fifa-blue)", textAlign: "center", textDecoration: "none" }}>
            View Full Analytics →
          </a>
        </div>

        {/* Widget 2.3: Alerts & Feeds */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "450px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "700" }}>Alerts & Feeds</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View all</a>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {["All", "Critical", "Warning", "Info"].map(f => (
              <button
                key={f}
                onClick={() => setAlertFilter(f)}
                style={{
                  background: alertFilter === f ? "var(--bg-sidebar)" : "rgba(0,0,0,0.03)",
                  border: "none",
                  color: alertFilter === f ? "#FFFFFF" : "var(--text-secondary)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {getFilteredAlerts().map(alert => (
              <div 
                key={alert.id}
                style={{ 
                  display: "flex", 
                  gap: "10px", 
                  background: "rgba(0,0,0,0.01)", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  border: "1px solid var(--border-light)",
                  alignItems: "flex-start" 
                }}
              >
                <div style={{ marginTop: "2px" }}>{alert.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{alert.text}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{alert.time}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{alert.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Third Row Grid: AI Concierge, Match Schedule, Transportation, Sustainability */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "24px" }}>
        
        {/* Widget 3.1: AI Concierge Queries */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "320px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>AI Concierge Queries (Live)</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View all</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            {[
              { lang: "English", count: "1,245", pct: 45, color: "var(--fifa-blue)" },
              { lang: "Español", count: "892", pct: 32, color: "var(--stadium-green)" },
              { lang: "Português", count: "456", pct: 16, color: "var(--warning-orange)" },
              { lang: "French", count: "189", pct: 7, color: "var(--neutral-purple)" }
            ].map(l => (
              <div key={l.lang}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span>{l.lang}</span>
                  <strong>{l.count} ({l.pct}%)</strong>
                </div>
                <div style={{ background: "#F1F5F9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ background: l.color, height: "100%", width: `${l.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Total Queries Today</span>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>2,782</p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Avg Response Time</span>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--stadium-green)" }}>2.3s</p>
            </div>
          </div>
        </div>

        {/* Widget 3.2: Match Schedule */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "320px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>Match Schedule (Today)</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View full</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
            {[
              { time: "12:00 PM", t1: "USA", t2: "BRA", live: true },
              { time: "03:00 PM", t1: "ARG", t2: "MEX", live: true },
              { time: "06:00 PM", t1: "FRA", t2: "GER", live: false },
              { time: "09:00 PM", t1: "ESP", t2: "COL", live: false }
            ].map(m => (
              <div key={m.time} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.01)", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>{m.time}</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{m.t1} vs {m.t2}</span>
                </div>
                <div>
                  {m.live ? (
                    <span className="badge-status danger" style={{ fontSize: "8px", padding: "1px 4px" }}>LIVE</span>
                  ) : (
                    <span className="badge-status info" style={{ fontSize: "8px", padding: "1px 4px", background: "#F1F5F9", color: "var(--text-secondary)", borderColor: "transparent" }}>UPCOMING</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3.3: Transportation Overview */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "320px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>Transportation Overview</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View full</a>
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", fontSize: "11px", marginBottom: "12px" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>🅿️ Parking</span>
              <p style={{ fontWeight: "700" }}>68% Avail</p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>🚇 Transit</span>
              <p style={{ fontWeight: "700", color: "var(--stadium-green)" }}>Normal</p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>🚗 Rideshare</span>
              <p style={{ fontWeight: "700", color: "var(--warning-orange)" }}>Busy (Surge)</p>
            </div>
          </div>

          {/* SVG Bar Chart for Departure Flow Peak */}
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ fontSize: "9px", color: "var(--text-secondary)", display: "block" }}>Fan Departure Plan (Peak Exit Flow)</span>
            
            <svg viewBox="0 0 160 80" width="100%" height="70%">
              {/* Bars */}
              <rect x="10" y="50" width="12" height="30" fill="var(--fifa-blue)" rx="2" />
              <rect x="35" y="30" width="12" height="50" fill="var(--fifa-blue)" rx="2" />
              <rect x="60" y="10" width="12" height="70" fill="var(--stadium-green)" rx="2" /> {/* Recommended */}
              <rect x="85" y="25" width="12" height="55" fill="var(--fifa-blue)" rx="2" />
              <rect x="110" y="45" width="12" height="35" fill="var(--fifa-blue)" rx="2" />
              <rect x="135" y="60" width="12" height="20" fill="var(--fifa-blue)" rx="2" />
              
              {/* Recommended arrow label */}
              <text x="66" y="8" fontSize="6" fontWeight="800" fill="var(--stadium-green)" textAnchor="middle">Recommended</text>
            </svg>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "var(--text-muted)" }}>
              <span>Now</span>
              <span>30m</span>
              <span>60m</span>
              <span>90m</span>
              <span>120m</span>
              <span>150m</span>
            </div>
          </div>

          <p style={{ fontSize: "9px", color: "var(--text-secondary)", textAlign: "center", borderTop: "1px solid var(--border-light)", paddingTop: "8px", marginTop: "8px" }}>
            Avoid delays. Follow the suggested departure schedule.
          </p>
        </div>

        {/* Widget 3.4: Sustainability Snapshot */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "320px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>Sustainability Snapshot</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View full</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            <div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>⚡ Energy Usage</span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                <strong style={{ fontSize: "13px" }}>{currentStadium.sustainability.energyKWh.toLocaleString()} kWh</strong>
                <span style={{ fontSize: "9px", color: currentStadium.sustainability.energyKWh > currentStadium.sustainability.baselineEnergy ? "var(--danger-red)" : "var(--stadium-green)" }}>
                  {currentStadium.sustainability.energyKWh > currentStadium.sustainability.baselineEnergy ? "↑ Anomaly" : "Normal"}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>💧 Water Usage</span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                <strong style={{ fontSize: "13px" }}>{currentStadium.sustainability.waterLiters.toLocaleString()} Liters</strong>
                <span style={{ fontSize: "9px", color: currentStadium.sustainability.waterLiters > currentStadium.sustainability.baselineWater ? "var(--danger-red)" : "var(--stadium-green)" }}>
                  {currentStadium.sustainability.waterLiters > currentStadium.sustainability.baselineWater ? "↑ Anomaly" : "Normal"}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>♻️ Waste Diverted</span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                <strong style={{ fontSize: "13px" }}>68% Recycled</strong>
                <span style={{ fontSize: "9px", color: "var(--stadium-green)" }}>+0.1% vs yesterday</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: "10px", color: "var(--stadium-green)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "12px" }}>
            <Leaf size={12} /> Together for a sustainable World Cup 2026 🌍
          </p>
        </div>

      </div>

      {/* 4. Bottom Row: Recent Incidents Table & Volunteer/Staff Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "24px" }}>
        
        {/* Recent Incidents Table */}
        <div className="dash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "700" }}>Recent Incidents</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View all</a>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Venue</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {incidents.slice(0, 3).map(inc => (
                  <tr key={inc.id}>
                    <td><strong>{inc.id}</strong></td>
                    <td>{inc.type}</td>
                    <td>{inc.stadiumName}</td>
                    <td>
                      <span style={{ color: inc.severity === "High" ? "var(--danger-red)" : "var(--warning-orange)", fontWeight: "700" }}>
                        {inc.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${inc.status === "Resolved" ? "success" : "warning"}`} style={{ fontSize: "8px", padding: "1px 4px" }}>
                        {inc.status}
                      </span>
                    </td>
                    <td>Just Now</td>
                  </tr>
                ))}

                {incidents.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No active incidents logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Volunteer/Staff Activity */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>Volunteer / Staff Activity (Live)</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View all</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
            
            {/* Metric 1 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Active Volunteers</span>
                <strong style={{ fontSize: "16px" }}>1,248</strong>
                <span style={{ fontSize: "9px", color: "var(--stadium-green)", display: "block" }}>↑ 12% vs yesterday</span>
              </div>
              <Users size={18} style={{ color: "var(--neutral-purple)" }} />
            </div>

            {/* Metric 2 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Open Tasks</span>
                <strong style={{ fontSize: "16px" }}>86</strong>
                <span style={{ fontSize: "9px", color: "var(--stadium-green)", display: "block" }}>↓ 5% vs yesterday</span>
              </div>
              <CheckCircle size={18} style={{ color: "var(--stadium-green)" }} />
            </div>

            {/* Metric 3 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Escalations</span>
                <strong style={{ fontSize: "16px" }}>18</strong>
                <span style={{ fontSize: "9px", color: "var(--warning-orange)", display: "block" }}>↑ 8% vs yesterday</span>
              </div>
              <ShieldAlert size={18} style={{ color: "var(--danger-red)" }} />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

// --- Main App Component Revamped ---
const AppContent: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("overview");
  const { incidents, accessibilityRequests } = useSimulation();

  const activeIncidents = incidents.filter(i => i.status !== "Resolved").length;
  const activeAccessibility = accessibilityRequests.filter(r => r.status !== "Resolved").length;

  const handleMenuClick = (menu: ActiveMenu) => {
    setActiveMenu(menu);
  };

  // Get active menu details for Top Header
  const getHeaderDetails = () => {
    const menus: Record<ActiveMenu, { title: string, subtitle: string }> = {
      overview: { title: "Overview Dashboard", subtitle: "Real-time overview of all venues and operations" },
      command_center: { title: "Operations Command Center", subtitle: "Live situation management and incident response" },
      crowd_intelligence: { title: "Crowd Intelligence", subtitle: "CV people-counting feeds and predictive surge mapping" },
      ai_concierge: { title: "AI Concierge Assistant", subtitle: "Multilingual fan chatbot and RAG knowledge lookup" },
      navigation: { title: "Navigation & Wayfinding", subtitle: "Crowd-aware stadium routing and PWD accessible guides" },
      accessibility: { title: "Accessibility Coordinator", subtitle: "WD request triage and volunteer escort dispatch queue" },
      transportation: { title: "Transportation & Parking", subtitle: "Multimodal transit board and departure optimization planner" },
      sustainability: { title: "Sustainability & ESG", subtitle: "Smart grids, recycling tracking, and anomaly advisory" },
      volunteers: { title: "Volunteers / Staff", subtitle: "Mobile volunteer station shift logs and translation assistant" },
      incidents: { title: "Incidents & Alerts", subtitle: "Alert approvals queue and emergency broadcasting logs" },
      analytics: { title: "Reports & Analytics", subtitle: "Long-term KPI reporting and tournament operations audit" },
      settings: { title: "System Settings", subtitle: "Adjust confidence thresholds, model preferences, and API rates" }
    };

    return menus[activeMenu] || { title: "Overview Dashboard", subtitle: "Real-time overview of all venues and operations" };
  };

  const header = getHeaderDetails();

  return (
    <div className="app-grid-layout">
      
      {/* PERSISTENT LEFT SIDEBAR */}
      <aside className="sidebar-panel">
        <div>
          {/* Logo Section */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Globe style={{ color: "var(--fifa-gold)", strokeWidth: 2.5 }} />
              <div>
                StadiumPulse AI
                <span>Smart Venue Operations</span>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="sidebar-menu">
            {[
              { id: "overview", label: "Overview", icon: <Globe size={16} /> },
              { id: "command_center", label: "Command Center", icon: <Activity size={16} /> },
              { id: "crowd_intelligence", label: "Crowd Intelligence", icon: <AnalyticsIcon size={16} /> },
              { id: "ai_concierge", label: "AI Concierge", icon: <MessageSquare size={16} /> },
              { id: "navigation", label: "Navigation & Maps", icon: <Compass size={16} /> },
              { id: "accessibility", label: "Accessibility", icon: <Heart size={16} /> },
              { id: "transportation", label: "Transportation", icon: <Car size={16} /> },
              { id: "sustainability", label: "Sustainability", icon: <Leaf size={16} /> },
              { id: "volunteers", label: "Volunteers / Staff", icon: <LifeBuoy size={16} /> },
              { id: "incidents", label: "Incidents & Alerts", icon: <ShieldAlert size={16} /> },
              { id: "analytics", label: "Reports & Analytics", icon: <List size={16} /> },
              { id: "settings", label: "Settings", icon: <Settings size={16} /> }
            ].map(item => (
              <button
                key={item.id}
                className={`sidebar-item ${activeMenu === item.id ? "active" : ""}`}
                onClick={() => handleMenuClick(item.id as ActiveMenu)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (FIFA trophy & profile) */}
        <div>
          {/* Gold Trophy card */}
          <div className="sidebar-trophy-card">
            <Trophy style={{ color: "var(--fifa-gold)", strokeWidth: 2.5, margin: "0 auto 8px auto" }} />
            <h5 style={{ fontSize: "11px", fontWeight: "700", color: "#FFFFFF" }}>FIFA World Cup 2026</h5>
            <p style={{ fontSize: "9px", color: "var(--text-sidebar)", marginTop: "2px" }}>16 Host Cities</p>
            <button 
              onClick={() => handleMenuClick("overview")}
              style={{
                background: "var(--stadium-green)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "10px",
                fontWeight: "600",
                padding: "6px 12px",
                borderRadius: "14px",
                marginTop: "10px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              View All Venues →
            </button>
          </div>

          {/* User profile */}
          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Draw profile face SVG */}
              <User style={{ color: "#334155" }} />
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <h5 style={{ fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>Jordan Williams</h5>
              <span style={{ fontSize: "10px", color: "var(--text-sidebar)", display: "block" }}>Operations Manager</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "9px", color: "var(--stadium-green)", marginTop: "2px" }}>
                <span className="pulse-indicator" style={{ width: "6px", height: "6px", background: "var(--stadium-green)" }} /> Online
              </span>
            </div>
            <button style={{ background: "transparent", border: "none", color: "var(--text-sidebar)", cursor: "pointer" }} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* RIGHT PANE: Header and Content views */}
      <div className="right-pane">
        
        {/* Top Header bar */}
        <header className="top-header-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>{header.title}</h1>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{header.subtitle}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Search Input */}
            <div style={{ position: "relative", width: "240px" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "12px", color: "var(--text-muted)" }} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                style={{ 
                  paddingLeft: "32px", 
                  fontSize: "12px", 
                  background: "#F8F9FA",
                  borderRadius: "20px",
                  height: "36px"
                }} 
              />
              <span style={{ position: "absolute", right: "12px", top: "10px", fontSize: "9px", background: "#E2E8F0", padding: "2px 4px", borderRadius: "4px", color: "var(--text-muted)" }}>
                ⌘ K
              </span>
            </div>

            {/* Language Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
              <Globe size={14} />
              <span>EN</span>
              <span style={{ fontSize: "8px" }}>▼</span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setActiveMenu("incidents")}>
              <Bell size={20} style={{ color: "var(--text-secondary)" }} />
              {(activeIncidents + activeAccessibility) > 0 && (
                <span 
                  style={{ 
                    position: "absolute", 
                    top: "-4px", 
                    right: "-4px", 
                    background: "var(--danger-red)", 
                    color: "#FFFFFF", 
                    fontSize: "8px", 
                    fontWeight: "800", 
                    width: "14px", 
                    height: "14px", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center" 
                  }}
                >
                  {activeIncidents + activeAccessibility}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic content view switching */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {activeMenu === "overview" && <OverviewDashboard />}
          {activeMenu === "command_center" && <CommandCenter />}
          {activeMenu === "crowd_intelligence" && <CommandCenter />} {/* Dedicated view could overlay crowd indicators */}
          {activeMenu === "ai_concierge" && <AIConcierge />}
          {activeMenu === "navigation" && <NavigationWayfinding />}
          {activeMenu === "accessibility" && <AccessibilityCoordinator />}
          {activeMenu === "transportation" && <TransportationAssistant />}
          {activeMenu === "sustainability" && <SustainabilityDashboard />}
          {activeMenu === "volunteers" && <VolunteerCopilot />}
          
          {/* alerts gating queue */}
          {activeMenu === "incidents" && (
            <div className="role-view-wrapper animated-entry">
              <CommandCenter />
            </div>
          )}

          {/* Reports & Analytics Panel */}
          {activeMenu === "analytics" && (
            <div className="role-view-wrapper animated-entry" style={{ padding: "32px" }}>
              <div className="dash-card">
                <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Reports & Tournament Analytics</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
                  This panel will compile match-day analytics reports, detailing wait time reductions, crowd-surge prediction metrics, and eco-resource offsets (e.g. water saved).
                </p>
                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  <button className="btn-primary">Download Daily ESG Report</button>
                  <button className="btn-secondary">Export Safety Incident CSV</button>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Panel */}
          {activeMenu === "settings" && (
            <div className="role-view-wrapper animated-entry" style={{ padding: "32px" }}>
              <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "18px" }}>System Configuration</h3>
                
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>RAG Confidence Escalation Threshold</label>
                  <select defaultValue="0.70" style={{ width: "200px" }}>
                    <option value="0.60">60% (Fewer escalations)</option>
                    <option value="0.70">70% (Recommended)</option>
                    <option value="0.80">80% (Higher safety margin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Crowd Surge Warning Sensitivity</label>
                  <select defaultValue="medium" style={{ width: "200px" }}>
                    <option value="low">Low (Fewer false alarms)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Maximum warning lead time)</option>
                  </select>
                </div>

                <button className="btn-primary" style={{ width: "fit-content", marginTop: "10px" }}>Save Configurations</button>
              </div>
            </div>
          )}
        </div>

      </div>

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

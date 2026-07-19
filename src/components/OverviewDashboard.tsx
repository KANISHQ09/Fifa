import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSimulation } from "../context/SimulationContext";
import { escapeHTML, sanitizeCssColor } from "../utils/security";
import { STADIUM_COORDS } from "../constants/stadiumCoords";
import {
  Globe,
  Users,
  AlertTriangle,
  CheckCircle,
  Flame,
  Heart,
  ShieldAlert,
  Leaf,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static alert seed data (created once, outside the component).
// Icons are React elements but the objects themselves are stable constants.
// ---------------------------------------------------------------------------
type AlertType = "Critical" | "Warning" | "Info";

interface AlertItem {
  id: string;
  type: AlertType;
  text: string;
  details: string;
  time: string;
  icon: React.ReactElement;
}

const STATIC_ALERTS: AlertItem[] = [
  {
    id: "A1",
    type: "Critical",
    text: "Crowd Surge Detected",
    details: "Concourse B, Gate 12 - MetLife Stadium",
    time: "2 min ago",
    icon: <Flame size={14} style={{ color: "var(--danger-red)" }} />,
  },
  {
    id: "A2",
    type: "Warning",
    text: "High Density Warning",
    details: "Lower Tier, Section 132 - AT&T Stadium",
    time: "5 min ago",
    icon: <AlertTriangle size={14} style={{ color: "var(--warning-orange)" }} />,
  },
  {
    id: "A3",
    type: "Info",
    text: "Accessibility Request",
    details: "Wheelchair Assistance - Gate 7",
    time: "6 min ago",
    icon: <Heart size={14} style={{ color: "var(--fifa-blue)" }} />,
  },
  {
    id: "A4",
    type: "Info",
    text: "Weather Alert",
    details: "Thunderstorm expected in 2 hrs - Miami",
    time: "15 min ago",
    icon: <Globe size={14} style={{ color: "var(--fifa-blue)" }} />,
  },
  {
    id: "A5",
    type: "Info",
    text: "System Update",
    details: "All systems operational",
    time: "30 min ago",
    icon: <CheckCircle size={14} style={{ color: "var(--stadium-green)" }} />,
  },
];

// ---------------------------------------------------------------------------
// Helper: derive a CSS colour from an occupancy percentage
// ---------------------------------------------------------------------------
function getSeatColor(occ: number): string {
  if (occ > 85) return "var(--danger-red)";
  if (occ > 60) return "var(--warning-orange)";
  return "var(--stadium-green)";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const OverviewDashboard: React.FC = () => {
  const { stadiums, incidents, accessibilityRequests } = useSimulation();
  const [selectedMapStadium, setSelectedMapStadium] = useState<string>("MetLife Stadium");
  const [alertFilter, setAlertFilter] = useState<string>("All");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // ── Leaflet Map: initialise once ──────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([37.0902, -95.7129], 3.2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ── Leaflet Map: update markers when data changes ─────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    stadiums.forEach((st) => {
      const coords = STADIUM_COORDS[st.name];
      if (!coords) return;

      const rawColor =
        st.overallOccupancy > 80
          ? "var(--danger-red)"
          : st.overallOccupancy > 55
          ? "var(--warning-orange)"
          : "var(--stadium-green)";
      const dotColor = sanitizeCssColor(rawColor);
      const isSelected = selectedMapStadium === st.name;

      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${dotColor}; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>
          ${isSelected ? `<div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; border: 2px dashed ${dotColor}; animation: pulse 1.5s infinite alternate;"></div>` : ""}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "leaflet-custom-dot",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(coords, { icon: customIcon })
        .addTo(map)
        .on("click", () => setSelectedMapStadium(st.name));

      const safeCity = escapeHTML(st.city);
      marker.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; padding: 2px 4px;"><b>${safeCity}</b>: ${st.overallOccupancy}%</div>`,
        { direction: "top", offset: [0, -10], className: "leaflet-tooltip-custom", permanent: false }
      );

      markersRef.current[st.name] = marker;
    });
  }, [stadiums, selectedMapStadium]);

  // ── Leaflet Map: pan to selected stadium ─────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const coords = STADIUM_COORDS[selectedMapStadium];
    if (coords) {
      mapInstanceRef.current.setView(coords, 4, { animate: true });
    }
  }, [selectedMapStadium]);

  // ── Derived values ────────────────────────────────────────────────────────
  const currentStadium = useMemo(
    () => stadiums.find((s) => s.name === selectedMapStadium) ?? stadiums[0],
    [stadiums, selectedMapStadium]
  );

  const { openIncidentsCount, criticalIncidentsCount, activeAccessibilityCount } =
    useMemo(
      () => ({
        openIncidentsCount: incidents.filter((i) => i.status !== "Resolved").length,
        criticalIncidentsCount: incidents.filter(
          (i) => i.status !== "Resolved" && i.severity === "High"
        ).length,
        activeAccessibilityCount: accessibilityRequests.filter(
          (r) => r.status !== "Resolved"
        ).length,
      }),
      [incidents, accessibilityRequests]
    );

  const filteredAlerts = useMemo(() => {
    // Prepend live incidents from the simulator
    const liveAlerts: AlertItem[] = incidents
      .filter((i) => i.status !== "Resolved")
      .map((inc) => ({
        id: inc.id,
        type: (inc.severity === "High" ? "Critical" : "Warning") as AlertType,
        text: inc.type,
        details: `${inc.zone} - ${inc.stadiumName}`,
        time: "Just Now",
        icon:
          inc.severity === "High" ? (
            <Flame size={14} style={{ color: "var(--danger-red)" }} />
          ) : (
            <AlertTriangle size={14} style={{ color: "var(--warning-orange)" }} />
          ),
      }));

    const combined = [...liveAlerts, ...STATIC_ALERTS];

    if (alertFilter === "All") return combined;
    return combined.filter((a) => a.type.toLowerCase() === alertFilter.toLowerCase());
  }, [incidents, alertFilter]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="role-view-wrapper animated-entry">

      {/* 1. Metrics Grid Row */}
      <div className="responsive-grid-metrics">
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
      <div className="responsive-grid-3col">

        {/* Widget 2.1: Stadium Map & Crowd Overview */}
        <div className="dash-card dashboard-card-fixed-height">
          <div className="card-header-responsive">
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "700" }}>Stadium Map &amp; Crowd Overview</h4>
              <span style={{ fontSize: "11px", color: "var(--stadium-green)", fontWeight: "700" }}>● Live</span>
            </div>
            <div className="card-header-actions">
              <select defaultValue="Crowd Density">
                <option value="Crowd Density">Crowd Density</option>
              </select>
              <select value={selectedMapStadium} onChange={(e) => setSelectedMapStadium(e.target.value)}>
                {stadiums.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", borderRadius: "var(--radius-md)" }}>
            {/* Legend */}
            <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(4px)", border: "1px solid var(--border-light)", padding: "6px 12px", borderRadius: "8px", fontSize: "10px", display: "flex", gap: "10px", zIndex: 1000, color: "var(--text-primary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--stadium-green)" }} /> Low</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--warning-orange)" }} /> Medium</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--danger-red)" }} /> High</span>
            </div>

            <div ref={mapContainerRef} style={{ width: "100%", height: "100%", background: "#F1F5F9" }} />

            <span style={{ position: "absolute", bottom: "10px", left: "10px", fontSize: "9px", color: "var(--text-secondary)", zIndex: 1000, background: "rgba(255,255,255,0.9)", border: "1px solid var(--border-light)", padding: "2px 6px", borderRadius: "4px" }}>
              Interactive Leaflet Map
            </span>
          </div>
        </div>

        {/* Widget 2.2: Live Crowd Density Seating Bowl Visualizer */}
        <div className="dash-card dashboard-card-fixed-height">
          <div>
            <h4 style={{ fontSize: "16px", fontWeight: "700" }}>Live Crowd Density</h4>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{currentStadium.name}</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "16px 0" }}>
            <svg width="180" height="180" viewBox="0 0 200 200">
              <path d="M 30 100 A 70 70 0 1 1 170 100 A 70 70 0 1 1 30 100" fill="none" stroke={getSeatColor(currentStadium.overallOccupancy)} strokeWidth="20" opacity="0.8" />
              <path d="M 50 100 A 50 50 0 1 1 150 100 A 50 50 0 1 1 50 100" fill="none" stroke={getSeatColor(currentStadium.zones[0]?.occupancy ?? 50)} strokeWidth="16" opacity="0.9" />
              <path d="M 65 100 A 35 35 0 1 1 135 100 A 35 35 0 1 1 65 100" fill="none" stroke={getSeatColor(currentStadium.zones[1]?.occupancy ?? 40)} strokeWidth="12" />
              {/* Pitch */}
              <rect x="75" y="80" width="50" height="40" rx="3" fill="#A1D99B" stroke="#74C476" strokeWidth="2" />
              <line x1="100" y1="80" x2="100" y2="120" stroke="#74C476" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="10" fill="none" stroke="#74C476" strokeWidth="1.5" />
            </svg>

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
        <div className="dash-card dashboard-card-fixed-height">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "700" }}>Alerts &amp; Feeds</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View all</a>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {(["All", "Critical", "Warning", "Info"] as const).map((f) => (
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
                  fontWeight: "600",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  background: "rgba(0,0,0,0.01)",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-light)",
                  alignItems: "flex-start",
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
      <div className="responsive-grid-4col">

        {/* Widget 3.1: AI Concierge Queries */}
        <div className="dash-card dashboard-card-height-320">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>AI Concierge Queries (Live)</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View all</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            {([
              { lang: "English",    count: "1,245", pct: 45, color: "var(--fifa-blue)" },
              { lang: "Español",    count: "892",   pct: 32, color: "var(--stadium-green)" },
              { lang: "Português",  count: "456",   pct: 16, color: "var(--warning-orange)" },
              { lang: "French",     count: "189",   pct: 7,  color: "var(--neutral-purple)" },
            ] as const).map((l) => (
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
        <div className="dash-card dashboard-card-height-320">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>Match Schedule (Today)</h4>
            <a href="#" style={{ fontSize: "11px", fontWeight: "700", color: "var(--fifa-blue)", textDecoration: "none" }}>View full</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
            {([
              { time: "12:00 PM", t1: "USA", t2: "BRA", live: true },
              { time: "03:00 PM", t1: "ARG", t2: "MEX", live: true },
              { time: "06:00 PM", t1: "FRA", t2: "GER", live: false },
              { time: "09:00 PM", t1: "ESP", t2: "COL", live: false },
            ] as const).map((m) => (
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
        <div className="dash-card dashboard-card-height-320">
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

          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ fontSize: "9px", color: "var(--text-secondary)", display: "block" }}>Fan Departure Plan (Peak Exit Flow)</span>
            <svg viewBox="0 0 160 80" width="100%" height="70%">
              <rect x="10"  y="50" width="12" height="30" fill="var(--fifa-blue)"      rx="2" />
              <rect x="35"  y="30" width="12" height="50" fill="var(--fifa-blue)"      rx="2" />
              <rect x="60"  y="10" width="12" height="70" fill="var(--stadium-green)"  rx="2" />
              <rect x="85"  y="25" width="12" height="55" fill="var(--fifa-blue)"      rx="2" />
              <rect x="110" y="45" width="12" height="35" fill="var(--fifa-blue)"      rx="2" />
              <rect x="135" y="60" width="12" height="20" fill="var(--fifa-blue)"      rx="2" />
              <text x="66" y="8" fontSize="6" fontWeight="800" fill="var(--stadium-green)" textAnchor="middle">Recommended</text>
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "var(--text-muted)" }}>
              <span>Now</span><span>30m</span><span>60m</span><span>90m</span><span>120m</span><span>150m</span>
            </div>
          </div>

          <p style={{ fontSize: "9px", color: "var(--text-secondary)", textAlign: "center", borderTop: "1px solid var(--border-light)", paddingTop: "8px", marginTop: "8px" }}>
            Avoid delays. Follow the suggested departure schedule.
          </p>
        </div>

        {/* Widget 3.4: Sustainability Snapshot */}
        <div className="dash-card dashboard-card-height-320">
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
      <div className="responsive-grid-2col-unequal">

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
                {incidents.slice(0, 3).map((inc) => (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Active Volunteers</span>
                <strong style={{ fontSize: "16px" }}>1,248</strong>
                <span style={{ fontSize: "9px", color: "var(--stadium-green)", display: "block" }}>↑ 12% vs yesterday</span>
              </div>
              <Users size={18} style={{ color: "var(--neutral-purple)" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Open Tasks</span>
                <strong style={{ fontSize: "16px" }}>86</strong>
                <span style={{ fontSize: "9px", color: "var(--stadium-green)", display: "block" }}>↓ 5% vs yesterday</span>
              </div>
              <CheckCircle size={18} style={{ color: "var(--stadium-green)" }} />
            </div>

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

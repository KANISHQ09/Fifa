import React, { useState, useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Navigation, 
  Eye, 
  Accessibility, 
  Compass, 
  AlertTriangle, 
  Camera
} from "lucide-react";

export const NavigationWayfinding: React.FC = () => {
  const { stadiums } = useSimulation();
  
  const [selectedStadium, setSelectedStadium] = useState(stadiums[0]);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [arView, setArView] = useState(false);
  const [congestionAlert, setCongestionAlert] = useState(false);

  // Sync selected stadium details if state updates
  useEffect(() => {
    const current = stadiums.find(s => s.name === selectedStadium.name);
    if (current) {
      setSelectedStadium(current);
      
      // Auto-detect congestion in selected stadium zones
      const hasCritical = current.zones.some(z => z.status === "Critical" && z.name.includes("Gate C"));
      setCongestionAlert(hasCritical);
    }
  }, [stadiums, selectedStadium.name]);

  // Simulated path coordinates on a circular layout
  // Center is (250, 200). Stadium radius is 150.
  // Standard Route coordinates:
  const standardPath = congestionAlert
    // If Gate C is congested, reroute around it!
    ? "M 250 350 L 150 250 L 130 180 L 170 120 L 250 100" // Rerouted path
    : "M 250 350 L 320 310 L 370 200 L 250 100";           // Direct path (via Gate C side)

  const accessiblePath = congestionAlert
    ? "M 250 350 L 140 270 L 120 180 L 150 110 L 250 100" // Wheelchair accessible + Rerouted (Ramps)
    : "M 250 350 L 300 330 L 350 240 L 310 160 L 250 100";  // Wheelchair accessible standard (Elevator side)

  const currentPath = accessibleMode ? accessiblePath : standardPath;

  return (
    <div className="role-view-wrapper animated-entry">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Compass size={28} /> Dynamic Wayfinding & Navigation
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Crowd-aware routing with step-by-step PWD accessible paths and AR guidance support.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <select 
            value={selectedStadium.name} 
            onChange={e => {
              const s = stadiums.find(st => st.name === e.target.value);
              if (s) setSelectedStadium(s);
            }}
            style={{ width: "200px", padding: "8px 12px" }}
          >
            {stadiums.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
        
        {/* Left Side: Map Visualizer */}
        <div className="glass-panel" style={{ padding: "20px", position: "relative", minHeight: "500px", display: "flex", flexDirection: "column" }}>
          
          {/* Map Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", zIndex: 10 }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setAccessibleMode(!accessibleMode)}
                className="btn-secondary" 
                style={{ 
                  borderColor: accessibleMode ? "var(--fifa-gold)" : "var(--border-glass)",
                  background: accessibleMode ? "rgba(212, 175, 55, 0.15)" : "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Accessibility size={16} style={{ color: accessibleMode ? "var(--fifa-gold)" : "#FFFFFF" }} />
                Accessible Route: {accessibleMode ? "ON" : "OFF"}
              </button>

              <button 
                onClick={() => setArView(!arView)}
                className="btn-secondary" 
                style={{ 
                  borderColor: arView ? "var(--fifa-blue)" : "var(--border-glass)",
                  background: arView ? "rgba(0, 125, 255, 0.15)" : "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Camera size={16} style={{ color: arView ? "var(--fifa-blue)" : "#FFFFFF" }} />
                AR View overlay
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--stadium-green)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>GPS Lock: Concourse Active</span>
            </div>
          </div>

          {/* Map Display or AR Camera Screen */}
          {arView ? (
            /* AR CAMERA MODE */
            <div 
              style={{ 
                flex: 1, 
                background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200') no-repeat center center",
                backgroundSize: "cover",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: "12px", border: "1px solid var(--border-glass)", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={12} style={{ color: "var(--danger-red)" }} /> AR CAMERA SIMULATION
                </span>
                <span style={{ background: "rgba(0,230,118,0.2)", padding: "4px 8px", borderRadius: "8px", color: "var(--stadium-green)", fontSize: "11px", fontWeight: "700" }}>
                  Tracking anchors
                </span>
              </div>

              {/* Floating Overlay Guideline */}
              <div 
                style={{ 
                  alignSelf: "center", 
                  background: "rgba(6, 8, 19, 0.85)", 
                  border: "2px solid var(--fifa-gold)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 24px",
                  textAlign: "center",
                  maxWidth: "320px",
                  boxShadow: "var(--shadow-neon-gold)",
                  animation: "pulse 2s infinite alternate"
                }}
              >
                <Compass size={28} style={{ color: "var(--fifa-gold)", margin: "0 auto 8px auto" }} />
                <h4 style={{ fontSize: "14px", fontWeight: "700" }}>Walk 45 meters forward</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {accessibleMode ? "Take Elevator B to Level 2" : "Take Stairs C to Section 102"}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>SoFi Stadium Concourse A</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Fifa World Cup 2026</span>
              </div>
            </div>
          ) : (
            /* DYNAMIC MAP SVG */
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              
              {/* Dynamic Recalculating Notification */}
              {congestionAlert && (
                <div 
                  style={{ 
                    position: "absolute", 
                    top: "10px", 
                    left: "50%", 
                    transform: "translateX(-50%)",
                    background: "rgba(255, 61, 113, 0.15)",
                    border: "1px solid var(--danger-red)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    color: "var(--danger-red)",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    zIndex: 20
                  }}
                >
                  <AlertTriangle size={14} /> 
                  Crowd surge at Gate C! Rerouting path via Concourse West...
                </div>
              )}

              {/* Stadium Layout SVG Map */}
              <svg width="500" height="400" viewBox="0 0 500 400" style={{ maxWidth: "100%", height: "auto" }}>
                {/* Outermost Stadium Ring */}
                <circle cx="250" cy="200" r="170" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="250" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle cx="250" cy="200" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />

                {/* Inner pitch */}
                <rect x="180" y="140" width="140" height="120" rx="10" fill="rgba(0, 230, 118, 0.06)" stroke="rgba(0, 230, 118, 0.2)" strokeWidth="2" />
                <line x1="250" y1="140" x2="250" y2="260" stroke="rgba(0, 230, 118, 0.2)" strokeWidth="2" />
                <circle cx="250" cy="200" r="30" fill="none" stroke="rgba(0, 230, 118, 0.2)" strokeWidth="2" />
                
                {/* Gate Points */}
                {/* Gate A (Main Entrance - Bottom) */}
                <circle cx="250" cy="350" r="10" fill="var(--fifa-blue)" />
                <text x="250" y="375" fill="#FFFFFF" fontSize="10" fontWeight="700" textAnchor="middle">Gate A (Start)</text>

                {/* Section 102 (Destination - Top Center) */}
                <circle cx="250" cy="100" r="8" fill="var(--fifa-gold)" />
                <text x="250" y="85" fill="var(--fifa-gold)" fontSize="10" fontWeight="700" textAnchor="middle">Seat Sec 102</text>

                {/* Congestion Zone Gate C (Right side) */}
                <circle cx="370" cy="200" r="24" fill={congestionAlert ? "rgba(255, 61, 113, 0.2)" : "rgba(255,255,255,0.03)"} stroke={congestionAlert ? "var(--danger-red)" : "rgba(255,255,255,0.1)"} strokeWidth="1" strokeDasharray={congestionAlert ? "4 2" : "none"} />
                <text x="390" y="205" fill={congestionAlert ? "var(--danger-red)" : "var(--text-secondary)"} fontSize="9" fontWeight="600">Gate C</text>

                {/* West Concourse (Left side - Rerouting option) */}
                <circle cx="130" cy="180" r="16" fill="rgba(0,230,118,0.05)" stroke="var(--stadium-green)" strokeWidth="1" />
                <text x="75" y="183" fill="var(--stadium-green)" fontSize="9" fontWeight="600">West Concourse</text>

                {/* Draw Route Line */}
                <path 
                  d={currentPath} 
                  fill="none" 
                  stroke={accessibleMode ? "var(--fifa-gold)" : "var(--fifa-blue)"} 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  strokeDasharray="8 4"
                  style={{ animation: "dash 30s linear infinite" }}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right Side: Direction Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Navigation size={18} style={{ color: "var(--fifa-gold)" }} /> Turn-by-Turn Route
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ background: "var(--fifa-blue)", color: "#FFFFFF", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "2px" }}>1</span>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700" }}>Enter through Gate A</h4>
                  <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>Present ticket barcode at gate terminals.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ background: "var(--fifa-blue)", color: "#FFFFFF", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "2px" }}>2</span>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700" }}>
                    {congestionAlert 
                      ? "Turn LEFT toward West Concourse" 
                      : "Turn RIGHT toward Gate C Concourse"}
                  </h4>
                  <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {congestionAlert 
                      ? "⚠️ Dynamic rerouting active: avoiding Gate C congestion." 
                      : "Route cleared of density surges."}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ background: "var(--fifa-blue)", color: "#FFFFFF", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "2px" }}>3</span>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700" }}>
                    {accessibleMode 
                      ? "Locate West Elevator Plaza" 
                      : "Take Stairs Sec 102 up to Level 2"}
                  </h4>
                  <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {accessibleMode 
                      ? "Press 2 for seat decks." 
                      : "Direct steps access."}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ background: "var(--fifa-gold)", color: "#000000", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "2px" }}>4</span>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700" }}>Arrive at Section 102 Row G</h4>
                  <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>Seat is on the left aisle.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>Dynamic Recalculations</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              Our navigation model recalculates paths dynamically every 15 seconds based on active concourse people counts.
              If standard route segments exceed **75% density**, a warning is logged and the navigation path wraps around alternative walkways automatically.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

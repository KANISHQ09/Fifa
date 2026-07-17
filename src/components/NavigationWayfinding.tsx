import React, { useState, useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Navigation, 
  Eye, 
  Accessibility, 
  Compass, 
  AlertTriangle, 
  Camera,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export const NavigationWayfinding: React.FC = () => {
  const { stadiums } = useSimulation();
  
  const [selectedStadiumName, setSelectedStadiumName] = useState(stadiums[0].name);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [arView, setArView] = useState(false);
  const [congestionAlert, setCongestionAlert] = useState(false);
  const [congestedZoneName, setCongestedZoneName] = useState("");
  const [arStep, setArStep] = useState(0);

  const currentStadium = stadiums.find(s => s.name === selectedStadiumName) || stadiums[0];

  // Sync selected stadium details if state updates
  useEffect(() => {
    // Auto-detect congestion in selected stadium zones
    const congestedZone = currentStadium.zones.find(z => z.status === "Critical" || z.occupancy > 75);
    setCongestionAlert(congestedZone !== undefined);
    setCongestedZoneName(congestedZone ? congestedZone.name : "");
  }, [stadiums, selectedStadiumName, currentStadium]);

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

  // Directions list based on active options
  const getDirections = () => {
    const startGate = currentStadium.zones[0]?.name || "Main Gate";
    const endSeat = "Section 102 Row G";

    const steps = [
      {
        title: `Enter through ${startGate}`,
        desc: "Present your digital ticket barcode at the turnstile scanner terminals."
      },
      {
        title: congestionAlert ? `Turn LEFT toward Concourse West` : `Turn RIGHT toward Concourse East`,
        desc: congestionAlert 
          ? `⚠️ Rerouting active to avoid high crowd density at ${congestedZoneName}.` 
          : "Route is clear with normal crowd density."
      },
      {
        title: accessibleMode ? "Locate elevator at Elevator Plaza" : "Take Stairs up to Level 2",
        desc: accessibleMode ? "Press 2 for wheelchair platform access." : "Follow signage for Section 102 entry portal."
      },
      {
        title: `Arrive at ${endSeat}`,
        desc: "Your seat is located on the left aisle. Have a great match!"
      }
    ];
    return steps;
  };

  const directions = getDirections();

  return (
    <div className="role-view-wrapper animated-entry">
      <div className="view-header">
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
            value={selectedStadiumName} 
            onChange={e => {
              setSelectedStadiumName(e.target.value);
              setArStep(0);
            }}
            style={{ width: "220px", padding: "8px 12px" }}
          >
            {stadiums.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="responsive-grid-navigation">
        
        {/* Left Side: Map Visualizer */}
        <div className="glass-panel" style={{ padding: "20px", position: "relative", minHeight: "520px", display: "flex", flexDirection: "column" }}>
          
          {/* Map Controls */}
          <div className="card-header-responsive" style={{ zIndex: 10 }}>
            <div className="map-controls-row">
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
                onClick={() => {
                  setArView(!arView);
                  setArStep(0);
                }}
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
                AR View Overlay
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--stadium-green)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>GPS Active: Concourse Blue 2</span>
            </div>
          </div>

          {/* Map Display or AR Camera Screen */}
          {arView ? (
            /* AR CAMERA MODE */
            <div 
              className="animated-entry"
              style={{ 
                flex: 1, 
                background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200') no-repeat center center",
                backgroundSize: "cover",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                minHeight: "400px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: "12px", border: "1px solid var(--border-glass)", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={12} style={{ color: "var(--danger-red)" }} /> AR VIEWPORT SIMULATION
                </span>
                <span style={{ background: "rgba(0,230,118,0.2)", padding: "4px 8px", borderRadius: "8px", color: "var(--stadium-green)", fontSize: "11px", fontWeight: "700" }}>
                  Anchors Locked
                </span>
              </div>

              {/* Floating Overlay Guideline */}
              <div 
                style={{ 
                  alignSelf: "center", 
                  background: "rgba(6, 8, 19, 0.9)", 
                  border: "2px solid var(--fifa-gold)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px 24px",
                  textAlign: "center",
                  maxWidth: "340px",
                  boxShadow: "var(--shadow-md)",
                  animation: "pulse 2.5s infinite alternate",
                  color: "#FFFFFF"
                }}
              >
                <Compass size={28} style={{ color: "var(--fifa-gold)", margin: "0 auto 8px auto" }} />
                <h4 style={{ fontSize: "14px", fontWeight: "700" }}>
                  Step {arStep + 1}: {directions[arStep]?.title || "Navigation Complete"}
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-sidebar)", marginTop: "6px" }}>
                  {directions[arStep]?.desc || "You have reached your seat destination."}
                </p>

                {/* Steps controls */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                  <button 
                    disabled={arStep === 0}
                    onClick={() => setArStep(prev => prev - 1)}
                    style={{ background: "transparent", border: "none", color: arStep === 0 ? "rgba(255,255,255,0.2)" : "#FFFFFF", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center" }}
                  >
                    <ChevronLeft size={12} /> Back
                  </button>
                  <button 
                    disabled={arStep === directions.length - 1}
                    onClick={() => setArStep(prev => prev + 1)}
                    style={{ background: "transparent", border: "none", color: arStep === directions.length - 1 ? "rgba(255,255,255,0.2)" : "#FFFFFF", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center" }}
                  >
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{currentStadium.name} Concourse Ring</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>FIFA WC 26</span>
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
                  Crowd bottleneck at {congestedZoneName}! AI Rerouting path active...
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
                
                {/* Dynamic Gate Points based on Stadium Context */}
                {/* Gate A (Entrance) */}
                <circle cx="250" cy="350" r="10" fill="var(--fifa-blue)" />
                <text x="250" y="375" fill="#FFFFFF" fontSize="10" fontWeight="700" textAnchor="middle">
                  {currentStadium.zones[0]?.name || "Gate A"} (Start)
                </text>

                {/* Destination */}
                <circle cx="250" cy="100" r="8" fill="var(--fifa-gold)" />
                <text x="250" y="85" fill="var(--fifa-gold)" fontSize="10" fontWeight="700" textAnchor="middle">Sec 102 Seat</text>

                {/* Dynamic warning indicator for Gate C/Zone D on the right */}
                <circle 
                  cx="370" 
                  cy="200" 
                  r="24" 
                  fill={congestionAlert ? "rgba(255, 61, 113, 0.2)" : "rgba(255,255,255,0.03)"} 
                  stroke={congestionAlert ? "var(--danger-red)" : "rgba(255,255,255,0.1)"} 
                  strokeWidth="1" 
                  strokeDasharray={congestionAlert ? "4 2" : "none"} 
                />
                <text 
                  x="395" 
                  y="204" 
                  fill={congestionAlert ? "var(--danger-red)" : "var(--text-secondary)"} 
                  fontSize="9" 
                  fontWeight="600"
                >
                  {currentStadium.zones[2]?.name || "Gate C"}
                </text>

                {/* West Concourse on the left */}
                <circle cx="130" cy="180" r="16" fill="rgba(0,230,118,0.05)" stroke="var(--stadium-green)" strokeWidth="1" />
                <text x="65" y="183" fill="var(--stadium-green)" fontSize="9" fontWeight="600">West Bypass</text>

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
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {directions.map((step, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ 
                    background: idx === arStep && arView ? "var(--fifa-gold)" : "var(--fifa-blue)", 
                    color: idx === arStep && arView ? "#000000" : "#FFFFFF", 
                    width: "22px", 
                    height: "22px", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "11px", 
                    fontWeight: "700", 
                    flexShrink: 0, 
                    marginTop: "2px" 
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: "700", color: idx === arStep && arView ? "var(--fifa-gold)" : "inherit" }}>
                      {step.title}
                    </h4>
                    <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
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

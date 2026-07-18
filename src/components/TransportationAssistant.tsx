import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Car, 
  Train, 
  MapPin, 
  Clock, 
  Sparkles,
  Ticket,
  X,
  CreditCard,
  QrCode
} from "lucide-react";

export const TransportationAssistant: React.FC = () => {
  const { stadiums } = useSimulation();

  const [selectedStadiumName, setSelectedStadiumName] = useState(stadiums[0].name);
  const [destination, setDestination] = useState("");
  const [modePreference, setModePreference] = useState("train");
  const [generatedPlan, setGeneratedPlan] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const currentStadium = stadiums.find(s => s.name === selectedStadiumName) || stadiums[0];

  // Sync selected stadium details if state updates
  React.useEffect(() => {
    // Keep reference in sync
  }, [stadiums]);

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      const surge = currentStadium.transitStatus.rideshareSurge;
      const metroDelay = currentStadium.transitStatus.metro === "Delayed";
      const destName = destination;

      let planText = `[StadiumPulse AI Personal Travel Guide]\n\n`;
      planText += `📍 ROUTE: ${currentStadium.name} ➡️ ${destName}\n`;
      
      if (modePreference === "train") {
        planText += `🚆 PREFERENCE: Public Metro/Train (Eco-Choice 🌿)\n\n`;
        planText += `⏱️ RECOMMENDED DEPARTURE: Head to the exit at Minute 78 (or wait 15 mins post-match) to avoid peak gate queues.\n\n`;
        planText += `DIRECTIONS:\n`;
        planText += `1. Leave your seat and walk towards Exit Gate A.\n`;
        if (metroDelay) {
          planText += `2. ⚠️ Note: The main metro line is currently experiencing delays. Take the alternate Blue Line (Platform 3) instead to reach Central Terminal.\n`;
        } else {
          planText += `2. Take the high-frequency Metro Train (Platform 1) directly to Central Terminal.\n`;
        }
        planText += `3. Estimated Travel Time: ~35 mins. Carbon offset: 2.4kg CO2 vs ridesharing.`;
      } else if (modePreference === "rideshare") {
        planText += `🚗 PREFERENCE: Rideshare (Uber/Lyft)\n\n`;
        planText += `⏱️ RECOMMENDED DEPARTURE: Wait 20 minutes post-match inside the stadium to allow the price surge multiplier to subside.\n\n`;
        planText += `DIRECTIONS:\n`;
        planText += `1. Exit the stadium via Verizon Gate and follow yellow signs to Rideshare Lot K.\n`;
        planText += `2. ⚠️ Surge Warning: Demand has triggered a ${surge}x surge multiplier. Current estimated fare is $${Math.round(25 * surge)} USD.\n`;
        planText += `3. Request your ride ONLY after arriving inside Lot K zone; drivers cannot pick up on main ring roads.\n`;
        planText += `4. Estimated Travel Time: ~25 mins (subject to post-match perimeter traffic).`;
      } else {
        planText += `🚌 PREFERENCE: Stadium Shuttle Bus\n\n`;
        planText += `⏱️ RECOMMENDED DEPARTURE: Leave immediately at the full-time whistle.\n\n`;
        planText += `DIRECTIONS:\n`;
        planText += `1. Exit the stadium via Bud Light Gate and walk 100 meters north to Bus Bay 4.\n`;
        planText += `2. Board the Central Hub Express Shuttle. Shuttles are departing continuously as they fill.\n`;
        planText += `3. Estimated Travel Time: ~40 mins. Free transit with your match day ticket pass.`;
      }

      setGeneratedPlan(planText);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="role-view-wrapper animated-entry">
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Car size={28} /> Transportation & Parking Assistant
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time multimodal departure planning, parking availability tracking, and AI route optimization.
          </p>
        </div>

        <div>
          <select 
            value={selectedStadiumName} 
            onChange={e => {
              setSelectedStadiumName(e.target.value);
              setGeneratedPlan("");
            }}
            style={{ width: "220px", padding: "8px 12px" }}
          >
            {stadiums.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="responsive-grid-2col-equal">
        
        {/* Left Side: Real-Time Transit Board & Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Real-time Status Board */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Train size={18} style={{ color: "var(--fifa-blue)" }} /> Live Venue Transit Board
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Train size={20} style={{ color: "var(--stadium-green)" }} />
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "13px" }}>City Subway/Metro Link</span>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Red Line & Blue Line services</p>
                  </div>
                </div>
                <div>
                  <span className={`badge-status ${currentStadium.transitStatus.metro === "Delayed" ? "warning" : "success"}`}>
                    {currentStadium.transitStatus.metro}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Car size={20} style={{ color: "var(--fifa-gold)" }} />
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "13px" }}>Rideshare Surge Index</span>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Lot K Pickup Point</p>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--fifa-gold)" }}>
                    {currentStadium.transitStatus.rideshareSurge}x Surge
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <MapPin size={20} style={{ color: "var(--fifa-blue)" }} />
                  <div>
                    <span style={{ fontWeight: "700", fontSize: "13px" }}>Parking Permit Lot Availability</span>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Zone A to E Permits</p>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "700" }}>
                    {currentStadium.transitStatus.parkingAvailability}% Empty
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Travel planner input form */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>GenAI Travel Route Planner</h3>

            <form onSubmit={handleGeneratePlan} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Destination Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Downtown Central Hotel or International Airport" 
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Preferred Transport</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { id: "train", label: "🚆 Train / Eco", val: "train" },
                    { id: "rideshare", label: "🚗 Rideshare", val: "rideshare" },
                    { id: "shuttle", label: "🚌 Shuttle", val: "shuttle" }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setModePreference(mode.val)}
                      style={{
                        background: modePreference === mode.val ? "var(--fifa-blue)" : "rgba(255,255,255,0.03)",
                        border: modePreference === mode.val ? "1px solid var(--fifa-blue)" : "1px solid var(--border-glass)",
                        color: "#FFFFFF",
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "var(--transition-smooth)"
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: "100%", height: "45px" }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "Compiling traffic feeds..."
                ) : (
                  <>
                    <Sparkles size={16} /> Compile AI Departure Strategy
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Generated AI Plan Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "var(--fifa-gold)" }} /> Personalized AI Travel Companion
            </h3>

             {generatedPlan ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                {(() => {
                  // Parse generated plan into structured fields
                  const lines = generatedPlan.split("\n");
                  let route = "";
                  let preference = "";
                  let departure = "";
                  const directions: string[] = [];

                  lines.forEach(line => {
                    if (line.includes("📍 ROUTE:")) {
                      route = line.replace("📍 ROUTE:", "").trim();
                    } else if (line.includes("PREFERENCE:")) {
                      preference = line.replace(/^[^\w\s]+/g, "").replace("PREFERENCE:", "").trim();
                    } else if (line.includes("⏱️ RECOMMENDED DEPARTURE:") || line.includes("RECOMMENDED DEPARTURE:")) {
                      departure = line.replace(/^[^\w\s]+/g, "").replace("RECOMMENDED DEPARTURE:", "").trim();
                    } else if (line.match(/^\d+\./)) {
                      directions.push(line.replace(/^\d+\.\s*/, "").trim());
                    } else if (line.trim() && !line.includes("StadiumPulse AI") && !line.includes("DIRECTIONS:") && line.includes("Estimated Travel Time:")) {
                      directions.push(line);
                    }
                  });

                  const [origin, dest] = route.split("➡️").map(s => s.trim());

                  return (
                    <div 
                      className="animated-entry"
                      style={{ 
                        background: "var(--bg-main, #F4F6F8)", 
                        border: "1px solid var(--border-light)", 
                        padding: "20px", 
                        borderRadius: "var(--radius-md)", 
                        flex: 1, 
                        fontSize: "13px", 
                        lineHeight: "1.6",
                        color: "var(--text-primary)"
                      }}
                    >
                      {/* Route Header card */}
                      <div style={{ background: "#ffffff", border: "1px solid var(--border-light)", padding: "12px 16px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", boxShadow: "var(--shadow-sm)" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "0.5px" }}>Origin</span>
                          <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{origin || currentStadium.name}</span>
                        </div>
                        <span style={{ fontSize: "16px", color: "var(--fifa-gold)" }}>➔</span>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                          <span style={{ fontSize: "9px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "0.5px" }}>Destination</span>
                          <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{dest || destination}</span>
                        </div>
                      </div>

                      {/* Preference & Mode Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)" }}>Selected Route Preference:</span>
                        <span style={{
                          background: "var(--fifa-blue-bg)",
                          color: "var(--fifa-blue)",
                          border: "1px solid rgba(26, 115, 232, 0.15)",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}>
                          {preference}
                        </span>
                      </div>

                      {/* Recommended Departure alert card */}
                      {departure && (
                        <div style={{ 
                          background: "rgba(212, 175, 55, 0.08)", 
                          border: "1px solid rgba(212, 175, 55, 0.2)",
                          color: "var(--text-primary)",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "16px",
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start"
                        }}>
                          <Clock size={16} style={{ color: "var(--fifa-gold)", marginTop: "2px", flexShrink: 0 }} />
                          <div>
                            <strong style={{ fontSize: "11px", textTransform: "uppercase", display: "block", color: "var(--warning-orange)", letterSpacing: "0.3px" }}>AI Recommended Departure Strategy</strong>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "inline-block", marginTop: "2px" }}>{departure}</span>
                          </div>
                        </div>
                      )}

                      {/* Directions Timeline Flow */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", paddingLeft: "14px", borderLeft: "2px dashed var(--border-light)" }}>
                        {directions.map((step, idx) => {
                          const isWarning = step.includes("⚠️") || step.includes("Warning");
                          const cleanStep = step.replace("⚠️", "").replace("Warning:", "").trim();
                          
                          return (
                            <div key={idx} style={{ position: "relative", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                              {/* Dot marker */}
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: isWarning ? "var(--warning-orange)" : "var(--fifa-blue)",
                                position: "absolute",
                                left: "-19px",
                                top: "5px",
                                border: "2px solid #ffffff",
                                boxShadow: "0 0 4px rgba(0,0,0,0.15)"
                              }} />
                              
                              <div style={{ flex: 1 }}>
                                {isWarning ? (
                                  <div style={{ background: "rgba(227, 116, 0, 0.05)", border: "1px solid rgba(227, 116, 0, 0.15)", padding: "8px 10px", borderRadius: "6px" }}>
                                    <span style={{ fontWeight: "700", color: "var(--warning-orange)", fontSize: "11px", display: "block", marginBottom: "2px" }}>⚠️ Transit Surge Update</span>
                                    <span style={{ color: "var(--text-secondary)" }}>{cleanStep}</span>
                                  </div>
                                ) : (
                                  <span style={{ color: "var(--text-primary)", fontWeight: step.includes("Estimated Travel Time") ? "700" : "500" }}>{step}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <button 
                  className="btn-primary"
                  onClick={() => setShowWalletModal(true)}
                  style={{ background: "var(--fifa-gold)", color: "#000000", fontWeight: "700" }}
                >
                  <Ticket size={16} /> Generate Digital Transit Ticket Pass
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>
                <Clock size={40} style={{ marginBottom: "12px", opacity: 0.5 }} />
                <p style={{ fontSize: "14px" }}>Enter your destination and select a transport mode to compile a dynamic, crowd-aware post-match transit plan.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Wallet Boarding Pass Modal */}
      {showWalletModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "20px"
        }}>
          <div 
            className="animated-entry"
            style={{
              background: "#0C3E33", // Deep forest green pass
              borderRadius: "16px",
              width: "360px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              color: "#FFFFFF",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)"
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px stroke rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Ticket size={20} style={{ color: "var(--fifa-gold)" }} />
                <span style={{ fontWeight: "800", fontSize: "14px", letterSpacing: "1px" }}>FIFA WORLD CUP 2026</span>
              </div>
              <button 
                onClick={() => setShowWalletModal(false)}
                style={{ background: "transparent", border: "none", color: "#FFFFFF", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Ticket Info */}
            <div style={{ padding: "24px 20px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-sidebar)", textTransform: "uppercase" }}>Pass Type</span>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fifa-gold)", marginTop: "2px" }}>
                {modePreference === "train" ? "METRO SHUTTLE PASS" : modePreference === "rideshare" ? "RIDESHARE ENTRY PERMIT" : "EXPRESS HUB SHUTTLE"}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "20px" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-sidebar)" }}>FROM (VENUE)</span>
                  <p style={{ fontSize: "13px", fontWeight: "700", marginTop: "2px" }}>{currentStadium.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-sidebar)" }}>TO (DESTINATION)</span>
                  <p style={{ fontSize: "13px", fontWeight: "700", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{destination}</p>
                </div>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-sidebar)" }}>BOARDING TIME</span>
                  <p style={{ fontSize: "13px", fontWeight: "700", marginTop: "2px" }}>Post-Match Peak</p>
                </div>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-sidebar)" }}>GATE ROUTE</span>
                  <p style={{ fontSize: "13px", fontWeight: "700", marginTop: "2px" }}>
                    {modePreference === "train" ? "Gate A (Metro)" : modePreference === "rideshare" ? "Gate C (Lot K)" : "Gate D (Shuttle)"}
                  </p>
                </div>
              </div>

              {/* Barcode/QR Code Simulation */}
              <div style={{ 
                background: "#FFFFFF", 
                borderRadius: "8px", 
                padding: "16px", 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                marginTop: "24px",
                color: "#000000"
              }}>
                <QrCode size={110} style={{ color: "#000000" }} />
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-secondary)", marginTop: "8px", letterSpacing: "2px" }}>
                  M04-{currentStadium.city.slice(0,3).toUpperCase()}-9842
                </span>
              </div>
            </div>

            {/* Wallet Footer */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", display: "flex", justifyContent: "center" }}>
              <button 
                onClick={() => {
                  alert("Pass saved to Apple Wallet / Google Wallet!");
                  setShowWalletModal(false);
                }}
                className="btn-primary"
                style={{ background: "var(--fifa-gold)", color: "#000000", fontSize: "12px", fontWeight: "700", width: "100%" }}
              >
                <CreditCard size={14} /> Add to Digital Wallet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

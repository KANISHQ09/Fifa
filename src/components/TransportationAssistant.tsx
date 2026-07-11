import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Car, 
  Train, 
  MapPin, 
  Clock, 
  Sparkles
} from "lucide-react";

export const TransportationAssistant: React.FC = () => {
  const { stadiums } = useSimulation();

  const [selectedStadium, setSelectedStadium] = useState(stadiums[0]);
  const [destination, setDestination] = useState("");
  const [modePreference, setModePreference] = useState("train");
  const [generatedPlan, setGeneratedPlan] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync selected stadium details if state updates
  React.useEffect(() => {
    const current = stadiums.find(s => s.name === selectedStadium.name);
    if (current) setSelectedStadium(current);
  }, [stadiums, selectedStadium.name]);

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      // Simulate GenAI personalized travel planner logic
      const surge = selectedStadium.transitStatus.rideshareSurge;
      const metroDelay = selectedStadium.transitStatus.metro === "Delayed";
      const destName = destination;

      let planText = `[StadiumPulse AI Personal Travel Guide]\n\n`;
      planText += `📍 ROUTE: ${selectedStadium.name} ➡️ ${destName}\n`;
      
      if (modePreference === "train") {
        planText += `🚆 PREFERENCE: Public Metro/Train (Eco-Choice 🌿)\n\n`;
        planText += `⏱️ RECOMMENDED DEPARTURE TIME: Head to the exit at Minute 78 (or wait 15 mins post-match) to avoid the Gate exit bottleneck.\n\n`;
        planText += `STEPS:\n`;
        planText += `1. Leave your seat and head towards Exit Gate A.\n`;
        if (metroDelay) {
          planText += `2. ⚠️ Note: The Red Metro Line is currently experiencing an 8-minute bottleneck. Take the Blue Line (Platform 3) instead, which goes to Central Terminal.\n`;
        } else {
          planText += `2. Take the Direct Train (Platform 1) to Central Terminal. Trains run every 4 minutes.\n`;
        }
        planText += `3. Total Transit Time: ~35 minutes. Cost: 2.75 USD. Carbon offset: 2.4kg CO2 compared to rideshare.`;
      } else if (modePreference === "rideshare") {
        planText += `🚗 PREFERENCE: Rideshare (Uber/Lyft)\n\n`;
        planText += `⏱️ RECOMMENDED DEPARTURE TIME: Wait 20 minutes post-match inside the stadium concourse to allow the price surge multiplier to subside.\n\n`;
        planText += `STEPS:\n`;
        planText += `1. Exit the stadium via Verizon Gate and follow the yellow signage to Rideshare Lot K.\n`;
        planText += `2. ⚠️ Pricing Warning: High demand has triggered a ${surge}x surge multiplier. Current estimated fare is ${Math.round(25 * surge)} USD.\n`;
        planText += `3. Request your ride ONLY when you arrive inside Lot K; drivers cannot pick up on main stadium ring roads.\n`;
        planText += `4. Total Transit Time: ~25 minutes (subject to perimeter gridlock).`;
      } else {
        planText += `🚌 PREFERENCE: Stadium Shuttle Bus\n\n`;
        planText += `⏱️ RECOMMENDED DEPARTURE TIME: Leave immediately at full-time whistle.\n\n`;
        planText += `STEPS:\n`;
        planText += `1. Exit the stadium via Bud Light Gate and walk 100 meters north to Bus Bay 4.\n`;
        planText += `2. Board the Central Hub Express Shuttle. Shuttle buses are departing continuously as they fill.\n`;
        planText += `3. Total Transit Time: ~40 minutes. Free entry with valid match day ticket.`;
      }

      setGeneratedPlan(planText);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="role-view-wrapper animated-entry">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
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
                  <span className={`badge-status ${selectedStadium.transitStatus.metro === "Delayed" ? "warning" : "success"}`}>
                    {selectedStadium.transitStatus.metro}
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
                    {selectedStadium.transitStatus.rideshareSurge}x Surge
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
                    {selectedStadium.transitStatus.parkingAvailability}% Empty
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
                  placeholder="e.g. Los Angeles Downtown Hotel or LAX Airport" 
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
                  "Compiling perimeter traffic feeds..."
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
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "var(--fifa-gold)" }} /> Personalized AI Travel Companion
          </h3>

          {generatedPlan ? (
            <div 
              className="animated-entry"
              style={{ 
                background: "rgba(0, 0, 0, 0.2)", 
                border: "1px solid var(--border-glass)", 
                padding: "20px", 
                borderRadius: "var(--radius-sm)", 
                flex: 1, 
                whiteSpace: "pre-line", 
                fontSize: "13.5px", 
                lineHeight: "1.6",
                color: "var(--text-secondary)",
                fontFamily: "monospace"
              }}
            >
              {generatedPlan}
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
  );
};

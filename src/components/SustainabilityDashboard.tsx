import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Zap, 
  Droplet, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  Leaf 
} from "lucide-react";

export const SustainabilityDashboard: React.FC = () => {
  const { stadiums } = useSimulation();
  
  const [selectedStadium, setSelectedStadium] = useState(stadiums[0]);

  // Sync selected stadium details if state updates
  React.useEffect(() => {
    const current = stadiums.find(s => s.name === selectedStadium.name);
    if (current) setSelectedStadium(current);
  }, [stadiums, selectedStadium.name]);

  const { energyKWh, waterLiters, wasteKg, baselineEnergy, baselineWater, baselineWaste } = selectedStadium.sustainability;

  // Compute percentage deviations
  const energyDev = Math.round(((energyKWh - baselineEnergy) / baselineEnergy) * 100);
  const waterDev = Math.round(((waterLiters - baselineWater) / baselineWater) * 100);
  const wasteDev = Math.round(((wasteKg - baselineWaste) / baselineWaste) * 100);

  const isEnergyAnomaly = energyDev > 15;
  const isWaterAnomaly = waterDev > 15;
  const isWasteAnomaly = wasteDev > 15;

  const hasAnyAnomaly = isEnergyAnomaly || isWaterAnomaly || isWasteAnomaly;

  // Generate simulated GenAI sustainability advice
  const generateAIAdvice = () => {
    let advice = "🌿 [StadiumPulse AI Sustainability Intelligence]\n\n";
    let count = 1;

    if (isEnergyAnomaly) {
      advice += `${count++}. ENERGY DIVERGENCE: Energy load is ${energyDev}% above match-day baseline. Anomaly localized in HVAC Zone D (Executive Suites). Recommend adjusting thermostats to 23.5°C to save ~400 kWh.\n`;
    }
    if (isWaterAnomaly) {
      advice += `${count++}. WATER CONSUMPTION SPIKE: Water usage is ${waterDev}% higher than baseline. Monitoring indicates continuous pressure drop at concourse Gate C restrooms. Dispatching leak inspection crew immediately to check valves.\n`;
    }
    if (isWasteAnomaly) {
      advice += `${count++}. RECYCLING OVERFLOW: Waste accumulation is ${wasteDev}% above baseline. Gate A concession packaging bins are at 92% capacity. Recommend dispatching green stewards team for pre-peak bag collection.\n`;
    }

    if (!isEnergyAnomaly && !isWaterAnomaly && !isWasteAnomaly) {
      advice += `All environmental resources are trending within 5% of nominal match-day baselines. Smart grids are regulating HVAC/Water loops efficiently. No recommended interventions at this time.`;
    }

    return advice;
  };

  return (
    <div className="role-view-wrapper animated-entry">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Leaf size={28} /> Sustainability & ESG Dashboard
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time environmental telemetry tracking energy grids, water consumption, and smart waste management.
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

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        
        {/* Left Side: Resource Telemetry Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Energy Telemetry */}
          <div className="glass-panel" style={{ padding: "20px", borderLeft: isEnergyAnomaly ? "4px solid var(--danger-red)" : "4px solid var(--stadium-green)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>HVAC & STADIUM GRID</span>
                <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <Zap size={16} style={{ color: "var(--fifa-gold)" }} /> Energy Consumption
                </h3>
              </div>
              <span className={`badge-status ${isEnergyAnomaly ? "danger" : "success"}`} style={{ fontSize: "10px" }}>
                {energyDev > 0 ? `+${energyDev}%` : `${energyDev}%`} vs Baseline
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "12px" }}>
              <span>Current Load: <strong>{energyKWh.toLocaleString()} kWh</strong></span>
              <span style={{ color: "var(--text-secondary)" }}>Baseline: {baselineEnergy.toLocaleString()} kWh</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", height: "6px", borderRadius: "3px", overflow: "hidden", marginTop: "10px" }}>
              <div style={{ background: isEnergyAnomaly ? "var(--danger-red)" : "var(--stadium-green)", height: "100%", width: `${Math.min(100, (energyKWh / baselineEnergy) * 50)}%` }} />
            </div>
          </div>

          {/* Water Telemetry */}
          <div className="glass-panel" style={{ padding: "20px", borderLeft: isWaterAnomaly ? "4px solid var(--danger-red)" : "4px solid var(--stadium-green)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>SANITY & CONCOURSE LOOPS</span>
                <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <Droplet size={16} style={{ color: "var(--fifa-blue)" }} /> Water Consumption
                </h3>
              </div>
              <span className={`badge-status ${isWaterAnomaly ? "danger" : "success"}`} style={{ fontSize: "10px" }}>
                {waterDev > 0 ? `+${waterDev}%` : `${waterDev}%`} vs Baseline
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "12px" }}>
              <span>Current Flow: <strong>{waterLiters.toLocaleString()} Liters</strong></span>
              <span style={{ color: "var(--text-secondary)" }}>Baseline: {baselineWater.toLocaleString()} Liters</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", height: "6px", borderRadius: "3px", overflow: "hidden", marginTop: "10px" }}>
              <div style={{ background: isWaterAnomaly ? "var(--danger-red)" : "var(--fifa-blue)", height: "100%", width: `${Math.min(100, (waterLiters / baselineWater) * 50)}%` }} />
            </div>
          </div>

          {/* Waste Telemetry */}
          <div className="glass-panel" style={{ padding: "20px", borderLeft: isWasteAnomaly ? "4px solid var(--danger-red)" : "4px solid var(--stadium-green)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>SORTING & COMPOST STATIONS</span>
                <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <Trash2 size={16} style={{ color: "var(--warning-orange)" }} /> Solid Waste Accumulation
                </h3>
              </div>
              <span className={`badge-status ${isWasteAnomaly ? "danger" : "success"}`} style={{ fontSize: "10px" }}>
                {wasteDev > 0 ? `+${wasteDev}%` : `${wasteDev}%`} vs Baseline
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "12px" }}>
              <span>Current Accumulation: <strong>{wasteKg.toLocaleString()} kg</strong></span>
              <span style={{ color: "var(--text-secondary)" }}>Baseline: {baselineWaste.toLocaleString()} kg</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", height: "6px", borderRadius: "3px", overflow: "hidden", marginTop: "10px" }}>
              <div style={{ background: isWasteAnomaly ? "var(--danger-red)" : "var(--warning-orange)", height: "100%", width: `${Math.min(100, (wasteKg / baselineWaste) * 50)}%` }} />
            </div>
          </div>

        </div>

        {/* Right Side: AI Recommendations & Anomaly alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {hasAnyAnomaly && (
            <div 
              style={{ 
                background: "rgba(255, 61, 113, 0.1)", 
                border: "1px solid var(--danger-red)", 
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                animation: "pulse-danger 2s infinite alternate"
              }}
            >
              <AlertTriangle style={{ color: "var(--danger-red)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--danger-red)" }}>Environmental Divergence Detected</h4>
                <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Resource metrics at {selectedStadium.name} have exceeded the permitted 15% match-day baseline tolerance threshold.
                </p>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} style={{ color: "var(--fifa-gold)" }} /> GenAI Resource Recommendations
            </h3>

            <div 
              style={{ 
                background: "rgba(0,0,0,0.3)", 
                border: "1px solid var(--border-glass)", 
                padding: "16px", 
                borderRadius: "8px", 
                flex: 1, 
                whiteSpace: "pre-line", 
                fontSize: "12.5px", 
                lineHeight: "1.6",
                color: "var(--text-secondary)",
                fontFamily: "monospace"
              }}
            >
              {generateAIAdvice()}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

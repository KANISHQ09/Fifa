import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Zap, 
  Droplet, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  Leaf,
  Settings,
  ShieldCheck
} from "lucide-react";

export const SustainabilityDashboard: React.FC = () => {
  const { stadiums, isEnergySavingMode, toggleEnergySavingMode, dispatchCleanupCrew, cleanupStadiums } = useSimulation();
  
  const [selectedStadiumName, setSelectedStadiumName] = useState(stadiums[0].name);
  const [cleanupNotice, setCleanupNotice] = useState<string | null>(null);

  const currentStadium = stadiums.find(s => s.name === selectedStadiumName) || stadiums[0];

  const { energyKWh, waterLiters, wasteKg, baselineEnergy, baselineWater, baselineWaste } = currentStadium.sustainability;

  // Compute percentage deviations
  const energyDev = Math.round(((energyKWh - baselineEnergy) / baselineEnergy) * 100);
  const waterDev = Math.round(((waterLiters - baselineWater) / baselineWater) * 100);
  const wasteDev = Math.round(((wasteKg - baselineWaste) / baselineWaste) * 100);

  const isEnergyAnomaly = energyDev > 15;
  const isWaterAnomaly = waterDev > 15;
  const isWasteAnomaly = wasteDev > 15;

  const hasAnyAnomaly = isEnergyAnomaly || isWaterAnomaly || isWasteAnomaly;

  const isCleanupActive = cleanupStadiums.includes(currentStadium.name);

  const handleDispatchCleanup = () => {
    dispatchCleanupCrew(currentStadium.name);
    setCleanupNotice("Eco-Cleanup stewards team dispatched! Bins are being emptied.");
    setTimeout(() => setCleanupNotice(null), 5000);
  };

  // Generate simulated GenAI sustainability advice
  const generateAIAdvice = () => {
    let advice = "🌿 [StadiumPulse AI Sustainability Intelligence]\n\n";
    let count = 1;

    if (isEnergyAnomaly) {
      advice += `${count++}. ENERGY DIVERGENCE: Energy load is ${energyDev}% above match-day baseline. Anomaly localized in HVAC Zone D (Executive Suites). Recommend adjusting thermostats to 23.5°C or enabling Energy-Saving HVAC Mode to save ~400 kWh.\n\n`;
    }
    if (isWaterAnomaly) {
      advice += `${count++}. WATER CONSUMPTION SPIKE: Water usage is ${waterDev}% higher than baseline. Monitoring indicates continuous pressure drop at concourse Gate C restrooms. Dispatching leak inspection crew immediately to check valves.\n\n`;
    }
    if (isWasteAnomaly) {
      advice += `${count++}. RECYCLING OVERFLOW: Solid waste accumulation is ${wasteDev}% above baseline. Gate A concession packaging bins are at 92% capacity. Dispatching Eco-Cleanup Stewards will empty recycling bins.\n\n`;
    }

    if (isEnergySavingMode) {
      advice += `⚡ ENERGY-SAVING HVAC ACTIVE: Dynamic thermostat scaling is lowering cooling loads by 60% in vacant suite channels. Energy telemetry reflects nominal grid health.\n\n`;
    }

    if (isCleanupActive) {
      advice += `♻️ ECO-CLEANUP ACTIVE: Stewards are collecting compost and recycling streams. Waste levels are actively reducing.\n\n`;
    }

    if (!isEnergyAnomaly && !isWaterAnomaly && !isWasteAnomaly && !isEnergySavingMode && !isCleanupActive) {
      advice += `All environmental resources are trending within 5% of nominal match-day baselines. Smart grids are regulating HVAC/Water loops efficiently. No recommended interventions at this time.`;
    }

    return advice;
  };

  // SVG Chart Parameters
  const chartWidth = 240;
  const chartHeight = 80;

  return (
    <div className="role-view-wrapper animated-entry">
      <div className="view-header">
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
            value={selectedStadiumName} 
            onChange={e => setSelectedStadiumName(e.target.value)}
            style={{ width: "220px", padding: "8px 12px" }}
          >
            {stadiums.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {cleanupNotice && (
        <div 
          className="animated-entry"
          style={{ 
            background: "rgba(15, 157, 88, 0.08)", 
            border: "1px solid var(--stadium-green)", 
            color: "var(--stadium-green)", 
            padding: "12px 16px", 
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px"
          }}
        >
          <ShieldCheck size={16} /> {cleanupNotice}
        </div>
      )}

      {/* Main Grid: Telemetry, AI advice, and grid controls */}
      <div className="responsive-grid-2col-unequal">
        
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

            {/* Custom SVG usage bar chart */}
            <div style={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
              <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <rect x="10" y="10" width={chartWidth - 20} height="20" rx="4" fill="rgba(255,255,255,0.05)" />
                <rect x="10" y="10" width={Math.min(chartWidth - 20, ((energyKWh / baselineEnergy) * (chartWidth - 20)) / 1.5)} height="20" rx="4" fill="var(--fifa-gold)" />
                <line x1={chartWidth / 2} y1="5" x2={chartWidth / 2} y2="35" stroke="var(--danger-red)" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x={chartWidth / 2 + 5} y="32" fill="var(--danger-red)" fontSize="8">Baseline Limit</text>
              </svg>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "4px" }}>
              <span>Current Load: <strong>{energyKWh.toLocaleString()} kWh</strong></span>
              <span style={{ color: "var(--text-secondary)" }}>Baseline: {baselineEnergy.toLocaleString()} kWh</span>
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

            {/* Custom SVG usage bar chart */}
            <div style={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
              <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <rect x="10" y="10" width={chartWidth - 20} height="20" rx="4" fill="rgba(255,255,255,0.05)" />
                <rect x="10" y="10" width={Math.min(chartWidth - 20, ((waterLiters / baselineWater) * (chartWidth - 20)) / 1.5)} height="20" rx="4" fill="var(--fifa-blue)" />
                <line x1={chartWidth / 2} y1="5" x2={chartWidth / 2} y2="35" stroke="var(--danger-red)" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x={chartWidth / 2 + 5} y="32" fill="var(--danger-red)" fontSize="8">Baseline Limit</text>
              </svg>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "4px" }}>
              <span>Current Flow: <strong>{waterLiters.toLocaleString()} Liters</strong></span>
              <span style={{ color: "var(--text-secondary)" }}>Baseline: {baselineWater.toLocaleString()} Liters</span>
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

            {/* Custom SVG usage bar chart */}
            <div style={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
              <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <rect x="10" y="10" width={chartWidth - 20} height="20" rx="4" fill="rgba(255,255,255,0.05)" />
                <rect x="10" y="10" width={Math.min(chartWidth - 20, ((wasteKg / baselineWaste) * (chartWidth - 20)) / 1.5)} height="20" rx="4" fill="var(--warning-orange)" />
                <line x1={chartWidth / 2} y1="5" x2={chartWidth / 2} y2="35" stroke="var(--danger-red)" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x={chartWidth / 2 + 5} y="32" fill="var(--danger-red)" fontSize="8">Baseline Limit</text>
              </svg>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "4px" }}>
              <span>Current Accumulation: <strong>{wasteKg.toLocaleString()} kg</strong></span>
              <span style={{ color: "var(--text-secondary)" }}>Baseline: {baselineWaste.toLocaleString()} kg</span>
            </div>
          </div>

        </div>

        {/* Right Side: AI Recommendations & Grid controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Active Grid Operations Control Panel */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings size={18} style={{ color: "var(--fifa-gold)" }} /> Smart Grid Operations Controls
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              {/* Energy control toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "700", display: "block" }}>HVAC Eco-Saving Mode</span>
                  <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Adjust suite cooling offsets</span>
                </div>
                <button 
                  onClick={toggleEnergySavingMode}
                  className="btn-primary"
                  style={{ 
                    background: isEnergySavingMode ? "var(--stadium-green)" : "rgba(255,255,255,0.08)", 
                    color: isEnergySavingMode ? "#000000" : "#FFFFFF", 
                    fontSize: "11px", 
                    padding: "6px 12px",
                    fontWeight: "700"
                  }}
                >
                  {isEnergySavingMode ? "ACTIVE (Save 60%)" : "Toggled OFF"}
                </button>
              </div>

              {/* Waste cleanup dispatch button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "700", display: "block" }}>Eco-Cleanup Stewards</span>
                  <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Empty recycling & waste streams</span>
                </div>
                <button 
                  onClick={handleDispatchCleanup}
                  disabled={isCleanupActive}
                  className="btn-secondary"
                  style={{ 
                    fontSize: "11px", 
                    padding: "6px 12px",
                    background: isCleanupActive ? "rgba(15,157,88,0.2)" : "#FFFFFF",
                    borderColor: isCleanupActive ? "var(--stadium-green)" : "var(--border-light)",
                    color: isCleanupActive ? "var(--stadium-green)" : "var(--text-primary)"
                  }}
                >
                  {isCleanupActive ? "IN PROGRESS..." : "Dispatch Stewards"}
                </button>
              </div>

            </div>
          </div>

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
                animation: "pulse-danger 2.5s infinite alternate"
              }}
            >
              <AlertTriangle style={{ color: "var(--danger-red)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--danger-red)" }}>Environmental Divergence Alert</h4>
                <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Resource load indices at {currentStadium.name} have exceeded the permitted 15% ESG deviation threshold. Run AISuggested optimization protocols above.
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
                background: "#F1F5F9", 
                border: "1px solid var(--border-light)", 
                padding: "16px", 
                borderRadius: "8px", 
                flex: 1, 
                whiteSpace: "pre-line", 
                fontSize: "12.5px", 
                lineHeight: "1.6",
                color: "var(--text-primary)",
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

import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  BarChart2, 
  FileDown, 
  Leaf, 
  Percent, 
  Clock, 
  Download,
  CheckCircle,
  Sparkles
} from "lucide-react";

export const ReportsAnalytics: React.FC = () => {
  const { incidents, stadiums } = useSimulation();
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleExportCSV = () => {
    setExportingType("csv");
    setTimeout(() => {
      // Build actual CSV data from live incidents in context
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Incident ID,Stadium Name,Zone,Type,Severity,Status,Timestamp\n";
      
      incidents.forEach(inc => {
        csvContent += `${inc.id},"${inc.stadiumName}","${inc.zone}","${inc.type}","${inc.severity}","${inc.status}","${new Date(inc.timestamp).toLocaleString()}"\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "StadiumPulse_Incident_Audit_Log.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportingType(null);
      setAlertMessage("Successfully downloaded live Incident Audit Log CSV!");
      setTimeout(() => setAlertMessage(null), 4000);
    }, 1200);
  };

  const handleExportESG = () => {
    setExportingType("esg");
    setTimeout(() => {
      // Build actual text file from live sustainability telemetry
      let content = "=========================================================\n";
      content += "        FIFA WORLD CUP 2026 - ESG RESOURCE AUDIT\n";
      content += `        Generated: ${new Date().toLocaleString()}\n`;
      content += "=========================================================\n\n";
      
      stadiums.forEach(s => {
        content += `🏟️ VENUE: ${s.name} (${s.city}, ${s.country})\n`;
        content += `---------------------------------------------------------\n`;
        content += `  * Energy Load: ${s.sustainability.energyKWh.toLocaleString()} kWh (Baseline: ${s.sustainability.baselineEnergy.toLocaleString()} kWh)\n`;
        content += `  * Water Usage: ${s.sustainability.waterLiters.toLocaleString()} Liters (Baseline: ${s.sustainability.baselineWater.toLocaleString()} Liters)\n`;
        content += `  * Solid Waste: ${s.sustainability.wasteKg.toLocaleString()} kg (Baseline: ${s.sustainability.baselineWaste.toLocaleString()} kg)\n`;
        content += `  * Metro Status: ${s.transitStatus.metro} (Rideshare Surge: ${s.transitStatus.rideshareSurge}x)\n\n`;
      });
      
      content += "=========================================================\n";
      content += "StadiumPulse AI Sustainability Intelligence © 2026\n";

      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "FIFA_26_ESG_Sustainability_Report.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setExportingType(null);
      setAlertMessage("Successfully downloaded ESG Sustainability Report!");
      setTimeout(() => setAlertMessage(null), 4000);
    }, 1200);
  };

  // Custom SVG Chart Data
  const waitTimes = [
    { label: "Gate A", baseline: 45, stadiumPulse: 28 },
    { label: "Gate B", baseline: 38, stadiumPulse: 24 },
    { label: "Gate C", baseline: 52, stadiumPulse: 32 },
    { label: "Gate D", baseline: 30, stadiumPulse: 20 },
  ];

  // SVG Area Chart Points for SLA Resolution time
  const slaPoints = "20,110 80,95 140,82 200,68 260,75 320,62 380,55 440,48";

  return (
    <div className="role-view-wrapper animated-entry" style={{ padding: "32px" }}>
      
      {/* Header section */}
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart2 size={28} /> Reports & Tournament Analytics
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Tournament-wide operations auditing, security queue offsets, accessibility SLAs, and environmental ESG reports.
          </p>
        </div>

        {/* Quick export actions */}
        <div className="map-controls-row">
          <button 
            className="btn-primary" 
            onClick={handleExportESG}
            disabled={exportingType !== null}
            style={{ fontSize: "12px", padding: "8px 16px" }}
          >
            {exportingType === "esg" ? (
              <span className="spinner" style={{ marginRight: "6px" }} />
            ) : <FileDown size={14} />}
            {exportingType === "esg" ? "Compiling PDF..." : "Export ESG Report (.txt)"}
          </button>

          <button 
            className="btn-secondary" 
            onClick={handleExportCSV}
            disabled={exportingType !== null}
            style={{ fontSize: "12px", padding: "8px 16px" }}
          >
            {exportingType === "csv" ? (
              <span className="spinner" style={{ marginRight: "6px" }} />
            ) : <Download size={14} />}
            {exportingType === "csv" ? "Generating CSV..." : "Export Incidents CSV"}
          </button>
        </div>
      </div>

      {alertMessage && (
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
            marginBottom: "20px"
          }}
        >
          <CheckCircle size={16} /> {alertMessage}
        </div>
      )}

      {/* ESG and SLA Top Row Stats cards */}
      <div className="responsive-grid-4col" style={{ gap: "20px", marginBottom: "24px" }}>
        
        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "var(--stadium-green-bg)", color: "var(--stadium-green)", padding: "12px", borderRadius: "50%" }}>
            <Leaf size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>TOTAL CUMULATIVE ENERGY SAVED</span>
            <strong style={{ fontSize: "20px", color: "var(--text-primary)" }}>14,890 kWh</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "var(--stadium-green-bg)", color: "var(--stadium-green)", padding: "12px", borderRadius: "50%" }}>
            <Leaf size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>TOTAL WASTE DIVERTED</span>
            <strong style={{ fontSize: "20px", color: "var(--text-primary)" }}>24.6 Tons</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "var(--fifa-blue-bg)", color: "var(--fifa-blue)", padding: "12px", borderRadius: "50%" }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>ACCESSIBILITY RESOLUTION SLA</span>
            <strong style={{ fontSize: "20px", color: "var(--text-primary)" }}>96.4% Met</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "var(--warning-orange-bg)", color: "var(--warning-orange)", padding: "12px", borderRadius: "50%" }}>
            <Percent size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>AVG QUEUE DELAY DECREASE</span>
            <strong style={{ fontSize: "20px", color: "var(--text-primary)" }}>-38.2% Reduction</strong>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Row */}
      <div className="responsive-grid-2col-equal">
        
        {/* Chart 1: Security Line Wait times (Double Bar Chart SVG) */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div className="card-header-responsive">
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: "700" }}>Security Gate Waiting Times</h4>
              <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Baseline vs StadiumPulse AI Guided Routing (Minutes)</span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--stadium-green)", fontWeight: "700" }}>38% Faster</span>
          </div>

          <div style={{ height: "240px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px", position: "relative" }}>
            {waitTimes.map((bar, idx) => {
              const maxVal = 60;
              const hBase = `${(bar.baseline / maxVal) * 180}px`;
              const hPulse = `${(bar.stadiumPulse / maxVal) * 180}px`;

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                    {/* Baseline Bar */}
                    <div style={{ width: "24px", height: hBase, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-glass)", borderRadius: "4px 4px 0 0", position: "relative" }} title={`Baseline: ${bar.baseline}m`}>
                      <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "var(--text-secondary)" }}>{bar.baseline}</span>
                    </div>
                    {/* AI Guided Bar */}
                    <div style={{ width: "24px", height: hPulse, background: "var(--stadium-green)", borderRadius: "4px 4px 0 0", position: "relative" }} title={`StadiumPulse: ${bar.stadiumPulse}m`}>
                      <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "var(--stadium-green)", fontWeight: "700" }}>{bar.stadiumPulse}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)" }}>{bar.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "16px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
              <span style={{ width: "12px", height: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-glass)", borderRadius: "2px" }} /> Historical Baseline
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
              <span style={{ width: "12px", height: "12px", background: "var(--stadium-green)", borderRadius: "2px" }} /> StadiumPulse AI Route Optimized
            </span>
          </div>
        </div>

        {/* Chart 2: SLA Response Curve (Area Chart SVG) */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div className="card-header-responsive">
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: "700" }}>Accessibility SLA Resolution Time</h4>
              <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Minutes elapsed to resolve mobile mobility dispatches</span>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--fifa-gold)" }}>
              <Sparkles size={12} /> Target: &lt;10m
            </span>
          </div>

          <div style={{ height: "240px", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 460 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--fifa-blue)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--fifa-blue)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="20" y1="20" x2="440" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="60" x2="440" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="100" x2="440" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* SLA Target Line (Threshold at y=100 which represents 10 mins) */}
              <line x1="20" y1="100" x2="440" y2="100" stroke="var(--danger-red)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="30" y="94" fill="var(--danger-red)" fontSize="9" fontWeight="700">SLA Breach Limit (10 min)</text>

              {/* Area path */}
              <path d={`M 20,140 L ${slaPoints} L 440,140 Z`} fill="url(#areaGrad)" />
              {/* Line path */}
              <path d={`M ${slaPoints}`} fill="none" stroke="var(--fifa-blue)" strokeWidth="3" />
              
              {/* Points circles */}
              {slaPoints.split(" ").map((pt, i) => {
                const [x, y] = pt.split(",");
                return <circle key={i} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="var(--fifa-blue)" strokeWidth="2" />;
              })}
            </svg>
            
            {/* X-Axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10px", marginTop: "8px", fontSize: "10px", color: "var(--text-secondary)" }}>
              <span>Match Day 1</span>
              <span>Day 4</span>
              <span>Day 8</span>
              <span>Day 12</span>
              <span>Day 16</span>
              <span>Day 20</span>
              <span>Day 24</span>
              <span>Day 28 (Final)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

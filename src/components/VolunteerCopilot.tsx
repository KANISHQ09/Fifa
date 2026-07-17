import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { searchKnowledgeBase } from "../data/knowledgeBase";
import { 
  Users, 
  Languages, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle,
  Compass,
  UserCheck
} from "lucide-react";

export const VolunteerCopilot: React.FC = () => {
  const { stadiums, accessibilityRequests, updateRequestStatus, reportIncident } = useSimulation();

  const [volunteerName, setVolunteerName] = useState("Carlos Ruiz");
  const [selectedStadiumName, setSelectedStadiumName] = useState(stadiums[0].name);
  
  // Translation Simulator
  const [translationText, setTranslationText] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [translatedResult, setTranslatedResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Escalation Form
  const [escalationType, setEscalationType] = useState<any>("Medical Incident");
  const [escalationZone, setEscalationZone] = useState("Gate A");
  const [escalationDesc, setEscalationDesc] = useState("");
  const [escalationSuccess, setEscalationSuccess] = useState(false);

  const currentStadium = stadiums.find(s => s.name === selectedStadiumName) || stadiums[0];

  // Find the active request assigned to this volunteer in Simulation state
  const assignedTask = accessibilityRequests.find(r => r.assignedVolunteer === volunteerName && r.status !== "Resolved") || null;

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!translationText.trim()) return;

    setIsTranslating(true);
    
    setTimeout(() => {
      const query = translationText;
      const { matches } = searchKnowledgeBase(query);

      let translated = "";
      const lowerQ = query.toLowerCase();
      
      if (lowerQ.includes("sensorial") || lowerQ.includes("sensory")) {
        translated = `[Translated to English]: "Where is the sensory room?"\n\n🎯 GROUNDED RAG ANSWER: Sensory rooms at ${currentStadium.name} are located near Section 121 (for MetLife) or Section 231 (for SoFi). You can guide the fan there using Elevator West. Sensory bags are also available at Guest Services.`;
      } else if (lowerQ.includes("banheiro") || lowerQ.includes("baño") || lowerQ.includes("restroom") || lowerQ.includes("toilet")) {
        translated = `[Translated to English]: "Where is the nearest restroom?"\n\n🎯 GROUNDED RAG ANSWER: All concourse levels have public restrooms. The nearest accessible restrooms are located immediately behind Concessions Section 102.`;
      } else {
        translated = `[Translated to English]: "${query}"\n\n🎯 GROUNDED RAG ANSWER: Grounded details found: ${matches.length > 0 ? matches[0].content : "Stadium gates open 3 hours prior to kickoff. Prohibited items include clear bags smaller than 12x12x6 inches."}`;
      }

      setTranslatedResult(translated);
      setIsTranslating(false);
    }, 1000);
  };

  const handleEscalationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationDesc.trim()) return;

    reportIncident({
      stadiumName: currentStadium.name,
      zone: escalationZone,
      type: escalationType,
      description: escalationDesc,
      severity: "High"
    });

    setEscalationDesc("");
    setEscalationSuccess(true);
    setTimeout(() => setEscalationSuccess(false), 5000);
  };

  return (
    <div className="role-view-wrapper animated-entry">
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={28} /> Volunteer & Staff Copilot
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Mobile dashboard for on-ground helpers. Instant RAG translation, check-in instructions, and rapid safety escalations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Identify Volunteer Role</label>
            <select 
              value={volunteerName}
              onChange={e => setVolunteerName(e.target.value)}
              style={{ width: "160px", padding: "6px 10px" }}
            >
              <option value="Carlos Ruiz">Carlos Ruiz</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="Emily Wong">Emily Wong</option>
              <option value="Alex Mercer">Alex Mercer</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Active Stadium</label>
            <select 
              value={selectedStadiumName} 
              onChange={e => setSelectedStadiumName(e.target.value)}
              style={{ width: "160px", padding: "6px 10px" }}
            >
              {stadiums.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="responsive-grid-2col-unequal">
        
        {/* Left: Station Manual & Active Dispatched Task */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Active Assigned Task Queue */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserCheck size={18} style={{ color: "var(--fifa-gold)" }} /> Dispatched Active Tasks
            </h3>

            {assignedTask ? (
              <div 
                className="animated-entry" 
                style={{ 
                  background: "rgba(212,175,55,0.06)", 
                  border: "1px solid var(--fifa-gold)", 
                  padding: "16px", 
                  borderRadius: "8px" 
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span className="badge-status info" style={{ fontSize: "9px", padding: "1px 4px", marginBottom: "6px" }}>
                      {assignedTask.type}
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{assignedTask.fanName}</h4>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>{assignedTask.id}</span>
                </div>
                
                <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "6px" }}>
                  📍 Location: {assignedTask.location} ({assignedTask.stadiumName})
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Elapsed time: {assignedTask.durationMinutes} minutes. Urgency: <strong style={{ color: assignedTask.urgency === "High" ? "var(--danger-red)" : "inherit" }}>{assignedTask.urgency}</strong>
                </p>

                {/* Task lifecycle action buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  {assignedTask.status === "Assigned" && (
                    <button
                      className="btn-primary"
                      onClick={() => updateRequestStatus(assignedTask.id, "En Route")}
                      style={{ flex: 1, background: "var(--warning-orange)", color: "#FFFFFF", fontSize: "12px", padding: "8px" }}
                    >
                      <Compass size={14} /> Start Walking (En Route)
                    </button>
                  )}
                  {assignedTask.status === "En Route" && (
                    <button
                      className="btn-primary"
                      onClick={() => updateRequestStatus(assignedTask.id, "Resolved")}
                      style={{ flex: 1, background: "var(--stadium-green)", color: "#000000", fontSize: "12px", padding: "8px" }}
                    >
                      <CheckCircle size={14} /> Mark as Resolved (Completed)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "13.5px" }}>
                🟢 No active PWD assist dispatch requests. Stand by for task assignments.
              </div>
            )}
          </div>

          {/* Shift info */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={18} style={{ color: "var(--fifa-blue)" }} /> Shift & Station Assignment
            </h3>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", padding: "12px", borderRadius: "8px", fontSize: "13px" }}>
              <p>📍 Assigned Station: <strong>Info Desk Gate A</strong></p>
              <p style={{ marginTop: "6px" }}>🕒 Active Shift: <strong>16:00 - 22:00 (Today)</strong></p>
              <p style={{ marginTop: "6px" }}>👥 Contact Supervisor: <strong>Jordan (Ops Channel 1)</strong></p>
            </div>
          </div>

        </div>

        {/* Right: Translation Helper & One-Tap Incident Escalation Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Translation Simulator */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Languages size={18} style={{ color: "var(--fifa-gold)" }} /> Live Fan Translation Helper
            </h3>

            <form onSubmit={handleTranslate} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Paste Fan's Question (or Speak)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Onde fica a sala sensorial? (Portuguese)"
                  value={translationText}
                  onChange={e => setTranslationText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <select 
                  value={targetLang} 
                  onChange={e => setTargetLang(e.target.value)}
                  style={{ padding: "8px", fontSize: "12px" }}
                >
                  <option value="en">Translate to English</option>
                  <option value="es">Translate to Spanish</option>
                </select>
                <button type="submit" className="btn-primary" style={{ padding: "8px 16px" }} disabled={isTranslating}>
                  {isTranslating ? "Translating..." : "Translate"}
                </button>
              </div>
            </form>

            {translatedResult && (
              <div 
                className="animated-entry"
                style={{ 
                  marginTop: "14px", 
                  background: "#F1F5F9", 
                  border: "1px solid var(--border-light)", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  fontSize: "12px", 
                  lineHeight: "1.5",
                  whiteSpace: "pre-line"
                }}
              >
                {translatedResult}
              </div>
            )}
          </div>

          {/* Incident Escalation */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} style={{ color: "var(--danger-red)" }} /> Fast Incident Escalation
            </h3>

            <form onSubmit={handleEscalationSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Incident Category</label>
                <select 
                  value={escalationType} 
                  onChange={e => setEscalationType(e.target.value)}
                >
                  <option value="Medical Incident">Medical Incident (Injury/Heat Stroke)</option>
                  <option value="Lost Child">Lost Child Reunification</option>
                  <option value="Facility Issue">Facility Issue (Water leak / Power fault)</option>
                  <option value="Security Alarm">Security Incident (Alarms / Unruly crowd)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Concourse Zone / Gate Location</label>
                <select 
                  value={escalationZone} 
                  onChange={e => setEscalationZone(e.target.value)}
                >
                  {currentStadium.zones.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Describe Details</label>
                <textarea 
                  rows={3} 
                  placeholder="State the active situation. Describe patient status or exact facility failure details..."
                  value={escalationDesc}
                  onChange={e => setEscalationDesc(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ background: "var(--danger-red)", color: "#FFFFFF", width: "100%", height: "45px" }}>
                <AlertTriangle size={16} /> Escalate Ticket to Command Center
              </button>

              {escalationSuccess && (
                <div 
                  className="animated-entry"
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    color: "var(--stadium-green)", 
                    background: "rgba(0,230,118,0.05)", 
                    padding: "12px", 
                    borderRadius: "8px", 
                    border: "1px solid rgba(0,230,118,0.2)",
                    marginTop: "10px"
                  }}
                >
                  <CheckCircle size={16} />
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>
                    Incident reported! Logged on Ops Command Center feed.
                  </span>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

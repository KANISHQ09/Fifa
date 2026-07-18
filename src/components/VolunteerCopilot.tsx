import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Users, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle,
  Compass,
  UserCheck,
  MessageSquare
} from "lucide-react";

export const VolunteerCopilot: React.FC = () => {
  const { 
    stadiums, 
    accessibilityRequests, 
    updateRequestStatus, 
    reportIncident,
    supportChats,
    sendChatMessage,
    connectVolunteerToChat,
    resolveSupportChat
  } = useSimulation();

  const [volunteerName, setVolunteerName] = useState("Carlos Ruiz");
  const [selectedStadiumName, setSelectedStadiumName] = useState(stadiums[0].name);
  
  // Live Support Chat State
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [volunteerReplyText, setVolunteerReplyText] = useState("");
  const [chatFilter, setChatFilter] = useState<"All" | "Waiting" | "Connected" | "Resolved">("All");

  // Escalation Form
  const [escalationType, setEscalationType] = useState<any>("Medical Incident");
  const [escalationZone, setEscalationZone] = useState("Gate A");
  const [escalationDesc, setEscalationDesc] = useState("");
  const [escalationSuccess, setEscalationSuccess] = useState(false);

  const currentStadium = stadiums.find(s => s.name === selectedStadiumName) || stadiums[0];

  // Find the active request assigned to this volunteer in Simulation state
  const assignedTask = accessibilityRequests.find(r => r.assignedVolunteer === volunteerName && r.status !== "Resolved") || null;

  const handleSendVolunteerReply = (e: React.FormEvent, chatId: string) => {
    e.preventDefault();
    if (!volunteerReplyText.trim()) return;
    sendChatMessage(chatId, "volunteer", volunteerReplyText);
    setVolunteerReplyText("");
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
          
          {/* Live Support Chats Portal */}
          <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", minHeight: "360px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={18} style={{ color: "var(--fifa-gold)" }} /> Live Fan Support Portal
            </h3>

            {!selectedChatId || !supportChats.find(c => c.id === selectedChatId) ? (
              // Chat List Queue
              <div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                  {(["All", "Waiting", "Connected", "Resolved"] as const).map(filter => {
                    const count = filter === "All" ? supportChats.length : supportChats.filter(c => c.status === filter).length;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setChatFilter(filter)}
                        style={{
                          flex: 1,
                          padding: "6px 4px",
                          fontSize: "11px",
                          borderRadius: "6px",
                          background: chatFilter === filter ? "var(--fifa-gold)" : "rgba(255,255,255,0.04)",
                          color: chatFilter === filter ? "#000" : "var(--text-secondary)",
                          border: "1px solid var(--border-glass)",
                          cursor: "pointer",
                          fontWeight: chatFilter === filter ? "700" : "normal"
                        }}
                      >
                        {filter} ({count})
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "280px", overflowY: "auto" }}>
                  {supportChats.filter(c => chatFilter === "All" ? true : c.status === chatFilter).length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "12px" }}>
                      No support chats in this status.
                    </div>
                  ) : (
                    supportChats
                      .filter(c => chatFilter === "All" ? true : c.status === chatFilter)
                      .map(chat => (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChatId(chat.id)}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid var(--border-glass)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--fifa-gold)"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-glass)"}
                        >
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "13px" }}>{chat.fanName}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                              📍 {chat.stadiumName} • ID: {chat.id}
                            </div>
                            {chat.messages.length > 0 && (
                              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "200px" }}>
                                {chat.messages[chat.messages.length - 1].text}
                              </div>
                            )}
                          </div>
                          <span 
                            className={`badge-status ${
                              chat.status === "Waiting" ? "critical" : 
                              chat.status === "Connected" ? "warning" : "success"
                            }`}
                            style={{ fontSize: "9px" }}
                          >
                            {chat.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              // Chat conversation view
              (() => {
                const selectedChat = supportChats.find(c => c.id === selectedChatId)!;
                return (
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>
                      <button 
                        onClick={() => setSelectedChatId(null)}
                        style={{ background: "none", border: "none", color: "var(--fifa-gold)", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
                      >
                        ← Back to Queue
                      </button>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", fontSize: "13px" }}>{selectedChat.fanName}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{selectedChat.stadiumName}</div>
                      </div>
                    </div>

                    {/* Messages stream */}
                    <div style={{ flex: 1, maxHeight: "200px", minHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "6px" }}>
                      {selectedChat.messages.map(msg => {
                        const isSelf = msg.sender === "volunteer";
                        return (
                          <div 
                            key={msg.id} 
                            style={{ 
                              alignSelf: isSelf ? "flex-end" : "flex-start", 
                              maxWidth: "80%", 
                              background: isSelf ? "var(--fifa-blue)" : "rgba(255,255,255,0.05)",
                              border: isSelf ? "none" : "1px solid var(--border-glass)",
                              borderRadius: "12px", 
                              padding: "8px 12px", 
                              fontSize: "12px",
                              color: "#fff"
                            }}
                          >
                            <div style={{ fontSize: "9px", opacity: 0.7, marginBottom: "2px", fontWeight: "bold" }}>
                              {isSelf ? `${volunteerName} (You)` : selectedChat.fanName}
                            </div>
                            <div>
                              <div>{msg.text}</div>
                              {!isSelf && msg.translatedText && (
                                <div style={{ 
                                  fontSize: "10.5px", 
                                  fontStyle: "italic", 
                                  opacity: 0.85, 
                                  borderTop: "1px solid rgba(255,255,255,0.15)", 
                                  marginTop: "4px", 
                                  paddingTop: "4px",
                                  color: "var(--fifa-gold)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  🇬🇧 Translate: "{msg.translatedText}"
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input panel / status handler */}
                    <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-glass)", paddingTop: "8px" }}>
                      {selectedChat.status === "Waiting" && (
                        <button
                          onClick={() => connectVolunteerToChat(selectedChat.id, volunteerName)}
                          className="btn-primary"
                          style={{ width: "100%", padding: "10px" }}
                        >
                          🤝 Connect to Chat & Assist Fan
                        </button>
                      )}

                      {selectedChat.status === "Connected" && (
                        <form onSubmit={(e) => handleSendVolunteerReply(e, selectedChat.id)} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="text"
                              placeholder="Type your response to the fan..."
                              value={volunteerReplyText}
                              onChange={e => setVolunteerReplyText(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn-primary" style={{ padding: "0 16px" }}>
                              Send
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              resolveSupportChat(selectedChat.id);
                              setSelectedChatId(null);
                            }}
                            className="btn-secondary"
                            style={{ width: "100%", padding: "6px", color: "var(--stadium-green)", borderColor: "var(--stadium-green)", background: "rgba(0,230,118,0.02)", fontSize: "11px" }}
                          >
                            ✓ Mark Ticket as Resolved & Close Chat
                          </button>
                        </form>
                      )}

                      {selectedChat.status === "Resolved" && (
                        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px", padding: "6px" }}>
                          🔒 This support chat has been resolved.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
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

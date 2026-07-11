import React, { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import type { AccessibilityRequest } from "../context/SimulationContext";
import { 
  Heart, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  Users
} from "lucide-react";

export const AccessibilityCoordinator: React.FC = () => {
  const { accessibilityRequests, dispatchVolunteer, updateRequestStatus } = useSimulation();
  
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedRequest, setSelectedRequest] = useState<AccessibilityRequest | null>(null);

  const AVAILABLE_VOLUNTEERS = ["Carlos Ruiz", "Sarah Jenkins", "Emily Wong", "Alex Mercer"];

  const filteredRequests = accessibilityRequests.filter(req =>
    filterStatus === "All" || req.status === filterStatus
  );

  const handleDispatch = (requestId: string, volunteerName: string) => {
    dispatchVolunteer(requestId, volunteerName);
    updateRequestStatus(requestId, "Assigned");
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "High") return "var(--danger-red)";
    if (urgency === "Medium") return "var(--warning-orange)";
    return "var(--fifa-blue)";
  };

  // Compute Stats
  const totalReceived = accessibilityRequests.length;
  const totalPending = accessibilityRequests.filter(r => r.status !== "Resolved").length;
  const totalResolved = accessibilityRequests.filter(r => r.status === "Resolved").length;
  const avgSla = "7.2 min"; // Mocked aggregate

  return (
    <div className="role-view-wrapper animated-entry">
      <div>
        <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Heart size={28} /> Accessibility Concierge Dispatch
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
          Automated intake, triage, and volunteer dispatch queue for mobility and sensory assistance requests.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Intake Requests</span>
          <p style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px", color: "var(--text-primary)" }}>{totalReceived}</p>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Active / Dispatched Tickets</span>
          <p style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px", color: "var(--warning-orange)" }}>{totalPending}</p>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Resolved Today</span>
          <p style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px", color: "var(--stadium-green)" }}>{totalResolved}</p>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Median Resolution Time</span>
          <p style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px", color: "var(--fifa-blue)" }}>{avgSla}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
        
        {/* Request Queue Table */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px" }}>Incoming Request Queue</h3>
            
            <div style={{ display: "flex", gap: "6px" }}>
              {["All", "Received", "Assigned", "En Route", "Resolved"].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    background: filterStatus === st ? "var(--fifa-blue)" : "rgba(255,255,255,0.03)",
                    border: "none",
                    color: "#FFFFFF",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                  <th style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>ID</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>Fan</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>Type</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>Location</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>Duration</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>Urgency</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => {
                  const isSlaWarning = req.status !== "Resolved" && req.durationMinutes > 10;
                  return (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedRequest(req)}
                      style={{ 
                        borderBottom: "1px solid var(--border-glass)", 
                        cursor: "pointer",
                        background: selectedRequest?.id === req.id ? "rgba(255,255,255,0.03)" : "transparent",
                        transition: "var(--transition-fast)"
                      }}
                    >
                      <td style={{ padding: "12px", fontSize: "13px", fontWeight: "700" }}>{req.id}</td>
                      <td style={{ padding: "12px", fontSize: "13px" }}>{req.fanName}</td>
                      <td style={{ padding: "12px", fontSize: "13px" }}>{req.type}</td>
                      <td style={{ padding: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>{req.location}</td>
                      <td style={{ padding: "12px", fontSize: "13px" }}>
                        <span style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "4px",
                          color: isSlaWarning ? "var(--danger-red)" : "var(--text-secondary)",
                          fontWeight: isSlaWarning ? "700" : "500"
                        }}>
                          <Clock size={12} /> {req.durationMinutes} min
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontSize: "13px" }}>
                        <span style={{ color: getUrgencyColor(req.urgency), fontWeight: "700" }}>{req.urgency}</span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span className={`badge-status ${
                          req.status === "Resolved" ? "success" : req.status === "Received" ? "danger" : "warning"
                        }`} style={{ padding: "2px 6px", fontSize: "10px" }}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
                      No accessibility tickets match the selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Panel */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserCheck size={18} style={{ color: "var(--fifa-gold)" }} /> Dispatch & Lifecycle Management
          </h3>

          {selectedRequest ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Ticket Details card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", padding: "16px", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Ticket ID: {selectedRequest.id}</span>
                  <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>{selectedRequest.type}</span>
                </div>
                <p style={{ fontWeight: "700", fontSize: "15px" }}>{selectedRequest.fanName}</p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Location: {selectedRequest.location} at {selectedRequest.stadiumName}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>Time elapsed: {selectedRequest.durationMinutes} minutes</p>

                {selectedRequest.assignedVolunteer && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", background: "rgba(0,125,255,0.05)", padding: "8px", borderRadius: "4px", fontSize: "12.5px" }}>
                    <Users size={14} style={{ color: "var(--fifa-blue)" }} />
                    Assigned: <strong>{selectedRequest.assignedVolunteer}</strong>
                  </div>
                )}
              </div>

              {/* Action: Dispatch dropdown */}
              {selectedRequest.status === "Received" && (
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Recommend & Assign Volunteer
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select id="volunteer-select" style={{ flex: 1, padding: "8px" }}>
                      {AVAILABLE_VOLUNTEERS.map(v => (
                        <option key={v} value={v}>{v} (Concourse Area)</option>
                      ))}
                    </select>
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        const selectEl = document.getElementById("volunteer-select") as HTMLSelectElement;
                        if (selectEl) {
                          handleDispatch(selectedRequest.id, selectEl.value);
                          // Sync selectedRequest locally
                          setSelectedRequest(prev => prev ? { ...prev, status: "Assigned", assignedVolunteer: selectEl.value } : null);
                        }
                      }}
                      style={{ padding: "8px 16px" }}
                    >
                      Dispatch
                    </button>
                  </div>
                </div>
              )}

              {/* Action: Advance Lifecycle */}
              {selectedRequest.status !== "Resolved" && selectedRequest.status !== "Received" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  {selectedRequest.status === "Assigned" && (
                    <button
                      className="btn-primary"
                      style={{ flex: 1, background: "var(--warning-orange)" }}
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, "En Route");
                        setSelectedRequest(prev => prev ? { ...prev, status: "En Route" } : null);
                      }}
                    >
                      Volunteer En Route
                    </button>
                  )}
                  {selectedRequest.status === "En Route" && (
                    <button
                      className="btn-primary"
                      style={{ flex: 1, background: "var(--stadium-green)", color: "#000000" }}
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, "Resolved");
                        setSelectedRequest(prev => prev ? { ...prev, status: "Resolved" } : null);
                      }}
                    >
                      <CheckCircle size={16} /> Resolve Request
                    </button>
                  )}
                </div>
              )}

              {selectedRequest.status === "Resolved" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--stadium-green)", background: "rgba(0,230,118,0.05)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0,230,118,0.2)" }}>
                  <CheckCircle size={16} />
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>Ticket successfully resolved. SLA target met.</span>
                </div>
              )}

            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
              Select a request from the queue to manage dispatch assignments and ticket resolution.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

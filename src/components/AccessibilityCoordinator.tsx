import React, { useState, useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";
import { 
  Heart, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  Users,
  Compass
} from "lucide-react";

export const AccessibilityCoordinator: React.FC = () => {
  const { accessibilityRequests, dispatchVolunteer, updateRequestStatus } = useSimulation();
  
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Volunteer roster state
  const [volunteers, setVolunteers] = useState([
    { name: "Carlos Ruiz", status: "Busy", assignment: "ACC-101" },
    { name: "Sarah Jenkins", status: "Idle", assignment: null as string | null },
    { name: "Emily Wong", status: "Idle", assignment: null as string | null },
    { name: "Alex Mercer", status: "On Break", assignment: null as string | null }
  ]);

  // Request travel progress tracking (simulated en-route travel)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({
    "ACC-101": 65
  });

  const selectedRequest = accessibilityRequests.find(r => r.id === selectedRequestId) || null;

  const filteredRequests = accessibilityRequests.filter(req =>
    filterStatus === "All" || req.status === filterStatus
  );

  // Simulate Volunteer Travel
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Advance travel progress for Assigned/En Route requests
      setProgressMap(prevProgress => {
        const nextProgress = { ...prevProgress };
        let progressChanged = false;

        accessibilityRequests.forEach(req => {
          if (req.status === "Assigned" || req.status === "En Route") {
            const currentVal = nextProgress[req.id] || 0;
            if (currentVal < 100) {
              nextProgress[req.id] = Math.min(100, currentVal + 8);
              progressChanged = true;
              
              // Automatically advance status to "En Route" if it was "Assigned"
              if (req.status === "Assigned" && currentVal > 5) {
                updateRequestStatus(req.id, "En Route");
              }

              // Auto-resolve when progress reaches 100%
              if (nextProgress[req.id] === 100) {
                updateRequestStatus(req.id, "Resolved");
                // Free the volunteer
                setVolunteers(prevVols => 
                  prevVols.map(v => v.name === req.assignedVolunteer 
                    ? { ...v, status: "Idle", assignment: null }
                    : v
                  )
                );
              }
            }
          }
        });

        return progressChanged ? nextProgress : prevProgress;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [accessibilityRequests, updateRequestStatus]);

  const handleDispatch = (requestId: string, volunteerName: string) => {
    dispatchVolunteer(requestId, volunteerName);
    updateRequestStatus(requestId, "Assigned");
    
    // Set volunteer status
    setVolunteers(prev => 
      prev.map(v => v.name === volunteerName 
        ? { ...v, status: "En Route", assignment: requestId }
        : v
      )
    );

    // Initialize travel progress
    setProgressMap(prev => ({
      ...prev,
      [requestId]: 0
    }));
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
  const avgSla = "7.2 min";

  return (
    <div className="role-view-wrapper animated-entry">
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Heart size={28} /> Accessibility Concierge Dispatch
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Automated intake, triage, and volunteer dispatch queue for mobility and sensory assistance requests.
          </p>
        </div>
      </div>

      {/* SLA Metric Grid cards */}
      <div className="responsive-grid-4col" style={{ gap: "16px" }}>
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

      {/* Main layout splitting queue and coordinator tools */}
      <div className="responsive-grid-2col-unequal">
        
        {/* Request Queue Table */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div className="card-header-responsive">
            <h3 style={{ fontSize: "16px" }}>Incoming Request Queue</h3>
            
            <div className="card-header-actions">
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
                      onClick={() => setSelectedRequestId(req.id)}
                      style={{ 
                        borderBottom: "1px solid var(--border-glass)", 
                        cursor: "pointer",
                        background: selectedRequestId === req.id ? "rgba(255,255,255,0.03)" : "transparent",
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

        {/* Right Pane: Dispatch and Volunteer Roster */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Dispatch Actions */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserCheck size={18} style={{ color: "var(--fifa-gold)" }} /> Dispatch & Travel Tracker
            </h3>

            {selectedRequest ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Ticket Details card */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", padding: "16px", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Ticket: {selectedRequest.id}</span>
                    <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>{selectedRequest.type}</span>
                  </div>
                  <p style={{ fontWeight: "700", fontSize: "15px" }}>{selectedRequest.fanName}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Location: {selectedRequest.location} at {selectedRequest.stadiumName}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Urgency: <strong style={{ color: getUrgencyColor(selectedRequest.urgency) }}>{selectedRequest.urgency}</strong></p>

                  {selectedRequest.assignedVolunteer && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", background: "rgba(0,125,255,0.04)", padding: "10px", borderRadius: "6px", border: "1px solid rgba(0,125,255,0.1)" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700" }}>Dispatched Volunteer: {selectedRequest.assignedVolunteer}</span>
                      
                      {selectedRequest.status !== "Resolved" && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)" }}>
                            <span>Transit Progress:</span>
                            <span>{progressMap[selectedRequest.id] || 0}%</span>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.1)", height: "6px", borderRadius: "3px", overflow: "hidden", marginTop: "4px" }}>
                            <div style={{ 
                              background: "var(--fifa-blue)", 
                              height: "100%", 
                              width: `${progressMap[selectedRequest.id] || 0}%`, 
                              transition: "width 1s linear" 
                            }} />
                          </div>
                          <span style={{ fontSize: "10px", color: "var(--fifa-blue)", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                            <Compass size={11} className="spin-slow" /> Volunteer walking to concourse location...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dispatch Selection dropdown */}
                {selectedRequest.status === "Received" && (
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Select Idle Volunteer
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <select id="volunteer-assign-select" style={{ flex: 1, padding: "8px" }}>
                        {volunteers.filter(v => v.status === "Idle").map(v => (
                          <option key={v.name} value={v.name}>{v.name} (Idle)</option>
                        ))}
                        {volunteers.filter(v => v.status !== "Idle").map(v => (
                          <option key={v.name} value={v.name} disabled>{v.name} ({v.status})</option>
                        ))}
                      </select>
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          const selectEl = document.getElementById("volunteer-assign-select") as HTMLSelectElement;
                          if (selectEl && selectEl.value) {
                            handleDispatch(selectedRequest.id, selectEl.value);
                          }
                        }}
                        style={{ padding: "8px 16px" }}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Advancement overrides */}
                {selectedRequest.status !== "Resolved" && selectedRequest.status !== "Received" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, background: "var(--stadium-green)", color: "#000000" }}
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, "Resolved");
                        setVolunteers(prev => 
                          prev.map(v => v.name === selectedRequest.assignedVolunteer 
                            ? { ...v, status: "Idle", assignment: null }
                            : v
                          )
                        );
                      }}
                    >
                      <CheckCircle size={14} /> Resolve Request (Force)
                    </button>
                  </div>
                )}

                {selectedRequest.status === "Resolved" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--stadium-green)", background: "rgba(0,230,118,0.05)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0,230,118,0.2)" }}>
                    <CheckCircle size={16} />
                    <span style={{ fontSize: "12.5px", fontWeight: "600" }}>Ticket successfully resolved. SLA target met.</span>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13px" }}>
                Select an active request from the queue to assign staff and view transit progress.
              </div>
            )}
          </div>

          {/* Volunteer Roster */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={16} style={{ color: "var(--fifa-blue)" }} /> Volunteer Steward Roster
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {volunteers.map(vol => {
                let statusColor = "var(--text-muted)";
                if (vol.status === "Idle") statusColor = "var(--stadium-green)";
                else if (vol.status === "En Route" || vol.status === "Busy") statusColor = "var(--warning-orange)";

                return (
                  <div 
                    key={vol.name} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      background: "rgba(255,255,255,0.01)", 
                      padding: "10px", 
                      borderRadius: "6px", 
                      border: "1px solid var(--border-glass)" 
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "700" }}>{vol.name}</span>
                      {vol.assignment && (
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                          Task: {vol.assignment}
                        </span>
                      )}
                    </div>
                    
                    <span style={{ 
                      fontSize: "11px", 
                      color: statusColor, 
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }} />
                      {vol.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SimulationProvider } from "./context/SimulationContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import type { ActiveMenu, UserRole } from "./types/index";
import { CommandCenter } from "./components/CommandCenter";
import { AIConcierge } from "./components/AIConcierge";
import { NavigationWayfinding } from "./components/NavigationWayfinding";
import { AccessibilityCoordinator } from "./components/AccessibilityCoordinator";
import { TransportationAssistant } from "./components/TransportationAssistant";
import { SustainabilityDashboard } from "./components/SustainabilityDashboard";
import { VolunteerCopilot } from "./components/VolunteerCopilot";
import { CrowdIntelligence } from "./components/CrowdIntelligence";
import { ReportsAnalytics } from "./components/ReportsAnalytics";
import { OverviewDashboard } from "./components/OverviewDashboard";
import {
  Globe,
  Activity,
  Compass,
  Heart,
  Car,
  Leaf,
  LifeBuoy,
  ShieldAlert,
  Settings,
  Menu,
  Search,
  LogOut,
  Eye as AnalyticsIcon,
  MessageSquare,
  List,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// AppContent
// ---------------------------------------------------------------------------
const AppContent: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>("director");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMenuClick = useCallback((menu: ActiveMenu) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  // Role pill items are stable — derived from t() which changes only on lang switch
  const allMenuItems = useMemo(
    () => [
      { id: "overview"           as ActiveMenu, label: t("menu.overview"),            icon: <Globe size={16} /> },
      { id: "command_center"     as ActiveMenu, label: t("menu.command_center"),      icon: <Activity size={16} /> },
      { id: "crowd_intelligence" as ActiveMenu, label: t("menu.crowd_intelligence"),  icon: <AnalyticsIcon size={16} /> },
      { id: "ai_concierge"       as ActiveMenu, label: t("menu.ai_concierge"),        icon: <MessageSquare size={16} /> },
      { id: "navigation"         as ActiveMenu, label: t("menu.navigation"),           icon: <Compass size={16} /> },
      { id: "accessibility"      as ActiveMenu, label: t("menu.accessibility"),        icon: <Heart size={16} /> },
      { id: "transportation"     as ActiveMenu, label: t("menu.transportation"),       icon: <Car size={16} /> },
      { id: "sustainability"     as ActiveMenu, label: t("menu.sustainability"),       icon: <Leaf size={16} /> },
      { id: "volunteers"         as ActiveMenu, label: t("menu.volunteers"),           icon: <LifeBuoy size={16} /> },
      { id: "incidents"          as ActiveMenu, label: t("menu.incidents"),            icon: <ShieldAlert size={16} /> },
      { id: "analytics"          as ActiveMenu, label: t("menu.analytics"),            icon: <List size={16} /> },
      { id: "settings"           as ActiveMenu, label: t("menu.settings"),             icon: <Settings size={16} /> },
    ],
    [t]
  );

  const header = useMemo(() => {
    const menus: Record<ActiveMenu, { title: string; subtitle: string }> = {
      overview:            { title: t("header.overview.title"),            subtitle: t("header.overview.sub") },
      command_center:      { title: t("header.command_center.title"),      subtitle: t("header.command_center.sub") },
      crowd_intelligence:  { title: t("header.crowd_intelligence.title"),  subtitle: t("header.crowd_intelligence.sub") },
      ai_concierge:        { title: t("header.ai_concierge.title"),        subtitle: t("header.ai_concierge.sub") },
      navigation:          { title: t("header.navigation.title"),          subtitle: t("header.navigation.sub") },
      accessibility:       { title: t("header.accessibility.title"),       subtitle: t("header.accessibility.sub") },
      transportation:      { title: t("header.transportation.title"),      subtitle: t("header.transportation.sub") },
      sustainability:      { title: t("header.sustainability.title"),      subtitle: t("header.sustainability.sub") },
      volunteers:          { title: t("header.volunteers.title"),          subtitle: t("header.volunteers.sub") },
      incidents:           { title: t("header.incidents.title"),           subtitle: t("header.incidents.sub") },
      analytics:           { title: t("header.analytics.title"),           subtitle: t("header.analytics.sub") },
      settings:            { title: t("header.settings.title"),            subtitle: t("header.settings.sub") },
    };
    return menus[activeMenu] ?? { title: t("header.overview.title"), subtitle: t("header.overview.sub") };
  }, [activeMenu, t]);

  const menuItems = useMemo(() => {
    if (activeRole === "director") return allMenuItems;
    if (activeRole === "volunteer") {
      return allMenuItems.filter((item) =>
        ["volunteers", "navigation", "accessibility", "settings"].includes(item.id)
      );
    }
    // fan
    return allMenuItems.filter((item) =>
      ["ai_concierge", "navigation", "transportation", "settings"].includes(item.id)
    );
  }, [activeRole, allMenuItems]);

  const profile = useMemo(() => {
    if (activeRole === "director") {
      return { name: "Jordan Williams", roleName: "Operations Manager", avatarBg: "#334155", color: "#FFFFFF" };
    }
    if (activeRole === "volunteer") {
      return { name: "Carlos Ruiz", roleName: "Accessibility Steward", avatarBg: "var(--fifa-blue)", color: "#FFFFFF" };
    }
    return { name: "Maria Santos", roleName: "Ticket Holder (Fan)", avatarBg: "var(--fifa-gold)", color: "#000000" };
  }, [activeRole]);

  // Search filtering across menu items
  const searchResults = useMemo(
    () =>
      searchQuery.trim().length > 0
        ? allMenuItems.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [],
    [searchQuery, allMenuItems]
  );

  const handleRoleChange = useCallback(
    (role: UserRole) => {
      setActiveRole(role);
      if (role === "director") handleMenuClick("overview");
      else if (role === "volunteer") handleMenuClick("volunteers");
      else handleMenuClick("ai_concierge");
    },
    [handleMenuClick]
  );

  const rolePillLabels = useMemo<Record<UserRole, string>>(
    () => ({
      director:  t("mode.director"),
      volunteer: t("mode.volunteer"),
      fan:       t("mode.fan"),
    }),
    [t]
  );

  return (
    <div className={`app-grid-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }}
        />
      )}

      {/* PERSISTENT LEFT SIDEBAR */}
      <aside className={`sidebar-panel ${isSidebarCollapsed ? "collapsed" : ""} ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div>
              StadiumPulse AI
              <span>Smart Venue Operations</span>
            </div>
          </div>

          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ background: "transparent", border: "none", color: "#FFFFFF", cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center", padding: "6px", borderRadius: "50%", transition: "background 0.2s" }}
            title="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="sidebar-menu" aria-label="Main Navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => handleMenuClick(item.id)}
              aria-current={activeMenu === item.id ? "page" : undefined}
              aria-label={item.label}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Gold Trophy card */}
        <div className="sidebar-trophy-card" style={{ padding: "12px", textAlign: "center" }}>
          <img
            src="/fifa_trophy.png"
            alt="FIFA World Cup 2026"
            style={{ width: "75%", margin: "0 auto 8px auto", borderRadius: "6px", display: "block" }}
          />
          <button
            onClick={() => handleMenuClick(activeRole === "director" ? "overview" : (menuItems[0]?.id ?? "overview"))}
            style={{ background: "var(--stadium-green)", border: "none", color: "#FFFFFF", fontSize: "10px", fontWeight: "700", padding: "8px 12px", borderRadius: "14px", cursor: "pointer", width: "100%" }}
          >
            View Active Venues →
          </button>
        </div>

        {/* User profile */}
        <div className="sidebar-profile">
          <div className="profile-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: profile.avatarBg, color: profile.color, fontSize: "12px", fontWeight: "800" }}>
            {profile.name.charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <h5 style={{ fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{profile.name}</h5>
            <span style={{ fontSize: "10px", color: "var(--text-sidebar)", display: "block" }}>{profile.roleName}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "9px", color: "var(--stadium-green)", marginTop: "2px" }}>
              <span className="pulse-indicator" style={{ width: "6px", height: "6px", background: "var(--stadium-green)" }} /> Online
            </span>
          </div>
          <button style={{ background: "transparent", border: "none", color: "var(--text-sidebar)", cursor: "pointer" }} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* RIGHT PANE: Header and Content views */}
      <div className="right-pane">

        {/* Top Header bar */}
        <header className="top-header-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileMenuOpen((prev) => !prev);
                } else {
                  setIsSidebarCollapsed((prev) => !prev);
                }
              }}
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>{header.title}</h1>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{header.subtitle}</p>
            </div>
          </div>

          <div className="header-right-side">
            {/* MODE pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="header-mode-label" style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", letterSpacing: "0.5px" }}>
                {t("mode.label")}
              </span>
              <div
                className="mode-pill-switcher"
                style={{ display: "flex", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "8px", padding: "3px", gap: "2px" }}
              >
                {(["director", "volunteer", "fan"] as UserRole[]).map((role) => {
                  const isActive = activeRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      style={{
                        padding: "5px 12px",
                        fontSize: "11px",
                        fontWeight: isActive ? "700" : "500",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        background: isActive ? "var(--fifa-blue, #007dff)" : "transparent",
                        color: isActive ? "#ffffff" : "var(--text-secondary)",
                        letterSpacing: "0.3px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rolePillLabels[role]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div ref={searchRef} className="header-search-container" style={{ position: "relative", width: "200px" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)", zIndex: 1, pointerEvents: "none" }} />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                  if (e.key === "Enter" && searchResults.length > 0) {
                    handleMenuClick(searchResults[0].id);
                  }
                }}
                style={{ paddingLeft: "32px", fontSize: "12px", background: "#F8F9FA", borderRadius: "20px", height: "36px", width: "100%" }}
              />
              {/* Search Results Dropdown */}
              {searchOpen && searchQuery.trim().length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.length === 0 ? (
                    <div className="search-result-empty">{t("search.no_results")}</div>
                  ) : (
                    searchResults.map((item) => (
                      <button
                        key={item.id}
                        className="search-result-item"
                        onClick={() => handleMenuClick(item.id)}
                      >
                        <span className="search-result-icon">{item.icon}</span>
                        {item.label}
                      </button>
                    ))
                  )}
                  <div className="search-result-hint">{t("search.hint")}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic content view switching */}
        <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {activeMenu === "overview"           && <OverviewDashboard />}
          {activeMenu === "command_center"     && <CommandCenter />}
          {activeMenu === "crowd_intelligence" && <CrowdIntelligence />}
          {activeMenu === "ai_concierge"       && <AIConcierge onNavigate={setActiveMenu} />}
          {activeMenu === "navigation"         && <NavigationWayfinding />}
          {activeMenu === "accessibility"      && <AccessibilityCoordinator />}
          {activeMenu === "transportation"     && <TransportationAssistant />}
          {activeMenu === "sustainability"     && <SustainabilityDashboard />}
          {activeMenu === "volunteers"         && <VolunteerCopilot />}
          {/* Incidents reuses the CommandCenter view */}
          {activeMenu === "incidents"          && <CommandCenter />}
          {activeMenu === "analytics"          && <ReportsAnalytics />}

          {/* System Settings Panel */}
          {activeMenu === "settings" && (
            <div className="role-view-wrapper animated-entry" style={{ padding: "32px" }}>
              <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "18px" }}>System Configuration</h3>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>RAG Confidence Escalation Threshold</label>
                  <select defaultValue="0.70" style={{ width: "200px" }}>
                    <option value="0.60">60% (Fewer escalations)</option>
                    <option value="0.70">70% (Recommended)</option>
                    <option value="0.80">80% (Higher safety margin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Crowd Surge Warning Sensitivity</label>
                  <select defaultValue="medium" style={{ width: "200px" }}>
                    <option value="low">Low (Fewer false alarms)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Maximum warning lead time)</option>
                  </select>
                </div>

                <button className="btn-primary" style={{ width: "fit-content", marginTop: "10px" }}>Save Configurations</button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <LanguageProvider>
      <SimulationProvider>
        <AppContent />
      </SimulationProvider>
    </LanguageProvider>
  );
}

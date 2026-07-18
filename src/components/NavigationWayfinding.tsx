import React, { useState, useEffect, Suspense } from "react";
import { useSimulation } from "../context/SimulationContext";
import {
  Navigation,
  Eye,
  Accessibility,
  Compass,
  AlertTriangle,
  Camera,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   3-D Stadium Model
───────────────────────────────────────────── */
function StadiumModel(_props: { highlightGate?: string }) {
  const { scene } = useGLTF("/stadium.glb");

  // Auto-fit: compute bounding box and derive scale + center offset
  const { scale, center } = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 5.5; // desired world-unit diameter
    const s = maxDim > 0 ? targetSize / maxDim : 1;
    const mid = new THREE.Vector3();
    box.getCenter(mid);
    return { scale: s, center: mid };
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={scale}
      // shift so bounding-box center sits at world origin, then drop slightly
      position={[-center.x * scale, -center.y * scale - 0.4, -center.z * scale]}
      castShadow
      receiveShadow
    />
  );
}

/* Loading fallback rendered inside Canvas */
function Loader() {
  return (
    <Html center>
      <div
        style={{
          color: "#fff",
          fontSize: "13px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(255,255,255,0.2)",
            borderTopColor: "var(--fifa-gold, #d4af37)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        Loading 3D model…
      </div>
    </Html>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export const NavigationWayfinding: React.FC = () => {
  const { stadiums } = useSimulation();

  const [selectedStadiumName, setSelectedStadiumName] = useState(stadiums[0].name);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [arView, setArView] = useState(false);
  const [congestionAlert, setCongestionAlert] = useState(false);
  const [congestedZoneName, setCongestedZoneName] = useState("");
  const [arStep, setArStep] = useState(0);

  const currentStadium =
    stadiums.find((s) => s.name === selectedStadiumName) || stadiums[0];

  useEffect(() => {
    const congestedZone = currentStadium.zones.find(
      (z) => z.status === "Critical" || z.occupancy > 75
    );
    setCongestionAlert(congestedZone !== undefined);
    setCongestedZoneName(congestedZone ? congestedZone.name : "");
  }, [stadiums, selectedStadiumName, currentStadium]);


  const getDirections = () => {
    const startGate = currentStadium.zones[0]?.name || "Main Gate";
    const endSeat = "Section 102 Row G";
    return [
      {
        title: `Enter through ${startGate}`,
        desc: "Present your digital ticket barcode at the turnstile scanner terminals.",
      },
      {
        title: congestionAlert
          ? "Turn LEFT toward Concourse West"
          : "Turn RIGHT toward Concourse East",
        desc: congestionAlert
          ? `⚠️ Rerouting active to avoid high crowd density at ${congestedZoneName}.`
          : "Route is clear with normal crowd density.",
      },
      {
        title: accessibleMode
          ? "Locate elevator at Elevator Plaza"
          : "Take Stairs up to Level 2",
        desc: accessibleMode
          ? "Press 2 for wheelchair platform access."
          : "Follow signage for Section 102 entry portal.",
      },
      {
        title: `Arrive at ${endSeat}`,
        desc: "Your seat is located on the left aisle. Have a great match!",
      },
    ];
  };

  const directions = getDirections();

  return (
    <div className="role-view-wrapper animated-entry">
      <div className="view-header">
        <div>
          <h2
            style={{
              fontSize: "28px",
              color: "var(--fifa-gold)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Compass size={28} /> Dynamic Wayfinding &amp; Navigation
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Crowd-aware routing with step-by-step PWD accessible paths and AR
            guidance support.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedStadiumName}
            onChange={(e) => {
              setSelectedStadiumName(e.target.value);
              setArStep(0);
            }}
            style={{ width: "220px", padding: "8px 12px" }}
          >
            {stadiums.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="responsive-grid-navigation">
        {/* ── Left: 3-D Viewer ── */}
        <div
          className="glass-panel nav-viewer-panel"
          style={{
            padding: "20px",
            position: "relative",
            minHeight: "520px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Map Controls */}
          <div className="card-header-responsive" style={{ zIndex: 10 }}>
            <div className="map-controls-row">
              <button
                onClick={() => setAccessibleMode(!accessibleMode)}
                className="btn-secondary"
                style={{
                  borderColor: accessibleMode
                    ? "var(--fifa-gold)"
                    : "var(--border-glass)",
                  background: accessibleMode
                    ? "rgba(212, 175, 55, 0.15)"
                    : "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Accessibility
                  size={16}
                  style={{
                    color: accessibleMode ? "var(--fifa-gold)" : "#FFFFFF",
                  }}
                />
                Accessible Route: {accessibleMode ? "ON" : "OFF"}
              </button>

              <button
                onClick={() => {
                  setArView(!arView);
                  setArStep(0);
                }}
                className="btn-secondary"
                style={{
                  borderColor: arView
                    ? "var(--fifa-blue)"
                    : "var(--border-glass)",
                  background: arView
                    ? "rgba(0, 125, 255, 0.15)"
                    : "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Camera
                  size={16}
                  style={{ color: arView ? "var(--fifa-blue)" : "#FFFFFF" }}
                />
                AR View Overlay
              </button>

            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--stadium-green)",
                }}
              />
              <span
                style={{ fontSize: "11px", color: "var(--text-secondary)" }}
              >
                GPS Active: Concourse Blue 2
              </span>
            </div>
          </div>

          {/* ── Content: AR camera OR 3-D model ── */}
          {arView ? (
            /* AR CAMERA MODE */
            <div
              className="animated-entry"
              style={{
                flex: 1,
                background:
                  "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200') no-repeat center center",
                backgroundSize: "cover",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                minHeight: "400px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-glass)",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Eye size={12} style={{ color: "var(--danger-red)" }} /> AR
                  VIEWPORT SIMULATION
                </span>
                <span
                  style={{
                    background: "rgba(0,230,118,0.2)",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    color: "var(--stadium-green)",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  Anchors Locked
                </span>
              </div>

              {/* Floating Overlay Guideline */}
              <div
                style={{
                  alignSelf: "center",
                  background: "rgba(6, 8, 19, 0.9)",
                  border: "2px solid var(--fifa-gold)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px 24px",
                  textAlign: "center",
                  maxWidth: "340px",
                  boxShadow: "var(--shadow-md)",
                  animation: "pulse 2.5s infinite alternate",
                  color: "#FFFFFF",
                }}
              >
                <Compass
                  size={28}
                  style={{
                    color: "var(--fifa-gold)",
                    margin: "0 auto 8px auto",
                  }}
                />
                <h4 style={{ fontSize: "14px", fontWeight: "700" }}>
                  Step {arStep + 1}:{" "}
                  {directions[arStep]?.title || "Navigation Complete"}
                </h4>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-sidebar)",
                    marginTop: "6px",
                  }}
                >
                  {directions[arStep]?.desc ||
                    "You have reached your seat destination."}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    paddingTop: "8px",
                  }}
                >
                  <button
                    disabled={arStep === 0}
                    onClick={() => setArStep((prev) => prev - 1)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color:
                        arStep === 0
                          ? "rgba(255,255,255,0.2)"
                          : "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ChevronLeft size={12} /> Back
                  </button>
                  <button
                    disabled={arStep === directions.length - 1}
                    onClick={() => setArStep((prev) => prev + 1)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color:
                        arStep === directions.length - 1
                          ? "rgba(255,255,255,0.2)"
                          : "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}
                >
                  {currentStadium.name} Concourse Ring
                </span>
                <span
                  style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}
                >
                  FIFA WC 26
                </span>
              </div>
            </div>
          ) : (
            /* ── 3-D STADIUM VIEWER ── */
            <div className="nav-3d-viewer">
              {/* Congestion banner */}
              {congestionAlert && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(255, 61, 113, 0.15)",
                    border: "1px solid var(--danger-red)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    color: "var(--danger-red)",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                >
                  <AlertTriangle size={14} />
                  Crowd bottleneck at {congestedZoneName}! AI Rerouting active…
                </div>
              )}


              {/* Hint */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "14px",
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.4)",
                  pointerEvents: "none",
                  zIndex: 20,
                }}
              >
                Drag to orbit · Scroll to zoom
              </div>

              {/* Three.js Canvas */}
              <Canvas
                shadows
                camera={{ position: [0.5, 2.1, 4.2], fov: 42 }}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#e8edf2",
                }}
              >
                {/* Lighting */}
                <ambientLight intensity={2.2} />
                <directionalLight
                  castShadow
                  position={[5, 10, 5]}
                  intensity={3.0}
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight
                  position={[-5, 8, -5]}
                  intensity={1.5}
                />
                <hemisphereLight
                  args={["#ffffff", "#d0d8e8", 1.2]}
                />

                {/* Bright daylight-style environment */}
                <Environment preset="warehouse" />

                {/* Model */}
                <Suspense fallback={<Loader />}>
                  <StadiumModel />
                  <ContactShadows
                    position={[0, -1.5, 0]}
                    opacity={0.5}
                    scale={14}
                    blur={2}
                    far={4}
                    color="#000000"
                  />
                </Suspense>


                {/* Accessible route ring highlight */}
                {accessibleMode && (
                  <mesh position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2.1, 2.35, 64]} />
                    <meshBasicMaterial
                      color="#d4af37"
                      opacity={0.25}
                      transparent
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                )}

                {/* Standard route ring */}
                {!accessibleMode && (
                  <mesh position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2.1, 2.3, 64]} />
                    <meshBasicMaterial
                      color="#007dff"
                      opacity={0.2}
                      transparent
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                )}

                <OrbitControls
                  autoRotate={false}
                  enablePan={false}
                  minDistance={1}
                  maxDistance={4.8}
                  maxPolarAngle={Math.PI / 2}
                />
              </Canvas>
            </div>
          )}
        </div>

        {/* ── Right: Direction Details ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Navigation size={18} style={{ color: "var(--fifa-gold)" }} />
              Turn-by-Turn Route
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {directions.map((step, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      background:
                        idx === arStep && arView
                          ? "var(--fifa-gold)"
                          : "var(--fifa-blue)",
                      color:
                        idx === arStep && arView ? "#000000" : "#FFFFFF",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "700",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color:
                          idx === arStep && arView
                            ? "var(--fifa-gold)"
                            : "inherit",
                      }}
                    >
                      {step.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "11.5px",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>
              Dynamic Recalculations
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: "1.4",
              }}
            >
              Our navigation model recalculates paths dynamically every 15
              seconds based on active concourse people counts. If standard route
              segments exceed <strong>75% density</strong>, a warning is logged
              and the navigation path wraps around alternative walkways
              automatically.
            </p>
          </div>

          {/* 3-D View Controls hint card */}
          <div className="glass-panel" style={{ padding: "16px" }}>
            <h3
              style={{
                fontSize: "14px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ZoomIn size={14} style={{ color: "var(--fifa-blue)" }} /> 3-D
              Viewer Controls
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {[
                ["🖱 Left-drag", "Orbit around stadium"],
                ["🖱 Scroll", "Zoom in / out"],
                ["♿ Accessible", "Gold route ring overlay"],
              ].map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{key}</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

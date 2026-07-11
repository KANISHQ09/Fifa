# StadiumPulse AI — GenAI-Enabled Smart Stadium & Tournament Operations Platform

StadiumPulse AI is a Generative AI-powered venue management, crowd safety, and fan assistance dashboard engineered for the **FIFA World Cup 2026**. Spanning 16 host cities across the USA, Canada, and Mexico, this platform integrates real-time venue telemetry, transit status feeds, accessibility service queues, and environmental ESG metrics.

---

## 🏟️ Chosen Vertical & Context
* **Chosen Persona/Vertical**: Smart Venue & Tournament Operations (FIFA World Cup 2026).
* **Target Users**:
  1. **Fans (Maria)**: Seeking multilingual RAG assistance, accessible wayfinding, and departure transit schedules.
  2. **Tournament Organizers (Jordan)**: Overseeing real-time crowd metrics, security logs, incident alerts, and safety broadcast dispatching.
  3. **Volunteers (Amara)**: Requiring station manuals, instant translation, and fast incident reporting.
  4. **Accessibility Coordinators (Elena)**: Managing PWD assist queues, dispatching support, and tracking SLA targets.

---

## 🛠️ Technical Approach & Design Architecture

StadiumPulse AI is implemented as a premium React + TypeScript PWA styled with custom **Vanilla CSS** tokens (implementing rich aesthetics: sleek dark glassmorphism, responsive grid boards, glowing alerts, and custom SVG animations).

### Key Architecture Components
1. **Simulation Engine (`src/context/SimulationContext.tsx`)**:
   - Updates stadium occupancy, transit states, and resource meters continuously in the background (every 5 seconds) to model live telemetry.
   - Manages the lifecycle of safety incident tickets, PWD accessibility dispatches, and emergency alert broadcasts.
2. **Client-Side RAG Pipeline (`src/data/knowledgeBase.ts`)**:
   - Stores official stadium facilities lists, permitted/prohibited bag policies, schedules, and transit rules.
   - Computes query scores using stopword filtration and regex word-boundary boundaries.
   - Outputs confidence scores, grounding contexts, and triggers auto-escalation flags if confidence falls below 70%.
3. **Operations Command Center (`src/components/CommandCenter.tsx`)**:
   - Consolidates feeds across all 16 stadiums.
   - Dynamically compiles a GenAI-authored stadium status report based on active incidents and sustainability metrics.
   - Implements a **Human-in-the-Loop Gating** queue for emergency broadcasts, preventing autonomous AI broadcasts without moderator approval.
4. **Dynamic Wayfinding (`src/components/NavigationWayfinding.tsx`)**:
   - Features a circular stadium SVG map.
   - Dynamically adjusts path routing coordinates to bypass zones flagged with high crowd congestion (density > 75%).
   - Offers wheelchair-accessible routes (bypassing steps for ramps and elevators).
   - Features an animated AR Camera view simulation.

---

## 📂 File Directory Structure
* `src/context/SimulationContext.tsx` - Live telemetry simulator & central state coordinator.
* `src/data/knowledgeBase.ts` - Grounding RAG database & search matcher.
* `src/data/knowledgeBase.test.ts` - RAG test suite.
* `src/components/CommandCenter.tsx` - Organizer operations console & broadcast gating.
* `src/components/AIConcierge.tsx` - Fan chat interface, speech synthesis, & low-confidence human escalation.
* `src/components/NavigationWayfinding.tsx` - Crowd-aware SVG map & AR camera simulation.
* `src/components/AccessibilityCoordinator.tsx` - Elena's PWD dispatching queue.
* `src/components/TransportationAssistant.tsx` - Departure planner compiling traffic feeds.
* `src/components/SustainabilityDashboard.tsx` - Resource anomalies (water/energy/waste) panel.
* `src/components/VolunteerCopilot.tsx` - Shift guidelines, translation helper, & fast incident reporting.
* `src/index.css` - Custom styling declarations, CSS grid, glassmorphism tokens, and micro-animations.

---

## 🚀 Running the Project Locally

### Prerequisites
Ensure you have **Node.js** (v22+) and **npm** installed on your system.

### 1. Install Dependencies
Run this in the project root directory:
```bash
npm install
```

### 2. Start the Development Server
Launch the local development web server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run the Automated Unit Tests
Verify the RAG search confidence logic and keyword matcher:
```bash
npm run test
```

---

## 🎯 Verification & Testing

Our test suite is written using **Vitest** and validates:
- **High-confidence keyword match retrieval**: Matches search inputs regarding bags/prohibited items to the correct RAG documents.
- **Intent recognition & custom context injection**: Tests that schedule/capacity requests trigger matching stadium data structures.
- **Low-confidence banters**: Assures that off-topic queries drop confidence below 50% to trigger human escort workflows.

---

## ♿ Accessibility Compliance (WCAG 2.2 AA)
- Focuses on keyboard navigation, screen reader access, and clear text contrasts.
- Provides a dedicated **Accessible Route Toggle** inside wayfinding, routing paths around physical stairs.
- Supports digital voice output (Speech Synthesis) for fan inquiries.
- Large buttons, clear layout borders, and descriptive HTML IDs (e.g. `role-btn-organizer`, `tab-btn-sustainability`) for reliable automated testing.

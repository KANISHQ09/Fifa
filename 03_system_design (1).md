# System Design Document
## StadiumPulse AI — GenAI-Enabled Smart Stadium & Tournament Operations Platform

**Document Version:** 1.0
**Related Documents:** 01_product_requirements_document.md, 02_software_requirements_specification.md

---

## 1. Design Goals

- **Multi-venue, multi-region**: operate reliably and independently across 16 host stadiums in 3 countries.
- **Real-time**: sub-3-second AI response, sub-15-second crowd data refresh.
- **Grounded, not hallucinated**: all factual fan-facing content backed by RAG over a verified knowledge base.
- **Privacy-by-design**: anonymized crowd analytics, PII minimization, regional data residency.
- **Resilient**: graceful degradation under connectivity loss or AI-service outage.
- **Modular**: independently deployable microservices per functional module (see SRS Section 3).

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                 │
│  Fan Mobile App │ Fan Web App │ Venue Kiosk │ Volunteer/Staff App │ Ops   │
│  (iOS/Android)  │ (Responsive)│ (Locked WebView) │ (Mobile)      │ Console│
│                                                                    (Web)  │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS / WSS (TLS 1.3)
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY / EDGE LAYER                        │
│   Auth (OAuth2/OIDC) │ Rate Limiting │ Regional Routing │ CDN/Edge Cache  │
└───────────────────────────────┬────────────────────────────────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       APPLICATION / MICROSERVICES LAYER                  │
│                                                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │ Concierge  │ │ Navigation │ │  Crowd     │ │Accessibility│            │
│  │  Service   │ │  Service   │ │Intelligence│ │  Service    │            │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘            │
│  ┌─────┴──────┐ ┌─────┴──────┐ ┌─────┴──────┐ ┌─────┴──────┐            │
│  │Transportation│ │Sustainability│ │  Ops     │ │ Incident/  │            │
│  │  Service    │ │   Service    │ │ Command  │ │ Emergency  │            │
│  └────────────┘ └────────────┘ │ Service   │ │  Service    │            │
│                                  └───────────┘ └────────────┘            │
└───────────────────────────────┬────────────────────────────────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          AI / INTELLIGENCE LAYER                         │
│  ┌───────────────┐ ┌──────────────────┐ ┌───────────────────────────┐   │
│  │  LLM Gateway   │ │ RAG / Retrieval  │ │ Crowd CV / Predictive     │   │
│  │ (Claude API,   │ │ (Vector DB +     │ │ Models (density estimation,│   │
│  │ prompt/guard-  │ │ Knowledge Base)  │ │ surge forecasting)         │   │
│  │ rails, caching)│ │                  │ │                            │   │
│  └───────────────┘ └──────────────────┘ └───────────────────────────┘   │
└───────────────────────────────┬────────────────────────────────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                   │
│  Operational DB (Postgres) │ Vector DB │ Time-Series DB (metrics/IoT)    │
│  Object Storage (maps/media) │ Event Stream (Kafka/Kinesis) │ Cache(Redis)│
└───────────────────────────────┬────────────────────────────────────────┘
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER (Venue & City Systems)              │
│  CCTV/IoT Sensors │ Ticketing System │ Transit APIs │ Rideshare/Parking  │
│  Weather Provider │ Energy/Water/Waste Mgmt │ Emergency Services / SMS   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Design

### 3.1 Client Layer
- **Fan Mobile App**: React Native (iOS/Android) — chat UI, AR navigation module, offline map cache, push notifications.
- **Fan Web App**: Progressive Web App (PWA) for feature parity without install; used heavily by kiosks.
- **Venue Kiosk**: Locked-down Chromium kiosk mode running the PWA with accessibility-optimized UI (large text, screen reader).
- **Volunteer/Staff App**: React Native app with badge-based SSO login, offline FAQ cache, one-tap escalation.
- **Ops Command Center**: React web dashboard with real-time WebSocket feed, role-based views (single-venue vs. multi-venue).

### 3.2 API Gateway / Edge Layer
- Managed API Gateway (e.g., Kong/AWS API Gateway) handling authentication (OAuth2/OIDC), rate limiting per client type, and regional request routing to the nearest of 3 regional deployments (US, Canada, Mexico) for latency and data-residency compliance.
- CDN edge caching for static assets (maps, translated FAQ content).

### 3.3 Application / Microservices Layer
Each module from the SRS maps to an independently deployable microservice, communicating via internal REST/gRPC and an event bus (Kafka) for asynchronous workflows (e.g., accessibility dispatch, incident escalation).

| Service | Responsibilities | Key Dependencies |
|---|---|---|
| Concierge Service | Manages chat/voice sessions, orchestrates LLM + RAG calls, confidence scoring, escalation | LLM Gateway, RAG, Session DB |
| Navigation Service | Route computation, accessible routing, AR anchor data | Venue map data, Crowd Intelligence (for dynamic rerouting) |
| Crowd Intelligence Service | Ingests sensor feeds, runs density models, issues predictive alerts | CV/Predictive Models, Time-Series DB, Event Bus |
| Accessibility Service | Request intake, triage, staff dispatch, status tracking | Concierge Service, Staff directory, Event Bus |
| Transportation Service | Aggregates transit/rideshare/parking data, generates personalized plans | External city/transit APIs, LLM Gateway |
| Sustainability Service | Ingests energy/water/waste data, generates anomaly reports | Time-Series DB, LLM Gateway |
| Ops Command Service | Aggregates cross-service data into unified dashboard, generates executive summaries | All services (read), Event Bus, LLM Gateway |
| Incident/Emergency Service | Manages alert creation, human-approval workflow, multilingual broadcast dispatch | LLM Gateway, SMS/Push Gateway, Event Bus |

### 3.4 AI / Intelligence Layer

#### 3.4.1 LLM Gateway
- Central abstraction layer for all calls to the Anthropic Claude API family.
- Responsibilities: prompt template management (version-controlled), guardrails/content filtering, response caching for repeated queries (e.g., common FAQs), fallback routing (e.g., to cached templates) if the API is degraded, usage/cost monitoring, and per-module rate allocation to protect critical services (Incident/Emergency) during peak load.
- Implements **human-in-the-loop gating** for safety-critical content (emergency broadcasts) per NFR/FR-INC-02 — generated drafts are queued for staff approval before dispatch, never auto-sent.

#### 3.4.2 RAG / Retrieval Layer
- Vector database (e.g., pgvector/Pinecone-class) indexing the verified venue knowledge base: official schedules, venue policies, accessibility facility locations, FAQs, transit info, translated content.
- Retrieval pipeline: query embedding → top-k semantic search → context assembly → passed to LLM Gateway as grounding context, reducing hallucination risk (addresses FR-CON-02).
- Knowledge base content is curated and reviewed by venue operations teams and updated via a content-management workflow, not by the AI itself.

#### 3.4.3 Crowd CV / Predictive Models
- Computer vision pipeline (edge or regional GPU inference) performs **anonymized, aggregate** people-counting per camera zone — no facial recognition or re-identification, consistent with FR-CRW-06.
- Time-series forecasting model (e.g., gradient-boosted or lightweight temporal model) combines historical match-day patterns, live counts, gate schedules, and external factors (weather, transit delays) to predict density surges ≥10 minutes ahead.
- Predictions are passed to the LLM Gateway to generate natural-language, actionable recommendations for Ops Command Center operators (FR-CRW-04), keeping the predictive model and the language-generation step decoupled for auditability.

### 3.5 Data Layer
- **Operational DB (PostgreSQL, regional)**: user sessions, accessibility requests, incident records, staff directory.
- **Vector DB**: RAG knowledge embeddings.
- **Time-Series DB (e.g., TimescaleDB/InfluxDB)**: crowd density readings, sustainability metrics, sensor telemetry.
- **Object Storage**: venue maps, AR anchor assets, media for signage.
- **Event Stream (Kafka/Kinesis)**: asynchronous inter-service events (alert triggered, request dispatched, incident escalated).
- **Cache (Redis)**: session state, frequent RAG/LLM response caching, real-time dashboard state.

### 3.6 Integration Layer
- Adapter pattern per venue: since host stadiums have heterogeneous legacy systems (per SRS 2.5 constraint), each venue integration is implemented as a pluggable adapter conforming to a standard internal interface (e.g., `ICrowdSensorAdapter`, `ITransitAdapter`), decoupling core services from venue-specific system quirks.
- All external integrations use scoped, rotated credentials (NFR-SEC-04) and are monitored for availability with automatic circuit-breaking to trigger graceful degradation.

---

## 4. Data Flow Examples

### 4.1 Fan Asks the AI Concierge a Question
1. Fan sends message (text/voice) via mobile app → API Gateway → Concierge Service.
2. Concierge Service detects language, embeds query, calls RAG layer for relevant knowledge base context.
3. Concierge Service calls LLM Gateway with query + retrieved context + conversation history.
4. LLM Gateway returns a grounded response with a confidence score.
5. If confidence ≥ threshold, response is returned to the fan (translated as needed); if below threshold, session is flagged for volunteer/staff handoff via the Event Bus.
6. Interaction logged (PII-redacted) for QA/analytics.

### 4.2 Predictive Crowd Alert → Organizer Action
1. CCTV/IoT sensors stream anonymized zone counts into the Crowd Intelligence Service via the Integration Layer.
2. Predictive model detects a trajectory toward unsafe density in Zone 4, 15 minutes out.
3. Crowd Intelligence Service publishes an alert event to the Event Bus.
4. Ops Command Service consumes the event, calls LLM Gateway to draft a recommended mitigation ("Open Gate C; redirect Zone 4 queue via concourse B").
5. Alert + recommendation displayed on Ops Command Center dashboard in real time (WebSocket push).
6. Organizer accepts/modifies/rejects the recommendation; action and outcome logged to the audit trail (FR-OPS-04).

### 4.3 Accessibility Request Fulfillment
1. Fan requests a wheelchair escort via chat.
2. Concierge Service recognizes intent, routes to Accessibility Service.
3. Accessibility Service auto-triages (urgency, location), identifies nearest available staff via staff directory, and uses the LLM Gateway to generate a concise dispatch summary.
4. Dispatch notification pushed to the assigned staff member's mobile copilot app.
5. Status updates (Assigned → En Route → Resolved) sync back to the fan's live tracker in real time.

---

## 5. Technology Stack

| Layer | Technology Choices |
|---|---|
| Mobile Apps | React Native, TypeScript |
| Web Apps (Fan, Kiosk, Ops Console) | React, TypeScript, PWA |
| API Gateway | Kong / AWS API Gateway |
| Microservices | Node.js/TypeScript or Python (FastAPI), containerized (Docker) |
| Orchestration | Kubernetes (multi-region clusters: US, Canada, Mexico) |
| LLM Provider | Anthropic Claude API (Claude Sonnet 5 for interactive concierge; higher-capability tier for complex summarization/ops analysis as needed) |
| Vector DB | pgvector (Postgres extension) or managed vector store |
| Operational DB | PostgreSQL (regional, with read replicas) |
| Time-Series DB | TimescaleDB or InfluxDB |
| Event Streaming | Apache Kafka / AWS Kinesis |
| Cache | Redis |
| Object Storage | S3-compatible regional storage |
| CV Inference | ONNX/TensorRT-optimized models on regional GPU clusters or edge appliances at venues |
| Monitoring/Observability | Prometheus + Grafana, distributed tracing (OpenTelemetry) |
| CI/CD | GitHub Actions, ArgoCD (GitOps) |

---

## 6. Deployment Architecture

- **Regional deployments**: 3 primary regions (US, Canada, Mexico) for data residency and latency; each host stadium routes to its nearest region.
- **Per-venue edge nodes**: lightweight edge compute at each stadium for CV inference pre-processing and offline-cache serving, reducing bandwidth and latency dependence on the cloud.
- **Multi-AZ redundancy** within each region for critical services (Concierge, Navigation, Crowd Intelligence, Incident/Emergency) to meet the 99.9% uptime target during match windows.
- **Autoscaling**: Kubernetes Horizontal Pod Autoscaler tied to concurrent session count and queue depth, pre-warmed ahead of scheduled kickoff times using known match schedules.
- **Blue-green deployment** strategy for zero-downtime releases between matches.

---

## 7. Security Architecture
- OAuth2/OIDC-based authentication; MFA enforced for staff/organizer/admin roles.
- RBAC enforced at the API Gateway and service layer.
- All inter-service traffic within the cluster encrypted (mTLS via service mesh, e.g., Istio/Linkerd).
- Secrets managed via a vault service (e.g., HashiCorp Vault / AWS Secrets Manager) with automatic rotation.
- WAF at the edge layer to mitigate common web attacks (OWASP Top 10).
- Regular penetration testing and dependency vulnerability scanning integrated into CI/CD.

---

## 8. Resilience & Degradation Strategy

| Failure Scenario | Degraded Behavior |
|---|---|
| LLM API unavailable/rate-limited | Fall back to cached FAQ responses and static navigation; queue non-critical requests for retry |
| Venue connectivity loss (Wi-Fi/5G outage) | Mobile apps switch to offline-cached maps and last-synced FAQ; sync resumes on reconnect |
| CCTV/IoT sensor feed loss for a zone | Crowd Intelligence Service flags zone as "data unavailable" and falls back to historical baseline estimates with lower confidence, visibly marked on the Ops dashboard |
| Regional cloud outage | Automatic failover to nearest healthy region; local edge nodes continue serving cached content |
| Transit/rideshare API outage | Transportation Service displays last-known data with a "may be outdated" notice |

---

## 9. Observability & Audit
- All AI-generated recommendations (crowd mitigation, sustainability actions, executive summaries) are logged with model version, prompt/context hash, and timestamp for post-tournament review (NFR-AUD-01).
- Dashboards track: response latency, LLM error/hallucination-flag rate (via human feedback), escalation rate, request volume per module, per-venue system health.
- Post-match automated reports summarize operational KPIs against PRD targets (Section 7 of PRD).

---

## 10. Scalability Plan for Tournament Scale
- Load testing conducted at 3x projected peak concurrency (240,000 simultaneous users per venue) ahead of each tournament phase.
- LLM Gateway implements request batching and semantic caching (common questions cached and served without a fresh LLM call) to control cost and latency at scale.
- Pre-scaling triggered automatically ahead of scheduled kickoffs based on the match calendar, rather than relying solely on reactive autoscaling.

---

## 11. Open Design Considerations
1. Whether CV inference runs fully at venue edge nodes vs. regional cloud GPU clusters — depends on per-venue network bandwidth and hardware availability (to be finalized during Phase 0 pilot).
2. Standardizing the venue adapter interface across 16 stadiums with varying legacy vendors — requires early technical discovery per venue.
3. Selecting the specific vector DB/managed RAG service based on Phase 0 pilot performance and cost benchmarking.

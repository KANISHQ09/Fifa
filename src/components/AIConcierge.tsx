import React, { useState, useRef, useEffect } from "react";
import { searchKnowledgeBase } from "../data/knowledgeBase";
import type { KBEntry } from "../data/knowledgeBase";
import { useSimulation } from "../context/SimulationContext";
import { 
  Send, 
  Volume2, 
  VolumeX, 
  Mic, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Sparkles,
  UserPlus,
  Globe
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  confidence?: number;
  sources?: KBEntry[];
  needsEscalation?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" }
];

export const AIConcierge: React.FC = () => {
  const { addAccessibilityRequest, stadiums } = useSimulation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "Hello! Welcome to FIFA World Cup 2026. I am StadiumPulse AI Concierge. How can I help you find your seat, locate accessibility zones, or plan your transit today?",
      timestamp: new Date(),
      confidence: 0.98
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle Speech Synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Stop any active speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    
    // Match voices if possible
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate RAG query processing (1.5 seconds)
    setTimeout(() => {
      const { context, confidence, matches } = searchKnowledgeBase(textToSend);
      
      let aiResponseText = "";
      let needsEscalation = false;

      // Rule-based intent parsing: Wheelchair Escort or Assistive service requests
      const queryLower = textToSend.toLowerCase();
      if (queryLower.includes("wheelchair") || queryLower.includes("pwd") || queryLower.includes("disabled")) {
        aiResponseText = "I detected you might need wheelchair or mobility assistance. I can submit a request directly to our venue staff on your behalf. Would you like me to book a wheelchair escort?";
        needsEscalation = false;
      } else if (confidence < 0.65) {
        aiResponseText = "I apologize, but I couldn't find a high-confidence answer in our official guidelines for that question. You can try rephrasing, or tap the button below to connect with a volunteer supervisor.";
        needsEscalation = true;
      } else {
        // Construct RAG response
        if (matches.length > 0) {
          aiResponseText = matches[0].content;
        } else {
          aiResponseText = "Here is some information regarding World Cup schedules and stadiums. " + context.slice(0, 300) + "...";
        }
      }

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date(),
        confidence,
        sources: matches,
        needsEscalation
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
      
      // Voice synthesis
      if (voiceEnabled) {
        speakText(aiResponseText);
      }
    }, 1200);
  };

  // Helper trigger for booking accessibility request directly from chat
  const handleAutoBookAccessibility = () => {
    addAccessibilityRequest({
      fanName: "International Fan",
      type: "Wheelchair Escort",
      stadiumName: stadiums[0].name, // Default to first active stadium
      location: "Active Seat Area",
      urgency: "Medium"
    });

    const successMsg: Message = {
      id: `msg-${Date.now()}-acc-success`,
      sender: "ai",
      text: "✅ Wheelchair escort request submitted successfully! An accessibility volunteer has been dispatched to your location. You can track this request on your app dashboard.",
      timestamp: new Date(),
      confidence: 0.98
    };

    setMessages(prev => [...prev, successMsg]);
  };

  // Simulating voice speech typing
  const handleVoiceInputSimulate = () => {
    const speechSamples = [
      "Where is the nearest wheelchair-accessible restroom?",
      "Can I bring a professional camera with a 7 inch lens?",
      "Is alcohol allowed inside the match seating gates?",
      "What is the metro shuttle frequency for MetLife Stadium?"
    ];
    const randomSample = speechSamples[Math.floor(Math.random() * speechSamples.length)];
    setInputValue(randomSample);
    
    // Animate speech recognition
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      handleSendMessage(randomSample);
    }, 1500);
  };

  const handleEscalateToHuman = () => {
    const escalationMsg: Message = {
      id: `msg-${Date.now()}-escalated`,
      sender: "ai",
      text: "🤝 Connecting you to a live volunteer... A ticket has been raised. A nearby volunteer will join this chat thread in a few moments.",
      timestamp: new Date(),
      confidence: 1.0
    };

    setMessages(prev => [...prev, escalationMsg]);
  };

  return (
    <div className="role-view-wrapper animated-entry">
      <div>
        <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Sparkles size={28} /> AI Concierge & Kiosk
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
          Multilingual digital assistant with voice output and Retrieval-Augmented Generation (RAG) grounding.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
        
        {/* Main Chat Panel */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "600px", position: "relative" }}>
          
          {/* Chat Header */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--stadium-green)", boxShadow: "0 0 6px var(--stadium-green)" }} />
              <span style={{ fontWeight: "700" }}>StadiumPulse Assistant</span>
            </div>
            
            {/* Options */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              
              {/* Language Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Globe size={14} style={{ color: "var(--text-secondary)" }} />
                <select 
                  value={selectedLang} 
                  onChange={e => setSelectedLang(e.target.value)}
                  style={{ padding: "4px 8px", fontSize: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px" }}
                >
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Speech Synthesis Toggle */}
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: voiceEnabled ? "var(--fifa-gold)" : "var(--text-muted)", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center" 
                }}
                title={voiceEnabled ? "Voice Enabled" : "Voice Muted"}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  width: "100%",
                  animation: "slideIn 0.25s ease-out forwards"
                }}
              >
                <div style={{ display: "flex", gap: "8px", flexDirection: msg.sender === "user" ? "row-reverse" : "row", maxWidth: "80%" }}>
                  <div 
                    style={{ 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      background: msg.sender === "user" ? "rgba(255,255,255,0.05)" : "var(--fifa-gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: msg.sender === "user" ? "#FFFFFF" : "#000000",
                      fontWeight: "700",
                      fontSize: "12px",
                      flexShrink: 0
                    }}
                  >
                    {msg.sender === "user" ? <User size={16} /> : <Sparkles size={16} />}
                  </div>

                  <div>
                    {/* Message content */}
                    <div 
                      style={{ 
                        background: msg.sender === "user" ? "var(--fifa-blue)" : "rgba(255,255,255,0.03)", 
                        border: msg.sender === "user" ? "none" : "1px solid var(--border-glass)",
                        padding: "12px 16px", 
                        borderRadius: "16px",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        color: "#FFFFFF"
                      }}
                    >
                      {msg.text}

                      {/* Offers Assistive Escort Auto-Booking if key strings matched */}
                      {msg.text.includes("wheelchair escort") && (
                        <div style={{ marginTop: "12px" }}>
                          <button 
                            className="btn-primary" 
                            style={{ padding: "6px 12px", fontSize: "11px", display: "inline-flex", gap: "6px", alignItems: "center" }}
                            onClick={handleAutoBookAccessibility}
                          >
                            <UserPlus size={12} /> Auto-Book Mobility Escort
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Meta info: RAG Confidence & Sources */}
                    {msg.sender === "ai" && msg.confidence !== undefined && (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px", paddingLeft: "4px" }}>
                        <span 
                          style={{ 
                            fontSize: "10px", 
                            color: msg.confidence > 0.7 ? "var(--stadium-green)" : "var(--warning-orange)",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px"
                          }}
                        >
                          {msg.confidence > 0.7 ? <ShieldCheck size={10} /> : <AlertCircle size={10} />}
                          AI Confidence: {Math.round(msg.confidence * 100)}%
                        </span>

                        {msg.sources && msg.sources.length > 0 && (
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            Source: {msg.sources[0].category}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Low confidence escalation request */}
                    {msg.needsEscalation && (
                      <button
                        className="btn-secondary"
                        style={{ marginTop: "8px", padding: "6px 12px", fontSize: "11px", borderColor: "var(--warning-orange)", color: "var(--warning-orange)" }}
                        onClick={handleEscalateToHuman}
                      >
                        Escalate to Staff Supervisor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", gap: "8px", maxWidth: "80%" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--fifa-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000000" }}>
                  <Sparkles size={16} />
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-glass)", padding: "12px 16px", borderRadius: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  Retrieving knowledge base parameters...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-glass)" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                placeholder="Ask about tickets, gates, transit, prohibited items..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage(inputValue)}
                style={{ flex: 1 }}
              />
              
              {/* Simulated speech mic input */}
              <button 
                onClick={handleVoiceInputSimulate}
                style={{ 
                  background: "rgba(255,255,255,0.05)", 
                  border: "1px solid var(--border-glass)",
                  color: "#FFFFFF",
                  padding: "0 14px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Simulate Voice Input"
              >
                <Mic size={16} />
              </button>

              <button 
                onClick={() => handleSendMessage(inputValue)}
                className="btn-primary" 
                style={{ borderRadius: "var(--radius-sm)", padding: "0 16px" }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Info Sidebar (Common Questions) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "12px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>
              Quick FAQ Inquiry
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "👜 What is the bag size policy?", q: "What is the bag policy and allowed sizing?" },
                { label: "♿ Wheelchair route guidance", q: "Where is the wheelchair gate and accessible seating?" },
                { label: "🚇 Train/Transit frequencies", q: "What are public transit schedules and trains?" },
                { label: "💧 Bring personal water bottle?", q: "Can I bring my own water bottle inside?" },
                { label: "📅 Who is playing at Azteca?", q: "Which match schedule is playing at Estadio Azteca?" }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => handleSendMessage(item.q)}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    color: "var(--text-secondary)",
                    padding: "10px",
                    textAlign: "left",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--fifa-gold)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-glass)"}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>RAG Grounding Protocol</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              This Concierge module runs a client-side **Retrieval-Augmented Generation (RAG)** pipeline.
              Queries are mapped against semantic clusters (Prohibited Items, Accessibility, Transit, Medical).
              If the computed RAG confidence falls below **70%**, the platform triggers human-in-the-loop escalation to nearby volunteer copilots.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

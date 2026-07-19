import React, { useState, useRef, useEffect } from "react";
import { searchKnowledgeBase } from "../data/knowledgeBase";
import type { KBEntry } from "../data/knowledgeBase";
import { useSimulation } from "../context/SimulationContext";
import { 
  Send, 
  Mic, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Sparkles,
  UserPlus,
  Map
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  confidence?: number;
  sources?: KBEntry[];
  needsEscalation?: boolean;
  hasNavigationAction?: boolean;
  hasAccessibilityAction?: boolean;
}


export const AIConcierge: React.FC<{ onNavigate?: (menu: any) => void }> = ({ onNavigate }) => {
  const { 
    addAccessibilityRequest, 
    stadiums,
    supportChats,
    addSupportChat,
    sendChatMessage
  } = useSimulation();

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
  const [selectedLang] = useState("en");
  const [voiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const simTimeoutRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Sync active support chat messages from global simulation context
  const activeSupportChat = supportChats.find(c => c.id === activeChatId);

  useEffect(() => {
    if (activeSupportChat) {
      const chatMsgs = activeSupportChat.messages;
      setMessages(prev => {
        const mappedMsgs: Message[] = chatMsgs.map(m => {
          if (m.sender === "user") {
            return {
              id: m.id,
              sender: "user" as const,
              text: m.text,
              timestamp: new Date(m.timestamp)
            };
          } else {
            const labelName = activeSupportChat.assignedVolunteer || "Staff";
            return {
              id: m.id,
              sender: "ai" as const,
              text: `🧑‍💼 [Volunteer Reply - ${labelName}]: ${m.text}`,
              timestamp: new Date(m.timestamp)
            };
          }
        });

        // Add only unique new messages
        const newUniqueMsgs = mappedMsgs.filter(mm => 
          !prev.some(pm => pm.id === mm.id || (pm.text === mm.text && pm.sender === mm.sender))
        );
        
        if (newUniqueMsgs.length === 0) return prev;
        return [...prev, ...newUniqueMsgs];
      });
    }
  }, [activeSupportChat]);

  // Handle Speech Synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    window.speechSynthesis.speak(utterance);
  };

  const translateToEnglish = async (text: string): Promise<string> => {
    const englishKeywords = ["hello", "where", "how", "what", "is", "the", "sensory", "restroom", "shuttle", "parking", "help", "escort"];
    const textLower = text.toLowerCase();
    const hasEnglishWords = englishKeywords.some(w => textLower.includes(w));
    if (hasEnglishWords && !textLower.includes("onde fica") && !textLower.includes("baño") && !textLower.includes("banheiro")) {
      return text; // Already English
    }

    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      const dictionary: Record<string, string> = {
        "onde fica a sala sensorial": "Where is the sensory room",
        "baño": "Where is the nearest restroom",
        "banheiro": "Where is the nearest restroom",
        "hola soy kanishq": "Hello, I am kanishq",
        "hello im kanishq": "Hello, I am kanishq",
        "onde fica a sala sensorial?": "Where is the sensory room?",
        "¿dónde está el baño más cercano?": "Where is the nearest restroom?",
        "où sont les toilettes les plus proches?": "Where is the nearest restroom?"
      };
      const key = text.trim().toLowerCase();
      if (dictionary[key]) return dictionary[key];
      
      let result = text
        .replace(/hola/gi, "hello")
        .replace(/soy/gi, "I am")
        .replace(/onde fica/gi, "where is")
        .replace(/sala/gi, "room")
        .replace(/sensorial/gi, "sensory")
        .replace(/baño/gi, "restroom")
        .replace(/banheiro/gi, "restroom")
        .replace(/où sont/gi, "where are")
        .replace(/les toilettes/gi, "the restrooms")
        .replace(/les plus proches/gi, "the nearest");
      return result;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Translate this user query to English. Do not add any extra text, comments, quotes, or conversational filler, just return the direct translation: "${text}"` }
                ]
              }
            ]
          })
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
      }
    } catch (e) {
      console.error("Translation api error", e);
    }
    return text;
  };

  const handleSendMessage = async (textToSend: string, isVoice = false) => {
    if (!textToSend.trim()) return;

    if (activeChatId) {
      const translation = await translateToEnglish(textToSend);
      sendChatMessage(activeChatId, "user", textToSend, translation !== textToSend ? translation : undefined);
      setInputValue("");
      return;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate RAG query processing (1.2 seconds)
    setTimeout(() => {
      const { context, confidence, matches } = searchKnowledgeBase(textToSend);
      
      let aiResponseText = "";
      let needsEscalation = false;
      let hasNavigationAction = false;
      let hasAccessibilityAction = false;

      const queryLower = textToSend.toLowerCase();

      // Detect navigation intents
      if (
        queryLower.includes("where") || 
        queryLower.includes("direction") || 
        queryLower.includes("navigate") || 
        queryLower.includes("wayfinding") || 
        queryLower.includes("restroom") || 
        queryLower.includes("gate") || 
        queryLower.includes("seat") || 
        queryLower.includes("map")
      ) {
        hasNavigationAction = true;
      }

      // Detect accessibility intents
      if (
        queryLower.includes("wheelchair") || 
        queryLower.includes("pwd") || 
        queryLower.includes("disabled") ||
        queryLower.includes("accessibility") ||
        queryLower.includes("blind") ||
        queryLower.includes("elevator")
      ) {
        hasAccessibilityAction = true;
      }

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
        needsEscalation,
        hasNavigationAction,
        hasAccessibilityAction
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
      
      // Voice synthesis
      if (isVoice) {
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

  // Real Speech Recognition or simulated speech typing
  const handleVoiceInput = () => {
    // If already listening, stop
    if (isListening) {
      stopVoiceInput();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = selectedLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInputValue("Listening to your voice...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        handleSendMessage(transcript, true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error: ", event.error);
        setIsListening(false);
        setInputValue("Voice recognition failed. Please try typing.");
        setTimeout(() => setInputValue(""), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Fallback: Simulated Voice Speech Typing
      setIsListening(true);
      const speechSamples = [
        "Where is the nearest wheelchair-accessible restroom?",
        "Can I bring a professional camera with a 7 inch lens?",
        "Is alcohol allowed inside the match seating gates?",
        "What is the metro shuttle frequency for MetLife Stadium?"
      ];
      const randomSample = speechSamples[Math.floor(Math.random() * speechSamples.length)];
      setInputValue("Simulating voice: " + randomSample);
      
      simTimeoutRef.current = setTimeout(() => {
        setIsListening(false);
        handleSendMessage(randomSample, true);
      }, 4000);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.error(err);
      }
      recognitionRef.current = null;
    }
    if (simTimeoutRef.current) {
      clearTimeout(simTimeoutRef.current);
      simTimeoutRef.current = null;
    }
    setIsListening(false);
    setInputValue("");
  };

  const handleEscalateToHuman = async () => {
    const lastUserQuestion = [...messages]
      .reverse()
      .find(m => m.sender === "user")?.text || "Need live support assistance.";

    const translation = await translateToEnglish(lastUserQuestion);
    const newChatId = addSupportChat(
      "AI Concierge Fan", 
      stadiums[0]?.name || "SoFi Stadium", 
      lastUserQuestion, 
      translation !== lastUserQuestion ? translation : undefined
    );
    setActiveChatId(newChatId);

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
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: "28px", color: "var(--fifa-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={28} /> AI Concierge & Kiosk
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Multilingual digital assistant with voice output and Retrieval-Augmented Generation (RAG) grounding.
          </p>
        </div>
      </div>

      <div className="responsive-grid-concierge">
        
        {/* Main Chat Panel */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "600px", position: "relative", padding: 0 }}>
          
          {/* Chat Header */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: isListening ? "var(--danger-red)" : "var(--stadium-green)", boxShadow: `0 0 6px ${isListening ? "var(--danger-red)" : "var(--stadium-green)"}` }} />
              <span style={{ fontWeight: "700" }}>
                {isListening ? "Listening..." : (
                  <>
                    <span className="hide-mobile">StadiumPulse </span>Assistant
                  </>
                )}
              </span>
            </div>
            
            {/* Options */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Gemini-Style Live Button */}
              <button
                className="gemini-live-button"
                onClick={handleVoiceInput}
                title="Start Live Voice Session"
              >
                <span className="gemini-indicator-dot" />
                Go Live
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
                <div style={{ display: "flex", gap: "8px", flexDirection: msg.sender === "user" ? "row-reverse" : "row", width: "100%" }}>
                  <div 
                    style={{ 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      background: msg.sender === "user" ? "rgba(0,0,0,0.05)" : "var(--fifa-gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: msg.sender === "user" ? "var(--text-primary)" : "#000000",
                      fontWeight: "700",
                      fontSize: "12px",
                      flexShrink: 0,
                      border: msg.sender === "user" ? "1px solid var(--border-light)" : "none"
                    }}
                  >
                    {msg.sender === "user" ? <User size={16} /> : <Sparkles size={16} />}
                  </div>

                  <div style={{ maxWidth: "80%" }}>
                    {/* Message content */}
                    <div 
                      style={{ 
                        background: msg.sender === "user" ? "var(--fifa-blue)" : "#F1F5F9", 
                        border: msg.sender === "user" ? "none" : "1px solid var(--border-light)",
                        padding: "12px 16px", 
                        borderRadius: "16px",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        color: msg.sender === "user" ? "#FFFFFF" : "var(--text-primary)"
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

                      {/* Intent-based quick action buttons */}
                      {msg.sender === "ai" && (
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                          {msg.hasNavigationAction && onNavigate && (
                            <button
                              className="btn-primary"
                              onClick={() => onNavigate("navigation")}
                              style={{ padding: "6px 10px", fontSize: "11px", display: "inline-flex", gap: "6px", alignItems: "center" }}
                            >
                              <Map size={11} /> 🗺️ View Navigation Route
                            </button>
                          )}
                          
                          {msg.hasAccessibilityAction && !msg.text.includes("wheelchair escort") && (
                            <button
                              className="btn-secondary"
                              onClick={handleAutoBookAccessibility}
                              style={{ padding: "6px 10px", fontSize: "11px", display: "inline-flex", gap: "6px", alignItems: "center" }}
                            >
                              <UserPlus size={11} /> Request Mobility Assist
                            </button>
                          )}
                        </div>
                      )}

                      {/* Grounded Citation details */}
                      {msg.sender === "ai" && msg.sources && msg.sources.length > 0 && (
                        <div style={{ 
                          marginTop: "12px", 
                          padding: "10px", 
                          background: "rgba(0,0,0,0.02)", 
                          border: "1px solid var(--border-light)", 
                          borderRadius: "6px" 
                        }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--fifa-gold)", display: "block" }}>
                            📚 Grounded Verification Citation
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                            Document: **{msg.sources[0].title}** ({msg.sources[0].category})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta info: RAG Confidence */}
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
              <div style={{ display: "flex", gap: "8px", width: "fit-content", maxWidth: "80%" }}>
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
                placeholder={isListening ? "Listening..." : "Ask StadiumPulse AI..."}
                value={isListening ? "" : inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage(inputValue)}
                style={{ flex: 1, minWidth: 0 }}
                disabled={isListening}
              />
              
              {/* Mic voice input */}
              <button 
                onClick={handleVoiceInput}
                style={{ 
                  background: isListening ? "var(--danger-red)" : "rgba(0, 0, 0, 0.05)", 
                  border: `1px solid ${isListening ? "var(--danger-red)" : "var(--border-light)"}`,
                  color: isListening ? "#FFFFFF" : "var(--text-primary)",
                  padding: "0 12px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: isListening ? "0 0 10px rgba(217, 48, 37, 0.4)" : "none"
                }}
                title="Use Microphone Input"
              >
                <Mic size={16} style={{ animation: isListening ? "pulse 1s infinite alternate" : "none" }} />
              </button>

              <button 
                onClick={() => handleSendMessage(inputValue)}
                className="btn-primary" 
                aria-label="Send Message"
                style={{ borderRadius: "var(--radius-sm)", padding: "0 12px" }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Voice Input Modal Overlay */}
          {isListening && (
            <div className="voice-modal-overlay">
              <div className="voice-modal-content">
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                  Voicebot Listening...
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Speak clearly to query the StadiumPulse AI.
                </p>
                
                {/* Soundwave animation */}
                <div className="voice-wave-container">
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                </div>

                <button
                  onClick={stopVoiceInput}
                  className="btn-secondary"
                  style={{
                    borderColor: "var(--danger-red)",
                    color: "var(--danger-red)",
                    background: "rgba(217, 48, 37, 0.04)",
                    fontSize: "12px",
                    padding: "8px 16px",
                    borderRadius: "20px"
                  }}
                >
                  Cancel / Close
                </button>
              </div>
            </div>
          )}
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



        </div>

      </div>
    </div>
  );
};

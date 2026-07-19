export interface KBEntry {
  category: string;
  keywords: string[];
  title: string;
  content: string;
}

export interface MatchInfo {
  id: string;
  teams: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  group: string;
}

export const MATCHES: MatchInfo[] = [
  { id: "M01", teams: "Mexico vs. USA", venue: "Estadio Azteca", city: "Mexico City", date: "2026-06-11", time: "18:00", group: "Group A" },
  { id: "M02", teams: "Canada vs. Brazil", venue: "BC Place", city: "Vancouver", date: "2026-06-12", time: "17:00", group: "Group B" },
  { id: "M03", teams: "USA vs. England", venue: "MetLife Stadium", city: "New York/New Jersey", date: "2026-06-13", time: "20:00", group: "Group C" },
  { id: "M04", teams: "Argentina vs. France", venue: "SoFi Stadium", city: "Los Angeles", date: "2026-06-14", time: "19:00", group: "Group D" },
  { id: "M05", teams: "Spain vs. Germany", venue: "Hard Rock Stadium", city: "Miami", date: "2026-06-15", time: "16:00", group: "Group E" },
  { id: "M06", teams: "Canada vs. Mexico", venue: "BMO Field", city: "Toronto", date: "2026-06-16", time: "19:30", group: "Group A" },
  { id: "M07", teams: "USA vs. Japan", venue: "AT&T Stadium", city: "Dallas", date: "2026-06-17", time: "15:00", group: "Group F" },
  { id: "M08", teams: "Italy vs. Portugal", venue: "Mercedes-Benz Stadium", city: "Atlanta", date: "2026-06-18", time: "20:00", group: "Group G" }
];

export const STADIUMS = [
  {
    name: "MetLife Stadium",
    city: "New York/New Jersey",
    capacity: "82,500",
    gates: [
      { name: "MetLife Gate", zones: ["Zone 1", "Zone 2"], accessible: true },
      { name: "Verizon Gate", zones: ["Zone 3"], accessible: false },
      { name: "HCLTech Gate", zones: ["Zone 4"], accessible: true },
      { name: "Bud Light Gate", zones: ["Zone 5", "Zone 6"], accessible: true }
    ],
    facilities: {
      wheelchairSeats: "Sections 100, 200, 300 (dedicated platforms)",
      sensoryRooms: "Near Section 121 (Level 1)",
      medicalRooms: "Near Gate D and Verizon Gate",
      concessions: "Gluten-free (Sec 134), Halal (Sec 201), Vegan (Sec 117)"
    }
  },
  {
    name: "SoFi Stadium",
    city: "Los Angeles",
    capacity: "70,240",
    gates: [
      { name: "Gate A", zones: ["Zone A", "Zone B"], accessible: true },
      { name: "Gate B", zones: ["Zone C"], accessible: true },
      { name: "Gate C", zones: ["Zone D", "Zone E"], accessible: true }
    ],
    facilities: {
      wheelchairSeats: "All levels, excellent sightlines at Section 102 & 220",
      sensoryRooms: "Google Cloud Club Level, Section 231",
      medicalRooms: "Ground Level near Section 101 and Upper Level Section 404",
      concessions: "Organic options (Sec 120), Local LA Fusion (Sec 240)"
    }
  },
  {
    name: "Estadio Azteca",
    city: "Mexico City",
    capacity: "87,523",
    gates: [
      { name: "Gate 1 (Principal)", zones: ["Zone A", "Zone B"], accessible: true },
      { name: "Gate 2 (Norte)", zones: ["Zone C"], accessible: false },
      { name: "Gate 3 (Sur)", zones: ["Zone D"], accessible: true }
    ],
    facilities: {
      wheelchairSeats: "Lower ring, accessible via ramp 1 and 2",
      sensoryRooms: "None (Accessibility desk at Principal Gate has sensory bags)",
      medicalRooms: "Ramp 1 and Ramp 3",
      concessions: "Traditional Tacos (Sec 102), Vegetarian (Sec 210)"
    }
  }
];

export const KNOWLEDGE_BASE: KBEntry[] = [
  {
    category: "Prohibited Items",
    keywords: ["prohibited", "bag", "size", "camera", "food", "bottle", "allowed", "bring", "backpack"],
    title: "Prohibited Items & Bag Policy",
    content: "Only bags smaller than 12x12x6 inches (30.5x30.5x15 cm) that are clear/transparent are allowed. Backpacks, briefcases, and large luggage are strictly prohibited. Professional cameras with detachable lenses longer than 6 inches are not permitted. Outside food and beverages are prohibited except for medical needs or baby formula. Sealed water bottles up to 20oz (500ml) are permitted."
  },
  {
    category: "Accessibility Services",
    keywords: ["wheelchair", "accessibility", "pwd", "disabled", "elevator", "ramp", "sensory", "blind", "hearing"],
    title: "Accessibility Services & Facilities",
    content: "All stadiums are equipped with wheelchair-accessible platforms with companion seating, elevators, and sensory-friendly rooms. Wheelchair escort services are available free of charge by asking any volunteer or scheduling a request in the Accessibility App. Sensory-friendly spaces feature noise-canceling headphones, tactile toys, and weighted lap pads. Service animals are permitted with valid documentation."
  },
  {
    category: "Transportation",
    keywords: ["parking", "transit", "rideshare", "uber", "lyft", "train", "shuttle", "bus", "metro"],
    title: "Transit & Parking Guidelines",
    content: "Public transportation is highly recommended. Metropolitan train and shuttle systems run special high-frequency services starting 3 hours pre-match to 2 hours post-match. Dedicated rideshare pick-up and drop-off zones are designated at all venues (e.g. Lot K at SoFi Stadium, Lot 10 at MetLife). Pre-booked parking permits are mandatory for stadium parking lots."
  },
  {
    category: "Medical & Safety",
    keywords: ["medical", "emergency", "first aid", "doctor", "injury", "police", "security", "lost"],
    title: "Emergency & First Aid Contacts",
    content: "First Aid stations are distributed throughout the stadium concourses (look for red cross signage or ask volunteers). In case of emergency, report immediately to any staff member with a radio or volunteer. Lost and found services are located at the Guest Services booth near Gate A/Main Plaza."
  },
  {
    category: "Ticketing & Gates",
    keywords: ["ticket", "re-entry", "gate", "open", "timing", "phone", "digital", "reentry"],
    title: "Ticketing & Stadium Entry Policies",
    content: "All tickets are 100% digital and must be displayed on a mobile device via the official FIFA ticketing app. Screenshots of tickets are invalid. Stadium gates open 3 hours prior to kickoff. No re-entry is permitted once you exit the stadium gates."
  },
  {
    category: "Sustainability",
    keywords: ["waste", "recycling", "green", "sustainability", "cup", "plastic", "compost"],
    title: "Sustainability & Eco-Commitments",
    content: "StadiumPulse AI works with FIFA to achieve net-zero target emissions. Please separate waste into Compostable, Recyclable, and Landfill streams at clearly marked sorting stations. All beverage cups are reusable and can be deposited in green return bins for a 2 USD refund deposit, or recycled."
  }
];

export function searchKnowledgeBase(query: string, _lang: string = "en"): { matches: KBEntry[]; context: string; confidence: number } {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) {
    return { matches: [], context: "", confidence: 1.0 };
  }

  // Check for general greeting or capability questions
  const isGeneralHelp = 
    cleanQuery.includes("help") || 
    cleanQuery.includes("what can you") || 
    cleanQuery.includes("how can you") || 
    cleanQuery.includes("who are you") || 
    cleanQuery.includes("what do you do") || 
    cleanQuery.includes("tell me about yourself") ||
    cleanQuery.includes("capabilities") ||
    cleanQuery.includes("support");

  if (isGeneralHelp) {
    const helpEntry: KBEntry = {
      category: "General Help",
      keywords: ["help", "capabilities"],
      title: "How I Can Help You",
      content: "I am the StadiumPulse AI Assistant. I can help you with:\n\n" +
               "• 🎒 Stadium policies, allowed bag sizes, and prohibited items.\n" +
               "• ♿ Requesting wheelchair escorts and locating accessibility facilities.\n" +
               "• 🗺️ Viewing interactive 3D stadium maps and route guidance.\n" +
               "• 🚇 public transit schedules, parking zones, and shuttle pick-ups.\n" +
               "• ⚽ Match schedules, stadium capacities, and concession recommendations."
    };
    return {
      matches: [helpEntry],
      context: `[${helpEntry.title}]: ${helpEntry.content}`,
      confidence: 0.98
    };
  }

  const STOPWORDS = new Set(["the", "and", "for", "with", "you", "are", "can", "that", "this", "from", "your", "have", "what", "where", "how", "who", "when", "does", "will", "some", "them", "their", "they"]);

  const scoredEntries = KNOWLEDGE_BASE.map(entry => {
    let score = 0;
    
    // Keyword match (high weight)
    entry.keywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(cleanQuery)) {
        score += 3;
      }
    });

    const words = cleanQuery.split(/[^a-zA-Z0-9_-]+/);
    words.forEach(w => {
      if (w.length > 2 && !STOPWORDS.has(w)) {
        const titleRegex = new RegExp(`\\b${w}\\b`, "i");
        const contentRegex = new RegExp(`\\b${w}\\b`, "i");
        
        if (titleRegex.test(entry.title)) {
          score += 1.5;
        } else if (contentRegex.test(entry.content)) {
          score += 0.8;
        }
      }
    });

    return { entry, score };
  }).filter(item => item.score >= 1.5); // Filter out noisy matches below threshold

  scoredEntries.sort((a, b) => b.score - a.score);

  const topMatches = scoredEntries.slice(0, 2).map(item => item.entry);
  
  let confidence = 0.35; // Baseline default for unrelated questions
  if (scoredEntries.length > 0) {
    const topScore = scoredEntries[0].score;
    // Map score to confidence percentage
    confidence = Math.min(0.98, 0.5 + (topScore * 0.05));
  }

  let customContext = "";
  const queryWords = cleanQuery.split(/[\s,?.!]+/);
  
  const hasScheduleIntent = queryWords.some(w => ["schedule", "match", "game"].includes(w)) || cleanQuery.includes("who is playing");
  if (hasScheduleIntent) {
    customContext = "MATCHES SCHEDULE DATA:\n" + MATCHES.map(m => `- ${m.teams} on ${m.date} at ${m.time} in ${m.venue} (${m.city})`).join("\n");
    confidence = Math.max(confidence, 0.95);
  }
  
  const hasStadiumIntent = queryWords.some(w => ["stadium", "venue", "capacity"].includes(w));
  if (hasStadiumIntent) {
    customContext += (customContext ? "\n\n" : "") + "STADIUM DETAILS:\n" + STADIUMS.map(s => `- ${s.name} in ${s.city}: Capacity ${s.capacity}. Facilities: Wheelchair: ${s.facilities.wheelchairSeats}, Sensory: ${s.facilities.sensoryRooms}.`).join("\n");
    confidence = Math.max(confidence, 0.92);
  }

  const context = topMatches.map(e => `[${e.title}]: ${e.content}`).join("\n\n") + (customContext ? "\n\n" + customContext : "");

  return {
    matches: topMatches,
    context,
    confidence
  };
}

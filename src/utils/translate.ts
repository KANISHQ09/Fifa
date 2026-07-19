// Extracted translation utility — keeps AIConcierge lean and testable

const ENGLISH_KEYWORDS = [
  "hello", "where", "how", "what", "is", "the",
  "sensory", "restroom", "shuttle", "parking", "help", "escort"
];

const NON_ENGLISH_MARKERS = [
  "onde fica", "baño", "banheiro", "où sont", "¿", "dónde", "où est"
];

const FALLBACK_DICTIONARY: Record<string, string> = {
  "onde fica a sala sensorial":             "Where is the sensory room",
  "onde fica a sala sensorial?":            "Where is the sensory room?",
  "baño":                                   "Where is the nearest restroom",
  "banheiro":                               "Where is the nearest restroom",
  "hola soy kanishq":                       "Hello, I am kanishq",
  "hello im kanishq":                       "Hello, I am kanishq",
  "¿dónde está el baño más cercano?":       "Where is the nearest restroom?",
  "où sont les toilettes les plus proches?": "Where is the nearest restroom?"
};

function looksLikeEnglish(text: string): boolean {
  const lower = text.toLowerCase();
  const hasEnglishWords = ENGLISH_KEYWORDS.some(w => lower.includes(w));
  const hasNonEnglishMarkers = NON_ENGLISH_MARKERS.some(m => lower.includes(m));
  return hasEnglishWords && !hasNonEnglishMarkers;
}

function applyBasicTranslation(text: string): string {
  return text
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
}

export async function translateToEnglish(text: string): Promise<string> {
  if (looksLikeEnglish(text)) return text;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    const key = text.trim().toLowerCase();
    return FALLBACK_DICTIONARY[key] ?? applyBasicTranslation(text);
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
                {
                  text: `Translate this user query to English. Do not add any extra text, comments, quotes, or conversational filler, just return the direct translation: "${text}"`
                }
              ]
            }
          ]
        })
      }
    );
    if (response.ok) {
      const data: { candidates?: { content?: { parts?: { text?: string }[] } }[] } =
        await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? text;
    }
  } catch (e) {
    console.error("Translation API error:", e);
  }
  return text;
}

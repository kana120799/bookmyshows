import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const apiKey = process.env.GOOGLE_AI_KEY;
if (!apiKey) throw new Error("GOOGLE_AI_KEY is missing");

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    // We want STRICT JSON. In a more advanced setup we'd use 'json_object' mode or function calling.
    // For now, prompt engineering with 0 temperature works well for this scale.
    temperature: 0,
    maxOutputTokens: 200,
    apiKey: apiKey,
});

// --- 1. Cinema Filter Extractor ---
const cinemaFilterPrompt = PromptTemplate.fromTemplate(`
You are a Query Translator. Convert the user's natural language query into a JSON object for searching Cinemas.

Schema:
{{
    "city": string | null, // e.g., "Mumbai", "Delhi"
    "name": string | null, // e.g., "INOX", "PVR"
    "minSeats": number | null, // e.g., 35 (if user asks for > 35 seats)
    "location": string | null // e.g., "Gandhi Nagar" (street/area)
}}

Examples:
- "Cinemas with more than 35 seats in Mumbai" -> {{ "city": "Mumbai", "minSeats": 35 }}
- "Show me INOX cinemas" -> {{ "name": "INOX" }}
- "PVR near Gandhi Nagar" -> {{ "name": "PVR", "location": "Gandhi Nagar" }}
- "Cinemas in Delhi" -> {{ "city": "Delhi" }}

User Query: {query}

Output ONLY valid JSON.
`);

export const cinemaExtractorChain = RunnableSequence.from([
    { query: (input: string) => input },
    cinemaFilterPrompt,
    model,
    new StringOutputParser(),
]);

// --- 2. Movie Filter Extractor ---
const movieFilterPrompt = PromptTemplate.fromTemplate(`
You are a Query Translator. Convert the user's natural language query into a JSON object for searching Movies.

Schema:
{{
    "title": string | null, // partial title
    "genre": string | null, // e.g., "Action", "Drama"
    "language": string | null, // e.g., "Hindi", "English"
    "minRating": number | null, // e.g., 8 (if user asks for > 8 rating)
    "actor": string | null // e.g., "Akshay Kumar"
}}

Examples:
- "List 5 drama movies" -> {{ "genre": "Drama" }}
- "Hindi movies rated above 8" -> {{ "language": "Hindi", "minRating": 8 }}
- "Movies with Akshay Kumar" -> {{ "actor": "Akshay Kumar" }}
- "Is there any show for Dunki?" -> {{ "title": "Dunki" }}

User Query: {query}

Output ONLY valid JSON.
`);

export const movieExtractorChain = RunnableSequence.from([
    { query: (input: string) => input },
    movieFilterPrompt,
    model,
    new StringOutputParser(),
]);
const bookingFilterPrompt = PromptTemplate.fromTemplate(`
You are a Query Translator. Convert the user's natural language query into a JSON object for searching User Bookings.

Schema:
{{
    "status": "CONFIRMED" | "CANCELLED" | "PENDING" | null,
    "count": number | null // Limit results
}}

Examples:
- "My confirmed tickets" -> {{ "status": "CONFIRMED" }}
- "List my last 5 bookings" -> {{ "count": 5 }}
- "Show my cancelled tickets" -> {{ "status": "CANCELLED" }}
- "My bookings" -> {{ "status": "CONFIRMED" }}
- "My current booking" -> {{ "status": "CONFIRMED" }}
- "Show my tickets" -> {{ "status": "CONFIRMED" }}

User Query: {query}

Output ONLY valid JSON.
`);

export const bookingExtractorChain = RunnableSequence.from([
    { query: (input: string) => input },
    bookingFilterPrompt,
    model,
    new StringOutputParser(),
]);

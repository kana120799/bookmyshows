import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const apiKey = process.env.GOOGLE_AI_KEY;
if (!apiKey) throw new Error("GOOGLE_AI_KEY is missing");

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    maxOutputTokens: 256,
    apiKey: apiKey,
    temperature: 0, // Deterministic for classification
});

// --- Domain Classifier ---

const domainPrompt = PromptTemplate.fromTemplate(`
You are a domain classifier for a Movie Booking Application.
Your task is to determine if the user's query is related to the Movie Booking domain.

The Movie Booking domain includes:
- Movies (titles, genres, actors, descriptions)
- Cinemas (locations, facilities)
- Shows (timings, availability)
- Tickets (booking, pricing, seats)
- Policies (cancellation, refunds, age limits)

Anything else (e.g., weather, politics, general knowledge, coding questions unrelated to this specific app) is OUT_OF_SCOPE.

Query: {query}

Classify as either "DOMAIN_RELATED" or "OUT_OF_SCOPE".
Return ONLY the classification string.
`);

export const domainClassifierChain = RunnableSequence.from([
    { query: (input: string) => input },
    domainPrompt,
    model,
    new StringOutputParser(),
]);

// --- Intent Classifier ---

const intentPrompt = PromptTemplate.fromTemplate(`
You are an intent classifier for a Movie Booking Application.
Classify the user's query into one of the following intents:

1. MOVIE_INFO: Questions about specific movies (plot, cast, rating, "tell me about...").
2. SHOW_TIMINGS: Queries asking for showtimes, schedules, or when a movie is playing.
3. CINEMA_SEARCH: Queries looking for cinemas, halls, or locations.
4. POLICY_FAQ: Queries about booking rules, cancellations, refunds, or general help.
5. BOOKING_HISTORY: Queries about the user's own past or current bookings, tickets, or history.
6. GENERAL_QUERY: General greetings or questions that are domain-related but don't fit specific categories (e.g., "Hi", "Help").

Query: {query}

Return ONLY the intent name (e.g., MOVIE_INFO).
`);

export const intentClassifierChain = RunnableSequence.from([
    { query: (input: string) => input },
    intentPrompt,
    model,
    new StringOutputParser(),
]);

// --- Search Parameter Extractor ---

// --- Deprecated searchExtractorChain removed ---

// --- Query Refiner (Context Aware) ---

const refinerPrompt = PromptTemplate.fromTemplate(`
You are a conversation context resolver.
Your goal is to REWRITE the User's latest query to be fully standalone, based on the Conversation History.

Context:
- The user might ask "Yes", "Show me", "How much?", referring to a previous movie or cinema.
- If the query is already standalone (e.g., "Show timings for Interstellar"), leave it exactly as is.
- If the query is dependent (e.g., "Yes"), rewrite it using the context (e.g., "Show timings for INOX Mumbai").

Conversation History:
{history}

Latest User Query: {query}

REFINED QUERY (Output ONLY the text):
`);

export const queryRefinerChain = RunnableSequence.from([
    {
        history: (input: any) => input.history,
        query: (input: any) => input.query
    },
    refinerPrompt,
    model,
    new StringOutputParser(),
]);

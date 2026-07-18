import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { domainClassifierChain, intentClassifierChain, queryRefinerChain } from "./classifier";
import { cinemaExtractorChain, movieExtractorChain, bookingExtractorChain } from "./extractors";
import { findMovies, findShows, findCinemas, findBookings, MovieFilters, CinemaFilters, BookingFilters } from "./tools";
import { searchKnowledgeBase } from "./rag";

const apiKey = process.env.GOOGLE_AI_KEY;
if (!apiKey) throw new Error("GOOGLE_AI_KEY is missing");

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    maxOutputTokens: 500,
    apiKey: apiKey,
    temperature: 0.7, // Slightly creative for friendly responses
});

const responsePrompt = PromptTemplate.fromTemplate(`
You are a smart, friendly, and professional assistant for a Movie Booking Application.
Your goal is to answer the user's question based ONLY on the provided context (Data) and Intent.

User Query: {query}
Detected Intent: {intent}
Context / Data Found:
{context}

Guidelines:
1. If the Data says "No movies found" or similar, apologize and suggest they check the spelling or try another search.
2. If the Data contains a list of movies/shows, present them neatly (e.g., bullet points or a numbered list).
3. If the intent was POLICY_FAQ, answer clearly based on the policy text.
4. If the intent was BOOKING_HISTORY, summarize the user's bookings (Movie, Cinema, Date, Status).
5. Do NOT hallucinate. If the context doesn't have the answer, say you don't know.
6. Provide a helpful follow-up if appropriate.
7. If the intent is generally conversational (Hi, Hello), be warm and ask how you can help with movies today.

Response:
`);

const responderChain = RunnableSequence.from([
    {
        query: (input: any) => input.query,
        intent: (input: any) => input.intent,
        context: (input: any) => input.context
    },
    responsePrompt,
    model,
    new StringOutputParser()
]);

// Parse JSON safely
const parseJSON = (str: string) => {
    try {
        // Remove markdown code blocks if any
        const clean = str.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Error:", str);
        // Default empty filter if parsing fails
        return {};
    }
};

export async function processMessage(query: string, history: any[] = [], userId?: string) {
    try {
        console.log(`\n--- Processing Query: "${query}" --- UserID: ${userId}`);

        // 0. Context Refinement
        let refinedQuery = query;
        if (history.length > 0) {
            const formattedHistory = history.map(m => `${m.role}: ${m.content}`).join("\n");
            refinedQuery = await queryRefinerChain.invoke({
                history: formattedHistory,
                query: query
            });
            refinedQuery = refinedQuery.trim();
            console.log(`Refined Query: "${refinedQuery}"`);
        }

        // 1. Domain Check
        const domain = await domainClassifierChain.invoke(refinedQuery);
        console.log(`Domain: ${domain}`);

        if (domain.trim() === "OUT_OF_SCOPE") {
            return "I'm designed to help with movies, cinemas, show timings, and booking policies. I can't help with questions outside this domain (like weather or general knowledge).";
        }

        // 2. Intent Detection
        const intent = await intentClassifierChain.invoke(refinedQuery);
        const safeIntent = intent.trim();
        console.log(`Intent: ${safeIntent}`);

        // 3. Router & Execution
        let context = "";

        switch (safeIntent) {
            case "MOVIE_INFO":
                const movieFiltersRaw = await movieExtractorChain.invoke(refinedQuery);
                const movieFilters: MovieFilters = parseJSON(movieFiltersRaw);
                context = await findMovies(movieFilters);
                break;

            case "SHOW_TIMINGS":
                // For now, treat show timings as a movie search to find the movie first
                const showFiltersRaw = await movieExtractorChain.invoke(refinedQuery);
                const showFilters = parseJSON(showFiltersRaw);
                // Fallback: if no title extracted, use raw query
                const movieName = showFilters.title || refinedQuery;
                context = await findShows(movieName);
                break;

            case "CINEMA_SEARCH":
                const cinemaFiltersRaw = await cinemaExtractorChain.invoke(refinedQuery);
                const cinemaFilters: CinemaFilters = parseJSON(cinemaFiltersRaw);
                context = await findCinemas(cinemaFilters);
                break;

            case "BOOKING_HISTORY":
                if (!userId) {
                    context = "USER_NOT_LOGGED_IN"; // Let the responder handle this gracefully
                } else {
                    const bookingFiltersRaw = await bookingExtractorChain.invoke(refinedQuery);
                    const bookingFilters: BookingFilters = parseJSON(bookingFiltersRaw);
                    context = await findBookings(userId, bookingFilters);
                }
                break;

            case "POLICY_FAQ":
                context = await searchKnowledgeBase(refinedQuery);
                break;

            case "GENERAL_QUERY":
                context = "User is saying hello or asking for general help. Be polite and list what you can do (Find movies, cinemas, bookings, policies).";
                break;

            default:
                context = "No specific data found for this intent.";
        }

        console.log(`Context Length: ${context.length} characters`);

        // 5. Final Response
        const response = await responderChain.invoke({
            query: refinedQuery,
            intent: safeIntent,
            context: context
        });

        return response;

    } catch (error: any) {
        console.error("Error in processMessage:", error?.message || error);
        return "I'm having trouble connecting to the server right now. Please try again later.";
    }
}

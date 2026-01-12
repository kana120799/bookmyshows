import "dotenv/config";
import { bookingExtractorChain } from "../lib/chatbot/extractors";

const QUERY = "Show me my current booking seats with hall name and cinema name";

async function test() {
    console.log(`Testing Extractor with query: "${QUERY}"`);
    const result = await bookingExtractorChain.invoke(QUERY);
    console.log("\n--- JSON OUTPUT ---");
    console.log(result);
}

test();

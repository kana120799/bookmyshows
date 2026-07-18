import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

async function run() {
    console.log("Testing Gemini API directly...");
    console.log("Key available:", !!process.env.GOOGLE_AI_KEY);
    console.log("Key length:", process.env.GOOGLE_AI_KEY?.length);

    const models = ["gemini-2.0-flash", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of models) {
        console.log(`Trying model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            console.log(`SUCCESS with ${modelName}:`, result.response.text());
            return;
        } catch (e: any) {
            console.log(`FAILED with ${modelName}: Hiding error for now to check next...`);
            // console.error(e); // Commented out to avoid clutter if just checking key
        }
    }
}

run();

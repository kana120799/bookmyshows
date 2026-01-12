import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { VectorStore } from "@langchain/core/vectorstores";
import { TaskType } from "@google/generative-ai";

// Custom Memory Vector Store Implementation
class SimpleMemoryVectorStore extends VectorStore {
    memoryVectors: { content: string; embedding: number[]; metadata: Record<string, any> }[] = [];

    _vectorstoreType(): string {
        return "memory";
    }

    async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
        const memoryVectors = vectors.map((embedding, idx) => ({
            content: documents[idx].pageContent,
            embedding,
            metadata: documents[idx].metadata,
        }));
        this.memoryVectors = this.memoryVectors.concat(memoryVectors);
    }

    async addDocuments(documents: Document[]): Promise<void> {
        // Simple batching
        const texts = documents.map(({ pageContent }) => pageContent);
        try {
            const embeddings = await this.embeddings.embedDocuments(texts);
            await this.addVectors(embeddings, documents);
        } catch (error) {
            console.error("Error embedding documents:", error);
        }
    }

    async similaritySearchVectorWithScore(
        query: number[],
        k: number
    ): Promise<[Document, number][]> {
        const searches = this.memoryVectors.map((vector, index) => ({
            similarity: this.cosineSimilarity(query, vector.embedding),
            index,
        }));

        searches.sort((a, b) => b.similarity - a.similarity);

        return searches.slice(0, k).map(({ index, similarity }) => [
            new Document({
                pageContent: this.memoryVectors[index].content,
                metadata: this.memoryVectors[index].metadata,
            }),
            similarity,
        ]);
    }

    cosineSimilarity(a: number[], b: number[]): number {
        let dot = 0, mA = 0, mB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            mA += a[i] * a[i];
            mB += b[i] * b[i];
        }
        return dot / (Math.sqrt(mA) * Math.sqrt(mB));
    }

    static async fromDocuments(
        docs: Document[],
        embeddings: GoogleGenerativeAIEmbeddings
    ): Promise<SimpleMemoryVectorStore> {
        const store = new SimpleMemoryVectorStore(embeddings, {});
        await store.addDocuments(docs);
        return store;
    }
}

const apiKey = process.env.GOOGLE_AI_KEY;
if (!apiKey) throw new Error("GOOGLE_AI_KEY is missing");

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/text-embedding-004",
    apiKey: apiKey,
    taskType: TaskType.RETRIEVAL_DOCUMENT,
});

let vectorStore: SimpleMemoryVectorStore | null = null;

// Initialize with Static Policy / FAQ Data
export const initializeVectorStore = async () => {
    if (vectorStore) return vectorStore;
    console.log("Initializing Static Vector Store...");

    const docs: Document[] = [
        new Document({
            pageContent: `FAQ: How to book a ticket?
Answer: Select a city (we mainly operate in Metro cities like Mumbai, Delhi, Bangalore), choose a movie, select a cinema and showtime, choose your seats, and proceed to payment via Card or UPI.`,
            metadata: { type: "faq" },
        }),
        new Document({
            pageContent: `FAQ: What is BookingStatus?
Answer: PENDING means you are selecting seats. CONFIRMED means payment is successful and ticket is booked. CANCELED means the booking was aborted or payment failed.`,
            metadata: { type: "faq" },
        }),
        new Document({
            pageContent: `Policy: Cancellation and Refunds
Answer: Tickets once booked cannot be cancelled or refunded manually. However, if a show is cancelled by the cinema, a full refund will be processed within 5-7 working days.`,
            metadata: { type: "policy" },
        }),
        new Document({
            pageContent: `Policy: Age Limit
Answer: Children aged 3 years and above require a separate ticket. Some movies with 'A' certification are strictly for 18+ audiences.`,
            metadata: { type: "policy" },
        }),
        new Document({
            pageContent: `Pricing: Seat Types
Answer: We offer Regular, Premium, and VIP seats. VIP seats are recliners with food service. Premium gives the best viewing angle. Regular is budget friendly.`,
            metadata: { type: "info" },
        })
    ];

    vectorStore = await SimpleMemoryVectorStore.fromDocuments(docs, embeddings);
    console.log("Static Vector Store Initialized!");
    return vectorStore;
};

// Exposed function for the engine
export const searchKnowledgeBase = async (query: string) => {
    const store = await initializeVectorStore();
    const results = await store.similaritySearch(query, 2);

    if (!results || results.length === 0) return "";

    return results.map(doc => doc.pageContent).join("\n\n");
};

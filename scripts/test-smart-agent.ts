import "dotenv/config";
import { processMessage } from "../lib/chatbot/engine";
import { prisma } from "../lib/prisma";

async function testSmartAgent() {
    console.log("=== TESTING SMART AGENT ===");

    // Test 1: Complex Cinema Query
    console.log("\n1. Testing: 'Cinemas with more than 35 seats in Mumbai'");
    const res1 = await processMessage("Cinemas with more than 35 seats in Mumbai");
    console.log("Response:", res1);

    // Test 2: Recommendation Query
    console.log("\n2. Testing: 'Suggest me some Drama movies'");
    const res2 = await processMessage("Suggest me some Drama movies");
    console.log("Response:", res2);

    // Test 3: Booking History (Mocked User)
    // Create a mock booking first
    console.log("\n3. Testing: 'Show my confirmed bookings'");
    const user = await prisma.user.create({
        data: {
            id: "user-123",
            name: "Test User",
            email: `test-${Date.now()}@test.com`,
        }
    }).catch(() => null); // Ignore if exists

    // Create a dummy booking for this user if possible, or just expect "No bookings"
    // For now we just check if it routes correctly without crashing
    const res3 = await processMessage("Show my confirmed bookings");
    console.log("Response:", res3);

    console.log("\n=== TEST COMPLETE ===");
}

testSmartAgent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

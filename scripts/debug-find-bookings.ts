import "dotenv/config";
import { findBookings } from "../lib/chatbot/tools";

const USER_ID = "aa2d9249-90b3-495a-875e-4814c20f073a"; // Ankit's ID from logs

async function test() {
    console.log(`Testing findBookings for user: ${USER_ID}`);
    const result = await findBookings(USER_ID, { status: "CONFIRMED" });
    console.log("Result:", result);
}

test();

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { findMovies, findCinemas } from "../lib/chatbot/tools";

async function checkData() {
    console.log("--- CHECKING DB CONTENT ---");
    const movieCount = await prisma.movie.count();
    const cinemaCount = await prisma.cinema.count();
    console.log(`Movies in DB: ${movieCount}`);
    console.log(`Cinemas in DB: ${cinemaCount}`);

    if (cinemaCount > 0) {
        const c = await prisma.cinema.findFirst({ include: { address: true } });
        console.log("Sample Cinema:", JSON.stringify(c, null, 2));
    }

    if (movieCount > 0) {
        const m = await prisma.movie.findFirst();
        console.log("Sample Movie:", JSON.stringify(m, null, 2));
    }

    console.log("\n--- REPRODUCING USER ISSUE ---");

    // User Query 1: "NAME OF CINEMA LOCATE IN MUMBAI"
    // Expected: Should pass "Mumbai" to DB, but currently passes full string
    const query1 = "NAME OF CINEMA LOCATE IN MUMBAI";
    console.log(`Query: "${query1}"`);
    const res1 = await findCinemas(query1);
    console.log(`Result with FULL string: ${res1.substring(0, 100)}...`);

    const res1_fixed = await findCinemas("Mumbai");
    console.log(`Result with ONLY "Mumbai": ${res1_fixed.substring(0, 100)}...`);

    // User Query 2: "LIST 5 DRAMA MOVIES"
    const query2 = "LIST 5 DRAMA MOVIES";
    console.log(`\nQuery: "${query2}"`);
    const res2 = await findMovies(query2);
    console.log(`Result with FULL string: ${res2.substring(0, 100)}...`);

    const res2_fixed = await findMovies("Drama");
    console.log(`Result with ONLY "Drama": ${res2_fixed.substring(0, 100)}...`);
}

checkData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

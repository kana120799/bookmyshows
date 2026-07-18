import "dotenv/config";
import { prisma } from "../lib/prisma";

async function checkBookings() {
    console.log("=== CHECKING LATEST BOOKINGS ===");

    const bookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { id: 'desc' }, // Assuming ID is not sortable by time, checking if we have created_at
        // Actually earlier schemas didn't show created_at on Booking. 
        // Let's rely on Payment or Show time, or just take simple latest.
        include: { user: true, show: true }
    });

    console.log(`Found ${bookings.length} bookings.`);

    bookings.forEach(b => {
        console.log(`Booking: ${b.id.substring(0, 8)} | User: ${b.userId.substring(0, 8)} | Status: ${b.status}`);
    });
}

checkBookings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

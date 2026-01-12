-- CreateTable
CREATE TABLE "TempBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "seatIds" TEXT[],
    "total" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempBooking_pkey" PRIMARY KEY ("id")
);

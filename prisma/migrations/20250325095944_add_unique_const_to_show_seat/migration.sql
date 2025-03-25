/*
  Warnings:

  - A unique constraint covering the columns `[showSeatId]` on the table `BookingSeat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookingSeat_showSeatId_key" ON "BookingSeat"("showSeatId");

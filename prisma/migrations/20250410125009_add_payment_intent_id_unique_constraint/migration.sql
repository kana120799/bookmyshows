/*
  Warnings:

  - You are about to drop the column `version` on the `ShowSeat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentIntentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ShowSeat_showId_row_column_key";

-- AlterTable
ALTER TABLE "ShowSeat" DROP COLUMN "version";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE INDEX "ShowSeat_showId_status_idx" ON "ShowSeat"("showId", "status");

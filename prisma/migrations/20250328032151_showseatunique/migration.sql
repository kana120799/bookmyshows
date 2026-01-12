/*
  Warnings:

  - A unique constraint covering the columns `[showId,row,column]` on the table `ShowSeat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ShowSeat_showId_row_column_key" ON "ShowSeat"("showId", "row", "column");

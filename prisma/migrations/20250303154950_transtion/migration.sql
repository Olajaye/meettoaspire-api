/*
  Warnings:

  - Added the required column `Userid` to the `BookingSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookingSession" ADD COLUMN     "Userid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BookingSession" ADD CONSTRAINT "BookingSession_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

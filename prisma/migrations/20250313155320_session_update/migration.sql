/*
  Warnings:

  - You are about to drop the column `bookingid` on the `ScheduleSession` table. All the data in the column will be lost.
  - Added the required column `sessionScheduled` to the `BookingSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduleSession" DROP CONSTRAINT "ScheduleSession_bookingid_fkey";

-- DropIndex
DROP INDEX "ScheduleSession_bookingid_key";

-- AlterTable
ALTER TABLE "BookingSession" ADD COLUMN     "sessionScheduled" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleSession" DROP COLUMN "bookingid";

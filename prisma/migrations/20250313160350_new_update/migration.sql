-- AlterTable
ALTER TABLE "BookingSession" ALTER COLUMN "sessionScheduled" DROP NOT NULL,
ALTER COLUMN "sessionScheduled" SET DEFAULT false;

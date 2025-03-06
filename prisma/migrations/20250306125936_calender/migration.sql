-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ALL', 'ONLINESESSION', 'PHYSICAL');

-- CreateTable
CREATE TABLE "ScheduleSession" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "type" "SessionType" NOT NULL,
    "date" TIMESTAMP(3),
    "time" TEXT,
    "description" TEXT,
    "UserId" TEXT NOT NULL,
    "sessionRefrences" TEXT NOT NULL,
    "aspirantId" TEXT NOT NULL,

    CONSTRAINT "ScheduleSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScheduleSession" ADD CONSTRAINT "ScheduleSession_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "BookingSession" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'NGN',
    "transactionStatus" TEXT DEFAULT 'PENDING',
    "aspirantEmail" TEXT,
    "status" TEXT NOT NULL,
    "expertEmail" TEXT,
    "transactionReference" TEXT,
    "paymentLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingSession_pkey" PRIMARY KEY ("id")
);

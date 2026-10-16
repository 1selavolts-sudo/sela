-- CreateEnum
CREATE TYPE "MomoPaymentStatus" AS ENUM ('CREATED', 'REQUESTED', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "MomoPayment" (
    "id" TEXT NOT NULL,
    "chargerId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amountRwf" INTEGER NOT NULL,
    "pricePerKwh" DOUBLE PRECISION NOT NULL,
    "energyEstimateKwh" DOUBLE PRECISION NOT NULL,
    "status" "MomoPaymentStatus" NOT NULL DEFAULT 'CREATED',
    "providerReference" TEXT NOT NULL,
    "providerReason" TEXT,
    "financialTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "MomoPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MomoPayment_providerReference_key" ON "MomoPayment"("providerReference");

-- CreateIndex
CREATE INDEX "MomoPayment_chargerId_idx" ON "MomoPayment"("chargerId");

-- CreateIndex
CREATE INDEX "MomoPayment_phone_createdAt_idx" ON "MomoPayment"("phone", "createdAt");

-- AddForeignKey
ALTER TABLE "MomoPayment" ADD CONSTRAINT "MomoPayment_chargerId_fkey" FOREIGN KEY ("chargerId") REFERENCES "Charger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

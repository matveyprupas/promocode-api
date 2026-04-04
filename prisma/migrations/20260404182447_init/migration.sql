-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- Enable case-insensitive text for email (see Activation.email @db.Citext)
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateTable
CREATE TABLE "promocodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "limit" INTEGER NOT NULL,
    "activationCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promocodes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "discount_check" CHECK ("discount" >= 1 AND "discount" <= 100),
    CONSTRAINT "limit_check" CHECK ("limit" > 0)
);

-- CreateTable
CREATE TABLE "activations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "promocodeId" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promocodes_code_key" ON "promocodes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "activations_promocodeId_email_key" ON "activations"("promocodeId", "email");

-- AddForeignKey
ALTER TABLE "activations" ADD CONSTRAINT "activations_promocodeId_fkey" FOREIGN KEY ("promocodeId") REFERENCES "promocodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

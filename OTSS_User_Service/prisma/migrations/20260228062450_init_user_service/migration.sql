-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('END_USER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('IT', 'BILLING', 'ACCESS', 'OTHER');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone_number" TEXT,
    "time_zone" TEXT,
    "preferred_language" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'END_USER',
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportStaffStatus" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "current_load" INTEGER NOT NULL DEFAULT 0,
    "max_load" INTEGER NOT NULL DEFAULT 5,
    "categories" "TicketCategory"[] DEFAULT ARRAY[]::"TicketCategory"[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportStaffStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SupportStaffStatus_profileId_key" ON "SupportStaffStatus"("profileId");

-- AddForeignKey
ALTER TABLE "SupportStaffStatus" ADD CONSTRAINT "SupportStaffStatus_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

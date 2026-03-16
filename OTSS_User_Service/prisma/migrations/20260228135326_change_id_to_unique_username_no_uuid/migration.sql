/*
  Warnings:

  - The primary key for the `UserProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "SupportStaffStatus" DROP CONSTRAINT "SupportStaffStatus_profileId_fkey";

-- AlterTable
ALTER TABLE "SupportStaffStatus" ALTER COLUMN "profileId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "SupportStaffStatus" ADD CONSTRAINT "SupportStaffStatus_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

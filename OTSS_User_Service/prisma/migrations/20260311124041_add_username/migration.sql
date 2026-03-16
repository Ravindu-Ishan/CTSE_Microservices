/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");

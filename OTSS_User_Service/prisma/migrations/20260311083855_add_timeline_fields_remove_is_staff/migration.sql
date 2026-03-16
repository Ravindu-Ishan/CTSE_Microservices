/*
  Warnings:

  - You are about to drop the column `isStaff` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "isStaff",
ADD COLUMN     "last_credential_update_at" TIMESTAMP(3),
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "last_registration_at" TIMESTAMP(3),
ADD COLUMN     "last_session_activity_at" TIMESTAMP(3),
ADD COLUMN     "last_token_issued_at" TIMESTAMP(3),
ADD COLUMN     "last_token_revoked_at" TIMESTAMP(3);

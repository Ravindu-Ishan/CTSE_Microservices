-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TICKET_CREATED', 'TICKET_REPLY', 'TICKET_CLOSED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "recipient_user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
    "error_message" TEXT,
    "subject" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_logs_ticket_id_idx" ON "notification_logs"("ticket_id");

-- CreateIndex
CREATE INDEX "notification_logs_recipient_user_id_idx" ON "notification_logs"("recipient_user_id");

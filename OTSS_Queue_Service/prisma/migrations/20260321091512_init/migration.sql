-- CreateEnum
CREATE TYPE "QueueEntryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('IT', 'BILLING', 'ACCESS', 'OTHER');

-- CreateTable
CREATE TABLE "queue_entries" (
    "id" UUID NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "ticket_priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "ticket_category" "TicketCategory" NOT NULL,
    "created_by" TEXT NOT NULL,
    "assigned_staff_id" TEXT,
    "status" "QueueEntryStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "queue_entries_ticket_id_key" ON "queue_entries"("ticket_id");

-- CreateIndex
CREATE INDEX "queue_entries_status_idx" ON "queue_entries"("status");

-- CreateIndex
CREATE INDEX "queue_entries_ticket_priority_idx" ON "queue_entries"("ticket_priority");

-- CreateIndex
CREATE INDEX "queue_entries_assigned_staff_id_idx" ON "queue_entries"("assigned_staff_id");

-- CreateEnum
CREATE TYPE "CheckInFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "checkInFrequency" "CheckInFrequency" NOT NULL DEFAULT 'WEEKLY';

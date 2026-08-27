-- Why a drawing could not be produced, so a failure is not reported as a bare state.

-- AlterTable
ALTER TABLE "postcard" ADD COLUMN     "failureReason" TEXT;

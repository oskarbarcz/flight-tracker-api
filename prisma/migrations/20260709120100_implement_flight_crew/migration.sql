-- CreateEnum
CREATE TYPE "CrewRole" AS ENUM ('fo', 'pu', 'fa');

-- CreateTable
CREATE TABLE "crew" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "operatorId" UUID NOT NULL,
    "role" "CrewRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crew_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crew_operatorId_role_name_key" ON "crew"("operatorId", "role", "name");

-- AddForeignKey
ALTER TABLE "crew" ADD CONSTRAINT "crew_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

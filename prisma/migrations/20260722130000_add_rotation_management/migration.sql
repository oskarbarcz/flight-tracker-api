-- CreateTable
CREATE TABLE "rotation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "operatorId" UUID NOT NULL,
    "pilotId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" UUID NOT NULL,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "rotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotation_leg" (
    "id" UUID NOT NULL,
    "rotationId" UUID NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "departureId" UUID NOT NULL,
    "arrivalId" UUID NOT NULL,
    "offBlockTime" TIMESTAMP(3) NOT NULL,
    "onBlockTime" TIMESTAMP(3) NOT NULL,
    "flightId" UUID,

    CONSTRAINT "rotation_leg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rotation_operatorId_idx" ON "rotation"("operatorId");

-- CreateIndex
CREATE INDEX "rotation_pilotId_idx" ON "rotation"("pilotId");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_leg_flightId_key" ON "rotation_leg"("flightId");

-- CreateIndex
CREATE INDEX "rotation_leg_rotationId_idx" ON "rotation_leg"("rotationId");

-- CreateIndex
CREATE INDEX "rotation_leg_flightId_idx" ON "rotation_leg"("flightId");

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation" ADD CONSTRAINT "rotation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation_leg" ADD CONSTRAINT "rotation_leg_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "rotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation_leg" ADD CONSTRAINT "rotation_leg_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation_leg" ADD CONSTRAINT "rotation_leg_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation_leg" ADD CONSTRAINT "rotation_leg_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

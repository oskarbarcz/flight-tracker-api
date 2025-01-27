-- CreateTable
CREATE TABLE "jwt_refresh_token" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jwt_refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jwt_refresh_token_token_key" ON "jwt_refresh_token"("token");

-- AddForeignKey
ALTER TABLE "jwt_refresh_token" ADD CONSTRAINT "jwt_refresh_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

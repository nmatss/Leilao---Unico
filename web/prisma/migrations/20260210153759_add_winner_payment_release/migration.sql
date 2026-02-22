-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" TEXT,
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ADD COLUMN     "releaseStatus" TEXT,
ADD COLUMN     "winnerId" TEXT;

-- CreateIndex
CREATE INDEX "Item_winnerId_idx" ON "Item"("winnerId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

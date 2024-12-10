-- AlterTable
ALTER TABLE "Configuration" ADD COLUMN "priceAdjustment" TEXT NOT NULL DEFAULT 'price_decrease';
ALTER TABLE "Configuration" ADD COLUMN "percentage" TEXT NOT NULL DEFAULT '0'; 
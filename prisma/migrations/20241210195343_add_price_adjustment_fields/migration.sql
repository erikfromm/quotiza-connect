-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Configuration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "importFrequency" TEXT NOT NULL DEFAULT 'manual',
    "priceAdjustment" TEXT NOT NULL DEFAULT 'price_decrease',
    "percentage" TEXT NOT NULL DEFAULT '0',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Configuration" ("accountId", "apiKey", "createdAt", "id", "importFrequency", "shop", "updatedAt") SELECT "accountId", "apiKey", "createdAt", "id", "importFrequency", "shop", "updatedAt" FROM "Configuration";
DROP TABLE "Configuration";
ALTER TABLE "new_Configuration" RENAME TO "Configuration";
CREATE UNIQUE INDEX "Configuration_shop_key" ON "Configuration"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

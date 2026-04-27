-- CreateTable
CREATE TABLE "InventoryCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryCategory_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "quantityOnHand" REAL NOT NULL DEFAULT 0,
    "reorderPoint" REAL,
    "unit" TEXT,
    "location" TEXT,
    "supplier" TEXT,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RigAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "capacity" TEXT,
    "serialNumber" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RigAsset_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrewMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "shift" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrewMember_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrewRide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "vehicleType" TEXT,
    "driverName" TEXT,
    "passengerCapacity" INTEGER,
    "plateNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrewRide_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InventoryCategory_rigId_idx" ON "InventoryCategory"("rigId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCategory_rigId_name_key" ON "InventoryCategory"("rigId", "name");

-- CreateIndex
CREATE INDEX "InventoryItem_rigId_idx" ON "InventoryItem"("rigId");

-- CreateIndex
CREATE INDEX "InventoryItem_categoryId_idx" ON "InventoryItem"("categoryId");

-- CreateIndex
CREATE INDEX "InventoryItem_rigId_name_idx" ON "InventoryItem"("rigId", "name");

-- CreateIndex
CREATE INDEX "InventoryItem_quantityOnHand_idx" ON "InventoryItem"("quantityOnHand");

-- CreateIndex
CREATE INDEX "RigAsset_rigId_idx" ON "RigAsset"("rigId");

-- CreateIndex
CREATE INDEX "RigAsset_rigId_kind_idx" ON "RigAsset"("rigId", "kind");

-- CreateIndex
CREATE INDEX "RigAsset_rigId_status_idx" ON "RigAsset"("rigId", "status");

-- CreateIndex
CREATE INDEX "CrewMember_rigId_idx" ON "CrewMember"("rigId");

-- CreateIndex
CREATE INDEX "CrewMember_rigId_isActive_idx" ON "CrewMember"("rigId", "isActive");

-- CreateIndex
CREATE INDEX "CrewMember_name_idx" ON "CrewMember"("name");

-- CreateIndex
CREATE INDEX "CrewRide_rigId_idx" ON "CrewRide"("rigId");

-- CreateIndex
CREATE INDEX "CrewRide_driverName_idx" ON "CrewRide"("driverName");

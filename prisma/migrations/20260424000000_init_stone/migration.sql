-- CreateTable
CREATE TABLE "Rig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rigNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Standby',
    "operator" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RigSystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Good',
    "description" TEXT,
    "lastInspectedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RigSystem_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "serialNumber" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tool_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "systemId" TEXT,
    "toolId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "dueAt" DATETIME,
    "intervalDays" INTEGER,
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceTask_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceTask_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "RigSystem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceTask_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepairTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rigId" TEXT NOT NULL,
    "systemId" TEXT,
    "toolId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "description" TEXT,
    "neededParts" TEXT,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepairTicket_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "Rig" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RepairTicket_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "RigSystem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RepairTicket_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Rig_status_idx" ON "Rig"("status");

-- CreateIndex
CREATE INDEX "Rig_name_idx" ON "Rig"("name");

-- CreateIndex
CREATE INDEX "RigSystem_rigId_idx" ON "RigSystem"("rigId");

-- CreateIndex
CREATE INDEX "RigSystem_rigId_kind_idx" ON "RigSystem"("rigId", "kind");

-- CreateIndex
CREATE INDEX "RigSystem_rigId_status_idx" ON "RigSystem"("rigId", "status");

-- CreateIndex
CREATE INDEX "Tool_rigId_idx" ON "Tool"("rigId");

-- CreateIndex
CREATE INDEX "Tool_rigId_category_idx" ON "Tool"("rigId", "category");

-- CreateIndex
CREATE INDEX "Tool_rigId_status_idx" ON "Tool"("rigId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceTask_rigId_idx" ON "MaintenanceTask"("rigId");

-- CreateIndex
CREATE INDEX "MaintenanceTask_systemId_idx" ON "MaintenanceTask"("systemId");

-- CreateIndex
CREATE INDEX "MaintenanceTask_toolId_idx" ON "MaintenanceTask"("toolId");

-- CreateIndex
CREATE INDEX "MaintenanceTask_status_idx" ON "MaintenanceTask"("status");

-- CreateIndex
CREATE INDEX "MaintenanceTask_priority_idx" ON "MaintenanceTask"("priority");

-- CreateIndex
CREATE INDEX "MaintenanceTask_dueAt_idx" ON "MaintenanceTask"("dueAt");

-- CreateIndex
CREATE INDEX "RepairTicket_rigId_idx" ON "RepairTicket"("rigId");

-- CreateIndex
CREATE INDEX "RepairTicket_systemId_idx" ON "RepairTicket"("systemId");

-- CreateIndex
CREATE INDEX "RepairTicket_toolId_idx" ON "RepairTicket"("toolId");

-- CreateIndex
CREATE INDEX "RepairTicket_status_idx" ON "RepairTicket"("status");

-- CreateIndex
CREATE INDEX "RepairTicket_priority_idx" ON "RepairTicket"("priority");

-- CreateIndex
CREATE INDEX "RepairTicket_openedAt_idx" ON "RepairTicket"("openedAt");

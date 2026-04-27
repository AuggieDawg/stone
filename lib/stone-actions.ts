"use server";

import {
  HealthStatus,
  Priority,
  RigAssetKind,
  RigAssetStatus,
  RigStatus,
  SystemKind,
  ToolStatus,
  WorkStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function createRigAction(formData: FormData) {
  const rig = await prisma.rig.create({
    data: {
      name: requiredText(formData, "name", "Rig name"),
      rigNumber: optionalText(formData, "rigNumber"),
      status: enumValue(formData, "status", RigStatus.Standby, Object.values(RigStatus)),
      operator: optionalText(formData, "operator"),
      location: optionalText(formData, "location"),
      imageUrl: optionalText(formData, "imageUrl"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidatePath("/");
  redirect(`/rigs/${rig.id}`);
}

export async function updateRigDetailsAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.rig.update({
    where: { id: rigId },
    data: {
      name: requiredText(formData, "name", "Rig name"),
      rigNumber: optionalText(formData, "rigNumber"),
      status: enumValue(formData, "status", RigStatus.Standby, Object.values(RigStatus)),
      operator: optionalText(formData, "operator"),
      location: optionalText(formData, "location"),
      imageUrl: optionalText(formData, "imageUrl"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function deleteRigAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.rig.delete({
    where: { id: rigId },
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateRigStatusAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.rig.update({
    where: { id: rigId },
    data: {
      status: enumValue(formData, "status", RigStatus.Standby, Object.values(RigStatus)),
    },
  });

  revalidateRig(rigId);
}

export async function createRigSystemAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.rigSystem.create({
    data: {
      rigId,
      kind: enumValue(formData, "kind", SystemKind.Other, Object.values(SystemKind)),
      name: requiredText(formData, "name", "System name"),
      status: enumValue(formData, "status", HealthStatus.Good, Object.values(HealthStatus)),
      description: optionalText(formData, "description"),
      lastInspectedAt: dateOrNull(formData, "lastInspectedAt"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateRigSystemAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const systemId = requiredText(formData, "systemId", "System ID");

  await prisma.rigSystem.update({
    where: { id: systemId },
    data: {
      kind: enumValue(formData, "kind", SystemKind.Other, Object.values(SystemKind)),
      name: requiredText(formData, "name", "System name"),
      status: enumValue(formData, "status", HealthStatus.Good, Object.values(HealthStatus)),
      description: optionalText(formData, "description"),
      lastInspectedAt: dateOrNull(formData, "lastInspectedAt"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateRigSystemStatusAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const systemId = requiredText(formData, "systemId", "System ID");

  await prisma.rigSystem.update({
    where: { id: systemId },
    data: {
      status: enumValue(formData, "status", HealthStatus.Good, Object.values(HealthStatus)),
      lastInspectedAt: new Date(),
    },
  });

  revalidateRig(rigId);
}

export async function deleteRigSystemAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const systemId = requiredText(formData, "systemId", "System ID");

  await prisma.rigSystem.delete({
    where: { id: systemId },
  });

  revalidateRig(rigId);
}

export async function createToolAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.tool.create({
    data: {
      rigId,
      name: requiredText(formData, "name", "Tool name"),
      category: optionalText(formData, "category"),
      status: enumValue(formData, "status", ToolStatus.Available, Object.values(ToolStatus)),
      serialNumber: optionalText(formData, "serialNumber"),
      location: optionalText(formData, "location"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateToolAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const toolId = requiredText(formData, "toolId", "Tool ID");

  await prisma.tool.update({
    where: { id: toolId },
    data: {
      name: requiredText(formData, "name", "Tool name"),
      category: optionalText(formData, "category"),
      status: enumValue(formData, "status", ToolStatus.Available, Object.values(ToolStatus)),
      serialNumber: optionalText(formData, "serialNumber"),
      location: optionalText(formData, "location"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateToolStatusAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const toolId = requiredText(formData, "toolId", "Tool ID");

  await prisma.tool.update({
    where: { id: toolId },
    data: {
      status: enumValue(formData, "status", ToolStatus.Available, Object.values(ToolStatus)),
    },
  });

  revalidateRig(rigId);
}

export async function deleteToolAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const toolId = requiredText(formData, "toolId", "Tool ID");

  await prisma.tool.delete({
    where: { id: toolId },
  });

  revalidateRig(rigId);
}

export async function createInventoryCategoryAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.inventoryCategory.create({
    data: {
      rigId,
      name: requiredText(formData, "name", "Category name"),
      description: optionalText(formData, "description"),
    },
  });

  revalidateRig(rigId);
}

export async function updateInventoryCategoryAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const categoryId = requiredText(formData, "categoryId", "Category ID");

  await prisma.inventoryCategory.update({
    where: { id: categoryId },
    data: {
      name: requiredText(formData, "name", "Category name"),
      description: optionalText(formData, "description"),
    },
  });

  revalidateRig(rigId);
}

export async function deleteInventoryCategoryAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const categoryId = requiredText(formData, "categoryId", "Category ID");

  await prisma.inventoryCategory.delete({
    where: { id: categoryId },
  });

  revalidateRig(rigId);
}

export async function createInventoryItemAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.inventoryItem.create({
    data: {
      rigId,
      categoryId: optionalText(formData, "categoryId"),
      name: requiredText(formData, "name", "Inventory item"),
      quantityOnHand: numberOrDefault(formData, "quantityOnHand", 0),
      reorderPoint: numberOrNull(formData, "reorderPoint"),
      unit: optionalText(formData, "unit"),
      location: optionalText(formData, "location"),
      supplier: optionalText(formData, "supplier"),
      isCritical: formData.get("isCritical") === "true",
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateInventoryItemAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const itemId = requiredText(formData, "itemId", "Inventory item ID");

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      categoryId: optionalText(formData, "categoryId"),
      name: requiredText(formData, "name", "Inventory item"),
      quantityOnHand: numberOrDefault(formData, "quantityOnHand", 0),
      reorderPoint: numberOrNull(formData, "reorderPoint"),
      unit: optionalText(formData, "unit"),
      location: optionalText(formData, "location"),
      supplier: optionalText(formData, "supplier"),
      isCritical: formData.get("isCritical") === "true",
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function adjustInventoryItemAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const itemId = requiredText(formData, "itemId", "Inventory item ID");
  const adjustment = numberOrDefault(formData, "adjustment", 0);

  const item = await prisma.inventoryItem.findFirst({
    where: { id: itemId, rigId },
    select: { id: true, quantityOnHand: true },
  });

  if (!item) {
    throw new Error("Inventory item was not found.");
  }

  await prisma.inventoryItem.update({
    where: { id: item.id },
    data: {
      quantityOnHand: Math.max(item.quantityOnHand + adjustment, 0),
    },
  });

  revalidateRig(rigId);
}

export async function deleteInventoryItemAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const itemId = requiredText(formData, "itemId", "Inventory item ID");

  await prisma.inventoryItem.delete({
    where: { id: itemId },
  });

  revalidateRig(rigId);
}

export async function createRigAssetAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.rigAsset.create({
    data: {
      rigId,
      kind: enumValue(formData, "kind", RigAssetKind.Other, Object.values(RigAssetKind)),
      name: requiredText(formData, "name", "Asset name"),
      status: enumValue(formData, "status", RigAssetStatus.Available, Object.values(RigAssetStatus)),
      quantity: integerOrDefault(formData, "quantity", 1),
      capacity: optionalText(formData, "capacity"),
      serialNumber: optionalText(formData, "serialNumber"),
      location: optionalText(formData, "location"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateRigAssetAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const assetId = requiredText(formData, "assetId", "Asset ID");

  await prisma.rigAsset.update({
    where: { id: assetId },
    data: {
      kind: enumValue(formData, "kind", RigAssetKind.Other, Object.values(RigAssetKind)),
      name: requiredText(formData, "name", "Asset name"),
      status: enumValue(formData, "status", RigAssetStatus.Available, Object.values(RigAssetStatus)),
      quantity: integerOrDefault(formData, "quantity", 1),
      capacity: optionalText(formData, "capacity"),
      serialNumber: optionalText(formData, "serialNumber"),
      location: optionalText(formData, "location"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateRigAssetStatusAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const assetId = requiredText(formData, "assetId", "Asset ID");

  await prisma.rigAsset.update({
    where: { id: assetId },
    data: {
      status: enumValue(formData, "status", RigAssetStatus.Available, Object.values(RigAssetStatus)),
    },
  });

  revalidateRig(rigId);
}

export async function deleteRigAssetAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const assetId = requiredText(formData, "assetId", "Asset ID");

  await prisma.rigAsset.delete({
    where: { id: assetId },
  });

  revalidateRig(rigId);
}

export async function createCrewMemberAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.crewMember.create({
    data: {
      rigId,
      name: requiredText(formData, "name", "Crew member name"),
      role: optionalText(formData, "role"),
      phone: optionalText(formData, "phone"),
      shift: optionalText(formData, "shift"),
      notes: optionalText(formData, "notes"),
      isActive: formData.get("isActive") !== "false",
    },
  });

  revalidateRig(rigId);
}

export async function updateCrewMemberAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const crewMemberId = requiredText(formData, "crewMemberId", "Crew member ID");

  await prisma.crewMember.update({
    where: { id: crewMemberId },
    data: {
      name: requiredText(formData, "name", "Crew member name"),
      role: optionalText(formData, "role"),
      phone: optionalText(formData, "phone"),
      shift: optionalText(formData, "shift"),
      notes: optionalText(formData, "notes"),
      isActive: formData.get("isActive") === "true",
    },
  });

  revalidateRig(rigId);
}

export async function deleteCrewMemberAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const crewMemberId = requiredText(formData, "crewMemberId", "Crew member ID");

  await prisma.crewMember.delete({
    where: { id: crewMemberId },
  });

  revalidateRig(rigId);
}

export async function createCrewRideAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.crewRide.create({
    data: {
      rigId,
      vehicleName: requiredText(formData, "vehicleName", "Vehicle name"),
      vehicleType: optionalText(formData, "vehicleType"),
      driverName: optionalText(formData, "driverName"),
      passengerCapacity: integerOrNull(formData, "passengerCapacity"),
      plateNumber: optionalText(formData, "plateNumber"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateCrewRideAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const crewRideId = requiredText(formData, "crewRideId", "Crew ride ID");

  await prisma.crewRide.update({
    where: { id: crewRideId },
    data: {
      vehicleName: requiredText(formData, "vehicleName", "Vehicle name"),
      vehicleType: optionalText(formData, "vehicleType"),
      driverName: optionalText(formData, "driverName"),
      passengerCapacity: integerOrNull(formData, "passengerCapacity"),
      plateNumber: optionalText(formData, "plateNumber"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function deleteCrewRideAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const crewRideId = requiredText(formData, "crewRideId", "Crew ride ID");

  await prisma.crewRide.delete({
    where: { id: crewRideId },
  });

  revalidateRig(rigId);
}

export async function createMaintenanceTaskAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.maintenanceTask.create({
    data: {
      rigId,
      systemId: optionalText(formData, "systemId"),
      toolId: optionalText(formData, "toolId"),
      title: requiredText(formData, "title", "Maintenance title"),
      status: enumValue(formData, "status", WorkStatus.Open, Object.values(WorkStatus)),
      priority: enumValue(formData, "priority", Priority.Medium, Object.values(Priority)),
      dueAt: dateOrNull(formData, "dueAt"),
      intervalDays: integerOrNull(formData, "intervalDays"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRig(rigId);
}

export async function updateMaintenanceTaskAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const taskId = requiredText(formData, "taskId", "Maintenance task ID");
  const status = enumValue(formData, "status", WorkStatus.Open, Object.values(WorkStatus));

  await prisma.maintenanceTask.update({
    where: { id: taskId },
    data: {
      systemId: optionalText(formData, "systemId"),
      toolId: optionalText(formData, "toolId"),
      title: requiredText(formData, "title", "Maintenance title"),
      status,
      priority: enumValue(formData, "priority", Priority.Medium, Object.values(Priority)),
      dueAt: dateOrNull(formData, "dueAt"),
      intervalDays: integerOrNull(formData, "intervalDays"),
      notes: optionalText(formData, "notes"),
      completedAt: status === WorkStatus.Complete ? new Date() : null,
    },
  });

  revalidateRig(rigId);
}

export async function updateMaintenanceStatusAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const taskId = requiredText(formData, "taskId", "Maintenance task ID");
  const status = enumValue(formData, "status", WorkStatus.Open, Object.values(WorkStatus));

  await prisma.maintenanceTask.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === WorkStatus.Complete ? new Date() : null,
    },
  });

  revalidateRig(rigId);
}

export async function deleteMaintenanceTaskAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const taskId = requiredText(formData, "taskId", "Maintenance task ID");

  await prisma.maintenanceTask.delete({
    where: { id: taskId },
  });

  revalidateRig(rigId);
}

export async function createRepairTicketAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");

  await prisma.repairTicket.create({
    data: {
      rigId,
      systemId: optionalText(formData, "systemId"),
      toolId: optionalText(formData, "toolId"),
      title: requiredText(formData, "title", "Repair title"),
      status: enumValue(formData, "status", WorkStatus.Open, Object.values(WorkStatus)),
      priority: enumValue(formData, "priority", Priority.Medium, Object.values(Priority)),
      description: optionalText(formData, "description"),
      neededParts: optionalText(formData, "neededParts"),
    },
  });

  revalidateRig(rigId);
}

export async function updateRepairTicketAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const ticketId = requiredText(formData, "ticketId", "Repair ticket ID");
  const status = enumValue(formData, "status", WorkStatus.Open, Object.values(WorkStatus));

  await prisma.repairTicket.update({
    where: { id: ticketId },
    data: {
      systemId: optionalText(formData, "systemId"),
      toolId: optionalText(formData, "toolId"),
      title: requiredText(formData, "title", "Repair title"),
      status,
      priority: enumValue(formData, "priority", Priority.Medium, Object.values(Priority)),
      description: optionalText(formData, "description"),
      neededParts: optionalText(formData, "neededParts"),
      resolvedAt: status === WorkStatus.Complete ? new Date() : null,
    },
  });

  revalidateRig(rigId);
}

export async function updateRepairStatusAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const ticketId = requiredText(formData, "ticketId", "Repair ticket ID");
  const status = enumValue(formData, "status", WorkStatus.Open, Object.values(WorkStatus));

  await prisma.repairTicket.update({
    where: { id: ticketId },
    data: {
      status,
      resolvedAt: status === WorkStatus.Complete ? new Date() : null,
    },
  });

  revalidateRig(rigId);
}

export async function deleteRepairTicketAction(formData: FormData) {
  const rigId = requiredText(formData, "rigId", "Rig ID");
  const ticketId = requiredText(formData, "ticketId", "Repair ticket ID");

  await prisma.repairTicket.delete({
    where: { id: ticketId },
  });

  revalidateRig(rigId);
}

function revalidateRig(rigId: string) {
  revalidatePath("/");
  revalidatePath(`/rigs/${rigId}`);
}

function requiredText(formData: FormData, field: string, label: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text;
}

function optionalText(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function integerOrDefault(formData: FormData, field: string, fallback: number) {
  const value = formData.get(field);
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function integerOrNull(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;

  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberOrDefault(formData: FormData, field: string, fallback: number) {
  const value = formData.get(field);
  const parsed = typeof value === "string" ? Number.parseFloat(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numberOrNull(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;

  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateOrNull(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;

  const date = new Date(`${text}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function enumValue<T extends string>(
  formData: FormData,
  field: string,
  fallback: T,
  allowed: T[],
): T {
  const value = formData.get(field);
  if (typeof value !== "string") return fallback;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

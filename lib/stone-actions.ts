"use server";

import {
  HealthStatus,
  Priority,
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
      notes: optionalText(formData, "notes"),
    },
  });

  revalidatePath("/");
  redirect(`/rigs/${rig.id}`);
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

function integerOrNull(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;

  const parsed = Number.parseInt(text, 10);
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

import { notFound } from "next/navigation";
import { ToolStatus, WorkStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getStoneDashboard() {
  const [rigs, repairTickets, maintenanceTasks] = await prisma.$transaction([
    prisma.rig.findMany({
      orderBy: [{ updatedAt: "desc" }],
      include: {
        _count: {
          select: {
            systems: true,
            tools: true,
            maintenanceTasks: true,
            repairTickets: true,
          },
        },
        systems: {
          orderBy: [{ status: "desc" }, { name: "asc" }],
          take: 4,
        },
      },
    }),
    prisma.repairTicket.findMany({
      where: { status: { notIn: [WorkStatus.Complete, WorkStatus.Cancelled] } },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      take: 8,
      include: { rig: true, system: true, tool: true },
    }),
    prisma.maintenanceTask.findMany({
      where: { status: { notIn: [WorkStatus.Complete, WorkStatus.Cancelled] } },
      orderBy: [{ dueAt: "asc" }, { priority: "desc" }],
      take: 8,
      include: { rig: true, system: true, tool: true },
    }),
  ]);

  const systemsAtRisk = rigs.reduce(
    (count, rig) =>
      count + rig.systems.filter((system) => system.status !== "Good").length,
    0,
  );

  return {
    rigs,
    repairTickets,
    maintenanceTasks,
    metrics: {
      rigCount: rigs.length,
      activeRigs: rigs.filter((rig) => rig.status === "Active").length,
      openRepairs: repairTickets.length,
      openMaintenance: maintenanceTasks.length,
      systemsAtRisk,
    },
  };
}

export async function getRigCommandCenter(rigId: string) {
  const rig = await prisma.rig.findUnique({
    where: { id: rigId },
    include: {
      systems: {
        orderBy: [{ status: "desc" }, { kind: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { maintenanceTasks: true, repairTickets: true },
          },
        },
      },
      tools: {
        orderBy: [{ status: "desc" }, { category: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { maintenanceTasks: true, repairTickets: true },
          },
        },
      },
      maintenanceTasks: {
        orderBy: [{ status: "asc" }, { dueAt: "asc" }, { priority: "desc" }],
        include: { system: true, tool: true },
      },
      repairTickets: {
        orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
        include: { system: true, tool: true },
      },
      _count: {
        select: {
          systems: true,
          tools: true,
          maintenanceTasks: true,
          repairTickets: true,
        },
      },
    },
  });

  if (!rig) {
    notFound();
  }

  const openRepairs = rig.repairTickets.filter(
    (ticket) => !isClosedWorkStatus(ticket.status),
  );
  const openMaintenance = rig.maintenanceTasks.filter(
    (task) => !isClosedWorkStatus(task.status),
  );
  const systemsAtRisk = rig.systems.filter((system) => system.status !== "Good");
  const toolsAtRisk = rig.tools.filter((tool) => isToolAtRisk(tool.status));

  return {
    rig,
    metrics: {
      openRepairs: openRepairs.length,
      openMaintenance: openMaintenance.length,
      systemsAtRisk: systemsAtRisk.length,
      toolsAtRisk: toolsAtRisk.length,
    },
  };
}

export function labelize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function formatDate(value: Date | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatDateTime(value: Date | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}


function isClosedWorkStatus(status: WorkStatus) {
  return status === WorkStatus.Complete || status === WorkStatus.Cancelled;
}


function isToolAtRisk(status: ToolStatus) {
  return status === ToolStatus.NeedsRepair || status === ToolStatus.OutOfService;
}

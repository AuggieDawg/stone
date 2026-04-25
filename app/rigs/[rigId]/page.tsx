import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Gauge,
  Hammer,
  Plus,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { HealthStatus, Priority, RigStatus, SystemKind, ToolStatus, WorkStatus } from "@prisma/client";

import {
  createMaintenanceTaskAction,
  createRepairTicketAction,
  createRigSystemAction,
  createToolAction,
  updateMaintenanceStatusAction,
  updateRepairStatusAction,
  updateRigStatusAction,
  updateRigSystemStatusAction,
  updateToolStatusAction,
} from "@/lib/stone-actions";
import { formatDate, formatDateTime, getRigCommandCenter, labelize } from "@/lib/stone-queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ rigId: string }> | { rigId: string };
};

const rigStatuses = Object.values(RigStatus);
const systemKinds = Object.values(SystemKind);
const healthStatuses = Object.values(HealthStatus);
const toolStatuses = Object.values(ToolStatus);
const workStatuses = Object.values(WorkStatus);
const priorities = Object.values(Priority);
const stoneVideoSrc = "/videos/pump-jacks.mp4";

export default async function RigCommandCenterPage({ params }: PageProps) {
  const resolved = await params;
  const { rig, metrics } = await getRigCommandCenter(resolved.rigId);

  const systemRecords = rig.systems.map((system) => ({ id: system.id, label: `${labelize(system.kind)} · ${system.name}` }));
  const toolRecords = rig.tools.map((tool) => ({ id: tool.id, label: `${tool.category || "Tool"} · ${tool.name}` }));

  return (
    <main className="page-shell">
      <video className="background-video" autoPlay muted loop playsInline preload="metadata">
        <source src={stoneVideoSrc} type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="content-shell">
        <nav className="top-nav">
          <Link className="button-muted" href="/"><ArrowLeft size={16} /> Back to fleet</Link>
          <form action={updateRigStatusAction} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="hidden" name="rigId" value={rig.id} />
            <select className="select" name="status" defaultValue={rig.status} style={{ minWidth: 180 }}>
              {rigStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
            </select>
            <button className="button-muted" type="submit">Save status</button>
          </form>
        </nav>

        <section className="hero-card">
          <div className="hero-inner">
            <div>
              <p className="eyebrow">Rig command center</p>
              <h1 className="hero-title">{rig.name}</h1>
              <p className="hero-copy">
                {rig.operator || "No operator assigned"} · {rig.location || "No location entered"}. This page is the operational memory for systems, maintenance, repairs, and specialized tools.
              </p>
              <div className="hero-actions">
                <a className="button" href="#systems">Systems</a>
                <a className="button-muted" href="#repairs">Repairs</a>
                <a className="button-muted" href="#tools">Tools</a>
              </div>
            </div>
            <div className="metrics-grid">
              <Metric label="Systems" value={rig._count.systems.toString()} />
              <Metric label="Tools" value={rig._count.tools.toString()} />
              <Metric label="Open repairs" value={metrics.openRepairs.toString()} />
              <Metric label="Maintenance" value={metrics.openMaintenance.toString()} />
              <Metric label="Systems at risk" value={metrics.systemsAtRisk.toString()} />
              <Metric label="Tools at risk" value={metrics.toolsAtRisk.toString()} />
            </div>
          </div>

          <div className="section-grid">
            <section id="systems" className="panel">
              <PanelHeader eyebrow="Rig systems" title="Hydraulic, air, electrical, safety, and more" icon={<Gauge color="var(--orange)" />} />

              <form action={createRigSystemAction} className="form-card stack">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Select label="System kind" name="kind" values={systemKinds} defaultValue="Hydraulic" />
                  <Field label="System name" name="name" required placeholder="Main hydraulic system" />
                  <Select label="Health" name="status" values={healthStatuses} defaultValue="Good" />
                  <Field label="Last inspected" name="lastInspectedAt" type="date" />
                </div>
                <TextArea label="Description" name="description" />
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit"><Plus size={16} /> Add system</button>
              </form>

              <div className="divider" />

              {rig.systems.length === 0 ? (
                <EmptyState title="No systems mapped." body="Start with hydraulic, air, electrical, controls, safety, and structural systems." />
              ) : (
                <div className="stack">
                  {rig.systems.map((system) => (
                    <article className="record-card" key={system.id}>
                      <div className="pill-row">
                        <span className="pill">{labelize(system.kind)}</span>
                        <StatusPill value={system.status} />
                      </div>
                      <h3 className="record-title">{system.name}</h3>
                      <p className="record-copy">{system.description || "No description entered."}</p>
                      <div className="grid-3" style={{ marginTop: 16 }}>
                        <Detail label="Inspected" value={formatDate(system.lastInspectedAt)} />
                        <Detail label="Maintenance" value={system._count.maintenanceTasks.toString()} />
                        <Detail label="Repairs" value={system._count.repairTickets.toString()} />
                      </div>
                      <form action={updateRigSystemStatusAction} style={{ display: "flex", gap: 10, marginTop: 14 }}>
                        <input type="hidden" name="rigId" value={rig.id} />
                        <input type="hidden" name="systemId" value={system.id} />
                        <select className="select" name="status" defaultValue={system.status}>
                          {healthStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
                        </select>
                        <button className="button-muted" type="submit">Update</button>
                      </form>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="tools" className="panel">
              <PanelHeader eyebrow="Specialized tools" title="Tongs, pumps, field tooling" icon={<Wrench color="var(--orange)" />} />

              <form action={createToolAction} className="form-card stack">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Tool name" name="name" required placeholder="Tubing tongs" />
                  <Field label="Category" name="category" placeholder="Tongs, pump, safety, wrench" />
                  <Select label="Status" name="status" values={toolStatuses} defaultValue="Available" />
                  <Field label="Serial number" name="serialNumber" />
                  <Field label="Location" name="location" placeholder="Doghouse, tool box, yard" />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit"><Plus size={16} /> Add tool</button>
              </form>

              <div className="divider" />

              {rig.tools.length === 0 ? (
                <EmptyState title="No tools added." body="Add tubing tongs, rod tongs, industrial water pumps, safety tools, and specialty rig equipment." />
              ) : (
                <div className="stack">
                  {rig.tools.map((tool) => (
                    <article className="record-card" key={tool.id}>
                      <div className="pill-row">
                        <StatusPill value={tool.status} />
                        <span className="pill">{tool.category || "Uncategorized"}</span>
                      </div>
                      <h3 className="record-title">{tool.name}</h3>
                      <div className="grid-3" style={{ marginTop: 16 }}>
                        <Detail label="Serial" value={tool.serialNumber || "—"} />
                        <Detail label="Location" value={tool.location || "—"} />
                        <Detail label="Records" value={`${tool._count.maintenanceTasks} maint · ${tool._count.repairTickets} repairs`} />
                      </div>
                      <form action={updateToolStatusAction} style={{ display: "flex", gap: 10, marginTop: 14 }}>
                        <input type="hidden" name="rigId" value={rig.id} />
                        <input type="hidden" name="toolId" value={tool.id} />
                        <select className="select" name="status" defaultValue={tool.status}>
                          {toolStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
                        </select>
                        <button className="button-muted" type="submit">Update</button>
                      </form>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="section-grid">
            <section className="panel">
              <PanelHeader eyebrow="Maintenance" title="Preventive and scheduled work" icon={<Activity color="var(--orange)" />} />

              <form action={createMaintenanceTaskAction} className="form-card stack">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Task title" name="title" required placeholder="Inspect hydraulic hoses" />
                  <Select label="Priority" name="priority" values={priorities} defaultValue="Medium" />
                  <Select label="Status" name="status" values={workStatuses} defaultValue="Open" />
                  <Field label="Due date" name="dueAt" type="date" />
                  <Field label="Interval days" name="intervalDays" type="number" placeholder="30" />
                  <RecordSelect label="System" name="systemId" records={systemRecords} />
                  <RecordSelect label="Tool" name="toolId" records={toolRecords} />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit"><Plus size={16} /> Add maintenance</button>
              </form>

              <div className="divider" />

              <WorkList
                emptyTitle="No maintenance tasks."
                emptyBody="Add routine inspections, lubrication, fluid checks, safety checks, and tool service work."
                records={rig.maintenanceTasks.map((task) => ({
                  id: task.id,
                  title: task.title,
                  status: task.status,
                  priority: task.priority,
                  body: `${task.system?.name || task.tool?.name || "General rig"} · Due ${formatDate(task.dueAt)}`,
                  updated: formatDateTime(task.updatedAt),
                  form: (
                    <form action={updateMaintenanceStatusAction} style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <input type="hidden" name="rigId" value={rig.id} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <select className="select" name="status" defaultValue={task.status}>
                        {workStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
                      </select>
                      <button className="button-muted" type="submit">Update</button>
                    </form>
                  ),
                }))}
              />
            </section>

            <section id="repairs" className="panel">
              <PanelHeader eyebrow="Repairs" title="Fix-it list and needed parts" icon={<ShieldAlert color="var(--orange)" />} />

              <form action={createRepairTicketAction} className="form-card stack">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Repair title" name="title" required placeholder="Air leak near regulator" />
                  <Select label="Priority" name="priority" values={priorities} defaultValue="High" />
                  <Select label="Status" name="status" values={workStatuses} defaultValue="Open" />
                  <RecordSelect label="System" name="systemId" records={systemRecords} />
                  <RecordSelect label="Tool" name="toolId" records={toolRecords} />
                </div>
                <TextArea label="Description" name="description" />
                <TextArea label="Needed parts" name="neededParts" />
                <button className="button" type="submit"><Hammer size={16} /> Add repair</button>
              </form>

              <div className="divider" />

              <WorkList
                emptyTitle="No repair tickets."
                emptyBody="Log leaks, electrical failures, broken tools, pump issues, worn components, and safety-critical fixes."
                records={rig.repairTickets.map((ticket) => ({
                  id: ticket.id,
                  title: ticket.title,
                  status: ticket.status,
                  priority: ticket.priority,
                  body: `${ticket.system?.name || ticket.tool?.name || "General rig"}${ticket.neededParts ? ` · Parts: ${ticket.neededParts}` : ""}`,
                  updated: formatDateTime(ticket.updatedAt),
                  form: (
                    <form action={updateRepairStatusAction} style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <input type="hidden" name="rigId" value={rig.id} />
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <select className="select" name="status" defaultValue={ticket.status}>
                        {workStatuses.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
                      </select>
                      <button className="button-muted" type="submit">Update</button>
                    </form>
                  ),
                }))}
              />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function PanelHeader({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="panel-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="panel-title">{title}</h2>
      </div>
      {icon}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric-card"><p className="metric-value">{value}</p><p className="metric-label">{label}</p></div>;
}

function Field({ label, name, required, placeholder, type = "text" }: { label: string; name: string; required?: boolean; placeholder?: string; type?: string }) {
  return <label className="field"><span>{label}</span><input className="input" name={name} required={required} placeholder={placeholder} type={type} /></label>;
}

function TextArea({ label, name }: { label: string; name: string }) {
  return <label className="field"><span>{label}</span><textarea className="textarea" name={name} /></label>;
}

function Select({ label, name, values, defaultValue }: { label: string; name: string; values: string[]; defaultValue?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" name={name} defaultValue={defaultValue ?? values[0]}>
        {values.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}
      </select>
    </label>
  );
}

function RecordSelect({ label, name, records }: { label: string; name: string; records: { id: string; label: string }[] }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" name={name} defaultValue="">
        <option value="">General rig</option>
        {records.map((record) => <option key={record.id} value={record.id}>{record.label}</option>)}
      </select>
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <p className="detail-line"><span className="detail-label">{label}</span>{value}</p>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="empty-state"><strong>{title}</strong><p>{body}</p></div>;
}

function StatusPill({ value }: { value: string }) {
  return <span className={`pill ${toneFor(value)}`}>{labelize(value)}</span>;
}

function PriorityPill({ value }: { value: string }) {
  return <span className={`pill ${toneFor(value)}`}>{labelize(value)}</span>;
}

function WorkList({
  emptyTitle,
  emptyBody,
  records,
}: {
  emptyTitle: string;
  emptyBody: string;
  records: { id: string; title: string; status: string; priority: string; body: string; updated: string; form: React.ReactNode }[];
}) {
  if (records.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <div className="stack">
      {records.map((record) => (
        <article className="record-card" key={record.id}>
          <div className="pill-row">
            <StatusPill value={record.status} />
            <PriorityPill value={record.priority} />
          </div>
          <h3 className="record-title">{record.title}</h3>
          <p className="record-copy">{record.body}</p>
          <p className="record-copy">Updated {record.updated}</p>
          {record.form}
        </article>
      ))}
    </div>
  );
}

function toneFor(value: string) {
  if (["Active", "Available", "Good", "Complete"].includes(value)) return "green";
  if (["Watch", "Scheduled", "InProgress", "WaitingOnParts", "Maintenance", "InUse", "Medium", "High"].includes(value)) return "orange";
  if (["NeedsService", "NeedsRepair", "Down", "OutOfService", "Critical"].includes(value)) return "red";
  if (["Low", "Standby", "Open"].includes(value)) return "yellow";
  return "";
}

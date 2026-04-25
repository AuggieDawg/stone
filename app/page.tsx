import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowUpRight, Gauge, HardHat, Plus, ShieldAlert, Wrench } from "lucide-react";
import { RigStatus } from "@prisma/client";

import { createRigAction } from "@/lib/stone-actions";
import { formatDate, getStoneDashboard, labelize } from "@/lib/stone-queries";

export const dynamic = "force-dynamic";

const rigStatuses = Object.values(RigStatus);
const stoneVideoSrc = "/videos/pump-jacks.mp4";

export default async function HomePage() {
  const { rigs, maintenanceTasks, repairTickets, metrics } = await getStoneDashboard();

  return (
    <main className="page-shell">
      <video className="background-video" autoPlay muted loop playsInline preload="metadata">
        <source src={stoneVideoSrc} type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="content-shell">
        <nav className="top-nav">
          <Link className="brand-lockup" href="/">
            <span className="brand-mark logo-shell">
              <Image
                src="/brand/stone-logo.png"
                alt="Stone logo"
                width={48}
                height={48}
                className="brand-logo"
                priority
              />
            </span>
            <span>
              <p className="brand-title">Stone RigOps</p>
              <p className="brand-subtitle">Field command center</p>
            </span>
          </Link>
          <a className="button-muted" href="#add-rig">Add rig</a>
        </nav>

        <section className="hero-card">
          <div className="hero-inner">
            <div className="hero-copy-block">
              <div className="hero-logo-row">
                <Image
                  src="/brand/stone-logo.png"
                  alt="Stone logo"
                  width={112}
                  height={112}
                  className="hero-logo"
                  priority
                />
                <div>
                  <p className="eyebrow">Stone field operations</p>
                  <p className="hero-kicker">RigOps command software</p>
                </div>
              </div>

              <h1 className="hero-title">Rig systems, repairs, maintenance, and tools in one command view.</h1>

              <p className="hero-copy">
                Track every rig as an operational asset. Map hydraulic, air, electrical,
                safety, powertrain, and structural systems, then attach maintenance work,
                repair tickets, specialized tools, and parts to the exact component they belong to.
              </p>

              <div className="hero-actions">
                <a className="button" href="#rigs">View rigs <ArrowUpRight size={16} /></a>
                <a className="button-muted" href="#add-rig">Create first rig <Plus size={16} /></a>
              </div>
            </div>

            <div className="metrics-grid hero-metrics">
              <Metric label="Rigs" value={metrics.rigCount.toString()} />
              <Metric label="Active" value={metrics.activeRigs.toString()} />
              <Metric label="Open repairs" value={metrics.openRepairs.toString()} />
              <Metric label="Maintenance" value={metrics.openMaintenance.toString()} />
              <Metric label="Systems at risk" value={metrics.systemsAtRisk.toString()} />
              <Metric label="Video" value="Live" />
            </div>
          </div>

          <div className="section-grid">
            <section id="rigs" className="panel">
              <PanelHeader
                eyebrow="Fleet board"
                title="Rigs"
                icon={<Gauge color="var(--orange)" />}
              />

              {rigs.length === 0 ? (
                <EmptyState
                  title="No rigs yet."
                  body="Create Rig 1, Rig 2, Rig 3, or any custom rig. Each rig gets its own systems, tools, maintenance, and repair page."
                />
              ) : (
                <div className="stack">
                  {rigs.map((rig) => (
                    <article className="record-card" key={rig.id}>
                      <div className="pill-row">
                        <StatusPill value={rig.status} />
                        <span className="pill">{rig.rigNumber || "No rig #"}</span>
                      </div>
                      <h2 className="record-title">{rig.name}</h2>
                      <p className="record-copy">
                        {rig.operator || "No operator assigned"} · {rig.location || "No location"}
                      </p>
                      <div className="grid-3" style={{ marginTop: 16 }}>
                        <Detail label="Systems" value={rig._count.systems.toString()} />
                        <Detail label="Tools" value={rig._count.tools.toString()} />
                        <Detail label="Repairs" value={rig._count.repairTickets.toString()} />
                      </div>
                      <div className="divider" />
                      {rig.systems.length > 0 ? (
                        <div className="pill-row">
                          {rig.systems.map((system) => (
                            <span className={`pill ${toneFor(system.status)}`} key={system.id}>
                              {labelize(system.kind)} · {labelize(system.status)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="record-copy">No systems mapped yet.</p>
                      )}
                      <div style={{ marginTop: 16 }}>
                        <Link className="button-full" href={`/rigs/${rig.id}`}>
                          Open rig command center <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="stack">
              <section id="add-rig" className="panel">
                <PanelHeader
                  eyebrow="Create asset"
                  title="Add a rig"
                  icon={<Plus color="var(--orange)" />}
                />
                <form action={createRigAction} className="form-card stack">
                  <div className="grid-2">
                    <Field label="Rig name" name="name" required placeholder="Rig 1" />
                    <Field label="Rig number" name="rigNumber" placeholder="SWS-001" />
                    <Select label="Status" name="status" values={rigStatuses} defaultValue="Standby" />
                    <Field label="Operator" name="operator" placeholder="KODA Resources" />
                    <Field label="Location" name="location" placeholder="Basin / field / pad" />
                  </div>
                  <TextArea label="Notes" name="notes" />
                  <button className="button" type="submit">Create rig</button>
                </form>
              </section>

              <section className="panel">
                <PanelHeader
                  eyebrow="Live pressure"
                  title="Repairs needing attention"
                  icon={<ShieldAlert color="var(--orange)" />}
                />
                {repairTickets.length === 0 ? (
                  <EmptyState title="No open repairs." body="Repair tickets will appear here once crews start logging problems." />
                ) : (
                  <div className="stack">
                    {repairTickets.map((ticket) => (
                      <article className="record-card" key={ticket.id}>
                        <div className="pill-row">
                          <StatusPill value={ticket.status} />
                          <PriorityPill value={ticket.priority} />
                        </div>
                        <h3 className="record-title">{ticket.title}</h3>
                        <p className="record-copy">
                          {ticket.rig.name} · {ticket.system?.name || ticket.tool?.name || "General rig repair"}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="panel">
                <PanelHeader
                  eyebrow="Scheduled work"
                  title="Maintenance queue"
                  icon={<Activity color="var(--orange)" />}
                />
                {maintenanceTasks.length === 0 ? (
                  <EmptyState title="No maintenance yet." body="Maintenance tasks will appear here by due date and priority." />
                ) : (
                  <div className="stack">
                    {maintenanceTasks.map((task) => (
                      <article className="record-card" key={task.id}>
                        <div className="pill-row">
                          <StatusPill value={task.status} />
                          <PriorityPill value={task.priority} />
                        </div>
                        <h3 className="record-title">{task.title}</h3>
                        <p className="record-copy">
                          {task.rig.name} · Due {formatDate(task.dueAt)}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </aside>
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
  return (
    <div className="metric-card">
      <p className="metric-value">{value}</p>
      <p className="metric-label">{label}</p>
    </div>
  );
}

function Field({ label, name, required, placeholder, type = "text" }: { label: string; name: string; required?: boolean; placeholder?: string; type?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={name} required={required} placeholder={placeholder} type={type} />
    </label>
  );
}

function Select({ label, name, values, defaultValue }: { label: string; name: string; values: string[]; defaultValue?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" name={name} defaultValue={defaultValue ?? values[0]}>
        {values.map((value) => (
          <option key={value} value={value}>{labelize(value)}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea className="textarea" name={name} />
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

function toneFor(value: string) {
  if (["Active", "Available", "Good", "Complete"].includes(value)) return "green";
  if (["Watch", "Scheduled", "InProgress", "WaitingOnParts", "Maintenance", "InUse", "Medium", "High"].includes(value)) return "orange";
  if (["NeedsService", "NeedsRepair", "Down", "OutOfService", "Critical"].includes(value)) return "red";
  if (["Low", "Standby", "Open"].includes(value)) return "yellow";
  return "";
}

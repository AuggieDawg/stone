import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Gauge,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { RigStatus } from "@prisma/client";

import { ActionModal } from "@/components/action-modal";
import { createRigAction } from "@/lib/stone-actions";
import { formatDate, getStoneDashboard, labelize } from "@/lib/stone-queries";

export const dynamic = "force-dynamic";

const rigStatuses = Object.values(RigStatus);
const stoneVideoSrc = "/videos/pump-jacks.mp4";
const defaultRigTileImages = ["/rigs/rig-1.jpg", "/rigs/rig-2.jpg"];

export default async function HomePage() {
  const { rigs, maintenanceTasks, repairTickets, metrics } =
    await getStoneDashboard();

  return (
    <main className="page-shell">
      <video
        className="background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={stoneVideoSrc} type="video/mp4" />
      </video>

      <div className="video-overlay" />

      <div className="content-shell">
        <nav className="top-nav">
          <Link className="brand-lockup" href="/">
            <Image
              src="/brand/stone-logo.png"
              alt="Stone logo"
              width={120}
              height={120}
              className="brand-logo"
              priority
            />
          </Link>
        </nav>

        <section className="hero-card">
          <div className="hero-inner">
            <div className="hero-copy-block">
              <p className="eyebrow">Stone field operations</p>

              <h1 className="hero-title">
                Rig systems, repairs, maintenance, and tools in one command
                view.
              </h1>

              <p className="hero-copy">
                Track every rig as an operational asset. Map hydraulic, air,
                electrical, safety, powertrain, and structural systems, then
                attach maintenance work, repair tickets, specialized tools,
                inventory, assets, crew, rides, and parts to the exact rig they
                belong to.
              </p>

              <div className="hero-actions">
                <a className="button" href="#rigs">
                  View rigs <ArrowUpRight size={16} />
                </a>

                <ActionModal
                  label="Create rig"
                  title="Create a rig"
                  eyebrow="Create asset"
                  description="Add the basic rig identity first. Systems, tools, inventory, assets, crew, rides, maintenance, and repairs are managed from the rig command center."
                  icon={<Plus size={16} />}
                  triggerClassName="button-muted"
                >
                  <AddRigForm />
                </ActionModal>
              </div>

              <div className="hero-stat-line" aria-label="Stone operations snapshot">
                <span className="hero-stat">
                  <strong>{metrics.rigCount}</strong> rigs
                </span>
                <span className="hero-stat">
                  <strong>{metrics.activeRigs}</strong> active
                </span>
                <span className="hero-stat">
                  <strong>{metrics.openRepairs}</strong> open repairs
                </span>
                <span className="hero-stat">
                  <strong>{metrics.openMaintenance}</strong> maintenance
                </span>
                <span className="hero-stat">
                  <strong>{metrics.systemsAtRisk}</strong> systems at risk
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="rigs" className="fleet-showcase">
          <div className="sectionHeaderBlock stone-section-header">
            <div>
              <p className="eyebrow">Fleet board</p>
              <h2>Rig tiles</h2>
            </div>
          </div>

          {rigs.length === 0 ? (
            <EmptyState
              title="No rigs yet."
              body="Create the first rig to start building Stone's command center."
            />
          ) : (
            <div className="rig-tile-grid centered-rig-tiles" aria-label="Stone rig fleet">
              {rigs.map((rig, index) => {
                const tileImage =
                  rig.imageUrl || defaultRigTileImages[index % defaultRigTileImages.length];

                return (
                <Link
                  className="rig-tile"
                  href={`/rigs/${rig.id}`}
                  key={rig.id}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.84)), url(${tileImage})`,
                  }}
                >
                  <div className="rig-tile-shine" />

                  <div className="rig-tile-top">
                    <StatusPill value={rig.status} />
                    <span className="pill">{rig.rigNumber || "No rig #"}</span>
                  </div>

                  <div className="rig-tile-body">
                    <p className="rig-tile-kicker">
                      {rig.operator || "No operator assigned"}
                    </p>
                    <h2>{rig.name}</h2>
                    <p>{rig.location || "No location entered"}</p>
                  </div>

                  <div className="rig-tile-footer">
                    <span>{rig._count.systems} systems</span>
                    <span>{rig._count.tools} tools</span>
                    <span>{rig._count.inventoryItems} stock</span>
                    <span>{rig._count.repairTickets} repairs</span>
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="below-fleet-grid">
          <section className="panel">
            <PanelHeader
              eyebrow="Live pressure"
              title="Repairs needing attention"
              icon={<ShieldAlert color="var(--orange)" />}
            />

            {repairTickets.length === 0 ? (
              <EmptyState
                title="No open repairs."
                body="Repair tickets will appear here once crews start logging problems."
              />
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
                      {ticket.rig.name} ·{" "}
                      {ticket.system?.name ||
                        ticket.tool?.name ||
                        "General rig repair"}
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
              <EmptyState
                title="No maintenance yet."
                body="Maintenance tasks will appear here by due date and priority."
              />
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
        </section>
      </div>
    </main>
  );
}

function AddRigForm() {
  return (
    <form action={createRigAction} className="form-card stack modal-form">
      <div className="grid-2">
        <Field label="Rig name" name="name" required placeholder="Rig 1" />
        <Field label="Rig number" name="rigNumber" placeholder="SWS-001" />
        <Select
          label="Status"
          name="status"
          values={rigStatuses}
          defaultValue="Standby"
        />
        <Field label="Operator" name="operator" placeholder="Stone" />
        <Field label="Location" name="location" placeholder="Basin / field / pad" />
        <Field label="Tile image path" name="imageUrl" placeholder="/rigs/rig-1.jpg" />
      </div>

      <TextArea label="Notes" name="notes" />

      <button className="button" type="submit">
        Create rig
      </button>
    </form>
  );
}

function PanelHeader({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
}) {
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

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        className="input"
        name={name}
        required={required}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function Select({
  label,
  name,
  values,
  defaultValue,
}: {
  label: string;
  name: string;
  values: string[];
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        className="select"
        name={name}
        defaultValue={defaultValue ?? values[0]}
      >
        {values.map((value) => (
          <option key={value} value={value}>
            {labelize(value)}
          </option>
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

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  return <span className={`pill ${toneFor(value)}`}>{labelize(value)}</span>;
}

function PriorityPill({ value }: { value: string }) {
  return <span className={`pill ${toneFor(value)}`}>{labelize(value)}</span>;
}

function toneFor(value: string) {
  if (["Active", "Available", "Good", "Complete"].includes(value)) {
    return "green";
  }

  if (
    [
      "Watch",
      "Scheduled",
      "InProgress",
      "WaitingOnParts",
      "Maintenance",
      "InUse",
      "Medium",
      "High",
    ].includes(value)
  ) {
    return "orange";
  }

  if (
    ["NeedsService", "NeedsRepair", "Down", "OutOfService", "Critical"].includes(
      value,
    )
  ) {
    return "red";
  }

  if (["Low", "Standby", "Open"].includes(value)) {
    return "yellow";
  }

  return "";
}

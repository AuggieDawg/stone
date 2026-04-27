import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Boxes,
  Car,
  ClipboardList,
  Droplets,
  Gauge,
  Hammer,
  PackagePlus,
  Plus,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
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

import {
  adjustInventoryItemAction,
  createCrewMemberAction,
  createCrewRideAction,
  createInventoryCategoryAction,
  createInventoryItemAction,
  createMaintenanceTaskAction,
  createRepairTicketAction,
  createRigAssetAction,
  createRigSystemAction,
  createToolAction,
  deleteRigAction,
  updateRigDetailsAction,
  updateMaintenanceStatusAction,
  updateRepairStatusAction,
  updateRigAssetStatusAction,
  updateRigStatusAction,
  updateRigSystemStatusAction,
  updateToolStatusAction,
} from "@/lib/stone-actions";
import { ActionModal } from "@/components/action-modal";
import {
  formatDate,
  formatDateTime,
  formatQuantity,
  getRigCommandCenter,
  labelize,
} from "@/lib/stone-queries";

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
const assetKinds = Object.values(RigAssetKind);
const assetStatuses = Object.values(RigAssetStatus);
const stoneVideoSrc = "/videos/pump-jacks.mp4";

export default async function RigCommandCenterPage({ params }: PageProps) {
  const resolved = await params;
  const { rig, metrics } = await getRigCommandCenter(resolved.rigId);

  const systemRecords = rig.systems.map((system) => ({
    id: system.id,
    label: `${labelize(system.kind)} · ${system.name}`,
  }));

  const toolRecords = rig.tools.map((tool) => ({
    id: tool.id,
    label: `${tool.category || "Tool"} · ${tool.name}`,
  }));

  const categoryRecords = rig.inventoryCategories.map((category) => ({
    id: category.id,
    label: category.name,
  }));

  return (
    <main className="page-shell">
      <video className="background-video" autoPlay muted loop playsInline preload="metadata">
        <source src={stoneVideoSrc} type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="content-shell">
        <nav className="top-nav compact-nav">
          <Link className="button-muted" href="/">
            <ArrowLeft size={16} /> Back to fleet
          </Link>

          <form action={updateRigStatusAction} className="status-form">
            <input type="hidden" name="rigId" value={rig.id} />
            <select className="select" name="status" defaultValue={rig.status}>
              {rigStatuses.map((status) => (
                <option key={status} value={status}>
                  {labelize(status)}
                </option>
              ))}
            </select>
            <button className="button-muted" type="submit">
              Save status
            </button>
          </form>
        </nav>

        <section className="rig-hero">
          <div>
            <p className="eyebrow">Rig command center</p>
            <h1 className="hero-title">{rig.name}</h1>
            <p className="hero-copy">
              {rig.operator || "No operator assigned"} ·{" "}
              {rig.location || "No location entered"}. This page is the
              operational memory for rig systems, tools, inventory, assets,
              crew, rides, maintenance, and repair pressure.
            </p>

            <div className="hero-actions command-actions">
              <a className="button" href="#systems">Systems</a>
              <a className="button-muted" href="#inventory">Inventory</a>
              <a className="button-muted" href="#assets">Assets</a>
              <a className="button-muted" href="#crew">Crew</a>
              <a className="button-muted" href="#repairs">Repairs</a>

              <ActionModal
                label="Edit rig"
                title="Edit rig"
                eyebrow="Rig controls"
                description="Update the rig identity, image path, operator, location, notes, and status."
                icon={<Wrench size={16} />}
                triggerClassName="button-muted"
              >
                <form action={updateRigDetailsAction} className="form-card stack modal-form">
                  <input type="hidden" name="rigId" value={rig.id} />
                  <div className="grid-2">
                    <Field label="Rig name" name="name" required defaultValue={rig.name} />
                    <Field label="Rig number" name="rigNumber" defaultValue={rig.rigNumber || ""} />
                    <Select label="Status" name="status" values={rigStatuses} defaultValue={rig.status} />
                    <Field label="Operator" name="operator" defaultValue={rig.operator || ""} />
                    <Field label="Location" name="location" defaultValue={rig.location || ""} />
                    <Field label="Tile image path" name="imageUrl" defaultValue={rig.imageUrl || "/rigs/rig-1.jpg"} />
                  </div>
                  <TextArea label="Notes" name="notes" defaultValue={rig.notes || ""} />
                  <button className="button" type="submit">Save rig</button>
                </form>
              </ActionModal>

              <ActionModal
                label="Delete rig"
                title="Delete rig"
                eyebrow="Danger zone"
                description="This permanently deletes this rig and all systems, tools, inventory, assets, crew, rides, maintenance tasks, and repair tickets attached to it."
                icon={<ShieldAlert size={16} />}
                triggerClassName="button-danger"
              >
                <form action={deleteRigAction} className="form-card stack modal-form">
                  <input type="hidden" name="rigId" value={rig.id} />
                  <div className="danger-panel">
                    <strong>Delete {rig.name}?</strong>
                    <p>This cannot be undone. Use this only when the rig record is truly disposable.</p>
                  </div>
                  <button className="button-danger solid-danger" type="submit">
                    Permanently delete rig
                  </button>
                </form>
              </ActionModal>
            </div>
          </div>

          <div className="metrics-grid command-metrics">
            <Metric label="Systems" value={rig._count.systems.toString()} />
            <Metric label="Inventory" value={rig._count.inventoryItems.toString()} />
            <Metric label="Assets" value={rig._count.assets.toString()} />
            <Metric label="Crew" value={metrics.activeCrew.toString()} />
            <Metric label="Open repairs" value={metrics.openRepairs.toString()} />
            <Metric label="Low stock" value={metrics.inventoryAtRisk.toString()} />
            <Metric label="Maintenance" value={metrics.openMaintenance.toString()} />
            <Metric label="At-risk assets" value={metrics.assetsAtRisk.toString()} />
          </div>
        </section>

        <div className="command-strip">
          <span>Next best actions</span>
          <p>
            Keep inventory current, map critical systems, log repairs immediately,
            and keep crew/ride assignments visible before shift changes.
          </p>
        </div>

        <section className="action-rail-shell" aria-label="Rig command actions">
          <div className="action-rail-header">
            <div>
              <p className="eyebrow">Command actions</p>
              <h2>Quick add rail</h2>
            </div>
            <p>
              Add operational records without cluttering the page. Each action opens a focused popup.
            </p>
          </div>

          <div className="action-rail">
            <AddPanel label="System" icon={<Gauge size={16} />}>
              <form action={createRigSystemAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Select label="System kind" name="kind" values={systemKinds} defaultValue="Hydraulic" />
                  <Field label="System name" name="name" required placeholder="Main hydraulic system" />
                  <Select label="Health" name="status" values={healthStatuses} defaultValue="Good" />
                  <Field label="Last inspected" name="lastInspectedAt" type="date" />
                </div>
                <TextArea label="Description" name="description" />
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit">Save system</button>
              </form>
            </AddPanel>

            <AddPanel label="Inventory" icon={<PackagePlus size={16} />}>
              <form action={createInventoryItemAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Item name" name="name" required placeholder="Hydraulic oil, fittings, gloves" />
                  <RecordSelect label="Category" name="categoryId" records={categoryRecords} emptyLabel="Uncategorized" />
                  <Field label="Quantity" name="quantityOnHand" type="number" placeholder="12" />
                  <Field label="Reorder point" name="reorderPoint" type="number" placeholder="4" />
                  <Field label="Unit" name="unit" placeholder="ea, gal, box, ft" />
                  <Field label="Location" name="location" placeholder="Doghouse, trailer, yard" />
                  <Field label="Supplier" name="supplier" placeholder="Vendor / supplier" />
                </div>
                <label className="check-row">
                  <input type="checkbox" name="isCritical" value="true" />
                  Critical item
                </label>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit">Save inventory item</button>
              </form>
            </AddPanel>

            <AddPanel label="Category" icon={<Boxes size={16} />}>
              <form action={createInventoryCategoryAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <Field label="Category name" name="name" required placeholder="Fluids, fittings, safety, pump parts" />
                <TextArea label="Description" name="description" />
                <button className="button" type="submit">Save category</button>
              </form>
            </AddPanel>

            <AddPanel label="Asset" icon={<Droplets size={16} />}>
              <form action={createRigAssetAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Select label="Asset kind" name="kind" values={assetKinds} defaultValue="Pump" />
                  <Field label="Asset name" name="name" required placeholder="Triplex pump, pipe wrangler, water tank" />
                  <Select label="Status" name="status" values={assetStatuses} defaultValue="Available" />
                  <Field label="Quantity" name="quantity" type="number" placeholder="1" />
                  <Field label="Capacity" name="capacity" placeholder="500 bbl, 250 gal, 10k psi" />
                  <Field label="Serial number" name="serialNumber" />
                  <Field label="Location" name="location" placeholder="Rig floor, trailer, yard" />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit">Save rig asset</button>
              </form>
            </AddPanel>

            <AddPanel label="Tool" icon={<Wrench size={16} />}>
              <form action={createToolAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Tool name" name="name" required placeholder="Tubing tongs" />
                  <Field label="Category" name="category" placeholder="Tongs, pump, safety, wrench" />
                  <Select label="Status" name="status" values={toolStatuses} defaultValue="Available" />
                  <Field label="Serial number" name="serialNumber" />
                  <Field label="Location" name="location" placeholder="Doghouse, tool box, yard" />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit">Save tool</button>
              </form>
            </AddPanel>

            <AddPanel label="Crew" icon={<Users size={16} />}>
              <form action={createCrewMemberAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Name" name="name" required placeholder="Crew member name" />
                  <Field label="Role" name="role" placeholder="Operator, floor hand, mechanic" />
                  <Field label="Phone" name="phone" placeholder="Phone number" />
                  <Field label="Shift" name="shift" placeholder="Day, night, relief" />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit">Save crew member</button>
              </form>
            </AddPanel>

            <AddPanel label="Ride" icon={<Car size={16} />}>
              <form action={createCrewRideAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Vehicle name" name="vehicleName" required placeholder="Crew truck 1" />
                  <Field label="Vehicle type" name="vehicleType" placeholder="Pickup, van, service truck" />
                  <Field label="Driver" name="driverName" placeholder="Driver name" />
                  <Field label="Seats" name="passengerCapacity" type="number" placeholder="5" />
                  <Field label="Plate number" name="plateNumber" />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit">Save crew ride</button>
              </form>
            </AddPanel>

            <AddPanel label="Maintenance" icon={<Activity size={16} />}>
              <form action={createMaintenanceTaskAction} className="form-card stack modal-form">
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
                <button className="button" type="submit">Save maintenance</button>
              </form>
            </AddPanel>

            <AddPanel label="Repair" icon={<Hammer size={16} />}>
              <form action={createRepairTicketAction} className="form-card stack modal-form">
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
                <button className="button" type="submit">Save repair</button>
              </form>
            </AddPanel>
          </div>
        </section>

        <div className="rig-command-sections">
          <section id="systems" className="panel">
            <PanelHeader
              eyebrow="Rig systems"
              title="Hydraulic, air, electrical, safety, and more"
              icon={<Gauge color="var(--orange)" />}
            />

            <AddPanel label="Add system" icon={<Plus size={16} />}>
              <form action={createRigSystemAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Select label="System kind" name="kind" values={systemKinds} defaultValue="Hydraulic" />
                  <Field label="System name" name="name" required placeholder="Main hydraulic system" />
                  <Select label="Health" name="status" values={healthStatuses} defaultValue="Good" />
                  <Field label="Last inspected" name="lastInspectedAt" type="date" />
                </div>
                <TextArea label="Description" name="description" />
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit"><Plus size={16} /> Save system</button>
              </form>
            </AddPanel>

            <RecordStack emptyTitle="No systems mapped." emptyBody="Start with hydraulic, air, electrical, controls, safety, and structural systems.">
              {rig.systems.map((system) => (
                <article className="record-card premium-record" key={system.id}>
                  <div className="pill-row">
                    <span className="pill">{labelize(system.kind)}</span>
                    <StatusPill value={system.status} />
                  </div>
                  <h3 className="record-title">{system.name}</h3>
                  <p className="record-copy">{system.description || "No description entered."}</p>
                  <div className="grid-3 record-metrics">
                    <Detail label="Inspected" value={formatDate(system.lastInspectedAt)} />
                    <Detail label="Maintenance" value={system._count.maintenanceTasks.toString()} />
                    <Detail label="Repairs" value={system._count.repairTickets.toString()} />
                  </div>
                  <form action={updateRigSystemStatusAction} className="inline-status-form">
                    <input type="hidden" name="rigId" value={rig.id} />
                    <input type="hidden" name="systemId" value={system.id} />
                    <select className="select" name="status" defaultValue={system.status}>
                      {healthStatuses.map((status) => (
                        <option key={status} value={status}>{labelize(status)}</option>
                      ))}
                    </select>
                    <button className="button-muted" type="submit">Update</button>
                  </form>
                </article>
              ))}
            </RecordStack>
          </section>

          <section id="inventory" className="panel">
            <PanelHeader
              eyebrow="Custom inventory"
              title="Rig-specific stock, quantities, and reorder pressure"
              icon={<Boxes color="var(--orange)" />}
            />

            <div className="quick-action-row">
              <AddPanel label="Add category" icon={<Plus size={16} />}>
                <form action={createInventoryCategoryAction} className="form-card stack modal-form">
                  <input type="hidden" name="rigId" value={rig.id} />
                  <Field label="Category name" name="name" required placeholder="Fluids, fittings, safety, pump parts" />
                  <TextArea label="Description" name="description" />
                  <button className="button" type="submit">Save category</button>
                </form>
              </AddPanel>

              <AddPanel label="Add inventory item" icon={<PackagePlus size={16} />}>
                <form action={createInventoryItemAction} className="form-card stack modal-form">
                  <input type="hidden" name="rigId" value={rig.id} />
                  <div className="grid-2">
                    <Field label="Item name" name="name" required placeholder="Hydraulic oil, fittings, gloves" />
                    <RecordSelect label="Category" name="categoryId" records={categoryRecords} emptyLabel="Uncategorized" />
                    <Field label="Quantity" name="quantityOnHand" type="number" placeholder="12" />
                    <Field label="Reorder point" name="reorderPoint" type="number" placeholder="4" />
                    <Field label="Unit" name="unit" placeholder="ea, gal, box, ft" />
                    <Field label="Location" name="location" placeholder="Doghouse, trailer, yard" />
                    <Field label="Supplier" name="supplier" placeholder="Vendor / supplier" />
                  </div>
                  <label className="check-row">
                    <input type="checkbox" name="isCritical" value="true" />
                    Critical item
                  </label>
                  <TextArea label="Notes" name="notes" />
                  <button className="button" type="submit">Save inventory item</button>
                </form>
              </AddPanel>
            </div>

            {rig.inventoryCategories.length > 0 ? (
              <div className="category-row">
                {rig.inventoryCategories.map((category) => (
                  <span className="category-chip" key={category.id}>
                    {category.name} · {category._count.items}
                  </span>
                ))}
              </div>
            ) : null}

            <RecordStack emptyTitle="No inventory yet." emptyBody="Add consumables, fluids, fittings, parts, safety supplies, and rig-specific stock with quantities.">
              {rig.inventoryItems.map((item) => {
                const reorderPoint = item.reorderPoint ?? 0;
                const isLow = reorderPoint > 0 && item.quantityOnHand <= reorderPoint;

                return (
                  <article className={`record-card premium-record ${isLow ? "pressure-record" : ""}`} key={item.id}>
                    <div className="pill-row">
                      <span className={`pill ${isLow ? "red" : "green"}`}>
                        {isLow ? "Low stock" : "Stocked"}
                      </span>
                      {item.isCritical ? <span className="pill red">Critical</span> : null}
                      <span className="pill">{item.category?.name || "Uncategorized"}</span>
                    </div>
                    <h3 className="record-title">{item.name}</h3>
                    <div className="grid-3 record-metrics">
                      <Detail label="On hand" value={`${formatQuantity(item.quantityOnHand)} ${item.unit || ""}`.trim()} />
                      <Detail label="Reorder" value={item.reorderPoint ? formatQuantity(item.reorderPoint) : "—"} />
                      <Detail label="Location" value={item.location || "—"} />
                    </div>
                    <form action={adjustInventoryItemAction} className="inline-status-form">
                      <input type="hidden" name="rigId" value={rig.id} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <input className="input" name="adjustment" type="number" defaultValue="1" />
                      <button className="button-muted" type="submit">Adjust</button>
                    </form>
                  </article>
                );
              })}
            </RecordStack>
          </section>

          <section id="assets" className="panel">
            <PanelHeader
              eyebrow="Rig assets"
              title="Pumps, pipe wranglers, tanks, power units, and support equipment"
              icon={<Droplets color="var(--orange)" />}
            />

            <AddPanel label="Add rig asset" icon={<Plus size={16} />}>
              <form action={createRigAssetAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Select label="Asset kind" name="kind" values={assetKinds} defaultValue="Pump" />
                  <Field label="Asset name" name="name" required placeholder="Triplex pump, pipe wrangler, water tank" />
                  <Select label="Status" name="status" values={assetStatuses} defaultValue="Available" />
                  <Field label="Quantity" name="quantity" type="number" placeholder="1" />
                  <Field label="Capacity" name="capacity" placeholder="500 bbl, 250 gal, 10k psi" />
                  <Field label="Serial number" name="serialNumber" />
                  <Field label="Location" name="location" placeholder="Rig floor, trailer, yard" />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit">Save rig asset</button>
              </form>
            </AddPanel>

            <RecordStack emptyTitle="No rig assets yet." emptyBody="Add pumps, pipe wranglers, water tanks, fluid tanks, generators, power units, trailers, and support equipment.">
              {rig.assets.map((asset) => (
                <article className="record-card premium-record" key={asset.id}>
                  <div className="pill-row">
                    <span className="pill">{labelize(asset.kind)}</span>
                    <StatusPill value={asset.status} />
                  </div>
                  <h3 className="record-title">{asset.name}</h3>
                  <div className="grid-3 record-metrics">
                    <Detail label="Qty" value={asset.quantity.toString()} />
                    <Detail label="Capacity" value={asset.capacity || "—"} />
                    <Detail label="Location" value={asset.location || "—"} />
                  </div>
                  <form action={updateRigAssetStatusAction} className="inline-status-form">
                    <input type="hidden" name="rigId" value={rig.id} />
                    <input type="hidden" name="assetId" value={asset.id} />
                    <select className="select" name="status" defaultValue={asset.status}>
                      {assetStatuses.map((status) => (
                        <option key={status} value={status}>{labelize(status)}</option>
                      ))}
                    </select>
                    <button className="button-muted" type="submit">Update</button>
                  </form>
                </article>
              ))}
            </RecordStack>
          </section>

          <section id="tools" className="panel">
            <PanelHeader
              eyebrow="Specialized tools"
              title="Tongs, pumps, field tooling"
              icon={<Wrench color="var(--orange)" />}
            />

            <AddPanel label="Add tool" icon={<Plus size={16} />}>
              <form action={createToolAction} className="form-card stack modal-form">
                <input type="hidden" name="rigId" value={rig.id} />
                <div className="grid-2">
                  <Field label="Tool name" name="name" required placeholder="Tubing tongs" />
                  <Field label="Category" name="category" placeholder="Tongs, pump, safety, wrench" />
                  <Select label="Status" name="status" values={toolStatuses} defaultValue="Available" />
                  <Field label="Serial number" name="serialNumber" />
                  <Field label="Location" name="location" placeholder="Doghouse, tool box, yard" />
                </div>
                <TextArea label="Notes" name="notes" />
                <button className="button" type="submit"><Plus size={16} /> Save tool</button>
              </form>
            </AddPanel>

            <RecordStack emptyTitle="No tools added." emptyBody="Add tubing tongs, rod tongs, industrial water pumps, safety tools, and specialty rig equipment.">
              {rig.tools.map((tool) => (
                <article className="record-card premium-record" key={tool.id}>
                  <div className="pill-row">
                    <StatusPill value={tool.status} />
                    <span className="pill">{tool.category || "Uncategorized"}</span>
                  </div>
                  <h3 className="record-title">{tool.name}</h3>
                  <div className="grid-3 record-metrics">
                    <Detail label="Serial" value={tool.serialNumber || "—"} />
                    <Detail label="Location" value={tool.location || "—"} />
                    <Detail label="Records" value={`${tool._count.maintenanceTasks} maint · ${tool._count.repairTickets} repairs`} />
                  </div>
                  <form action={updateToolStatusAction} className="inline-status-form">
                    <input type="hidden" name="rigId" value={rig.id} />
                    <input type="hidden" name="toolId" value={tool.id} />
                    <select className="select" name="status" defaultValue={tool.status}>
                      {toolStatuses.map((status) => (
                        <option key={status} value={status}>{labelize(status)}</option>
                      ))}
                    </select>
                    <button className="button-muted" type="submit">Update</button>
                  </form>
                </article>
              ))}
            </RecordStack>
          </section>

          <section id="crew" className="panel">
            <PanelHeader
              eyebrow="Crew"
              title="Crew list and crew rides"
              icon={<Users color="var(--orange)" />}
            />

            <div className="quick-action-row">
              <AddPanel label="Add crew member" icon={<Users size={16} />}>
                <form action={createCrewMemberAction} className="form-card stack modal-form">
                  <input type="hidden" name="rigId" value={rig.id} />
                  <div className="grid-2">
                    <Field label="Name" name="name" required placeholder="Crew member name" />
                    <Field label="Role" name="role" placeholder="Operator, floor hand, mechanic" />
                    <Field label="Phone" name="phone" placeholder="Phone number" />
                    <Field label="Shift" name="shift" placeholder="Day, night, relief" />
                  </div>
                  <TextArea label="Notes" name="notes" />
                  <button className="button" type="submit">Save crew member</button>
                </form>
              </AddPanel>

              <AddPanel label="Add crew ride" icon={<Car size={16} />}>
                <form action={createCrewRideAction} className="form-card stack modal-form">
                  <input type="hidden" name="rigId" value={rig.id} />
                  <div className="grid-2">
                    <Field label="Vehicle name" name="vehicleName" required placeholder="Crew truck 1" />
                    <Field label="Vehicle type" name="vehicleType" placeholder="Pickup, van, service truck" />
                    <Field label="Driver" name="driverName" placeholder="Driver name" />
                    <Field label="Seats" name="passengerCapacity" type="number" placeholder="5" />
                    <Field label="Plate number" name="plateNumber" />
                  </div>
                  <TextArea label="Notes" name="notes" />
                  <button className="button" type="submit">Save crew ride</button>
                </form>
              </AddPanel>
            </div>

            <div className="crew-grid">
              <div>
                <h3 className="subsection-title">Crew members</h3>
                <RecordStack emptyTitle="No crew members yet." emptyBody="Add the crew so Stone can see who is assigned to this rig.">
                  {rig.crewMembers.map((member) => (
                    <article className="record-card premium-record" key={member.id}>
                      <div className="pill-row">
                        <span className={`pill ${member.isActive ? "green" : ""}`}>
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                        {member.shift ? <span className="pill">{member.shift}</span> : null}
                      </div>
                      <h3 className="record-title">{member.name}</h3>
                      <div className="grid-2 record-metrics">
                        <Detail label="Role" value={member.role || "—"} />
                        <Detail label="Phone" value={member.phone || "—"} />
                      </div>
                    </article>
                  ))}
                </RecordStack>
              </div>

              <div>
                <h3 className="subsection-title">Crew rides</h3>
                <RecordStack emptyTitle="No crew rides yet." emptyBody="Add crew trucks, vans, service trucks, and assigned drivers.">
                  {rig.crewRides.map((ride) => (
                    <article className="record-card premium-record" key={ride.id}>
                      <div className="pill-row">
                        <span className="pill">{ride.vehicleType || "Vehicle"}</span>
                        {ride.passengerCapacity ? <span className="pill">{ride.passengerCapacity} seats</span> : null}
                      </div>
                      <h3 className="record-title">{ride.vehicleName}</h3>
                      <div className="grid-2 record-metrics">
                        <Detail label="Driver" value={ride.driverName || "—"} />
                        <Detail label="Plate" value={ride.plateNumber || "—"} />
                      </div>
                    </article>
                  ))}
                </RecordStack>
              </div>
            </div>
          </section>

          <section className="panel">
            <PanelHeader
              eyebrow="Maintenance"
              title="Preventive and scheduled work"
              icon={<Activity color="var(--orange)" />}
            />

            <AddPanel label="Add maintenance" icon={<Activity size={16} />}>
              <form action={createMaintenanceTaskAction} className="form-card stack modal-form">
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
                <button className="button" type="submit"><Plus size={16} /> Save maintenance</button>
              </form>
            </AddPanel>

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
                  <form action={updateMaintenanceStatusAction} className="inline-status-form">
                    <input type="hidden" name="rigId" value={rig.id} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <select className="select" name="status" defaultValue={task.status}>
                      {workStatuses.map((status) => (
                        <option key={status} value={status}>{labelize(status)}</option>
                      ))}
                    </select>
                    <button className="button-muted" type="submit">Update</button>
                  </form>
                ),
              }))}
            />
          </section>

          <section id="repairs" className="panel">
            <PanelHeader
              eyebrow="Repairs"
              title="Fix-it list and needed parts"
              icon={<ShieldAlert color="var(--orange)" />}
            />

            <AddPanel label="Add repair" icon={<Hammer size={16} />}>
              <form action={createRepairTicketAction} className="form-card stack modal-form">
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
                <button className="button" type="submit"><Hammer size={16} /> Save repair</button>
              </form>
            </AddPanel>

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
                  <form action={updateRepairStatusAction} className="inline-status-form">
                    <input type="hidden" name="rigId" value={rig.id} />
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <select className="select" name="status" defaultValue={ticket.status}>
                      {workStatuses.map((status) => (
                        <option key={status} value={status}>{labelize(status)}</option>
                      ))}
                    </select>
                    <button className="button-muted" type="submit">Update</button>
                  </form>
                ),
              }))}
            />
          </section>
        </div>
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

function AddPanel({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <ActionModal
      label={label}
      title={label}
      eyebrow="Quick entry"
      description="Add the record, save it, and return directly to the rig command center."
      icon={icon}
    >
      {children}
    </ActionModal>
  );
}

function RecordStack({ children, emptyTitle, emptyBody }: { children: React.ReactNode[]; emptyTitle: string; emptyBody: string }) {
  if (children.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return <div className="stack records-stack">{children}</div>;
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea className="textarea" name={name} defaultValue={defaultValue} />
    </label>
  );
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

function RecordSelect({ label, name, records, emptyLabel = "General rig" }: { label: string; name: string; records: { id: string; label: string }[]; emptyLabel?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" name={name} defaultValue="">
        <option value="">{emptyLabel}</option>
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
    <div className="stack records-stack">
      {records.map((record) => (
        <article className="record-card premium-record" key={record.id}>
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
  if (["Watch", "Scheduled", "InProgress", "WaitingOnParts", "Maintenance", "InUse", "Medium", "High", "NeedsService"].includes(value)) return "orange";
  if (["NeedsRepair", "Down", "OutOfService", "Critical"].includes(value)) return "red";
  if (["Low", "Standby", "Open"].includes(value)) return "yellow";
  return "";
}

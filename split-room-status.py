from pathlib import Path
from datetime import datetime
import json
import shutil

root = Path(".")
files = [
    root / "server/index.ts",
    root / "src/api.ts",
    root / "src/App.tsx",
    root / "server/data.json",
]

for path in files:
    if not path.exists():
        raise SystemExit(f"Missing file: {path}")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
for path in files:
    backup = path.with_name(path.name + f".before-status-split-{stamp}.bak")
    shutil.copy2(path, backup)
    print(f"Backup: {backup}")

def replace_once(path, old, new, label):
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"STOP: expected exactly one match for {label} in {path}, found {count}. "
            "Backups were created; no further edits should be attempted automatically."
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
    print(f"Updated: {label}")

server = root / "server/index.ts"
api = root / "src/api.ts"
app = root / "src/App.tsx"
data_path = root / "server/data.json"

# Backend: reservation creation and room assignment use occupancy only.
replace_once(
    server,
    "if (room.status === 'Maintenance') {",
    "if (room.occupancyStatus === 'Maintenance') {",
    "reservation creation maintenance check",
)

replace_once(
    server,
    "if (room.status === 'Maintenance' && updated.status !== 'Checked out') {",
    "if (room.occupancyStatus === 'Maintenance' && updated.status !== 'Checked out') {",
    "reservation update maintenance check",
)

replace_once(
    server,
    """    if (room) {
      room.status = body.status === 'Checked in' ? 'Occupied' : 'Dirty';
    }""",
    """    if (room) {
      if (body.status === 'Checked in') {
        room.occupancyStatus = 'Occupied';
      } else {
        room.occupancyStatus = 'Vacant';
        room.housekeepingStatus = 'Dirty';
      }
    }""",
    "check-in and check-out room transitions",
)

# Backend: accept exactly one independent status field and preserve clean notifications.
old_handler = """app.patch('/api/v1/rooms/:id/status', async (req, res) => {
  const d = readData();
  const item = d.rooms.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Room not found.' });

  const allowed = ['Clean', 'Dirty', 'Occupied', 'Maintenance', 'Inspected'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid room status.' });
  }

  const previousStatus = item.status;
  item.status = req.body.status;
  writeData(d);

  const isTransitionToClean = previousStatus !== 'Clean' && item.status === 'Clean';"""

new_handler = """app.patch('/api/v1/rooms/:id/status', async (req, res) => {
  const d = readData();
  const item = d.rooms.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Room not found.' });

  const hasOccupancy = Object.prototype.hasOwnProperty.call(req.body, 'occupancyStatus');
  const hasHousekeeping = Object.prototype.hasOwnProperty.call(req.body, 'housekeepingStatus');

  if (hasOccupancy === hasHousekeeping) {
    return res.status(400).json({ error: 'Update either occupancyStatus or housekeepingStatus, not both.' });
  }

  const field = hasOccupancy ? 'occupancyStatus' : 'housekeepingStatus';
  const value = hasOccupancy ? req.body.occupancyStatus : req.body.housekeepingStatus;
  const allowed = hasOccupancy
    ? ['Occupied', 'Vacant', 'Maintenance']
    : ['Clean', 'Dirty'];

  if (!allowed.includes(value)) {
    return res.status(400).json({ error: `Invalid ${field}.` });
  }

  const previousStatus = item.housekeepingStatus;
  item[field] = value;
  writeData(d);

  const isTransitionToClean =
    field === 'housekeepingStatus' &&
    previousStatus !== 'Clean' &&
    item.housekeepingStatus === 'Clean';"""

replace_once(
    server, old_handler, new_handler,
    "independent room status endpoint",
)

# API: send the specific field being updated.
replace_once(
    api,
    "updateRoomStatus: (id: string, status: string) => request<any>(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),",
    "updateRoomStatus: (id: string, field: 'occupancyStatus' | 'housekeepingStatus', status: string) => request<any>(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ [field]: status }) }),",
    "room status API method",
)

# Frontend: status update handler.
replace_once(
    app,
    """  async function changeStatus(id: string, status: string) {
    try {
      await api.updateRoomStatus(id, status);
      load();
    } catch (e: any) {
      alert(e.message || 'Could not update room status.');
    }
  }""",
    """  async function changeStatus(
    id: string,
    field: 'occupancyStatus' | 'housekeepingStatus',
    status: string
  ) {
    try {
      await api.updateRoomStatus(id, field, status);
      load();
    } catch (e: any) {
      alert(e.message || 'Could not update room status.');
    }
  }""",
    "room status update function",
)

replace_once(
    app,
    """  const counts = useMemo(() => ({
    available: rows.filter(r => r.status === 'Clean').length,
    occupied: rows.filter(r => r.status === 'Occupied').length,
    dirty: rows.filter(r => r.status === 'Dirty').length,
    maintenance: rows.filter(r => r.status === 'Maintenance').length,
    inspected: rows.filter(r => r.status === 'Inspected').length
  }), [rows]);""",
    """  const counts = useMemo(() => ({
    vacant: rows.filter(r => r.occupancyStatus === 'Vacant').length,
    occupied: rows.filter(r => r.occupancyStatus === 'Occupied').length,
    maintenance: rows.filter(r => r.occupancyStatus === 'Maintenance').length,
    clean: rows.filter(r => r.housekeepingStatus === 'Clean').length,
    dirty: rows.filter(r => r.housekeepingStatus === 'Dirty').length
  }), [rows]);""",
    "room counters",
)

replace_once(
    app,
    """    <div className="mini-stat-grid">
      <div><span>Clean / available</span><strong>{counts.available}</strong></div>
      <div><span>Occupied</span><strong>{counts.occupied}</strong></div>
      <div><span>Needs cleaning</span><strong>{counts.dirty}</strong></div>
      <div><span>Maintenance</span><strong>{counts.maintenance}</strong></div>
      <div><span>Inspected</span><strong>{counts.inspected}</strong></div>
    </div>""",
    """    <div className="mini-stat-grid">
      <div><span>Vacant</span><strong>{counts.vacant}</strong></div>
      <div><span>Occupied</span><strong>{counts.occupied}</strong></div>
      <div><span>Maintenance</span><strong>{counts.maintenance}</strong></div>
      <div><span>Clean</span><strong>{counts.clean}</strong></div>
      <div><span>Dirty</span><strong>{counts.dirty}</strong></div>
    </div>""",
    "room counter labels",
)

replace_once(
    app,
    """      {rows.map(room => <div className={"room-card status-" + room.status.toLowerCase().replace(' ','-')} key={room.id}>
        <div className="room-card-top">
          <div className="room-number">{room.number}</div>
          <select className={"room-status-select status-" + room.status.toLowerCase().replace(" ","-")} aria-label={"Update status for room " + room.number} value={room.status} onChange={e => changeStatus(room.id,e.target.value)}><option>Clean</option><option>Dirty</option><option>Occupied</option><option>Maintenance</option><option>Inspected</option></select>
        </div>
        <strong>{room.type}</strong>
        <span>{room.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'} · Floor {room.floor}</span>

        <div className="room-notes">""",
    """      {rows.map(room => <div className="room-card" key={room.id}>
        <div className="room-card-top">
          <div className="room-number">{room.number}</div>
          <select
            className={"room-status-select status-" + room.occupancyStatus.toLowerCase()}
            aria-label={"Update occupancy for room " + room.number}
            value={room.occupancyStatus}
            onChange={e => changeStatus(room.id, 'occupancyStatus', e.target.value)}
          >
            <option value="Vacant">Vacant</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <strong>{room.type}</strong>
        <span>{room.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'} · Floor {room.floor}</span>

        <label>Housekeeping
          <select
            className={"room-status-select status-" + room.housekeepingStatus.toLowerCase()}
            aria-label={"Update housekeeping for room " + room.number}
            value={room.housekeepingStatus}
            onChange={e => changeStatus(room.id, 'housekeepingStatus', e.target.value)}
          >
            <option value="Clean">Clean</option>
            <option value="Dirty">Dirty</option>
          </select>
        </label>

        <div className="room-notes">""",
    "room card occupancy and housekeeping selectors",
)

replace_once(
    app,
    """      const roomAction = status === 'Checked in'
        ? 'The room will be marked as Occupied.'
        : 'The room will be marked as Dirty for housekeeping.';""",
    """      const roomAction = status === 'Checked in'
        ? 'Occupancy will become Occupied. Housekeeping will remain unchanged.'
        : 'Occupancy will become Vacant and housekeeping will become Dirty.';""",
    "reservation confirmation message",
)

# Migrate room data, preserving any valid new fields if they already exist.
data = json.loads(data_path.read_text(encoding="utf-8"))
rooms = data.get("rooms", [])
if not rooms:
    raise SystemExit("STOP: no rooms found in server/data.json")

for room in rooms:
    legacy = room.get("status")
    occupancy = room.get("occupancyStatus")
    housekeeping = room.get("housekeepingStatus")

    if occupancy not in ("Occupied", "Vacant", "Maintenance"):
        if legacy == "Occupied":
            occupancy = "Occupied"
        elif legacy == "Maintenance":
            occupancy = "Maintenance"
        else:
            occupancy = "Vacant"

    if housekeeping not in ("Clean", "Dirty"):
        housekeeping = "Dirty" if legacy == "Dirty" else "Clean"

    room["occupancyStatus"] = occupancy
    room["housekeepingStatus"] = housekeeping
    room.pop("status", None)

data_path.write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

print(f"Migrated {len(rooms)} rooms; reservation records were not modified.")
print("Done. Backups were created before editing.")

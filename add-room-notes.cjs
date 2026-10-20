const fs = require('fs');

function replaceOnce(source, oldText, newText, file) {
  const first = source.indexOf(oldText);
  if (first === -1 || source.indexOf(oldText, first + oldText.length) !== -1) {
    throw new Error('Could not uniquely find the section to update in ' + file);
  }
  return source.slice(0, first) + newText + source.slice(first + oldText.length);
}

const apiPath = 'src/api.ts';
let api = fs.readFileSync(apiPath, 'utf8');

api = replaceOnce(
  api,
  "  updateRoomStatus: (id: string, status: string) => request<any>(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),",
  "  updateRoomStatus: (id: string, status: string) => request<any>(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),\n  updateRoomNote: (id: string, note: string) => request<any>(`/rooms/${id}/note`, { method: 'PATCH', body: JSON.stringify({ note }) }),",
  apiPath
);

const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

const roomsPattern = /function Rooms\(\{ property \}: \{ property: string \}\) \{[\s\S]*?\n\}\nfunction Employees\(\)/;

if (!roomsPattern.test(app)) {
  throw new Error('Could not find the Rooms component in src/App.tsx');
}

const newRooms = `function Rooms({ property }: { property: string }) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [editingNotes, setEditingNotes] = useState<Record<string, boolean>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  const load = () => api.rooms(query).then(r => {
    const filtered = r.data.filter((x: AnyRow) => property === 'all' || x.propertyId === property);
    setRows(filtered);
    setNoteDrafts(prev => {
      const next = { ...prev };
      filtered.forEach((room: AnyRow) => {
        if (next[room.id] === undefined) next[room.id] = room.note || '';
      });
      return next;
    });
  }).catch(() => {});

  useEffect(() => { load(); }, [query, property]);

  async function changeStatus(id: string, status: string) {
    try {
      await api.updateRoomStatus(id, status);
      load();
    } catch (e: any) {
      alert(e.message || 'Could not update room status.');
    }
  }

  async function saveNote(room: AnyRow) {
    setSavingNotes(prev => ({ ...prev, [room.id]: true }));
    try {
      await api.updateRoomNote(room.id, noteDrafts[room.id] || '');
      setEditingNotes(prev => ({ ...prev, [room.id]: false }));
      load();
    } catch (e: any) {
      alert(e.message || 'Could not save room note.');
    } finally {
      setSavingNotes(prev => ({ ...prev, [room.id]: false }));
    }
  }

  const counts = useMemo(() => ({
    available: rows.filter(r => r.status === 'Clean').length,
    occupied: rows.filter(r => r.status === 'Occupied').length,
    dirty: rows.filter(r => r.status === 'Dirty').length,
    maintenance: rows.filter(r => r.status === 'Maintenance').length
  }), [rows]);

  return <>
    <PageHeader eyebrow="HOTEL OPERATIONS" title="Room management" description="View room availability, update operational status, and maintain room notes." actions={<Button variant="secondary" onClick={load}><RefreshCw size={15}/> Refresh</Button>}/>
    <div className="mini-stat-grid">
      <div><span>Clean / available</span><strong>{counts.available}</strong></div>
      <div><span>Occupied</span><strong>{counts.occupied}</strong></div>
      <div><span>Needs cleaning</span><strong>{counts.dirty}</strong></div>
      <div><span>Maintenance</span><strong>{counts.maintenance}</strong></div>
    </div>
    <div className="toolbar">
      <SearchBar value={query} onChange={setQuery} placeholder="Search room number or type…"/>
      <span className="muted">{rows.length} rooms</span>
    </div>
    <div className="room-grid">
      {rows.map(room => <div className={"room-card status-" + room.status.toLowerCase().replace(' ','-')} key={room.id}>
        <div className="room-card-top">
          <div className="room-number">{room.number}</div>
          <Badge tone={room.status==='Clean'?'success':room.status==='Occupied'?'info':room.status==='Dirty'?'warning':'danger'}>{room.status}</Badge>
        </div>
        <strong>{room.type}</strong>
        <span>{room.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'} · Floor {room.floor}</span>

        <label>Update status
          <select value={room.status} onChange={e => changeStatus(room.id,e.target.value)}>
            <option>Clean</option>
            <option>Dirty</option>
            <option>Occupied</option>
            <option>Maintenance</option>
            <option>Inspected</option>
          </select>
        </label>

        <div className="room-notes">
          <strong>Room notes</strong>
          {editingNotes[room.id] ? <>
            <textarea
              value={noteDrafts[room.id] ?? room.note ?? ''}
              onChange={e => setNoteDrafts(prev => ({ ...prev, [room.id]: e.target.value }))}
              maxLength={2000}
              rows={4}
              placeholder="Add information about this room…"
            />
            <span className="muted">{(noteDrafts[room.id] || '').length}/2000 characters</span>
            <div className="room-note-actions">
              <Button variant="secondary" onClick={() => {
                setNoteDrafts(prev => ({ ...prev, [room.id]: room.note || '' }));
                setEditingNotes(prev => ({ ...prev, [room.id]: false }));
              }}>Cancel</Button>
              <Button onClick={() => saveNote(room)} disabled={!!savingNotes[room.id]}>
                {savingNotes[room.id] ? 'Saving…' : 'Save note'}
              </Button>
            </div>
          </> : <>
            <p className="room-note-text">{room.note || 'No note added.'}</p>
            <Button variant="secondary" onClick={() => setEditingNotes(prev => ({ ...prev, [room.id]: true }))}>
              {room.note ? 'Edit note' : 'Add note'}
            </Button>
          </>}
        </div>
      </div>)}
    </div>
  </>;
}
function Employees()`;

app = app.replace(roomsPattern, newRooms);

const serverPath = 'server/index.ts';
let server = fs.readFileSync(serverPath, 'utf8');

const routeMarker = "app.get('/api/v1/employees',";
const noteRoute = `app.patch('/api/v1/rooms/:id/note', (req, res) => {
  const d = readData();
  const item = d.rooms.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Room not found.' });
  if (typeof req.body.note !== 'string') {
    return res.status(400).json({ error: 'Note must be text.' });
  }
  if (req.body.note.length > 2000) {
    return res.status(400).json({ error: 'Room notes cannot exceed 2000 characters.' });
  }
  item.note = req.body.note;
  writeData(d);
  res.json({ data: item });
});

`;

server = replaceOnce(server, routeMarker, noteRoute + routeMarker, serverPath);

// Write files only after all replacements have succeeded.
fs.writeFileSync(apiPath, api);
fs.writeFileSync(appPath, app);
fs.writeFileSync(serverPath, server);

console.log('SUCCESS: Added room notes to the API and room management screen.');
console.log('Room notes will be saved in server/data.json.');

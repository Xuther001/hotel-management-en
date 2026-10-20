import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, CalendarDays, Users, Wallet, Package, Wrench,
  ChartNoAxesCombined, Settings, Bell, Search, Menu, Plus, ArrowUpRight, ArrowDownRight,
  CheckCircle2, AlertTriangle, Clock3, ChevronDown, Building2, LogOut, X, RefreshCw,
  UserRound, CalendarCheck, ClipboardList, FileText, CircleDollarSign, Sparkles
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { api, money } from './api';

type AnyRow = Record<string, any>;
const navGroups = [
  { label: 'WORKSPACE', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/reservations', label: 'Reservations', icon: CalendarDays },
    { to: '/reservation-calendar', label: 'Reservation Calendar', icon: CalendarCheck },
    { to: '/rooms', label: 'Room management', icon: BedDouble },
  ]},
  { label: 'OPERATIONS', items: [
    { to: '/employees', label: 'Human resources', icon: Users },
    { to: '/finance', label: 'Finance & expenses', icon: Wallet },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    
  ]},
  { label: 'MANAGEMENT', items: [
    { to: '/reports', label: 'Reports & analytics', icon: ChartNoAxesCombined },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]}
];
const titleMap: Record<string, string> = {
  '/': 'Business overview', '/reservations': 'Reservations', '/reservation-calendar': 'Reservation Calendar', '/rooms': 'Room management',
  '/employees': 'Human resources', '/finance': 'Finance & expenses', '/inventory': 'Inventory',
  '/maintenance': 'Maintenance', '/reports': 'Reports & analytics', '/settings': 'Settings'
};
function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Button({ children, onClick, variant = 'primary', type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: string; type?: 'button'|'submit' }) {
  return <button type={type} className={`button ${variant}`} onClick={onClick}>{children}</button>;
}
function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="panel"><div className="panel-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty"><ClipboardList size={24}/><strong>{title}</strong><span>{text}</span></div>;
}
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [property, setProperty] = useState('all');
  const [properties, setProperties] = useState<AnyRow[]>([]);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] || 'Business management';
  useEffect(() => { api.properties().then(r => setProperties(r.data)).catch(() => {}); }, []);
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Building2 size={20}/></div><div><strong>Haven Group</strong><span>BUSINESS MANAGEMENT</span></div><button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="workspace-select"><div className="workspace-icon"><Building2 size={17}/></div><div><span>WORKSPACE</span><strong>Hospitality Group</strong></div><ChevronDown size={15}/></div>
      <nav>{navGroups.map(group => <div className="nav-group" key={group.label}><span className="nav-label">{group.label}</span>{group.items.map(item => { const Icon = item.icon; return <NavLink end={item.to === '/'} to={item.to} key={item.to} onClick={() => setSidebarOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{item.label}</span>{item.to === '/reservations' && <small className="nav-count">5</small>}</NavLink>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={16}/></div><strong>Need a hand?</strong><p>Your internal management workspace is in demo mode.</p><button onClick={() => alert('This is a frontend demo. Add a help module when your backend is ready.')}>View help <ArrowUpRight size={14}/></button></div><div className="user-mini"><div className="avatar">BO</div><div><strong>Business Owner</strong><span>Administrator · Demo</span></div><button className="icon-button" title="Account"><LogOut size={16}/></button></div></div>
    </aside>
    {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button><div className="breadcrumbs">Workspace <span>/</span> <strong>{pageTitle}</strong></div></div><div className="top-actions"><label className="property-filter"><Building2 size={16}/><select value={property} onChange={e => setProperty(e.target.value)}><option value="all">All hotels</option>{properties.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select><ChevronDown size={14}/></label><button className="icon-button top-search" onClick={() => document.getElementById('global-search')?.focus()} title="Search"><Search size={18}/></button><button className="icon-button notification" title="Notifications" onClick={() => alert('Demo notifications: 3 maintenance tasks and 2 contract renewals require attention.')}><Bell size={18}/><i/></button><div className="top-divider"/><div className="top-user"><div className="avatar">BO</div><div><strong>Business Owner</strong><span>Owner account</span></div><ChevronDown size={14}/></div></div></header>
      <div className="page-wrap"><Routes>
        <Route path="/" element={<Dashboard property={property}/>} />
        <Route path="/reservations" element={<Reservations property={property} />} />
        <Route path="/reservation-calendar" element={<ReservationCalendar property={property} />} />
        <Route path="/rooms" element={<Rooms property={property}/>} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/inventory" element={<ComingSoon title="Inventory management" description="Track supplies, stock levels, purchase orders, and transfers between your properties." icon={<Package/>}/>} />
        <Route path="/maintenance" element={<Maintenance />} />
        
        <Route path="/reports" element={<Reports property={property}/>} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes><footer>© 2026 Haven Group <span>Internal management system · Demo data only</span></footer></div>
    </main>
  </div>;
}
function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow || 'OVERVIEW'}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="header-actions">{actions}</div>}</div>;
}
function StatCard({ title, value, change, icon, positive = true, note }: { title: string; value: string; change?: string; icon: ReactNode; positive?: boolean; note?: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{title}</span><div className="stat-icon">{icon}</div></div><strong className="stat-value">{value}</strong><div className="stat-bottom">{change && <span className={positive ? 'trend up' : 'trend down'}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {change}</span>}<span>{note || 'vs. previous period'}</span></div></div>;
}
function Dashboard({ property }: { property: string }) {
  const [data, setData] = useState<AnyRow | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { api.overview(property).then(r => {setData(r.data); setError('');}).catch(e => setError(e.message)); }, [property, refresh]);
  if (error) return <ErrorState error={error} retry={() => setRefresh(x => x + 1)}/>;
  if (!data) return <div className="loading"><RefreshCw className="spin"/> Loading dashboard…</div>;
  return <>
    <PageHeader eyebrow="MONDAY, OCTOBER 19, 2026" title="Good morning, Owner" description="Here’s what’s happening across your businesses today." actions={<><Button variant="secondary" onClick={() => setRefresh(x => x + 1)}><RefreshCw size={15}/> Refresh</Button><Button onClick={() => window.location.href='/reservations'}><Plus size={16}/> New reservation</Button></>}/>
    <div className="notice demo-notice"><Sparkles size={17}/><div><strong>Demo environment</strong><span>These figures are sample data. Changes you make are stored locally by the simulated API.</span></div><Badge tone="info">SIMULATED API</Badge></div>
    <div className="stat-grid">
      <StatCard title="Total revenue" value={money(data.revenue)} change="+8.2%" icon={<CircleDollarSign size={19}/>} note="this month"/>
      <StatCard title="Operating profit" value={money(data.operatingProfit)} change="+5.4%" icon={<ChartNoAxesCombined size={19}/>} note="estimated · 30% margin"/>
      <StatCard title="Room occupancy" value={`${data.occupancy}%`} change="+3.1%" icon={<BedDouble size={19}/>} note="across selected hotels"/>
      <StatCard title="Active employees" value={String(data.employeeCount)} icon={<Users size={19}/>} note="across the group"/>
    </div>
    <div className="content-grid two-one">
      <Panel title="Revenue performance" subtitle="Monthly revenue by hotel · VND millions" action={<button className="text-button" onClick={() => window.location.href='/reports'}>View report <ArrowUpRight size={14}/></button>}>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.revenueTrend} margin={{top:12,right:10,left:0,bottom:0}}><defs><linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4779ed" stopOpacity={0.18}/><stop offset="95%" stopColor="#4779ed" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8a94a6'}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8a94a6'}} width={36}/><Tooltip formatter={(v:any) => [`₫${v}M`, 'Revenue']}/><Area type="monotone" dataKey="hotelA" name="Hotel A" stroke="#4779ed" fill="url(#blueArea)" strokeWidth={2.5}/><Area type="monotone" dataKey="hotelB" name="Hotel B" stroke="#25b99a" fill="transparent" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div>
        <div className="legend"><span><i className="blue-dot"/> Hotel A</span><span><i className="green-dot"/> Hotel B</span></div>
      </Panel>
      <Panel title="Hotel performance" subtitle="Current occupancy" action={<button className="icon-button" title="Details" onClick={() => window.location.href='/rooms'}><ArrowUpRight size={17}/></button>}>
        <div className="property-list">{data.properties.map((p: AnyRow) => <div className="property-row" key={p.id}><div className="property-symbol"><Building2 size={18}/></div><div className="property-info"><strong>{p.name}</strong><span>{p.rooms} rooms · {p.city}</span><div className="progress"><i style={{width:`${p.occupancy}%`}}/></div></div><div className="property-number"><strong>{p.occupancy}%</strong><span>occupied</span></div></div>)}</div>
        <div className="property-footer"><span>Combined monthly revenue</span><strong>{money(data.revenue)}</strong></div>
      </Panel>
    </div>
    <div className="content-grid two-one lower-grid">
      <Panel title="Reservation activity" subtitle="Recent and upcoming bookings" action={<button className="text-button" onClick={() => window.location.href='/reservations'}>All reservations <ArrowUpRight size={14}/></button>}>
        <ReservationTable rows={data.reservations.slice(0,4)} compact/>
      </Panel>
      <Panel title="Needs attention" subtitle="Tasks that may need action" action={<Badge tone="warning">{data.tasks.length} items</Badge>}>
        <div className="attention-list">{data.tasks.map((task: AnyRow) => <div className="attention-item" key={task.id}><div className={`attention-icon ${task.priority === 'High' ? 'urgent' : ''}`}><AlertTriangle size={16}/></div><div className="attention-text"><strong>{task.title}</strong><span>{task.property} · {task.assignee}</span></div><Badge tone={task.status === 'Overdue' ? 'danger' : 'warning'}>{task.status}</Badge></div>)}</div>
      </Panel>
    </div>
    <Panel title="Recent activity" subtitle="Latest updates across your business"><div className="activity-list">{data.activity.map((a: AnyRow) => <div className="activity-item" key={a.id}><div className="activity-dot"><CheckCircle2 size={16}/></div><div><strong>{a.text}</strong><span>{a.by}</span></div><time>{a.time}</time></div>)}</div></Panel>
  </>;
}
function SearchBar({ value, onChange, placeholder = 'Search records...' }: { value: string; onChange: (v:string)=>void; placeholder?: string }) {
  return <label className="search-box"><Search size={17}/><input id="global-search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>{value && <button type="button" onClick={() => onChange('')}><X size={14}/></button>}</label>;
}
function ReservationTable({ rows, compact = false, onStatusChange, onDelete }: { rows: AnyRow[]; compact?: boolean; onStatusChange?: (id: string, status: string) => void; onDelete?: (id: string, guest: string) => void }) {
  if (!rows.length) return <EmptyState title="No reservations found" text="Try changing your search or add a reservation."/>;
  const statuses = ['Confirmed', 'Arriving today', 'Checked in', 'Checked out', 'Cancelled', 'No-show'];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return <div className="table-scroll"><table>
    <thead><tr><th>BOOKING / GUEST</th><th>HOTEL</th><th>ROOM</th><th>STAY</th><th>STATUS</th>{!compact && <th>AMOUNT</th>}{!compact && onDelete && <th>ACTIONS</th>}</tr></thead>
    <tbody>{rows.map(r => {
      const expired = r.checkOut < today;
      return <tr key={r.id}>
        <td><strong>{r.guest}</strong><span className="cell-sub">{r.id} · {r.source}</span></td>
        <td>{r.propertyId === 'hotel-a' ? 'Hotel A' : r.propertyId === 'hotel-b' ? 'Hotel B' : (r.property || 'Unknown hotel')}</td>
        <td>{r.room}</td>
        <td><span>{r.checkIn}</span><span className="cell-sub">to {r.checkOut}</span></td>
        <td>{!compact && onStatusChange && !expired
          ? <select aria-label={`Status for ${r.guest}`} value={statuses.includes(r.status) ? r.status : 'Confirmed'} onChange={e => onStatusChange(r.id, e.target.value)}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select>
          : <><Badge tone={r.status === 'Checked in' ? 'success' : r.status === 'Arriving today' ? 'info' : 'neutral'}>{r.status}</Badge>{!compact && expired && <span className="cell-sub">Status locked: stay has ended</span>}</>}
        </td>
        {!compact && <td className="amount-cell">{money(r.amount)}</td>}
        {!compact && onDelete && <td><button type="button" onClick={() => onDelete(r.id, r.guest)}>Delete</button></td>}
      </tr>;
    })}</tbody>
  </table></div>;
}

function ReservationCalendar({ property }: { property: string }) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.reservations('', property)
      .then(r => {
        if (active) {
          setRows(r.data || []);
          setError('');
        }
      })
      .catch(e => {
        if (active) setError(e.message || 'Could not load reservations.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [property]);

  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const today = dateKey(new Date());
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - ((firstDay.getDay() + 6) % 7)
  );
  const days = Array.from({ length: 42 }, (_, i) =>
    new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
  );

  const activeRows = rows.filter(r =>
    !['cancelled', 'no-show', 'noshow'].includes(String(r.status || '').toLowerCase())
  );

  const eventsFor = (date: string) => {
    const events: { row: AnyRow; type: 'in' | 'out' }[] = [];
    activeRows.forEach(r => {
      if (r.checkIn === date) events.push({ row: r, type: 'in' });
      if (r.checkOut === date) events.push({ row: r, type: 'out' });
    });
    return events.sort((a, b) =>
      String(a.row.room || '').localeCompare(String(b.row.room || ''), undefined, { numeric: true })
    );
  };

  const monthLabel = month.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });

  return <>
    <PageHeader
      eyebrow="FRONT DESK"
      title="Reservation Calendar"
      description="See guest arrivals and departures by date and room across your selected hotels."
      actions={
        <Button variant="secondary" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
          <CalendarDays size={15}/> Today
        </Button>
      }
    />

    <Panel title={monthLabel} subtitle="Each entry shows the room number and guest name."
      action={
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            ← Previous
          </Button>
          <Button variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            Next →
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, fontSize: 13 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#2563eb' }}/>
          Check-in
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#ea580c' }}/>
          Check-out
        </span>
        <span style={{ color: 'var(--muted, #64748b)' }}>Use the hotel selector at the top to filter the calendar.</span>
      </div>

      {error && <div className="notice error">{error}</div>}
      {loading ? <div className="loading"><RefreshCw className="spin"/> Loading reservations…</div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1, background: 'var(--border, #e2e8f0)', border: '1px solid var(--border, #e2e8f0)' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} style={{ background: 'var(--panel, #f8fafc)', padding: '10px 4px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
                {day}
              </div>
            ))}
            {days.map(day => {
              const key = dateKey(day);
              const inMonth = day.getMonth() === month.getMonth();
              const isToday = key === today;
              const events = eventsFor(key);
              return (
                <div key={key} style={{
                  background: 'var(--surface, white)',
                  minWidth: 0,
                  minHeight: 112,
                  padding: 5,
                  opacity: inMonth ? 1 : 0.48,
                  outline: isToday ? '2px solid #2563eb' : undefined,
                  outlineOffset: -2
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: isToday ? 800 : 600,
                    marginBottom: 5,
                    color: isToday ? '#2563eb' : 'inherit'
                  }}>
                    {day.getDate()}{isToday ? ' · Today' : ''}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {events.slice(0, 4).map((event, index) => (
                      <div key={`${event.row.id}-${event.type}-${index}`} title={`${event.type === 'in' ? 'Check-in' : 'Check-out'} · Room ${event.row.room} · ${event.row.guest}`} style={{
                        background: event.type === 'in' ? '#dbeafe' : '#ffedd5',
                        color: event.type === 'in' ? '#1d4ed8' : '#9a3412',
                        borderLeft: `3px solid ${event.type === 'in' ? '#2563eb' : '#ea580c'}`,
                        borderRadius: 3,
                        padding: '4px 3px',
                        fontSize: 11,
                        lineHeight: 1.35,
                        overflowWrap: 'anywhere'
                      }}>
                        <strong>{event.type === 'in' ? 'IN' : 'OUT'} · {event.row.room}</strong>
                        <div>{event.row.guest}</div>
                      </div>
                    ))}
                    {events.length > 4 && (
                      <div style={{ fontSize: 11, color: 'var(--muted, #64748b)' }}>
                        +{events.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted, #64748b)' }}>
            {activeRows.length} active reservations · {activeRows.filter(r => r.checkIn === today).length} check-ins today · {activeRows.filter(r => r.checkOut === today).length} check-outs today
          </div>
        </>
      )}
    </Panel>
  </>;
}

function Reservations({ property }: { property: string }) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const [selectedProperty, setSelectedProperty] = useState('hotel-a');
  useEffect(() => {
    if (property !== 'all') {
      setSelectedProperty(property);
      setSelectedRoom('');
    }
  }, [property]);

  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [selectedRoom, setSelectedRoom] = useState('');
  const [roomOptions, setRoomOptions] = useState<AnyRow[]>([]);

  const load = () => {
    setLoading(true);
    api.reservations(query, property).then(r => setRows(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  async function changeReservationStatus(id: string, status: string) {
    if (status === 'Checked in' || status === 'Checked out') {
      const guest = rows.find((row: AnyRow) => row.id === id);
      const action = status === 'Checked in' ? 'check in' : 'check out';
      const roomAction = status === 'Checked in'
        ? 'The room will be marked as Occupied.'
        : 'The room will be marked as Dirty for housekeeping.';

      const confirmed = window.confirm(
        `Are you sure you want to ${action}${guest ? ` ${guest.guest}` : ''}?\n\n${roomAction}`
      );

      if (!confirmed) {
        await load();
        return;
      }
    }

    try {
      setError('');
      await api.updateReservation(id, { status });
      await load();
    } catch (e: any) {
      setError(e.message || 'Could not update reservation status.');
      await load();
    }
  }

  async function deleteReservation(id: string, guest: string) {
    const confirmed = window.confirm(
      `Permanently delete reservation ${id} for ${guest}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setError('');
      await api.deleteReservation(id);
      load();
    } catch (e: any) {
      setError(e.message || 'Could not delete reservation.');
    }
  }

  useEffect(() => { load(); }, [query, property]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    api.rooms()
      .then(roomResult => {
        if (!active) return;

        // Show every room in the selected hotel.
        // Booking conflicts and maintenance restrictions are validated by the backend.
        const rooms = roomResult.data.filter(
          (room: AnyRow) => room.propertyId === selectedProperty
        );

        setRoomOptions(rooms);
        setSelectedRoom(current =>
          rooms.some((room: AnyRow) => String(room.number) === current)
            ? current
            : ''
        );
      })
      .catch(e => {
        if (active) setError(e.message);
      });

    return () => { active = false; };
  }, [open, selectedProperty]);  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); try { await api.createReservation({ guest:f.get('guest'), propertyId:f.get('propertyId'), room:f.get('room'), checkIn:f.get('checkIn'), checkOut:f.get('checkOut'), guests:f.get('guests'), amount:f.get('amount'), source:f.get('source') }); setOpen(false); load(); } catch(e:any) { alert(e.message); } }
  return <><PageHeader eyebrow="HOTEL OPERATIONS" title="Reservations" description="Manage guest bookings, stay dates, and booking status." actions={<Button onClick={() => setOpen(true)}><Plus size={16}/> New reservation</Button>}/><div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search guest, booking ID, source…"/><div className="toolbar-right"><Badge tone="info">{rows.length} bookings</Badge><Button variant="secondary" onClick={load}><RefreshCw size={15}/> Refresh</Button></div></div>{error && <div className="notice error">{error}</div>}<Panel title="All reservations" subtitle="Sample bookings from the simulated API">{loading ? <div className="loading">Loading reservations…</div> : <ReservationTable rows={rows} onStatusChange={changeReservationStatus} onDelete={deleteReservation}/>}</Panel>{open && <Modal title="Create reservation" onClose={() => setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2">Guest full name<input name="guest" required placeholder="Enter guest name"/></label><label>Hotel<select name="propertyId" value={selectedProperty} onChange={e => { setSelectedProperty(e.target.value); setSelectedRoom(""); }}><option value="hotel-a">Hotel A</option><option value="hotel-b">Hotel B</option></select></label><label>Room number<select name="room" required value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}><option value="">Select an available room</option>{roomOptions.map((room: AnyRow) => <option key={room.id} value={room.number}>{room.number} · {room.type} · Floor {room.floor}</option>)}</select>{roomOptions.length === 0 && <small>No rooms available for these dates.</small>}</label><label>Check-in<input type="date" name="checkIn" required min={today} value={checkInDate} onChange={e => setCheckInDate(e.target.value)} /></label><label>Check-out<input type="date" name="checkOut" required min={checkInDate || undefined} value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} /></label><label>Guests<input type="number" name="guests" min="1" defaultValue="2"/></label><label>Amount (VND)<input type="number" name="amount" min="0" defaultValue="1500000"/></label><label className="span-2">Booking source<select name="source"><option>Direct</option><option>Phone</option><option>Walk-in</option><option>Booking.com</option><option>Agoda</option><option>Travel agent</option></select></label><div className="form-actions span-2"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create reservation</Button></div></form></Modal>}</>;
}
function Rooms({ property }: { property: string }) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [selectedNoteRoom, setSelectedNoteRoom] = useState<AnyRow | null>(null);
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
      setSelectedNoteRoom(null);
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
    maintenance: rows.filter(r => r.status === 'Maintenance').length,
    inspected: rows.filter(r => r.status === 'Inspected').length
  }), [rows]);

  return <>
    <PageHeader eyebrow="HOTEL OPERATIONS" title="Room management" description="View room availability, update operational status, and maintain room notes." actions={<Button variant="secondary" onClick={load}><RefreshCw size={15}/> Refresh</Button>}/>
    <div className="mini-stat-grid">
      <div><span>Clean / available</span><strong>{counts.available}</strong></div>
      <div><span>Occupied</span><strong>{counts.occupied}</strong></div>
      <div><span>Needs cleaning</span><strong>{counts.dirty}</strong></div>
      <div><span>Maintenance</span><strong>{counts.maintenance}</strong></div>
      <div><span>Inspected</span><strong>{counts.inspected}</strong></div>
    </div>
    <div className="toolbar">
      <SearchBar value={query} onChange={setQuery} placeholder="Search room number or type…"/>
      <span className="muted">{rows.length} rooms</span>
    </div>
    <div className="room-grid">
      {rows.map(room => <div className={"room-card status-" + room.status.toLowerCase().replace(' ','-')} key={room.id}>
        <div className="room-card-top">
          <div className="room-number">{room.number}</div>
          <select className={"room-status-select status-" + room.status.toLowerCase().replace(" ","-")} aria-label={"Update status for room " + room.number} value={room.status} onChange={e => changeStatus(room.id,e.target.value)}><option>Clean</option><option>Dirty</option><option>Occupied</option><option>Maintenance</option><option>Inspected</option></select>
        </div>
        <strong>{room.type}</strong>
        <span>{room.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'} · Floor {room.floor}</span>

        <div className="room-notes">
          <strong>Room notes</strong>
          <p className="room-note-text">{room.note || 'No note added.'}</p>
          <Button variant="secondary" onClick={() => {
            setNoteDrafts(prev => ({ ...prev, [room.id]: room.note || '' }));
            setSelectedNoteRoom(room);
          }}>
            {room.note ? 'Edit note' : 'Add note'}
          </Button>
        </div>
      </div>)}
    </div>
    {selectedNoteRoom && <Modal
      title={`Room ${selectedNoteRoom.number} notes`}
      onClose={() => {
        if (!savingNotes[selectedNoteRoom.id]) {
          setNoteDrafts(prev => ({
            ...prev,
            [selectedNoteRoom.id]: selectedNoteRoom.note || ''
          }));
          setSelectedNoteRoom(null);
        }
      }}
    >
      <div className="form-grid">
        <p className="muted span-2">
          {selectedNoteRoom.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'}
          {' · '} {selectedNoteRoom.type} · Floor {selectedNoteRoom.floor}
        </p>
        <label className="span-2">
          Room notes
          <textarea
            autoFocus
            value={noteDrafts[selectedNoteRoom.id] ?? ''}
            onChange={e => setNoteDrafts(prev => ({
              ...prev,
              [selectedNoteRoom.id]: e.target.value
            }))}
            maxLength={2000}
            rows={6}
            placeholder="Add information about this room…"
          />
        </label>
        <span className="muted span-2">
          {(noteDrafts[selectedNoteRoom.id] || '').length}/2000 characters
        </span>
        <div className="form-actions span-2">
          <Button
            variant="secondary"
            onClick={() => {
              setNoteDrafts(prev => ({
                ...prev,
                [selectedNoteRoom.id]: selectedNoteRoom.note || ''
              }));
              setSelectedNoteRoom(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => saveNote(selectedNoteRoom)}
          >
            {savingNotes[selectedNoteRoom.id] ? 'Saving…' : 'Save note'}
          </Button>
        </div>
      </div>
    </Modal>}
  </>;
}
function Employees() {
  const [rows, setRows] = useState<AnyRow[]>([]); const [query, setQuery] = useState(''); const [open,setOpen] = useState(false); const [department, setDepartment] = useState(''); const jobTitleByDepartment: Record<string, string> = { 'Front Office': 'Receptionist', Housekeeping: 'Housekeeper', Management: 'Hotel Manager', Finance: 'Accountant' };
  const load = () => api.employees(query).then(r => setRows(r.data)).catch(() => {});
  useEffect(() => { load(); }, [query]);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); await api.createEmployee({name:f.get('name'), jobTitle:f.get('jobTitle'), property:f.get('property'), department:f.get('department'), salary:f.get('salary')}); setOpen(false); load(); }
  async function deleteEmployee(employee: AnyRow) {
    const confirmed = window.confirm(`Delete employee "${employee.name}" (${employee.id})? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await api.deleteEmployee(employee.id);
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not delete employee.');
    }
  }
  return <><PageHeader eyebrow="PEOPLE & CULTURE" title="Human resources" description="Employee directory and staffing overview." actions={<Button onClick={() => setOpen(true)}><Plus size={16}/> Add employee</Button>}/><div className="mini-stat-grid"><div><span>Total employees</span><strong>{rows.length}</strong></div><div><span>On shift</span><strong>{rows.filter(r=>r.status==='On shift').length}</strong></div><div><span>Departments</span><strong>{new Set(rows.map(r=>r.department)).size}</strong></div><div><span>Monthly base salaries</span><strong>{money(rows.reduce((s,r)=>s+Number(r.salary||0),0))}</strong></div></div><div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search employees, roles, departments…"/></div><Panel title="Employee directory" subtitle="Demo records; salary data is shown for prototyping only"><div className="table-scroll"><table><thead><tr><th>EMPLOYEE</th><th>ROLE / DEPARTMENT</th><th>PROPERTY</th><th>STATUS</th><th>MONTHLY BASE</th><th>ACTIONS</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><div className="employee-cell"><div className="avatar">{r.name.split(' ').slice(-1)[0].slice(0,1)}{r.name.split(' ')[0].slice(0,1)}</div><div><strong>{r.name}</strong><span className="cell-sub">{r.id}</span></div></div></td><td><strong>{r.jobTitle}</strong><span className="cell-sub">{r.department}</span></td><td>{r.property}</td><td><Badge tone={r.status==='On shift'?'success':'neutral'}>{r.status}</Badge></td><td className="amount-cell">{money(r.salary)}</td><td><Button variant="secondary" onClick={() => deleteEmployee(r)}>Delete</Button></td></tr>)}</tbody></table></div></Panel>{open && <Modal title="Add employee" onClose={() => setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2">Full name<input name="name" required placeholder="Employee full name"/></label><label>Department<select name="department" value={department} onChange={e => setDepartment(e.target.value)} required><option value="">Select department</option><option value="Front Office">Front Office</option><option value="Housekeeping">Housekeeping</option><option value="Management">Management</option><option value="Finance">Finance</option></select></label><label>Job title<select name="jobTitle" value={department ? jobTitleByDepartment[department] : ""} required disabled={!department}><option value="">Select department first</option>{department && <option value={jobTitleByDepartment[department]}>{jobTitleByDepartment[department]}</option>}</select></label><label>Property<select name="property"><option>Hotel A</option><option>Hotel B</option><option>Group</option></select></label><label>Monthly base salary (VND)<input type="number" name="salary" min="0" defaultValue="9000000"/></label><div className="form-actions span-2"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save employee</Button></div></form></Modal>}</>;
}
function Finance() {
  const [rows,setRows] = useState<AnyRow[]>([]); const [query,setQuery] = useState(''); const [open,setOpen] = useState(false);
  const load=()=>api.expenses(query).then(r=>setRows(r.data)).catch(()=>{}); useEffect(()=>{load();},[query]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);await api.createExpense({description:f.get('description'),category:f.get('category'),property:f.get('property'),amount:f.get('amount'),date:f.get('date')});setOpen(false);load();}
  const total=rows.reduce((s,r)=>s+Number(r.amount||0),0);
  return <><PageHeader eyebrow="FINANCE" title="Finance & expenses" description="Track operating expenses and monitor approval status." actions={<Button onClick={()=>setOpen(true)}><Plus size={16}/> Record expense</Button>}/><div className="mini-stat-grid"><div><span>Expenses in sample data</span><strong>{money(total)}</strong></div><div><span>Awaiting approval</span><strong>{rows.filter(r=>r.status==='Pending').length}</strong></div><div><span>Approved</span><strong>{rows.filter(r=>r.status==='Approved').length}</strong></div><div><span>Records</span><strong>{rows.length}</strong></div></div><div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search expense records…"/></div><Panel title="Expense register" subtitle="Sample data persisted by the simulated API"><div className="table-scroll"><table><thead><tr><th>DATE / REFERENCE</th><th>DESCRIPTION</th><th>CATEGORY</th><th>PROPERTY</th><th>STATUS</th><th>AMOUNT</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.date}</strong><span className="cell-sub">{r.id}</span></td><td>{r.description}</td><td>{r.category}</td><td>{r.property}</td><td><Badge tone={r.status==='Approved'?'success':'warning'}>{r.status}</Badge></td><td className="amount-cell">{money(r.amount)}</td></tr>)}</tbody></table></div></Panel>{open&&<Modal title="Record an expense" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2">Description<input name="description" required placeholder="What was purchased or paid for?"/></label><label>Category<select name="category"><option>Utilities</option><option>Supplies</option><option>Maintenance</option><option>Payroll</option><option>Marketing</option><option>Other</option></select></label><label>Business unit<select name="property"><option>Hotel A</option><option>Hotel B</option></select></label><label>Amount (VND)<input type="number" name="amount" min="1" required/></label><label>Date<input type="date" name="date" defaultValue="2026-10-19"/></label><div className="form-actions span-2"><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit">Save expense</Button></div></form></Modal>}</>;
}
function Maintenance() {
  const [tasks,setTasks]=useState<AnyRow[]>([]); useEffect(()=>{api.tasks().then(r=>setTasks(r.data)).catch(()=>{});},[]);
  return <><PageHeader eyebrow="PROPERTY OPERATIONS" title="Maintenance" description="Monitor repairs, service requests, and property tasks." actions={<Button onClick={()=>alert('Task creation endpoint can be added next.')}><Plus size={16}/> New request</Button>}/><div className="mini-stat-grid"><div><span>Open tasks</span><strong>{tasks.length}</strong></div><div><span>High priority</span><strong>{tasks.filter(t=>t.priority==='High').length}</strong></div><div><span>Overdue</span><strong>{tasks.filter(t=>t.status==='Overdue').length}</strong></div><div><span>Completed today</span><strong>4</strong></div></div><Panel title="Maintenance & operational tasks" subtitle="Sample task register"><div className="table-scroll"><table><thead><tr><th>TASK</th><th>PROPERTY</th><th>ASSIGNED TO</th><th>PRIORITY</th><th>STATUS</th></tr></thead><tbody>{tasks.map(t=><tr key={t.id}><td><strong>{t.title}</strong><span className="cell-sub">{t.id}</span></td><td>{t.property}</td><td>{t.assignee}</td><td><Badge tone={t.priority==='High'?'danger':'neutral'}>{t.priority}</Badge></td><td><Badge tone={t.status==='Overdue'?'warning':'info'}>{t.status}</Badge></td></tr>)}</tbody></table></div></Panel></>;
}
function Reports({property}:{property:string}) {
  const [data,setData]=useState<AnyRow|null>(null);useEffect(()=>{api.overview(property).then(r=>setData(r.data));},[property]);
  return <><PageHeader eyebrow="BUSINESS INTELLIGENCE" title="Reports & analytics" description="Explore the performance indicators used in the owner dashboard." actions={<Button variant="secondary" onClick={()=>window.print()}><FileText size={16}/> Print report</Button>}/><div className="stat-grid"><StatCard title="Revenue" value={money(data?.revenue||0)} icon={<CircleDollarSign size={19}/>} note="sample month"/><StatCard title="Operating profit" value={money(data?.operatingProfit||0)} icon={<ChartNoAxesCombined size={19}/>} note="illustrative estimate"/><StatCard title="Occupancy" value={`${data?.occupancy||0}%`} icon={<BedDouble size={19}/>} note="selected properties"/><StatCard title="Staff" value={String(data?.employeeCount||0)} icon={<Users size={19}/>} note="group-wide sample"/></div><Panel title="Revenue comparison" subtitle="VND millions · sample values"><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.revenueTrend||[]} margin={{top:12,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5"/><XAxis dataKey="month" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Bar dataKey="hotelA" name="Hotel A" fill="#4779ed" radius={[5,5,0,0]}/><Bar dataKey="hotelB" name="Hotel B" fill="#25b99a" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></Panel><div className="notice"><AlertTriangle size={17}/><div><strong>Reporting note</strong><span>Operating profit is a demonstration estimate, not a formal accounting calculation. Connect verified transactions and accounting rules before relying on reports.</span></div></div></>;
}
function SettingsPage() {
  return <><PageHeader eyebrow="ADMINISTRATION" title="Settings" description="Configure how your business management system is organized."/><div className="settings-grid">{[{icon:<Building2/>,title:'Business & properties',text:'Manage hotels, business units, addresses, and operating settings.'},{icon:<Users/>,title:'Users & permissions',text:'Manage user accounts, roles, and property access.'},{icon:<Wallet/>,title:'Finance configuration',text:'Set currencies, expense categories, and approval thresholds.'},{icon:<Bell/>,title:'Notifications',text:'Choose which alerts and reminders are sent to each role.'},{icon:<FileText/>,title:'Documents & policies',text:'Configure document categories and retention policies.'},{icon:<Settings/>,title:'System preferences',text:'Language, time zone, date format, and application preferences.'}].map((s,i)=><button className="settings-card" key={i} onClick={()=>alert('Settings UI placeholder. This module will be connected to its API in a later iteration.')}><div className="settings-icon">{s.icon}</div><strong>{s.title}</strong><span>{s.text}</span><ArrowUpRight size={16}/></button>)}</div><div className="notice demo-notice"><AlertTriangle size={17}/><div><strong>Prototype security</strong><span>Demo mode does not implement real authentication or authorization. Do not enter real personal, payroll, or financial data.</span></div></div></>;
}
function ComingSoon({title,description,icon}:{title:string;description:string;icon:ReactNode}) {
  return <><PageHeader eyebrow="BUSINESS OPERATIONS" title={title} description={description}/><div className="coming-card"><div className="coming-icon">{icon}</div><h2>Module foundation is ready</h2><p>This section is included in the navigation and can be built next. Its production endpoints and workflows have not yet been implemented in the simulated API.</p><Button onClick={()=>alert('This module is on the implementation roadmap.')}>View implementation roadmap <ArrowUpRight size={15}/></Button></div></>;
}
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18}/></button></div>{children}</div></div>;
}
function ErrorState({error,retry}:{error:string;retry:()=>void}) { return <div className="error-state"><AlertTriangle size={24}/><h2>Could not load data</h2><p>{error}. Make sure the simulated API server is running.</p><Button onClick={retry}><RefreshCw size={15}/> Try again</Button></div>; }
export default App;

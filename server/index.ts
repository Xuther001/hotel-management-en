import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(cors());
app.use(express.json());
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');

type AnyRecord = Record<string, any>;
function initialData() {
  return {
    properties: [
      { id: 'hotel-a', name: 'Hotel A', city: 'Ho Chi Minh City', rooms: 80, occupancy: 82, revenue: 1400000000 },
      { id: 'hotel-b', name: 'Hotel B', city: 'Ho Chi Minh City', rooms: 60, occupancy: 69, revenue: 1000000000 }
    ],
    reservations: [
      { id: 'RES-1048', guest: 'Nguyen Minh Anh', room: '305', propertyId: 'hotel-a', checkIn: '2026-10-19', checkOut: '2026-10-22', guests: 2, status: 'Checked in', source: 'Direct', amount: 4500000 },
      { id: 'RES-1049', guest: 'Tran Quoc Bao', room: '212', propertyId: 'hotel-b', checkIn: '2026-10-19', checkOut: '2026-10-21', guests: 1, status: 'Confirmed', source: 'Booking.com', amount: 2600000 },
      { id: 'RES-1050', guest: 'Le Thu Ha', room: '408', propertyId: 'hotel-a', checkIn: '2026-10-19', checkOut: '2026-10-20', guests: 2, status: 'Arriving today', source: 'Phone', amount: 1800000 },
      { id: 'RES-1051', guest: 'Pham Gia Huy', room: '118', propertyId: 'hotel-b', checkIn: '2026-10-20', checkOut: '2026-10-24', guests: 3, status: 'Confirmed', source: 'Agoda', amount: 5200000 },
      { id: 'RES-1052', guest: 'Vo Ngoc Linh', room: '501', propertyId: 'hotel-a', checkIn: '2026-10-21', checkOut: '2026-10-23', guests: 2, status: 'Confirmed', source: 'Direct', amount: 3100000 }
    ],
    rooms: [
      { id: 'A-301', number: '301', type: 'Deluxe King', propertyId: 'hotel-a', status: 'Occupied', floor: 3 },
      { id: 'A-302', number: '302', type: 'Twin Deluxe', propertyId: 'hotel-a', status: 'Clean', floor: 3 },
      { id: 'A-303', number: '303', type: 'Superior Queen', propertyId: 'hotel-a', status: 'Dirty', floor: 3 },
      { id: 'A-304', number: '304', type: 'Deluxe King', propertyId: 'hotel-a', status: 'Maintenance', floor: 3 },
      { id: 'A-401', number: '401', type: 'Suite', propertyId: 'hotel-a', status: 'Clean', floor: 4 },
      { id: 'B-201', number: '201', type: 'Superior Queen', propertyId: 'hotel-b', status: 'Occupied', floor: 2 },
      { id: 'B-202', number: '202', type: 'Twin Deluxe', propertyId: 'hotel-b', status: 'Clean', floor: 2 },
      { id: 'B-203', number: '203', type: 'Deluxe King', propertyId: 'hotel-b', status: 'Dirty', floor: 2 },
      { id: 'B-301', number: '301', type: 'Suite', propertyId: 'hotel-b', status: 'Occupied', floor: 3 },
      { id: 'B-302', number: '302', type: 'Deluxe King', propertyId: 'hotel-b', status: 'Clean', floor: 3 }
    ],
    employees: [
      { id: 'EMP-001', name: 'Nguyen Thi Mai', role: 'Front Desk', property: 'Hotel A', status: 'On shift', department: 'Front Office', salary: 12000000 },
      { id: 'EMP-002', name: 'Tran Van Duc', role: 'Housekeeping', property: 'Hotel A', status: 'On shift', department: 'Housekeeping', salary: 9000000 },
      { id: 'EMP-003', name: 'Le Thanh Vy', role: 'Hotel Manager', property: 'Hotel B', status: 'On shift', department: 'Management', salary: 22000000 },
      { id: 'EMP-004', name: 'Pham Hoang Nam', role: 'Accountant', property: 'Group', status: 'On leave', department: 'Finance', salary: 16000000 },
      { id: 'EMP-005', name: 'Vo Thi Lan', role: 'Marketing Executive', property: 'Marketing', status: 'On shift', department: 'Marketing', salary: 14000000 }
    ],
    expenses: [
      { id: 'EXP-021', date: '2026-10-18', category: 'Utilities', property: 'Hotel A', description: 'Electricity bill', amount: 28500000, status: 'Approved' },
      { id: 'EXP-022', date: '2026-10-18', category: 'Supplies', property: 'Hotel B', description: 'Guest amenities', amount: 7400000, status: 'Pending' },
      { id: 'EXP-023', date: '2026-10-17', category: 'Maintenance', property: 'Hotel A', description: 'Air conditioning service', amount: 5200000, status: 'Approved' },
      { id: 'EXP-024', date: '2026-10-16', category: 'Marketing', property: 'Marketing', description: 'Campaign spend', amount: 12000000, status: 'Approved' }
    ],
    tasks: [
      { id: 'TASK-01', title: 'Inspect room 304 air conditioner', property: 'Hotel A', priority: 'High', status: 'Overdue', assignee: 'Maintenance team' },
      { id: 'TASK-02', title: 'Prepare rooms 303 and 203', property: 'Both hotels', priority: 'Normal', status: 'In progress', assignee: 'Housekeeping' },
      { id: 'TASK-03', title: 'Renew employee contract', property: 'Hotel B', priority: 'Normal', status: 'Pending', assignee: 'HR' }
    ],
    marketing: {
      clients: [
        { id: 'CL-001', name: 'Lotus Retail', service: 'Social media + Ads', status: 'Active', monthlyFee: 25000000 },
        { id: 'CL-002', name: 'Green Garden Cafe', service: 'Content marketing', status: 'Active', monthlyFee: 12000000 },
        { id: 'CL-003', name: 'Internal: Hotel A', service: 'Hotel campaigns', status: 'Active', monthlyFee: 0 }
      ],
      campaigns: [
        { id: 'CAM-11', name: 'October Brand Awareness', client: 'Lotus Retail', budget: 18000000, status: 'Running', leads: 124 },
        { id: 'CAM-12', name: 'Weekend Stay Promotion', client: 'Internal: Hotel A', budget: 8000000, status: 'Running', leads: 46 }
      ]
    },
    activity: [
      { id: 1, text: 'Reservation RES-1048 checked in', by: 'Front Desk', time: '09:12' },
      { id: 2, text: 'Expense EXP-022 submitted for approval', by: 'Hotel B', time: '08:45' },
      { id: 3, text: 'Room 303 marked for cleaning', by: 'Housekeeping', time: '08:20' }
    ]
  };
}
function readData(): AnyRecord {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify(initialData(), null, 2));
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}
function writeData(data: AnyRecord) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }
function list<T extends AnyRecord>(items: T[], req: express.Request) {
  const q = String(req.query.q || '').toLowerCase();
  const propertyId = String(req.query.property_id || '');
  const filtered = items.filter(x => (!q || JSON.stringify(x).toLowerCase().includes(q)) &&
    (!propertyId || x.propertyId === propertyId || x.property === propertyId || propertyId === 'all'));
  return { data: filtered, total: filtered.length };
}
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', mode: 'simulated-api', warning: 'Demo data only' }));
app.get('/api/v1/auth/me', (_req, res) => res.json({ data: { id: 'demo-owner', name: 'Business Owner', role: 'Owner', permissions: ['*'] } }));
app.post('/api/v1/auth/login', (_req, res) => res.json({ data: { user: { id: 'demo-owner', name: 'Business Owner', role: 'Owner' }, demo: true, message: 'Demo login only; authentication is not implemented.' } }));

app.get('/api/v1/properties', (_req, res) => res.json({ data: readData().properties }));
app.get('/api/v1/dashboard/overview', (req, res) => {
  const d = readData();
  const propertyId = String(req.query.property_id || 'all');
  const properties = propertyId === 'all' ? d.properties : d.properties.filter((p: AnyRecord) => p.id === propertyId);
  const reservations = propertyId === 'all' ? d.reservations : d.reservations.filter((x: AnyRecord) => x.propertyId === propertyId);
  const employees = d.employees;
  const revenue = properties.reduce((s: number, p: AnyRecord) => s + p.revenue, 0);
  const rooms = properties.reduce((s: number, p: AnyRecord) => s + p.rooms, 0);
  const weighted = properties.reduce((s: number, p: AnyRecord) => s + p.rooms * p.occupancy, 0);
  res.json({ data: {
    revenue, operatingProfit: Math.round(revenue * 0.30), occupancy: rooms ? Math.round(weighted / rooms) : 0,
    employeeCount: employees.length, arrivals: reservations.filter((r: AnyRecord) => r.status === 'Arriving today').length,
    departures: reservations.filter((r: AnyRecord) => r.checkOut === '2026-10-19').length,
    properties, reservations: reservations.slice(0, 5), tasks: d.tasks, activity: d.activity,
    revenueTrend: [
      { month: 'May', hotelA: 1120, hotelB: 890 }, { month: 'Jun', hotelA: 1180, hotelB: 930 },
      { month: 'Jul', hotelA: 1320, hotelB: 970 }, { month: 'Aug', hotelA: 1250, hotelB: 1010 },
      { month: 'Sep', hotelA: 1370, hotelB: 980 }, { month: 'Oct', hotelA: 1400, hotelB: 1000 }
    ]
  }});
});
app.get('/api/v1/reservations', (req, res) => res.json(list(readData().reservations, req)));
app.post('/api/v1/reservations', (req, res) => {
  const d = readData();
  const body = req.body || {};
  if (!body.guest || !body.checkIn || !body.checkOut || !body.propertyId) return res.status(400).json({ error: 'Guest, check-in, check-out, and property are required.' });
  if (body.checkOut <= body.checkIn) return res.status(400).json({ error: 'Check-out must be after check-in.' });
  const id = `RES-${1053 + d.reservations.length}`;
  const item = { id, guest: body.guest, room: body.room || 'Unassigned', propertyId: body.propertyId, checkIn: body.checkIn, checkOut: body.checkOut, guests: Number(body.guests || 1), status: 'Confirmed', source: body.source || 'Direct', amount: Number(body.amount || 0) };
  d.reservations.unshift(item); d.activity.unshift({ id: Date.now(), text: `Reservation ${id} created for ${item.guest}`, by: 'Demo User', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }); writeData(d);
  res.status(201).json({ data: item });
});
app.patch('/api/v1/reservations/:id', (req, res) => {
  const d = readData(); const item = d.reservations.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Reservation not found.' });
  Object.assign(item, req.body); writeData(d); res.json({ data: item });
});
app.get('/api/v1/rooms', (req, res) => res.json(list(readData().rooms, req)));
app.patch('/api/v1/rooms/:id/status', (req, res) => {
  const d = readData(); const item = d.rooms.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Room not found.' });
  const allowed = ['Clean', 'Dirty', 'Occupied', 'Maintenance', 'Inspected'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid room status.' });
  item.status = req.body.status; writeData(d); res.json({ data: item });
});
app.get('/api/v1/employees', (req, res) => res.json(list(readData().employees, req)));
app.post('/api/v1/employees', (req, res) => {
  const d = readData(); if (!req.body.name || !req.body.role) return res.status(400).json({ error: 'Name and role are required.' });
  const item = { id: `EMP-${String(d.employees.length + 1).padStart(3, '0')}`, name: req.body.name, role: req.body.role, property: req.body.property || 'Group', status: 'Active', department: req.body.department || 'General', salary: Number(req.body.salary || 0) };
  d.employees.push(item); writeData(d); res.status(201).json({ data: item });
});
app.get('/api/v1/finance/expenses', (req, res) => res.json(list(readData().expenses, req)));
app.post('/api/v1/finance/expenses', (req, res) => {
  const d = readData(); const item = { id: `EXP-${String(Date.now()).slice(-5)}`, date: req.body.date || new Date().toISOString().slice(0,10), category: req.body.category || 'Other', property: req.body.property || 'Hotel A', description: req.body.description || 'New expense', amount: Number(req.body.amount || 0), status: 'Pending' };
  d.expenses.unshift(item); writeData(d); res.status(201).json({ data: item });
});
app.get('/api/v1/housekeeping/tasks', (_req, res) => res.json({ data: readData().tasks }));
app.get('/api/v1/marketing/clients', (_req, res) => res.json({ data: readData().marketing.clients }));
app.get('/api/v1/marketing/campaigns', (_req, res) => res.json({ data: readData().marketing.campaigns }));
app.get('/api/v1/audit-logs', (_req, res) => res.json({ data: readData().activity }));
app.use('/api', (_req, res) => res.status(404).json({ error: 'Simulated endpoint not implemented yet.' }));
app.listen(4000, () => console.log('Simulated API listening at http://localhost:4000'));

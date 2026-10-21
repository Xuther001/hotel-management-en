const fs = require('fs');
const path = require('path');

const file = path.join('server', 'data.json');
const backup = path.join('server', 'data.json.before-room-import-2026-10-21.bak');
const today = '2026-10-21';

const bookings = [
  { room: 'G02', guest: 'NGUYỄN QUỐC VỊNH / NGUYỄN XUÂN HẠNH', checkIn: '2026-07-01', checkOut: '2027-07-01', guests: 2 },
  { room: '101', guest: 'NGUYỄN THỊ XUÂN PHÚC', checkIn: '2026-10-12', checkOut: '2027-01-12', guests: 1 },
  { room: '102', guest: 'HOÀNG NINH KHÔI', checkIn: '2026-12-10', checkOut: '2027-01-12', guests: 1 },
  { room: '105', guest: 'PHAM THI HONG / THUY VAN VU', checkIn: '2026-10-04', checkOut: '2026-11-17', guests: 2 },
  { room: '106', guest: 'TÔ QUANG VINH / NGUYỄN NHẬT MINH', checkIn: '2026-10-12', checkOut: '2027-01-12', guests: 2 },
  { room: '201', guest: 'SILSON ALEC BYRON', checkIn: '2026-10-09', checkOut: '2026-10-31', guests: 1 },
  { room: '202', guest: 'CAO QUỐC ĐẠT', checkIn: '2026-10-12', checkOut: '2027-01-12', guests: 1 },
  { room: '203', guest: 'PHẠM THỊ PHƯƠNG NGA', checkIn: '2026-01-01', checkOut: '2027-01-01', guests: 1 },
  { room: '204', guest: 'NGUYỄN PHƯƠNG THẢO', checkIn: '2026-10-12', checkOut: '2027-01-12', guests: 1 },
  { room: '206', guest: 'HÀ VĨNH THIỆN', checkIn: '2026-10-01', checkOut: '2026-11-01', guests: 1 },
  { room: '301', guest: 'VÕ NGỌC THUÝ HƯƠNG / NGUYỄN HUYỀN TRÂN', checkIn: '2026-10-12', checkOut: '2027-01-12', guests: 2 },
  { room: '302', guest: 'MAI ANH ĐỨC', checkIn: '2026-10-21', checkOut: '2026-10-22', guests: 1 },
  { room: '304', guest: 'TRƯƠNG NGỌC HÙNG', checkIn: '2026-10-01', checkOut: '2026-11-01', guests: 1 },
  { room: '501', guest: 'TRẦN KHẮC VINH', checkIn: '2026-10-18', checkOut: '2027-12-18', guests: 1 },
  { room: '504', guest: 'HUYNH DUC THU', checkIn: '2026-06-01', checkOut: '2027-06-01', guests: 1 },
  { room: '602', guest: 'NGUYỄN THỊ ĐÔNG', checkIn: '2026-10-10', checkOut: '2026-10-23', guests: 1 },
  { room: '603', guest: 'NGUYỄN THÁI SƠN / NGUYỄN ĐÌNH HOÀNG', checkIn: '2026-10-10', checkOut: '2026-11-10', guests: 2 },
  { room: '604', guest: 'PHẠM VĂN THÁNG', checkIn: '2026-10-18', checkOut: '2026-10-24', guests: 1 },
  { room: '605', guest: 'DAVIDS THOMAS WALTER', checkIn: '2026-10-20', checkOut: '2026-10-25', guests: 1 }
];

function run() {
  if (fs.existsSync(backup)) {
    throw new Error('Backup already exists. Stopping to avoid overwriting it.');
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (!Array.isArray(data.reservations) || data.reservations.length !== 0) {
    throw new Error('Reservations are not empty. Nothing was changed.');
  }

  const rooms = data.rooms.filter(r =>
    bookings.some(b => String(r.number) === b.room) &&
    r.propertyId === 'hotel-a'
  );

  for (const b of bookings) {
    const room = rooms.find(r => String(r.number) === b.room);
    if (!room) throw new Error(`Room ${b.room} was not found in Hotel A.`);
    if (room.status === 'Maintenance') {
      throw new Error(`Room ${b.room} is under Maintenance. Nothing was changed.`);
    }
    if (!(b.checkIn < b.checkOut)) {
      throw new Error(`Invalid dates for room ${b.room}.`);
    }
  }

  if (rooms.length !== bookings.length) {
    throw new Error('Room validation failed. Nothing was changed.');
  }

  const reservations = bookings.map((b, i) => {
    let status = 'Confirmed';
    if (b.checkIn <= today && b.checkOut > today) status = 'Checked in';
    else if (b.checkOut <= today) status = 'Checked out';

    return {
      id: `RES-${1053 + i}`,
      guest: b.guest,
      room: b.room,
      propertyId: 'hotel-a',
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      status,
      source: 'Direct',
      amount: 0
    };
  });

  // Back up the original before changing anything.
  fs.copyFileSync(file, backup);

  try {
    for (const b of bookings) {
      const room = rooms.find(r => String(r.number) === b.room);
      if (b.checkIn <= today && b.checkOut > today) {
        room.status = 'Occupied';
      } else if (b.checkOut <= today) {
        room.status = 'Dirty';
      }
    }

    data.reservations = reservations;
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

    console.log('Import successful.');
    console.log('Reservations added:', data.reservations.length);
    console.log('Backup:', backup);
    console.log('Active stays:', reservations.filter(r => r.status === 'Checked in').length);
    console.log('Future stays:', reservations.filter(r => r.status === 'Confirmed').length);
  } catch (error) {
    fs.copyFileSync(backup, file);
    throw error;
  }
}

try {
  run();
} catch (error) {
  console.error('IMPORT STOPPED:', error.message);
  process.exitCode = 1;
}

import { Router } from 'express';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { getDb, saveDb, resetDbToDemo } from './db.js';
import type {
  User,
  Party,
  MaterialItem,
  SnackDuty,
  Rsvp,
  ActivityLog,
  PartyPhoto,
  ChatMessage,
} from '../src/types/party.js';

export const apiRouter = Router();

// Helper to log activities
function logActivity(
  partyId: string,
  userId: string,
  username: string,
  userName: string,
  action: string,
  details?: string
) {
  const db = getDb();
  const log: ActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    partyId,
    userId,
    username,
    userName,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  db.activityLogs.unshift(log);
  if (db.activityLogs.length > 50) {
    db.activityLogs = db.activityLogs.slice(0, 50);
  }
  saveDb(db);
}

// ---------------- AUTH ROUTES (Username & Password) ----------------
apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username aur password dono zaroori hain!' });
  }

  const db = getDb();
  const cleanUsername = username.toLowerCase().trim();

  // Match by username or email
  const user = db.users.find(
    (u) =>
      (u.username.toLowerCase() === cleanUsername ||
        (u.email && u.email.toLowerCase() === cleanUsername)) &&
      u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Galat username ya password! Sahi pehchaan daalo.' });
  }

  const { passwordHash: _, ...userSafe } = user;
  return res.json({ user: userSafe, token: `token_${user.id}` });
});

apiRouter.post('/auth/register', (req, res) => {
  const { username, name, password, phone, role } = req.body;
  if (!username || !name || !password) {
    return res.status(400).json({ error: 'Username, Naam aur Password compulsory hai!' });
  }

  const db = getDb();
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username kam se kam 3 characters ka hona chahiye!' });
  }

  const existing = db.users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(409).json({ error: 'Ye username already booked hai kisi aur khiladi ne!' });
  }

  const avatarColors = [
    'bg-amber-600',
    'bg-rose-500',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-blue-600',
    'bg-orange-500',
    'bg-teal-600',
  ];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const newUser = {
    id: `usr_${Date.now()}`,
    username: cleanUsername,
    name: name.trim(),
    email: `${cleanUsername}@laiyaa.party`,
    passwordHash: password,
    role: (role === 'admin' ? 'admin' : 'member') as 'admin' | 'member',
    phone: phone?.trim() || '',
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const { passwordHash: _, ...userSafe } = newUser;
  return res.status(201).json({ user: userSafe, token: `token_${newUser.id}` });
});

apiRouter.get('/auth/users', (req, res) => {
  const db = getDb();
  const users = db.users.map(({ passwordHash: _, ...rest }) => rest);
  return res.json({ users });
});

// ---------------- PARTY ROUTES ----------------
apiRouter.get('/party/current', (req, res) => {
  const db = getDb();
  const party = db.parties[0];
  if (!party) {
    return res.status(404).json({ error: 'Party nahi mili!' });
  }
  return res.json({ party });
});

apiRouter.patch('/party/current', (req, res) => {
  const db = getDb();
  const party = db.parties[0];
  if (!party) {
    return res.status(404).json({ error: 'Party nahi mili!' });
  }

  const updates = req.body;

  // Strict Admin enforcement for Date & Time
  if (updates.scheduledDate || updates.scheduledTime) {
    const isAdmin =
      updates.userId === 'usr_rahul' ||
      updates.username === 'rahul' ||
      req.headers['x-admin-password'] === 'admin123' ||
      updates.adminPassword === 'admin123';

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Permission Denied! Party ki tareekh aur time badalna sirf Admin (Rahul Ranjan) ke hath me hai.',
      });
    }
  }

  const updatedParty: Party = {
    ...party,
    ...updates,
    venue: 'LMS Certifications Private Limited',
    venueAddress: 'LMS Certifications Private Limited',
    id: party.id,
  };

  db.parties[0] = updatedParty;
  saveDb(db);

  logActivity(
    party.id,
    updates.userId || 'usr_rahul',
    updates.username || 'rahul',
    updates.userName || 'Rahul Ranjan (Admin)',
    `Admin ne party date & time update kiya: ${updates.scheduledDate ? `${updates.scheduledDate} (${updates.scheduledTime || party.scheduledTime})` : 'Settings update'}`
  );

  return res.json({ party: updatedParty });
});

apiRouter.post('/party/date-poll/vote', (req, res) => {
  const { optionId, userId, username, userName } = req.body;
  if (!optionId || !userId) {
    return res.status(400).json({ error: 'Option aur User ID zaroori hai!' });
  }

  const db = getDb();
  const party = db.parties[0];
  if (!party) return res.status(404).json({ error: 'Party nahi mili' });

  party.datePollOptions = party.datePollOptions || [];
  const option = party.datePollOptions.find((o) => o.id === optionId);
  if (!option) return res.status(404).json({ error: 'Date option nahi mila' });

  const hasVoted = option.votes.includes(userId);
  if (hasVoted) {
    option.votes = option.votes.filter((id) => id !== userId);
  } else {
    option.votes.push(userId);
  }

  saveDb(db);
  logActivity(
    party.id,
    userId,
    username || 'member',
    userName || 'Khiladi',
    hasVoted
      ? `Tareekh se vote wapas liya: ${option.label}`
      : `Vote diya: ${option.label}`
  );

  return res.json({ party });
});

apiRouter.post('/party/date-poll/add', (req, res) => {
  const { date, label, userId, username, userName } = req.body;
  if (!date || !label) {
    return res.status(400).json({ error: 'Tareekh aur label daalna zaroori hai!' });
  }

  const db = getDb();
  const party = db.parties[0];
  if (!party) return res.status(404).json({ error: 'Party nahi mili' });

  party.datePollOptions = party.datePollOptions || [];
  const newOption = {
    id: `poll_${Date.now()}`,
    date,
    label,
    votes: userId ? [userId] : [],
  };

  party.datePollOptions.push(newOption);
  saveDb(db);

  logActivity(
    party.id,
    userId || 'member',
    username || 'member',
    userName || 'Khiladi',
    `Nayi party date suggest ki: ${label}`
  );

  return res.json({ party });
});

// ---------------- MATERIALS FROM HOME ROUTES ----------------
apiRouter.get('/materials', (req, res) => {
  const db = getDb();
  return res.json({ materials: db.materials });
});

apiRouter.post('/materials', (req, res) => {
  const { name, category, quantity, notes, userId, username, userName } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Saman ka naam aur category daalo!' });
  }

  const db = getDb();
  const newItem: MaterialItem = {
    id: `mat_${Date.now()}`,
    partyId: db.parties[0]?.id || 'party_1',
    name: name.trim(),
    category,
    quantity: quantity?.trim() || 'Ghar se 1 Dabba / Pack',
    status: 'unassigned',
    notes: notes?.trim() || 'Ghar se laya jayega',
    updatedAt: new Date().toISOString(),
  };

  db.materials.push(newItem);
  saveDb(db);

  logActivity(
    newItem.partyId,
    userId || 'system',
    username || 'member',
    userName || 'Khiladi',
    `Ghar se laane ki list me add kiya: ${newItem.name} (${newItem.quantity})`
  );

  return res.status(201).json({ material: newItem });
});

apiRouter.patch('/materials/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDb();

  const index = db.materials.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Saman nahi mila' });
  }

  const existing = db.materials[index];
  const updatedItem: MaterialItem = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  db.materials[index] = updatedItem;
  saveDb(db);

  if (updates.actionDesc) {
    logActivity(
      updatedItem.partyId,
      updates.userId || 'system',
      updates.username || 'member',
      updates.userName || 'Khiladi',
      updates.actionDesc
    );
  }

  return res.json({ material: updatedItem });
});

apiRouter.delete('/materials/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const item = db.materials.find((m) => m.id === id);
  if (!item) return res.status(404).json({ error: 'Item nahi mila' });

  db.materials = db.materials.filter((m) => m.id !== id);
  saveDb(db);

  logActivity(
    item.partyId,
    req.body.userId || 'admin',
    req.body.username || 'rahulranjan',
    req.body.userName || 'Rahul Ranjan (Admin)',
    `List se hataya: ${item.name}`
  );

  return res.json({ success: true });
});

// ---------------- SNACK DUTIES ROUTES (Kaam-Kaaj & Zimmedari) ----------------
apiRouter.get('/duties', (req, res) => {
  const db = getDb();
  return res.json({ duties: db.duties });
});

apiRouter.post('/duties', (req, res) => {
  const { title, description, skillLevel, maxMembers, userId, username, userName } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Role title aur description compulsory hai!' });
  }

  const db = getDb();
  const newDuty: SnackDuty = {
    id: `duty_${Date.now()}`,
    partyId: db.parties[0]?.id || 'party_1',
    title: title.trim(),
    description: description.trim(),
    skillLevel: skillLevel || 'Fun & Easy',
    assignedMemberIds: [],
    assignedUsernames: [],
    assignedMemberNames: [],
    maxMembers: Number(maxMembers) || 2,
    status: 'open',
  };

  db.duties.push(newDuty);
  saveDb(db);

  logActivity(
    newDuty.partyId,
    userId || 'admin',
    username || 'rahulranjan',
    userName || 'Rahul Ranjan (Admin)',
    `Naya snack making task create kiya: ${newDuty.title}`
  );

  return res.status(201).json({ duty: newDuty });
});

apiRouter.post('/duties/:id/claim', (req, res) => {
  const { id } = req.params;
  const { userId, username, userName } = req.body;
  if (!userId || !userName) {
    return res.status(400).json({ error: 'Pehchaan details zaroori hain!' });
  }

  const db = getDb();
  const duty = db.duties.find((d) => d.id === id);
  if (!duty) return res.status(404).json({ error: 'Duty nahi mili' });

  duty.assignedUsernames = duty.assignedUsernames || [];

  if (duty.assignedMemberIds.includes(userId)) {
    // Unclaim
    duty.assignedMemberIds = duty.assignedMemberIds.filter((uid) => uid !== userId);
    duty.assignedMemberNames = duty.assignedMemberNames.filter((un) => un !== userName);
    duty.assignedUsernames = duty.assignedUsernames.filter((un) => un !== (username || ''));
    duty.status = duty.assignedMemberIds.length === 0 ? 'open' : 'claimed';

    saveDb(db);
    logActivity(
      duty.partyId,
      userId,
      username || 'member',
      userName,
      `Zimmedari chhodi: ${duty.title}`
    );
    return res.json({ duty, action: 'unclaimed' });
  }

  if (duty.assignedMemberIds.length >= duty.maxMembers) {
    return res.status(400).json({ error: 'Bhai is role ki seat full ho chuki hai!' });
  }

  duty.assignedMemberIds.push(userId);
  duty.assignedMemberNames.push(userName);
  if (username) duty.assignedUsernames.push(username);
  duty.status = duty.assignedMemberIds.length >= duty.maxMembers ? 'claimed' : 'open';

  saveDb(db);
  logActivity(
    duty.partyId,
    userId,
    username || 'member',
    userName,
    `Ye zimmedari apne kandho par li: ${duty.title}`
  );

  return res.json({ duty, action: 'claimed' });
});

// ---------------- RSVPS / HAZIRI ROUTES ----------------
apiRouter.get('/rsvps', (req, res) => {
  const db = getDb();
  return res.json({ rsvps: db.rsvps });
});

apiRouter.post('/rsvps', (req, res) => {
  const { userId, username, userName, status, notes, spicinessPreference } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ error: 'User aur attendance status zaroori hai!' });
  }

  const db = getDb();
  const partyId = db.parties[0]?.id || 'party_1';
  const existingIndex = db.rsvps.findIndex((r) => r.userId === userId);

  const rsvpRecord: Rsvp = {
    id: existingIndex >= 0 ? db.rsvps[existingIndex].id : `rsvp_${Date.now()}`,
    partyId,
    userId,
    username: username || 'guest',
    userName: userName || 'Khiladi',
    status,
    notes: notes || '',
    spicinessPreference: spicinessPreference || 'Desi Chataakedar (Medium)',
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    db.rsvps[existingIndex] = rsvpRecord;
  } else {
    db.rsvps.push(rsvpRecord);
  }

  saveDb(db);
  logActivity(
    partyId,
    userId,
    username || 'member',
    userName,
    `Apni haziri update ki: ${status === 'attending' ? 'Pakka Aa Raha Hoon (Full Scene)' : status === 'tentative' ? 'Shayad (50-50)' : 'Nahi Aa Paunga'}`
  );

  return res.json({ rsvp: rsvpRecord });
});

// ---------------- ACTIVITY LOGS ----------------
apiRouter.get('/activity', (req, res) => {
  const db = getDb();
  return res.json({ logs: db.activityLogs || [] });
});

// ---------------- RESET DEMO DATA ----------------
apiRouter.post('/reset-demo', (req, res) => {
  const db = resetDbToDemo();
  return res.json({ success: true, message: 'Sab kuch fresh demo par reset ho gaya!', db });
});

// ---------------- ADMIN PASSWORD VERIFY ROUTE ----------------
apiRouter.post('/admin/verify-password', (req, res) => {
  const { password } = req.body;
  const db = getDb();
  const admin = db.users.find((u) => u.role === 'admin');
  const validPassword = admin?.passwordHash || 'admin123';

  if (password === validPassword) {
    return res.json({ success: true, message: 'Admin access unlock ho gaya!' });
  }
  return res.status(401).json({ error: 'Galat Admin Password! Sirf Rahul Ranjan (Admin) access kar sakta hai.' });
});

// ---------------- EXCEL EXPORT (ADMIN - PASSWORD PROTECTED) ----------------
apiRouter.get('/admin/export-excel', (req, res) => {
  try {
    const db = getDb();
    const admin = db.users.find((u) => u.role === 'admin');
    const validPassword = admin?.passwordHash || 'admin123';

    const reqPassword = req.headers['x-admin-password'] || req.query.admin_password;
    if (reqPassword !== validPassword) {
      return res.status(401).json({
        error: 'Admin Password Zaroori Hai! Excel sheet download karne ke liye admin password daalo.',
      });
    }

    const party = db.parties[0];

    const wb = XLSX.utils.book_new();

    // 1. Party Adda & Overview
    const partyOverview = [
      ['LAIYAA PARTY PLANNER - OFFICIAL RECORD SHEET', ''],
      ['Party Host & Admin', 'Rahul Ranjan (Admin) - @rahulranjan'],
      ['Party Venue / Adda', party.venue],
      ['Venue Address', party.venueAddress || 'LMS Certifications Private Limited'],
      ['Party Ki Tareekh', party.scheduledDate],
      ['Shuru Hone Ka Time', party.scheduledTime],
      ['Vibe / Style', party.vibe],
      ['Spiciness Level', party.spiceLevel],
      ['Status', party.status.toUpperCase()],
      ['Party Budget Rule', '100% Ghar Ka Saman Potluck (Zero Cash Required)'],
      ['', ''],
      ['SUMMARY STATS', ''],
      ['Confirmed Dost (Attending)', db.rsvps.filter((r) => r.status === 'attending').length],
      ['Shayad Wale (Tentative)', db.rsvps.filter((r) => r.status === 'tentative').length],
      ['Total Ghar Se Laane Wale Items', db.materials.length],
      ['Items Already Pledged / Packed', db.materials.filter((m) => m.status !== 'unassigned').length],
      ['Snack Banane Ki Zimmedari Roles', db.duties.length],
      ['Claimed Duty Roles', db.duties.filter((d) => d.assignedMemberIds.length > 0).length],
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(partyOverview);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Party Adda Overview');

    // 2. Ghar Ka Saman (Materials from Home)
    const materialsRows = [
      [
        'Item ID',
        'Ghar Se Laane Ka Saman',
        'Category',
        'Kitna Chahiye (Quantity)',
        'Kaun Laa Raha Hai (Username)',
        'Khiladi Ka Naam',
        'Current Status',
        'Desi Jugaad / Prep Notes',
        'Last Update Date',
      ],
      ...db.materials.map((m) => [
        m.id,
        m.name,
        m.category.replace('_', ' ').toUpperCase(),
        m.quantity,
        m.assignedToUsername ? `@${m.assignedToUsername}` : 'UNASSIGNED',
        m.assignedToMemberName || 'Kisi Ne Claim Nahi Kiya Abhi',
        m.status.toUpperCase(),
        m.notes || 'Ghar se layenge',
        new Date(m.updatedAt).toLocaleDateString(),
      ]),
    ];
    const wsMaterials = XLSX.utils.aoa_to_sheet(materialsRows);
    XLSX.utils.book_append_sheet(wb, wsMaterials, 'Ghar Ka Saman (Potluck)');

    // 3. Kaam-Kaaj & Duties (Who does what in snack making)
    const dutyRows = [
      [
        'Duty ID',
        'Snack Banane Ka Kaam (Role)',
        'Skill / Vibe Level',
        'Kaun Karega (Usernames)',
        'Khiladiyon Ke Naam',
        'Crew Strength (Bhare / Total)',
        'Status',
        'Kaam Ka Description',
      ],
      ...db.duties.map((d) => [
        d.id,
        d.title,
        d.skillLevel,
        d.assignedUsernames && d.assignedUsernames.length > 0
          ? d.assignedUsernames.map((u) => `@${u}`).join(', ')
          : 'Open',
        d.assignedMemberNames.length > 0
          ? d.assignedMemberNames.join(', ')
          : 'Khali Seat',
        `${d.assignedMemberIds.length} / ${d.maxMembers}`,
        d.status.toUpperCase(),
        d.description,
      ]),
    ];
    const wsDuties = XLSX.utils.aoa_to_sheet(dutyRows);
    XLSX.utils.book_append_sheet(wb, wsDuties, 'Snack Banane Ki Zimmedari');

    // 4. Member Haziri & RSVPs
    const rsvpRows = [
      [
        'Username',
        'Khiladi Ka Naam',
        'Haziri (Attendance)',
        'Mirchi / Teekha Pasand (Spice)',
        'Dost Ka Message / Notes',
        'Timestamp',
      ],
      ...db.rsvps.map((r) => [
        `@${r.username}`,
        r.userName,
        r.status.toUpperCase(),
        r.spicinessPreference || 'Normal',
        new Date(r.updatedAt).toLocaleString(),
      ]),
    ];
    const wsRsvp = XLSX.utils.aoa_to_sheet(rsvpRows);
    XLSX.utils.book_append_sheet(wb, wsRsvp, 'Doston Ki Haziri (RSVP)');

    // 5. Member Photo Gallery (Stored in Admin Database)
    const photoRows = [
      ['Photo ID', 'Uploaded By', 'Caption / Description', 'Likes Count', 'Timestamp'],
      ...(db.photos || []).map((p) => [
        p.id,
        `${p.uploadedByName} (@${p.uploadedByUsername})`,
        p.caption,
        p.likes?.length || 0,
        new Date(p.timestamp).toLocaleString(),
      ]),
    ];
    const wsPhotos = XLSX.utils.aoa_to_sheet(photoRows);
    XLSX.utils.book_append_sheet(wb, wsPhotos, 'Doston Ki Photo Gallery');

    const excelBuffer = XLSX.write(wb, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    const filename = `LMS_Laiyaa_Party_Plan_${party.scheduledDate || 'Export'}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(excelBuffer);
  } catch (err) {
    console.error('Error generating Excel file:', err);
    return res.status(500).json({ error: 'Excel sheet banane me dikkat aayi' });
  }
});

// CSV format export (Password Protected)
apiRouter.get('/admin/export-csv', (req, res) => {
  try {
    const db = getDb();
    const admin = db.users.find((u) => u.role === 'admin');
    const validPassword = admin?.passwordHash || 'admin123';

    const reqPassword = req.headers['x-admin-password'] || req.query.admin_password;
    if (reqPassword !== validPassword) {
      return res.status(401).json({ error: 'Admin Password Zaroori Hai!' });
    }

    const rows = [
      ['Category', 'Item / Role', 'Brought By / Assigned', 'Quantity / Capacity', 'Status'],
      ...db.materials.map((m) => [
        'Ghar Ka Saman',
        m.name,
        m.assignedToUsername ? `@${m.assignedToUsername} (${m.assignedToMemberName})` : 'Unassigned',
        m.quantity,
        m.status,
      ]),
      ...db.duties.map((d) => [
        'Snack Making Duty',
        d.title,
        d.assignedMemberNames.join('; ') || 'Open',
        `${d.assignedMemberIds.length}/${d.maxMembers}`,
        d.status,
      ]),
      ...db.rsvps.map((r) => [
        'RSVP Haziri',
        r.userName,
        `@${r.username}`,
        r.spicinessPreference || 'Normal',
        r.status,
      ]),
      ...(db.photos || []).map((p) => [
        'Member Photo',
        p.caption,
        `${p.uploadedByName} (@${p.uploadedByUsername})`,
        `${p.likes?.length || 0} Likes`,
        'Admin DB Stored',
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="LMS_Laiyaa_Party_Records.csv"');
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ error: 'CSV file banane me error aaya' });
  }
});

// ================= PHOTOS ROUTES (STORED IN ADMIN'S DATABASE) =================

apiRouter.get('/photos', (req, res) => {
  const db = getDb();
  return res.json({ photos: db.photos || [] });
});

apiRouter.post('/photos', (req, res) => {
  const { url, caption, userId, username, userName, tags } = req.body;
  if (!url || !caption || !caption.trim()) {
    return res.status(400).json({ error: 'Photo data aur caption dono zaroori hain!' });
  }

  const db = getDb();
  const party = db.parties[0];

  const newPhoto: PartyPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    partyId: party?.id || 'party_1',
    url,
    caption: caption.trim(),
    uploadedByUserId: userId || 'usr_rahul',
    uploadedByUsername: username || 'rahul',
    uploadedByName: userName || 'Rahul Ranjan (Admin)',
    likes: [],
    tags: Array.isArray(tags) ? tags : ['bhelpuri_masti'],
    timestamp: new Date().toISOString(),
  };

  db.photos = db.photos || [];
  db.photos.unshift(newPhoto);
  saveDb(db);

  logActivity(
    newPhoto.partyId,
    newPhoto.uploadedByUserId,
    newPhoto.uploadedByUsername,
    newPhoto.uploadedByName,
    `Admin database me nayi photo upload ki: "${newPhoto.caption.substring(0, 35)}..."`
  );

  return res.status(201).json({ photo: newPhoto });
});

apiRouter.post('/photos/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID zaroori hai like ke liye' });
  }

  const db = getDb();
  const photo = db.photos?.find((p) => p.id === id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo nahi mili!' });
  }

  photo.likes = photo.likes || [];
  if (photo.likes.includes(userId)) {
    photo.likes = photo.likes.filter((uid) => uid !== userId);
  } else {
    photo.likes.push(userId);
  }

  saveDb(db);
  return res.json({ photo });
});

apiRouter.delete('/photos/:id', (req, res) => {
  const { id } = req.params;
  const { userId, adminPassword } = req.body || {};
  const db = getDb();
  const photo = db.photos?.find((p) => p.id === id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo nahi mili!' });
  }

  const isOwner = photo.uploadedByUserId === userId;
  const isAdmin =
    adminPassword === 'admin123' ||
    req.headers['x-admin-password'] === 'admin123' ||
    userId === 'usr_rahul';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: 'Sirf photo uploader ya Admin (Rahul) hi ise delete kar sakte hain!',
    });
  }

  db.photos = db.photos.filter((p) => p.id !== id);
  saveDb(db);

  return res.json({ success: true, id });
});

// ================= CHATBOT & MEMBER MESSAGING ROUTES =================

async function generateLaiyaaBotResponse(
  prompt: string,
  senderName: string,
  db: ReturnType<typeof getDb>
): Promise<string> {
  const party = db.parties[0];
  const lower = prompt.toLowerCase();

  // Try Google Gemini API if key is present in env
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({});
      const pledgedList = (db.materials || [])
        .map(
          (m) =>
            `- ${m.name} (${m.quantity}): ${
              m.assignedToMemberName
                ? `Brought by @${m.assignedToUsername} (${m.assignedToMemberName})`
                : 'Not yet claimed'
            }`
        )
        .join('\n');
      const dutiesList = (db.duties || [])
        .map((d) => `- ${d.title}: ${d.assignedMemberNames.join(', ') || 'Available'}`)
        .join('\n');

      const systemPrompt = `You are LaiyaaBot (Chef Murmura / Adda Dost), the lively and witty chatbot for the exclusive 7-member Laiyaa/Bhelpuri party.
Location: Strictly LMS Certifications Private Limited.
The 7 members only: Rahul Ranjan (Admin), Ankur, Yash, Nityanand, Ankita, Priyanka, Himani.
Potluck rule: 100% home items potluck, ZERO money or cash involved.
Date & Time: ${party?.scheduledDate || 'Upcoming'} at ${party?.scheduledTime || '04:30 PM'} (controlled by Admin Rahul).
The 4 snack duties: Cutting veggies, Mixing snacks, putting required items in bhelpuri, serving.
Current live materials:
${pledgedList}
Current duties:
${dutiesList}

Tone: Fun, warm, authentic Hinglish with emojis. Keep it concise (2-4 sentences max). If members ask who brings what, who does what, date, time, venue, or recipe tips, give accurate answers based on the live party data.`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `${senderName} asks: ${prompt}` }] }],
        config: { systemInstruction: systemPrompt },
      });
      if (res.text) return res.text.trim();
    } catch (err) {
      console.warn('Gemini API call failed, falling back to rule-based answers:', err);
    }
  }

  // Robust contextual fallback with live DB data
  if (
    lower.includes('bring') ||
    lower.includes('laana') ||
    lower.includes('saman') ||
    lower.includes('item') ||
    lower.includes('material')
  ) {
    const claimed = (db.materials || [])
      .filter((m) => m.assignedToMemberName)
      .map((m) => `• ${m.name}: @${m.assignedToUsername} (${m.assignedToMemberName})`)
      .join('\n');
    const unclaimed = (db.materials || [])
      .filter((m) => !m.assignedToMemberName)
      .map((m) => m.name)
      .join(', ');

    return `Arrey ${senderName}! Yahan hai live saman ki list:\n${claimed}\n${
      unclaimed
        ? `\nAbhi bache hue items: ${unclaimed}.`
        : '\nSaare items pledge ho chuke hain! 100% ghar ka potluck, zero cash! 🥣✨'
    }`;
  }

  if (
    lower.includes('duty') ||
    lower.includes('duties') ||
    lower.includes('kaam') ||
    lower.includes('snack making') ||
    lower.includes('karega') ||
    lower.includes('karegi')
  ) {
    const dutyStatus = (db.duties || [])
      .map((d) => `• ${d.title}: ${d.assignedMemberNames.join(', ') || 'Abhi open hai'}`)
      .join('\n');
    return `Snack making ke 4 mukhya roles hain:\n${dutyStatus}\n\nSabhi 7 khiladi milkar bhelpuri ko ekdum swadisht banayenge! 🔪🥣🗞️`;
  }

  if (
    lower.includes('kahan') ||
    lower.includes('where') ||
    lower.includes('venue') ||
    lower.includes('location') ||
    lower.includes('place')
  ) {
    return `Party ka adda ekdum pakka hai: LMS Certifications Private Limited! Hum sabhi 7 dost wahin milenge aur desi bhelpuri banayenge! 📍✨`;
  }

  if (
    lower.includes('kab') ||
    lower.includes('date') ||
    lower.includes('time') ||
    lower.includes('when') ||
    lower.includes('timing')
  ) {
    return `Scheduled tareekh hai: ${party?.scheduledDate || 'Upcoming'} aur shuru hoga ${
      party?.scheduledTime || '04:30 PM'
    } par at LMS Certifications Private Limited! Rahul Ranjan (Admin) ise kisi bhi din ya time par set kar sakte hain. ⏰🗓️`;
  }

  if (
    lower.includes('recipe') ||
    lower.includes('kaise') ||
    lower.includes('secret') ||
    lower.includes('tip') ||
    lower.includes('taste')
  ) {
    return `🤖 Chef Babu ka golden secret: Pehle pyaaz, namak, aur mirchi me Kachi Ghani mustard oil achhe se milao taaki aroma release ho. Phir murmura aur namkeen fold karo, aur TAMATAR + NIMBU aakhri 30 seconds me daalo taaki bhelpuri crunch rahe aur sog na ho! 😋🔥`;
  }

  if (lower.includes('chai') || lower.includes('tea')) {
    return `Kadhak adrak wali chai bhelpuri ke sath mandatory hai! Laiyaa khane ke turant baad ek cup garam cutting chai alag hi sukoon deti hai! ☕✨`;
  }

  return `Kya baat hai ${senderName}! Hum sabhi 7 dost (Rahul, Ankur, Yash, Nityanand, Ankita, Priyanka, Himani) LMS Certifications Private Limited me full masti karne wale hain! Saman, duties ya timing ke bare me kuch bhi poochho, main turant bataunga! 🤖🎉`;
}

apiRouter.get('/chat/messages', (req, res) => {
  const db = getDb();
  return res.json({ messages: db.messages || [] });
});

apiRouter.post('/chat/messages', async (req, res) => {
  const { text, userId, username, userName } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message khali nahi ho sakta!' });
  }

  const db = getDb();
  const party = db.parties[0];

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    partyId: party?.id || 'party_1',
    senderId: userId || 'usr_rahul',
    senderUsername: username || 'rahul',
    senderName: userName || 'Rahul Ranjan (Admin)',
    senderRole: username === 'rahul' ? 'admin' : 'member',
    isBot: false,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    reactions: {},
  };

  db.messages = db.messages || [];
  db.messages.push(newMsg);
  saveDb(db);

  // Check if LaiyaaBot should respond
  const lower = text.toLowerCase();
  const triggersBot =
    lower.includes('@laiyaabot') ||
    lower.includes('@bot') ||
    lower.startsWith('bot') ||
    lower.includes('kya laana') ||
    lower.includes('who is bringing') ||
    lower.includes('duty') ||
    lower.includes('duties') ||
    lower.includes('recipe') ||
    lower.includes('kahan party') ||
    lower.includes('kab party');

  let botMessage: ChatMessage | null = null;
  if (triggersBot) {
    const botReply = await generateLaiyaaBotResponse(text, newMsg.senderName, db);
    botMessage = {
      id: `msg_bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      partyId: party?.id || 'party_1',
      senderId: 'bot_laiyaa',
      senderUsername: 'LaiyaaBot',
      senderName: 'LaiyaaBot (Chef Murmura)',
      senderRole: 'bot',
      isBot: true,
      text: botReply,
      timestamp: new Date(Date.now() + 500).toISOString(),
      reactions: { '🔥': [newMsg.senderId] },
    };
    db.messages.push(botMessage);
    saveDb(db);
  }

  return res.status(201).json({ message: newMsg, botMessage });
});

apiRouter.post('/chat/messages/:id/react', (req, res) => {
  const { id } = req.params;
  const { emoji, userId } = req.body;
  if (!emoji || !userId) {
    return res.status(400).json({ error: 'Emoji and userId required!' });
  }

  const db = getDb();
  const msg = db.messages?.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'Message nahi mila!' });
  }

  msg.reactions = msg.reactions || {};
  msg.reactions[emoji] = msg.reactions[emoji] || [];

  if (msg.reactions[emoji].includes(userId)) {
    msg.reactions[emoji] = msg.reactions[emoji].filter((uid) => uid !== userId);
    if (msg.reactions[emoji].length === 0) {
      delete msg.reactions[emoji];
    }
  } else {
    msg.reactions[emoji].push(userId);
  }

  saveDb(db);
  return res.json({ message: msg });
});

apiRouter.post('/chat/ask-bot', async (req, res) => {
  const { question, userId, username, userName } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question zaroori hai!' });
  }

  const db = getDb();
  const party = db.parties[0];

  // User question message
  const userMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    partyId: party?.id || 'party_1',
    senderId: userId || 'usr_rahul',
    senderUsername: username || 'rahul',
    senderName: userName || 'Rahul Ranjan',
    senderRole: username === 'rahul' ? 'admin' : 'member',
    isBot: false,
    text: question.trim(),
    timestamp: new Date().toISOString(),
    reactions: {},
  };

  db.messages = db.messages || [];
  db.messages.push(userMsg);

  // Bot response message
  const botReply = await generateLaiyaaBotResponse(question, userMsg.senderName, db);
  const botMsg: ChatMessage = {
    id: `msg_bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    partyId: party?.id || 'party_1',
    senderId: 'bot_laiyaa',
    senderUsername: 'LaiyaaBot',
    senderName: 'LaiyaaBot (Chef Murmura)',
    senderRole: 'bot',
    isBot: true,
    text: botReply,
    timestamp: new Date(Date.now() + 500).toISOString(),
    reactions: { '🔥': [userMsg.senderId] },
  };

  db.messages.push(botMsg);
  saveDb(db);

  return res.json({ userMessage: userMsg, botMessage: botMsg });
});

// ---------------- ZIP ARCHIVE DOWNLOAD ROUTE ----------------
apiRouter.get('/download-zip', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'laiyaa-party-planner.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="laiyaa-party-planner.zip"');
    return res.sendFile(zipPath);
  }
  const publicZipPath = path.resolve(process.cwd(), 'public/laiyaa-party-planner.zip');
  if (fs.existsSync(publicZipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="laiyaa-party-planner.zip"');
    return res.sendFile(publicZipPath);
  }
  return res.status(404).json({ error: 'Zip file abhi generate nahi hui hai.' });
});


import type {
  Party,
  MaterialItem,
  SnackDuty,
  Rsvp,
  ActivityLog,
  User,
  PartyPhoto,
  ChatMessage,
} from '../types/party.ts';

const BASE_URL = '/api';

export async function fetchCurrentParty(): Promise<Party> {
  const res = await fetch(`${BASE_URL}/party/current`);
  if (!res.ok) throw new Error('Failed to fetch party');
  const data = await res.json();
  return data.party;
}

export async function updateParty(updates: Partial<Party> & { userId?: string; username?: string; userName?: string; adminPassword?: string }): Promise<Party> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (updates.adminPassword) {
    headers['x-admin-password'] = updates.adminPassword;
  }
  const res = await fetch(`${BASE_URL}/party/current`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update party');
  }
  const data = await res.json();
  return data.party;
}

export async function voteDatePoll(optionId: string, userId: string, username: string, userName: string): Promise<Party> {
  const res = await fetch(`${BASE_URL}/party/date-poll/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId, userId, username, userName }),
  });
  if (!res.ok) throw new Error('Failed to vote');
  const data = await res.json();
  return data.party;
}

export async function addDatePollOption(date: string, label: string, userId: string, username: string, userName: string): Promise<Party> {
  const res = await fetch(`${BASE_URL}/party/date-poll/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, label, userId, username, userName }),
  });
  if (!res.ok) throw new Error('Failed to add date option');
  const data = await res.json();
  return data.party;
}

export async function fetchMaterials(): Promise<MaterialItem[]> {
  const res = await fetch(`${BASE_URL}/materials`);
  if (!res.ok) throw new Error('Failed to fetch materials');
  const data = await res.json();
  return data.materials;
}

export async function createMaterial(item: Partial<MaterialItem> & { userId?: string; username?: string; userName?: string }): Promise<MaterialItem> {
  const res = await fetch(`${BASE_URL}/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to create material item');
  const data = await res.json();
  return data.material;
}

export async function updateMaterial(id: string, updates: Partial<MaterialItem> & { actionDesc?: string; userId?: string; username?: string; userName?: string }): Promise<MaterialItem> {
  const res = await fetch(`${BASE_URL}/materials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update material');
  const data = await res.json();
  return data.material;
}

export async function deleteMaterial(id: string, userId?: string, username?: string, userName?: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/materials/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, username, userName }),
  });
  if (!res.ok) throw new Error('Failed to delete material');
  return true;
}

export async function fetchDuties(): Promise<SnackDuty[]> {
  const res = await fetch(`${BASE_URL}/duties`);
  if (!res.ok) throw new Error('Failed to fetch duties');
  const data = await res.json();
  return data.duties;
}

export async function createDuty(duty: Partial<SnackDuty> & { userId?: string; username?: string; userName?: string }): Promise<SnackDuty> {
  const res = await fetch(`${BASE_URL}/duties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(duty),
  });
  if (!res.ok) throw new Error('Failed to create snack duty');
  const data = await res.json();
  return data.duty;
}

export async function claimDuty(dutyId: string, userId: string, username: string, userName: string): Promise<SnackDuty> {
  const res = await fetch(`${BASE_URL}/duties/${dutyId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, username, userName }),
  });
  if (!res.ok) throw new Error('Failed to update duty claim');
  const data = await res.json();
  return data.duty;
}

export async function fetchRsvps(): Promise<Rsvp[]> {
  const res = await fetch(`${BASE_URL}/rsvps`);
  if (!res.ok) throw new Error('Failed to fetch RSVPs');
  const data = await res.json();
  return data.rsvps;
}

export async function submitRsvp(rsvp: Partial<Rsvp>): Promise<Rsvp> {
  const res = await fetch(`${BASE_URL}/rsvps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rsvp),
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  const data = await res.json();
  return data.rsvp;
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const res = await fetch(`${BASE_URL}/activity`);
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  const data = await res.json();
  return data.logs;
}

export async function resetDemoDatabase(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/reset-demo`, { method: 'POST' });
  return res.ok;
}

// Photo gallery API functions (Stored in Admin's database)
export async function fetchPhotos(): Promise<PartyPhoto[]> {
  const res = await fetch(`${BASE_URL}/photos`);
  if (!res.ok) throw new Error('Failed to fetch photos');
  const data = await res.json();
  return data.photos;
}

export async function uploadPhoto(photoData: {
  url: string;
  caption: string;
  userId: string;
  username: string;
  userName: string;
  tags?: string[];
}): Promise<PartyPhoto> {
  const res = await fetch(`${BASE_URL}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photoData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload photo');
  }
  const data = await res.json();
  return data.photo;
}

export async function likePhoto(photoId: string, userId: string): Promise<PartyPhoto> {
  const res = await fetch(`${BASE_URL}/photos/${photoId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  const data = await res.json();
  return data.photo;
}

export async function deletePhoto(photoId: string, userId: string, adminPassword?: string): Promise<boolean> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (adminPassword) headers['x-admin-password'] = adminPassword;
  const res = await fetch(`${BASE_URL}/photos/${photoId}`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ userId, adminPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete photo');
  }
  return true;
}

// Chatbot & member messaging API functions
export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const res = await fetch(`${BASE_URL}/chat/messages`);
  if (!res.ok) throw new Error('Failed to fetch chat messages');
  const data = await res.json();
  return data.messages;
}

export async function sendChatMessage(msgData: {
  text: string;
  userId: string;
  username: string;
  userName: string;
}): Promise<{ message: ChatMessage; botMessage?: ChatMessage }> {
  const res = await fetch(`${BASE_URL}/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msgData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}

export async function reactChatMessage(
  messageId: string,
  emoji: string,
  userId: string
): Promise<ChatMessage> {
  const res = await fetch(`${BASE_URL}/chat/messages/${messageId}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji, userId }),
  });
  if (!res.ok) throw new Error('Failed to react');
  const data = await res.json();
  return data.message;
}

export async function askChatbot(
  question: string,
  userId: string,
  username: string,
  userName: string
): Promise<{ userMessage: ChatMessage; botMessage: ChatMessage }> {
  const res = await fetch(`${BASE_URL}/chat/ask-bot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userId, username, userName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to ask bot');
  }
  return res.json();
}


export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  username: string; // Identification username
  name: string;
  email?: string;
  role: UserRole;
  phone?: string;
  avatarColor: string;
  createdAt: string;
}

export type MaterialCategory =
  | 'staple'
  | 'fresh_veggies'
  | 'namkeen_crunch'
  | 'spices_oil'
  | 'disposables_drinks';

export type MaterialStatus = 'unassigned' | 'pledged' | 'packed_at_home' | 'brought';

export interface MaterialItem {
  id: string;
  partyId: string;
  name: string;
  category: MaterialCategory;
  quantity: string;
  assignedToUsername?: string;
  assignedToMemberId?: string;
  assignedToMemberName?: string;
  status: MaterialStatus;
  notes?: string;
  updatedAt: string;
}

export type DutySkillLevel =
  | 'Fun & Easy'
  | 'Culinary Expert'
  | 'Precision Chopper'
  | 'High Energy';

export interface SnackDuty {
  id: string;
  partyId: string;
  title: string;
  description: string;
  skillLevel: DutySkillLevel;
  assignedMemberIds: string[];
  assignedUsernames: string[];
  assignedMemberNames: string[];
  maxMembers: number;
  status: 'open' | 'claimed' | 'ready';
}

export type PartyVibe =
  | 'Office Adda & Tea Break'
  | 'Street Food Jhalmuri'
  | 'Desi Snack Potluck'
  | 'Hostel Canteen Style';

export type SpiceLevel =
  | 'Mild'
  | 'Desi Chataakedar (Medium)'
  | 'Tez Teekha (Spicy)'
  | 'Rocket Fire (Extra Mirchi)';

export interface DatePollOption {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  votes: string[]; // User IDs
}

export interface Party {
  id: string;
  title: string;
  description: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. "04:30 PM"
  venue: string;
  venueAddress?: string;
  vibe: PartyVibe;
  spiceLevel: SpiceLevel;
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed';
  adminId: string;
  datePollOptions: DatePollOption[];
  createdAt: string;
}

export type RsvpStatus = 'attending' | 'tentative' | 'cannot_attend';

export interface Rsvp {
  id: string;
  partyId: string;
  userId: string;
  username: string;
  userName: string;
  status: RsvpStatus;
  notes?: string;
  spicinessPreference?: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  partyId: string;
  userId: string;
  username?: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface PartyPhoto {
  id: string;
  partyId: string;
  url: string; // Base64 data URL or photo URL
  caption: string;
  uploadedByUserId: string;
  uploadedByUsername: string;
  uploadedByName: string;
  likes: string[]; // User IDs who liked this photo
  tags?: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  partyId: string;
  senderId: string;
  senderUsername: string;
  senderName: string;
  senderRole?: 'admin' | 'member' | 'bot';
  isBot?: boolean;
  text: string;
  timestamp: string;
  reactions?: Record<string, string[]>; // e.g. { '🔥': ['usr_rahul'], '❤️': ['usr_ankita'] }
}

export interface DatabaseSchema {
  users: (User & { passwordHash?: string })[];
  parties: Party[];
  materials: MaterialItem[];
  duties: SnackDuty[];
  rsvps: Rsvp[];
  activityLogs: ActivityLog[];
  photos: PartyPhoto[];
  messages: ChatMessage[];
}


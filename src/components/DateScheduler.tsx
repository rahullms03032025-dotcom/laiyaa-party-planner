import React, { useState } from 'react';
import {
  Calendar,
  Check,
  Plus,
  Edit2,
  ThumbsUp,
  MapPin,
  Clock,
  Flame,
  Lock,
  Unlock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { Party, User, SpiceLevel, PartyVibe } from '../types/party.ts';

interface DateSchedulerProps {
  party: Party;
  currentUser: User | null;
  onVoteDate: (optionId: string) => void;
  onAddDateOption: (date: string, label: string) => void;
  onUpdateParty: (updates: Partial<Party> & { adminPassword?: string }) => Promise<any> | void;
}

export const DateScheduler: React.FC<DateSchedulerProps> = ({
  party,
  currentUser,
  onVoteDate,
  onAddDateOption,
  onUpdateParty,
}) => {
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState(false);

  // Admin password unlock for schedule edits
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(currentUser?.username === 'rahul');
  const [passError, setPassError] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Propose date/time form (Any day of the year, any time!)
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');

  // Admin edit form state
  const [editTitle, setEditTitle] = useState(party.title);
  const [editDate, setEditDate] = useState(party.scheduledDate);
  const [editTime, setEditTime] = useState(party.scheduledTime);
  const [editVibe, setEditVibe] = useState<PartyVibe>(party.vibe);
  const [editSpice, setEditSpice] = useState<SpiceLevel>(party.spiceLevel);

  const isAdmin = currentUser?.username === 'rahul' || currentUser?.role === 'admin';

  const handleVerifyAdminPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === 'admin123') {
      setIsAdminUnlocked(true);
      setPassError('');
    } else {
      setPassError('Galat Admin Password! Tareekh aur time badalne ka adhikar sirf Rahul Ranjan (Admin) ke pass hai.');
    }
  };

  const handleSaveAdminSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    try {
      await onUpdateParty({
        title: editTitle,
        scheduledDate: editDate,
        scheduledTime: editTime,
        venue: 'LMS Certifications Private Limited',
        venueAddress: 'LMS Certifications Private Limited',
        vibe: editVibe,
        spiceLevel: editSpice,
        adminPassword: adminPassInput || 'admin123',
      });
      setSaveSuccessMsg('Zabardast! Nayi tareekh aur time save ho gaya (Admin updated)!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setIsEditingAdmin(false);
      }, 1500);
    } catch (err: any) {
      setPassError(err?.message || 'Date aur time save karne me dikkat aayi. Admin password check karein.');
    }
  };

  const handleQuickSelectTime = (timeStr: string) => {
    setEditTime(timeStr);
  };

  const handleAddPollOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    const timeLabel = newTime ? ` (${newTime})` : '';
    const fullLabel = newLabel ? `${newLabel}${timeLabel}` : `Party on ${newDate}${timeLabel}`;
    onAddDateOption(newDate, fullLabel);
    setNewDate('');
    setNewTime('');
    setNewLabel('');
    setIsAddingOption(false);
  };

  const totalVotesAcrossPolls = (party.datePollOptions || []).reduce(
    (acc, opt) => acc + opt.votes.length,
    0
  );

  return (
    <section id="party-schedule" className="py-12 bg-stone-50/50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wide uppercase mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Any Day of the Year · Any Time · Admin Editable</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Party Ki Tareekh, Time & Adda
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Saal ke 365 dino me se kisi bhi din ya time par party plan ho sakti hai! Final decision Admin (Rahul Ranjan) ke hath me hai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddingOption(!isAddingOption)}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>Nayi Tareekh Suggest Karo</span>
            </button>

            <button
              onClick={() => {
                setIsEditingAdmin(!isEditingAdmin);
                if (currentUser?.username === 'rahul') {
                  setIsAdminUnlocked(true);
                }
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                isEditingAdmin
                  ? 'bg-stone-800 text-white hover:bg-stone-900'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>
                {isEditingAdmin
                  ? 'Form Band Karo'
                  : isAdmin
                  ? 'Admin: Tareekh & Time Badlo'
                  : 'Admin Only: Tareekh & Time Badlo'}
              </span>
            </button>
          </div>
        </div>

        {/* Admin Schedule Edit Panel (Password Protected for Rahul Ranjan) */}
        {isEditingAdmin && (
          <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-amber-400 shadow-sm transition-all animate-fadeIn">
            {!isAdminUnlocked ? (
              <form onSubmit={handleVerifyAdminPass} className="max-w-md mx-auto text-center space-y-3.5 py-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-1">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Admin Security Check
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Party ki final tareekh aur time badalna sirf <strong>Rahul Ranjan (Admin)</strong> ke adhikar me hai. Kripya Admin password daalein.
                  </p>
                </div>

                {passError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                <div className="flex gap-2 justify-center pt-2">
                  <input
                    type="password"
                    placeholder="Admin password (admin123)"
                    value={adminPassInput}
                    onChange={(e) => setAdminPassInput(e.target.value)}
                    className="text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 w-60 focus:outline-none focus:border-amber-500 font-mono"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-2xs"
                  >
                    Tala Kholo
                  </button>
                </div>
                <div className="text-[11px] text-stone-400">
                  Tip: Agar aap Rahul hain to password <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-stone-700">admin123</code> hai.
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveAdminSettings} className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Unlock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        Admin Control Panel: Set Any Day & Time
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Party can happen any time or any day of the year (Admin: Rahul Ranjan)
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 rounded-md self-start sm:self-auto flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Mode Active (Rahul)</span>
                  </span>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {passError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{passError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Party Ka Naam / Occasion
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-medium"
                      required
                    />
                  </div>

                  {/* Date - Any Day of Year */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Final Tareekh (Saal Ka Koi Bhi Din)
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-mono font-bold text-amber-900"
                      required
                    />
                    <div className="text-[10px] text-stone-500 mt-1">
                      Pick any date across the entire year (Jan - Dec).
                    </div>
                  </div>

                  {/* Time - Any Time of Day */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Shuru Hone Ka Time (Any Time of Day)
                    </label>
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      placeholder="e.g. 01:00 PM, 04:30 PM, 06:15 PM"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-mono font-bold text-amber-900"
                      required
                    />
                    {/* Quick Time Presets */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['01:00 PM', '04:00 PM', '05:00 PM', '06:30 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleQuickSelectTime(t)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            editTime === t
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Venue - Strictly LMS Certifications Private Limited */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Party Ka Adda (Venue - Strictly Fixed)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value="LMS Certifications Private Limited"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-100 font-bold text-stone-800 cursor-not-allowed pr-8"
                      />
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      Venue is fixed exclusively to LMS Certifications Private Limited.
                    </div>
                  </div>

                  {/* Vibe */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Party Ki Vibe
                    </label>
                    <select
                      value={editVibe}
                      onChange={(e) => setEditVibe(e.target.value as PartyVibe)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Office Adda & Tea Break">Office Adda & Tea Break</option>
                      <option value="Street Food Jhalmuri">Street Food Jhalmuri</option>
                      <option value="Desi Snack Potluck">Desi Snack Potluck</option>
                      <option value="Hostel Canteen Style">Hostel Canteen Style</option>
                    </select>
                  </div>

                  {/* Spice */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Official Spice Level
                    </label>
                    <select
                      value={editSpice}
                      onChange={(e) => setEditSpice(e.target.value as SpiceLevel)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Mild">Mild (Thoda kam teekha)</option>
                      <option value="Desi Chataakedar (Medium)">Desi Chataakedar (Medium)</option>
                      <option value="Tez Teekha (Spicy)">Tez Teekha (Spicy)</option>
                      <option value="Rocket Fire (Extra Mirchi)">Rocket Fire (Extra Mirchi)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="text-xs text-stone-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Protected by Rahul's Admin Authority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAdmin(false)}
                      className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                    >
                      Radd Karo (Cancel)
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Tareekh & Time Save Karo</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Suggest Date Form (Any day of year) */}
        {isAddingOption && (
          <form
            onSubmit={handleAddPollOption}
            className="mb-8 p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Saal Ka Koi Bhi Din Ya Time Suggest Karo</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                All 7 members can suggest options
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Tareekh (Any Date of Year)
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-mono tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Shuru Hone Ka Time (Optional)
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 01:30 PM Lunch ya 05:00 PM Chai"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Mauka / Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Friday Sham Ka Adda"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingOption(false)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs"
              >
                Poll Me Add Karo
              </button>
            </div>
          </form>
        )}

        {/* Grid: Confirmed Details Card & Date Voting Poll */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Confirmed Details Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Official Scheduled Date</span>
                </span>
                <span className="text-[11px] text-stone-500 font-mono font-medium">
                  Controlled by Admin
                </span>
              </div>

              <div className="mt-5 flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/50">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-stone-900 font-mono tracking-tight">
                    {new Date(party.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-stone-600 flex items-center gap-2.5 mt-1 font-medium">
                    <span className="flex items-center gap-1 font-mono tabular-nums text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {party.scheduledTime}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      {party.spiceLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-stone-100 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Party Ka Adda (Venue)</span>
                  </div>
                  <p className="text-base font-bold text-stone-900 mt-1">
                    LMS Certifications Private Limited
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Exclusive workplace adda for the 7 members. 100% home potluck.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="text-emerald-700 font-bold">100% Ghar Ka Saman (Zero Cash)</span>
              <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                {party.vibe}
              </span>
            </div>
          </div>

          {/* Date Poll Options Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Doston Ka Date & Time Poll
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {totalVotesAcrossPolls} votes cast by members · Saal me kabhi bhi plan karo
                </p>
              </div>
              <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded">
                7 Official Members
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(party.datePollOptions || []).map((option) => {
                const userVoted = currentUser && option.votes.includes(currentUser.id);
                const isSelectedDate = option.date === party.scheduledDate;

                return (
                  <div
                    key={option.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelectedDate
                        ? 'border-amber-400 bg-amber-50/40 shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900">
                            {option.label}
                          </span>
                          {isSelectedDate && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                              Official Schedule
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 font-mono tabular-nums mt-0.5 flex items-center gap-2">
                          <span>{option.date}</span>
                          <span>·</span>
                          <span>{option.votes.length} vote{option.votes.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Admin can set this option as the official date directly */}
                        {isAdmin && !isSelectedDate && (
                          <button
                            onClick={() => onUpdateParty({ scheduledDate: option.date, adminPassword: 'admin123' })}
                            className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg shadow-2xs"
                            title="Set as official party date (Admin)"
                          >
                            Finalize Date
                          </button>
                        )}

                        <button
                          onClick={() => onVoteDate(option.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            userVoted
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{userVoted ? 'Voted' : 'Vote Do'}</span>
                          <span className="ml-1 font-mono tabular-nums font-bold">
                            ({option.votes.length})
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, Search, ShieldCheck, Lock, Unlock, AlertCircle, RefreshCw } from 'lucide-react';
import type { Party, MaterialItem, SnackDuty, Rsvp, User } from '../types/party.ts';

interface AdminExcelPanelProps {
  party: Party;
  materials: MaterialItem[];
  duties: SnackDuty[];
  rsvps: Rsvp[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onResetDemo: () => void;
}

type SpreadsheetTab = 'materials' | 'duties' | 'rsvps';

export const AdminExcelPanel: React.FC<AdminExcelPanelProps> = ({
  party,
  materials,
  duties,
  rsvps,
  currentUser,
  onOpenAuth,
  onResetDemo,
}) => {
  const [activeTab, setActiveTab] = useState<SpreadsheetTab>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Admin password unlock state
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setVerifying(true);

    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Galat password!');
      }

      setIsUnlocked(true);
      sessionStorage.setItem('laiyaa_admin_pass', adminPasswordInput);
    } catch (err: any) {
      setPasswordError(err.message || 'Galat Admin Password!');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const pass = adminPasswordInput || sessionStorage.getItem('laiyaa_admin_pass') || 'admin123';
      const res = await fetch(`/api/admin/export-excel?admin_password=${encodeURIComponent(pass)}`, {
        headers: {
          'x-admin-password': pass,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Download me problem aayi!');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LMS_Laiyaa_Party_Plan_${party.scheduledDate || 'Export'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading Excel:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const pass = adminPasswordInput || sessionStorage.getItem('laiyaa_admin_pass') || 'admin123';
      const res = await fetch(`/api/admin/export-csv?admin_password=${encodeURIComponent(pass)}`, {
        headers: {
          'x-admin-password': pass,
        },
      });

      if (!res.ok) {
        alert('Admin password galat hai!');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LMS_Laiyaa_Party_Records.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading CSV:', err);
    }
  };

  const attendingCount = rsvps.filter((r) => r.status === 'attending').length;

  return (
    <section id="admin-excel" className="py-12 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Password Protected Console</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Admin Babumoshai Excel Sheet Download
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
                7 members ka saara record (Ghar ka saman, snack banane ki duty, attendance & preferences) ek official multi-sheet Excel spreadsheet me recorded hai. Password se protected hai!
              </p>
            </div>

            {/* Quick Lock / Status Badge */}
            {isUnlocked && (
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Admin Access Unlocked</span>
                </div>
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition-colors border border-stone-700"
                >
                  Lock Karo
                </button>
              </div>
            )}
          </div>

          {/* PASSWORD LOCK GATE */}
          {!isUnlocked ? (
            <div className="mt-8 bg-stone-800/90 rounded-2xl p-6 sm:p-8 border border-stone-700 max-w-xl mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Admin Password Daalo (Tala Kholo)
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                Excel download aur admin records unlock karne ke liye Admin (Rahul Ranjan) ka password enter karo.
              </p>

              {passwordError && (
                <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-500/50 text-rose-300 rounded-lg text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUnlock} className="mt-5 space-y-3">
                <div>
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Admin Password (e.g. admin123)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-stone-900 border border-stone-600 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{verifying ? 'Checking password...' : 'Tala Kholo & Excel Sheet Dekho'}</span>
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-stone-700/60 flex items-center justify-between text-[11px] text-stone-400">
                <span>Default Admin Pass: <strong className="text-amber-400 font-mono">admin123</strong></span>
                <button
                  onClick={() => {
                    setAdminPasswordInput('admin123');
                  }}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Auto-fill Password
                </button>
              </div>
            </div>
          ) : (
            /* UNLOCKED ADMIN TOOLS */
            <div className="mt-6 space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-800/80 rounded-xl border border-stone-700">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block">
                    ✓ Official Records Ready
                  </span>
                  <span className="text-xs text-stone-300">
                    Host: Rahul Ranjan (Admin) · Venue: LMS Certifications Pvt. Ltd.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadExcel}
                    disabled={downloading}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{downloading ? 'Excel Ban Raha Hai...' : 'Download Full Excel Sheet (.xlsx)'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="px-3.5 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 border border-stone-600"
                  >
                    <FileText className="w-4 h-4 text-stone-400" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={onResetDemo}
                    title="Reset to 7 members demo"
                    className="px-3 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-400 hover:text-stone-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-stone-600"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>

              {/* Interactive Live Spreadsheet Viewer */}
              <div className="bg-white text-stone-900 rounded-xl border border-stone-200 overflow-hidden shadow-xs">
                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-stone-100 border-b border-stone-200">
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                    <button
                      onClick={() => setActiveTab('materials')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'materials'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Sheet 1: Ghar Ka Saman ({materials.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('duties')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'duties'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Sheet 2: Snack Duties ({duties.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('rsvps')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'rsvps'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Sheet 3: 7 Doston Ki Haziri ({rsvps.length}/7)
                    </button>
                  </div>

                  {/* Search Filter */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Rows filter karo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-stone-300 focus:outline-none focus:border-amber-500 bg-white"
                    />
                  </div>
                </div>

                {/* Table Content (Zero Money!) */}
                <div className="overflow-x-auto max-h-96">
                  {activeTab === 'materials' && (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Ghar Ka Saman</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Kitna Chahiye</th>
                          <th className="py-2.5 px-3">Kaun Laa Raha Hai</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Desi Jugaad Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {materials
                          .filter(
                            (m) =>
                              m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (m.assignedToMemberName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (m.assignedToUsername || '').toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((m) => (
                            <tr key={m.id} className="hover:bg-stone-50">
                              <td className="py-2.5 px-3 font-semibold text-stone-900">{m.name}</td>
                              <td className="py-2.5 px-3 text-stone-500">{m.category}</td>
                              <td className="py-2.5 px-3 font-mono tabular-nums">{m.quantity}</td>
                              <td className="py-2.5 px-3 font-medium">
                                {m.assignedToMemberName ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold">{m.assignedToMemberName}</span>
                                    <span className="text-[10px] text-amber-700 font-mono">
                                      @{m.assignedToUsername}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-stone-400 italic">Kisi Ne Nahi Liya</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold uppercase text-[10px] text-stone-700">
                                  {m.status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-stone-500">{m.notes || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'duties' && (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Snack Banane Ka Kaam</th>
                          <th className="py-2.5 px-3">Skill Level</th>
                          <th className="py-2.5 px-3">Kaun Karega (Usernames)</th>
                          <th className="py-2.5 px-3">Crew Size</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {duties
                          .filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((d) => (
                            <tr key={d.id} className="hover:bg-stone-50">
                              <td className="py-2.5 px-3 font-semibold text-stone-900">{d.title}</td>
                              <td className="py-2.5 px-3 text-stone-500">{d.skillLevel}</td>
                              <td className="py-2.5 px-3 font-medium text-amber-900">
                                {d.assignedMemberNames.length > 0 ? (
                                  d.assignedMemberNames.map((name, i) => (
                                    <span key={i} className="mr-2">
                                      {name} <span className="text-[10px] text-stone-400 font-mono">(@{d.assignedUsernames?.[i] || 'dost'})</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-stone-400 italic">Khali Seat</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono tabular-nums">
                                {d.assignedMemberIds.length} / {d.maxMembers}
                              </td>
                              <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-stone-700">
                                {d.status}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'rsvps' && (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Khiladi Ka Naam</th>
                          <th className="py-2.5 px-3">Username</th>
                          <th className="py-2.5 px-3">Haziri (Attendance)</th>
                          <th className="py-2.5 px-3">Teekha Pasand</th>
                          <th className="py-2.5 px-3">Dost Ka Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {rsvps
                          .filter((r) => r.userName.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((r) => (
                            <tr key={r.id} className="hover:bg-stone-50">
                              <td className="py-2.5 px-3 font-semibold text-stone-900">{r.userName}</td>
                              <td className="py-2.5 px-3 text-amber-800 font-mono">@{r.username}</td>
                              <td className="py-2.5 px-3 font-semibold uppercase text-[10px]">
                                {r.status === 'attending' ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                    Pakka Aa Raha Hoon
                                  </span>
                                ) : (
                                  r.status
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-rose-700 font-medium">
                                {r.spicinessPreference || 'Normal'}
                              </td>
                              <td className="py-2.5 px-3 text-stone-600">{r.notes || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

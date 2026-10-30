import React from 'react';
import { Sparkles, FileSpreadsheet, User as UserIcon, Shield, LogOut, ChevronDown, Users, Download } from 'lucide-react';
import type { User } from '../types/party.ts';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenPass: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onSwitchUser,
  allUsers,
  onOpenPass,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text wordmark */}
          <a
            href="#"
            className="text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 flex items-center gap-2 group"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              ल
            </span>
            <span>
              Laiyaa<span className="text-amber-600 font-semibold ml-1">Party</span>
            </span>
            <span className="text-[11px] text-stone-400 font-normal hidden sm:inline">
              · LMS Adda
            </span>
          </a>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-600">
            <a
              href="#party-schedule"
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0"
            >
              Tareekh & Adda
            </a>
            <a
              href="#materials"
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0"
            >
              Ghar Ka Saman
            </a>
            <a
              href="#snack-duties"
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0"
            >
              Duties
            </a>
            <a
              href="#photo-gallery"
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0"
            >
              Photo Gallery
            </a>
            <a
              href="#member-chat"
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0"
            >
              Adda Chat & Bot
            </a>
            <a
              href="#admin-excel"
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Admin Excel</span>
            </a>
            <a
              href="/api/download-zip"
              download="laiyaa-party-planner.zip"
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-stone-600"
              title="Download Code .zip archive"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Download .ZIP</span>
            </a>
          </nav>

          {/* Zone 3: 1 primary action / User profile & Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/api/download-zip"
              download="laiyaa-party-planner.zip"
              className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              title="Download Code .zip"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.ZIP</span>
            </a>
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-amber-400 bg-stone-50 transition-all text-xs font-medium text-stone-800"
                >
                  <div
                    className={`w-6 h-6 rounded-full ${currentUser.avatarColor || 'bg-amber-600'} text-white flex items-center justify-center text-xs font-bold uppercase`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left truncate max-w-[130px]">
                    <span className="font-semibold text-stone-900 block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-amber-700 font-mono block -mt-0.5">
                      @{currentUser.username}
                    </span>
                  </div>
                  {currentUser.role === 'admin' ? (
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-0.5 bg-amber-100/70 px-1 py-0.5 rounded">
                      <Shield className="w-3 h-3 text-amber-600 inline" />
                      Admin
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-1 py-0.5 rounded">
                      Member
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="font-bold text-stone-900">{currentUser.name}</p>
                      <p className="text-amber-800 font-mono text-[11px]">@{currentUser.username}</p>
                      <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                        ✓ 7 Doston Ka Group · No Cash Required
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenPass();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-900 flex items-center gap-2 font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mera Laiyaa VIP Thonga Pass</span>
                      </button>
                    </div>

                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-t border-stone-100 flex items-center justify-between">
                      <span>7 Doston Me Switch Karo:</span>
                      <Users className="w-3 h-3 text-stone-400" />
                    </div>

                    <div className="max-h-52 overflow-y-auto divide-y divide-stone-50">
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-amber-50/50 transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-amber-50 font-bold text-amber-900'
                              : 'text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-5 h-5 rounded-full ${u.avatarColor} text-white flex items-center justify-center text-[10px] font-bold`}
                            >
                              {u.name.charAt(0)}
                            </span>
                            <span className="truncate">{u.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              @{u.username}
                            </span>
                          </div>
                          {u.role === 'admin' && (
                            <span className="text-[9px] text-amber-700 font-bold uppercase shrink-0">
                              Admin
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-stone-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out (Bahir Niklo)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Pehchaan & Entry (Login)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

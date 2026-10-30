import React, { useState } from 'react';
import { ChefHat, Users, Plus, Check, Sparkles, AlertCircle } from 'lucide-react';
import type { SnackDuty, DutySkillLevel, User } from '../types/party.ts';

interface SnackDutiesSectionProps {
  duties: SnackDuty[];
  currentUser: User | null;
  onClaimDuty: (dutyId: string) => void;
  onCreateDuty: (duty: Partial<SnackDuty>) => void;
  onOpenAuth: () => void;
}

export const SnackDutiesSection: React.FC<SnackDutiesSectionProps> = ({
  duties,
  currentUser,
  onClaimDuty,
  onCreateDuty,
  onOpenAuth,
}) => {
  const [isAddDutyModal, setIsAddDutyModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<DutySkillLevel>('Fun & Easy');
  const [maxMembers, setMaxMembers] = useState(2);

  const isAdmin = currentUser?.role === 'admin';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    onCreateDuty({
      title,
      description,
      skillLevel,
      maxMembers: Number(maxMembers),
    });

    setTitle('');
    setDescription('');
    setMaxMembers(2);
    setIsAddDutyModal(false);
  };

  const getSkillBadge = (level: DutySkillLevel) => {
    switch (level) {
      case 'Culinary Expert':
        return <span className="text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded">Chef Level Touch</span>;
      case 'Precision Chopper':
        return <span className="text-rose-700 font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded">Knife Skills Gang</span>;
      case 'High Energy':
        return <span className="text-purple-700 font-semibold text-[11px] bg-purple-50 px-2 py-0.5 rounded">High Energy Khiladi</span>;
      default:
        return <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">Fun & Easy Jugad</span>;
    }
  };

  return (
    <section id="snack-duties" className="py-12 bg-stone-50/60 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              Snack Banane Ka Scene
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Kaam-Kaaj & Zimmedari (Who Does What?)
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Pyaaz katne se lekar bada parat ghumane aur garam adrak chai pakane tak—apna role chuno!
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setIsAddDutyModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Nayi Zimmedari (Duty) Add Karo</span>
              </button>
            )}
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {duties.map((duty) => {
            const isVolunteered = currentUser && duty.assignedMemberIds.includes(currentUser.id);
            const isFull = duty.assignedMemberIds.length >= duty.maxMembers;

            return (
              <div
                key={duty.id}
                className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col justify-between hover:border-amber-300 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {getSkillBadge(duty.skillLevel)}
                    <span className="text-xs text-stone-500 font-mono tabular-nums font-semibold">
                      {duty.assignedMemberIds.length} / {duty.maxMembers} Khiladi
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    {duty.title}
                  </h3>

                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {duty.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                      Zimmedari Lene Wale:
                    </div>
                    {duty.assignedMemberNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {duty.assignedMemberNames.map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-950 text-xs rounded-md font-semibold border border-amber-200/60"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">
                              {name.charAt(0)}
                            </span>
                            <span>{name}</span>
                            {duty.assignedUsernames?.[i] && (
                              <span className="text-[10px] text-amber-700 font-mono">
                                @{duty.assignedUsernames[i]}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-400 italic">
                        Khali seat hai! Aage aao aur role sambhalo.
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onOpenAuth();
                        } else {
                          onClaimDuty(duty.id);
                        }
                      }}
                      disabled={isFull && !isVolunteered}
                      className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        isVolunteered
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                          : isFull
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                      }`}
                    >
                      {isVolunteered ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-700" />
                          <span>Zimmedari Meri Hai (Click To Release)</span>
                        </>
                      ) : isFull ? (
                        <span>Seat Full Ho Gayi ({duty.maxMembers}/{duty.maxMembers})</span>
                      ) : (
                        <span>Ye Kaam Mere Hawale Karo!</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add Duty */}
        {isAddDutyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">
                  Naya Kaam-Kaaj Role Banao
                </h3>
                <button
                  onClick={() => setIsAddDutyModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Role Ka Funky Naam *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nimbu Nichod Master, Papad Roaster"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Kaam Ka Description *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this member will do during the Laiyaa prep..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Skill Level
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value as DutySkillLevel)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Fun & Easy">Fun & Easy Jugad</option>
                      <option value="Culinary Expert">Chef Level Touch</option>
                      <option value="Precision Chopper">Knife Skills Gang</option>
                      <option value="High Energy">High Energy Khiladi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Kitne Log Chahiye
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={3}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 font-mono tabular-nums"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddDutyModal(false)}
                    className="px-3 py-2 text-xs text-stone-500 hover:text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                  >
                    Duty List Me Shamil Karo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

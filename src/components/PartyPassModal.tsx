import React from 'react';
import { Sparkles, Calendar, Clock, MapPin, ChefHat, ShoppingBag, Flame, Printer } from 'lucide-react';
import type { Party, User, MaterialItem, SnackDuty, Rsvp } from '../types/party.ts';

interface PartyPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: Party;
  currentUser: User | null;
  materials: MaterialItem[];
  duties: SnackDuty[];
  rsvps: Rsvp[];
}

export const PartyPassModal: React.FC<PartyPassModalProps> = ({
  isOpen,
  onClose,
  party,
  currentUser,
  materials,
  duties,
  rsvps,
}) => {
  if (!isOpen) return null;

  const myPledgedMaterials = currentUser
    ? materials.filter((m) => m.assignedToMemberId === currentUser.id)
    : [];

  const myDuties = currentUser
    ? duties.filter((d) => d.assignedMemberIds.includes(currentUser.id))
    : [];

  const myRsvp = currentUser
    ? rsvps.find((r) => r.userId === currentUser.id)
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">
              LMS Laiyaa VIP Thonga Pass
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Printable Ticket Pass Container */}
        <div className="mt-4 border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50/50 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded inline-block">
                VIP MUNCHER ENTRY PASS
              </div>
              <h4 className="text-xl font-extrabold text-stone-900 mt-1">
                {currentUser?.name || 'Khiladi Dost'}
              </h4>
              <p className="text-xs text-amber-900 font-mono">
                @{currentUser?.username || 'khiladi'} · {currentUser?.role === 'admin' ? 'Admin Host' : '7 Member Squad'}
              </p>
            </div>

            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-amber-300 shadow-2xs">
              <img
                src="/src/assets/images/laiyaa_snack_thonga_1793188178249.jpg"
                alt="Laiyaa snack thonga cone"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-amber-200/60 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold">{party.scheduledDate}</span>
              <span>·</span>
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold">{party.scheduledTime}</span>
            </div>

            <div className="flex items-center gap-2 text-stone-800 font-semibold">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">LMS Certifications Private Limited</span>
            </div>

            <div className="flex items-center gap-2 text-stone-700">
              <Flame className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Teekha Level: <strong className="text-rose-700">{myRsvp?.spicinessPreference || party.spiceLevel}</strong></span>
            </div>
          </div>

          {/* Assigned responsibilities */}
          <div className="pt-3 border-t border-amber-200/60 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1">
                <ShoppingBag className="w-3 h-3 text-amber-600" />
                <span>Ghar Se Kya Laa Rahe Ho?</span>
              </div>
              {myPledgedMaterials.length > 0 ? (
                <ul className="list-disc list-inside text-stone-800 space-y-0.5 font-medium">
                  {myPledgedMaterials.map((m) => (
                    <li key={m.id} className="truncate">
                      {m.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-stone-400 italic">Abhi tak koi item claim nahi kiya</span>
              )}
            </div>

            <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1">
                <ChefHat className="w-3 h-3 text-amber-600" />
                <span>Snack Making Duty</span>
              </div>
              {myDuties.length > 0 ? (
                <ul className="list-disc list-inside text-stone-800 space-y-0.5 font-medium">
                  {myDuties.map((d) => (
                    <li key={d.id} className="truncate">
                      {d.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-stone-400 italic">Koi role select nahi kiya</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print VIP Pass</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            Band Karo
          </button>
        </div>
      </div>
    </div>
  );
};

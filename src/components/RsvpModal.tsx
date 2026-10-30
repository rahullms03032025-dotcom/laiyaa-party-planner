import React, { useState } from 'react';
import { Users, Flame } from 'lucide-react';
import type { Rsvp, RsvpStatus, User } from '../types/party.ts';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  existingRsvp?: Rsvp | null;
  onSubmitRsvp: (data: { status: RsvpStatus; notes: string; spicinessPreference: string }) => void;
  onOpenAuth: () => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  existingRsvp,
  onSubmitRsvp,
  onOpenAuth,
}) => {
  const [status, setStatus] = useState<RsvpStatus>(existingRsvp?.status || 'attending');
  const [spice, setSpice] = useState(existingRsvp?.spicinessPreference || 'Desi Chataakedar (Medium)');
  const [notes, setNotes] = useState(existingRsvp?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    onSubmitRsvp({ status, notes, spicinessPreference: spice });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">
              Haziri Lagao (RSVP Confirmation)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Kya aap LMS Certifications par party me aa rahe ho? *
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setStatus('attending')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-left flex items-center justify-between transition-all ${
                  status === 'attending'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>✓ Haan Bhai Full Scene Hai! (Pakka Aa Raha Hoon)</span>
                <span className="text-[10px] text-emerald-600 font-mono">100% In</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('tentative')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-left flex items-center justify-between transition-all ${
                  status === 'tentative'
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>🤔 Shayad / Dekhte Hain (50-50 Chance)</span>
                <span className="text-[10px] text-amber-600 font-mono">Maybe</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('cannot_attend')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-left flex items-center justify-between transition-all ${
                  status === 'cannot_attend'
                    ? 'border-stone-400 bg-stone-100 text-stone-800'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>❌ Nahi Ho Payega Yaar (Miss Karunga)</span>
                <span className="text-[10px] text-stone-500 font-mono">Can't Come</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Aapka Mirchi & Teekha Preference</span>
            </label>
            <select
              value={spice}
              onChange={(e) => setSpice(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
            >
              <option value="Mild">Mild (Thoda kam mirchi, extra crunchy sev)</option>
              <option value="Desi Chataakedar (Medium)">Desi Chataakedar (Sarson tel + lemon + balanced spices)</option>
              <option value="Tez Teekha (Spicy)">Tez Teekha (Extra green chillies & pungent mustard oil)</option>
              <option value="Rocket Fire (Extra Mirchi)">Rocket Fire (True spice legends only!)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Dost Ka Message / Desi Suggestion
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mai thoda jaldi aa jaunga mixing parat dhone me help karne!"
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-stone-500 hover:text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              Haziri Confirm Karo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

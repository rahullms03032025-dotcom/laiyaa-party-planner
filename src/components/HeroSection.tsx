import React from 'react';
import { Calendar, Clock, MapPin, Flame, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Party, MaterialItem, SnackDuty, Rsvp, User } from '../types/party.ts';

interface HeroSectionProps {
  party: Party;
  materials: MaterialItem[];
  duties: SnackDuty[];
  rsvps: Rsvp[];
  currentUser: User | null;
  onOpenRsvp: () => void;
  onOpenPass: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  party,
  materials,
  duties,
  rsvps,
  currentUser,
  onOpenRsvp,
  onOpenPass,
}) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0 });

  React.useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${party.scheduledDate}T16:30:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [party.scheduledDate]);

  const attendingCount = rsvps.filter((r) => r.status === 'attending').length;
  const pledgedMaterialsCount = materials.filter((m) => m.status !== 'unassigned').length;
  const claimedDutiesCount = duties.filter((d) => d.assignedMemberIds.length > 0).length;

  const userRsvp = currentUser ? rsvps.find((r) => r.userId === currentUser.id) : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-50/20 to-white pt-8 pb-12 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title, Hinglish Metadata, Countdown, and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean unboxed Hinglish kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-900 tracking-wide">
              <span>{party.vibe}</span>
              <span aria-hidden="true" className="text-amber-400">·</span>
              <span className="flex items-center gap-1 text-amber-800">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                {party.spiceLevel}
              </span>
              <span aria-hidden="true" className="text-amber-400">·</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                100% Ghar Ka Jugad (Paisa Zero, Crunch Hero!)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight max-w-2xl text-balance">
              {party.title}
            </h1>

            <p className="text-base text-stone-600 max-w-xl leading-relaxed">
              7 doston ka legendary get-together at LMS Certifications! Sabhi log apne-apne ghar se crisp murmura, sarson tel, aloo, pyaaz aur badam la rahe hain. Koi paisa kharch nahi, bas pure maza!
            </p>

            {/* Event Logistics Info Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-stone-500">Party Ki Tareekh</div>
                  <div className="text-sm font-bold text-stone-900 font-mono tabular-nums">
                    {new Date(party.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-stone-500">Shuru Hone Ka Time</div>
                  <div className="text-sm font-bold text-stone-900 font-mono tabular-nums">
                    {party.scheduledTime}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-stone-500">Party Ka Adda</div>
                  <div className="text-sm font-bold text-stone-900 truncate">
                    {party.venue}
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown and CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs font-mono tabular-nums shadow-xs">
                <span className="text-amber-400 font-semibold">{timeLeft.days}d</span>
                <span className="text-stone-500">:</span>
                <span className="text-amber-400 font-semibold">{timeLeft.hours}h</span>
                <span className="text-stone-500">:</span>
                <span className="text-amber-400 font-semibold">{timeLeft.minutes}m me party shuru!</span>
              </div>

              <button
                onClick={onOpenRsvp}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  {userRsvp
                    ? userRsvp.status === 'attending'
                      ? '✓ Meri Haziri: Pakka Aa Raha Hoon!'
                      : `Meri Haziri: ${userRsvp.status}`
                    : 'Apni Haziri Lagao (RSVP)'}
                </span>
              </button>

              <button
                onClick={onOpenPass}
                className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>VIP Thonga Pass</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Graphic Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 shadow-md bg-stone-100 aspect-[16/10] sm:aspect-[16/9] lg:aspect-square">
              <img
                src="/src/assets/images/hero_laiyaa_party_1793188178503.jpg"
                alt="Friends preparing spicy Laiyaa snack party together"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  LMS Certifications Ki Mandali
                </div>
                <div className="text-sm font-semibold text-white drop-shadow-sm">
                  Ankur, Rahul, Yash, Priyanka, Ankita, Himani & Nityanand!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Metric Strip below Hero (Zero Budget!) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-200/60">
          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">Asli Khiladi (Members)</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
                7 / 7
              </span>
              <span className="text-xs text-emerald-600 font-semibold font-mono tabular-nums">
                {attendingCount} Ready
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">Ghar Ka Saman Pledged</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
                {pledgedMaterialsCount}
              </span>
              <span className="text-xs text-stone-500 font-mono tabular-nums">
                of {materials.length} items
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">Kaam-Kaaj (Duties Handled)</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
                {claimedDutiesCount}
              </span>
              <span className="text-xs text-amber-600 font-semibold font-mono tabular-nums">
                of {duties.length} roles
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">Chataakedar Teekha Level</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-sm font-bold text-rose-600 truncate">
                {party.spiceLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

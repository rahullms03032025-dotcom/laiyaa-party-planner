import React from 'react';
import { Sparkles, Utensils, Activity, CheckCircle, Clock } from 'lucide-react';
import type { ActivityLog } from '../types/party.ts';

interface PartyGuideAndActivityProps {
  logs: ActivityLog[];
}

export const PartyGuideAndActivity: React.FC<PartyGuideAndActivityProps> = ({ logs }) => {
  return (
    <section className="py-12 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Authentic Laiyaa Party Secret Rules */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                The Golden Rules
              </div>
              <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                Authentic Laiyaa / Murmura Party Etiquette
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Passed down through desi addas and street food stalls for maximum crunch and flavor.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>Mustard Oil Coats First</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 pl-7 leading-relaxed">
                  Always drizzle raw Kachi Ghani mustard oil over the spices, onions, and chillies first to release their essential aromatics before folding in the dry murmura.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>Beware the Tomato Sog Factor</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 pl-7 leading-relaxed">
                  Add diced tomatoes and lemon juice only in the final 30 seconds of mixing. Murmura absorbs moisture rapidly and must remain crisp like fresh crackers!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                  <span>Eat Directly from the Thonga</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 pl-7 leading-relaxed">
                  Nothing compares to eating hot spicy Laiya from a conical newspaper thonga while passing around cutting ginger tea. No forks allowed—use hands or a small card spoon!
                </p>
              </div>
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="lg:col-span-6 bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-stone-900">
                    Live Planning Activity Stream
                  </h4>
                </div>
                <span className="text-[11px] text-stone-400 font-mono tabular-nums">
                  Real-time updates
                </span>
              </div>

              <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white rounded-xl border border-stone-200 text-xs flex items-start gap-3 shadow-2xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {log.userName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-stone-900 font-medium">
                          {log.action}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 font-mono tabular-nums flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-300" />
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>·</span>
                          <span>by {log.userName}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-400 text-center py-8">
                    No recent activities recorded yet.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500">
              All member actions and pledges sync automatically to the master database.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

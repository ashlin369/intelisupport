import React, { useEffect, useState } from 'react';
import { AmbulanceUnit } from '../../types';
import { getNearbyAmbulanceDirectory } from '../../services/ambulanceService';
import { Siren, Phone, Clock, ShieldAlert, CheckCircle2, Navigation, Activity } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

export const AmbulanceDirectory: React.FC = () => {
  const [units, setUnits] = useState<AmbulanceUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ALS_PARAMEDIC' | 'MOBILE_CRISIS_TEAM'>('ALL');

  useEffect(() => {
    getNearbyAmbulanceDirectory()
      .then((res) => {
        setUnits(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredUnits = filter === 'ALL' ? units : units.filter((u) => u.type === filter);

  return (
    <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl">24/7 Ambulance & EMS Dispatch Directory</h3>
            <p className="text-xs text-slate-400">Paramedic emergency transport units & SUD mobile crisis squads</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Live Regional Dispatch Grid
        </span>
      </div>

      {/* Ambulance Vehicle Type Filters */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            filter === 'ALL' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Fleet ({units.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('ALS_PARAMEDIC')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            filter === 'ALS_PARAMEDIC' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          ALS Paramedic (Narcan Ready)
        </button>

        <button
          type="button"
          onClick={() => setFilter('MOBILE_CRISIS_TEAM')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            filter === 'MOBILE_CRISIS_TEAM' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mobile Crisis Squad
        </button>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Locating nearest ambulance dispatch units & ETAs...
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUnits.map((amb) => (
            <div
              key={amb.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      amb.type === 'ALS_PARAMEDIC'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : amb.type === 'MOBILE_CRISIS_TEAM'
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {amb.type.replace('_', ' ')}
                    </span>
                    {amb.narcanEquipped && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Narcan Equipped
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-100 text-base">{amb.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{amb.agency}</p>
                </div>

                <div className="flex items-center gap-3 sm:flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose-400 block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ETA ~{amb.etaMins} Mins
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{amb.distanceKm} km away</span>
                  </div>

                  <a
                    href={`tel:${amb.phone}`}
                    onClick={() => triggerHaptic(80)}
                    className="min-h-[48px] px-5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-950/80 transition-transform active:scale-95"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                    Dispatch Ambulance ({amb.phone})
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

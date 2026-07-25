import React, { useState, useEffect } from 'react';
import { EmergencyLog } from '../../types';
import { getEmergencyLogs } from '../../services/firebaseService';
import { 
  Stethoscope, 
  Siren, 
  MapPin, 
  Package, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Activity,
  PhoneCall,
  RefreshCw
} from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

interface ServiceProviderDashboardProps {
  providerId: string;
}

export const ServiceProviderDashboard: React.FC<ServiceProviderDashboardProps> = ({ providerId }) => {
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [narcanUnits, setNarcanUnits] = useState(48);
  const [dispatchStatus, setDispatchStatus] = useState<'ACTIVE' | 'STANDBY'>('ACTIVE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const emergencyLogs = await getEmergencyLogs();
      setLogs(emergencyLogs);
    } finally {
      setLoading(false);
    }
  };

  const handleRestockNarcan = () => {
    triggerHaptic(50);
    setNarcanUnits(prev => prev + 24);
  };

  return (
    <div className="space-y-6">
      {/* Service Provider Hero Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border border-rose-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-rose-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest">
                Service Provider & EMS First Responder Portal
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-1">Regional Emergency Dispatch & Harm Reduction</h2>
            <p className="text-xs text-slate-300 mt-1">
              Active overdose dispatches, real-time survivor SOS broadcasts, and Naloxone inventory management.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setDispatchStatus(prev => prev === 'ACTIVE' ? 'STANDBY' : 'ACTIVE')}
              className={`min-h-[44px] px-4 rounded-xl font-bold text-xs flex items-center gap-2 border shadow-md transition-all ${
                dispatchStatus === 'ACTIVE'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Unit Status: {dispatchStatus}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active SOS Signals</span>
            <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">
              {logs.filter(l => !l.resolved).length} Calls
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Naloxone Inventory</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {narcanUnits} Doses
            </span>
          </div>
          <button
            type="button"
            onClick={handleRestockNarcan}
            className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5"
            title="Restock Naloxone Kits"
          >
            <Package className="w-5 h-5" /> +24 Restock
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">EMS Dispatch Unit</span>
            <span className="text-2xl font-black text-teal-300 font-mono mt-1 block">
              Medic Unit 14
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Signals Dispatch Map Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-400" /> Active Emergency Broadcast Dispatches
          </h3>
          <button
            type="button"
            onClick={loadLogs}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                log.resolved
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-rose-950/60 border-rose-600/80 text-rose-100 shadow-lg shadow-rose-950/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    log.resolved 
                      ? 'bg-slate-800 text-slate-400 border-slate-700' 
                      : 'bg-rose-900 text-rose-200 border-rose-500 animate-pulse'
                  }`}>
                    {log.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono opacity-80">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <h4 className="font-extrabold text-sm mt-1">{log.patientName} • Patient ID: {log.patientId}</h4>
                <p className="text-xs opacity-90 mt-0.5">{log.notes}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <a
                  href={`tel:911`}
                  className="min-h-[44px] px-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <PhoneCall className="w-4 h-4" /> Dispatch Unit
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

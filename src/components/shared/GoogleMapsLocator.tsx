import React, { useEffect, useState } from 'react';
import { TreatmentFacility } from '../../types';
import { getNearbyTreatmentFacilities } from '../../services/googleMapsService';
import { MapPin, Navigation, Phone, Clock, ExternalLink, Compass, ShieldCheck, Hospital } from 'lucide-react';

export const GoogleMapsLocator: React.FC = () => {
  const [facilities, setFacilities] = useState<TreatmentFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<TreatmentFacility | null>(null);

  useEffect(() => {
    getNearbyTreatmentFacilities()
      .then((res) => {
        setFacilities(res);
        if (res.length > 0) setSelectedFacility(res[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-100">Nearby Hospital & Emergency Route Guide</h3>
            <p className="text-xs text-slate-400">Interactive Google Maps navigation to 24/7 ERs & Addiction Clinics</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
          <Compass className="w-3.5 h-3.5 text-teal-400 animate-spin" /> GPS Grounded Navigation
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Locating nearest hospitals & emergency centers via Google Maps...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Route Highlight Card */}
          {selectedFacility && (
            <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/50 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase bg-teal-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                  Primary Emergency Route Selected
                </span>
                <span className="text-xs font-mono font-bold text-teal-300">
                  {selectedFacility.distanceKm} km away (~{Math.round(selectedFacility.distanceKm * 2.5 + 2)} mins drive)
                </span>
              </div>

              <h4 className="font-black text-lg text-slate-100">{selectedFacility.name}</h4>
              <p className="text-xs text-slate-300">{selectedFacility.address}</p>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${selectedFacility.name}, ${selectedFacility.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Navigation className="w-4 h-4 fill-current" />
                  Get Turn-by-Turn Hospital Route
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <a
                  href={`tel:${selectedFacility.phone}`}
                  className="min-h-[48px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-teal-400" />
                  Call Hospital ER ({selectedFacility.phone})
                </a>
              </div>
            </div>
          )}

          {/* Facility List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">All Nearby Emergency Facilities:</h4>
            {facilities.map((fac) => (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`bg-slate-900 border rounded-2xl p-4 cursor-pointer transition-all ${
                  selectedFacility?.id === fac.id ? 'border-teal-400 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        fac.type === 'ER_247' 
                          ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                          : fac.type === 'NARCAN_DISTRIBUTOR'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {fac.type === 'ER_247' ? '24/7 Emergency Room' : fac.type === 'NARCAN_DISTRIBUTOR' ? 'Free Naloxone Site' : 'Addiction Clinic'}
                      </span>
                      {fac.open247 && (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Open 24/7
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-slate-100 text-sm">{fac.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{fac.address}</p>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-teal-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                      {fac.distanceKm} km
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${fac.name}, ${fac.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Navigate
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

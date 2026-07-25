import React, { useEffect, useState } from 'react';
import { TreatmentFacility } from '../../types';
import { getNearbyTreatmentFacilities, getCurrentPosition } from '../../services/googleMapsService';
import { Navigation, MapPin, Phone, ExternalLink, Activity, Clock, Crosshair, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

export const GoogleMapsLocator: React.FC = () => {
  const [facilities, setFacilities] = useState<TreatmentFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchUserLocationAndFacilities();
  }, []);

  const fetchUserLocationAndFacilities = async () => {
    setLocating(true);
    setLoading(true);
    triggerHaptic(40);

    const pos = await getCurrentPosition();
    setUserLocation(pos);

    const data = await getNearbyTreatmentFacilities(pos.lat, pos.lng);
    setFacilities(data);
    setLoading(false);
    setLocating(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6 text-slate-100">
      {/* Header with GPS Auto-Locate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl">Nearby 24/7 Emergency Rooms & Clinics</h3>
            <p className="text-xs text-slate-400">Direct turn-by-turn navigation via Google Maps</p>
          </div>
        </div>

        {/* GPS Live Geolocation Button */}
        <button
          type="button"
          onClick={fetchUserLocationAndFacilities}
          disabled={locating}
          className="min-h-[44px] px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-transform active:scale-95 self-start sm:self-auto"
        >
          {locating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          <span>{locating ? 'Acquiring Phone/Laptop GPS...' : 'Locate My GPS Position'}</span>
        </button>
      </div>

      {/* GPS Location Status Indicator */}
      {userLocation && (
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Your Browser Geolocation:</span>
          <span className="text-teal-400 font-bold">
            Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* Facility Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Fetching live nearby emergency facilities based on your browser GPS...
        </div>
      ) : (
        <div className="space-y-3">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      fac.type === 'ER_247'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : fac.type === 'NARCAN_DISTRIBUTOR'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}>
                      {fac.type === 'ER_247' ? '24/7 Trauma ER' : fac.type === 'NARCAN_DISTRIBUTOR' ? 'Free Narcan Hub' : 'Addiction Recovery'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{fac.distanceKm} km away</span>
                  </div>

                  <h4 className="font-extrabold text-slate-100 text-base">{fac.name}</h4>
                  <p className="text-xs text-slate-400">{fac.address}</p>
                </div>

                <div className="flex items-center gap-2 sm:flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <a
                    href={`tel:${fac.phone}`}
                    onClick={() => triggerHaptic(40)}
                    className="min-h-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-teal-400" /> Call
                  </a>

                  <a
                    href={fac.navUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic(80)}
                    className="min-h-[44px] px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <Navigation className="w-4 h-4 fill-current" />
                    Google Maps Route <ExternalLink className="w-3.5 h-3.5" />
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

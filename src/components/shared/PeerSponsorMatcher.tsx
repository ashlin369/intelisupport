import React, { useState } from 'react';
import { UserCheck, Phone, MessageSquare, ShieldCheck, HeartHandshake, Star } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

interface Sponsor {
  id: string;
  name: string;
  role: string;
  specialty: string;
  yearsInRecovery: number;
  phone: string;
  isAvailable: boolean;
  rating: number;
}

const MOCK_SPONSORS: Sponsor[] = [
  {
    id: 'sp-1',
    name: 'David Vance, PRSS',
    role: 'Certified Peer Recovery Specialist',
    specialty: 'Opioid & Fentanyl Recovery',
    yearsInRecovery: 8,
    phone: '555-019-4422',
    isAvailable: true,
    rating: 4.9
  },
  {
    id: 'sp-2',
    name: 'Elena Martinez',
    role: 'SUD Veteran Peer Mentor',
    specialty: 'Alcohol & Polysubstance',
    yearsInRecovery: 12,
    phone: '555-018-9933',
    isAvailable: true,
    rating: 5.0
  },
  {
    id: 'sp-3',
    name: 'Marcus Thorne',
    role: 'Harm Reduction & Naloxone Advocate',
    specialty: 'Acute Craving Surfing & Trauma',
    yearsInRecovery: 6,
    phone: '555-014-1188',
    isAvailable: false,
    rating: 4.8
  }
];

export const PeerSponsorMatcher: React.FC = () => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredSponsors = filter === 'ALL'
    ? MOCK_SPONSORS
    : MOCK_SPONSORS.filter(s => s.specialty.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl">24/7 Peer Recovery Sponsor Matcher</h3>
            <p className="text-xs text-slate-400">Connect with certified peer recovery support specialists</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-teal-950 text-teal-300 border border-teal-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-teal-400" /> Certified PRSS Network
        </span>
      </div>

      <div className="space-y-3">
        {filteredSponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-lg transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    {sponsor.specialty}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" /> {sponsor.rating} • {sponsor.yearsInRecovery} Years Clean
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-100 text-base">{sponsor.name}</h4>
                <p className="text-xs text-slate-400">{sponsor.role}</p>
              </div>

              <div className="flex items-center gap-2 sm:flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <a
                  href={`tel:${sponsor.phone}`}
                  onClick={() => triggerHaptic(80)}
                  className="min-h-[44px] px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                >
                  <Phone className="w-4 h-4 fill-current" /> Call Peer Sponsor
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { AmbulanceUnit } from '../types';
import { getCurrentPosition } from './googleMapsService';

/**
 * Calculates distance between coordinates in KM
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const MOCK_AMBULANCE_FLEET = [
  {
    id: 'amb-101',
    name: 'ALS Paramedic Unit 14 (Opioid / Narcan Fast Response)',
    agency: 'Metropolitan Fire & EMS Rescue',
    phone: '911',
    type: 'ALS_PARAMEDIC' as const,
    latOffset: 0.015,
    lngOffset: 0.012,
    status: 'DISPATCH_READY' as const,
    narcanEquipped: true
  },
  {
    id: 'amb-102',
    name: 'SUD Mobile Crisis & Overdose Stabilization Squad',
    agency: 'County Behavioral Health Mobile Services',
    phone: '1-800-662-4357',
    type: 'MOBILE_CRISIS_TEAM' as const,
    latOffset: 0.025,
    lngOffset: 0.018,
    status: 'DISPATCH_READY' as const,
    narcanEquipped: true
  },
  {
    id: 'amb-103',
    name: 'City Emergency Transport Ambulance Fleet 8',
    agency: 'City Emergency Medical Transport Services',
    phone: '911',
    type: 'BLS_AMBULANCE' as const,
    latOffset: 0.035,
    lngOffset: 0.022,
    status: 'EN_ROUTE' as const,
    narcanEquipped: true
  },
  {
    id: 'amb-104',
    name: 'Critical Care Trauma Helicopter Transport (Air Evac)',
    agency: 'Regional Trauma Flight Services',
    phone: '911',
    type: 'AIR_AMBULANCE' as const,
    latOffset: 0.055,
    lngOffset: 0.045,
    status: 'ON_CALL' as const,
    narcanEquipped: true
  }
];

/**
 * Retrieves regional 24/7 ambulance & EMS dispatch units, sorted by ETA and proximity to user's live GPS coordinates.
 */
export async function getNearbyAmbulanceDirectory(userLat?: number, userLng?: number): Promise<AmbulanceUnit[]> {
  let lat = userLat;
  let lng = userLng;

  if (lat === undefined || lng === undefined) {
    const pos = await getCurrentPosition();
    lat = pos.lat;
    lng = pos.lng;
  }

  const units: AmbulanceUnit[] = MOCK_AMBULANCE_FLEET.map((amb) => {
    const unitLat = lat! + amb.latOffset;
    const unitLng = lng! + amb.lngOffset;
    const dist = calculateDistance(lat!, lng!, unitLat, unitLng);
    const eta = Math.max(3, Math.round(dist * 2.2 + 2));

    return {
      id: amb.id,
      name: amb.name,
      agency: amb.agency,
      phone: amb.phone,
      type: amb.type,
      etaMins: eta,
      distanceKm: dist,
      status: amb.status,
      narcanEquipped: amb.narcanEquipped
    };
  });

  return units.sort((a, b) => a.etaMins - b.etaMins);
}

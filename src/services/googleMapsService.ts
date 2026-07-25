import { TreatmentFacility } from '../types';

const MOCK_FACILITIES: Omit<TreatmentFacility, 'distanceKm' | 'navUrl'>[] = [
  {
    id: 'fac-1',
    name: 'Metropolitan Hospital 24/7 Emergency Room & Addiction Center',
    address: '450 Medical Center Plaza',
    phone: '(555) 911-0199',
    lat: 37.7749,
    lng: -122.4194,
    type: 'ER_247',
    open247: true
  },
  {
    id: 'fac-2',
    name: 'Community Harm Reduction & Free Naloxone Distribution Hub',
    address: '820 Recovery Way, Suite 100',
    phone: '(555) 882-1920',
    lat: 37.7833,
    lng: -122.4167,
    type: 'NARCAN_DISTRIBUTOR',
    open247: true
  },
  {
    id: 'fac-3',
    name: 'Hope & Beacon Outpatient Addiction Recovery Clinic',
    address: '1040 Wellness Boulevard',
    phone: '(555) 432-8811',
    lat: 37.7650,
    lng: -122.4300,
    type: 'ADDICTION_CLINIC',
    open247: false
  }
];

/**
 * Calculates distance between two geolocation coordinates in Kilometers (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Retrieves user's current GPS location via HTML5 Geolocation API
 */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Default fallback coordinates (San Francisco)
          resolve({ lat: 37.7749, lng: -122.4194 });
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      resolve({ lat: 37.7749, lng: -122.4194 });
    }
  });
}

/**
 * Retrieves nearby treatment facilities, sorted by distance from current user coordinates, with Google Maps direct navigation URLs.
 */
export async function getNearbyTreatmentFacilities(userLat?: number, userLng?: number): Promise<TreatmentFacility[]> {
  let lat = userLat;
  let lng = userLng;

  if (lat === undefined || lng === undefined) {
    const pos = await getCurrentPosition();
    lat = pos.lat;
    lng = pos.lng;
  }

  const facilities: TreatmentFacility[] = MOCK_FACILITIES.map((fac) => {
    const dist = calculateDistance(lat!, lng!, fac.lat, fac.lng);
    const queryStr = encodeURIComponent(`${fac.name}, ${fac.address}`);
    const navUrl = `https://www.google.com/maps/search/?api=1&query=${queryStr}`;

    return {
      ...fac,
      distanceKm: dist,
      navUrl
    };
  });

  return facilities.sort((a, b) => a.distanceKm - b.distanceKm);
}

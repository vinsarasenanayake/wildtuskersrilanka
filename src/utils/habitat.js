import ELEPHANT_RANGE from '../data/sriLankaElephantRange.json';
import TOWN_CENTRES from '../data/sriLankaTownCentres.json';
/* ── Towns vs. wildlife habitat ───────────────────────────────────────
   Some LOCATION fields name a district town ("Anuradhapura", "Ampara")
   to mean the wider district. Elephants don't live in those town centres,
   so for drawing home ranges each town is replaced by the wildlife area
   that tuskers use nearby. When a tusker also lists real wildlife areas,
   the town is simply left out of its home range. */
export const TOWN_HABITAT = {
  anuradhapura: 'Mahakanadarawa',
  ampara: 'Gal Oya',
  batticaloa: 'Thoppigala',
  polonnaruwa: 'Minneriya',
  puttalam: 'Thabbowa',
  trincomalee: 'Naval Headworks Sanctuary',
  hambantota: 'Bundala',
};

/** True when the place is a district town rather than wildlife habitat. */
export function isDistrictTown(name) {
  return Object.prototype.hasOwnProperty.call(TOWN_HABITAT, String(name || '').trim().toLowerCase());
}

/** The wildlife area to draw for a place name (the name itself unless it is a district town). */
export function habitatFor(name) {
  return TOWN_HABITAT[String(name || '').trim().toLowerCase()] || name;
}

/* ── Built-up town centres ────────────────────────────────────────────
   Busy town and city centres (from OpenStreetMap) are cut out of every
   home range and area outline. Villages, farmland and tanks stay in. */

let townPolys = null;
/** Town centres as polygon coordinates ([[ring]] per town), built once. */
export function townCentrePolygons() {
  if (townPolys) return townPolys;
  townPolys = TOWN_CENTRES.towns.map(({ lat, lng, radiusKm }) => {
    const dLat = radiusKm / 111;
    const dLng = dLat / Math.cos((lat * Math.PI) / 180);
    const ring = [];
    for (let i = 0; i < 32; i++) {
      const t = (i * 2 * Math.PI) / 32;
      ring.push([lng + Math.cos(t) * dLng, lat + Math.sin(t) * dLat]);
    }
    ring.push(ring[0]);
    return [ring];
  });
  return townPolys;
}


/** Where wild elephants actually roam in Sri Lanka (traced from the
 *  elephant distribution map). Sea, beach strips, the wet south-west and
 *  the big cities are outside it. */
export const ELEPHANT_RANGE_COORDS = ELEPHANT_RANGE.coordinates;

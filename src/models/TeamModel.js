/**
 * @file TeamModel.js
 * @description Data access model for WTS conservation team members in Supabase PostgreSQL.
 */

import { supabase, fromRow, toRow, unwrap } from '../lib/supabaseClient';

const TEAM_FIELDS = ['name', 'role', 'badge', 'bio', 'image', 'displayOrder', 'facebookUrl'];

let teamCache = null;
let teamCacheTime = 0;
const TEAM_CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedTeamMembers() {
  const now = Date.now();
  if (teamCache && (now - teamCacheTime < TEAM_CACHE_TTL_MS)) {
    return teamCache;
  }
  try {
    const raw = sessionStorage.getItem('wts_team_members');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        teamCache = parsed;
        teamCacheTime = now;
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function invalidateTeamCache() {
  teamCache = null;
  teamCacheTime = 0;
  try {
    sessionStorage.removeItem('wts_team_members');
  } catch {}
}

export async function getTeamMembers() {
  const cached = getCachedTeamMembers();
  if (cached) {
    supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true })
      .order('id', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(fromRow);
          teamCache = mapped;
          teamCacheTime = Date.now();
          try {
            sessionStorage.setItem('wts_team_members', JSON.stringify(mapped));
          } catch {}
        }
      })
      .catch(() => {});
    return cached;
  }

  try {
    const rows = unwrap(
      await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true })
    );
    const result = (rows || []).map(fromRow);
    teamCache = result;
    teamCacheTime = Date.now();
    try {
      sessionStorage.setItem('wts_team_members', JSON.stringify(result));
    } catch {}
    return result;
  } catch (err) {
    console.warn('[TeamModel] Failed to fetch team from Supabase:', err);
    return [];
  }
}

export async function addTeamMember(member) {
  const row = toRow(member, TEAM_FIELDS);
  invalidateTeamCache();
  return mapMember(unwrap(await supabase.from('team_members').insert(row).select().single()));
}

export async function updateTeamMember(id, updated) {
  const row = toRow(updated, TEAM_FIELDS);
  invalidateTeamCache();
  return mapMember(unwrap(await supabase.from('team_members').update(row).eq('id', Number(id)).select().single()));
}

export async function deleteTeamMember(id) {
  unwrap(await supabase.from('team_members').delete().eq('id', Number(id)));
  invalidateTeamCache();
  return true;
}

function mapMember(row) {
  return fromRow(row);
}

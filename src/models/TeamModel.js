import { supabase, fromRow, toRow, unwrap } from '../lib/supabaseClient';

const TEAM_FIELDS = ['name', 'role', 'badge', 'bio', 'image', 'displayOrder', 'facebookUrl'];

export async function getTeamMembers() {
  try {
    const rows = unwrap(
      await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true })
    );
    return (rows || []).map(fromRow);
  } catch (err) {
    console.warn('[TeamModel] Failed to fetch team from Supabase:', err);
    return [];
  }
}

export async function addTeamMember(member) {
  const row = toRow(member, TEAM_FIELDS);
  return mapMember(unwrap(await supabase.from('team_members').insert(row).select().single()));
}

export async function updateTeamMember(id, updated) {
  const row = toRow(updated, TEAM_FIELDS);
  return mapMember(unwrap(await supabase.from('team_members').update(row).eq('id', Number(id)).select().single()));
}

export async function deleteTeamMember(id) {
  unwrap(await supabase.from('team_members').delete().eq('id', Number(id)));
  return true;
}

function mapMember(row) {
  return fromRow(row);
}

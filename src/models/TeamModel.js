import { supabase, fromRow, toRow, unwrap } from '../lib/supabaseClient';

export const DEFAULT_TEAM = [
  {
    name: 'Milinda Wattegedara',
    role: 'Admin',
    displayOrder: 1,
    facebookUrl: 'https://www.facebook.com/milinda.wattegedara/',
  },
  {
    name: 'Asanka Nilagaratne',
    role: 'Admin',
    displayOrder: 2,
    facebookUrl: 'https://www.facebook.com/asanka.jeewan.1',
  },
  {
    name: 'Chandika Lakmal',
    role: 'Admin',
    displayOrder: 3,
    facebookUrl: 'https://www.facebook.com/chandikacr/',
  },
  {
    name: 'Dr Isuru Upanishad',
    role: 'Admin',
    displayOrder: 4,
    facebookUrl: 'https://www.facebook.com/isuru.upanishad/',
  },
  {
    name: 'Dushantha Silva',
    role: 'Admin',
    displayOrder: 5,
    facebookUrl: null,
  },
  {
    name: 'Saman Halloluwa',
    role: 'Admin',
    displayOrder: 6,
    facebookUrl: 'https://www.facebook.com/saman.halloluwa.5',
  },
  {
    name: 'Lyndon Fernando',
    role: 'Admin',
    displayOrder: 7,
    facebookUrl: null,
  },
  {
    name: 'Namal Kalagoda',
    role: 'Admin',
    displayOrder: 8,
    facebookUrl: null,
  },
  {
    name: 'Pathum Bandara',
    role: 'Admin',
    displayOrder: 9,
    facebookUrl: null,
  },
  {
    name: 'Priyanjana Dilmith',
    role: 'Admin',
    displayOrder: 10,
    facebookUrl: null,
  },
  {
    name: 'Suraj Perera',
    role: 'Admin',
    displayOrder: 11,
    facebookUrl: null,
  },
  {
    name: 'Geemal Harold',
    role: 'Admin',
    displayOrder: 12,
    facebookUrl: null,
  },
  {
    name: 'Raveendra Siriwardana',
    role: 'Admin',
    displayOrder: 13,
    facebookUrl: null,
  },
];

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
    if (rows && rows.length > 0) {
      return rows.map(fromRow);
    }
  } catch (err) {
    console.warn('[TeamModel] Failed to fetch team from Supabase, using defaults:', err);
  }
  return DEFAULT_TEAM;
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


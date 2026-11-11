import React, { useEffect } from 'react';

const team = [
  {
    name: 'Milinda Wattegedara',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Asanka Nilagaratne',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Chandika Lakmal',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Dr Isuru Upanishad',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Dushantha Silva',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Saman Halloluwa',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Lyndon Fernando',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Namal Kalagoda',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Pathum Bandara',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Priyanjana Dilmith',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Suraj Perera',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Geemal Harold',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
  {
    name: 'Raveendra Siriwardana',
    role: 'Admin',
    badge: null,
    bio: null,
    image: null,
  },
];

export default function AboutUs() {
  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | About Us';
  }, []);

  const admins = team.filter(m => m.role === 'Admin');

  return (
    <div className="w-full max-w-[1200px] mx-auto pt-[calc(80px+2.5rem)] pb-24 px-8 min-h-screen bg-white">

      {/* Page Header */}
      <div className="text-center mb-14 pb-8">
        <h1 className="font-sans text-[2.25rem] font-bold text-[#111111] mb-3">Wild Tuskers Sri Lanka Team</h1>
        <p className="font-sans text-[0.98rem] text-[#777777] max-w-[580px] mx-auto leading-[1.7]">
          The dedicated individuals behind Wild Tuskers Sri Lanka:
          researchers, photographers, and conservationists united by a shared mission.
        </p>
      </div>

      {/* ── Admins Section ── */}
      <section className="mb-16">
        <h2 className="font-sans text-[1.05rem] font-bold text-[#111111] mb-8 pb-3 border-b-2 border-[#f0f0f0] flex items-center gap-2">
          Admins <span className="font-normal text-[0.9rem] text-[#aaaaaa]">{admins.length}</span>
        </h2>
        <div className="grid grid-cols-2 min-[560px]:grid-cols-3 min-[760px]:grid-cols-4 min-[1000px]:grid-cols-5 gap-x-6 gap-y-10">
          {admins.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Individual Team Member Card ─────────────────────────────── */
function MemberCard({ member }) {
  const cleanName = member.name.replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, '');
  const words = cleanName.trim().split(/\s+/);
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : member.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center text-center gap-3 cursor-default transition-transform duration-200 hover:-translate-y-[3px] group">
      <div className="w-20 h-20 min-[560px]:w-[130px] min-[560px]:h-[130px] rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0 border-3 border-[#f0f0f0] transition-colors duration-200 group-hover:border-accent">
        {member.image
          ? <img src={member.image} className="w-full h-full object-cover" alt={member.name} />
          : <span className="font-sans text-[1.7rem] font-bold text-accent tracking-[1px]">{initials}</span>
        }
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="font-sans text-[0.88rem] font-semibold text-[#111111] m-0 leading-[1.3]">{member.name}</p>
        <div className="flex flex-wrap justify-center gap-1">
          <span className={`inline-flex items-center font-sans text-[0.7rem] font-semibold px-[0.55rem] py-[0.18rem] rounded-full ${
            member.role === 'Moderator'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-[#c69b55]/12 text-[#a07830] border border-[#c69b55]/30'
          }`}>
            {member.role}
          </span>
        </div>
        {member.bio && <p className="font-sans text-[0.75rem] text-[#999999] m-0 leading-[1.4]">{member.bio}</p>}
      </div>
    </div>
  );
}

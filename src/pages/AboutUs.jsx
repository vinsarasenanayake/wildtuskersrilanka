import React from 'react';
import './AboutUs.css';
import { Star, Trophy, TrendingUp } from 'lucide-react';

const team = [
  // Admins
  {
    name: 'Sadeepa Gunawardana',
    role: 'Admin',
    badge: null,
    bio: 'Digital creator',
    image: null,
  },
  {
    name: 'Priyanjana Dilmith',
    role: 'Admin',
    badge: 'Top Contributor',
    bio: 'Digital creator',
    image: null,
  },
  {
    name: 'Dushyantha Silva',
    role: 'Admin',
    badge: null,
    bio: 'Colombo, Sri Lanka',
    image: null,
  },
  {
    name: 'Piyumal Pradeep',
    role: 'Admin',
    badge: null,
    bio: 'Digital creator',
    image: null,
  },
  {
    name: 'Saman Halloluwa',
    role: 'Admin',
    badge: 'Rising Contributor',
    bio: 'Digital creator',
    image: null,
  },
  {
    name: 'Pathum Bandara',
    role: 'Admin',
    badge: 'Top Contributor',
    bio: 'Photographer',
    image: null,
  },
  {
    name: 'Raveendra Siriwardene',
    role: 'Admin',
    badge: null,
    bio: 'General Manager – HR & Admin at United Motors Lanka PLC',
    image: null,
  },
  {
    name: 'Geemal Harold',
    role: 'Admin',
    badge: null,
    bio: 'Digital creator',
    image: null,
  },
  {
    name: 'Malith Madusanka Rajapaksha',
    role: 'Admin',
    badge: 'Rising Contributor',
    bio: 'Digital creator',
    image: null,
  },
  {
    name: 'Isuru Upanishad',
    role: 'Admin',
    badge: null,
    bio: 'Consultant Gastroenterological Surgeon at National Hospital',
    image: null,
  },
  {
    name: 'Pasan Senevirathne',
    role: 'Admin',
    badge: null,
    bio: 'Photographer',
    image: null,
  },
  {
    name: 'Namal Kamalgoda',
    role: 'Admin',
    badge: null,
    bio: "Bishop Cotton Boys' School",
    image: null,
  },
  {
    name: 'Milinda Wattegedara',
    role: 'Admin',
    badge: 'All-Star Contributor',
    bio: 'Works at Dialog Axiata',
    image: null,
  },
  {
    name: 'Suraj Perera',
    role: 'Admin',
    badge: 'Top Contributor',
    bio: 'Digital creator',
    image: null,
  },
  {
    name: 'Chandika Lakmal',
    role: 'Admin',
    badge: 'All-Star Contributor',
    bio: 'Digital creator',
    image: null,
  },
  // Moderators
  {
    name: 'Nishantha Safari',
    role: 'Moderator',
    badge: null,
    bio: 'Habarana',
    image: null,
  },
  {
    name: 'Sasika Sri Sanjeewa',
    role: 'Moderator',
    badge: null,
    bio: 'Digital creator',
    image: null,
  },
];

const badgeConfig = {
  'Top Contributor':     { icon: <Trophy size={11} />,     class: 'badge-top' },
  'Rising Contributor':  { icon: <TrendingUp size={11} />, class: 'badge-rising' },
  'All-Star Contributor':{ icon: <Star size={11} />,        class: 'badge-allstar' },
};

export default function AboutUs() {
  const admins     = team.filter(m => m.role === 'Admin');
  const moderators = team.filter(m => m.role === 'Moderator');

  return (
    <div className="team-page">

      {/* Page Header */}
      <div className="team-header">
        <h1 className="team-title">Wild Tuskers Sri Lanka Team</h1>
        <p className="team-subtitle">
          The dedicated individuals behind Wild Tuskers Sri Lanka —
          researchers, photographers, and conservationists united by a shared mission.
        </p>
      </div>

      {/* Admins */}
      <section className="team-section">
        <h2 className="team-section-label">Admins <span>{admins.length}</span></h2>
        <div className="team-grid">
          {admins.map((member, i) => (
            <MemberCard key={i} member={member} />
          ))}
        </div>
      </section>

      {/* Moderators */}
      <section className="team-section">
        <h2 className="team-section-label">Moderators <span>{moderators.length}</span></h2>
        <div className="team-grid">
          {moderators.map((member, i) => (
            <MemberCard key={i} member={member} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MemberCard({ member }) {
  const initials = member.name.split(' ').map(w => w[0]).slice(0, 2).join('');

  return (
    <div className="member-card">
      <div className="member-avatar">
        {member.image
          ? <img src={member.image} alt={member.name} />
          : <span className="member-initials">{initials}</span>
        }
      </div>
      <div className="member-info">
        <p className="member-name">{member.name}</p>
        <div className="member-badges">
          <span className={`role-badge ${member.role === 'Moderator' ? 'role-mod' : 'role-admin'}`}>
            {member.role}
          </span>
          {member.badge && badgeConfig[member.badge] && (
            <span className={`contrib-badge ${badgeConfig[member.badge].class}`}>
              {badgeConfig[member.badge].icon}
              {member.badge}
            </span>
          )}
        </div>
        {member.bio && <p className="member-bio">{member.bio}</p>}
      </div>
    </div>
  );
}

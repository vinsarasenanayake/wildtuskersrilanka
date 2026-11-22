/**
 * @file AboutUs.jsx
 * @description Wild Tuskers Sri Lanka organizational overview, mission, core objectives,
 * conservation leadership team, and admin team member management.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, Edit2, Trash2, X, Save, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '../../models/TeamModel';
import { useAuth } from '../../controllers/useAuth';
import ImageUploadBox from '../components/ImageUploadBox';
import { safeUrl } from '../../utils/safeUrl';
import Footer from '../components/Footer';

const OBJECTIVES = [
  {
    num: 1,
    title: 'Maintain the National Tusker Identification Database',
    desc: "Develop and maintain the most comprehensive and accurate database of Sri Lanka's tusked elephants, continuously updating profiles, distribution records, and behavioral observations.",
  },
  {
    num: 2,
    title: 'Advance Research and Monitoring',
    desc: 'Conduct systematic field research and photographic documentation to improve understanding of tusker populations, movements, social behaviour, and conservation needs.',
  },
  {
    num: 3,
    title: 'Strengthen Conservation Advocacy',
    desc: 'Promote evidence-based conservation policies and support initiatives aimed at protecting critical habitats and reducing threats faced by tusked elephants.',
  },
  {
    num: 4,
    title: 'Educate and Inspire the Public',
    desc: "Increase awareness of the ecological, cultural, and historical importance of Sri Lanka's tusked elephants through educational programmes, digital storytelling, exhibitions, and media outreach.",
  },
  {
    num: 5,
    title: 'Foster Collaboration and Citizen Science',
    desc: 'Build a strong network of researchers, wildlife photographers, conservation organisations, park guides, and local communities to contribute knowledge and support long-term monitoring efforts.',
  },
];

export default function AboutUs() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  // Modal states for admin management
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Admin',
    facebookUrl: '',
    image: '',
    displayOrder: 1,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadTeam = async () => {
    try {
      const data = await getTeamMembers();
      setTeam(data || []);
    } catch (err) {
      console.error('[AboutUs] Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | About Us';
    loadTeam();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: 'Admin',
      facebookUrl: '',
      image: '',
      displayOrder: (team.length || 0) + 1,
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (member, e) => {
    if (e) e.stopPropagation();
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      role: member.role || 'Admin',
      facebookUrl: member.facebookUrl || '',
      image: member.image || '',
      displayOrder: member.displayOrder || 1,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDeleteMember = async (member, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${member.name}" from the team?`)) {
      return;
    }
    try {
      if (member.id) {
        await deleteTeamMember(member.id);
      }
      setTeam((prev) => prev.filter((m) => (m.id ? m.id !== member.id : m.name !== member.name)));
    } catch (err) {
      alert(`Could not delete team member: ${err.message}`);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter the team member name.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim() || 'Admin',
        facebookUrl: formData.facebookUrl.trim() || null,
        image: formData.image || null,
        displayOrder: Number(formData.displayOrder) || 1,
      };

      if (editingMember && editingMember.id) {
        await updateTeamMember(editingMember.id, payload);
      } else {
        await addTeamMember(payload);
      }
      await loadTeam();
      setShowModal(false);
    } catch (err) {
      setFormError(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const admins = team.filter((m) => m.role === 'Admin');

  return (
    <div className="w-full max-w-[1200px] mx-auto pt-[calc(80px+2.5rem)] pb-24 px-8 min-h-screen bg-white">
      {/* Page Header / About Us Story */}
      <div className="mb-20">
        <h1 className="font-sans text-[2.25rem] sm:text-[2.65rem] font-bold text-[#111111] mb-8 text-center tracking-tight">
          Wild Tuskers Sri Lanka
        </h1>

        <div className="max-w-[960px] mx-auto font-sans text-[0.98rem] sm:text-[1.02rem] text-[#374151] leading-[1.85] flex flex-col gap-6 text-justify">
          <p className="m-0">
            Founded in 2013, Wild Tuskers Sri Lanka was established with a clear vision: to address a critical gap in the documentation and identification of Sri Lanka's tusked elephants. At the time, there was no comprehensive island-wide database dedicated to systematically identifying and tracking individual tuskers. Recognising the urgent need to preserve information about these rare and iconic animals, a group of passionate wildlife enthusiasts, photographers, and conservationists came together to create what became Sri Lanka's first dedicated tusker identification database.
          </p>

          <p className="m-0">
            For over a decade, Wild Tuskers Sri Lanka has worked tirelessly to document, monitor, and study tusked elephants across the island's protected areas and wilderness landscapes. Through meticulous field observations, photography, data collection, and analysis, we continue to build an accurate and evolving repository of knowledge that supports conservation efforts and raises awareness about the importance of protecting these magnificent giants.
          </p>

          <p className="m-0">
            The Sri Lankan tusker is far more than a wildlife icon. For over 2,500 years, tusked elephants have been deeply woven into the nation's history, culture, traditions, and spiritual heritage. Revered in ancient kingdoms, celebrated in art and literature, and honoured in religious and cultural ceremonies, they represent one of Sri Lanka's most treasured natural and cultural symbols.
          </p>

          <p className="m-0">
            Today, these extraordinary animals face increasing threats from habitat loss, human-elephant conflict, shrinking ranges, and declining numbers. Their conservation is made even more critical by the fact that only 5-6% of Sri Lanka's male elephant population bears tusks, making sightings of wild tuskers a truly rare and remarkable experience. Wild Tuskers Sri Lanka is committed to ensuring that future generations inherit a landscape where these majestic giants continue to roam free, one of Asia's most extraordinary and endangered wildlife treasures.
          </p>

          <p className="m-0 pt-2 font-medium text-[#15462d] sm:text-[1.05rem] italic">
            Stand with us. Protect the giants. Preserve the legacy.
          </p>
        </div>
      </div>

      {/* ── Objectives Section ── */}
      <section className="mb-20">
        <div className="mb-8 pb-3 border-b-2 border-[#f0f0f0]">
          <h2 className="font-sans text-[1.35rem] sm:text-[1.5rem] font-bold text-[#111111] m-0 tracking-tight">
            Objectives
          </h2>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          {OBJECTIVES.map((obj) => (
            <div
              key={obj.num}
              className="flex items-start gap-4 p-5 sm:p-6 rounded-xl bg-[#fafbfa] border border-[#edf0ed] transition-colors hover:bg-white hover:border-[#c69b55]/40 hover:shadow-sm"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary text-white font-bold text-sm sm:text-base flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {obj.num}
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <h3 className="font-sans text-[1.05rem] sm:text-[1.1rem] font-bold text-[#111111] m-0">
                  {obj.title}
                </h3>
                <p className="font-sans text-[0.92rem] sm:text-[0.96rem] text-[#555555] leading-[1.7] m-0">
                  {obj.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Admins Section ── */}
      <section className="mb-16">
        <div className="flex flex-row items-center justify-between mb-8 pb-3 border-b-2 border-[#f0f0f0] gap-2 sm:gap-4 flex-wrap">
          <h2 className="font-sans text-[1.05rem] font-bold text-[#111111] flex items-center gap-2 m-0 shrink-0">
            Admins <span className="font-normal text-[0.9rem] text-[#aaaaaa]">{admins.length}</span>
          </h2>

          {isAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-[0.72rem] sm:text-xs font-bold transition-all shadow-sm border-none cursor-pointer shrink-0 whitespace-nowrap"
            >
              <PlusCircle size={14} className="sm:w-[15px] sm:h-[15px]" />
              <span>Add Admin / Team Member</span>
            </button>
          )}
        </div>

        {loading && team.length === 0 ? (
          <div className="py-12 text-center text-[#aaaaaa] font-sans">Loading team…</div>
        ) : (
          <div className="grid grid-cols-2 min-[560px]:grid-cols-3 min-[760px]:grid-cols-4 min-[1000px]:grid-cols-5 gap-x-6 gap-y-10">
            {admins.map((member) => (
              <MemberCard
                key={member.id || member.name}
                member={member}
                isAdmin={isAdmin}
                onEdit={(e) => openEditModal(member, e)}
                onDelete={(e) => handleDeleteMember(member, e)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Copyright Information & Photographs ── */}
      <section className="mt-20 pt-14 border-t-2 border-[#f0f0f0]">
        <div className="max-w-[960px] mx-auto flex flex-col gap-14">
          {/* Section 1: Copyright Information */}
          <div className="w-full flex flex-col">
            <h2 className="font-sans text-[1.2rem] sm:text-[1.3rem] font-bold text-[#111111] mb-6 tracking-tight text-center">
              Copyright &copy; Information
            </h2>
            <div className="font-sans text-[0.92rem] sm:text-[0.96rem] text-[#444444] leading-[1.75] flex flex-col gap-3.5 text-left">
              <p className="m-0">Copyright &copy; 2026</p>
              <p className="m-0 font-medium text-[#222222]">Wild Tuskers of Sri Lanka</p>
              <p className="m-0 text-[#555555] text-justify">
                All Rights Reserved. No part of this website may be Reproduced in any form, by any means without prior written permission from the copyright holders.
              </p>
              <div className="mt-2 text-[#444444] leading-[1.6]">
                <p className="m-0 font-medium text-[#222222]">Milinda Wattegedara,</p>
                <p className="m-0">462/4/C, Lake Road, Akuregoda, Batharamulla</p>
                <p className="m-0">
                  Email &mdash;{' '}
                  <a
                    href="mailto:milindawattegedara@gmail.com"
                    className="text-primary hover:text-primary-light hover:underline font-medium transition-colors"
                  >
                    milindawattegedara@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Copyright Photographs */}
          <div className="w-full flex flex-col">
            <h2 className="font-sans text-[1.2rem] sm:text-[1.3rem] font-bold text-[#111111] mb-5 tracking-tight text-center">
              Copyright &copy; Photographs
            </h2>
            <p className="m-0 font-sans text-[0.92rem] sm:text-[0.96rem] text-[#555555] leading-[1.75] text-justify">
              The copyrights of all the photographs displayed here are owned by Wild Tuskers Sri Lanka and the original Photographer. Unauthorised reproduction, distribution, or use of these images is prohibited without the explicit permission of the original photographer or Wild Tuskers Sri Lanka Team.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer Attribution ── */}
      <Footer />

      {/* ── Add / Edit Admin Modal ── */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-[500px] w-full p-6 sm:p-8 shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-bold text-gray-900 m-0">
                      {editingMember ? 'Edit Admin / Team Member' : 'Add New Admin / Team Member'}
                    </h3>
                    <p className="font-sans text-xs text-gray-500 m-0">
                      Changes are directly saved to database and displayed on About Us
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-xs font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
                {/* Photo Upload with ImageUploadBox (Circle Mode) */}
                <div className="flex flex-col items-center justify-center mb-2">
                  <ImageUploadBox
                    circle
                    folder="team"
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                  />
                  <span className="text-[0.72rem] text-gray-400 mt-1">Profile Photo (Optional)</span>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WTS Admin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                  />
                </div>

                {/* Role & Display Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WTS Admin"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                    />
                  </div>
                </div>

                {/* Facebook URL */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Facebook Profile Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/username"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-accent font-sans"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button aria-label="Save"
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-light rounded-lg border-none shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{saving ? 'Saving…' : 'Save Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

/* ── Individual Team Member Card ─────────────────────────────── */
function MemberCard({ member, isAdmin, onEdit, onDelete }) {
  const cleanName = member.name.replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, '');
  const words = cleanName.trim().split(/\s+/);
  const initials =
    words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : member.name.slice(0, 2).toUpperCase();

  const CardTag = member.facebookUrl && !isAdmin ? 'a' : 'div';
  const cardProps =
    member.facebookUrl && !isAdmin
      ? {
          href: safeUrl(member.facebookUrl),
          target: '_blank',
          rel: 'noopener noreferrer',
          title: `View ${member.name}'s Facebook Profile`,
        }
      : {};

  return (
    <div className="relative group">
      {/* Admin Action Buttons (Overlay) */}
      {isAdmin && (
        <div className="absolute top-0 right-1 z-10 flex items-center gap-1 bg-white/95 rounded-lg p-1 shadow-md border border-gray-200">
          <button
            type="button"
            onClick={onEdit}
            title="Edit details"
            className="w-7 h-7 rounded-md bg-gray-100 hover:bg-accent hover:text-primary text-gray-700 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Remove admin"
            className="w-7 h-7 rounded-md bg-gray-100 hover:bg-rose-600 hover:text-white text-gray-700 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      <CardTag
        {...cardProps}
        className={`flex flex-col items-center text-center gap-3 transition-transform duration-200 no-underline ${
          member.facebookUrl ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'
        }`}
      >
        <div className="w-20 h-20 min-[560px]:w-[130px] min-[560px]:h-[130px] rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0 border-3 border-[#f0f0f0] transition-colors duration-200 group-hover:border-accent">
          {member.image ? (
            <img src={member.image} className="w-full h-full object-cover" alt={member.name} />
          ) : (
            <span className="font-sans text-[1.7rem] font-bold text-accent tracking-[1px]">{initials}</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <p className="font-sans text-[0.88rem] font-semibold text-[#111111] m-0 leading-[1.3] group-hover:text-primary transition-colors flex items-center gap-1">
            <span>{member.name}</span>
            {member.facebookUrl && <ExternalLink size={11} className="text-[#888888] shrink-0" />}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-1.5">
            <span
              className={`inline-flex items-center font-sans text-[0.7rem] font-semibold px-[0.55rem] py-[0.18rem] rounded-full ${
                member.role === 'Moderator'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-[#c69b55]/12 text-[#a07830] border border-[#c69b55]/30'
              }`}
            >
              {member.role}
            </span>
          </div>
          {member.bio && <p className="font-sans text-[0.75rem] text-[#999999] m-0 leading-[1.4]">{member.bio}</p>}
        </div>
      </CardTag>
    </div>
  );
}

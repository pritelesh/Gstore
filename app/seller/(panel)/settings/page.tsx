"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import { getSellerStore, updateStore, getCurrentProfile, updateProfile } from "@/lib/actions/seller";

export default function SellerSettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeMsg, setStoreMsg] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [savingStore, setSavingStore] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    Promise.all([getSellerStore(), getCurrentProfile()]).then(([s, p]) => {
      if ("found" in s && s.found) {
        setStoreName(s.store.name);
        setStoreDesc(s.store.description ?? "");
      } else if ("error" in s) setError(s.error);
      if ("profile" in p) {
        setProfileName(p.profile.full_name);
        setProfilePhone(p.profile.phone ?? "");
        setProfileEmail(p.profile.email);
      } else if ("error" in p) setError(p.error);
      setLoading(false);
    });
  }, []);

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    setStoreMsg("");
    setError("");
    const res = await updateStore({ name: storeName, description: storeDesc || null });
    if ("error" in res) setError(res.error);
    else setStoreMsg("Store settings saved!");
    setSavingStore(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setError("");
    const res = await updateProfile({ full_name: profileName, phone: profilePhone || null });
    if ("error" in res) setError(res.error);
    else setProfileMsg("Profile updated!");
    setSavingProfile(false);
  };

  if (loading) return <div className="flex items-center justify-center h-full p-8"><RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" /></div>;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">Store Settings</h1>
        <p className="text-[#FAFFC4]/60 mt-1">Manage your store and profile</p>
      </div>

      {error && <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-sm text-red-300">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <h2 className="text-lg font-bold text-[#FAFFC4] mb-4">Store Information</h2>
          <form onSubmit={handleStoreSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#FAFFC4]/50 mb-1">Store Name</label>
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860] text-[#FAFFC4] placeholder-[#FAFFC4]/30 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#141b40,inset_-4px_-4px_8px_#2835a0]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#FAFFC4]/50 mb-1">Description</label>
              <textarea value={storeDesc} onChange={e => setStoreDesc(e.target.value)} rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860] text-[#FAFFC4] placeholder-[#FAFFC4]/30 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#141b40,inset_-4px_-4px_8px_#2835a0] resize-none"
              />
            </div>
            <button type="submit" disabled={savingStore}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors text-sm disabled:opacity-50 shadow-[4px_4px_8px_#1a2354,-4px_-4px_8px_#3849ae]"
            >
              <Save size={16} /> {savingStore ? "Saving..." : "Save Store"}
            </button>
            {storeMsg && <p className="text-sm text-green-400">{storeMsg}</p>}
          </form>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <h2 className="text-lg font-bold text-[#FAFFC4] mb-4">Profile Settings</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#FAFFC4]/50 mb-1">Name</label>
              <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860] text-[#FAFFC4] placeholder-[#FAFFC4]/30 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#141b40,inset_-4px_-4px_8px_#2835a0]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#FAFFC4]/50 mb-1">Phone</label>
              <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860] text-[#FAFFC4] placeholder-[#FAFFC4]/30 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#141b40,inset_-4px_-4px_8px_#2835a0]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#FAFFC4]/50 mb-1">Email</label>
              <input type="email" value={profileEmail} disabled
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860]/50 text-[#FAFFC4]/40 border border-[#FAFFC4]/10 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-[#FAFFC4]/30 mt-1">Email cannot be changed here</p>
            </div>
            <button type="submit" disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors text-sm disabled:opacity-50 shadow-[4px_4px_8px_#1a2354,-4px_-4px_8px_#3849ae]"
            >
              <Save size={16} /> {savingProfile ? "Saving..." : "Save Profile"}
            </button>
            {profileMsg && <p className="text-sm text-green-400">{profileMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

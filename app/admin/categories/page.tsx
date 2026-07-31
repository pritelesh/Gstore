"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, RefreshCw, Edit3, X, Check } from "lucide-react";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from "@/lib/actions/admin";
import type { Category } from "@/lib/actions/admin";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await getCategories();
    if ("error" in res) setError(res.error);
    else setCategories(res.categories);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await createCategory(newName.trim());
    if ("success" in res) {
      setNewName("");
      setAdding(false);
      fetch();
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) return;
    const res = await updateCategory(id, editingName.trim());
    if ("success" in res) {
      setEditingId(null);
      setEditingName("");
      fetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    const res = await deleteCategory(id);
    if ("error" in res) {
      alert(res.error);
    } else {
      fetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#FAFFC4]">Categories ({categories.length})</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FE7F2D] text-white text-xs font-semibold rounded-xl hover:brightness-110 transition-all"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {adding && (
        <div className="neu-flat p-4 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            autoFocus
            className="flex-1 bg-surface text-[#FAFFC4] text-sm rounded-xl px-4 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FE7F2D] placeholder-[#FAFFC4]/30"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button onClick={handleAdd} className="p-2 bg-green-500 text-white rounded-xl hover:brightness-110"><Check size={16} /></button>
          <button onClick={() => { setAdding(false); setNewName(""); }} className="p-2 bg-white/10 text-[#FAFFC4] rounded-xl hover:bg-white/20"><X size={16} /></button>
        </div>
      )}

      <div className="neu-flat overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Name</th>
              <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Slug</th>
              <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  {editingId === c.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="bg-surface text-[#FAFFC4] text-sm rounded-xl px-3 py-1.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(c.id)}
                      />
                      <button onClick={() => handleEdit(c.id)} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="text-[#FAFFC4]/40 hover:text-[#FAFFC4]"><X size={16} /></button>
                    </div>
                  ) : (
                    <span className="text-[#FAFFC4] font-medium">{c.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#FAFFC4]/50">{c.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => { setEditingId(c.id); setEditingName(c.name); }}
                      className="neu-flat p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-xl"
                      aria-label="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="neu-flat p-1.5 text-red-400 hover:bg-red-400/10 rounded-xl" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

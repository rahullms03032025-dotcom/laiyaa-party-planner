import React, { useState } from 'react';
import { Plus, Check, ShoppingBag, CheckCircle, Package, Trash2, Home, Sparkles } from 'lucide-react';
import type { MaterialItem, MaterialCategory, MaterialStatus, User } from '../types/party.ts';

interface MaterialsSectionProps {
  materials: MaterialItem[];
  currentUser: User | null;
  onClaimMaterial: (item: MaterialItem) => void;
  onUpdateStatus: (item: MaterialItem, status: MaterialStatus) => void;
  onAddMaterial: (item: Partial<MaterialItem>) => void;
  onDeleteMaterial: (id: string) => void;
  onOpenAuth: () => void;
}

const CATEGORY_LABELS: Record<MaterialCategory | 'all', string> = {
  all: 'Sabhi Saman (All)',
  staple: 'Murmura / Laiya (Base)',
  namkeen_crunch: 'Namkeen & Moongfali',
  fresh_veggies: 'Taza Pyaaz & Hari Mirchi',
  spices_oil: 'Sarson Tel & Masala Jars',
  disposables_drinks: 'Thonga & Adrak Chai',
};

export const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  materials,
  currentUser,
  onClaimMaterial,
  onUpdateStatus,
  onAddMaterial,
  onDeleteMaterial,
  onOpenAuth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state (Zero money!)
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MaterialCategory>('namkeen_crunch');
  const [newQuantity, setNewQuantity] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredMaterials =
    selectedCategory === 'all'
      ? materials
      : materials.filter((m) => m.category === selectedCategory);

  const totalBroughtOrPledged = materials.filter((m) => m.status !== 'unassigned').length;
  const progressPercent = Math.round((totalBroughtOrPledged / Math.max(1, materials.length)) * 100);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    onAddMaterial({
      name: newName,
      category: newCategory,
      quantity: newQuantity || 'Ghar se 1 Dabba / Pack',
      notes: newNotes || 'Ghar se layenge',
    });

    setNewName('');
    setNewQuantity('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: MaterialStatus) => {
    switch (status) {
      case 'unassigned':
        return <span className="text-stone-400 font-medium">Khali Hai (Koi Le Aao)</span>;
      case 'pledged':
        return <span className="text-amber-700 font-semibold">Pledge Liya Hai</span>;
      case 'packed_at_home':
        return <span className="text-blue-700 font-semibold">Ghar Par Pack Kar Liya</span>;
      case 'brought':
        return <span className="text-emerald-700 font-semibold">LMS Office Pahunch Gaya!</span>;
    }
  };

  return (
    <section id="materials" className="py-12 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>100% Ghar Ka Saman Potluck · No Money Involved</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Ghar Ka Saman (Who is Bringing What from Home?)
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              7 doston me sabhi apne ghar ki pantry se items laa rahe hain. Click karke apni zimmedari claim karo!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghar Se Aur Kuch Laana Hai? Add Karo</span>
            </button>
          </div>
        </div>

        {/* Progress & Category Filter Tabs */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/3">
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span>Saman Ready Hone Ka Meter</span>
              <span className="font-mono tabular-nums font-bold text-amber-800">
                {totalBroughtOrPledged}/{materials.length} Items Covered ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto max-w-full">
            {(Object.keys(CATEGORY_LABELS) as (MaterialCategory | 'all')[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Table (Completely Zero Money/Budget!) */}
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Ghar Se Laane Ka Saman</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Kitna Chahiye</th>
                <th className="py-3 px-4">Kaun Laa Raha Hai (Pehchaan)</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredMaterials.map((item) => {
                const isClaimedByMe = currentUser && item.assignedToMemberId === currentUser.id;
                const isUnassigned = item.status === 'unassigned';
                const isAdmin = currentUser?.role === 'admin';

                return (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      <div>{item.name}</div>
                      {item.notes && (
                        <div className="text-[11px] text-stone-500 font-normal mt-0.5">
                          💡 {item.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 font-medium whitespace-nowrap">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums text-stone-700 whitespace-nowrap font-medium">
                      {item.quantity}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.assignedToMemberName ? (
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {item.assignedToMemberName.charAt(0)}
                          </span>
                          <div>
                            <span className="font-semibold text-stone-900">
                              {item.assignedToMemberName}
                            </span>
                            {item.assignedToUsername && (
                              <span className="text-[10px] text-amber-800 font-mono block -mt-0.5">
                                @{item.assignedToUsername}
                              </span>
                            )}
                          </div>
                          {isClaimedByMe && (
                            <span className="text-[10px] text-emerald-700 font-bold ml-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                              (Aapka)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Kisi Ne Nahi Liya</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isUnassigned ? (
                          <button
                            onClick={() => {
                              if (!currentUser) {
                                onOpenAuth();
                              } else {
                                onClaimMaterial(item);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                          >
                            Ye Mai Ghar Se Launga!
                          </button>
                        ) : isClaimedByMe || isAdmin ? (
                          <div className="flex items-center gap-1.5">
                            {item.status === 'pledged' && (
                              <button
                                onClick={() => onUpdateStatus(item, 'packed_at_home')}
                                className="px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                                title="Mark as packed at home"
                              >
                                Pack Ho Gaya
                              </button>
                            )}
                            {item.status === 'packed_at_home' && (
                              <button
                                onClick={() => onUpdateStatus(item, 'brought')}
                                className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded"
                                title="Mark as brought to LMS Certifications"
                              >
                                Office Me Hai
                              </button>
                            )}
                            <button
                              onClick={() => onClaimMaterial(item)}
                              className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-700 hover:underline"
                            >
                              Release
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400">Assigned</span>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => onDeleteMaterial(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                            title="Hatao"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal: Add Material */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">
                  Ghar Se Kuch Aur Laana Hai?
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Saman Ka Naam *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ghar Ki Poodina Chutney, Roasted Makhana"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as MaterialCategory)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="staple">Murmura / Laiya (Base)</option>
                      <option value="namkeen_crunch">Namkeen & Moongfali</option>
                      <option value="fresh_veggies">Taza Pyaaz & Hari Mirchi</option>
                      <option value="spices_oil">Sarson Tel & Masala Jars</option>
                      <option value="disposables_drinks">Thonga & Adrak Chai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Kitna Laoge (Quantity)
                    </label>
                    <input
                      type="text"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder="e.g. 1 Chota Tiffin, 500g"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ghar Ka Desi Jugaad Note
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Mummy ne fresh banaya hai, airtight dabba me launga"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-2 text-xs text-stone-500 hover:text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                  >
                    Checklist Me Add Karo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

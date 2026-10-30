import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Heart,
  Trash2,
  Maximize2,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  Download,
  Filter,
} from 'lucide-react';
import type { PartyPhoto, User } from '../types/party.ts';

interface PhotoGallerySectionProps {
  photos: PartyPhoto[];
  currentUser: User | null;
  onUploadPhoto: (photo: {
    url: string;
    caption: string;
    userId: string;
    username: string;
    userName: string;
    tags?: string[];
  }) => Promise<any>;
  onLikePhoto: (photoId: string) => Promise<any>;
  onDeletePhoto: (photoId: string, adminPassword?: string) => Promise<any>;
  onRequestLogin: () => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  photos,
  currentUser,
  onUploadPhoto,
  onLikePhoto,
  onDeletePhoto,
  onRequestLogin,
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PartyPhoto | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Upload form state
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('prep');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adminPass, setAdminPass] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');

  const isAdmin = currentUser?.username === 'rahul' || currentUser?.role === 'admin';

  // Handle local image file pick and resize
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Kripya sirf image file (JPG, PNG, WebP) select karein!');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 1200px width/height for fast DB storage
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImagePreview(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequestLogin();
      return;
    }
    if (!imagePreview) {
      setUploadError('Pehle ek photo select karein!');
      return;
    }
    if (!caption.trim()) {
      setUploadError('Photo ke sath ek mazedaar caption zaroor likhein!');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    try {
      await onUploadPhoto({
        url: imagePreview,
        caption: caption.trim(),
        userId: currentUser.id,
        username: currentUser.username,
        userName: currentUser.name,
        tags: [selectedTag],
      });
      // Reset form
      setImagePreview('');
      setCaption('');
      setIsUploadOpen(false);
    } catch (err: any) {
      setUploadError(err?.message || 'Photo upload karne me error aaya.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId || !currentUser) return;
    try {
      await onDeletePhoto(deleteId, adminPass || undefined);
      setDeleteId(null);
      setAdminPass('');
      setDeleteError('');
      if (selectedPhoto?.id === deleteId) setSelectedPhoto(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'Delete karne me dikkat aayi. Admin password check karein.');
    }
  };

  const filteredPhotos = photos.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'my_uploads') return p.uploadedByUserId === currentUser?.id;
    return p.tags?.includes(activeFilter) || p.uploadedByUsername === activeFilter;
  });

  return (
    <section id="photo-gallery" className="py-12 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-bold tracking-wide uppercase mb-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Database Stored · 7 Members Gallery</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Party Ki Photo Gallery
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Koi bhi member prep, chopping, bada parat mix, aur LMS Certifications Private Limited ke mazedaar yaadon ki photos upload kar sakta hai — seedha admin database me store hoti hain!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!currentUser) {
                  onRequestLogin();
                  return;
                }
                setIsUploadOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Nayi Photo Upload Karo</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs">
          <span className="text-stone-400 font-medium flex items-center gap-1 pr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Sabhi Photos ({photos.length})
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveFilter('my_uploads')}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                activeFilter === 'my_uploads'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Meri Uploaded Photos
            </button>
          )}

          <button
            onClick={() => setActiveFilter('prep')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeFilter === 'prep'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🧅 Veggies & Prep
          </button>

          <button
            onClick={() => setActiveFilter('mixing')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeFilter === 'mixing'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🥣 Parat Mixing
          </button>

          <button
            onClick={() => setActiveFilter('masti')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeFilter === 'masti'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🎉 Adda & Masti
          </button>
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">Abhi is category me koi photo nahi hai</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Ghar se murmura, pyaaz, namkeen laane ki ya parat mix ki photo upload karein taaki sabhi 7 dost dekh sakein!
            </p>
            <button
              onClick={() => {
                if (!currentUser) onRequestLogin();
                else setIsUploadOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700"
            >
              Abhi Photo Upload Karein
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => {
              const isLiked = currentUser ? photo.likes?.includes(currentUser.id) : false;
              const canDelete =
                currentUser?.id === photo.uploadedByUserId ||
                currentUser?.username === 'rahul' ||
                currentUser?.role === 'admin';

              return (
                <div
                  key={photo.id}
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <span className="text-white text-xs font-medium flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Bada Karke Dekho</span>
                      </span>
                      <span className="text-[11px] text-white/80 font-mono">
                        {new Date(photo.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Tags Badge */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold capitalize">
                          {photo.tags[0].replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Metadata */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-900 leading-snug">
                        {photo.caption}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                          {photo.uploadedByName.charAt(0)}
                        </div>
                        <div className="text-[11px]">
                          <span className="font-bold text-stone-800">@{photo.uploadedByUsername}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Like Button */}
                        <button
                          onClick={() => {
                            if (!currentUser) onRequestLogin();
                            else onLikePhoto(photo.id);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isLiked
                              ? 'text-rose-600 bg-rose-50'
                              : 'text-stone-500 hover:text-stone-800 bg-stone-50 hover:bg-stone-100'
                          }`}
                          title="Like this photo"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                          />
                          <span className="font-mono text-[11px]">{photo.likes?.length || 0}</span>
                        </button>

                        {/* Delete Button */}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteId(photo.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete photo from Admin database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Modal Drawer */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Nayi Party Photo Upload Karein
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Stored authoritatively in Admin's database
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                {/* Image Dropzone / Preview */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Photo File (From Phone/Camera or Desktop)
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden aspect-16/10 bg-stone-100 border border-stone-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-amber-50/20"
                    >
                      <Camera className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <div className="text-xs font-bold text-stone-800">
                        Click karein ya image yahan drop karein
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        PNG, JPG, WebP supported (Auto-compressed for database)
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mazedaar Caption Likho
                  </label>
                  <textarea
                    rows={2}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Ankur showing the fresh murmura batch! or Bhelpuri mixing at LMS Certifications Pvt Ltd 🥣"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-medium"
                    required
                  />
                </div>

                {/* Tag Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Photo Ka Topic / Tag
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'prep', label: '🧅 Prep & Veggies' },
                      { id: 'mixing', label: '🥣 Parat Mixing' },
                      { id: 'masti', label: '🎉 Office Masti' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTag(t.id)}
                        className={`text-xs py-2 px-2 rounded-lg font-medium border text-center transition-colors ${
                          selectedTag === t.id
                            ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Uploader Indicator */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between">
                  <span className="text-stone-500">Uploading as:</span>
                  <span className="font-bold text-stone-800">
                    {currentUser?.name} (@{currentUser?.username})
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !imagePreview}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Database Me Upload Karo'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full-Screen Lightbox Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-4xl w-full flex flex-col items-center">
              <div className="relative max-h-[75vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
                />
              </div>

              <div className="w-full mt-4 p-4 rounded-xl bg-stone-900/80 backdrop-blur-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10">
                <div>
                  <h3 className="text-base font-bold">{selectedPhoto.caption}</h3>
                  <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>Uploaded by <strong>@{selectedPhoto.uploadedByUsername}</strong> ({selectedPhoto.uploadedByName})</span>
                    <span>·</span>
                    <span>{new Date(selectedPhoto.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!currentUser) onRequestLogin();
                      else onLikePhoto(selectedPhoto.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      currentUser && selectedPhoto.likes?.includes(currentUser.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{selectedPhoto.likes?.length || 0} Likes</span>
                  </button>

                  <a
                    href={selectedPhoto.url}
                    download={`LMS_Party_${selectedPhoto.id}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center gap-1.5"
                    title="Download high-resolution image"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
              <h4 className="text-sm font-bold text-stone-900">
                Photo Delete Karein?
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Ye photo Admin database se permanent delete ho jayegi.
              </p>

              {deleteError && (
                <div className="mt-2 p-2 bg-rose-50 text-rose-700 text-xs rounded">
                  {deleteError}
                </div>
              )}

              {!isAdmin && currentUser?.id !== photos.find((p) => p.id === deleteId)?.uploadedByUserId && (
                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Admin Password (admin123)
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="admin123"
                    className="w-full text-xs px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteError('');
                  }}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                >
                  Delete Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

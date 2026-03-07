// src/app/components/profile/ProfileComponents.tsx
import {
  User,
  ShieldCheck,
  Mail,
  Calendar,
  Camera,
  Loader2,
} from "lucide-react";

export function AvatarSection({
  user,
  name,
  avatarPreview,
  avatarError,
  avatarUploading,
  isUpdating,
  onFileSelect,
  onRemove,
  fileInputRef,
  getInitials,
}: any) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-28 h-28 mb-4">
        <div
          role="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#9b2d30]/20 bg-[#9b2d30]/10 flex items-center justify-center cursor-pointer active:scale-95 transition">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-full h-full object-cover"
              alt="Preview"
            />
          ) : user?.avatarUrl && !avatarError ? (
            <img
              src={user.avatarUrl}
              className="w-full h-full object-cover"
              alt="Avatar"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-[#9b2d30]/5">
              {name ? (
                <span className="text-4xl font-black text-[#9b2d30]">
                  {getInitials(name)}
                </span>
              ) : (
                <User size={48} className="text-[#9b2d30]" />
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={avatarUploading}
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-1 right-1 bg-[#3d1c1d] text-white p-2 rounded-full shadow-md cursor-pointer hover:text-cyan-400 transition-all duration-300">
          {avatarUploading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Camera size={14} />
          )}
        </button>

        {(avatarPreview || (user?.avatarUrl && !avatarError)) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 bg-red-100 text-red-600 p-1.5 rounded-full shadow-md border-2 border-white">
            {isUpdating ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <span className="text-[13px] font-black">✕</span>
            )}
          </button>
        )}

        {/* MOBILE  Gallery access */}
        <input
          placeholder="Select an image"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelect}
        />
      </div>

      <h2 className="text-xl font-black text-[#3d1c1d]">{name || "ተጠቃሚ"}</h2>
      <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9b2d30]/5 text-[#9b2d30] text-[10px] font-bold uppercase tracking-wider">
        <ShieldCheck size={12} />
        {user.role}
      </div>
    </div>
  );
}

export function ProfileDetails({ user }: { user: any }) {
  return (
    <div className="mt-8 space-y-4 text-[#3d1c1d]/60">
      <div className="flex items-center gap-4">
        <Mail size={18} />
        <span className="text-sm font-medium">{user.email}</span>
      </div>
      <div className="flex items-center gap-4">
        <Calendar size={18} />
        <span className="text-sm font-medium">
          {new Date(user.joinDate || user.created_at).toLocaleDateString(
            "am-ET"
          )}
        </span>
      </div>
    </div>
  );
}

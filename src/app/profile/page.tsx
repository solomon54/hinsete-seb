// src/app/profile/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/db/browser-client";
import {
  User,
  ShieldCheck,
  Calendar,
  Mail,
  ArrowLeft,
  Save,
  Loader2,
  LogOut,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setname] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false); // for broken URLs

  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Initialize name + reset avatar error when user changes ──
  useEffect(() => {
    if (user?.name || user?.display_name) {
      setname(user.name || user.display_name || "");
    }
    if (user?.avatarUrl) setAvatarError(false); // new photo = reset error state
  }, [user]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "?";
  };

  const validateFullName = useCallback((name: string) => {
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) return "እባክዎ ሙሉ ስምዎን ያስገቡ";
    for (const part of parts) {
      if (part.length < 2) return "እያንዳንዱ ስም ቢያንስ 2 ፊደል መሆን አለበት";
    }
    return null;
  }, []);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    // (unchanged - your excellent compression logic)
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve) => (img.onload = () => resolve()));

    const MAX_WIDTH = 800;
    let targetWidth = img.width;
    let targetHeight = img.height;
    if (img.width > MAX_WIDTH) {
      const scale = MAX_WIDTH / img.width;
      targetWidth = MAX_WIDTH;
      targetHeight = img.height * scale;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );
    if (!blob) throw new Error("Failed to compress image");

    return new File([blob], file.name, { type: "image/jpeg" });
  }, []);

  const handleAvatarSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setMessage(null);
      try {
        const compressed = await compressImage(file);
        if (compressed.size > 1 * 1024 * 1024) {
          setMessage({
            type: "error",
            text: "ፎቶ 1MB ያህል ወይም ከዚያ በታች መሆን አለበት",
          });
          return;
        }
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(compressed));
        setAvatarFile(compressed);
        setAvatarError(false);
      } catch {
        setMessage({ type: "error", text: "ፎቶ ማስተካከል አልተሳካም" });
      }
    },
    [compressImage, avatarPreview]
  );

  // ── REMOVE PHOTO ──
  const handleRemovePhoto = useCallback(async () => {
    if (!user?.id) return;
    if (!confirm("ፎቶውን መሰረዝ ይፈልጋሉ?")) return;

    setIsUpdating(true);
    try {
      const filePath = `${user.id}.jpg`;
      await supabase.storage.from("avatars").remove([filePath]);

      const { error } = await supabase
        .from("profiles")
        .update({
          avatarUrl: null,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarError(true);
      setMessage({ type: "success", text: "ፎቶው ተሰርዟል!" });

      router.refresh(); // useAuth will pick up the null avatarUrl
    } catch (err: any) {
      setMessage({ type: "error", text: "ፎቶውን መሰረዝ አልተሳካም" });
    } finally {
      setIsUpdating(false);
    }
  }, [user, supabase, router]);

  const handleUpdateProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationError = validateFullName(name);
      if (validationError) {
        setNameError(validationError);
        return;
      }

      setIsUpdating(true);
      setMessage(null);

      try {
        let avatarUrl = user?.avatarUrl || null;

        if (avatarFile && user) {
          setAvatarUploading(true);
          const filePath = `${user.id}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, avatarFile, { upsert: true });

          setAvatarUploading(false);
          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          avatarUrl = data.publicUrl;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            name: name.trim(),
            avatarUrl,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", user?.id);

        if (error) throw error;

        setMessage({ type: "success", text: "መረጃው ተቀይሯል!" });
        setAvatarFile(null);
        setAvatarPreview(null);
        setNameError(null);
        setAvatarError(false);

        setTimeout(() => setMessage(null), 3000);
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "ስህተት ተፈጥሯል" });
      } finally {
        setIsUpdating(false);
        setAvatarUploading(false);
      }
    },
    [avatarFile, name, supabase, user, validateFullName]
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  }, [router, supabase.auth]);

  if (authLoading)
    return (
      <div className="flex items-center justify-center h-screen italic font-serif text-[#9b2d30]">
        በመጫን ላይ...
      </div>
    );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fdfaf1] p-6 pb-24">
      <div className="max-w-md mx-auto flex items-center justify-between mb-8">
        <Link
          href="/"
          className="p-2 rounded-full bg-[#9b2d30]/5 text-[#9b2d30]"
          aria-label="Go back">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-[#3d1c1d] font-serif text-2xl font-black italic">
          የእኔ መገለጫ
        </h1>
        <div className="w-10" />
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Profile Card */}
        <section className="bg-white rounded-3xl p-8 border border-[#9b2d30]/10 shadow-xl relative overflow-hidden">
          {user.role === "OWNER" && (
            <div className="absolute top-7 right-[-32px] bg-[#9b2d30] text-[#fdfaf1] px-10 py-1 rotate-45 text-[10px] font-black uppercase tracking-widest shadow-md pointer-events-none select-none">
              System Owner
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            {/* ── IMPROVED AVATAR WITH PREVIEW, ERROR HANDLING & REMOVE ── */}
            <div className="relative w-28 h-28 mb-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                    e.preventDefault();
                  }
                }}
                className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#9b2d30]/20 bg-[#9b2d30]/10 flex items-center justify-center cursor-pointer active:scale-95 transition"
                aria-label="Change avatar">
                {/* Priority 1: Local preview */}
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : user?.avatarUrl && !avatarError ? (
                  /* Priority 2: Stored avatar with error fallback */
                  <img
                    src={user.avatarUrl}
                    className="w-full h-full object-cover"
                    alt="User avatar"
                    loading="lazy"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  /* Priority 3: Initials or generic icon */
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

              {/* Camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-[#3d1c1d] text-white p-2 rounded-full shadow-md cursor-pointer active:scale-95 transition"
                disabled={avatarUploading}
                title={avatarUploading ? "Uploading..." : "Change avatar"}>
                {avatarUploading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Camera size={14} />
                )}
              </button>

              {/* Remove button - only when photo exists */}
              {(avatarPreview || (user?.avatarUrl && !avatarError)) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto();
                  }}
                  className="absolute top-1 right-1 bg-red-100 text-red-600 p-1.5 rounded-full shadow-md border-2 border-white hover:bg-red-200 transition"
                  title="Remove photo">
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <span className="text-[13px] font-black leading-none">
                      ✕
                    </span>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAvatarSelect}
                aria-hidden="true"
              />
            </div>

            <h2 className="text-xl font-black text-[#3d1c1d]">
              {name || "ተጠቃሚ"}
            </h2>

            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9b2d30]/5 text-[#9b2d30] text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              {user.role}
            </div>
          </div>

          {/* Contact info */}
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
        </section>

        {/* Edit Form (unchanged except nameError handling) */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white rounded-3xl p-8 border border-[#9b2d30]/10 shadow-sm space-y-4"
          noValidate>
          <div>
            <label
              htmlFor="name"
              className="block text-[10px] font-black text-[#9b2d30] uppercase tracking-widest mb-2">
              ሙሉ ስም
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => {
                setname(e.target.value);
                setNameError(validateFullName(e.target.value));
              }}
              className="w-full px-4 py-3 rounded-xl bg-[#fdfaf1] border border-[#9b2d30]/10 outline-none focus:ring-2 focus:ring-[#9b2d30]/20 transition-all text-sm font-bold"
              placeholder="ሙሉ ስምዎን ያስገቡ"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
              spellCheck={false}
              autoComplete="name"
            />
            {nameError && (
              <p
                id="name-error"
                className="text-[11px] text-red-600 font-bold mt-2"
                role="alert">
                {nameError}
              </p>
            )}
          </div>

          {message && (
            <div
              className={`relative p-3 rounded-xl text-[11px] font-bold text-center ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
              role="alert">
              {message.text}
              <button
                onClick={() => setMessage(null)}
                className="absolute top-1 right-1 text-lg font-bold leading-none"
                type="button"
                aria-label="Dismiss">
                &times;
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isUpdating ||
              avatarUploading ||
              !!validateFullName(name) ||
              !name.trim()
            }
            className="w-full py-4 bg-[#3d1c1d] text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
            {isUpdating || avatarUploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            ለውጦችን አስቀምጥ
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-white border border-red-200 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-50">
          <LogOut size={20} />
          ውጣ
        </button>
      </div>
    </div>
  );
}

// src/app/profile/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/db/browser-client";
import { ArrowLeft, Save, Loader2, LogOut, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AvatarSection,
  ProfileDetails,
} from "@/app/components/profile/ProfileComponents";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [name, setname] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New Modal State
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.replace("/auth");
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user?.name || user?.display_name)
      setname(user.name || user.display_name || "");
    if (user?.avatarUrl) setAvatarError(false);
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
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
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((res) => (img.onload = () => res()));
    const canvas = document.createElement("canvas");
    const MAX = 800;
    let w = img.width,
      h = img.height;
    if (w > MAX) {
      h *= MAX / w;
      w = MAX;
    }
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.8)
    );
    return new File([blob!], file.name, { type: "image/jpeg" });
  }, []);

  const handleAvatarSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setMessage(null);
      try {
        const compressed = await compressImage(file);
        if (compressed.size > 1024 * 1024) {
          setMessage({
            type: "error",
            text: "ፎቶ 1MB ያህል ወይም ከዚያ በታች መሆን አለበት",
          });
          return;
        }
        setAvatarPreview(URL.createObjectURL(compressed));
        setAvatarFile(compressed);
        setAvatarError(false);
      } catch {
        setMessage({ type: "error", text: "ፎቶ ማስተካከል አልተሳካም" });
      }
    },
    [compressImage]
  );

  // Restored and Updated Delete Logic
  const executeDeletePhoto = async () => {
    if (!user?.id) return;
    setIsUpdating(true);
    setShowDeleteModal(false);
    try {
      await supabase.storage.from("avatars").remove([`${user.id}.jpg`]);
      await supabase
        .from("profiles")
        .update({ avatarUrl: null })
        .eq("id", user.id);
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarError(true);
      setMessage({ type: "success", text: "ፎቶው ተሰርዟል!" });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "ፎቶውን መሰረዝ አልተሳካም" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const vError = validateFullName(name);
    if (vError) {
      setNameError(vError);
      return;
    }
    setIsUpdating(true);
    setMessage(null);
    try {
      let avatarUrl = user?.avatarUrl || null;
      if (avatarFile && user) {
        setAvatarUploading(true);
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(`${user.id}.jpg`, avatarFile, { upsert: true });
        setAvatarUploading(false);
        if (upErr) throw upErr;
        avatarUrl = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}.jpg`).data.publicUrl;
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
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "ስህተት ተፈጥሯል" });
    } finally {
      setIsUpdating(false);
      setAvatarUploading(false);
    }
  };

  if (!mounted || authLoading || !user)
    return (
      <div className="h-screen flex items-center justify-center italic text-[#9b2d30]">
        በመጫን ላይ...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdfaf1] p-6 pb-24">
      {/* --- CUSTOM DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3d1c1d]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full shadow-xl border border-[#9b2d30]/10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h3 className="text-[#3d1c1d] font-serif text-base md:text-xl font-black italic mb-2">
              እርግጠኛ ነዎት?
            </h3>
            <p className="text-sm text-[#3d1c1d]/60 font-medium mb-8">
              መገለጫ ፎቶዎ እንዲሰረዝ ይፈልጋሉ? ይህን ድርጊት መመለስ አይቻልም።
            </p>
            <div className="space-y-3">
              <button
                onClick={executeDeletePhoto}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-red-200">
                አዎ፣ ይጥፋ
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 bg-[#e6e0ce] text-[#3d1c1d] font-bold rounded-2xl active:scale-95 transition-all">
                ይቅር
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto flex items-center justify-between mb-8">
        <Link
          href="/"
          className="p-2 rounded-full bg-[#9b2d30]/5 text-[#9b2d30]">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-[#3d1c1d] font-serif text-2xl font-black italic">
          የእኔ መገለጫ
        </h1>
        <div className="w-10" />
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <section className="bg-white rounded-3xl p-8 border border-[#9b2d30]/10 shadow-xl relative overflow-hidden">
          {user.role === "OWNER" && (
            <div className="absolute top-7 right-[-32px] bg-[#9b2d30] text-[#fdfaf1] px-10 py-1 rotate-45 text-[10px] font-black uppercase tracking-widest shadow-md">
              System Owner
            </div>
          )}
          <AvatarSection
            user={user}
            name={name}
            avatarPreview={avatarPreview}
            avatarError={avatarError}
            avatarUploading={avatarUploading}
            isUpdating={isUpdating}
            fileInputRef={fileInputRef}
            onFileSelect={handleAvatarSelect}
            onRemove={() => setShowDeleteModal(true)}
            getInitials={getInitials}
          />
          <ProfileDetails user={user} />
        </section>

        <form
          onSubmit={handleUpdateProfile}
          className="bg-white rounded-3xl p-8 border border-[#9b2d30]/10 shadow-sm space-y-4"
          noValidate>
          <div>
            <label className="block text-[10px] font-black text-[#9b2d30] uppercase tracking-widest mb-2">
              ሙሉ ስም
            </label>
            <input
              value={name}
              onChange={(e) => {
                setname(e.target.value);
                setNameError(validateFullName(e.target.value));
              }}
              className="w-full px-4 py-3 rounded-xl bg-[#fdfaf1] border border-[#9b2d30]/10 outline-none text-sm font-bold"
              placeholder="ሙሉ ስምዎን ያስገቡ"
            />
            {nameError && (
              <p className="text-[11px] text-red-600 font-bold mt-2">
                {nameError}
              </p>
            )}
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl text-[11px] font-bold text-center animate-in slide-in-from-top-2 duration-300 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating || avatarUploading || !!validateFullName(name)}
            className="w-full py-4 bg-[#3d1c1d] text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
            {isUpdating || avatarUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save />
            )}{" "}
            ለውጦችን አስቀምጥ
          </button>
        </form>

        <button
          onClick={() => {
            supabase.auth.signOut();
            router.push("/auth");
          }}
          className="w-full py-4 bg-white border border-red-200 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          <LogOut /> ውጣ
        </button>
      </div>
    </div>
  );
}

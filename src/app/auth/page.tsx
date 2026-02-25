//src/app/auth/page.tsx
"use client";

import { useState, useEffect } from "react"; // Added useEffect for timer
import {
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/browser-client";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0); // Timer for Resend logic
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const getFullIdentifier = () => {
    if (method === "email") return value.trim();
    const cleanDigits = value.trim().startsWith("0")
      ? value.trim().substring(1)
      : value.trim();
    return `+251${cleanDigits}`;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Clear previous errors

    const identifier = getFullIdentifier();

    const { error } =
      method === "email"
        ? await supabase.auth.signInWithOtp({ email: identifier })
        : await supabase.auth.signInWithOtp({ phone: identifier });

    if (error) {
      // Check if it's the provider error
      if (error.message.includes("provider") || error.status === 400) {
        setErrorMessage(
          "ይቅርታ፣ የስልክ አገልግሎት በአሁኑ ወቅት አልተከፈተም። እባክዎ በኢሜይል ወይም በGoogle ይሞክሩ።"
        );
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setStep("otp");
      setTimer(60);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const identifier = getFullIdentifier();

    const { error } =
      method === "email"
        ? await supabase.auth.verifyOtp({
            email: identifier,
            token: otp,
            type: "email",
          })
        : await supabase.auth.verifyOtp({
            phone: identifier,
            token: otp,
            type: "sms",
          });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="biranna-viewport flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#fdfaf1] rounded-3xl border border-[#9b2d30]/20 shadow-2xl overflow-hidden relative z-10">
        <div className="bg-[#9b2d30] p-8 text-center relative">
          {step === "otp" && (
            <button
              onClick={() => setStep("identifier")}
              className="absolute left-4 top-8 text-[#fdfaf1]/60 hover:text-[#fdfaf1]">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-[#fdfaf1] font-serif text-3xl font-black tracking-tighter">
            ሕንጸተ ሰብእ
          </h1>
          <p className="text-[#fdfaf1]/80 text-xs mt-2 font-bold uppercase tracking-widest">
            {step === "identifier"
              ? "የመግቢያ ገጽ (Gatekeeper)"
              : "ማረጋገጫ (Verification)"}
          </p>
        </div>

        <div className="p-8">
          {step === "identifier" ? (
            <>
              {/* Method Switcher */}
              <div className="flex bg-[#3d1c1d]/5 p-1 rounded-xl mb-6">
                <button
                  onClick={() => {
                    setMethod("email");
                    setValue("");
                  }}
                  className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all ${
                    method === "email"
                      ? "bg-white text-[#9b2d30] shadow-sm"
                      : "text-[#3d1c1d]/40"
                  }`}>
                  ኢሜይል (EMAIL)
                </button>
                <button
                  onClick={() => {
                    setMethod("phone");
                    setValue("");
                  }}
                  className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all ${
                    method === "phone"
                      ? "bg-white text-[#9b2d30] shadow-sm"
                      : "text-[#3d1c1d]/40"
                  }`}>
                  ስልክ (PHONE)
                </button>
              </div>

              {/* Feedback & Error Message for Phone */}
              {method === "phone" && (
                <div
                  className={`mb-6 p-4 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2 border ${
                    errorMessage
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}>
                  <Info
                    className={`${
                      errorMessage ? "text-red-600" : "text-amber-600"
                    } shrink-0 mt-0.5`}
                    size={16}
                  />
                  <div className="flex flex-col gap-1">
                    <p
                      className={`text-[11px] leading-relaxed font-medium ${
                        errorMessage ? "text-red-800" : "text-amber-800"
                      }`}>
                      {errorMessage || "የስልክ ማረጋገጫ በአሁኑ ወቅት በሙከራ ላይ ነው።"}
                    </p>

                    {/* Action Links */}
                    <p className="text-[10px] text-gray-500">
                      እባክዎ በ
                      <button
                        onClick={() => {
                          setMethod("email");
                          setErrorMessage(null);
                        }}
                        className="mx-1 font-bold underline text-indigo-600 cursor-pointer">
                        ኢሜይል
                      </button>
                      ወይም በ
                      <button
                        onClick={handleGoogleLogin}
                        className="mx-1 font-bold underline text-indigo-600 cursor-pointer">
                        Google
                      </button>
                      ይግቡ።
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="relative flex items-center">
                  <div className="absolute left-4 z-20 text-[#9b2d30]/40">
                    {method === "email" ? (
                      <Mail size={18} />
                    ) : (
                      <Phone size={18} />
                    )}
                  </div>
                  {method === "phone" && (
                    <span className="absolute left-11 z-20 text-sm font-bold text-[#3d1c1d]/60 select-none">
                      +251
                    </span>
                  )}
                  <input
                    required
                    type={method === "email" ? "email" : "tel"}
                    placeholder={
                      method === "email" ? "example@email.com" : "911223344"
                    }
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`w-full pr-4 py-4 rounded-2xl bg-white border border-[#9b2d30]/10 outline-none focus:ring-2 focus:ring-[#9b2d30]/20 transition-all text-sm font-medium ${
                      method === "email" ? "pl-12" : "pl-24"
                    }`}
                  />
                </div>
                <button
                  disabled={loading}
                  className="w-full py-4 bg-[#3d1c1d] text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? "በመላክ ላይ..." : "ኮድ ይላክ (Send Code)"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="relative my-8 text-center">
                <hr className="border-[#9b2d30]/10" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdfaf1] px-4 text-[10px] font-black text-[#9b2d30]/40 uppercase tracking-widest">
                  ወይም
                </span>
              </div>

              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full py-4 bg-white border border-[#9b2d30]/20 text-[#3d1c1d] font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all">
                <GoogleIcon /> በGoogle ይቀጥሉ
              </button>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 bg-[#9b2d30]/5 rounded-full flex items-center justify-center text-[#9b2d30]">
                    <ShieldCheck size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="text-[#3d1c1d] font-bold">ኮዱን ያስገቡ</h3>
                  <p className="text-xs text-[#3d1c1d]/60 mt-1">
                    ወደ {getFullIdentifier()} የላክነውን ባለ 6 አሃዝ ኮድ ያስገቡ
                  </p>
                </div>
                <input
                  required
                  type="text"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-[1em] text-2xl font-black py-4 rounded-2xl bg-white border border-[#9b2d30]/10 outline-none focus:ring-2 focus:ring-[#9b2d30]/20 transition-all"
                />
                <button
                  disabled={loading}
                  className="w-full py-4 bg-[#9b2d30] text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50">
                  {loading ? "በማረጋገጥ ላይ..." : "አረጋግጥ (Verify)"}
                </button>
              </form>

              <button
                type="button"
                disabled={timer > 0 || loading}
                onClick={() => handleSendOTP()}
                className="text-xs font-bold text-[#9b2d30] mt-4 disabled:text-gray-400 hover:underline transition-all">
                {timer > 0
                  ? `ደግመው ለመላክ ${timer} ሰከንድ ይጠብቁ`
                  : "ኮድ አልደረሰዎትም? እንደገና ይላክ"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

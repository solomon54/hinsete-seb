//src/app/auth/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/db/browser-client";

// Import your components
import {
  MethodSwitcher,
  PhoneWarningBanner,
  IdentifierInput,
  OtpInputs,
  ResendLink,
  GoogleIcon,
} from "@/app/components/auth/AuthComponents";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [resendCount, setResendCount] = useState(0); // Added limit logic

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const getFullIdentifier = () =>
    method === "email" ? value.trim() : `+251${value.trim().replace(/^0/, "")}`;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateIdentifier = () => {
    if (!value.trim()) {
      setIdentifierError(method === "email" ? "ኢሜይል ያስገቡ" : "የስልክ ቁጥር ያስገቡ");
      return false;
    }
    if (method === "email" && !value.includes("@")) {
      setIdentifierError("ትክክለኛ ኢሜይል ያስገቡ");
      return false;
    }
    if (method === "phone" && value.replace(/\D/g, "").length < 9) {
      setIdentifierError("ትክክለኛ የስልክ ቁጥር ያስገቡ");
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIdentifierError(null);
    setErrorMessage(null);

    if (!validateIdentifier()) return;

    // Security: Limit resends to 3 times per session
    if (resendCount >= 3) {
      setErrorMessage("ከ3 ጊዜ በላይ ኮድ መላክ አይቻልም። እባክዎ 1-2 ደቂቃ ቆይተው ይሞክሩ።");
      return;
    }

    // Prevent double clicks
    if (loading) return;

    setLoading(true);
    const identifier = getFullIdentifier();

    try {
      const { error } =
        method === "email"
          ? await supabase.auth.signInWithOtp({ email: identifier })
          : await supabase.auth.signInWithOtp({ phone: identifier });

      if (error) {
        if (error.status === 429) {
          // Supabase rate limit hit
          setErrorMessage("ብዙ ጊዜ ኮድ ተላከ። እባክዎ 1-2 ደቂቃ ቆይተው ይሞክሩ።");
        } else if (error.status === 400 || error.message.includes("provider")) {
          setErrorMessage(
            "ይቅርታ፣ የስልክ አገልግሎት በአሁኑ ወቅት አልተከፈተም። እባክዎ በኢሜይል ወይም በGoogle ይሞክሩ።"
          );
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setStep("otp");
        setTimer(120); // Increased cooldown to 2 minutes
        setOtp(Array(6).fill(""));
        setOtpError(null);
        setResendCount((prev) => prev + 1);
      }
    } catch (err: any) {
      setErrorMessage("አንድ አልተገባም ፣ እባክዎ በኋላ ይሞክሩ።");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setOtpError(null);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const newOtp = Array(6).fill("");
    for (let i = 0; i < Math.min(text.length, 6); i++) newOtp[i] = text[i];
    setOtp(newOtp);
    setOtpError(null);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setOtpError("6 አሃዝ ኮድ ያስገቡ");
      return;
    }

    setLoading(true);
    const identifier = getFullIdentifier();
    const { error } =
      method === "email"
        ? await supabase.auth.verifyOtp({
            email: identifier,
            token: code,
            type: "email",
          })
        : await supabase.auth.verifyOtp({
            phone: identifier,
            token: code,
            type: "sms",
          });

    if (error) {
      setOtpError("ትክክለኛ ኮድ አይደለም");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="biranna-viewport flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#fdfaf1] rounded-3xl border border-[#9b2d30]/20 shadow-2xl overflow-hidden">
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
              <MethodSwitcher
                method={method}
                setMethod={setMethod}
                setValue={setValue}
              />
              {method === "phone" && (
                <PhoneWarningBanner
                  errorMessage={errorMessage}
                  setMethod={setMethod}
                  handleGoogleLogin={handleGoogleLogin}
                />
              )}

              <form onSubmit={handleSendOTP} className="space-y-4">
                <IdentifierInput
                  method={method}
                  value={value}
                  setValue={setValue}
                  identifierError={identifierError}
                />
                <button
                  disabled={loading}
                  className="w-full py-4 bg-[#3d1c1d] text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? "በመላክ ላይ..." : "ኮድ ይላክ (Send Code)"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              {/* Your original "OR" divider */}
              <div className="relative my-8 text-center">
                <hr className="border-[#9b2d30]/10" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdfaf1] px-4 text-[10px] font-black text-[#9b2d30]/40 uppercase tracking-widest">
                  ወይም
                </span>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white border border-[#9b2d30]/20 text-[#3d1c1d] font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all">
                <GoogleIcon /> በGoogle ይቀጥሉ
              </button>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-[#9b2d30]/5 rounded-full flex items-center justify-center text-[#9b2d30]">
                  <ShieldCheck size={32} />
                </div>
              </div>

              <div>
                <h3 className="text-[#3d1c1d] font-bold">ኮዱን ያስገቡ</h3>
                <p className="text-xs text-[#3d1c1d]/60 mt-1">
                  ወደ {getFullIdentifier()} የተላከው ባለ 6 አሃዝ ኮድ ያስገቡ
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <OtpInputs
                  otp={otp}
                  inputRefs={inputRefs}
                  isShaking={isShaking}
                  otpError={otpError}
                  handleOtpChange={handleOtpChange}
                  handleOtpKeyDown={handleOtpKeyDown}
                  handleOtpPaste={handleOtpPaste}
                />
                <button
                  disabled={loading}
                  className="w-full py-4 bg-[#9b2d30] text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50">
                  {loading ? "በማረጋገጥ ላይ..." : "አረጋግጥ (Verify)"}
                </button>
              </form>

              {/* 〰 Display error messages in OTP step 〰 */}
              {errorMessage && (
                <p className="text-red-600 text-xs font-medium mt-2">
                  {errorMessage}
                </p>
              )}

              {/* 〰 Resend button with cooldown 〰 */}
              <ResendLink
                timer={timer}
                loading={loading}
                handleResend={handleSendOTP}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

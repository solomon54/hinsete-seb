// src/components/auth/AuthComponents.tsx
"use client";

import {
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Info,
} from "lucide-react";
import React from "react";

// ─── Google Icon ────────────────────────────────────────
export const GoogleIcon = () => (
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

// ─── Method Switcher ──────────────────────────────────
export function MethodSwitcher({ method, setMethod, setValue }: any) {
  return (
    <div className="flex bg-[#3d1c1d]/5 p-1 rounded-xl mb-6">
      <button
        type="button"
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
        type="button"
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
  );
}

// ─── Phone Warning Banner ─────────────────────────────
export function PhoneWarningBanner({
  errorMessage,
  setMethod,
  handleGoogleLogin,
}: any) {
  return (
    <div
      className={`mb-6 p-4 rounded-2xl flex gap-3 items-start border ${
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
        <div className="text-[10px] text-gray-500">
          እባክዎ በ{" "}
          <button
            onClick={() => setMethod("email")}
            className="mx-1 font-bold underline text-indigo-600">
            ኢሜይል
          </button>{" "}
          ወይም በ{" "}
          <button
            onClick={handleGoogleLogin}
            className="mx-1 font-bold underline text-indigo-600">
            Google
          </button>{" "}
          ይግቡ።
        </div>
      </div>
    </div>
  );
}

// ─── Identifier Input ─────────────────────────────────
export function IdentifierInput({
  method,
  value,
  setValue,
  identifierError,
}: any) {
  return (
    <>
      <div className="relative flex items-center">
        <div className="absolute left-4 z-20 text-[#9b2d30]/40">
          {method === "email" ? <Mail size={18} /> : <Phone size={18} />}
        </div>
        {method === "phone" && (
          <span className="absolute left-11 z-20 text-sm font-bold text-[#3d1c1d]/60">
            +251
          </span>
        )}
        <input
          type={method === "email" ? "text" : "tel"}
          inputMode={method === "email" ? "email" : "tel"}
          placeholder={method === "email" ? "example@email.com" : "911223344"}
          value={value}
          onChange={(e) =>
            setValue(
              method === "phone"
                ? e.target.value.replace(/\D/g, "")
                : e.target.value
            )
          }
          className={`w-full pr-4 py-4 rounded-2xl bg-white border border-[#9b2d30]/10 outline-none focus:ring-2 focus:ring-[#9b2d30]/20 transition-all text-sm font-medium ${
            method === "email" ? "pl-12" : "pl-24"
          }`}
        />
      </div>
      {identifierError && (
        <p className="text-red-600 text-xs mt-2 font-medium">
          {identifierError}
        </p>
      )}
    </>
  );
}

// ─── OTP Inputs ───────────────────────────────────────
export function OtpInputs({
  otp,
  inputRefs,
  isShaking,
  otpError,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
}: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
        {otp.map((digit: string, index: number) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={handleOtpPaste}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-xl border outline-none transition-all ${
              otpError
                ? "border-red-500 focus:ring-red-300"
                : "border-[#9b2d30]/20 focus:ring-[#9b2d30]/30"
            } ${isShaking ? "animate-shake" : ""}`}
          />
        ))}
      </div>
      {otpError && (
        <p className="text-red-600 text-xs font-medium text-center mt-2">
          {otpError}
        </p>
      )}
    </div>
  );
}

// ─── Resend Link ──────────────────────────────────────
export function ResendLink({ timer, loading, handleResend }: any) {
  return (
    <button
      type="button"
      disabled={timer > 0 || loading}
      onClick={handleResend}
      className="text-xs font-bold text-[#9b2d30] mt-4 disabled:text-gray-400 hover:underline">
      {timer > 0 ? `ደግመው ለመላክ ${timer} ሰከንድ ይጠብቁ` : "ኮድ አልደረሰዎትም? እንደገና ይላክ"}
    </button>
  );
}

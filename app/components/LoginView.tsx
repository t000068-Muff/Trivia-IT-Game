"use client";

import { useRef, useState } from "react";
import { Card, FieldLabel } from "./Card";
import { genOTP, isPhone } from "../lib/utils";

/**
 * Two-step phone+OTP login. Since there's no SMS gateway, the generated
 * code is shown on screen for the demo. On verify, calls onLogin(phone).
 */
export function LoginView({ onLogin }: { onLogin: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [err1, setErr1] = useState("");
  const [err2, setErr2] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const sendOtp = () => {
    setErr1("");
    if (!isPhone(phone)) {
      setErr1("× invalid phone number format");
      return;
    }
    const code = genOTP();
    setPendingOtp(code);
    setPendingPhone(phone.trim());
    setOtp("");
    setTimeout(() => otpInputRef.current?.focus(), 0);
  };

  const verify = () => {
    setErr2("");
    if (!pendingOtp || !pendingPhone) {
      setErr2("× session expired, restart");
      return;
    }
    if (otp.trim() !== pendingOtp) {
      setErr2("× incorrect code");
      return;
    }
    onLogin(pendingPhone);
  };

  const reset = () => {
    setPendingOtp(null);
    setPendingPhone(null);
    setErr2("");
  };

  const resend = () => {
    if (!pendingPhone) return;
    setPendingOtp(genOTP());
  };

  return (
    <div className="min-h-[calc(100vh-90px)] grid place-items-center">
      <div className="w-full max-w-md">
        <Card title="~/auth/login.sh">
          <h1 className="text-base font-semibold tracking-wide flex items-center">
            $ authenticate
            <span
              className="inline-block w-2 h-3.5 bg-[#7fdbca] ml-1.5 translate-y-0.5"
              style={{ animation: "blink 1s steps(1) infinite" }}
            />
            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
          </h1>
          <p className="text-xs text-[#5b6b7d] mt-1.5 mb-5">
            // enter your phone number to receive a one-time code.
          </p>

          {!pendingOtp ? (
            <>
              <FieldLabel label="phone_number" hint="required" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                placeholder="+1 555 0123"
                autoComplete="tel"
                className="w-full rounded-md bg-[#080c12] border border-[#1c2530] px-3 py-2.5 outline-none text-[#d6deeb] focus:border-[#82aaff] focus:ring-2 focus:ring-[#82aaff]/20 transition"
              />
              <div className="flex flex-wrap gap-2.5 items-center mt-4">
                <button
                  onClick={sendOtp}
                  className="px-4 py-2.5 rounded-md bg-[#7fdbca] text-[#06222a] font-bold hover:brightness-110 active:translate-y-px transition"
                >
                  → send_otp()
                </button>
                <span className="px-2 py-0.5 rounded-full border border-[#1c2530] bg-[#0b1017] text-[#8895a7] text-xs">
                  demo: OTP shown on screen
                </span>
              </div>
              <div className="text-[#ff6b6b] text-xs mt-3 min-h-[1em]">
                {err1}
              </div>
            </>
          ) : (
            <>
              <FieldLabel label="otp_code" hint="6 digits" />
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && verify()}
                placeholder="••••••"
                className="w-full rounded-md bg-[#080c12] border border-[#1c2530] px-3 py-2.5 outline-none text-[#d6deeb] focus:border-[#82aaff] focus:ring-2 focus:ring-[#82aaff]/20 transition tracking-widest"
              />
              <div className="mt-3 px-3 py-2.5 border border-dashed border-[#1c2530] rounded-md bg-[#0a1118] text-[#8895a7] text-xs">
                // SMS gateway not configured in demo.
                <br />
                your one-time code:{" "}
                <b className="text-[#ffcb6b] tracking-[0.25em] text-sm">
                  {pendingOtp}
                </b>
              </div>
              <div className="flex flex-wrap gap-3 items-center mt-4">
                <button
                  onClick={verify}
                  className="px-4 py-2.5 rounded-md bg-[#7fdbca] text-[#06222a] font-bold hover:brightness-110 active:translate-y-px transition"
                >
                  → verify()
                </button>
                <button
                  onClick={reset}
                  className="text-[#82aaff] text-xs hover:underline"
                >
                  [ change number ]
                </button>
                <button
                  onClick={resend}
                  className="text-[#82aaff] text-xs hover:underline"
                >
                  [ resend ]
                </button>
              </div>
              <div className="text-[#ff6b6b] text-xs mt-3 min-h-[1em]">
                {err2}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

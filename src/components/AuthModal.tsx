"use client";

import React, { useState } from "react";
import { X, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import type { UserProfile } from "@/lib/client/workspaceState";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (userData: { name: string; email: string; isNewUser: boolean }) => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthenticate,
  initialMode = "signup",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please provide an email and password.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please provide your name.");
      return;
    }

    setError(null);
    onAuthenticate({
      name: name.trim() || (email.split("@")[0] || "Executive"),
      email: email.trim(),
      isNewUser: mode === "signup",
    });
  };

  const handleGuestDemo = () => {
    onAuthenticate({
      name: "Neel",
      email: "neel@craftbrew.internal",
      isNewUser: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface-container rounded-lg border border-outline-variant/50 shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-space-lg py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-sm text-on-surface font-semibold tracking-tight">
              OmniDesk Access
            </span>
            <span className="font-mono-sm text-[10px] text-outline px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/30">
              v2.4
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-surface hover:bg-surface-container rounded transition"
            type="button"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Log In vs Create Account */}
        <div className="flex border-b border-outline-variant/20 bg-surface-container-low/50">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition ${
              mode === "signup"
                ? "border-primary text-on-surface font-semibold bg-surface-container"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition ${
              mode === "login"
                ? "border-primary text-on-surface font-semibold bg-surface-container"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            Log in
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-space-lg flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <h3 className="font-headline-sm text-base text-on-surface font-medium">
              {mode === "signup" ? "Create your personal AI workspace" : "Welcome back to OmniDesk"}
            </h3>
            <p className="font-body-sm text-xs text-outline">
              {mode === "signup"
                ? "Personalize updates, conduct deep research, and draft verified actions."
                : "Enter your credentials to restore your feed, saved insights, and tasks."}
            </p>
          </div>

          {error && (
            <div className="px-3 py-2 rounded bg-error-container/20 border border-error/30 text-error text-xs font-mono">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-xs text-outline" htmlFor="auth-name">
                Your full name
              </label>
              <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1.5 focus-within:border-primary transition">
                <User className="w-3.5 h-3.5 text-outline mr-2 shrink-0" />
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Neel Vasthav"
                  className="w-full bg-transparent font-body-sm text-xs text-on-surface placeholder:text-outline outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-xs text-outline" htmlFor="auth-email">
              Work or personal email
            </label>
            <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1.5 focus-within:border-primary transition">
              <Mail className="w-3.5 h-3.5 text-outline mr-2 shrink-0" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-transparent font-body-sm text-xs text-on-surface placeholder:text-outline outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-label-sm text-xs text-outline" htmlFor="auth-pwd">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => alert("Demo reset link: enter password 'demo' or use Guest Access.")}
                  className="font-label-sm text-[11px] text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1.5 focus-within:border-primary transition">
              <Lock className="w-3.5 h-3.5 text-outline mr-2 shrink-0" />
              <input
                id="auth-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent font-body-sm text-xs text-on-surface placeholder:text-outline outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-2 bg-primary-container hover:bg-[#ff771a] text-white rounded font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <span>{mode === "signup" ? "Continue to Setup" : "Sign In & Enter"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-outline-variant/20"></div>
            <span className="shrink-0 px-2 font-mono-sm text-[10px] text-outline uppercase">
              Or Instant Access
            </span>
            <div className="flex-grow border-t border-outline-variant/20"></div>
          </div>

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleGuestDemo}
            className="w-full py-1.5 bg-surface-container-low hover:bg-surface-container rounded border border-outline-variant/30 text-on-surface text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-tertiary" />
            <span>Enter as Founder / Demo Workspace</span>
          </button>
        </form>

        {/* Footer Note */}
        <div className="px-space-lg py-2.5 bg-surface-container-low/70 border-t border-outline-variant/20 text-center">
          <span className="font-mono-sm text-[10px] text-outline">
            Secure client-side session • Consequential web actions require approval
          </span>
        </div>
      </div>
    </div>
  );
}

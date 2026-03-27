"use client";

import { useState, useEffect } from "react";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { Key, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { BASE_PATH } from "@/lib/constants";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { data, loading, error } = useOuraData();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/api/settings/token`)
      .then((r) => r.json())
      .then((d) => setHasToken(d.hasToken === true))
      .catch(() => setHasToken(false));
  }, []);

  // Still checking
  if (hasToken === null) return null;

  // Token exists and data is loading or loaded — show the page
  if (hasToken && (loading || data)) return <>{children}</>;

  // No token or data failed — show onboarding
  if (!hasToken || (!loading && !data && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-oura-50 dark:bg-oura-500/10 flex items-center justify-center mx-auto">
            <Key className="w-8 h-8 text-oura-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Connect Your Oura Ring</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add your Oura API key to start viewing your health data. It takes less than a minute.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {[
              { step: 1, text: "Visit cloud.ouraring.com and create a Personal Access Token" },
              { step: 2, text: "Paste the token in Settings" },
              { step: 3, text: "Your data will sync automatically" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                <span className="w-6 h-6 rounded-full bg-oura-500/10 text-oura-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-oura-500 hover:bg-oura-600 text-white font-semibold transition-colors"
          >
            Go to Settings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Has token but error — let existing EmptyState handle it
  return <>{children}</>;
}

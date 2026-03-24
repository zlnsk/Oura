"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import {
  Settings,
  Key,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
  Trash2,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { fetchData } = useOuraData();

  // Oura API key state
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  // AI API key state
  const [aiKey, setAiKey] = useState("");
  const [showAiKey, setShowAiKey] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings/token")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasToken) setHasKey(true);
      })
      .catch(() => {});

    fetch("/api/settings/ai-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasKey) setHasAiKey(true);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    if (trimmed.length < 10 || !/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
      setTestStatus("error");
      setTestMessage("Invalid token format. Token must be at least 10 characters and contain only letters, numbers, hyphens, and underscores.");
      return;
    }
    try {
      const res = await fetch("/api/settings/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: trimmed }),
      });
      if (res.ok) {
        setHasKey(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setTestStatus("error");
        setTestMessage(data.error || "Failed to save token");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Network error. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await fetch("/api/settings/token", { method: "DELETE" });
    } catch {}
    setApiKey("");
    setHasKey(false);
    setSaved(false);
    setTestStatus("idle");
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      if (!hasKey) return;
    } else {
      const trimmed = apiKey.trim();
      if (trimmed.length < 10 || !/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
        setTestStatus("error");
        setTestMessage("Invalid token format. Token must be at least 10 characters and contain only letters, numbers, hyphens, and underscores.");
        return;
      }
      const saveRes = await fetch("/api/settings/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: trimmed }),
      });
      if (!saveRes.ok) {
        setTestStatus("error");
        setTestMessage("Failed to save token before testing.");
        return;
      }
      setHasKey(true);
    }

    setTestStatus("testing");
    try {
      const res = await fetch("/api/oura/all?days=1");
      if (res.ok) {
        setTestStatus("success");
        setTestMessage("Connection successful! Your Oura data is accessible.");
        fetchData();
      } else {
        const json = await res.json();
        setTestStatus("error");
        setTestMessage(json.error || "Failed to connect to Oura API");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Network error. Please check your connection.");
    }
  };

  // AI key handlers
  const handleSaveAiKey = async () => {
    const trimmed = aiKey.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("sk-ant-")) {
      setAiStatus("error");
      setAiMessage("Invalid key format. Anthropic API keys start with sk-ant-");
      return;
    }
    setAiStatus("saving");
    try {
      const res = await fetch("/api/settings/ai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmed }),
      });
      if (res.ok) {
        setHasAiKey(true);
        setAiSaved(true);
        setAiStatus("success");
        setAiMessage("API key saved successfully.");
        setTimeout(() => {
          setAiSaved(false);
          setAiStatus("idle");
        }, 3000);
      } else {
        const data = await res.json();
        setAiStatus("error");
        setAiMessage(data.error || "Failed to save API key");
      }
    } catch {
      setAiStatus("error");
      setAiMessage("Network error. Please try again.");
    }
  };

  const handleDeleteAiKey = async () => {
    try {
      await fetch("/api/settings/ai-key", { method: "DELETE" });
    } catch {}
    setAiKey("");
    setHasAiKey(false);
    setAiSaved(false);
    setAiStatus("idle");
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Settings"
        subtitle="Configure your dashboard and API connections"
        icon={Settings}
        iconColor="#64748b"
      />

      <div className="max-w-2xl space-y-6 animate-fade-in">
        {/* Oura API Key Configuration */}
        <div className="premium-card overflow-hidden">
          <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-oura-500 to-oura-600 flex items-center justify-center shadow-lg shadow-oura-500/20">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Oura API Key</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your API key is stored securely in a server-side HTTP-only cookie
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="oura-api-key" className="block text-sm font-medium mb-2">
                Personal Access Token
              </label>
              <div className="relative">
                <input
                  id="oura-api-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasKey ? "Token saved (enter new value to update)" : "Paste your Oura API token here..."}
                  className="input-field pr-12"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="Toggle API key visibility"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Get your token from{" "}
                <a
                  href="https://cloud.ouraring.com/personal-access-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-oura-500 hover:text-oura-400 underline"
                >
                  cloud.ouraring.com
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary text-sm">
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save Key"}
              </button>
              <button onClick={handleTest} className="btn-secondary text-sm" disabled={testStatus === "testing"}>
                {testStatus === "testing" ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                Test Connection
              </button>
              {hasKey && (
                <button onClick={handleDelete} className="btn-secondary text-sm text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>

            {/* Test result */}
            {testStatus !== "idle" && testStatus !== "testing" && (
              <div
                className={cn(
                  "p-4 rounded-xl border text-sm flex items-center gap-3",
                  testStatus === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400"
                )}
              >
                {testStatus === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                {testMessage}
              </div>
            )}

            {saved && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                API key saved securely
              </div>
            )}
          </div>
        </div>

        {/* AI API Key Configuration */}
        <div className="premium-card overflow-hidden">
          <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI API Key</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bring your own Anthropic API key for AI-powered health insights
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="ai-api-key" className="block text-sm font-medium mb-2">
                Anthropic API Key
              </label>
              <div className="relative">
                <input
                  id="ai-api-key"
                  type={showAiKey ? "text" : "password"}
                  value={aiKey}
                  onChange={(e) => setAiKey(e.target.value)}
                  placeholder={hasAiKey ? "Key saved (enter new value to update)" : "sk-ant-..."}
                  className="input-field pr-12"
                />
                <button
                  onClick={() => setShowAiKey(!showAiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="Toggle AI key visibility"
                >
                  {showAiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Get your API key from{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-500 hover:text-violet-400 underline"
                >
                  console.anthropic.com
                </a>
                {" "}— your key overrides the server default if one exists
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleSaveAiKey} className="btn-primary text-sm">
                <Save className="w-4 h-4" />
                {aiSaved ? "Saved!" : "Save Key"}
              </button>
              {hasAiKey && (
                <button onClick={handleDeleteAiKey} className="btn-secondary text-sm text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>

            {/* AI key status */}
            {aiStatus !== "idle" && aiStatus !== "saving" && (
              <div
                className={cn(
                  "p-4 rounded-xl border text-sm flex items-center gap-3",
                  aiStatus === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400"
                )}
              >
                {aiStatus === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                {aiMessage}
              </div>
            )}
          </div>
        </div>

        {/* Security info */}
        <div className="premium-card p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Security & Privacy</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li>• All API keys are stored as secure, HTTP-only browser cookies</li>
                <li>• Keys are never stored on the server or in any database</li>
                <li>• Each user&apos;s data is fully isolated — no one else can see your data</li>
                <li>• AI analysis is processed through Anthropic&apos;s API with no data retention</li>
                <li>• All API calls are made server-side to protect your tokens</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

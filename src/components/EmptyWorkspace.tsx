import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderX,
  Terminal,
  Copy,
  Check,
  Settings,
  ArrowRight,
  HardDrive,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { WorkspaceInfo } from "../types";

interface EmptyWorkspaceProps {
  workspace: WorkspaceInfo | null;
  onWorkspacePathChange?: (newPath: string) => Promise<{ success: boolean; error?: string } | void> | void;
  isLoading?: boolean;
}

export const EmptyWorkspace: React.FC<EmptyWorkspaceProps> = ({
  workspace,
  onWorkspacePathChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [inputPath, setInputPath] = useState(workspace?.cwd || "");
  const [switching, setSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPath.trim() || switching || isLoading) return;
    setSwitching(true);
    setErrorMsg(null);

    try {
      if (onWorkspacePathChange) {
        const res = await onWorkspacePathChange(inputPath.trim());
        if (res && typeof res === "object" && "success" in res && !res.success) {
          setErrorMsg(res.error || `Failed to switch workspace to: ${inputPath.trim()}`);
          setTimeout(() => setErrorMsg(null), 5000);
          return;
        }
      }
    } catch (err) {
      setErrorMsg(String(err));
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSwitching(false);
    }
  };

  const sampleCommands = [
    { label: "Go Systems Lab", cmd: "trak init lang/go" },
    { label: "Rust Concurrency Lab", cmd: "trak init lang/rust" },
    { label: "Python Engineering Lab", cmd: "trak init lang/python" },
    { label: "Modern C++ Systems Lab", cmd: "trak init lang/cpp" },
    { label: "PostgreSQL Internals Lab", cmd: "trak init db/postgres" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
        <FolderX className="w-7 h-7 text-amber-400" />
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-2xl text-[#f5f4ef]">
          No Active Trak Manifest Found
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Could not locate <span className="text-slate-200">trak.json</span> in:
        </p>
        <p className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] inline-block max-w-full truncate">
          {workspace?.cwd || "current working directory"}
        </p>
      </div>

      {/* Quick Action 1: Switch Workspace Path Directly */}
      <div className="rounded-xl border border-white/[0.08] bg-[#090b10] p-5 text-left space-y-3 max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-semibold uppercase tracking-wider">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Switch to Another Track Directory</span>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Open Settings</span>
          </button>
        </div>

        <form onSubmit={handleSwitch} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={inputPath}
              disabled={switching || isLoading}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="e.g. D:/CLI/trak/workspaces/learn-go"
              className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={switching || isLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs font-mono transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)] cursor-pointer"
          >
            {switching || isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Switching...</span>
              </>
            ) : (
              <>
                <span>Switch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Quick Action 2: Materialize learning lab */}
      <div className="rounded-xl border border-white/[0.08] bg-[#090b10] p-5 text-left space-y-3 max-w-xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Or Initialize a New Track in Current Directory:</span>
        </div>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Run any command below in your terminal to generate exercises and the <code className="text-slate-200 font-mono">trak.json</code> manifest automatically.
        </p>

        <div className="space-y-2 pt-1">
          {sampleCommands.map((item) => (
            <div
              key={item.cmd}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono"
            >
              <div>
                <span className="text-slate-400 block text-[11px]">{item.label}</span>
                <span className="text-slate-200 font-medium">{item.cmd}</span>
              </div>
              <button
                onClick={() => copyCmd(item.cmd)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 transition-colors shrink-0 cursor-pointer"
              >
                {copiedCmd === item.cmd ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

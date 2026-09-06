import React, { useState } from "react";
import { FolderX, Terminal, Copy, Check } from "lucide-react";
import type { WorkspaceInfo } from "../types";

interface EmptyWorkspaceProps {
  workspace: WorkspaceInfo | null;
}

export const EmptyWorkspace: React.FC<EmptyWorkspaceProps> = ({ workspace }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const sampleCommands = [
    { label: "Go Systems Lab", cmd: "trak init lang/go" },
    { label: "Rust Concurrency Lab", cmd: "trak init lang/rust" },
    { label: "Python Engineering Lab", cmd: "trak init lang/python" },
    { label: "PostgreSQL Internals Lab", cmd: "trak init db/postgres" },
    { label: "Kubernetes Cloud Lab", cmd: "trak init tool/k8s" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
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

      <div className="rounded-xl border border-white/[0.08] bg-[#090b10] p-6 text-left space-y-4 max-w-xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>How to Materialize a Learning Lab Here:</span>
        </div>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Navigate into your desired track folder in terminal or run any initialization command below. Trak will generate all multi-module source files and the <code className="text-slate-200 font-mono">trak.json</code> manifest automatically.
        </p>

        <div className="space-y-2 pt-2">
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
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 transition-colors shrink-0"
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

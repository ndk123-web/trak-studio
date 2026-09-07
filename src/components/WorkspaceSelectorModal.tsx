import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Copy,
  Check,
  AlertCircle,
  X,
  Clock,
  ArrowRight,
  HardDrive,
} from "lucide-react";
import type { WorkspaceInfo } from "../types";

import { fetchWorkspacesHistory } from "../api";

export interface WorkspaceHistoryItem {
  path: string;
  name: string;
  lastOpened: string;
}

interface WorkspaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkspace: WorkspaceInfo | null;
  onSelectPath: (newPath: string) => Promise<{ success: boolean; error?: string } | void> | void;
  isLoading?: boolean;
}

export const WorkspaceSelectorModal: React.FC<WorkspaceSelectorModalProps> = ({
  isOpen,
  onClose,
  currentWorkspace,
  onSelectPath,
  isLoading = false,
}) => {
  const [inputPath, setInputPath] = useState(currentWorkspace?.cwd || "");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<WorkspaceHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchWorkspacesHistory()
        .then((items) => setHistory(items))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentWorkspace?.cwd) {
      setInputPath(currentWorkspace.cwd);
    }
  }, [currentWorkspace?.cwd]);

  if (!isOpen) return null;

  const handleCopy = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleSubmit = async (pathTarget?: string) => {
    const target = (pathTarget || inputPath).trim();
    if (!target) {
      setErrorMsg("Please provide a valid directory path.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await onSelectPath(target);
      if (res && typeof res === "object" && "success" in res && !res.success) {
        setErrorMsg(res.error || `Failed to switch to: ${target}`);
        setIsSubmitting(false);
        return;
      }

      // Add to history
      const parts = target.replace(/\\/g, "/").split("/").filter(Boolean);
      const name = parts[parts.length - 1] || "workspace";
      const updated: WorkspaceHistoryItem[] = [
        { path: target, name, lastOpened: "Just now" },
        ...history.filter((h) => h.path.toLowerCase() !== target.toLowerCase()),
      ].slice(0, 8);
      setHistory(updated);
      localStorage.setItem("trak_workspaces_history", JSON.stringify(updated));

      onClose();
    } catch (err) {
      setErrorMsg(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161c2d] border border-white/[0.06] rounded-lg max-w-xl w-full overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-[#0e131f]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-tight">
                Select Workspace Directory
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Switch or point Trak Studio to a local learning track directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Current Workspace Pill */}
          {currentWorkspace?.cwd && (
            <div className="p-3 rounded-lg bg-[#07090e] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  Active Workspace Directory
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(currentWorkspace.cwd, e)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {copiedPath === currentWorkspace.cwd ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Path</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-200 select-all break-all bg-black/40 px-3 py-2 rounded-lg border border-white/[0.04]">
                {currentWorkspace.cwd}
              </div>
            </div>
          )}

          {/* Path Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-2"
          >
            <label className="block text-xs font-mono font-semibold text-slate-300">
              Workspace Path (Local Filesystem)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="e.g. C:\Users\dev\trak-workspace or /home/dev/trak-workspace"
                className="flex-1 px-3 py-2 bg-[#07090e] border border-white/[0.06] rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                disabled={isSubmitting || isLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || isLoading || !inputPath.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0"
              >
                <span>{isSubmitting || isLoading ? "Loading..." : "Load"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="break-all">{errorMsg}</span>
            </div>
          )}

          {/* Recent Workspaces List */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Recent Workspace Paths
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map((item) => {
                const isCurrent = currentWorkspace?.cwd.toLowerCase() === item.path.toLowerCase();
                return (
                  <div
                    key={item.path}
                    onClick={() => handleSubmit(item.path)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300"
                        : "bg-[#07090e]/60 border-white/[0.05] hover:bg-white/[0.04] text-slate-300 hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-white font-medium mr-2">{item.name}</span>
                        <span className="text-xs text-slate-500 truncate">{item.path}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent ? (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(item.path, e)}
                          title="Copy Path"
                          className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedPath === item.path ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] bg-[#0e131f] flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Trak Studio connects directly to local directories.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

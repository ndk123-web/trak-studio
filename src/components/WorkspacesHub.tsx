import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Layers,
  Trash2,
  Clock,
  BookOpen,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";

export interface WorkspaceHistoryItem {
  path: string;
  name: string;
  lastOpened: string;
  isCurrent?: boolean;
}

interface WorkspacesHubProps {
  workspace: WorkspaceInfo | null;
  status: StatusModel | null;
  onWorkspacePathChange?: (newPath: string) => Promise<{ success: boolean; error?: string } | void> | void;
  isLoading?: boolean;
}

export const WorkspacesHub: React.FC<WorkspacesHubProps> = ({
  workspace,
  status,
  onWorkspacePathChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [inputPath, setInputPath] = useState(workspace?.cwd || "");
  const [switchingPath, setSwitchingPath] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const port = window.location.port || "8200";

  // Load and sync workspace history
  const [history, setHistory] = useState<WorkspaceHistoryItem[]>(() => {
    const saved = localStorage.getItem("trak_workspaces_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Seed with current workspace and default known paths
    const initialPaths = [
      workspace?.cwd || "d:/CLI/trak/workspaces/learn-go",
      "d:/CLI/trak - learning tool/trak-studio",
      "C:/Users/Navnath/OneDrive/Desktop/Fun/trak-test",
    ];
    return initialPaths.map((p) => {
      const parts = p.replace(/\\/g, "/").split("/").filter(Boolean);
      return {
        path: p,
        name: parts[parts.length - 1] || "workspace",
        lastOpened: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    });
  });

  // Keep active workspace in history
  useEffect(() => {
    if (!workspace?.cwd) return;
    const current = workspace.cwd;
    const parts = current.replace(/\\/g, "/").split("/").filter(Boolean);
    const name = parts[parts.length - 1] || "workspace";

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.path.toLowerCase() !== current.toLowerCase());
      const updated: WorkspaceHistoryItem[] = [
        {
          path: current,
          name,
          lastOpened: "Just now",
        },
        ...filtered,
      ].slice(0, 8);

      localStorage.setItem("trak_workspaces_history", JSON.stringify(updated));
      return updated;
    });

    if (!inputPath) {
      setInputPath(current);
    }
  }, [workspace?.cwd]);

  const handleSwitch = async (targetPath: string) => {
    if (!targetPath.trim() || switchingPath || isLoading) return;
    const pathTrimmed = targetPath.trim();
    setSwitchingPath(pathTrimmed);
    setErrorMsg(null);

    try {
      if (onWorkspacePathChange) {
        const res = await onWorkspacePathChange(pathTrimmed);
        if (res && typeof res === "object" && "success" in res && !res.success) {
          setErrorMsg(res.error || `Failed to switch to: ${pathTrimmed}`);
          setTimeout(() => setErrorMsg(null), 5000);
          return;
        }
      }
    } catch (err) {
      setErrorMsg(String(err));
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSwitchingPath(null);
    }
  };

  const handleRemoveHistory = (pathToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.path !== pathToRemove);
      localStorage.setItem("trak_workspaces_history", JSON.stringify(updated));
      return updated;
    });
  };

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const starterTracks = [
    { name: "Go Systems & Architecture", cmd: "trak init lang/go", lang: "Go" },
    { name: "Python Engineering Lab", cmd: "trak init lang/python", lang: "Python" },
    { name: "Rust Memory & Concurrency", cmd: "trak init lang/rust", lang: "Rust" },
    { name: "PostgreSQL Database Engine", cmd: "trak init db/postgres", lang: "SQL" },
    { name: "Docker & Containerization", cmd: "trak init tool/docker", lang: "DevOps" },
  ];

  const hasModules = status && Object.keys(status.module_breakdown || {}).length > 0;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* 1. Header & Bridge Status Banner (Jenkins / Docker style) */}
      <div className="pb-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            Workspace Hub & Pipelines
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f4ef]">
            Local Workspace Hub
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Manage your project directories, view workspace history, or initialize new hands-on learning repositories.
          </p>
        </div>

        {/* Runtime Bridge Status Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Bridge:</span>
          <span className="text-emerald-400 font-bold">:{port}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Live FS</span>
        </div>
      </div>

      {/* 2. Active Directory Status Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Current Active Directory
              </span>
              {hasModules ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold">
                  Track Loaded ({Object.keys(status?.module_breakdown || {}).length} Modules)
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 font-bold">
                  No Active Manifest (Uninitialized)
                </span>
              )}
            </div>
            <div className="text-sm font-mono text-[#f5f4ef] truncate font-medium">
              {workspace?.cwd || "No directory bound"}
            </div>
          </div>

          {hasModules && (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Switch Workspace Path Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSwitch(inputPath);
          }}
          className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/[0.04]"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={inputPath}
              disabled={!!switchingPath || isLoading}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="e.g. D:/CLI/trak/workspaces/learn-go or C:/projects/my-app"
              className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={!inputPath.trim() || !!switchingPath || isLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs font-mono transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {switchingPath ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Switching...</span>
              </>
            ) : (
              <>
                <span>Launch Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 3. Workspace History / Pipelines Table (Jenkins Style) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Workspaces History</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {history.length} recent {history.length === 1 ? "workspace" : "workspaces"}
          </span>
        </div>

        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-slate-500 border border-dashed border-white/[0.08] rounded-xl">
              No recent workspaces recorded yet.
            </div>
          ) : (
            history.map((item) => {
              const isCurrent = workspace?.cwd && item.path.toLowerCase() === workspace.cwd.toLowerCase();
              return (
                <div
                  key={item.path}
                  onClick={() => !isCurrent && handleSwitch(item.path)}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs font-mono ${
                    isCurrent
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-[#07090e] hover:bg-white/[0.03] border-white/[0.06] text-slate-300 hover:border-white/[0.15] cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border shrink-0 ${
                      isCurrent
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-white/[0.03] border-white/[0.06] text-slate-400 group-hover:text-white"
                    }`}>
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-[#f5f4ef] truncate">{item.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.path}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      {item.lastOpened}
                    </span>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitch(item.path);
                        }}
                        disabled={switchingPath === item.path}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        {switchingPath === item.path ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                        ) : (
                          <>
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3 text-emerald-400" />
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleRemoveHistory(item.path, e)}
                      title="Remove from history"
                      className="p-1.5 rounded hover:bg-white/[0.08] text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Starter Learning Tracks Quick Scaffold (trak init) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Scaffold a New Curriculum Track</span>
          </div>
          <button
            onClick={() => navigate("/docs")}
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View CLI Docs</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Run any command in your terminal to initialize a certified hands-on repository with exercises, tests, and manifest:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {starterTracks.map((trk) => (
            <div
              key={trk.cmd}
              className="p-3.5 rounded-xl border border-white/[0.06] bg-[#07090e] space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#f5f4ef]">{trk.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {trk.lang}
                  </span>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/[0.04] font-mono text-[11px] text-emerald-300 mt-2 truncate">
                  {trk.cmd}
                </div>
              </div>

              <button
                onClick={() => copyCmd(trk.cmd)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer mt-1"
              >
                {copiedCmd === trk.cmd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Command</span>
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

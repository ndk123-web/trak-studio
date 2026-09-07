import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Trash2,
  HardDrive,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";
import { fetchWorkspacesHistory, deleteWorkspaceHistoryItem, browseWorkspaceFolder } from "../api";

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

  const initialPath = workspace?.cwd && !workspace.cwd.toLowerCase().includes("learn-go") ? workspace.cwd : "";
  const [inputPath, setInputPath] = useState(initialPath);
  const [switchingPath, setSwitchingPath] = useState<string | null>(null);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<WorkspaceHistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const items = await fetchWorkspacesHistory();
      const cleaned = items.filter((item) => !item.path?.toLowerCase().includes("learn-go"));
      setHistory(cleaned);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadHistory();
  }, [workspace?.cwd]);

  useEffect(() => {
    if (workspace?.cwd && !inputPath && !workspace.cwd.toLowerCase().includes("learn-go")) {
      setInputPath(workspace.cwd);
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
          setErrorMsg(res.error || `Failed to open workspace: ${pathTrimmed}`);
          setTimeout(() => setErrorMsg(null), 5000);
          return;
        }
      }
      await loadHistory();
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(String(err));
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSwitchingPath(null);
    }
  };

  const handleBrowseFolderClick = async () => {
    setIsBrowsing(true);
    setErrorMsg(null);
    try {
      const res = await browseWorkspaceFolder();
      if (res && res.success && res.path) {
        setInputPath(res.path);
      }
    } catch (err) {
      console.warn("Browse error:", err);
    } finally {
      setIsBrowsing(false);
    }
  };

  const handleRemoveHistory = async (pathToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await deleteWorkspaceHistoryItem(pathToRemove);
      setHistory(updated);
    } catch {
      setHistory((prev) => prev.filter((item) => item.path !== pathToRemove));
    }
  };

  const hasModules = status && Object.keys(status.module_breakdown || {}).length > 0;

  return (
    <div className="min-h-screen w-full bg-[#07090e] bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] flex flex-col items-center justify-center p-6 select-none font-mono">
      <div className="w-full max-w-xl space-y-4">
        {/* Simple Brand Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <img
            src="/trak.png"
            alt="Trak"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Trak Studio
            </h1>
            <p className="text-xs text-slate-400">
              Select a workspace to open, or enter a local path.
            </p>
          </div>
        </div>

        {/* Path Input Box */}
        <div className="p-4 rounded-lg border border-white/[0.06] bg-[#161c2d] space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Workspace Path</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSwitch(inputPath);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPath}
              disabled={!!switchingPath || isLoading || isBrowsing}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="e.g. C:/projects/my-workspace or browse folder..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.06] text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 disabled:opacity-60"
              autoFocus
            />
            <button
              type="button"
              onClick={handleBrowseFolderClick}
              disabled={!!switchingPath || isLoading || isBrowsing}
              className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              title="Browse folder from OS"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBrowsing ? "Browsing..." : "Browse"}</span>
            </button>
            <button
              type="submit"
              disabled={!inputPath.trim() || !!switchingPath || isLoading || isBrowsing}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
            >
              {switchingPath ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Opening...</span>
                </>
              ) : (
                <>
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Current Active Workspace Shortcut */}
        {hasModules && workspace?.cwd && (
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Active Workspace
                </div>
                <div className="text-xs text-slate-200 truncate">
                  {workspace.cwd}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shrink-0 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Recent Workspaces */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Recent Workspaces</span>
              <span>{history.length}</span>
            </div>
            <div className="space-y-1">
              {history.map((item) => {
                const isCurrent = workspace?.cwd && item.path.toLowerCase() === workspace.cwd.toLowerCase();
                return (
                  <div
                    key={item.path}
                    onClick={() => !isCurrent && handleSwitch(item.path)}
                    className={`group flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                      isCurrent
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-[#161c2d] hover:bg-white/[0.04] border-white/[0.06] text-slate-300 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-emerald-400" : "text-slate-500"}`} />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                        <div className="text-xs text-slate-500 truncate">{item.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {isCurrent ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{item.lastOpened}</span>
                      )}
                      {!isCurrent && switchingPath === item.path && (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveHistory(item.path, e)}
                        title="Remove from history"
                        className="p-2 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

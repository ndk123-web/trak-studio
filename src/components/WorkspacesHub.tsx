import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Trash2,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";

import { fetchWorkspacesHistory, deleteWorkspaceHistoryItem } from "../api";

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
  const [history, setHistory] = useState<WorkspaceHistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const items = await fetchWorkspacesHistory();
      setHistory(items);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadHistory();
  }, [workspace?.cwd]);

  useEffect(() => {
    if (workspace?.cwd && !inputPath) {
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
          setErrorMsg(res.error || `Failed to open: ${pathTrimmed}`);
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
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
      <div className="w-full max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Heading */}
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white font-mono">Workspaces</h1>
          <p className="text-xs text-slate-400">
            Enter a path to a trak workspace directory, or select from history.
          </p>
        </div>

        {/* Path Input */}
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
            disabled={!!switchingPath || isLoading}
            onChange={(e) => setInputPath(e.target.value)}
            placeholder="e.g. D:/projects/learn-go"
            className="flex-1 px-3 py-2.5 rounded-lg bg-[#090b10] border border-white/[0.08] text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputPath.trim() || !!switchingPath || isLoading}
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
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

        {/* Error */}
        {errorMsg && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Workspace Quick Link */}
        {hasModules && workspace?.cwd && (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono hover:bg-emerald-500/15 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 font-medium truncate">{workspace.cwd}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
                Active
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </button>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Recent
            </div>
            <div className="space-y-1">
              {history.map((item) => {
                const isCurrent = workspace?.cwd && item.path.toLowerCase() === workspace.cwd.toLowerCase();
                return (
                  <div
                    key={item.path}
                    onClick={() => !isCurrent && handleSwitch(item.path)}
                    className={`group flex items-center justify-between p-3 rounded-lg border text-xs font-mono transition-all ${
                      isCurrent
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                        : "bg-[#090b10] hover:bg-white/[0.03] border-white/[0.06] text-slate-300 hover:border-white/[0.12] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-emerald-400" : "text-slate-500"}`} />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-200 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                          Current
                        </span>
                      )}
                      {!isCurrent && switchingPath === item.path && (
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveHistory(item.path, e)}
                        title="Remove"
                        className="p-1 rounded hover:bg-white/[0.08] text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {history.length === 0 && !hasModules && (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No recent workspaces. Paste a path above to get started.
          </div>
        )}
      </div>
    </div>
  );
};

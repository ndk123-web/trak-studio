import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Folder,
  Server,
  RefreshCw,
  Settings,
  Layers,
  PanelLeft,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";

interface StatusBarProps {
  workspace: WorkspaceInfo | null;
  status: StatusModel | null;
  isLoading: boolean;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  workspace,
  status,
  isLoading,
  onRefresh,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPort = window.location.port || "8200";

  const completedCount = status
    ? Object.values(status.module_breakdown || {}).filter(Boolean).length
    : 0;
  const totalCount = status ? Object.keys(status.module_breakdown || {}).length : 0;

  return (
    <footer className="h-7 shrink-0 border-t border-white/[0.08] bg-[#07090e] px-3 flex items-center justify-between text-[11px] font-mono select-none z-10 text-slate-400">
      {/* Left Section: Workspace & Track Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Sidebar Toggle Shortcut Button */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-1 hover:text-white transition-colors py-0.5 px-1 rounded hover:bg-white/[0.04]"
          title={`${isSidebarCollapsed ? "Open" : "Close"} Sidebar (Ctrl+B)`}
        >
          <PanelLeft className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400 transition-colors" />
          <span className="hidden md:inline text-[10px] text-slate-500">Ctrl+B</span>
        </button>

        <span className="text-white/[0.1]">|</span>

        {/* Studio Version Pill */}
        <div className="flex items-center gap-1 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-200">Trak Studio</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-white/[0.06] text-emerald-400 font-bold border border-white/[0.06]">
            v1.0.0
          </span>
        </div>

        <span className="hidden sm:inline text-white/[0.1]">|</span>

        {/* Active Workspace Directory with switch link */}
        {workspace?.cwd && (
          <button
            onClick={() => navigate("/settings")}
            className="hidden sm:flex items-center gap-1.5 hover:text-emerald-400 transition-colors truncate max-w-xs md:max-w-md"
            title={`Active Workspace: ${workspace.cwd} (Click to change in Settings)`}
          >
            <Folder className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate text-slate-400 hover:text-slate-200">{workspace.cwd}</span>
          </button>
        )}

        {/* Track / Curriculum Progress */}
        {status && (
          <>
            <span className="hidden lg:inline text-white/[0.1]">|</span>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300">{status.id}</span>
              <span className="text-[10px] text-slate-500">
                ({completedCount}/{totalCount} completed)
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right Section: Port, Resync, and Settings link */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Local Bridge Port */}
        <div
          className="flex items-center gap-1 text-slate-400 hover:text-slate-300 cursor-default"
          title={`Connected to Trak HTTP Bridge on port ${currentPort}`}
        >
          <Server className="w-3 h-3 text-slate-500" />
          <span>:{currentPort}</span>
        </div>

        <span className="text-white/[0.1]">|</span>

        {/* Resync from Disk */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
          title="Resync state from disk"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          <span className="hidden md:inline">{isLoading ? "Syncing..." : "Sync"}</span>
        </button>

        <span className="text-white/[0.1]">|</span>

        {/* Settings Navigation */}
        <button
          onClick={() => navigate("/settings")}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
            location.pathname === "/settings"
              ? "text-emerald-400 bg-white/[0.08]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
          title="Studio & Workspace Settings"
        >
          <Settings className="w-3 h-3" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </footer>
  );
};

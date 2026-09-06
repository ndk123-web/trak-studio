import React from "react";
import {
  RefreshCw,
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
  status,
  isLoading,
  onRefresh,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const currentPort = window.location.port || "8200";

  const completedCount = status
    ? Object.values(status.module_breakdown || {}).filter(Boolean).length
    : 0;
  const totalCount = status ? Object.keys(status.module_breakdown || {}).length : 0;

  return (
    <footer className="h-6 shrink-0 border-t border-white/[0.08] bg-[#07090e] px-3 flex items-center justify-between text-[11px] font-mono select-none z-10 text-slate-400">
      {/* Left */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="hover:text-white transition-colors"
          title={`${isSidebarCollapsed ? "Open" : "Close"} Sidebar (Ctrl+B)`}
        >
          <PanelLeft className="w-3 h-3" />
        </button>

        {status && (
          <>
            <span className="text-white/[0.1]">|</span>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300">{status.id}</span>
              <span className="text-slate-500">{completedCount}/{totalCount}</span>
            </div>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-slate-500">:{currentPort}</span>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="hover:text-emerald-400 transition-colors disabled:opacity-50"
          title="Sync"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>
    </footer>
  );
};

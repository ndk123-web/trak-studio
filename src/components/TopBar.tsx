import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Settings,
  ChevronRight,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";

interface TopBarProps {
  status: StatusModel | null;
  workspace?: WorkspaceInfo | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onRefresh,
  isLoading,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path === "/workspaces") return "Workspaces";
    if (path.startsWith("/modules/")) {
      const id = path.replace("/modules/", "");
      return decodeURIComponent(id);
    }
    if (path === "/modules") return "Modules";
    if (path === "/editor") return "Editor";
    if (path === "/verify") return "Test Runner";
    if (path === "/manifest") return "Manifest";
    if (path === "/docs") return "Docs";
    if (path === "/settings") return "Settings";
    return "Workspace";
  };

  return (
    <header className="h-11 border-b border-white/[0.06] bg-[#07090e] px-4 flex items-center justify-between sticky top-0 z-30 select-none text-xs font-mono">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => navigate("/dashboard")}
          title="Dashboard"
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.06] text-white font-bold transition-colors shrink-0 cursor-pointer"
        >
          <img
            src="/trak.png"
            alt="Trak"
            className="w-4 h-4 object-contain"
          />
          <span className="text-emerald-400 tracking-tight">TRAK</span>
        </button>

        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

        <span className="text-slate-300 font-medium truncate">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Right: Refresh + Settings */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
          className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
        </button>

        <button
          onClick={() => navigate("/settings")}
          title="Settings"
          className={`p-2 rounded-lg transition-colors ${
            location.pathname === "/settings"
              ? "bg-emerald-500/15 text-emerald-400"
              : "hover:bg-white/[0.06] text-slate-400 hover:text-white"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  RefreshCw,
  PlayCircle,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";
import { useTheme } from "../context/ThemeContext";

interface TopBarProps {
  status: StatusModel | null;
  workspace?: WorkspaceInfo | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  status,
  workspace,
  onRefresh,
  isLoading,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.startsWith("/modules/")) {
      const id = path.replace("/modules/", "");
      return `Module: ${decodeURIComponent(id)}`;
    }
    if (path === "/modules") return "Curriculum Roadmap";
    if (path === "/editor") return "Code Editor";
    if (path === "/verify") return "Assertion Runner";
    if (path === "/manifest") return "Manifest (trak.json)";
    if (path === "/docs") return "Documentation";
    if (path === "/settings") return "Settings";
    return "Workspace";
  };

  const nextModule = status
    ? Object.entries(status.module_breakdown || {}).find(([_, done]) => !done)?.[0] || null
    : null;

  const isMock = !!(status?.isMock || workspace?.isMock);

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 select-none">
      {/* Left: Brand Logo & Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => navigate("/dashboard")}
          title="Go to Dashboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer shrink-0"
        >
          <img
            src="/trak.png"
            alt="Trak Logo"
            className="w-4 h-4 object-contain"
          />
          <span className="font-extrabold text-xs tracking-tight text-white font-mono">Trak</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        <div className="flex items-center gap-2 text-xs font-mono truncate">
          <span className="text-slate-400 hidden sm:inline">Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline shrink-0" />
          <span className="text-emerald-400 font-semibold truncate">{getBreadcrumb()}</span>
        </div>

        {isMock && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-mono shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider">Mock Data</span>
          </div>
        )}
      </div>

      {/* Right Controls: Verify Next, Settings, Refresh */}
      <div className="flex items-center gap-2.5 shrink-0">
        {nextModule && (
          <button
            onClick={() => navigate("/verify")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Verify Next: {nextModule}</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Reload State from Filesystem"
          className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
        </button>

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          )}
        </button>

        <button
          onClick={() => navigate("/settings")}
          title="Studio Settings & Workspace Configuration"
          className={`p-2 rounded-lg border transition-colors ${
            location.pathname === "/settings"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] text-slate-300 hover:text-white"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

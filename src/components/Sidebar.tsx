import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Code2,
  PlayCircle,
  FileCode2,
  Copy,
  Check,
  RefreshCw,
  Server,
  Settings,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";

interface SidebarProps {
  status: StatusModel | null;
  workspace: WorkspaceInfo | null;
  onRefresh: () => void;
  isLoading: boolean;
  width: number;
  onWidthChange: (width: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  status,
  workspace,
  onRefresh,
  isLoading,
  width,
  onWidthChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [copied, setCopied] = useState(false);
  const isResizing = useRef(false);

  const handleCopyPath = () => {
    if (workspace?.cwd) {
      navigator.clipboard.writeText(workspace.cwd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Resizable drag handle logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(210, Math.min(460, e.clientX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onWidthChange]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const completedCount = status
    ? Object.values(status.module_breakdown || {}).filter(Boolean).length
    : 0;
  const totalCount = status ? Object.keys(status.module_breakdown || {}).length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentPort = window.location.port || "8200";

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: "/modules",
      label: "Curriculum Roadmap",
      icon: Layers,
      badge: totalCount > 0 ? `${totalCount}` : null,
    },
    {
      to: "/editor",
      label: "Monaco Code Studio",
      icon: Code2,
      badge: "VS Code",
    },
    {
      to: "/verify",
      label: "Test Runner",
      icon: PlayCircle,
      badge: `${completedCount}/${totalCount}`,
    },
    {
      to: "/manifest",
      label: "trak.json Manifest",
      icon: FileCode2,
      badge: status?.version || null,
    },
    {
      to: "/settings",
      label: "Studio Settings",
      icon: Settings,
      badge: "Config",
    },
  ];

  if (isCollapsed) {
    return (
      <aside className="w-16 shrink-0 bg-[#090b10] border-r border-white/[0.07] flex flex-col h-screen select-none z-20 items-center justify-between">
        {/* Top Header Branding (Collapsed) */}
        <div className="h-14 w-full px-2 border-b border-white/[0.07] flex items-center justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Expand sidebar (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Navigation Items (Collapsed) */}
        <nav className="flex-1 px-2 py-4 space-y-2 w-full flex flex-col items-center overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  `p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.08]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer (Collapsed) */}
        <div className="p-3 border-t border-white/[0.07] bg-[#07080d] w-full flex items-center justify-center">
          <NavLink
            to="/settings"
            title="Studio Settings"
            className={({ isActive }) =>
              `p-2 rounded-xl transition-colors ${
                isActive
                  ? "text-emerald-400 bg-white/[0.08]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Settings className="w-4 h-4" />
          </NavLink>
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{ width: `${width}px` }}
      className="shrink-0 bg-[#07090e] border-r border-white/[0.08] flex flex-col h-screen sticky top-0 select-none z-20 relative transition-[width] duration-75 ease-out"
    >
      {/* 1. Header with Official trak.png Logo & Collapse Toggle (Exact trak-web style) */}
      <div className="h-14 px-4 border-b border-white/[0.07] flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/[0.1] bg-[#0c0f17] flex items-center justify-center p-1 shrink-0">
            <img
              src="/trak.png"
              alt="Trak Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-base tracking-tight text-white">
              trak
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              v1.3.0
            </span>
          </div>
        </div>

        {/* Desktop Collapse Toggle Button (Exact trak-web style) */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Collapse sidebar (Ctrl+B)"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Active Track Blueprint Card */}
      {status && (
        <div className="p-3 mx-3 my-3 rounded-xl border border-white/[0.08] bg-[#090b10] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 uppercase tracking-wider font-semibold truncate">
              {status.id}
            </span>
            <span className="font-bold text-emerald-400">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{completedCount} Passed</span>
            <span>{totalCount - completedCount} Incomplete</span>
          </div>
        </div>
      )}

      {/* 3. Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar py-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1 font-semibold">
          Views
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono font-medium transition-all group ${
                  isActive
                    ? "bg-white/[0.08] text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`
              }
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-400 shrink-0">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 4. Cohesive Bottom Footer: Clean Path & Synced Port & Refresh Controls */}
      <div className="p-3 border-t border-white/[0.08] bg-[#090b10] space-y-2.5">
        {workspace?.cwd && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="truncate">Directory</span>
              <button
                onClick={handleCopyPath}
                className="hover:text-white flex items-center gap-1 transition-colors"
                title="Copy Directory Path"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="p-1.5 rounded bg-[#07090e] border border-white/[0.06] font-mono text-[11px] text-slate-300 truncate">
              {workspace.cwd}
            </div>
          </div>
        )}

        {/* Clean, perfectly synced Port, Settings & Refresh Toolbar Row */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-300 font-medium">:{currentPort}</span>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/settings"
              title="Studio Settings (Workspace, Paths, Port)"
              className={({ isActive }) =>
                `p-1.5 rounded border transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-slate-400 hover:text-white"
                }`
              }
            >
              <Settings className="w-3 h-3" />
            </NavLink>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title="Resync workspace from filesystem"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isLoading ? "Syncing" : "Sync"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drag Resize Handle */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/30 transition-colors z-30"
        title="Drag to resize sidebar"
      />
    </aside>
  );
};

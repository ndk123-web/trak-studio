import React, { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Code2,
  PlayCircle,
  FileCode2,
  Settings,
  BookOpen,
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
  width,
  onWidthChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(180, Math.min(400, e.clientX));
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
  const hasModules = totalCount > 0;

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/modules", label: "Modules", icon: Layers },
    { to: "/editor", label: "Editor", icon: Code2 },
    { to: "/verify", label: "Test Runner", icon: PlayCircle },
  ];

  const toolItems = [
    { to: "/manifest", label: "Manifest", icon: FileCode2 },
    { to: "/docs", label: "Docs", icon: BookOpen },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  // Collapsed sidebar
  if (isCollapsed) {
    return (
      <aside className="w-14 shrink-0 bg-[#090b10] border-r border-white/[0.07] flex flex-col h-screen select-none z-20 items-center">
        <div className="h-11 w-full flex items-center justify-center border-b border-white/[0.07]">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Expand (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 space-y-1 w-full flex flex-col items-center overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={hasModules ? item.to : "/workspaces"}
                title={item.label}
                className={({ isActive }) =>
                  `p-2 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
              </NavLink>
            );
          })}

          <div className="w-5 h-px bg-white/[0.06] my-1" />

          {toolItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  `p-2 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
              </NavLink>
            );
          })}
        </nav>
      </aside>
    );
  }

  // Expanded sidebar
  return (
    <aside
      style={{ width: `${width}px` }}
      className="shrink-0 bg-[#07090e] border-r border-white/[0.08] flex flex-col h-screen sticky top-0 select-none z-20 relative transition-[width] duration-75 ease-out"
    >
      {/* Header */}
      <div className="h-11 px-3 border-b border-white/[0.07] flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <img
            src="/trak.png"
            alt="Trak"
            className="w-5 h-5 object-contain"
          />
          <span className="font-bold text-sm text-white font-mono">Trak Studio</span>
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Collapse (Ctrl+B)"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Card */}
      {hasModules && status && (
        <div className="px-3 py-2.5 mx-2 mt-2 rounded-lg border border-white/[0.06] bg-[#090b10]">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-slate-400 truncate">{status.id}</span>
            <span className="text-emerald-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>{completedCount} done</span>
            <span>{totalCount - completedCount} left</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isLocked = !hasModules;
          return (
            <NavLink
              key={item.to}
              to={isLocked ? "/workspaces" : item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isLocked
                    ? "text-slate-500 opacity-50 cursor-not-allowed"
                    : isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="h-px bg-white/[0.06] my-2 mx-1" />

        {toolItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-emerald-500/30 transition-colors z-30"
      />
    </aside>
  );
};

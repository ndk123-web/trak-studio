import React, { useState } from "react";
import {
  LayoutDashboard,
  FolderTree,
  PlayCircle,
  FileCode2,
  RefreshCw,
  Copy,
  Check,
  Folder,
} from "lucide-react";
import type { WorkspaceInfo } from "../types";

export type TabType = "dashboard" | "explorer" | "verify" | "manifest";

interface HeaderProps {
  workspace: WorkspaceInfo | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  workspace,
  activeTab,
  onTabChange,
  onRefresh,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = () => {
    if (workspace?.cwd) {
      navigator.clipboard.writeText(workspace.cwd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "explorer", label: "File Explorer", icon: <FolderTree className="w-4 h-4" /> },
    { id: "verify", label: "Test Runner", icon: <PlayCircle className="w-4 h-4" /> },
    { id: "manifest", label: "trak.json", icon: <FileCode2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#07090e]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Monogram & Live Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              tr
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-normal tracking-tight text-[#f5f4ef]">
                  Trak Studio
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                  v1.0.0
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400">●</span>
                <span>Local Bridge Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive Tabs */}
        <nav className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-white/[0.1] text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Workspace Path Pill & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {workspace?.cwd && (
            <button
              onClick={handleCopyPath}
              title={`Click to copy path: ${workspace.cwd}`}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 text-xs font-mono transition-colors group max-w-xs truncate"
            >
              <Folder className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px]">{workspace.cwd}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
              )}
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Reload Workspace State"
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from "react";
import {
  Settings,
  FolderSync,
  HardDrive,
  Sliders,
  Check,
  RefreshCw,
  FolderOpen,
  Globe,
  ArrowRight,
  Clock,
  Trash2,
  AlertCircle,
  Sun,
  Moon,
  Cpu,
  Save,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";
import { useTheme } from "../context/ThemeContext";
import { fetchWorkspacesHistory, deleteWorkspaceHistoryItem, browseWorkspaceFolder } from "../api";
import type { WorkspaceHistoryItem } from "../components/WorkspacesHub";

interface SettingsPageProps {
  workspace: WorkspaceInfo | null;
  status: StatusModel | null;
  onRefresh: () => void;
  isLoading: boolean;
  onWorkspacePathChange?: (newPath: string) => Promise<{ success: boolean; error?: string } | void> | void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  workspace,
  status,
  onRefresh,
  isLoading,
  onWorkspacePathChange,
}) => {
  const { theme, setTheme } = useTheme();
  const [customPath, setCustomPath] = useState(workspace?.cwd || "");
  const [isSwitching, setIsSwitching] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<WorkspaceHistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const items = await fetchWorkspacesHistory();
      setRecentItems(items);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadHistory();
  }, [workspace?.cwd]);

  const port = window.location.port || "8200";
  const [autoVerify, setAutoVerify] = useState<boolean>(() => {
    return localStorage.getItem("trak_auto_verify") !== "false";
  });
  const [minimap, setMinimap] = useState<boolean>(() => {
    return localStorage.getItem("trak_editor_minimap") !== "false";
  });
  const [autoSave, setAutoSave] = useState<boolean>(() => {
    return localStorage.getItem("trak_autosave") !== "false";
  });
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleToggleAutoSave = (val: boolean) => {
    setAutoSave(val);
    localStorage.setItem("trak_autosave", String(val));
    showSavedToast("Auto-save setting updated");
  };

  const handleToggleMinimap = (val: boolean) => {
    setMinimap(val);
    localStorage.setItem("trak_editor_minimap", String(val));
    showSavedToast("Minimap setting updated");
  };

  const handleToggleAutoVerify = (val: boolean) => {
    setAutoVerify(val);
    localStorage.setItem("trak_auto_verify", String(val));
    showSavedToast("Auto-verify setting updated");
  };

  const showSavedToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  useEffect(() => {
    if (workspace?.cwd && !customPath) {
      setCustomPath(workspace.cwd);
    }
  }, [workspace?.cwd]);

  const handleSwitchWorkspace = async (targetPath: string) => {
    if (!targetPath.trim() || isSwitching) return;
    const pathTrimmed = targetPath.trim();
    setIsSwitching(true);
    setErrorNotice(null);

    try {
      if (onWorkspacePathChange) {
        const res = await onWorkspacePathChange(pathTrimmed);
        if (res && typeof res === "object" && "success" in res && !res.success) {
          setErrorNotice(res.error || `Failed to switch to: ${pathTrimmed}`);
          setTimeout(() => setErrorNotice(null), 5000);
          return;
        }
      }

      await loadHistory();
      showSavedToast(`Switched active workspace to: ${pathTrimmed}`);
    } catch (err) {
      setErrorNotice(String(err));
      setTimeout(() => setErrorNotice(null), 5000);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleRemoveRecent = async (pathToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await deleteWorkspaceHistoryItem(pathToRemove);
      setRecentItems(updated);
    } catch {
      setRecentItems((prev) => prev.filter((item) => item.path !== pathToRemove));
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("trak_editor_minimap", String(minimap));
    localStorage.setItem("trak_autosave", String(autoSave));
    localStorage.setItem("trak_auto_verify", String(autoVerify));
    if (customPath !== workspace?.cwd) {
      handleSwitchWorkspace(customPath);
    } else {
      showSavedToast("All settings saved successfully");
    }
  };

  const handleBrowseFolderClick = async () => {
    setIsBrowsing(true);
    setErrorNotice(null);
    try {
      const res = await browseWorkspaceFolder();
      if (res && res.success && res.path) {
        setCustomPath(res.path);
      }
    } catch (err) {
      console.warn("Browse error:", err);
    } finally {
      setIsBrowsing(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6 select-none font-sans animate-in fade-in duration-150">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Settings</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Studio preferences, workspace directory, and runtime diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            <span>Resync</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedNotice && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Active Workspace Path & History */}
        <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              <FolderSync className="w-4 h-4 text-emerald-400" />
              <span>Active Workspace</span>
            </div>
            {workspace?.cwd && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                CONNECTED
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <HardDrive className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={customPath}
                disabled={isSwitching || isLoading}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="e.g. C:/projects/my-workspace or browse folder..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.06] text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
              />
            </div>
            <button
              type="button"
              onClick={handleBrowseFolderClick}
              disabled={isSwitching || isLoading || isBrowsing}
              className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              title="Browse folder from OS"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBrowsing ? "Browsing..." : "Browse"}</span>
            </button>
            <button
              type="button"
              disabled={isSwitching || isLoading || !customPath.trim()}
              onClick={() => handleSwitchWorkspace(customPath)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs font-mono transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSwitching || isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Switching...</span>
                </>
              ) : (
                <>
                  <span>Switch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Recent Workspaces List */}
          {recentItems.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-white/[0.04]">
              <div className="text-xs font-mono text-slate-500 uppercase flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Recent Workspaces</span>
                </span>
                <span>{recentItems.length}</span>
              </div>
              <div className="space-y-1">
                {recentItems.map((item) => {
                  const isActive = item.path.toLowerCase() === workspace?.cwd?.toLowerCase();
                  return (
                    <div
                      key={item.path}
                      onClick={() => {
                        setCustomPath(item.path);
                        if (!isActive) handleSwitchWorkspace(item.path);
                      }}
                      className={`group flex items-center justify-between p-3 rounded-lg text-xs font-mono cursor-pointer border transition-all ${
                        isActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-[#07090e] border-white/[0.04] text-slate-300 hover:text-slate-200 hover:border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                        <span className="truncate font-semibold text-slate-200">{item.name}</span>
                        <span className="text-xs text-slate-500 truncate hidden sm:inline">({item.path})</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isActive ? (
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 hidden md:inline">{item.lastOpened}</span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecent(item.path, e)}
                          className="p-2 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove from history"
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

        {/* Section 2: Studio Appearance & Preferences */}
        <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Appearance & Editor</span>
          </div>

          <div className="space-y-3">
            {/* Theme Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-[#0e131f]">
              <div>
                <div className="text-xs font-mono text-slate-200 font-medium">Theme Mode</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  High-contrast dark or clean developer light mode.
                </div>
              </div>
              <div className="flex items-center p-1 rounded-lg bg-black/30 border border-white/[0.06] gap-1">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    theme === "light"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Auto-Save Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-[#0e131f]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-200 font-medium">Auto-Save Buffer</span>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    ON
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Persists code changes directly to disk 800ms after typing.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAutoSave(!autoSave)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  autoSave ? "bg-emerald-500" : "bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    autoSave ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Minimap Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-[#0e131f]">
              <div>
                <div className="text-xs font-mono text-slate-200 font-medium">Editor Minimap</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Display high-level code navigation minimap in Monaco editor.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleMinimap(!minimap)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  minimap ? "bg-emerald-500" : "bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    minimap ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Auto-Verify on Passing Tests */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-[#0e131f]">
              <div>
                <div className="text-xs font-mono text-slate-200 font-medium">Auto-Complete on Pass</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Automatically mark module complete when test suite passes.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAutoVerify(!autoVerify)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  autoVerify ? "bg-emerald-500" : "bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    autoVerify ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Runtime Diagnostics */}
        <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Runtime Information</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-3 rounded-lg border border-white/[0.06] bg-[#0e131f] space-y-1">
              <div className="text-xs font-mono text-slate-500 uppercase">Studio Version</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span>v1.0.0</span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  LATEST
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-white/[0.06] bg-[#0e131f] space-y-1">
              <div className="text-xs font-mono text-slate-500 uppercase">Bridge Port</div>
              <div className="text-xs font-mono font-bold text-emerald-400">:{port}</div>
            </div>

            <div className="p-3 rounded-lg border border-white/[0.06] bg-[#0e131f] space-y-1">
              <div className="text-xs font-mono text-slate-500 uppercase">CLI Manifest</div>
              <div className="text-xs font-mono font-bold text-slate-300">
                {status?.version ? `v${status.version}` : "v2.0.0"}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-white/[0.06] bg-[#0e131f] space-y-1">
              <div className="text-xs font-mono text-slate-500 uppercase">Editor Engine</div>
              <div className="text-xs font-mono font-bold text-slate-300">Monaco Core</div>
            </div>
          </div>
        </div>

        {/* Section 4: Upstream Registry */}
        <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Curriculum Upstream</span>
          </div>

          <div className="p-3 rounded-lg border border-white/[0.06] bg-[#0e131f] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-400">Official Curriculum Registry</span>
            <a
              href="https://github.com/ndk123-web/trak-registry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>github.com/ndk123-web/trak-registry</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

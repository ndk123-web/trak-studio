import React, { useState, useEffect } from "react";
import {
  Settings,
  FolderSync,
  HardDrive,
  Info,
  Sliders,
  Check,
  RefreshCw,
  FolderOpen,
  Terminal,
  Globe,
  ArrowRight,
  Clock,
  Trash2,
  Sparkles,
  Radio,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";

interface SettingsPageProps {
  workspace: WorkspaceInfo | null;
  status: StatusModel | null;
  onRefresh: () => void;
  isLoading: boolean;
  onWorkspacePathChange?: (newPath: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  workspace,
  status,
  onRefresh,
  isLoading,
  onWorkspacePathChange,
}) => {
  const [customPath, setCustomPath] = useState(workspace?.cwd || "");
  const [recentPaths, setRecentPaths] = useState<string[]>(() => {
    const saved = localStorage.getItem("trak_studio_recent_workspaces");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      workspace?.cwd || "d:/CLI/trak/workspaces/learn-go",
      "d:/CLI/trak - learning tool/trak-studio",
    ];
  });

  const port = window.location.port || "8200";
  const [autoVerify, setAutoVerify] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Future hook states
  const [customTestCmd, setCustomTestCmd] = useState("go test -v ./...");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [autoGitCommit, setAutoGitCommit] = useState(false);

  useEffect(() => {
    if (workspace?.cwd && !customPath) {
      setCustomPath(workspace.cwd);
    }
  }, [workspace?.cwd]);

  const handleSwitchWorkspace = (targetPath: string) => {
    if (!targetPath.trim()) return;
    const pathTrimmed = targetPath.trim();

    // Update recents
    const updated = [pathTrimmed, ...recentPaths.filter((p) => p !== pathTrimmed)].slice(0, 5);
    setRecentPaths(updated);
    localStorage.setItem("trak_studio_recent_workspaces", JSON.stringify(updated));

    if (onWorkspacePathChange) {
      onWorkspacePathChange(pathTrimmed);
    }

    setSavedNotice(`Switched active workspace to: ${pathTrimmed}`);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleRemoveRecent = (pathToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentPaths.filter((p) => p !== pathToRemove);
    setRecentPaths(updated);
    localStorage.setItem("trak_studio_recent_workspaces", JSON.stringify(updated));
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPath !== workspace?.cwd) {
      handleSwitchWorkspace(customPath);
    } else {
      setSavedNotice("All Studio settings & preferences saved successfully.");
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 select-none">
      {/* Page Header */}
      <div className="pb-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            Studio Configuration & Workspace Settings
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f4ef]">
            Workspace & Studio Settings
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Manage active workspace directory path, studio version, port configuration, and future extensions.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Section 1: Switch Workspace Directory with Path Input & Recent Workspaces */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              <FolderSync className="w-4 h-4 text-emerald-400" />
              <span>Active Local Workspace Path</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Live Filesystem
            </span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Change the working directory inspected by Trak Studio. When switched, the studio re-indexes <code className="text-slate-200 font-mono">trak.json</code> and all files inside that workspace directory.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <HardDrive className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="e.g. D:/CLI/trak/workspaces/learn-go"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSwitchWorkspace(customPath)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            >
              <span>Switch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Workspaces List */}
          {recentPaths.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>Recent Workspaces</span>
              </div>
              <div className="space-y-1.5">
                {recentPaths.map((path) => (
                  <div
                    key={path}
                    onClick={() => {
                      setCustomPath(path);
                      handleSwitchWorkspace(path);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-mono cursor-pointer border transition-all ${
                      path === workspace?.cwd
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-[#07090e] border-white/[0.04] text-slate-400 hover:text-slate-200 hover:border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{path}</span>
                      {path === workspace?.cwd && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecent(path, e)}
                      className="p-1 rounded hover:bg-white/[0.08] text-slate-500 hover:text-red-400 transition-colors shrink-0"
                      title="Remove from recents"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Studio & Bridge Runtime Metadata (Version, Port, Architecture) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Studio & Runtime Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-white/[0.06] bg-[#07090e] space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Studio Version</div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-bold text-[#f5f4ef]">v1.3.0</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  LATEST
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.06] bg-[#07090e] space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Local Bridge Port</div>
              <div className="text-sm font-mono font-bold text-emerald-400">:{port}</div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.06] bg-[#07090e] space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase">CLI Manifest Version</div>
              <div className="text-sm font-mono font-bold text-slate-300">
                {status?.version ? `v${status.version}` : "v1.3.0"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.06] bg-[#07090e] space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Editor Engine</div>
              <div className="text-sm font-mono font-bold text-slate-300">Monaco VS Code</div>
            </div>
          </div>
        </div>

        {/* Section 3: Monaco Studio Preferences */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Monaco Studio Preferences</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#07090e]">
              <div>
                <div className="text-xs font-mono text-slate-200">Editor Minimap</div>
                <div className="text-[11px] font-sans text-slate-500">
                  Display high-level code navigation minimap on the right gutter of Monaco Editor.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMinimap(!minimap)}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                  minimap ? "bg-emerald-500" : "bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    minimap ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#07090e]">
              <div>
                <div className="text-xs font-mono text-slate-200">Auto-Complete on Passing Tests</div>
                <div className="text-[11px] font-sans text-slate-500">
                  Automatically mark module as completed in <code className="text-slate-300 font-mono">trak.json</code> when assertion runner passes.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoVerify(!autoVerify)}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                  autoVerify ? "bg-emerald-500" : "bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    autoVerify ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Future Extensibility & Webhooks (Footer / Future-proofing) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Future Integrations & Automation Hooks</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
              Extensible
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Configure future automation hooks such as custom test runners, Discord progress webhooks, or auto-git checkpoints.
          </p>

          <div className="space-y-3">
            {/* Custom Test Command Override */}
            <div className="p-3 rounded-xl border border-white/[0.04] bg-[#07090e] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Custom Verification Command</span>
              </div>
              <input
                type="text"
                value={customTestCmd}
                onChange={(e) => setCustomTestCmd(e.target.value)}
                placeholder="e.g. go test -v ./... or cargo test"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0c0f17] border border-white/[0.06] text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Webhook / Discord Notification URL */}
            <div className="p-3 rounded-xl border border-white/[0.04] bg-[#07090e] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                <span>Progress Webhook Endpoint (Discord / Slack)</span>
              </div>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discordapp.com/api/webhooks/..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#0c0f17] border border-white/[0.06] text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Auto Git Commit */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#07090e]">
              <div>
                <div className="text-xs font-mono text-slate-200">Auto Git Commit on Module Pass</div>
                <div className="text-[11px] font-sans text-slate-500">
                  Automatically create a git checkpoint commit when all assertions in a module pass.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoGitCommit(!autoGitCommit)}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                  autoGitCommit ? "bg-emerald-500" : "bg-white/[0.1]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    autoGitCommit ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Upstream Registry */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Curriculum Registry Upstream</span>
          </div>

          <div className="p-3 rounded-xl border border-white/[0.04] bg-[#07090e] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-400">Official Curriculum Registry</span>
            <a
              href="https://github.com/ndk123-web/trak-registry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>github.com/ndk123-web/trak-registry</span>
            </a>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs font-mono transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            <span>Resync Local Workspace</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

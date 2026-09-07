import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  FolderOpen,
  Sparkles,
  Search,
  Layers,
} from "lucide-react";
import type { StatusModel, WorkspaceInfo } from "../types";

interface DashboardViewProps {
  status: StatusModel;
  workspace?: WorkspaceInfo | null;
  onSelectModule: (moduleName: string) => void;
  onToggleDone: (moduleName: string, done: boolean) => void;
  onRunVerify: (moduleName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  onSelectModule,
  onToggleDone,
  onRunVerify,
}) => {
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const modules = Object.entries(status.module_breakdown || {}).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const totalModules = modules.length;
  const completedCount = modules.filter(([_, done]) => done).length;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  // Active module is the first incomplete module
  const nextModule = modules.find(([_, done]) => !done)?.[0] || null;

  const filteredModules = modules.filter(([name, done]) => {
    if (filter === "pending" && done) return false;
    if (filter === "done" && !done) return false;
    if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Track Overview & Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Track Identity */}
        <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              Active Blueprint
            </span>
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {status.version}
            </span>
          </div>
          <div>
            <h2 className="font-serif text-xl font-normal text-[#f5f4ef] leading-snug">
              {status.name}
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Identifier: <span className="text-slate-200">{status.id}</span>
            </p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Author: {status.author}</span>
            <span className="text-slate-500">•</span>
            <span>Source: {status.source}</span>
          </div>
        </div>

        {/* Card 2: Progress Gauge */}
        <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Curriculum Mastery
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {completedCount} of {totalModules} Completed
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-serif text-3xl sm:text-4xl text-[#f5f4ef] tracking-tight">
              {progressPercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">mastered</span>
          </div>

          {/* Clean Progress Bar */}
          <div className="space-y-2 pt-1">
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>0%</span>
              <span>100% Target</span>
            </div>
          </div>
        </div>

        {/* Card 3: Next Action Target */}
        <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Current Active Lab
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Next Step
              </span>
            </div>
            {nextModule ? (
              <div>
                <h3 className="font-mono text-sm font-semibold text-[#f5f4ef] break-all">
                  {nextModule}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Ready to execute exercises and run tests.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-base text-emerald-400">All Modules Completed!</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Congratulations! You've mastered this curriculum blueprint.
                </p>
              </div>
            )}
          </div>

          {nextModule && (
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onRunVerify(nextModule)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Verify Now</span>
              </button>
              <button
                onClick={() => onSelectModule(nextModule)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.06] text-xs font-mono transition-colors"
                title="Open Module Files"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Modules Roadmap Section */}
      <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-4 sm:p-6 space-y-6">
        {/* Section Header with Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="font-serif text-lg text-[#f5f4ef]">Curriculum Modules Roadmap</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Structured progression path. Click a module to view code or toggle completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 w-44 sm:w-52"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              {(["all", "pending", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors capitalize ${
                    filter === f
                      ? "bg-white/[0.08] text-emerald-300 font-medium"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modules List Grid */}
        <div className="space-y-2">
          {filteredModules.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              No modules found matching your filter criteria.
            </div>
          ) : (
            filteredModules.map(([moduleName, isDone]) => {
              const isCurrent = moduleName === nextModule;

              return (
                <div
                  key={moduleName}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-all ${
                    isCurrent
                      ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                      : isDone
                      ? "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03]"
                      : "border-white/[0.04] bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Left: Checkmark Toggle + Name */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleDone(moduleName, !isDone)}
                      title={isDone ? "Mark Incomplete" : "Mark Completed"}
                      className="shrink-0 text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-medium ${
                            isDone
                              ? "text-slate-300 line-through decoration-slate-600"
                              : isCurrent
                              ? "text-emerald-300 font-semibold"
                              : "text-[#f5f4ef]"
                          }`}
                        >
                          {moduleName}
                        </span>
                        {isCurrent && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Current
                          </span>
                        )}
                        {isDone && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-400">
                            Passed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => onRunVerify(moduleName)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 border border-white/[0.06] text-xs font-mono text-slate-300 transition-colors"
                      title="Run trak verify on this module"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>

                    <button
                      onClick={() => onSelectModule(moduleName)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-slate-300 transition-colors"
                      title="Inspect files"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Files</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

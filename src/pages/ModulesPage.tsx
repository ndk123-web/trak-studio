import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import type { StatusModel } from "../types";

interface ModulesPageProps {
  status: StatusModel;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const ModulesPage: React.FC<ModulesPageProps> = ({
  status,
  onToggleDone,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [search, setSearch] = useState("");

  const modules = Object.entries(status.module_breakdown || {}).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const nextModule = modules.find(([_, done]) => !done)?.[0] || null;

  const filtered = modules.filter(([name, done]) => {
    if (filter === "pending" && done) return false;
    if (filter === "done" && !done) return false;
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Curriculum Modules Roadmap
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f4ef]">
            {status.name}
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Complete learning progression with step-by-step milestones.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 w-48"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            {(["all", "pending", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors capitalize ${
                  filter === f
                    ? "bg-white/[0.08] text-emerald-300 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-xs font-mono text-slate-500">
            No modules match your query.
          </div>
        ) : (
          filtered.map(([moduleName, isDone], idx) => {
            const isCurrent = moduleName === nextModule;
            return (
              <div
                key={moduleName}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-sm shadow-emerald-500/5"
                    : isDone
                    ? "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03]"
                    : "border-white/[0.04] bg-[#090b10] hover:border-white/[0.08]"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <button
                    onClick={() => onToggleDone(moduleName, !isDone)}
                    className="mt-0.5 sm:mt-0 text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                    title={isDone ? "Mark Incomplete" : "Mark Passed"}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        Module 0{idx + 1}
                      </span>
                      <span
                        className={`font-mono text-xs font-semibold ${
                          isDone
                            ? "text-slate-400 line-through decoration-slate-600"
                            : isCurrent
                            ? "text-emerald-300 font-bold"
                            : "text-[#f5f4ef]"
                        }`}
                      >
                        {moduleName}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          Active Target
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-emerald-400 font-semibold">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => navigate(`/modules/${encodeURIComponent(moduleName)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-mono transition-colors"
                  >
                    <span>View Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

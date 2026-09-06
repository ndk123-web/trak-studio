import { useNavigate } from "react-router-dom";
import {
  Layers,
  PlayCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Code2,
} from "lucide-react";
import type { StatusModel } from "../types";

interface DashboardPageProps {
  status: StatusModel;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  status,
  onToggleDone,
}) => {
  const navigate = useNavigate();

  const modules = Object.entries(status.module_breakdown || {}).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const totalCount = modules.length;
  const completedCount = modules.filter(([_, done]) => done).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const nextModule = modules.find(([_, done]) => !done)?.[0] || null;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LOCAL WORKSPACE DASHBOARD</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f4ef] tracking-tight">
            {status.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
            Local-first developer learning environment running directly on your machine.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate("/editor")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-mono font-medium transition-colors"
          >
            <Code2 className="w-4 h-4 text-slate-400" />
            <span>Open Monaco Studio</span>
          </button>
          {nextModule && (
            <button
              onClick={() => navigate("/verify")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Verify Next Module</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Track Metadata */}
        <div className="rounded-xl border border-white/[0.08] bg-[#090b10] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Track Specification
            </span>
            <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              v{status.version || "1.0.0"}
            </span>
          </div>

          <div>
            <div className="text-base font-mono font-bold text-[#f5f4ef]">{status.id}</div>
            <div className="text-xs font-mono text-slate-400 mt-1 truncate">
              Source: {status.source}
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] text-xs font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Author:</span>
              <span className="text-slate-200">{status.author || "Trak"}</span>
            </div>
            <div className="flex justify-between">
              <span>Template:</span>
              <span className="text-slate-200">{status.template_version || "1.0.0"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Progress & Completion Gauge */}
        <div className="rounded-xl border border-white/[0.08] bg-[#090b10] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Curriculum Progress
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {completedCount} / {totalCount} Modules
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-[#f5f4ef] tracking-tight">
              {progressPercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">completed</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0%</span>
              <span>100% Target</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Lab Next Step */}
        <div className="rounded-xl border border-white/[0.08] bg-[#090b10] p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                Active Exercise
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                In Progress
              </span>
            </div>

            {nextModule ? (
              <div>
                <h3 className="font-mono text-sm font-semibold text-[#f5f4ef] break-all">
                  {nextModule}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Ready to test with native compilers and unit test suites.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-mono text-base text-emerald-400 font-bold">Track Completed</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  All assertions and exercises have passed successfully.
                </p>
              </div>
            )}
          </div>

          {nextModule && (
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => navigate(`/modules/${encodeURIComponent(nextModule)}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-mono transition-colors"
              >
                <span>Inspect Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch & Recent Modules List */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="font-serif text-lg text-[#f5f4ef]">Modules Overview</h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Top learning steps in this blueprint. Click to jump to full curriculum.
            </p>
          </div>
          <button
            onClick={() => navigate("/modules")}
            className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All {totalCount} Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {modules.slice(0, 6).map(([moduleName, isDone], i) => (
            <div
              key={moduleName}
              className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleDone(moduleName, !isDone)}
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                  title={isDone ? "Mark Incomplete" : "Mark Done"}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-200">
                    <span className="text-slate-500 mr-2">0{i + 1}</span>
                    {moduleName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/modules/${encodeURIComponent(moduleName)}`)}
                  className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] text-xs font-mono text-slate-300 border border-white/[0.06] transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

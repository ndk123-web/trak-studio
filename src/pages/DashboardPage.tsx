import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Check,
  FolderOpen,
  Terminal,
  Search,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FastForward,
  Square,
} from "lucide-react";
import type { StatusModel, VerifyResult } from "../types";
import { runVerify } from "../api";

interface DashboardPageProps {
  status: StatusModel | null;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  status,
  onToggleDone,
}) => {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<"all" | "pending" | "done" | "failed">("all");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeConsoleModule, setActiveConsoleModule] = useState<string>("");
  const [consoleResult, setConsoleResult] = useState<VerifyResult | null>(null);
  const [failedModules, setFailedModules] = useState<Record<string, string>>({});
  const [lastVerifiedMap, setLastVerifiedMap] = useState<Record<string, { passed: boolean; durationMs: number; time: string }>>({});
  const [showConsole, setShowConsole] = useState(false);

  // Batch Run All State
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runAllProgress, setRunAllProgress] = useState<{ current: number; total: number; module: string }>({
    current: 0,
    total: 0,
    module: "",
  });
  const stopRequested = useRef(false);

  // Parse modules from status
  const modules = useMemo(() => {
    if (!status?.module_breakdown) return [];
    return Object.entries(status.module_breakdown).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [status?.module_breakdown]);

  const totalModules = modules.length;
  const completedModules = modules.filter(([, done]) => done);
  const completedCount = completedModules.length;
  const pendingCount = totalModules - completedCount;
  const failedCount = Object.keys(failedModules).length;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const nextModule = useMemo(() => {
    return modules.find(([name, done]) => !done && !failedModules[name])?.[0]
      || modules.find(([_, done]) => !done)?.[0]
      || null;
  }, [modules, failedModules]);

  const lastCompletedModule = useMemo(() => {
    const rev = [...completedModules].reverse();
    return rev[0]?.[0] || null;
  }, [completedModules]);

  useEffect(() => {
    if (!activeConsoleModule && nextModule) {
      setActiveConsoleModule(nextModule);
    }
  }, [nextModule, activeConsoleModule]);

  // Verify a single module
  const handleRunVerification = async (moduleName: string) => {
    if (!moduleName || isVerifying) return;
    setIsVerifying(true);
    setActiveConsoleModule(moduleName);
    setShowConsole(true);

    try {
      const res = await runVerify(moduleName);
      setConsoleResult(res);

      setLastVerifiedMap((prev) => ({
        ...prev,
        [moduleName]: {
          passed: res.passed,
          durationMs: res.durationMs,
          time: new Date().toLocaleTimeString(),
        },
      }));

      if (res.passed) {
        setFailedModules((prev) => {
          const next = { ...prev };
          delete next[moduleName];
          return next;
        });
        if (!status?.module_breakdown?.[moduleName]) {
          onToggleDone(moduleName, true);
        }
      } else {
        setFailedModules((prev) => ({
          ...prev,
          [moduleName]: res.output || "Test failed",
        }));
      }
    } catch (err) {
      const errStr = String(err);
      setConsoleResult({
        module: moduleName,
        passed: false,
        output: `Error: ${errStr}`,
        durationMs: 0,
        timestamp: new Date().toLocaleTimeString(),
      });
      setFailedModules((prev) => ({
        ...prev,
        [moduleName]: errStr,
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  // Run All
  const handleRunAll = async () => {
    if (isRunningAll || isVerifying || modules.length === 0) return;
    setIsRunningAll(true);
    stopRequested.current = false;
    setShowConsole(true);

    for (let i = 0; i < modules.length; i++) {
      if (stopRequested.current) break;
      const [mod] = modules[i];
      setRunAllProgress({ current: i + 1, total: modules.length, module: mod });
      setActiveConsoleModule(mod);

      try {
        const res = await runVerify(mod);
        setConsoleResult(res);
        setLastVerifiedMap((prev) => ({
          ...prev,
          [mod]: {
            passed: res.passed,
            durationMs: res.durationMs,
            time: new Date().toLocaleTimeString(),
          },
        }));

        if (res.passed) {
          setFailedModules((prev) => {
            const next = { ...prev };
            delete next[mod];
            return next;
          });
          if (!status?.module_breakdown?.[mod]) {
            onToggleDone(mod, true);
          }
        } else {
          setFailedModules((prev) => ({
            ...prev,
            [mod]: res.output || "Test failed",
          }));
        }
      } catch (err) {
        setFailedModules((prev) => ({
          ...prev,
          [mod]: String(err),
        }));
      }
    }
    setIsRunningAll(false);
  };

  const handleStopRunAll = () => {
    stopRequested.current = true;
  };

  // Mark Done / Undo
  const handleMarkDone = (moduleName: string) => {
    onToggleDone(moduleName, true);
    setFailedModules((prev) => {
      const next = { ...prev };
      delete next[moduleName];
      return next;
    });
  };

  const handleUndo = () => {
    if (!lastCompletedModule) return;
    onToggleDone(lastCompletedModule, false);
  };

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter(([name, done]) => {
      const isFailed = Boolean(failedModules[name]);
      if (filterState === "pending" && (done || isFailed)) return false;
      if (filterState === "done" && !done) return false;
      if (filterState === "failed" && !isFailed) return false;
      if (searchQuery.trim()) {
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [modules, filterState, searchQuery, failedModules]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 font-mono text-slate-200">
      {/* Header: Track name + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-white truncate">
            {status?.name || status?.id || "Workspace"}
          </h1>
          <div className="text-xs text-slate-400">
            {completedCount}/{totalModules} completed ({progressPercent}%)
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {nextModule && (
            <button
              onClick={() => handleRunVerification(nextModule)}
              disabled={isVerifying || isRunningAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <PlayCircle className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
              <span>{isVerifying ? "Verifying..." : "Verify"}</span>
            </button>
          )}

          {isRunningAll ? (
            <button
              onClick={handleStopRunAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleRunAll}
              disabled={isVerifying || totalModules === 0}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.06] text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run All</span>
            </button>
          )}

          {nextModule && (
            <button
              onClick={() => handleMarkDone(nextModule)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-200 text-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Done</span>
            </button>
          )}

          {lastCompletedModule && (
            <button
              onClick={handleUndo}
              title={`Undo: ${lastCompletedModule}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-amber-300 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Undo</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Progress */}
      {isRunningAll && (
        <div className="bg-[#161c2d] border border-emerald-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-emerald-400 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {runAllProgress.module}
            </span>
            <span className="text-slate-400">
              {runAllProgress.current}/{runAllProgress.total}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-200"
              style={{ width: `${(runAllProgress.current / runAllProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#161c2d] border border-white/[0.06] rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-xl font-bold text-white mt-1">{totalModules}</div>
        </div>
        <div className="bg-[#161c2d] border border-white/[0.06] rounded-lg p-3">
          <div className="text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{completedCount}</div>
        </div>
        <div className="bg-[#161c2d] border border-white/[0.06] rounded-lg p-3">
          <div className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-[#161c2d] border border-white/[0.06] rounded-lg p-3">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Progress</div>
          <div className="text-xl font-bold text-white mt-1">{progressPercent}%</div>
          <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* No Modules Alert */}
      {totalModules === 0 && (
        <div className="bg-[#161c2d] border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs">
            <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">No modules found in this workspace.</span>
            <button
              onClick={() => navigate("/workspaces")}
              className="ml-auto flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <span>Switch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Console Dock */}
      {showConsole && (
        <div className="terminal-window bg-[#0e131f] border border-white/[0.06] rounded-lg overflow-hidden">
          <div className="terminal-header px-3 py-2 bg-[#0b0f19] border-b border-white/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 truncate max-w-sm">
                {activeConsoleModule || "Terminal"}
              </span>
              {consoleResult && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-lg font-bold uppercase ${
                    consoleResult.passed
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {consoleResult.passed ? "PASS" : "FAIL"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeConsoleModule && (
                <button
                  onClick={() => handleRunVerification(activeConsoleModule)}
                  disabled={isVerifying}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin text-emerald-400" : ""}`} />
                  <span>Re-run</span>
                </button>
              )}
              <button
                onClick={() => setShowConsole(false)}
                className="p-2 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="terminal-body p-3 bg-[#0b0f19] text-xs max-h-56 overflow-y-auto">
            {isVerifying ? (
              <div className="flex items-center gap-2 text-slate-400 py-3">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Running tests...</span>
              </div>
            ) : consoleResult ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-white/[0.06] pb-1">
                  <span>{consoleResult.module}</span>
                  <span>{consoleResult.durationMs}ms</span>
                </div>
                <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed select-text font-mono text-xs">
                  {consoleResult.output}
                </pre>
              </div>
            ) : (
              <div className="text-slate-500 py-3 text-center">
                Click Verify to run tests.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module Table */}
      <div className="bg-[#161c2d] border border-white/[0.06] rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 bg-[#0e131f] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-white">Modules</span>
            <span className="text-xs text-slate-500">({filteredModules.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Console Toggle */}
            <button
              onClick={() => setShowConsole((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              {showConsole ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-2 bg-[#07090e] border border-white/[0.06] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 w-36"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center bg-[#07090e] border border-white/[0.06] rounded-lg p-1 text-xs">
              <button
                onClick={() => setFilterState("all")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterState === "all" ? "bg-white/[0.1] text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterState("pending")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterState === "pending" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterState("done")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterState === "done" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Done
              </button>
              {failedCount > 0 && (
                <button
                  onClick={() => setFilterState("failed")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterState === "failed" ? "bg-red-500/20 text-red-300 font-bold" : "text-red-400 hover:text-red-300"
                  }`}
                >
                  Failed
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e131f] border-b border-white/[0.06] text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="py-2 px-3 w-10 text-center">S</th>
                <th className="py-2 px-2 w-10">#</th>
                <th className="py-2 px-3">Module</th>
                <th className="py-2 px-3 w-24">State</th>
                <th className="py-2 px-3 w-28 hidden sm:table-cell">Result</th>
                <th className="py-2 px-3 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No modules match filter.
                  </td>
                </tr>
              ) : (
                filteredModules.map(([name, done], index) => {
                  const isFailed = Boolean(failedModules[name]);
                  const isCurrentNext = name === nextModule;
                  const lastRun = lastVerifiedMap[name];

                  return (
                    <tr
                      key={name}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isCurrentNext ? "bg-emerald-500/[0.03]" : ""
                      }`}
                    >
                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        {isFailed ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" title="Failed" />
                        ) : done ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" title="Passed" />
                        ) : isCurrentNext ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse" title="Next" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" title="Pending" />
                        )}
                      </td>

                      {/* Index */}
                      <td className="py-2 px-2 text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      {/* Name */}
                      <td className="py-2 px-3 text-slate-200">
                        <span
                          onClick={() => handleRunVerification(name)}
                          className="hover:text-emerald-400 cursor-pointer"
                          title="Click to verify"
                        >
                          {name}
                        </span>
                        {isCurrentNext && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold">
                            NEXT
                          </span>
                        )}
                      </td>

                      {/* State */}
                      <td className="py-2 px-3">
                        {isFailed ? (
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-red-500/15 text-red-300 font-bold">Failed</span>
                        ) : done ? (
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold">Passed</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-400">Pending</span>
                        )}
                      </td>

                      {/* Last Result */}
                      <td className="py-2 px-3 text-slate-400 hidden sm:table-cell">
                        {lastRun ? (
                          <span className={lastRun.passed ? "text-emerald-400" : "text-red-400"}>
                            {lastRun.passed ? "PASS" : "FAIL"} {lastRun.durationMs}ms
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRunVerification(name)}
                            title="Verify"
                            className="p-2 rounded-lg hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              const newDone = !done;
                              onToggleDone(name, newDone);
                              if (newDone) {
                                setFailedModules((prev) => {
                                  const next = { ...prev };
                                  delete next[name];
                                  return next;
                                });
                              }
                            }}
                            title={done ? "Mark Incomplete" : "Mark Done"}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              done
                                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => navigate(`/modules/${encodeURIComponent(name)}`)}
                            title="Inspect"
                            className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

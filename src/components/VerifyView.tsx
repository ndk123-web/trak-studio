import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  FastForward,
  Square,
  RefreshCw,
} from "lucide-react";
import type { StatusModel, VerifyResult } from "../types";
import { runVerify } from "../api";

interface VerifyViewProps {
  status: StatusModel;
  defaultModule?: string;
  autoRun?: boolean;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({
  status,
  defaultModule,
  autoRun,
  onToggleDone,
}) => {
  const modules = Object.keys(status.module_breakdown || {}).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const [selectedModule, setSelectedModule] = useState<string>(
    defaultModule || modules[0] || ""
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  // Run All state
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runAllProgress, setRunAllProgress] = useState<{ current: number; total: number; module: string }>({
    current: 0,
    total: modules.length,
    module: "",
  });
  const [runAllLogs, setRunAllLogs] = useState<Array<{ module: string; passed: boolean; durationMs: number; output: string }>>([]);
  const stopRequested = useRef(false);

  useEffect(() => {
    if (defaultModule && modules.includes(defaultModule)) {
      setSelectedModule(defaultModule);
    }
  }, [defaultModule]);

  // Single module verify
  const handleRunVerify = useCallback(async (moduleToRun?: string) => {
    const mod = typeof moduleToRun === "string" ? moduleToRun : selectedModule;
    if (!mod || running || isRunningAll) return;
    setRunning(true);
    setResult(null);

    try {
      const res = await runVerify(mod);
      setResult(res);
      if (res.passed && !status.module_breakdown?.[mod]) {
        onToggleDone(mod, true);
      }
    } catch (err) {
      setResult({
        module: mod,
        passed: false,
        output: `Error executing verification: ${String(err)}`,
        durationMs: 0,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setRunning(false);
    }
  }, [selectedModule, running, isRunningAll, status.module_breakdown, onToggleDone]);

  // Run All modules sequentially
  const handleRunAll = async () => {
    if (isRunningAll || running || modules.length === 0) return;
    setIsRunningAll(true);
    stopRequested.current = false;
    setRunAllLogs([]);
    setResult(null);

    const logs: Array<{ module: string; passed: boolean; durationMs: number; output: string }> = [];

    for (let i = 0; i < modules.length; i++) {
      if (stopRequested.current) break;
      const mod = modules[i];
      setRunAllProgress({ current: i + 1, total: modules.length, module: mod });
      setSelectedModule(mod);

      try {
        const res = await runVerify(mod);
        logs.push({
          module: mod,
          passed: res.passed,
          durationMs: res.durationMs,
          output: res.output,
        });
        setRunAllLogs([...logs]);
        setResult(res);

        if (res.passed && !status.module_breakdown?.[mod]) {
          onToggleDone(mod, true);
        }
      } catch (err) {
        logs.push({
          module: mod,
          passed: false,
          durationMs: 0,
          output: String(err),
        });
        setRunAllLogs([...logs]);
      }
    }

    setIsRunningAll(false);
  };

  const handleStopRunAll = () => {
    stopRequested.current = true;
  };

  useEffect(() => {
    if (autoRun) {
      const mod = defaultModule || selectedModule;
      if (mod) {
        handleRunVerify(mod);
      }
    }
  }, []);

  const passedCount = runAllLogs.filter((l) => l.passed).length;
  const failedCount = runAllLogs.filter((l) => !l.passed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 font-mono text-slate-200">
      {/* Top Controls Bar */}
      <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" />
              Test Runner
            </span>
            <span className="text-xs text-slate-400">
              {status.id} • {modules.length} Modules
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Module Assertion & Verification Runner</h2>
          <p className="text-xs text-slate-400">
            Executes native test suites and compilers on your local machine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Module Selector */}
          <select
            value={selectedModule}
            disabled={running || isRunningAll}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setResult(null);
            }}
            className="px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.06] text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50 cursor-pointer"
          >
            {modules.map((m) => {
              const isDone = !!status.module_breakdown?.[m];
              return (
                <option key={m} value={m} className="bg-[#161c2d] text-slate-200">
                  [{isDone ? "PASSED" : "PENDING"}] {m}
                </option>
              );
            })}
          </select>

          {/* Action Button: Run Test */}
          <button
            onClick={() => handleRunVerify()}
            disabled={running || isRunningAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <PlayCircle className={`w-3.5 h-3.5 ${running ? "animate-spin" : ""}`} />
            <span>{running ? "Testing..." : "Run Test"}</span>
          </button>

          {/* Action Button: Run All Modules */}
          {isRunningAll ? (
            <button
              onClick={handleStopRunAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Run All</span>
            </button>
          ) : (
            <button
              onClick={handleRunAll}
              disabled={running || modules.length === 0}
              title="Execute test runner on all curriculum modules sequentially"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.06] text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run All ({modules.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Run All Progress Bar if Active */}
      {isRunningAll && (
        <div className="bg-[#161c2d] border border-emerald-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Running Test Suite: {runAllProgress.module}
            </span>
            <span className="text-slate-400">
              Module {runAllProgress.current} of {runAllProgress.total} ({Math.round((runAllProgress.current / runAllProgress.total) * 100)}%)
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

      {/* Batch Results Strip if Run All was executed */}
      {runAllLogs.length > 0 && (
        <div className="bg-[#161c2d] border border-white/[0.06] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-white/[0.06]">
            <span className="font-bold text-white">Batch Test Results</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{passedCount} Passed</span>
              <span className="text-slate-600">•</span>
              <span className={failedCount > 0 ? "text-red-400 font-bold" : "text-slate-500"}>
                {failedCount} Failed
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Total {runAllLogs.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-36 overflow-y-auto">
            {runAllLogs.map((log) => (
              <div
                key={log.module}
                onClick={() => {
                  setSelectedModule(log.module);
                  setResult({
                    module: log.module,
                    passed: log.passed,
                    output: log.output,
                    durationMs: log.durationMs,
                    timestamp: new Date().toLocaleTimeString(),
                  });
                }}
                className={`p-2 rounded-lg border text-xs truncate cursor-pointer transition-colors ${
                  log.passed
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40"
                    : "bg-red-500/10 border-red-500/20 text-red-300 hover:border-red-500/40"
                }`}
                title={`${log.module} - ${log.passed ? "PASS" : "FAIL"} (${log.durationMs}ms)`}
              >
                <div className="flex items-center gap-2 truncate">
                  {log.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className="truncate">{log.module.split("-").slice(1).join("-") || log.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Output Console */}
      <div className="terminal-window rounded-lg border border-white/[0.06] bg-[#07090e] overflow-hidden">
        {/* Terminal Header */}
        <div className="terminal-header px-4 py-2 bg-[#0b0f19] border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="text-xs text-slate-400 ml-2">
              trak verify {selectedModule}
            </span>
          </div>

          {result && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {result.durationMs}ms
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-xs uppercase font-bold ${
                  result.passed
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/15 text-red-400 border border-red-500/30"
                }`}
              >
                {result.passed ? "PASSED" : "FAILED"}
              </span>
            </div>
          )}
        </div>

        {/* Terminal Body */}
        <div className="terminal-body p-5 text-xs text-slate-100 min-h-[280px] max-h-[500px] overflow-y-auto leading-relaxed bg-[#0b0f19]">
          {running ? (
            <div className="flex items-center gap-2 text-slate-400 py-6">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Spawning test runner process and compiling assertions...</span>
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="text-slate-500 text-xs">
                $ trak verify {result.module} [{result.timestamp}]
              </div>
              <pre
                className={`whitespace-pre font-mono text-xs leading-relaxed select-text ${
                  result.passed ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {result.output}
              </pre>
              {result.passed && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Assertions passed! Module marked as completed in trak.json.</span>
                  </span>
                  <button
                    onClick={() => onToggleDone(selectedModule, false)}
                    className="text-xs text-slate-400 hover:text-white underline ml-4 cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-600 flex flex-col items-center justify-center py-16 space-y-2">
              <Terminal className="w-8 h-8 text-slate-700" />
              <p>Ready to execute test suites.</p>
              <p className="text-xs text-slate-600">
                Click "Run Test" or "Run All" above to invoke local verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

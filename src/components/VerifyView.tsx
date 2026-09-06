import React, { useState } from "react";
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  Terminal,
} from "lucide-react";
import type { StatusModel, VerifyResult } from "../types";
import { runVerify } from "../api";

interface VerifyViewProps {
  status: StatusModel;
  defaultModule?: string;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({
  status,
  defaultModule,
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

  const isCurrentDone = !!status.module_breakdown?.[selectedModule];

  const handleRunVerify = async () => {
    if (!selectedModule) return;
    setRunning(true);
    setResult(null);

    try {
      const res = await runVerify(selectedModule);
      setResult(res);
      if (res.passed && !isCurrentDone) {
        onToggleDone(selectedModule, true);
      }
    } catch (err) {
      setResult({
        module: selectedModule,
        passed: false,
        output: `Error executing verification: ${String(err)}`,
        durationMs: 0,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Controls Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#090b10] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            Module Assertion Runner
          </span>
          <h2 className="font-serif text-xl text-[#f5f4ef]">Verify Module Logic</h2>
          <p className="text-xs text-slate-400 font-sans">
            Executes native test suites and compilers on your local machine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Module Selector */}
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setResult(null);
            }}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500/50"
          >
            {modules.map((m) => (
              <option key={m} value={m} className="bg-[#090b10] text-slate-200">
                {status.module_breakdown?.[m] ? "✓ " : "○ "} {m}
              </option>
            ))}
          </select>

          {/* Action Button */}
          <button
            onClick={handleRunVerify}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <PlayCircle className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
            <span>{running ? "Verifying..." : "Run Test"}</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Console */}
      <div className="rounded-xl border border-white/[0.08] bg-[#07090e] overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-[#0c0f17] border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="text-xs font-mono text-slate-400 ml-2">
              trak verify {selectedModule}
            </span>
          </div>

          {result && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.durationMs}ms
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  result.passed
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}
              >
                {result.passed ? "PASSED" : "FAILED"}
              </span>
            </div>
          )}
        </div>

        {/* Terminal Body */}
        <div className="p-5 font-mono text-xs text-slate-300 min-h-[300px] max-h-[500px] overflow-y-auto leading-relaxed bg-[#07090e]">
          {running ? (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Spawning test runner process and compiling assertions...</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="text-slate-500">
                $ trak verify {result.module} [{result.timestamp}]
              </div>
              <pre
                className={`whitespace-pre font-mono ${
                  result.passed ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {result.output}
              </pre>
              {result.passed && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    All assertions passed cleanly! Module marked as completed in trak.json.
                  </span>
                  <button
                    onClick={() => onToggleDone(selectedModule, false)}
                    className="text-[11px] text-slate-400 hover:text-white underline font-mono ml-4"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-600 flex flex-col items-center justify-center py-16 space-y-2">
              <Terminal className="w-8 h-8 text-slate-700" />
              <p>Ready to run test suites.</p>
              <p className="text-[11px] text-slate-600">
                Click "Run Test" above to invoke local verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

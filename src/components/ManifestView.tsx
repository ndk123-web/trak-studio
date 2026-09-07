import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { FileJson, Copy, Check, Eye, Code, Search } from "lucide-react";
import type { StatusModel } from "../types";

interface ManifestViewProps {
  status: StatusModel;
}

export const ManifestView: React.FC<ManifestViewProps> = ({ status }) => {
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
  const [copied, setCopied] = useState(false);
  const [moduleSearch, setModuleSearch] = useState("");

  const rawJson = JSON.stringify(status, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modules = Object.entries(status.module_breakdown || {}).filter(([name]) =>
    moduleSearch ? name.toLowerCase().includes(moduleSearch.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Provenance & State Manifest
          </span>
          <h1 className="font-serif text-2xl text-[#f5f4ef] mt-1">trak.json Inspector</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Deterministic blueprint state, module completion records, and track metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => setViewMode("visual")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "visual"
                  ? "bg-white/[0.1] text-emerald-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Matrix</span>
            </button>
            <button
              onClick={() => setViewMode("json")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "json"
                  ? "bg-white/[0.1] text-emerald-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Monaco JSON</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-200 text-xs font-mono transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      {viewMode === "visual" ? (
        <div className="space-y-6">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-white/[0.06] pb-2">
                Core Track Identity
              </h3>
              <dl className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Track Identifier:</dt>
                  <dd className="text-emerald-400 font-bold">{status.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Curriculum Name:</dt>
                  <dd className="text-slate-200 text-right max-w-xs">{status.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Template Version:</dt>
                  <dd className="text-slate-200 font-bold">{status.template_version}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">CLI Binary Version:</dt>
                  <dd className="text-slate-200">{status.version}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-white/[0.06] pb-2">
                GitOps Provenance
              </h3>
              <dl className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Author:</dt>
                  <dd className="text-slate-200">{status.author}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Source Blueprint:</dt>
                  <dd className="text-slate-200">{status.source}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Created At:</dt>
                  <dd className="text-slate-200">{status.created_at}</dd>
                </div>
                {status.repository && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Registry Repo:</dt>
                    <dd className="text-emerald-400 truncate max-w-[200px]">
                      {status.repository}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Modules Table with Search */}
          <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Module Breakdown Matrix ({Object.keys(status.module_breakdown || {}).length} Total Modules)
              </h3>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter modules..."
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.06] text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 w-44"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {modules.map(([key, isDone], i) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs font-mono hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-slate-300">
                    <span className="text-slate-500 mr-2">0{i + 1}</span>
                    {key}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      isDone
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.04] text-slate-500"
                    }`}
                  >
                    {isDone ? "COMPLETED" : "INCOMPLETE"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Full Monaco JSON Inspector */
        <div className="rounded-lg border border-white/[0.06] bg-[#07090e] overflow-hidden h-[550px]">
          <Editor
            height="100%"
            path="trak.json"
            language="json"
            value={rawJson}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
              fontSize: 13,
              lineHeight: 20,
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderLineHighlight: "all",
            }}
          />
        </div>
      )}
    </div>
  );
};

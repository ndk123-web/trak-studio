import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MarkdownViewer } from "../components/MarkdownViewer";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Code2,
  FileText,
  Eye,
  Code,
  Copy,
  Check,
} from "lucide-react";
import type { StatusModel, FileContent } from "../types";
import { fetchFileContent } from "../api";

interface ModuleDetailPageProps {
  status: StatusModel;
  onToggleDone: (moduleName: string, done: boolean) => void;
}

export const ModuleDetailPage: React.FC<ModuleDetailPageProps> = ({
  status,
  onToggleDone,
}) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const decodedModule = moduleId ? decodeURIComponent(moduleId) : "";

  const [readme, setReadme] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<"rendered" | "raw">("rendered");
  const [copied, setCopied] = useState(false);

  const isDone = !!status.module_breakdown?.[decodedModule];

  useEffect(() => {
    if (!decodedModule) return;
    let active = true;
    setLoading(true);

    fetchFileContent(`${decodedModule}/README.md`).then((data) => {
      if (active) {
        setReadme(data);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [decodedModule]);

  const handleCopy = () => {
    if (readme?.content) {
      navigator.clipboard.writeText(readme.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!decodedModule) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-500">
        Module not found.
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumbs & Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/modules")}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Modules</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleDone(decodedModule, !isDone)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
              isDone
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]"
            }`}
          >
            {isDone ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Marked as Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5 text-slate-500" />
                <span>Mark Complete</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Module Title Header Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Module Curriculum Blueprint
            </span>
            <h1 className="font-mono text-xl sm:text-2xl text-[#f5f4ef] font-bold break-all">
              {decodedModule}
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Part of <span className="text-slate-200">{status.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/editor")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-mono transition-colors"
            >
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>Open in Monaco Studio</span>
            </button>
            <button
              onClick={() => navigate("/verify")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-colors shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Run Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module Instructions & README Preview with Toggle */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090b10] overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-white/[0.06] bg-[#0c0f17] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{decodedModule}/README.md</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-mono">
              <button
                onClick={() => setPreviewMode("rendered")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  previewMode === "rendered"
                    ? "bg-white/[0.1] text-emerald-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Rendered</span>
              </button>
              <button
                onClick={() => setPreviewMode("raw")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  previewMode === "raw"
                    ? "bg-white/[0.1] text-emerald-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Raw</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
              title="Copy Readme text"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="p-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#07090e]">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              Loading module instructions...
            </div>
          ) : readme ? (
            previewMode === "rendered" ? (
              <MarkdownViewer content={readme.content} />
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-xs text-emerald-300 selection:bg-emerald-500/30">
                {readme.content}
              </pre>
            )
          ) : (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No README.md found for this module.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

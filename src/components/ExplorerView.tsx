import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Search,
} from "lucide-react";
import type { FileContent, FileNode } from "../types";
import { fetchFileContent } from "../api";

interface ExplorerViewProps {
  tree: FileNode[];
  initialSelectedPath?: string;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  tree,
  initialSelectedPath,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>(
    initialSelectedPath || "README.md"
  );
  const [fileData, setFileData] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "00-setup-and-prerequisites": true,
    "01-runtime-and-escape-analysis": false,
  });
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (initialSelectedPath) {
      setSelectedFile(initialSelectedPath);
    }
  }, [initialSelectedPath]);

  useEffect(() => {
    if (!selectedFile) return;
    let active = true;
    setLoading(true);
    fetchFileContent(selectedFile).then((data) => {
      if (active) {
        setFileData(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [selectedFile]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopy = () => {
    if (fileData?.content) {
      navigator.clipboard.writeText(fileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".json")) return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
    if (fileName.endsWith(".md")) return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
    return <FileCode className="w-3.5 h-3.5 text-slate-300" />;
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes
      .filter((node) => {
        if (!searchFilter) return true;
        return node.path.toLowerCase().includes(searchFilter.toLowerCase());
      })
      .map((node) => {
        if (node.isDir) {
          const isExpanded = !!expandedFolders[node.path];
          return (
            <div key={node.path}>
              <button
                onClick={() => toggleFolder(node.path)}
                className="w-full flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/[0.04] text-xs font-mono text-slate-300 transition-colors text-left group"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
              </button>
              {isExpanded && node.children && (
                <div>{renderTree(node.children, depth + 1)}</div>
              )}
            </div>
          );
        }

        const isSelected = selectedFile === node.path;
        return (
          <button
            key={node.path}
            onClick={() => setSelectedFile(node.path)}
            className={`w-full flex items-center gap-2 py-1 px-2 rounded text-xs font-mono transition-colors text-left truncate ${
              isSelected
                ? "bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-400 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
            }`}
            style={{ paddingLeft: `${depth * 12 + 20}px` }}
          >
            {getFileIcon(node.name)}
            <span className="truncate">{node.name}</span>
          </button>
        );
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-xl border border-white/[0.08] bg-[#090b10] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] max-h-[750px]">
        {/* Left Pane: Workspace File Tree */}
        <div className="md:col-span-4 border-r border-white/[0.08] bg-[#07090e] flex flex-col">
          {/* Header & Filter */}
          <div className="p-3 border-b border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider font-semibold text-slate-300">
                Workspace Tree
              </span>
              <span className="text-[11px] text-slate-500">Local Files</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>

          {/* Tree Scroll Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {renderTree(tree)}
          </div>
        </div>

        {/* Right Pane: Code Previewer */}
        <div className="md:col-span-8 flex flex-col bg-[#090b10]">
          {/* File Header Bar */}
          <div className="p-3 border-b border-white/[0.06] flex items-center justify-between gap-4 bg-white/[0.01]">
            <div className="flex items-center gap-2 truncate">
              {getFileIcon(selectedFile)}
              <span className="text-xs font-mono text-slate-200 font-medium truncate">
                {selectedFile}
              </span>
              {fileData && (
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  ({fileData.size} bytes)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-xs font-mono transition-colors"
                title="Copy File Content"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#090b10]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                Loading file contents...
              </div>
            ) : fileData ? (
              <pre className="overflow-x-auto whitespace-pre font-mono selection:bg-emerald-500/30">
                {fileData.content}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select a file from the explorer to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

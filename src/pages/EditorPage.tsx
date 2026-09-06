import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { MarkdownViewer } from "../components/MarkdownViewer";
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
  PanelLeftClose,
  PanelLeft,
  PlayCircle,
  FilePlus,
  FolderPlus,
  Trash2,
  Columns,
  Eye,
  Code,
  Save,
  X,
} from "lucide-react";
import type { FileNode } from "../types";
import { fetchFileContent } from "../api";
import { useNavigate } from "react-router-dom";

interface EditorPageProps {
  tree: FileNode[];
}

export const EditorPage: React.FC<EditorPageProps> = ({ tree: initialTree }) => {
  const navigate = useNavigate();
  const [tree, setTree] = useState<FileNode[]>(initialTree);
  const [selectedFile, setSelectedFile] = useState<string>("00-setup-and-prerequisites/README.md");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Slidable & Resizable editor sidebar width state
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const savedWidth = localStorage.getItem("trak_editor_sidebar_width");
    return savedWidth ? parseInt(savedWidth, 10) : 256;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const [searchFilter, setSearchFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"code" | "preview" | "split">("code");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "00-setup-and-prerequisites": true,
    "01-runtime-and-escape-analysis": true,
  });

  // Resizable drag handle logic for editor explorer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !containerRef.current) return;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const calculatedWidth = e.clientX - containerLeft;
      const clampedWidth = Math.max(160, Math.min(560, calculatedWidth));
      setSidebarWidth(clampedWidth);
      localStorage.setItem("trak_editor_sidebar_width", String(clampedWidth));
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Slidable Split View Ratio state (Code vs Markdown Preview)
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    const savedRatio = localStorage.getItem("trak_editor_split_ratio");
    return savedRatio ? parseFloat(savedRatio) : 50;
  });
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isSplitResizing = useRef(false);

  // Split view drag resize handler
  useEffect(() => {
    const handleSplitMouseMove = (e: MouseEvent) => {
      if (!isSplitResizing.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newRatio = (offsetX / rect.width) * 100;
      const clampedRatio = Math.max(20, Math.min(80, newRatio));
      setSplitRatio(clampedRatio);
      localStorage.setItem("trak_editor_split_ratio", clampedRatio.toFixed(1));
    };

    const handleSplitMouseUp = () => {
      if (isSplitResizing.current) {
        isSplitResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleSplitMouseMove);
    window.addEventListener("mouseup", handleSplitMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleSplitMouseMove);
      window.removeEventListener("mouseup", handleSplitMouseUp);
    };
  }, []);

  const startSplitResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isSplitResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Dialogs for creating new file/folder
  const [newDialog, setNewDialog] = useState<"file" | "folder" | null>(null);
  const [newItemName, setNewItemName] = useState<string>("");
  const [selectedFolderForNew, setSelectedFolderForNew] = useState<string>("");

  useEffect(() => {
    setTree(initialTree);
  }, [initialTree]);

  useEffect(() => {
    if (!selectedFile) return;
    let active = true;
    setLoading(true);
    fetchFileContent(selectedFile).then((data) => {
      if (active) {
        setCode(data.content);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [selectedFile]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, selectedFile]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const trimmed = newItemName.trim();
    const fullPath = selectedFolderForNew ? `${selectedFolderForNew}/${trimmed}` : trimmed;

    if (newDialog === "file") {
      const newFileNode: FileNode = {
        name: trimmed.split("/").pop() || trimmed,
        path: fullPath,
        isDir: false,
        size: 0,
      };

      setTree((prev) => [...prev, newFileNode]);
      setSelectedFile(fullPath);
      setCode(`// ${fullPath}\n\n`);
    } else if (newDialog === "folder") {
      const newFolderNode: FileNode = {
        name: trimmed,
        path: fullPath,
        isDir: true,
        children: [],
      };
      setTree((prev) => [...prev, newFolderNode]);
      setExpandedFolders((prev) => ({ ...prev, [fullPath]: true }));
    }

    setNewItemName("");
    setNewDialog(null);
  };

  const handleDeleteItem = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete '${path}'?`)) {
      setTree((prev) => prev.filter((item) => item.path !== path));
      if (selectedFile === path) {
        setSelectedFile("README.md");
      }
    }
  };

  const isMarkdown = selectedFile.toLowerCase().endsWith(".md");

  const getLanguage = (path: string): string => {
    if (path.endsWith(".go")) return "go";
    if (path.endsWith(".rs")) return "rust";
    if (path.endsWith(".py")) return "python";
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".md")) return "markdown";
    if (path.endsWith(".c") || path.endsWith(".h")) return "c";
    if (path.endsWith(".cpp") || path.endsWith(".hpp")) return "cpp";
    if (path.endsWith(".sh") || path.endsWith(".bash")) return "shell";
    if (path.endsWith(".yml") || path.endsWith(".yaml")) return "yaml";
    if (path.endsWith(".sql")) return "sql";
    return "plaintext";
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
              <div
                onClick={() => toggleFolder(node.path)}
                className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-white/[0.04] text-xs font-mono text-slate-300 transition-colors cursor-pointer group"
                style={{ paddingLeft: `${depth * 12 + 6}px` }}
              >
                <div className="flex items-center gap-1.5 truncate">
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
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFolderForNew(node.path);
                    setNewDialog("file");
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white transition-opacity"
                  title="Add file inside this folder"
                >
                  <FilePlus className="w-3 h-3 text-slate-400 hover:text-emerald-400" />
                </button>
              </div>
              {isExpanded && node.children && (
                <div>{renderTree(node.children, depth + 1)}</div>
              )}
            </div>
          );
        }

        const isSelected = selectedFile === node.path;
        return (
          <div
            key={node.path}
            onClick={() => setSelectedFile(node.path)}
            className={`w-full flex items-center justify-between py-1 px-2 rounded text-xs font-mono transition-colors cursor-pointer group truncate ${
              isSelected
                ? "bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-400 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
            }`}
            style={{ paddingLeft: `${depth * 12 + 18}px` }}
          >
            <div className="flex items-center gap-2 truncate">
              {getFileIcon(node.name)}
              <span className="truncate">{node.name}</span>
            </div>

            <button
              onClick={(e) => handleDeleteItem(node.path, e)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition-opacity shrink-0"
              title="Delete file"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      });
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#07090e] overflow-hidden select-none">
      {/* 1. Top Editor Toolbar */}
      <div className="h-11 border-b border-white/[0.08] bg-[#090b10] flex items-center justify-between px-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse Files (Ctrl+B)" : "Expand Files (Ctrl+B)"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-emerald-400" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>

          {/* Active File Tab */}
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#07090e] border border-white/[0.08] text-xs font-mono text-slate-200 truncate">
            {getFileIcon(selectedFile)}
            <span className="truncate max-w-[220px]">{selectedFile}</span>
            <span className="text-[10px] font-mono text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 uppercase">
              {getLanguage(selectedFile)}
            </span>
          </div>

          {/* Markdown View Toggle (Code / Preview / Split) */}
          {isMarkdown && (
            <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-mono">
              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  viewMode === "code"
                    ? "bg-white/[0.1] text-emerald-300 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Edit Source Code"
              >
                <Code className="w-3 h-3" />
                <span>Code</span>
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  viewMode === "preview"
                    ? "bg-white/[0.1] text-emerald-300 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Markdown Preview"
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  viewMode === "split"
                    ? "bg-white/[0.1] text-emerald-300 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Split Code & Preview"
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-mono transition-colors"
            title="Save Buffer (Ctrl+S)"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-400" />
                <span>Save</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/verify")}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-colors"
            title="Run Verify Test"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verify</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-xs font-mono transition-colors"
            title="Copy Buffer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Workspace Split: Tree + Editor / Preview */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Explorer Drawer (Slidable / Resizable) */}
        {sidebarOpen && (
          <div
            style={{ width: `${sidebarWidth}px` }}
            className="border-r border-white/[0.08] bg-[#07090e] flex flex-col shrink-0 relative transition-[width] duration-75 ease-out select-none"
          >
            {/* File Actions Header: + File, + Folder */}
            <div className="p-2 border-b border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-300 text-[10px]">
                  Explorer
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedFolderForNew("");
                      setNewDialog("file");
                    }}
                    className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-emerald-400 transition-colors"
                    title="New File"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFolderForNew("");
                      setNewDialog("folder");
                    }}
                    className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-emerald-400 transition-colors"
                    title="New Folder"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Search */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40"
                />
              </div>
            </div>

            {/* Tree Items */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {renderTree(tree)}
            </div>

            {/* Slidable Resize Drag Handle */}
            <div
              onMouseDown={startResizing}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/40 active:bg-emerald-500 transition-colors z-20 group"
              title="Drag to resize explorer"
            >
              <div className="w-full h-full group-hover:bg-emerald-500/50" />
            </div>
          </div>
        )}

        {/* Center / Right: Monaco Editor or Markdown Preview */}
        <div className="flex-1 flex flex-col bg-[#090b10] min-w-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center font-mono text-xs text-slate-500">
              Loading buffer in Monaco Editor...
            </div>
          ) : (
            <div ref={splitContainerRef} className="flex-1 flex overflow-hidden relative">
              {/* Code Editor Pane */}
              {(!isMarkdown || viewMode === "code" || viewMode === "split") && (
                <div
                  style={
                    isMarkdown && viewMode === "split"
                      ? { width: `${splitRatio}%` }
                      : { width: "100%" }
                  }
                  className="h-full flex flex-col shrink-0 min-w-0"
                >
                  <Editor
                    height="100%"
                    path={selectedFile}
                    language={getLanguage(selectedFile)}
                    value={code}
                    theme="vs-dark"
                    onChange={(val) => setCode(val || "")}
                    options={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace",
                      fontSize: 13,
                      lineHeight: 20,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      renderLineHighlight: "all",
                      cursorBlinking: "smooth",
                      smoothScrolling: true,
                      tabSize: 2,
                      bracketPairColorization: { enabled: true },
                    }}
                  />
                </div>
              )}

              {/* Slidable Split Divider Handle */}
              {isMarkdown && viewMode === "split" && (
                <div
                  onMouseDown={startSplitResizing}
                  className="w-1.5 hover:w-2 bg-white/[0.08] hover:bg-emerald-500/50 active:bg-emerald-500 cursor-col-resize transition-all shrink-0 z-20 relative group flex items-center justify-center select-none"
                  title="Drag to resize code / preview ratio"
                >
                  <div className="w-0.5 h-8 rounded-full bg-slate-500 group-hover:bg-emerald-300 transition-colors" />
                </div>
              )}

              {/* Rendered Markdown Preview Pane */}
              {isMarkdown && (viewMode === "preview" || viewMode === "split") && (
                <div
                  style={
                    viewMode === "split"
                      ? { width: `${100 - splitRatio}%` }
                      : { width: "100%" }
                  }
                  className="h-full overflow-y-auto p-6 sm:p-8 bg-[#07090e] shrink-0 min-w-0"
                >
                  <div className="max-w-4xl mx-auto">
                    <MarkdownViewer content={code} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monaco Bottom Status Bar */}
          <div className="h-6 border-t border-white/[0.06] bg-[#07090e] px-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span>{selectedFile}</span>
              <span>•</span>
              <span className="text-emerald-400">Monaco Engine</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{code.split("\n").length} Lines</span>
              <span>•</span>
              <span>UTF-8</span>
              <span>•</span>
              <span className="uppercase text-slate-300">{getLanguage(selectedFile)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* New File / Folder Modal Dialog */}
      {newDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-xl border border-white/[0.1] bg-[#090b10] p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-semibold text-[#f5f4ef]">
                Create New {newDialog === "file" ? "File" : "Folder"}
              </h3>
              <button
                onClick={() => setNewDialog(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedFolderForNew && (
              <div className="text-[11px] font-mono text-slate-400">
                Inside: <code className="text-emerald-400">{selectedFolderForNew}/</code>
              </div>
            )}

            <form onSubmit={handleCreateItem} className="space-y-3">
              <input
                autoFocus
                type="text"
                placeholder={newDialog === "file" ? "e.g. exercise.go or notes.md" : "e.g. exercises"}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.1] text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewDialog(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-colors disabled:opacity-50"
                >
                  Create {newDialog === "file" ? "File" : "Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

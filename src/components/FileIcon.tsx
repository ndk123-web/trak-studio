import React from "react";
import { getClassWithColor, getClass } from "file-icons-js";
import {
  FileCode,
  FileText,
  FileJson,
  Terminal,
} from "lucide-react";

export interface FileIconProps {
  filename: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  filename,
  className = "w-3.5 h-3.5",
}) => {
  const cleanName = filename.split(/[/\\]/).pop() || filename;

  let iconClass: string | null = null;
  try {
    iconClass = getClassWithColor(cleanName) || getClass(cleanName);
  } catch {
    iconClass = null;
  }

  if (iconClass) {
    return (
      <span
        className={`${iconClass} inline-flex items-center justify-center text-sm shrink-0 leading-none select-none`}
        aria-hidden="true"
        style={{ minWidth: "16px", minHeight: "16px" }}
      />
    );
  }

  // Graceful fallback if file-icons-js font / regex misses
  const lower = cleanName.toLowerCase();
  if (lower.endsWith(".json")) {
    return <FileJson className={`${className} text-amber-400 shrink-0`} />;
  }
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return <FileText className={`${className} text-emerald-400 shrink-0`} />;
  }
  if (lower.endsWith(".sh") || lower.endsWith(".bash") || lower.endsWith(".zsh")) {
    return <Terminal className={`${className} text-emerald-400 shrink-0`} />;
  }
  if (lower.endsWith(".go")) {
    return <FileCode className={`${className} text-cyan-400 shrink-0`} />;
  }
  if (lower.endsWith(".py")) {
    return <FileCode className={`${className} text-yellow-400 shrink-0`} />;
  }
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    return <FileCode className={`${className} text-blue-400 shrink-0`} />;
  }
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) {
    return <FileCode className={`${className} text-yellow-300 shrink-0`} />;
  }
  if (lower.endsWith(".rs")) {
    return <FileCode className={`${className} text-orange-400 shrink-0`} />;
  }
  if (lower.endsWith(".c") || lower.endsWith(".h")) {
    return <FileCode className={`${className} text-blue-500 shrink-0`} />;
  }
  if (lower.endsWith(".cpp") || lower.endsWith(".hpp") || lower.endsWith(".cc")) {
    return <FileCode className={`${className} text-blue-400 shrink-0`} />;
  }

  return (
    <span
      className="icon text-icon inline-flex items-center justify-center text-sm shrink-0 leading-none text-slate-400 select-none"
      aria-hidden="true"
      style={{ minWidth: "16px", minHeight: "16px" }}
    />
  );
};

export const FileIconSvg = FileIcon;
export default FileIcon;

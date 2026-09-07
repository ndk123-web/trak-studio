import React, { useState } from "react";
import {
  BookOpen,
  Terminal,
  Layers,
  Sliders,
  Copy,
  Check,
  Database,
  Cloud,
  Wrench,
  Monitor,
  Code2,
} from "lucide-react";

interface CliCommand {
  name: string;
  summary: string;
  usage: string;
  examples: string[];
  flags?: { flag: string; desc: string }[];
  category: "core" | "progress" | "utility";
}

const COMMANDS: CliCommand[] = [
  {
    name: "list",
    summary: "List all available learning templates in a structured catalog",
    usage: "trak list [category]",
    examples: [
      "trak list",
      "trak list lang",
      "trak list db",
      "trak list os",
      "trak list cloud",
      "trak list tool",
    ],
    flags: [{ flag: "-h, --help", desc: "help for list" }],
    category: "core",
  },
  {
    name: "init",
    summary: "Initialize a hands-on learning workspace from the registry",
    usage: "trak init <category/track> [--path <dir>]",
    examples: [
      "trak init lang/go",
      "trak init db/postgres",
      "trak init tool/docker --path ./my-docker-lab",
    ],
    flags: [
      { flag: "--path <string>", desc: "Target directory path to clone workspace" },
      { flag: "-h, --help", desc: "help for init" },
    ],
    category: "core",
  },
  {
    name: "verify",
    summary: "Run automated tests to verify your exercise implementation",
    usage: "trak verify [module-name]",
    examples: [
      "trak verify",
      "trak verify 00-setup-toolchain-and-first-program",
    ],
    flags: [{ flag: "-h, --help", desc: "help for verify" }],
    category: "progress",
  },
  {
    name: "status",
    summary: "Display workspace progress, active track details, and module status",
    usage: "trak status",
    examples: ["trak status"],
    flags: [{ flag: "-h, --help", desc: "help for status" }],
    category: "progress",
  },
  {
    name: "next",
    summary: "Discover and jump directly to your next pending curriculum exercise",
    usage: "trak next",
    examples: ["trak next"],
    flags: [{ flag: "-h, --help", desc: "help for next" }],
    category: "progress",
  },
  {
    name: "done",
    summary: "Mark a curriculum module as completed",
    usage: "trak done <module-name>",
    examples: ["trak done 00-setup-toolchain-and-first-program"],
    flags: [{ flag: "-h, --help", desc: "help for done" }],
    category: "progress",
  },
  {
    name: "undo",
    summary: "Reset or unmark a curriculum module back to pending",
    usage: "trak undo <module-name>",
    examples: ["trak undo 00-setup-toolchain-and-first-program"],
    flags: [{ flag: "-h, --help", desc: "help for undo" }],
    category: "progress",
  },
  {
    name: "studio",
    summary: "Launch the local Trak Studio Web Dashboard",
    usage: "trak studio [--port <port>] [--no-open]",
    examples: [
      "trak studio",
      "trak studio --port 8500",
      "trak studio --no-open",
    ],
    flags: [
      { flag: "--port <int>", desc: "Port to bind local studio server (default 8200)" },
      { flag: "--no-open", desc: "Do not automatically launch web browser" },
      { flag: "-h, --help", desc: "help for studio" },
    ],
    category: "core",
  },
  {
    name: "version",
    summary: "Display the current installed version of Trak",
    usage: "trak version",
    examples: ["trak version"],
    flags: [{ flag: "-h, --help", desc: "help for version" }],
    category: "utility",
  },
  {
    name: "completion",
    summary: "Generate the autocompletion script for the specified shell",
    usage: "trak completion [bash|zsh|fish|powershell]",
    examples: [
      "trak completion powershell | Out-String | Invoke-Expression",
      "trak completion zsh > \"${fpath[1]}/_trak\"",
    ],
    flags: [{ flag: "-h, --help", desc: "help for completion" }],
    category: "utility",
  },
  {
    name: "help",
    summary: "Help about any command",
    usage: "trak help [command]",
    examples: [
      "trak help",
      "trak help init",
      "trak verify --help",
    ],
    flags: [{ flag: "-h, --help", desc: "help for trak" }],
    category: "utility",
  },
];

const CATEGORIES = [
  { id: "lang", name: "Languages (lang)", icon: Code2, desc: "Go, Python, TypeScript, Rust, C, C++" },
  { id: "db", name: "Databases (db)", icon: Database, desc: "Postgres, Redis, Distributed Storage" },
  { id: "os", name: "Operating Systems (os)", icon: Monitor, desc: "Linux Internals, Systems Architecture" },
  { id: "cloud", name: "Cloud Platforms (cloud)", icon: Cloud, desc: "AWS, Kubernetes, Cloud Native" },
  { id: "tool", name: "DevOps Tools (tool)", icon: Wrench, desc: "Docker, Git, Ansible, Toolchains" },
];

export const DocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "core" | "progress" | "utility">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCommands = activeTab === "all"
    ? COMMANDS
    : COMMANDS.filter((cmd) => cmd.category === activeTab);

  const heroCliText = `Usage:
  trak [flags]
  trak [command]

Examples:
  # Discover all available curriculum tracks:
  trak list

  # Filter by category:
  trak list lang
  trak list db
  trak list os
  trak list cloud
  trak list tool

  # Initialize a workspace in the current directory:
  trak init lang/go
  trak init db/postgres
  trak init tool/docker --path ./my-docker-lab

  # Check workspace progress:
  trak status

  # Check CLI version:
  trak version`;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Hero Header */}
      <div className="pb-6 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Trak Developer Manual & Command Reference</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f4ef]">
          Scaffolds structured, multi-module project folders directly onto your machine
        </h1>
        <p className="text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
          Complete with hands-on runnable code, exercises, and architectural notes. Explore 20+ production-grade curricula across Languages, Operating Systems, Cloud Platforms, Databases, and DevOps Tools.
        </p>
      </div>

      {/* 5 Certified Categories */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Curricula Categories</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="p-4 rounded-lg border border-white/[0.06] bg-[#161c2d] hover:border-emerald-500/30 transition-all space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs font-bold text-[#f5f4ef]">{cat.id}</span>
                </div>
                <div className="text-xs text-slate-200 font-mono font-medium">{cat.name}</div>
                <div className="text-xs text-slate-400 leading-tight">{cat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Quick Terminal Output */}
      <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>CLI Usage & Common Examples</span>
          </div>
          <button
            onClick={() => handleCopy(heroCliText, "hero-cli")}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copiedId === "hero-cli" ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg bg-[#0e131f] border border-white/[0.06] p-4 font-mono text-xs overflow-x-auto text-slate-200 leading-relaxed">
          <pre>{heroCliText}</pre>
        </div>
      </div>

      {/* Available Commands Section with Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available Commands Reference</span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#161c2d] border border-white/[0.06]">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All (11)
            </button>
            <button
              onClick={() => setActiveTab("core")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === "core"
                  ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Core
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === "progress"
                  ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Progress & Verification
            </button>
            <button
              onClick={() => setActiveTab("utility")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === "utility"
                  ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Utility
            </button>
          </div>
        </div>

        {/* Command Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommands.map((cmd) => (
            <div
              key={cmd.name}
              className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      trak {cmd.name}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-400 border border-white/[0.06] uppercase">
                      {cmd.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(`trak ${cmd.name}`, `cmd-${cmd.name}`)}
                    className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title={`Copy trak ${cmd.name}`}
                  >
                    {copiedId === `cmd-${cmd.name}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {cmd.summary}
                </p>

                {/* Usage */}
                <div className="pt-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                    Usage
                  </div>
                  <div className="p-2 rounded-lg bg-[#0e131f] border border-white/[0.06] font-mono text-xs text-slate-200">
                    {cmd.usage}
                  </div>
                </div>

                {/* Examples */}
                {cmd.examples.length > 0 && (
                  <div className="pt-1">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                      Examples
                    </div>
                    <div className="space-y-1">
                      {cmd.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleCopy(ex, `ex-${cmd.name}-${idx}`)}
                          className="group flex items-center justify-between p-2 px-3 rounded-lg bg-[#0e131f] hover:bg-white/[0.04] border border-white/[0.04] font-mono text-xs text-slate-300 cursor-pointer transition-colors"
                        >
                          <span className="truncate">{ex}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-emerald-400 shrink-0 ml-2">
                            {copiedId === `ex-${cmd.name}-${idx}` ? "Copied" : "Copy"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Flags */}
              {cmd.flags && cmd.flags.length > 0 && (
                <div className="pt-2 border-t border-white/[0.04] text-xs font-mono text-slate-400 space-y-1">
                  {cmd.flags.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <span className="text-emerald-400/90 font-semibold">{f.flag}</span>
                      <span className="text-slate-500">—</span>
                      <span className="text-slate-400">{f.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Flags Footer */}
      <div className="rounded-lg border border-white/[0.06] bg-[#161c2d] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-emerald-400 font-bold">-h, --help</span>
          <span className="text-slate-500">—</span>
          <span>Help for trak or any subcommand</span>
        </div>
        <div className="text-slate-400 text-xs">
          Use <code className="text-slate-200">trak [command] --help</code> for more information about a command.
        </div>
      </div>
    </div>
  );
};

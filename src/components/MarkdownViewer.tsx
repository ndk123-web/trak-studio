import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <div className="markdown-content text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4 max-w-4xl mx-auto selection:bg-emerald-500/30">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f5f4ef] border-b border-white/[0.08] pb-3 mt-8 mb-4 tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#f5f4ef] border-b border-white/[0.06] pb-2 mt-7 mb-3 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-lg font-medium text-[#f5f4ef] mt-6 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-mono text-sm font-bold text-slate-200 mt-4 mb-2 uppercase tracking-wider">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-3 text-slate-300 leading-relaxed font-sans font-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 space-y-2 my-3 text-slate-300 font-sans">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 space-y-2 my-3 text-slate-300 font-sans">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-400/80 bg-white/[0.02] pl-4 py-2 my-4 rounded-r-lg text-slate-400 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-white/[0.08] my-8" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline hover:text-emerald-300 font-mono transition-colors"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="w-full overflow-x-auto my-6 rounded-lg border border-white/[0.06] bg-[#161c2d]">
              <table className="w-full border-collapse text-left text-xs font-mono">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-white/[0.06] bg-white/[0.03] text-slate-200 uppercase tracking-wider font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="p-3 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="p-3 text-slate-300">{children}</td>
          ),
          pre: ({ children }) => <CodeBlockContainer>{children}</CodeBlockContainer>,
          code: ({ className, children, ...props }) => {
            const isCodeBlock = Boolean(className);
            if (isCodeBlock) {
              return (
                <code className={`${className || ""} font-mono text-xs text-slate-200 block`} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-emerald-300 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

// Code block with top bar and copy button
function CodeBlockContainer({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  // Extract raw text from children for copy button
  const getTextContent = (node: any): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getTextContent).join("");
    if (node?.props?.children) return getTextContent(node.props.children);
    return "";
  };

  const handleCopy = () => {
    const rawCode = getTextContent(children);
    if (rawCode) {
      navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0e131f] my-4 overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0e131f] text-xs font-mono text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          <span>Code Snippet</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Copy snippet"
        >
          {copied ? (
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
      <div className="p-4 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed bg-[#07090e]">
        {children}
      </div>
    </div>
  );
}

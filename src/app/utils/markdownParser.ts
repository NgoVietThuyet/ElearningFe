/**
 * Custom secure Markdown and LaTeX math equations parser for GenZBio AI Chatbot.
 * Escapes raw HTML first to prevent XSS, then injects beautiful pre-styled elements.
 */
export function parseMarkdownAndMath(text: string): string {
  if (!text) return "";

  // 1. Extract LaTeX blocks BEFORE escaping HTML (to protect $ signs and backslashes)
  const mathBlocks: { type: "block" | "inline"; content: string }[] = [];
  let processed = text;

  // Extract $$...$$ display blocks first
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
    const idx = mathBlocks.length;
    mathBlocks.push({ type: "block", content: math.trim() });
    return `__MATH_BLOCK_${idx}__`;
  });

  // Extract $...$ inline (not $$)
  processed = processed.replace(/\$(?!\$)([^$\n]+?)\$/g, (_match, math) => {
    const idx = mathBlocks.length;
    mathBlocks.push({ type: "inline", content: math.trim() });
    return `__MATH_INLINE_${idx}__`;
  });

  // 2. Escape raw HTML characters to prevent XSS
  let html = processed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 3. Normalize line endings
  html = html.replace(/\r\n/g, "\n");

  // 4. Parse blockquotes (e.g. > text)
  html = html.replace(/^&gt;\s+(.*?)$/gm, '<blockquote class="border-l-4 border-blue-200 bg-blue-50/30 pl-4 py-2 my-2.5 italic text-slate-600 rounded-r-lg">$1</blockquote>');

  // 5. Parse Code Blocks (```lang ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_match, _lang, code) => {
    return `<pre class="bg-slate-950 text-slate-100 p-4 rounded-xl my-3 overflow-x-auto text-[11px] font-mono leading-relaxed border border-white/5 shadow-inner"><code>${code}</code></pre>`;
  });

  // 6. Parse Inline Code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-[#0066FF] px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 font-bold shadow-sm">$1</code>');

  // 7. Restore LaTeX blocks (replace placeholders with rendered HTML)
  html = html.replace(/__MATH_BLOCK_(\d+)__/g, (_m, idx) => {
    const math = mathBlocks[parseInt(idx)].content;
    const formattedMath = formatMathSymbols(math);
    return `<div class="my-4 py-4 px-6 bg-[#F0F5FF]/60 border border-[#E0EBFF] rounded-xl text-center text-sm font-bold text-[#0066FF] overflow-x-auto shadow-sm">${formattedMath}</div>`;
  });

  html = html.replace(/__MATH_INLINE_(\d+)__/g, (_m, idx) => {
    const math = mathBlocks[parseInt(idx)].content;
    const formattedMath = formatMathSymbols(math);
    return `<span class="inline-block bg-[#F0F5FF]/70 text-[#0066FF] px-2 py-0.5 rounded-md font-bold text-xs mx-0.5 shadow-sm border border-[#E0EBFF]/80">${formattedMath}</span>`;
  });

  // 8. Headers
  html = html.replace(/^###\s+(.*?)$/gm, '<h3 class="text-sm font-black text-slate-900 mt-4 mb-2 tracking-tight">$1</h3>');
  html = html.replace(/^##\s+(.*?)$/gm, '<h2 class="text-base font-black text-slate-900 mt-5 mb-3 tracking-tight border-b border-slate-100 pb-1.5">$1</h2>');
  html = html.replace(/^#\s+(.*?)$/gm, '<h1 class="text-lg font-black text-[#0066FF] mt-6 mb-4 tracking-tight">$1</h1>');

  // 9. Bold and Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-[#0066FF]">$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong class="font-extrabold text-[#0066FF]">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em class="italic text-slate-800">$1</em>');

  // 10. Horizontal Lines
  html = html.replace(/^---$/gm, '<hr class="my-5 border-slate-100" />');

  // 11. Bullet and Numbered Lists
  const lines = html.split("\n");
  let inList = false;
  let listType: "ul" | "ol" | null = null;
  const parsedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      if (!inList || listType !== "ul") {
        if (inList) parsedLines.push(listType === "ol" ? "</ol>" : "</ul>");
        parsedLines.push('<ul class="my-2.5 space-y-1.5">');
        inList = true;
        listType = "ul";
      }
      parsedLines.push(`<li class="list-disc ml-5 pl-1 text-slate-700 text-[12px] leading-relaxed">${bulletMatch[1]}</li>`);
    } else if (numberMatch) {
      if (!inList || listType !== "ol") {
        if (inList) parsedLines.push(listType === "ul" ? "</ul>" : "</ol>");
        parsedLines.push('<ol class="my-2.5 space-y-1.5">');
        inList = true;
        listType = "ol";
      }
      parsedLines.push(`<li class="list-decimal ml-5 pl-1 text-slate-700 text-[12px] leading-relaxed">${numberMatch[2]}</li>`);
    } else {
      if (inList) {
        parsedLines.push(listType === "ol" ? "</ol>" : "</ul>");
        inList = false;
        listType = null;
      }
      parsedLines.push(line);
    }
  }
  if (inList) {
    parsedLines.push(listType === "ol" ? "</ol>" : "</ul>");
  }

  html = parsedLines.join("\n");

  // 12. Convert remaining newlines to <br />
  html = html.replace(/\n/g, "<br />");
  // Remove spurious <br /> after block elements
  html = html.replace(/(<\/pre>|<\/blockquote>|<\/ul>|<\/ol>|<\/h[1-6]>|<\/div>|<hr[^>]*\/>)<br \/>/g, "$1");

  return html;
}

/**
 * Format math/genetics specific symbols inside equations ($...$ or $$...$$).
 * Handles: \text{}, \mathrm{}, \mathbf{}, fractions, superscripts, subscripts,
 * Greek letters, arrows, operators, and common Biology 12 symbols.
 */
function formatMathSymbols(math: string): string {
  let res = math;

  // 1. \text{...} — plain text inside formula (most common in Gemini 2.5 output)
  res = res.replace(/\\text\{([^}]*)\}/g, "$1");

  // 2. Font commands: \mathrm{}, \mathbf{}, \mathit{}, \boldsymbol{}, \textbf{}
  res = res.replace(/\\mathrm\{([^}]*)\}/g, "$1");
  res = res.replace(/\\mathbf\{([^}]*)\}/g, "<strong>$1</strong>");
  res = res.replace(/\\mathit\{([^}]*)\}/g, "<em>$1</em>");
  res = res.replace(/\\boldsymbol\{([^}]*)\}/g, "<strong>$1</strong>");
  res = res.replace(/\\textbf\{([^}]*)\}/g, "<strong>$1</strong>");
  res = res.replace(/\\textit\{([^}]*)\}/g, "<em>$1</em>");
  res = res.replace(/\\emph\{([^}]*)\}/g, "<em>$1</em>");

  // 3. Fractions: \frac{num}{den}
  res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_match, num, den) => {
    return `<span class="inline-flex flex-col items-center justify-center align-middle mx-1 leading-none"><span class="border-b border-[#0066FF] pb-0.5">${num}</span><span class="pt-0.5">${den}</span></span>`;
  });

  // 4. Superscripts: X^{abc} then X^a
  res = res.replace(/(\w+)\^\{([^}]+)\}/g, "$1<sup>$2</sup>");
  res = res.replace(/(\w+)\^(\w)/g, "$1<sup>$2</sup>");

  // 5. Subscripts: X_{abc} then X_a
  res = res.replace(/(\w+)_\{([^}]+)\}/g, "$1<sub>$2</sub>");
  res = res.replace(/(\w+)_(\w)/g, "$1<sub>$2</sub>");

  // 6. Arrows
  res = res.replace(/\\rightarrow/g, " &rarr; ");
  res = res.replace(/\\leftarrow/g, " &larr; ");
  res = res.replace(/\\leftrightarrow/g, " &harr; ");
  res = res.replace(/\\Rightarrow/g, " &rArr; ");
  res = res.replace(/\\Leftarrow/g, " &lArr; ");
  res = res.replace(/\\to\b/g, " &rarr; ");

  // 7. Math operators
  res = res.replace(/\\times/g, " &times; ");
  res = res.replace(/\\cdot/g, " &middot; ");
  res = res.replace(/\\div/g, " &divide; ");
  res = res.replace(/\\pm/g, " &plusmn; ");
  res = res.replace(/\\mp/g, " &#8723; ");
  res = res.replace(/\\approx/g, " &asymp; ");
  res = res.replace(/\\neq/g, " &ne; ");
  res = res.replace(/\\leq/g, " &le; ");
  res = res.replace(/\\geq/g, " &ge; ");
  res = res.replace(/\\ll/g, " &lt;&lt; ");
  res = res.replace(/\\gg/g, " &gt;&gt; ");
  res = res.replace(/\\sum/g, " &sum; ");
  res = res.replace(/\\prod/g, " &prod; ");
  res = res.replace(/\\infty/g, " &infin; ");
  res = res.replace(/\\sqrt\{([^}]+)\}/g, " &radic;($1) ");
  res = res.replace(/\\sqrt/g, " &radic; ");
  res = res.replace(/\\%/g, "%");

  // 8. Greek lowercase
  res = res.replace(/\\alpha/g, "&alpha;");
  res = res.replace(/\\beta/g, "&beta;");
  res = res.replace(/\\gamma/g, "&gamma;");
  res = res.replace(/\\delta/g, "&delta;");
  res = res.replace(/\\epsilon/g, "&epsilon;");
  res = res.replace(/\\varepsilon/g, "&epsilon;");
  res = res.replace(/\\zeta/g, "&zeta;");
  res = res.replace(/\\eta/g, "&eta;");
  res = res.replace(/\\theta/g, "&theta;");
  res = res.replace(/\\iota/g, "&iota;");
  res = res.replace(/\\kappa/g, "&kappa;");
  res = res.replace(/\\lambda/g, "&lambda;");
  res = res.replace(/\\mu/g, "&mu;");
  res = res.replace(/\\nu/g, "&nu;");
  res = res.replace(/\\xi/g, "&xi;");
  res = res.replace(/\\pi/g, "&pi;");
  res = res.replace(/\\rho/g, "&rho;");
  res = res.replace(/\\sigma/g, "&sigma;");
  res = res.replace(/\\tau/g, "&tau;");
  res = res.replace(/\\upsilon/g, "&upsilon;");
  res = res.replace(/\\phi/g, "&phi;");
  res = res.replace(/\\chi/g, "&chi;");
  res = res.replace(/\\psi/g, "&psi;");
  res = res.replace(/\\omega/g, "&omega;");

  // 9. Greek uppercase
  res = res.replace(/\\Gamma/g, "&Gamma;");
  res = res.replace(/\\Delta/g, "&Delta;");
  res = res.replace(/\\Theta/g, "&Theta;");
  res = res.replace(/\\Lambda/g, "&Lambda;");
  res = res.replace(/\\Xi/g, "&Xi;");
  res = res.replace(/\\Pi/g, "&Pi;");
  res = res.replace(/\\Sigma/g, "&Sigma;");
  res = res.replace(/\\Phi/g, "&Phi;");
  res = res.replace(/\\Psi/g, "&Psi;");
  res = res.replace(/\\Omega/g, "&Omega;");

  // 10. Overline / bar notation (common in genetics: \bar{A})
  res = res.replace(/\\overline\{([^}]+)\}/g, '<span style="text-decoration:overline">$1</span>');
  res = res.replace(/\\bar\{([^}]+)\}/g, '<span style="text-decoration:overline">$1</span>');
  res = res.replace(/\\hat\{([^}]+)\}/g, "$1&#x0302;");
  res = res.replace(/\\tilde\{([^}]+)\}/g, "$1&#x0303;");
  res = res.replace(/\\bar\b/g, " &oline; ");

  // 11. \left( \right) sizing — just keep the brackets
  res = res.replace(/\\left\s*\(/g, "(");
  res = res.replace(/\\right\s*\)/g, ")");
  res = res.replace(/\\left\s*\[/g, "[");
  res = res.replace(/\\right\s*\]/g, "]");
  res = res.replace(/\\left\s*\{/g, "{");
  res = res.replace(/\\right\s*\}/g, "}");
  res = res.replace(/\\left\s*\|/g, "|");
  res = res.replace(/\\right\s*\|/g, "|");

  // 12. Spacing commands
  res = res.replace(/\\,/g, "&thinsp;");
  res = res.replace(/\\:/g, "&thinsp;");
  res = res.replace(/\\;/g, "&ensp;");
  res = res.replace(/\\!/g, "");
  res = res.replace(/\\quad/g, "&emsp;");
  res = res.replace(/\\qquad/g, "&emsp;&emsp;");
  res = res.replace(/\\ /g, "&nbsp;");

  // 13. Special symbols
  res = res.replace(/\\circ/g, "&deg;");
  res = res.replace(/\\bullet/g, "&bull;");
  res = res.replace(/\\ldots/g, "&hellip;");
  res = res.replace(/\\cdots/g, "&ctdot;");
  res = res.replace(/\\in\b/g, " &isin; ");
  res = res.replace(/\\notin\b/g, " &notin; ");
  res = res.replace(/\\subset/g, " &sub; ");
  res = res.replace(/\\cup/g, " &cup; ");
  res = res.replace(/\\cap/g, " &cap; ");
  res = res.replace(/\\forall/g, " &forall; ");
  res = res.replace(/\\exists/g, " &exist; ");

  // 14. Strip remaining unrecognized backslash commands (fallback cleanup)
  res = res.replace(/\\[a-zA-Z]+\b/g, "");

  // 15. Strip leftover grouping braces
  res = res.replace(/\{([^{}]*)\}/g, "$1");
  res = res.replace(/\{([^{}]*)\}/g, "$1"); // second pass for nested

  return res;
}

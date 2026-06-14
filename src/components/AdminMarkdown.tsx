import React from 'react';

/**
 * V2.7A.1 — minimal, dependency-free Markdown renderer for the ADMIN draft
 * preview only. Supports: ## / ### headings, paragraphs, bullet lists (-, *),
 * numbered lists (1.), bold (**x**), and inline links [text](url). Intentionally
 * small — this is an internal preview, not a public renderer.
 */

type Block =
  | { kind: 'h2' | 'h3' | 'p'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  let listKind: 'ul' | 'ol' = 'ul';

  const flushPara = () => {
    if (para.length) { blocks.push({ kind: 'p', text: para.join(' ') }); para = []; }
  };
  const flushList = () => {
    if (list && list.length) { blocks.push({ kind: listKind, items: list }); }
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushPara(); flushList(); continue; }

    const h3 = /^###\s+(.*)$/.exec(line);
    const h2 = /^##\s+(.*)$/.exec(line);
    const h1 = /^#\s+(.*)$/.exec(line);            // treat single # as h2-level in preview
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);

    if (h3) { flushPara(); flushList(); blocks.push({ kind: 'h3', text: h3[1] }); }
    else if (h2 || h1) { flushPara(); flushList(); blocks.push({ kind: 'h2', text: (h2 || h1)![1] }); }
    else if (bullet) { flushPara(); if (listKind !== 'ul') flushList(); listKind = 'ul'; (list ||= []).push(bullet[1]); }
    else if (numbered) { flushPara(); if (listKind !== 'ol') flushList(); listKind = 'ol'; (list ||= []).push(numbered[1]); }
    else { flushList(); para.push(line.trim()); }
  }
  flushPara(); flushList();
  return blocks;
}

// inline: **bold** and [text](url)
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // split on links first
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  const pushText = (chunk: string) => {
    // bold within plain text
    const parts = chunk.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach(p => {
      const b = /^\*\*([^*]+)\*\*$/.exec(p);
      if (b) out.push(<strong key={`${keyPrefix}-b-${idx++}`} className="text-white">{b[1]}</strong>);
      else if (p) out.push(<React.Fragment key={`${keyPrefix}-t-${idx++}`}>{p}</React.Fragment>);
    });
  };
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) pushText(text.slice(last, m.index));
    out.push(
      <a key={`${keyPrefix}-l-${idx++}`} href={m[2]} className="text-[#6ea8fe] underline" dir="ltr">{m[1]}</a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) pushText(text.slice(last));
  return out;
}

export default function AdminMarkdown({ source }: { source: string }) {
  if (!source.trim()) {
    return <p className="text-sm font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>(لا يوجد محتوى)</p>;
  }
  const blocks = parseBlocks(source);
  return (
    <div dir="auto">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'h2':
            return <h2 key={i} className="font-display font-bold text-xl text-white mt-5 mb-2 font-arabic">{renderInline(b.text, `h2-${i}`)}</h2>;
          case 'h3':
            return <h3 key={i} className="font-display font-bold text-lg text-white mt-4 mb-2 font-arabic">{renderInline(b.text, `h3-${i}`)}</h3>;
          case 'p':
            return <p key={i} className="text-base font-arabic leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>{renderInline(b.text, `p-${i}`)}</p>;
          case 'ul':
            return (
              <ul key={i} className="space-y-1.5 mb-4">
                {b.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="text-[#FF3333] mt-0.5 shrink-0">•</span>
                    <span>{renderInline(it, `ul-${i}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="space-y-1.5 mb-4">
                {b.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="w-5 h-5 rounded-full bg-[#FF3333]/15 text-[#FF3333] text-[11px] flex items-center justify-center shrink-0">{j + 1}</span>
                    <span>{renderInline(it, `ol-${i}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

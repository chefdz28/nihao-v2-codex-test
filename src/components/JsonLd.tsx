import { useEffect } from 'react';

/**
 * V2.5 JsonLd — injects a <script type="application/ld+json"> into <head> and
 * removes it on unmount. Structured data MUST match visible content: no fake
 * ratings, reviews, author credentials or prices anywhere.
 */
export default function JsonLd({ id, data }: { id: string; data: object }) {
  useEffect(() => {
    const elId = `jsonld-${id}`;
    let el = document.getElementById(elId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = elId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => { document.getElementById(elId)?.remove(); };
  }, [id, data]);
  return null;
}

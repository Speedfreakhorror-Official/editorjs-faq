// Puts saved inline HTML into an editable element, keeping only the inline styles (bold, italic, underline, strike, sup, sub, highlight, code), links and line breaks.
const KEEP = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'DEL', 'STRIKE', 'SUP', 'SUB', 'MARK', 'CODE', 'A', 'BR']);
const DROP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'IFRAME', 'OBJECT']);

function clean(src: Node): DocumentFragment {
  const out = document.createDocumentFragment();
  for (const n of Array.from(src.childNodes)) {
    if (n.nodeType === 3) { out.append(n.textContent ?? ''); continue; }
    if (!(n instanceof HTMLElement) || DROP.has(n.tagName)) continue;
    if (!KEEP.has(n.tagName)) { out.append(clean(n)); continue; }
    const e = document.createElement(n.tagName);
    if (n.tagName === 'A') {
      const href = n.getAttribute('href') ?? '';
      if (/^(https?:\/\/|\/(?!\/))/i.test(href)) e.setAttribute('href', href);
    }
    if (n.tagName !== 'BR') e.append(clean(n));
    out.append(e);
  }
  return out;
}

export function setInline(target: HTMLElement, html: string) {
  const tpl = document.createElement('template'); // inert: nothing in it runs or loads
  tpl.innerHTML = html;
  target.replaceChildren(clean(tpl.content));
}

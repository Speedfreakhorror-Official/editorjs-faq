// editorjs-faq: a question-and-answer block for Editor.js.
import type { API, BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';
import { setInline } from './inline';

export interface FaqRow { q: string; a: string }
export interface FaqData { items: FaqRow[] }
export interface FaqConfig { max?: number }

/** Fills defaults and drops unknown top-level keys and rows with neither question nor answer. */
export function normalize(data: unknown, max?: number): FaqData {
  const o = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const items: FaqRow[] = [];
  for (const raw of Array.isArray(o.items) ? o.items : []) {
    const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const q = typeof r.q === 'string' ? r.q : '';
    const a = typeof r.a === 'string' ? r.a : '';
    if (q.trim() || a.replace(/<[^>]*>/g, '').trim()) items.push({ q, a });
  }
  return { items: max !== undefined ? items.slice(0, max) : items };
}

/** True when there is a row and every row has both a question and an answer. */
export const isValid = (d: FaqData) => d.items.length > 0 && d.items.every((r) => r.q.trim() && r.a.replace(/<[^>]*>/g, '').trim());
/** True when no row has a question or an answer (the only block `validate` refuses). */
export const isEmpty = (d: FaqData) => d.items.length === 0;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export default class FaqTool implements BlockTool {
  private rows: FaqRow[];
  private root = el('div', 'ejs-faq');
  constructor(private opts: BlockToolConstructorOptions<FaqData, FaqConfig>) {
    this.rows = normalize(opts.data, opts.config?.max).items;
    if (!this.rows.length) this.rows.push({ q: '', a: '' });
  }
  static get toolbox() {
    return { title: 'FAQ', icon: '<svg width="17" height="15" viewBox="0 0 17 15"><path d="M1 3h10M1 7h15M1 11h15" stroke="currentColor" stroke-width="1.6"/></svg>' };
  }
  static get isReadOnlySupported() { return true; }
  // only the inline styles (bold, italic, underline, strike, sup, sub, highlight, code) and links survive a paste or a save in an answer; the question is kept as typed (`false` would HTML-escape it)
  static get sanitize() { return { items: { q: true, a: { b: true, i: true, u: true, s: true, sup: true, sub: true, mark: true, code: true, a: { href: true } } } }; }

  render(): HTMLElement {
    // typing in an input changes no DOM node, so Editor.js is told
    this.root.addEventListener('input', () => this.opts.block.dispatchChange());
    this.draw();
    return this.root;
  }
  save(): FaqData { return normalize({ items: this.rows }, this.opts.config?.max); }
  // Editor.js drops a block that fails validate from the save: only an empty one, so a half-made one reaches the host
  validate(data: FaqData) { return !isEmpty(normalize(data)); }

  private draw() {
    const ro = (this.opts.api as API).readOnly.isEnabled;
    const max = this.opts.config?.max;
    this.root.replaceChildren();
    this.rows.forEach((row, i) => {
      const box = el('div', 'ejs-faq-row');
      const q = el('input', 'ejs-faq-input');
      q.type = 'text';
      q.placeholder = 'Question';
      q.value = row.q;
      q.disabled = ro;
      q.oninput = () => { row.q = q.value; };
      const a = el('div', 'ejs-faq-text');
      a.contentEditable = String(!ro);
      a.dataset.placeholder = 'Answer';
      setInline(a, row.a);
      a.oninput = () => { row.a = a.innerHTML; };
      // Enter and Backspace in an answer belong to the answer, not to the block
      a.onkeydown = (e) => { if (e.key === 'Enter' || e.key === 'Backspace') e.stopPropagation(); };
      box.append(q, a);
      if (!ro && this.rows.length > 1) {
        const rm = el('button', 'ejs-faq-btn', 'Remove');
        rm.type = 'button';
        rm.onclick = () => { this.rows.splice(i, 1); this.draw(); };
        box.append(rm);
      }
      this.root.append(box);
    });
    if (!ro && (max === undefined || this.rows.length < max)) {
      const add = el('button', 'ejs-faq-btn', 'Add a question');
      add.type = 'button';
      add.onclick = () => { this.rows.push({ q: '', a: '' }); this.draw(); };
      this.root.append(add);
    }
  }
}

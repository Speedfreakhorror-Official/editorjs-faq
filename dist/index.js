// src/inline.ts
var KEEP = new Set(["B", "STRONG", "I", "EM", "U", "S", "DEL", "STRIKE", "SUP", "SUB", "MARK", "CODE", "A", "BR"]);
var DROP = new Set(["SCRIPT", "STYLE", "TEMPLATE", "IFRAME", "OBJECT"]);
function clean(src) {
  const out = document.createDocumentFragment();
  for (const n of Array.from(src.childNodes)) {
    if (n.nodeType === 3) {
      out.append(n.textContent ?? "");
      continue;
    }
    if (!(n instanceof HTMLElement) || DROP.has(n.tagName))
      continue;
    if (!KEEP.has(n.tagName)) {
      out.append(clean(n));
      continue;
    }
    const e = document.createElement(n.tagName);
    if (n.tagName === "A") {
      const href = n.getAttribute("href") ?? "";
      if (/^(https?:\/\/|\/(?!\/))/i.test(href))
        e.setAttribute("href", href);
    }
    if (n.tagName !== "BR")
      e.append(clean(n));
    out.append(e);
  }
  return out;
}
function setInline(target, html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  target.replaceChildren(clean(tpl.content));
}

// src/index.ts
function normalize(data, max) {
  const o = data && typeof data === "object" ? data : {};
  const items = [];
  for (const raw of Array.isArray(o.items) ? o.items : []) {
    const r = raw && typeof raw === "object" ? raw : {};
    const q = typeof r.q === "string" ? r.q : "";
    const a = typeof r.a === "string" ? r.a : "";
    if (q.trim() || a.replace(/<[^>]*>/g, "").trim())
      items.push({ q, a });
  }
  return { items: max !== undefined ? items.slice(0, max) : items };
}
var isValid = (d) => d.items.length > 0 && d.items.every((r) => r.q.trim() && r.a.replace(/<[^>]*>/g, "").trim());
var isEmpty = (d) => d.items.length === 0;
function el(tag, cls, text) {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined)
    e.textContent = text;
  return e;
}

class FaqTool {
  opts;
  rows;
  root = el("div", "ejs-faq");
  constructor(opts) {
    this.opts = opts;
    this.rows = normalize(opts.data, opts.config?.max).items;
    if (!this.rows.length)
      this.rows.push({ q: "", a: "" });
  }
  static get toolbox() {
    return { title: "FAQ", icon: '<svg width="17" height="15" viewBox="0 0 17 15"><path d="M1 3h10M1 7h15M1 11h15" stroke="currentColor" stroke-width="1.6"/></svg>' };
  }
  static get isReadOnlySupported() {
    return true;
  }
  static get sanitize() {
    return { items: { q: true, a: { b: true, i: true, u: true, s: true, sup: true, sub: true, mark: true, code: true, a: { href: true } } } };
  }
  render() {
    this.root.addEventListener("input", () => this.opts.block.dispatchChange());
    this.draw();
    return this.root;
  }
  save() {
    return normalize({ items: this.rows }, this.opts.config?.max);
  }
  validate(data) {
    return !isEmpty(normalize(data));
  }
  draw() {
    const ro = this.opts.api.readOnly.isEnabled;
    const max = this.opts.config?.max;
    this.root.replaceChildren();
    this.rows.forEach((row, i) => {
      const box = el("div", "ejs-faq-row");
      const q = el("input", "ejs-faq-input");
      q.type = "text";
      q.placeholder = "Question";
      q.value = row.q;
      q.disabled = ro;
      q.oninput = () => {
        row.q = q.value;
      };
      const a = el("div", "ejs-faq-text");
      a.contentEditable = String(!ro);
      a.dataset.placeholder = "Answer";
      setInline(a, row.a);
      a.oninput = () => {
        row.a = a.innerHTML;
      };
      a.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === "Backspace")
          e.stopPropagation();
      };
      box.append(q, a);
      if (!ro && this.rows.length > 1) {
        const rm = el("button", "ejs-faq-btn", "Remove");
        rm.type = "button";
        rm.onclick = () => {
          this.rows.splice(i, 1);
          this.draw();
        };
        box.append(rm);
      }
      this.root.append(box);
    });
    if (!ro && (max === undefined || this.rows.length < max)) {
      const add = el("button", "ejs-faq-btn", "Add a question");
      add.type = "button";
      add.onclick = () => {
        this.rows.push({ q: "", a: "" });
        this.draw();
      };
      this.root.append(add);
    }
  }
}
export {
  FaqTool as default,
  isEmpty,
  isValid,
  normalize
};

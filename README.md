# editorjs-faq

A question-and-answer block for Editor.js.

## Install

```
npm i github:Speedfreakhorror-Official/editorjs-faq
```

Import the tool and its stylesheet:

```ts
import FaqTool from 'editorjs-faq';
import 'editorjs-faq/style.css';
```

## Usage

```ts
new EditorJS({ tools: { faq: { class: FaqTool, config: { max: 20 } } } });
```

The stylesheet reads these CSS variables, with light and dark defaults on `:root`; override them on any parent element:
`--ejs-ink`, `--ejs-muted`, `--ejs-line`, `--ejs-surface`, `--ejs-accent`, `--ejs-danger`.

## Data

```json
{ "items": [ { "q": "Question", "a": "Answer with inline <b>HTML</b>" } ] }
```

Rows with neither question nor answer are dropped. `isValid` is true when every row has both; `validate` refuses only a block with no rows, so Editor.js never drops a half-filled one from a save.

The module also exports a pure `normalize(data)` that fills defaults and drops unknown top-level keys.

## Credits

Built as part of [PrintCut](https://printcut.app), a browser studio for designing laser-cut boxes, puzzles, keychains and signs from templates. Made and owned by [ibrahim-jaber.com](https://ibrahim-jaber.com).

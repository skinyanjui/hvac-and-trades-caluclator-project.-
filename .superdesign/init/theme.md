# Theme

## Compact token summary

- Font: Geist-first system sans (`Geist`, `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif)
- Canvas: `#f7f8fa`
- Surface: `#ffffff`
- Primary text: `#20313b`
- Dark brand/legal surface: `#1a333d`
- Accent: `#077989`
- Accent pale: `#e7f2f4`
- Border: `#dce3e7`
- Muted text: `#657780`
- Error: text `#934827`, background `#fff4ed`
- Radius: 4–8 px
- Focus: 2 px `#07869b`, 3 px offset
- Main max width: 1160 px
- Desktop sidebar: 196 px
- Primary spacing rhythm: 4, 7, 10, 12, 15, 17, 19, 25, 42 px
- Breakpoints: 1100, 800, 620, 360 px
- Motion: no decorative motion; reduced-motion override is present

## Raw source

Source: the first `<style>` block in `index.html`.

```css
:root {
  font-family: Inter, Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  color: #20313b;
  background: #f7f8fa;
  font-synthesis: none;
  --accent: #077989;
  --line: #dce3e7;
  --muted: #657780;
}

* { box-sizing: border-box; }
body { margin: 0; }
button, input, select { font: inherit; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible {
  outline: 2px solid #07869b;
  outline-offset: 3px;
}

.layout {
  display: grid;
  grid-template-columns: 196px minmax(0, 1fr);
  min-height: calc(100vh - 54px);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.panel {
  background: white;
  border: 1px solid var(--line);
  border-radius: 8px;
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 800px) {
  .sidebar { display: none; }
  .layout { display: block; }
  .mobile-tools { display: block; }
}

@media (max-width: 620px) {
  .workspace { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto !important; }
}
```

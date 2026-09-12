# Shared layouts

## Application shell

Source: `index.html`, function `shell()`.

The shell renders:

1. skip link,
2. sticky application header with brand and utility routes,
3. legal disclaimer,
4. project code-context selector,
5. desktop sidebar search/navigation,
6. mobile calculator selector,
7. main content region.

Actual structural template:

```html
<a class="skip" href="#main">Skip to calculator</a>
<header class="app-header">
  <a class="brand" href="#btu">
    <span class="brand-mark"><!-- shared air icon --></span>
    HVAC Workbench
  </a>
  <div class="header-actions">
    <button data-route="convert">Units</button>
    <button data-route="references">Sources</button>
    <button data-route="changelog">Changelog</button>
    <button id="print" class="print-button" aria-label="Print calculation">
      <!-- print icon --><span>Print</span>
    </button>
  </div>
</header>
<div class="legal-banner" role="note"><!-- legal disclaimer --></div>
<div class="ahj-bar"><!-- code context selector and provenance note --></div>
<div class="layout">
  <aside class="sidebar">
    <div class="search-wrap"><!-- search icon + input --></div>
    <nav id="nav" aria-label="Calculators"></nav>
    <div class="sidebar-foot"><!-- live calculator/unit counts --></div>
  </aside>
  <div class="mobile-tools"><!-- grouped calculator select --></div>
  <main id="main" tabindex="-1"></main>
</div>
```

## Calculator workspace

Source: `index.html`, function `render()`.

```html
<div class="page-title"><!-- title, description, tag --></div>
<div class="workspace">
  <section class="panel input-panel">
    <div class="panel-head"><h2>Inputs</h2><button>Reset</button></div>
    <form id="calc-form" novalidate><!-- fields and disclaimers --></form>
  </section>
  <section class="panel result-panel" id="result" aria-label="Calculation result"></section>
</div>
<div class="workspace-foot"><!-- concise limitation --></div>
```

Desktop uses a sticky 196 px sidebar and two-column calculator workspace. At 800 px the sidebar becomes a grouped select; at 620 px the workspace stacks.

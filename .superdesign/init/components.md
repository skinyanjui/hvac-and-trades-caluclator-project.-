# UI components

The application is a framework-free single-page app. Shared UI primitives are renderer functions in `index.html`.

## `heading`

Page title, description, and status badge.

```js
function heading(title,desc,tag){return `<div class="page-title"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>${tag?`<span class="tag">${esc(tag)}</span>`:''}</div>`;}
```

## `fieldHTML`

Shared numeric-input and select-field renderer.

```js
function fieldHTML(f,v){const described=f.options?(f.hint?`${f.key}-hint`:''):`${f.key}-unit${f.hint?` ${f.key}-hint`:''}`;return `<div class="field" data-field="${f.key}"><label for="${f.key}">${esc(f.label)}</label>${f.options?`<select id="${f.key}" name="${f.key}"${described?` aria-describedby="${described}"`:''}>${f.options.map(([k,label])=>`<option value="${k}" ${v===k?'selected':''}>${esc(label)}</option>`).join('')}</select>`:`<div class="input-wrap"><input id="${f.key}" name="${f.key}" type="number" inputmode="${f.min<0?'text':'decimal'}" value="${v}" min="${f.min}" max="${f.max}" step="${f.step}" aria-describedby="${described}" required><span id="${f.key}-unit">${esc(f.unit)}</span></div>`}${f.hint?`<p class="field-hint" id="${f.key}-hint">${esc(f.hint)}</p>`:''}</div>`;}
```

## `icon`

Shared outline icon renderer.

```js
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]||icons.air}"/></svg>`;
```

## `links`

Source-link list used in formula panels.

```js
function links(ids){return ids.length?`<div class="source-links">${ids.map(id=>`<a href="${sourceLinks[id][1]}" target="_blank" rel="noopener noreferrer">${esc(sourceLinks[id][0])} ↗</a>`).join('')}</div>`:'<p class="method-note">Derived from the displayed mathematical relationship. No code threshold is applied.</p>';}
```

## Reusable CSS primitives

`index.html` defines the complete implementations for `.panel`, `.tag`, `.text-button`, `.input-wrap`, `.field`, `.code-disclaimer`, `.result-hero`, `.result-row`, `.crosscode-chip`, and `.method`.

# Page dependency trees

The application has one source file and no module imports.

## Calculator route (`#<calculator-id>`)

Entry: `index.html`

Dependencies:

- `shell()`
  - `icon()`
  - `menuOptions()`
  - `renderNav()`
- `render()`
  - `heading()`
  - `fieldHTML()`
  - `conditionalFields()`
  - `run()`
    - `evaluateCalculator()`
    - calculator-specific `calculate`
    - `links()`
- calculator registry and source-link registry
- inline CSS theme and responsive layout

## Unit converter (`#convert`)

Entry: `index.html`

Dependencies:

- `shell()`
- `converter()`
- `bindConverter()`
- `updateConversion()`
- `convert()`
- `units`

## Codes and sources (`#references`)

Entry: `index.html`

Dependencies:

- `shell()`
- `references()`
- `heading()`
- `sourceLinks`

## Changelog (`#changelog`)

Entry: `index.html`

Dependencies:

- `shell()`
- `changelog()`
- `heading()`

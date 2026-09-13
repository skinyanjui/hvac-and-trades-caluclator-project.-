# HVAC Workbench coverage audit

Reviewed September 12, 2026.

## Scope

HVAC Workbench is a national-US **screening and engineering-math** utility. It is not an adopted-code database, load-calculation package, fire-alarm design tool, or compliance certificate. The AHJ-adopted code, local amendments, equipment listings, manufacturer instructions, and licensed design professionals govern.

“All codes” is not a safe or finite implementation target: adoption varies by jurisdiction, many referenced standards and tables are licensed, and project-specific exceptions change outcomes. This audit therefore separates:

1. calculations that can be derived from public formulas,
2. bounded path gates and checklists,
3. table-driven tools that require verified source data before implementation.

## Current coverage

The app now has **209** calculators across:

- heating and cooling engineering math,
- air and duct calculations,
- refrigeration field measurements,
- hydronics,
- energy and unit conversion,
- IMC ventilation, exhaust, condensate, hood, dryer, machinery-room, and smoke-detection screening,
- IFGC combustion-air, venting-path, gas-pipe-method, and clearance screening,
- IPC T&P discharge screening,
- IRC local/whole-house ventilation and installation path gates,
- ASHRAE 15 / 15.2 path routing,
- additional engineering/trades math (equivalent duct, face velocity, CFM/ton, SHR, tons, pump laws, pipe velocity, gas cost, sheave RPM, net free area, boiler hp, kW/ton, tower approach, compression ratio, pump head, air density, belt length, hydraulic diameter, velocity pressure, stack effect, pipe volume, LMTD, evaporator/condenser TD, net oil pressure),
- IMC intake/exhaust location and grease-duct velocity/slope/clearance/cleanout screens,
- IMC dryer makeup-air, duct-sealing, Type I hood documentation, and flexible-duct installation gates,
- IMC appliance-access and return-air restriction gates,
- IFGC shutoff/connector, §503.8 vent-terminal, and §304.9 mechanical combustion-air screening, plus IMC Chapter 11 refrigerant-piping documentation.

## Public field-formula batch (no licensed tables)

Added technician/field relationships published on open vendor and trade references (e.g. Belimo-style 1.08 / 0.69 / 4.5 / 500 constants, pitot V=4005√VP, CFM=A×V, therms, chiller GPM≈tons×24/ΔT). These do not digitize IFGC/IMC pipe or vent tables.

Removed the global **Please note** legal banner; the AHJ / 2024 model-code screening note now lives in the site footer.

## Accuracy audit + unit converter expansion (2026-09-13)

Re-tested public engineering identities (sensible CFM, hydronic GPM, duct velocity, VP↔V, superheat/subcooling, EER, tons, fan laws) and unit conversions against SI / NIST factors.

**Fixes**
- Division-by-zero / non-finite guards on duct area, fan & pump base speed, compression-ratio suction pressure, pipe diameter, design velocity, ΔT / density / cp, room volume, specific volume, EER input, sheave driven diameter, hydraulic diameter / aspect sides, Reynolds viscosity & ID, valve SG, pipe fill time, friction TEL, kW/ton capacity, belt centers, and pump-head SG.
- Pipe-volume fill time no longer reports `Infinity` when flow is zero.

**Unit converter**
- Expanded from **16 → 26** measurement groups.
- Added units within existing groups (hp, bar/atm/mercury columns, yd/mil/mile, yd², mL/qt, Wh/MMBtu/kcal, ft/s·km/h, gph·m³/h, grains·ton·tonne).
- New groups: Force, Torque, Density, Specific heat, Specific volume, Heat flux, Dynamic viscosity, Time, Frequency, Angle.

Verify harness now includes accuracy regressions (`scripts/verify.mjs`).

## Second accuracy pass (2026-09-13)

Follow-on audit after the first accuracy/unit expansion:

- Hardened remaining non-finite edges: gas heat content, multizone `Ev` / critical `Vpz`, equivalent-duct sides, grease-duct run length, kW/ton COP rows when power is zero, and total-enthalpy factor.
- Unit converter grown from **26 → 32** groups (mass flow, absolute humidity, thermal conductivity, kinematic viscosity, electrical potential/current) with Rankine, metric hp, and more SI/IP members in existing groups.

## Navigation chrome (2026-09-13)

Shell improvements for denser calculator browsing:

- Favorites and recent tools (persisted in `localStorage`); collapsible groups
- Header/mobile search with `/` focus and ↑/↓/Enter list navigation
- Sidebar footer links to Units, Sources, and Changelog
- Removed later the same day at the owner's request: the All · Math · Code · Favorites filter pills and the header context-chip pill. Favorites remain as a sidebar section with per-row stars.

## Consolidation and content audit (2026-09-13)

Consolidation:

- Removed the nav filter pills and header context chip plus their state (`navFilter`, `filterPool`, `updateContextChip`, `activeLabel`, `CODE_GROUPS` / `MATH_GROUPS`, the `filter` key in saved prefs).
- Removed dead code-edition remnants (`codeEdition`, `codeEditionDataNote`) left over from the old AHJ selector bar.
- Deleted the stale `.superdesign/` tooling artifacts (design-system notes describing a 47-tool app, an unrelated `business.x.com` capture, and a tool `resume.json`).

Content audit of all 209 calculators (script-driven: description, badge, icon, group, essentials, keywords, sources, field hints/units/ranges/defaults, duplicate labels, result unit/formula/note/rows/cites, hero label, disclaimer block):

| Check | Before | After | Notes |
| --- | --- | --- | --- |
| Description, badge, icon, group, essentials, keywords | complete | complete | no gaps |
| Fields with shifted arguments (max = `'any'`, step = hint text) | 2 (`combustionair`) | 0 | `sumConnectors`, `availableVolume` never range-checked and lost their hints |
| Code tools without cite tags | 5 | 0 | `outdoorair` and `exhaust` now cite IMC §403.3.1.1 / Table 403.3.1.1; the other three are unit-math tools that intentionally carry no code cites |
| Code-group tools without a model-code disclaimer block | 58 | 0 | generic IMC / IFGC fallback block; `manifoldkpa`, `gascfh`, `mcfgas` excluded as pure conversions |
| Hero label falling back to "Result" | 27 | 0 | named labels for the 22 original engineering tools and the five IMC gates |
| Duplicate field labels within a tool | 3 | 0 material | hood duties renamed Second/Third; `outdoorair` manual population relabelled; `gaspipesize` keeps two "Section gas load" fields that are mutually exclusive by unit toggle |
| Fields without a hint | 751 across 206 tools | 0 | see the content follow-up below |
| Tools with no source links | 117 | 0 | see the content follow-up below |
| Defaults that throw | 1 (`condensateoverflow`) | 1 | intentional path-gate that requires an answer first |

## Content follow-up: hints, references, glossary, color (2026-09-13)

- **Hints.** The remaining 668 hint-less fields on 181 tools now carry one. 373 numeric and non-checklist choice inputs received individually written hints (what the value is, where to read it, a typical magnitude or the governing section); the 295 yes / no / N/A / unknown checklist items share one answer legend ("Yes = verified … Unknown = not yet confirmed and counts as needing attention"). Consecutive identical hints render once visually and stay in every field's `aria-describedby`, so a 20-item checklist is not padded with 20 copies of the legend. Inventory after the pass: 0 fields without a hint, 0 dangling `aria-describedby` ids (headless check across all 214 tools).
- **Reference links.** All 117 pure-math tools now link a public authority for the relationship they compute: ASHRAE Handbook—Fundamentals / HVAC Systems and Equipment / Refrigeration, AMCA (fan laws), SMACNA (duct design and leakage), Hydraulic Institute (pump laws, NPSH), Cooling Technology Institute (approach, range, evaporation, blowdown), AHRI (EER / COP / kW-per-ton conventions), US EIA (fuel heating values and energy units), ASCE 7 (wind pressure), Stull 2011 (wet-bulb fit), ISA-75.01 (Cv), NIST SP 811 / Chemistry WebBook. Five matching rows were added to the Sources page. The Method panel now shows the links instead of the "no code threshold" sentence, and every Method panel links to the glossary for notation.
- **Glossary & symbols page** (`#glossary`). 170 terms in nine topics (codes and compliance; ventilation and IAQ; airflow and ducts; loads; psychrometrics; refrigeration; hydronics and piping; fuel gas and venting; energy and economics), each with the expanded abbreviation, a working definition and "Used in" links to the calculators that rely on it, plus 25 notation entries covering every non-ASCII symbol the app prints (Δ Σ × ÷ − ≈ ≥ ≤ √ ² ³ ° η ρ ṁ ν μ ε π φ § · → ↔ ⇄ ↗ ★ subscripts, superscripts, em dash). A filter box narrows terms and symbols; the sidebar search shows a "Glossary · N matching terms" row that opens the page pre-filtered. Reachable from the sidebar footer, the mobile menu and any Method panel.
- **Color.** The Geist palette is applied on top of the neutral base: blue accent for links, focus rings and header actions; one hue per calculator group (heating red, air teal, ventilation purple, fuel-gas amber, refrigeration blue, hydronics green, energy pink, reference slate) driving the sidebar group dot, the active nav row, the page badge, the result hero, the formula block and the "Used in" markers; semantic tints for the amber code-disclaimer and negative-result notes and the red error box; cite chips in purple. The header mark shrank from 28 px to 22 px (20 px on phones) and carries a blue→teal gradient.

## Bug audit after the content follow-up (2026-09-13)

Method: headless pass over all 214 tools and four reference pages collecting console noise, duplicate ids, unlabelled controls, dangling `aria-describedby`, text leaks (`NaN`, `undefined`), heading order and horizontal overflow at 390 px; realistic typing sequences (focus, select-all, type, navigate away); back/forward and deep links; tampered `localStorage`; search-and-Enter flows; the 8,560-run fuzz; a before/after comparison of every field's key, label, unit, default, min, max and step across the hint patch (0 differences); and a cross-check of every code section cited in the new hints against the sections the tools themselves cite.

| Finding | Severity | Fix |
| --- | --- | --- |
| **Cross-calculator value leak.** The form's `onchange` handler wrote into `values[active]`. When the user typed in a field and then navigated (sidebar, search, hash), the browser fired `change` on the blurred input *after* `active` had already switched, so the previous tool's values were written into the next tool's state under shared keys. Reproduced: type in Combustion air, open Gas pipe sizing → "Choose a valid sizing method" because `method` now held `outdoor_two_vertical`. | High (pre-existing) | `readForm`, `conditionalFields`, `run` and Reset now key off `c.id`; form handlers ignore events once `active !== c.id` or the form is detached. |
| **`id="method"` collision.** Four tools (`combustionair`, `gaspipesize`, `fanpowerdocs`, `smokecontroldocs`) have a field keyed `method`, whose `<select id="method">` shadowed the Method `<details id="method">`. `querySelector('#method')?.open` read the select, so the Method panel snapped shut on every keystroke in those tools. | Medium (pre-existing) | Panel renamed `method-panel`; `verify.mjs` now asserts no field key collides with a structural id and that keys are unique within a tool. |
| **Method panel closed by an invalid intermediate value.** Typing `700` over `500` passes through `7`, which fails range validation; the error render dropped the panel and its open state, so the panel was closed when the value became valid again. | Low (pre-existing) | Open state is remembered per tool across error renders and reset when the tool changes. |
| Checklist legend hidden with a conditionally hidden field. | Low (new) | Hint de-duplication now compares against the previous *visible* field. |
| Enter in the sidebar search did nothing when only glossary terms matched. | Low (new) | Enter falls through to the glossary hit. |
| `interest-cohort=()` in `Permissions-Policy` logs an "unrecognized feature" console error in current Chrome. | Low (new) | Removed. |
| Hint citations: combustion-air KAIR factor cited §304.6.1 (outdoor openings) instead of §304.5.2; room-volume hint cited §304.5.3.1; combination method cited §304.8 instead of §304.7; dryer booster cited a non-existent §504.9.5. | Low (new) | Corrected to the sections the tools themselves cite. |

Not changed: `condensateoverflow` still shows the empty result state with its defaults (intentional gate). After the fixes: verify 512/512, zero console or network errors on any page, zero duplicate ids, zero horizontal overflow at 390 px, fuzz unchanged (only the intentional hood-style messages), typing-then-navigating no longer contaminates state.

## Layout audit: large screens, spacing, responsiveness (2026-09-13)

Method: screenshots and DOM measurements of representative tools (`btu`, `combustionair`, `gaspipesize`, `outdoorair`, `tpdischarge`, `lcc`) and the four reference pages at 390, 820, 1024, 1280, 1440, 1650, 1920 and 2560 px; then a scripted pass over all 214 tools at 1024/1280/1920 checking panel overflow, controls sharing a row with different tops, select options wider than their box, clipped unit spans, wrapping result values and clipped hero numbers.

| Finding | Fix |
| --- | --- |
| At ≥ 1650 px `main{margin-left:30px}` pinned a 1120 px workspace to the sidebar, leaving ~1,200 px of empty space on a 2560 px display. | Workspace is centred; max-width 1280 px from 1650 px and 1400 px from 2200 px, with slightly larger panel padding/gaps at that size. Sidebar scales `clamp(200px, 13vw, 250px)` so long tool names wrap less. |
| Controls in the same row sat at different heights: `.field` was a flex column with `margin-top:auto` on the control, so a long hint on the neighbour pushed the other field's input down (visible on every checklist tool). | `.field` is now a `subgrid` spanning three shared tracks (label / control / hint) so labels bottom-align, controls top-align and hints start on the same line; flex fallback kept for browsers without subgrid. |
| Text inputs were 38 px tall (36 + borders) but selects 36 px, a 2 px step in every mixed row. | Both border-box 38 px (44 px on coarse pointers). |
| Between 801 and 1000 px the two panels sat side by side at ~300 px each, and between 1000 and 1250 px the two field columns were ~180 px, so select text such as "Outdoor · two openings (vertical ducts)" was clipped. | Workspace stacks below 1000 px; a container query drops `.fields` to one column whenever the panel is narrower than 430 px, independent of viewport. |
| 57 choice fields have option labels longer than 28 characters and were clipped even at half a 1280 px panel. | Choice fields with any option over 28 characters span both columns; a field left alone in its row (because the next field is full-width or a neighbour is conditionally hidden) also spans both. Re-evaluated on every input, not only at render. |

Follow-up: form controls are now driven by one set of tokens (`--control-h` 38 px, 44 px on coarse pointers; `--control-font` 15 px, 16 px under 800 px; shared border, radius, text colour and 10 px inset). Number inputs, selects, the converter controls, the sidebar/header/glossary search fields, the mobile tool picker and header buttons all resolve to the same height, and inputs and selects share the same text size and colour (they were 16 px vs 14 px, and different inks). A scripted pass over every control on all 214 tools plus the reference pages at 1280/1920 shows a single height for every input and select and no row where two controls differ in top or height.

Inner edges: panel heading, field labels, advanced section, form status, error box and code disclaimer share one left edge inside the inputs panel, and hero label, result rows, method formula/note/cites, negative note and cross-code chips share one edge inside the results panel, at every breakpoint (10 px under 620 px, 12/14 px by default, 14/16 px from 1650 px). Previously the error box (17 px), cross-code chips (17 px) and, at ≥ 1650 px, the panel heading and method body were 2–5 px off. Long-option selects carry a `title` with the selected label so an 80-character option can be read in full even where the box clips it.

After the pass: 0 misaligned rows and 0 clipped selects at 1280/1920; at 1024 the only remaining clipped selects are single-column 85-character option labels (the open list shows the full text). Verify 512/512, all-page smoke and fuzz unchanged.

## NIST security survey (2026-09-13)

Reviewed NIST publications for controls that apply to a public, static, no-backend web app: CSF 2.0 and SP 1300 (small-business quick start), SP 800-53 Rev. 5, SP 800-218 SSDF v1.1, SP 800-52 Rev. 2 (TLS), SP 800-44 v2 (public web servers), SP 800-122 (PII). SP 800-63 (digital identity) and SP 800-95 (SOAP web services) do not apply — there are no accounts and no API.

| NIST reference | Applied | Where |
| --- | --- | --- |
| SC-8 / SP 800-52 transport protection | `Strict-Transport-Security: max-age=63072000; includeSubDomains`; CSP `upgrade-insecure-requests` | `vercel.json` |
| PR.PS-01 / CM-6 / CM-7 hardened configuration | Existing CSP, `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP; added `Cross-Origin-Resource-Policy: same-origin`, `X-Permitted-Cross-Domain-Policies: none`, `X-DNS-Prefetch-Control: off` | `vercel.json`, CSP meta |
| GV.SC / SSDF PS.1, PW.4 supply chain | Removed the only runtime third-party dependency: the Geist variable font is self-hosted at `/fonts/Geist-Variable.woff2` (SIL OFL 1.1 licence alongside; SHA-256 `28258d06…7630`), so `font-src` is now `'self'` and no CDN is contacted at runtime | `index.html`, `fonts/` |
| SI-2 / RV.1 flaw remediation and disclosure | `Cache-Control: public, max-age=0, must-revalidate` on the document (fonts immutable); RFC 9116 `/.well-known/security.txt` (contact, policy, expiry 2027-09-13); `SECURITY.md` with scope, reporting path and the control mapping | `vercel.json`, `.well-known/`, `SECURITY.md` |
| SI-10 input validation, PR.DS data minimisation | Already in place: range-checked numeric parsing, option allow-lists, `esc()` on every rendered string, route validation, sanitised `localStorage`, no PII / analytics / cookies | documented in `SECURITY.md` |
| Residual risk | `'unsafe-inline'` for script and style remains because the app is one HTML file; hash-pinned CSP would need a build step | `SECURITY.md` |

Verification for this pass: `scripts/verify.mjs` 502/502; headless fuzz 8,560 runs, 0 findings other than the known intentional hood-style error messages; all 214 tools plus the four reference pages rendered with no page or console errors; self-hosted font confirmed loaded from the same origin; `security.txt` served.

## NIST.gov calculator survey (2026-09-13)

Surveyed NIST-published tools and methods for content that fits a single-file, public-domain workbench. Adopted where the method is a closed-form equation published by NIST; linked where NIST hosts the authoritative data or software.

| NIST tool / publication | Disposition | Result in this app |
| --- | --- | --- |
| Quick Indoor CO₂ (QICO2) tool · NIST TN 2213 · Persily & de Jonge (2017) | **Implemented** | `co2ss` (steady-state and transient indoor CO₂ from occupants and outdoor air) and `co2vent` (outdoor air per person from a steady-state reading). Schofield BMR × met × (T/P) × 0.000179 generation; verified against the published per-person rates (0.0053 / 0.0042 / 0.0045 / 0.0042 L/s). |
| Tracer-gas decay (ASTM E741 as used in NIST ventilation studies) | **Implemented** | `co2decay` — air change rate from CO₂ decay after a space empties. |
| Climate Suitability Tool / NISTIR 6781 / NIST GCR 01-820 (Axley single-zone model) | **Implemented (steady-state relations)** | `ventcool` — direct ventilative-cooling airflow and heating balance point; flags > 5 ACH as NIST does. Hourly climate-file analysis stays with the NIST tool. |
| NIST Handbook 135 (FEMP LCC) + NISTIR 85-3273 annual supplement + BLCC | **Implemented (chapter 6 & 17 formulas)** | `lcc` — SPV / UPV / UPV* factors, net savings, SIR, AIRR, simple and discounted payback. Verified against the Handbook’s worked factors (SPV 0.642, UPV 11.94, UPV* 13.89 and 4.8562). Regional fuel-price indices are not embedded; the tool uses one real escalation rate and points to the annual supplement / BLCC. |
| NIST Chemistry WebBook · Thermophysical Properties of Fluid Systems / REFPROP | **Linked** | Reference row plus source link on the superheat and subcooling tools for obtaining saturation temperatures. Tabulating refrigerant equations of state is out of scope for a single file. |
| CONTAM, LoopDA, HVAC-Cx, HVACSIM+ | **Linked only** | Multizone airflow networks, loop-equation opening sizing and fault detection need weather files and building models; a reference row points to the NIST multizone modeling page. |
| Energy Savings and Moisture Transfer Calculator (ORNL / NIST / ABAA) | **Not adopted** | Driven by a database of pre-run EnergyPlus / CONTAM results, not a formula. |
| NIST SP 811 | Already used | Unit-conversion factors; remains the source for the converter. |

Calculator count: **214**. New tools carry hints on every field, cite tags, source links, hero labels and essentials; `scripts/verify.mjs` gained 47 assertions covering them.

## Bug and security pass (2026-09-13)

Method: static review of every `innerHTML` sink, a headless fuzz of all 209 calculators (boundary values, every select option, 8,360 in-range random input sets) and all 32 × n² unit-pair conversions, plus a `localStorage` tampering test and a desktop/mobile UI smoke run.

Results:

- Calculator engine: no `NaN` / `Infinity` / `undefined` reached the result panel; every out-of-range input produced a labelled validation message. All user-controlled strings pass through `esc()`; select values are validated against the option list before use.
- Fixed: collapsible group headers rendered `<h2>` inside `<button>` (invalid HTML) and a late CSS rule made the Favorites / Recent headings lose their section styling. Headers are now `<h2><button>` with a single style source.
- Fixed: on mobile the header search had no visible result list, so Enter navigated blindly. A results list now appears under the search field; picking a result clears the search.
- Fixed: a persisted `favorites` filter with zero favorites produced an empty sidebar on load. It now falls back to All, and the empty state explains how to pin a tool.
- Fixed: `Recent` ignored deep links and browser back/forward; the hashchange path now records recents.
- Hardened: `localStorage` prefs are sanitized on load (favorites/recents filtered to known ids, `collapsed` reduced to known groups with boolean values, filter allow-listed) so a tampered or stale payload cannot grow or break the nav.
- Hardened: added a `Content-Security-Policy` meta (no remote scripts, no connect/frames/objects, fonts only from jsdelivr, `base-uri 'none'`) and a `vercel.json` with CSP + `frame-ancestors 'none'`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `COOP`. Inline script/style still need `'unsafe-inline'` because the app is a single file; a hash-pinned `script-src` is the next step if the build ever emits a separate JS asset.
- Fixed (ported from PR #15, which had gone stale against `main`): checklist heroes said "Checklist items marked OK" while the scored unit was `items needing attention` (T&P discharge, IRC install, and every documentation gate that fell through to the generic label). `resultLabelFor` now keys the hero off the unit. Hood-capacity copy no longer implies editable rates or a "Rate override" section; the cells are fixed IMC 2024 table values.
- Cleanup: removed a dead debounce timer, a hidden duplicate mobile search input, and a duplicated favorite-toggle handler on the context chip; escaped group names / calculator names in the mobile menu and `data-group` attributes.

## Priority additions completed in this audit

### IMC §307.2.3 condensate overflow protection

Added a path gate for the damage trigger and auxiliary protection families. It intentionally does not certify pan dimensions, termination locations, device listing, or wiring.

### IMC §606.2 duct smoke detector gate

Added screens for:

- individual return systems over 2,000 cfm,
- shared common ducts/plenums over 2,000 cfm combined,
- return-air risers serving two or more stories over 15,000 cfm.

Exceptions, physical detector count/location, shutdown sequence, alarm integration, and NFPA 72 coordination remain manual.

### Manual D friction-rate preparation

Added:

`FR = (equipment external static − component deductions) × 100 / total effective length`

This is preliminary engineering math, not a replacement for blower tables, fitting effective lengths, room-by-room airflow, sound, leakage, or balancing.

### IMC §508 exhaust / makeup-air balance

Added replacement-air deficit arithmetic using `required replacement = total exhaust + design net exfiltration` and user-approved dedicated, transfer, and HVAC air credits. The tool does not invent an allowable pressure target or approve an air source.

### IMC §403 multizone outdoor air

Added population diversity, uncorrected outdoor air, and system-intake calculations. System ventilation efficiency remains a source-verified user input; no efficiency table cells are copied.

### IMC §404 parking-garage ventilation

Added full-on and nonzero standby airflow plus a CO + NO₂ detector/listing/control gate for automatic operation. No generic contaminant setpoints are invented.

### Cross-code and refrigerant-path handoffs

Added a CSST electrical-bonding receiver and nonnumeric ASHRAE 15 / 15.2 charge-review checklists. The existing path gate now links to those reviews and machinery-room ventilation.

### Model-code location, kitchen, access, and piping screens (follow-on)

Added published-distance and formula screens without inventing proprietary table cells:

- IMC §401.4 outdoor-air intake separation
- IMC §501.3.1 exhaust outlet termination by class
- IMC §506.3.4 grease-duct velocity (≥500 fpm)
- IMC §506.3.7 grease-duct slope (1/4:12 or 1:12)
- IMC §306 appliance access / service-space checklist
- IMC §601.5 return-air source restriction gate
- IFGC §409.5 / §411.1.3 shutoff location and flexible-connector length
- IMC Chapter 11 refrigerant-piping documentation gate (still no charge / RCL / mmax)

### Additional code screens and trades math (follow-on)

- IFGC §503.8 through-wall vent-terminal key-row screen
- IMC §504.7 dryer makeup-air trigger (>200 cfm / closet opening)
- IMC §506.3.6 grease-duct clearances to combustibles / noncombustibles
- IMC §603.9 duct sealing documentation gate (no invented leakage %)
- Net free area, boiler horsepower, chiller kW/ton, cooling-tower approach, compression ratio, pump head from ΔP, air-density altitude estimate, open-belt length

### Cleanout / combustion / more trades math (follow-on)

- IMC §506.3.8 grease-duct cleanout spacing (≤20 ft horizontal)
- IFGC §304.9 mechanical combustion air (0.35 cfm per 1,000 BTU/h)
- IMC §507 Type I hood documentation gate (no overhang table cells)
- IMC §603.6 flexible-duct installation checklist (no invented max length)
- Hydraulic diameter, velocity pressure, stack-effect pressure, pipe volume/fill, LMTD, evaporator/condenser TD, net oil pressure

### Roof access, dryer termination, and more trades math (follow-on)

- IMC §306.5 roof-appliance access documentation gate
- IMC §908 cooling-tower / evaporative-condenser documentation gate
- IMC §504.9 dryer-exhaust termination key-row clearances
- Duct aspect ratio, fan brake horsepower, coil sensible capacity
- Condenser heat rejection, wet-bulb depression, Reynolds number
- Valve Cv flow, expansion-tank acceptance estimate, condensate from latent load


### Attic / underfloor access and more trades math (follow-on)

- IMC §306.3 attic-appliance access documentation gate
- IMC §306.4 underfloor-appliance access documentation gate
- IMC §603.10 duct support / hanger documentation gate
- IMC §1105 machinery-room documentation gate (no rate/ppm tables)
- Outdoor-air fraction, coil bypass factor, air horsepower
- Heat-exchanger effectiveness, Darcy friction head (user-supplied f)
- Steam mass from load, refrigerant mass flow, fitting equivalent-length sum

### Audit gap fill — missing HVACR calculators built

Gap analysis against common HVACR field/design tasks and 2024 IMC / IFGC / IECC scopes (still no invented table cells):

**Code documentation gates added**
- IMC Chapter 5 hazardous exhaust
- IMC §513 smoke control
- IECC C403 ventilation / DCV controls
- IECC duct insulation (R-value from adopted table, not digitized here)
- IFGC Chapter 4 gas piping
- IMC §1209 radiant floor
- Makeup-air heater documentation
- IMC Chapter 11 refrigerant joints / strength & leak tests

**Formula / conversion tools added**
- EER from capacity & watts, heating COP, electric heat kW, gas input from output/efficiency
- NPSHa, head→psi, hydronic load from GPM, tower heat rejection
- Duct area from velocity, reheat load, coil contact factor, flash-steam fraction
- Pressurization CFM, SG flow index, infiltration from ACH, manifold pressure unit convert

**Still deferred (need licensed tables / methodology)**
- IFGC vent capacity and gas-pipe diameter tables
- ASHRAE 15 / 15.2 charge, RCL, mmax, and A2L ppm rows
- Full Manual J / D / S
- IECC efficiency / economizer / insulation numeric tables

### Continued HVACR expansion on 2024 codes

- IMC §602 plenum documentation
- IMC §505 domestic kitchen exhaust documentation
- IMC §918 forced-air furnace documentation
- IECC C403 fan-power path documentation
- IMC §1109 refrigerant shaft/concealed piping documentation
- Chilled-water GPM, tower/condenser range, heat of compression, net refrigeration effect
- Vacuum unit conversion, part-load ratio, tons→thermal kW, duct leakage %, filter face velocity, oil-cooler heat

### More HVACR tools on 2024 model codes

Added documentation gates and formula tools without inventing proprietary table cells:

- IMC §607 fire/smoke damper documentation
- IMC Chapter 12 hydronic piping documentation
- IMC Chapter 10 boiler safety documentation
- IECC C403 economizer path documentation
- IMC Chapter 11 refrigerant classification / occupancy documentation
- IFGC Chapter 5 vent-connector documentation
- Coil face area, COP from EER, Carnot COP, psig→psia
- Flash-gas quality, volumetric efficiency, refrigerant line velocity
- Heat-pump balance point, chiller approach

### Single 2024 code edition

The code-edition dropdown was removed. Screening is fixed to the latest embedded 2024 model-code pack (IMC / IFGC / IPC / IECC). Copy still states that the AHJ-adopted edition and amendments govern.

### Audit continue — public math + code docs (2026-09-13)

Added **24** calculators from the coverage audit without digitizing licensed tables:

**Field / engineering math**
- Fluid volumetric flow from mass · SG · cp path, water ΔT from load/GPM, leaving-air dry-bulb, SCFM↔ACFM
- Pump brake horsepower, hp↔kW, ton-hours, natural-gas MCF, propane gallons from BTU
- Cooling-tower evaporation, blowdown from cycles of concentration, chiller lift
- Diversity factor, load factor, series U-factor, wind velocity pressure, Stull wet-bulb estimate
- Heat reclaim, VAV fraction of design

**Documentation gates**
- IMC §504 dryer exhaust docs, §928 evaporative cooler docs, §309 thermostat/control docs, §603 duct construction docs
- IFGC Chapter 5 venting documentation gate

Nav cleanup: Sources and Changelog removed from the top header (deep links still work). Global Please note banner already removed; AHJ bar remains.

## Needs verified source data before implementation

These are important, but should not be filled with guessed values:

1. **IFGC Tables 504.2 / 504.3 vent capacity** — current tool prepares the required inputs only.
2. **IFGC Table 402.4(x) gas-pipe sizing** — current tool calculates demand and developed length, then hands off to the adopted table.
3. **ASHRAE 15.2 charge / RCL / mmax** — current tool is a path gate only.
4. **ASHRAE 15 A2L/B2L detector concentration rows** — no ppm rows are digitized.
5. **Full Manual J / D / S implementations** — ACCA procedures are broader than a compact formula and require licensed methodology/data.
6. **IECC equipment efficiency, economizer, insulation, and controls tables** — climate zone, system type, capacity, exceptions, and adopted edition must be modeled together.

## Recommended next sequence

1. More **docs / path / checklist** tools (IMC kitchen CFM path without rates, IFGC Category I/IV vent path detail) — no table cells.
2. Public **psych / air / hydronic** estimators only when the equation is industry-standard and not a copyrighted table.
3. Independently verify every existing `EXAMPLE_UNVERIFIED` table/formula cell against an authorized source.
4. Never paste Manual J/D worksheet grids, IMC Table 403.3.1.1 full rates, or IFGC Annex A tables into the SPA.
5. Optional UX: pin favorites — does not require new licensed content.
6. Split the single-file app into tested data, calculation, and UI modules before the table inventory grows substantially.

## Public references used for this audit

- [2024 International Mechanical Code](https://codes.iccsafe.org/content/IMC2024V1.0)
- [2024 International Fuel Gas Code](https://codes.iccsafe.org/content/IFGC2024V1.0)
- [ICC CodeNotes: indoor combustion-air methods](https://www.iccsafe.org/building-safety-journal/bsj-technical/codenotes-gas-appliance-combustion-ventilation-and-dilution-air-part-2-indoor-combustion-air-methods/)
- [ACCA technical manuals](https://www.acca.org/standards/technical-manuals)
- [ASHRAE Standards 15 and 15.2](https://www.ashrae.org/technical-resources/bookstore/standards-15-34)

# HVAC Workbench

Single-file static HVAC calculator workbench (`index.html`).

Live site: https://hvac-workbench.vercel.app

Includes heating/cooling, air & ducts, refrigeration, hydronics, energy/math tools, unit conversion, and **34** calculators with code-oriented screening tools:

- **Global AHJ / code-edition setting** — one app-wide model-pack picker plus a strong legal disclaimer banner (not a substitute for adopted code, AHJ, or PE)
- **Changelog** — public SPA changelog and Code Editions note (national US screening; model packs; AHJ always)
- **Outdoor air (IMC 403)** — breathing-zone and zone outdoor airflow (`Vbz`, `Voz`) from a practical subset of 2024 IMC Table 403.3.1.1 rates, with air-distribution effectiveness `Ez`
- **Local exhaust (IMC)** — exhaust-column helper for toilets, lockers, kitchens, parking garages, and similar spaces
- **Combustion air (IFGC 304)** — indoor volume, outdoor openings, combination, and mechanical combustion-air screening
- **Condensate drain size (IMC 307.2.2 ≡ IPC 314.2.2)** — minimum drain diameter by cooling capacity, with slope notes
- **Venting category (IFGC Ch 5)** — Category I–IV / direct-vent / integral routing, Category I §504 input prep (tables not digitized), §503.10.4 hard block
- **Dryer duct length (IMC 504.9.4.1)** — Method 1 equivalent-length screen vs 35 ft, with fitting EL screening helpers and makeup-air note
- **Hood capacity (IMC §§507.2.10 / 507.3.4)** — exact Type I / Type II cfm-per-linear-foot × length; short-circuit supply → min total exhaust; mixed duties use heaviest rate; §508.1 makeup tip
- **Gas pipe sizer (IFGC 402)** — longest / branch / hybrid method helper, required cfh + developed length (no invented diameters), CSST bonding checklist (§310.2 / §310.3)
- **Machinery-room vent (ASHRAE 15 · Phase 1)** — continuous `max(0.5×ft², 20×persons)` tagged `EXAMPLE_UNVERIFIED`; emergency `Q=100√G` for non-A2L; hard-stop A2L from √G path; no invented ppm tables
- **T&P discharge (IPC §§504.4–504.6)** — screening checklist of typical relief-valve and discharge-piping items

Open `index.html` in a browser, or deploy the repo root as a static site.

# HVAC Workbench

Single-file static HVAC calculator workbench (`index.html`).

Live site: https://hvac-workbench.vercel.app

Includes heating/cooling, air & ducts, refrigeration, hydronics, energy/math tools, unit conversion, and **32** code-oriented calculators:

- **Outdoor air (IMC 403)** — breathing-zone and zone outdoor airflow (`Vbz`, `Voz`) from a practical subset of 2024 IMC Table 403.3.1.1 rates, with air-distribution effectiveness `Ez`
- **Local exhaust (IMC)** — exhaust-column helper for toilets, lockers, kitchens, parking garages, and similar spaces
- **Combustion air (IFGC 304)** — indoor volume, outdoor openings, combination, and mechanical combustion-air screening
- **Condensate drain size (IMC 307.2.2 ≡ IPC 314.2.2)** — minimum drain diameter by cooling capacity, with slope notes
- **Venting category (IFGC Ch 5)** — Category I–IV / direct-vent / integral routing, Category I §504 input prep (tables not digitized), §503.10.4 hard block
- **Dryer duct length (IMC 504.9.4.1)** — Method 1 equivalent-length screen vs 35 ft, with fitting EL screening helpers and makeup-air note
- **Hood capacity (IMC 507)** — Type I / Type II cfm-per-linear-foot × length screening with editable AHJ-verify defaults
- **Gas pipe sizer (IFGC 402)** — longest / branch / hybrid method helper, required cfh + developed length (no invented diameters), CSST bonding checklist (§310.2 / §310.3)

Open `index.html` in a browser, or deploy the repo root as a static site.

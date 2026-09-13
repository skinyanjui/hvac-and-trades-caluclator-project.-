# HVAC Workbench coverage audit

Reviewed September 12, 2026.

## Scope

HVAC Workbench is a national-US **screening and engineering-math** utility. It is not an adopted-code database, load-calculation package, fire-alarm design tool, or compliance certificate. The AHJ-adopted code, local amendments, equipment listings, manufacturer instructions, and licensed design professionals govern.

“All codes” is not a safe or finite implementation target: adoption varies by jurisdiction, many referenced standards and tables are licensed, and project-specific exceptions change outcomes. This audit therefore separates:

1. calculations that can be derived from public formulas,
2. bounded path gates and checklists,
3. table-driven tools that require verified source data before implementation.

## Current coverage

The app now contains 100 calculators across:

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

### Code-context selector trust fix

The selector now states that non-2024 choices are project context only and do not transform embedded 2024 values. This removes the prior implication that changing a label swapped the underlying data pack.

## Needs verified source data before implementation

These are important, but should not be filled with guessed values:

1. **IFGC Tables 504.2 / 504.3 vent capacity** — current tool prepares the required inputs only.
2. **IFGC Table 402.4(x) gas-pipe sizing** — current tool calculates demand and developed length, then hands off to the adopted table.
3. **ASHRAE 15.2 charge / RCL / mmax** — current tool is a path gate only.
4. **ASHRAE 15 A2L/B2L detector concentration rows** — no ppm rows are digitized.
5. **Full Manual J / D / S implementations** — ACCA procedures are broader than a compact formula and require licensed methodology/data.
6. **IECC equipment efficiency, economizer, insulation, and controls tables** — climate zone, system type, capacity, exceptions, and adopted edition must be modeled together.

## Recommended next sequence

1. Independently verify every existing `EXAMPLE_UNVERIFIED` table/formula cell against an authorized source.
2. Replace the IRC installation shell with a section-mapped checklist after source review.
3. Add a jurisdiction/adoption profile only when trustworthy adoption data and amendment provenance are available.
4. Add table-backed calculators one model pack at a time, with source edition, row/column provenance, and regression fixtures.
5. Split the single-file app into tested data, calculation, and UI modules before the table inventory grows substantially.

## Public references used for this audit

- [2024 International Mechanical Code](https://codes.iccsafe.org/content/IMC2024V1.0)
- [2024 International Fuel Gas Code](https://codes.iccsafe.org/content/IFGC2024V1.0)
- [ICC CodeNotes: indoor combustion-air methods](https://www.iccsafe.org/building-safety-journal/bsj-technical/codenotes-gas-appliance-combustion-ventilation-and-dilution-air-part-2-indoor-combustion-air-methods/)
- [ACCA technical manuals](https://www.acca.org/standards/technical-manuals)
- [ASHRAE Standards 15 and 15.2](https://www.ashrae.org/technical-resources/bookstore/standards-15-34)

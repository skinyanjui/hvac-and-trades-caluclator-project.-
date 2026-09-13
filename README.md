# HVAC Workbench

Single-file static HVAC calculator workbench (`index.html`).

Live site: https://hvac-workbench.vercel.app

Includes public field-formula helpers (1.08/0.69/4.5/500, pitot velocity, therms, etc.) plus heating/cooling, air & ducts, refrigeration, hydronics, energy/math tools, **32** unit-conversion groups, and **209** calculators with code-oriented screening tools:

- **2024 model-code screening** — fixed to the latest embedded 2024 IMC / IFGC / IPC / IECC pack, with a strong legal disclaimer (not a substitute for adopted code, AHJ, or PE)
- **Changelog** — public SPA changelog (national US screening against 2024 model codes; AHJ always)
- **Outdoor air (IMC 403)** — breathing-zone and zone outdoor airflow (`Vbz`, `Voz`) from a practical subset of 2024 IMC Table 403.3.1.1 rates, with air-distribution effectiveness `Ez`
- **Local exhaust (IMC)** — exhaust-column helper for toilets, lockers, kitchens, parking garages, and similar spaces
- **Combustion air (IFGC 304)** — indoor volume, outdoor openings, combination, and mechanical combustion-air screening
- **Condensate drain size (IMC 307.2.2 ≡ IPC 314.2.2)** — minimum drain diameter by cooling capacity, with slope notes
- **Venting category (IFGC Ch 5)** — Category I–IV / direct-vent / integral routing, Category I §504 input prep (tables not digitized), §503.10.4 hard block
- **Dryer duct length (IMC 504.9.4.1)** — Method 1 equivalent-length screen vs 35 ft, with fitting EL screening helpers and makeup-air note
- **Hood capacity (IMC §§507.2.10 / 507.3.4)** — exact Type I / Type II cfm-per-linear-foot × length; short-circuit supply → min total exhaust; mixed duties use heaviest rate; §508.1 makeup tip
- **Gas pipe sizer (IFGC 402)** — longest / branch / hybrid method helper, required cfh + developed length (no invented diameters), CSST bonding checklist (§310.2 / §310.3 stays source), and `crosscode.csst_bonding_nec_handoff` when CSST is present
- **Clearance reduction (IFGC §308)** — deep Table 308.2 LOOKUP (8×5×2) with linear interpolation on columns 36/18/12/9/6; all cells `EXAMPLE_UNVERIFIED` (Phoenix FG 2024 screen); hard blocks for listing disallow / CA·draft-hood·service interference / no extrapolate below 6 in / MVP stop >36 in / masonry Above N/A; UL 1618 listing path only
- **Machinery-room vent (IMC / ASHRAE 15 · Phase 2)** — continuous `max(0.5×ft², 20×persons)` tagged `EXAMPLE_UNVERIFIED` (IMC §1105.6.3.1 + optional 18°F rise note); `non_2L_sqrtG` (A1/A2/A3/B1/B2/B3) `Q=100√G` per IMC §1105.6.3.2 Eq 11-2; `a2l_level1_level2` (A2L **and** B2L) never √G — Level 2 from ASHRAE 15 Addendum q (`P=DP+14.70`, `Q*`, `G*`, Eq 8-1/8-2/8-3, `Q≥Q1`, 2-sig round-up, multi-refrig → max Q) tagged `EXAMPLE_UNVERIFIED` / 15-2024 confirm; optional UMC → `verify_manual`
- **IRC bath/kitchen + WHMV (IRC M1503 / M1505)** — residential local exhaust (kitchen 100/25, bath 50/20), makeup trigger, WHMV Eq 15-1 (`0.01A`), bath duct-length screen; EXAMPLE_UNVERIFIED; refuses IMC `code_set`; distinct from IMC vent tools
- **ASHRAE 15.2 path gate** — SPEC-ASHRAE152-PATH-GATE only (`15_2_residential` | `std15_imc_ch11` | `blocked_need_ahj`); flags + deep-link to IRC install checklist; **no** charge/RCL/mmax numerics; `verified=false`
- **IRC install checklist (Phase 2)** — citation-backed screening items (IRC M1411 / M1601 / M1305–M1307 / M1401 / Ch 24 + access/supports); EXAMPLE_UNVERIFIED; no charge fields
- **T&P discharge (IPC §§504.4–504.6)** — screening checklist of typical relief-valve and discharge-piping items
- **Condensate overflow protection (IMC §307.2.3)** — path gate for auxiliary pans, overflow drains, and listed shutoff devices when primary-drain overflow could damage building components
- **Duct smoke detector gate (IMC §606.2)** — screens individual return-air, shared-duct, and multistory-riser airflow triggers while keeping exceptions, detector layout, controls, and NFPA 72 coordination manual
- **Duct friction rate (Manual D preparation)** — available static pressure and total effective length calculation without pretending to complete a duct design
- **Exhaust / makeup-air balance (IMC §508)** — replacement-air deficit arithmetic; pressure targets and transfer-air approval remain with the designer and AHJ
- **Multizone outdoor air (IMC §403)** — aggregate diversity, uncorrected outdoor air, and system intake using a source-verified `Ev` (no embedded efficiency table)
- **Parking garage ventilation (IMC §404)** — full-on / standby airflow with a CO + NO₂ automatic-control gate and no invented ppm setpoints
- **ASHRAE 15 / 15.2 charge reviews** — downstream documentation gates from the path selector; no charge, RCL, OEL, or `mmax` limits are calculated
- **CSST bonding handoff receiver** — receives the IFGC §310 cross-code handoff for adopted NEC / listing verification without calculating conductor size
- **Engineering & trades helpers** — equivalent round duct, coil/grille face velocity, CFM per ton, sensible heat ratio, cooling tons, pump affinity laws, hydronic pipe velocity, fuel-gas operating cost, and sheave/belt RPM
- **Model-code location & kitchen screens** — IMC outdoor-air intake separation, exhaust outlet termination, Type I grease-duct velocity (≥500 fpm) and slope, grease-duct clearances, dryer makeup-air triggers, and duct-sealing documentation
- **Access / return / gas / refrigerant gates** — IMC §306 appliance access checklist, IMC return-air source restrictions, IFGC appliance shutoff & connector length, IFGC §503.8 vent-terminal key-row screen, and IMC Chapter 11 refrigerant-pipe documentation (no charge limits)
- **More trades math** — net free area, boiler horsepower, chiller kW/ton, cooling-tower approach, compression ratio, pump head from ΔP, air-density altitude correction, open-belt length, hydraulic diameter, velocity pressure, stack effect, pipe volume, LMTD, evaporator/condenser TD, and net oil pressure
- **More kitchen / combustion screens** — IMC §506.3.8 grease-duct cleanout spacing, IFGC §304.9 mechanical combustion air (0.35 cfm/1,000 BTU/h), IMC §507 Type I hood documentation, and IMC §603.6 flexible-duct installation checklist
- **More access / termination / trades tools** — IMC §306.5 roof-appliance access docs, IMC §908 cooling-tower documentation, IMC §504.9 dryer termination key-row screen, duct aspect ratio, fan BHP, coil sensible capacity, condenser heat rejection, wet-bulb depression, Reynolds number, valve Cv flow, expansion-tank estimate, and condensate from latent load
- **Audit gap fill** — IMC Ch 5 hazardous exhaust, §513 smoke control, IECC DCV & duct-insulation docs, IFGC Ch 4 gas-piping docs, radiant-floor docs, makeup-air heater docs, refrigerant joint/test docs; plus EER/COP/electric heat/gas input, NPSHa, head→psi, hydronic/tower load, duct area, reheat, contact factor, flash steam, pressurization, SG flow, infiltration, manifold pressure\n- **Continued HVACR / 2024-code screens** — IMC §602 plenums, §505 kitchen exhaust, §918 furnaces, §1109 shaft piping, IECC C403 fan-power docs, plus CHW flow, tower range, heat of compression, NRE, vacuum units, PLR, tons↔kW, duct leakage %, filter face velocity, oil-cooler heat\n- **More HVACR / 2024-code screens** — IMC §607 dampers, Ch 10 boilers, Ch 11 refrigerant class, Ch 12 hydronics, IECC C403 economizer docs, IFGC Ch 5 vent-connector docs, plus COP/EER, Carnot COP, flash-gas quality, line velocity, balance point, and chiller approach
- **Attic / underfloor / machinery docs + more trades math** — IMC §306.3 attic access, IMC §306.4 underfloor access, IMC §603.10 duct support docs, IMC §1105 machinery-room docs, outdoor-air fraction, coil bypass factor, air horsepower, heat-exchanger effectiveness, Darcy friction head (user f), steam mass from load, refrigerant mass flow, and fitting equivalent-length sum
- **Audit continue (public math + docs)** — fluid Q, water ΔT, leaving-air DB, SCFM↔ACFM, pump BHP, hp↔kW, ton-hours, gas MCF, propane gallons, tower evaporation/blowdown, chiller lift, diversity/load factor, series U-factor, wind VP, Stull wet-bulb, heat reclaim, VAV fraction, plus IMC §504 / §928 / §309 / §603 and IFGC Ch 5 documentation gates

See [`AUDIT.md`](AUDIT.md) for the current coverage audit, explicit source-data blockers, and prioritized follow-up work.

Open `index.html` in a browser, or deploy the repo root as a static site.

## Verify

```bash
node scripts/verify.mjs
```

Runs calculator default smoke checks, MRVENT / §308 / IRC WHMV / 15.2 path-gate acceptance cases, icon + keyword coverage, and unit-group count.

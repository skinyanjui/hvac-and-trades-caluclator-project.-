# HVACR Tools

Single-file static HVACR calculator app (`index.html`).

Live site: https://hvac-workbench.vercel.app

Includes heating/cooling, air & ducts, refrigeration, hydronics, energy/math tools, unit conversion, and **64** calculators with code-oriented screening tools:

- **Global AHJ / code-edition setting** — one app-wide model-pack picker plus a strong legal disclaimer banner (not a substitute for adopted code, AHJ, or PE)
- **Changelog** — public SPA changelog and Code Editions note (national US screening; model packs; AHJ always)
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
- **Model-code location & kitchen screens** — IMC outdoor-air intake separation, exhaust outlet termination, Type I grease-duct velocity (≥500 fpm) and slope
- **Access / return / gas / refrigerant gates** — IMC §306 appliance access checklist, IMC return-air source restrictions, IFGC appliance shutoff & connector length, and IMC Chapter 11 refrigerant-pipe documentation (no charge limits)

See [`AUDIT.md`](AUDIT.md) for the current coverage audit, explicit source-data blockers, and prioritized follow-up work.

Open `index.html` in a browser, or deploy the repo root as a static site.

## Verify

```bash
node scripts/verify.mjs
```

Runs calculator default smoke checks, MRVENT / §308 / IRC WHMV / 15.2 path-gate acceptance cases, icon + keyword coverage, and unit-group count.

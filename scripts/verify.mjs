#!/usr/bin/env node
/**
 * Headless regression harness for HVAC Workbench (index.html).
 * Extracts calculator logic (cuts UI bootstrap) and runs acceptance checks.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
const bootstrapCut = script.indexOf('shell();const initial=');
const metaCut = script.indexOf('document.querySelector(\'meta[name="description"]\')');
const cut = Math.min(...[bootstrapCut, metaCut].filter(index => index >= 0));
if (!Number.isFinite(cut)) throw new Error('Could not locate UI bootstrap cut point');
let body = script.slice(0, cut);
for (const name of ['calculators', 'essentials', 'keywords', 'fmt', 'result', 'field', 'choice', 'units', 'icons']) {
  body = body.replace(new RegExp(`\\bconst ${name}\\b`), `var ${name}`);
  body = body.replace(new RegExp(`\\blet ${name}\\b`), `var ${name}`);
}

const sandbox = {
  console,
  Math,
  Error,
  Number,
  String,
  Array,
  Object,
  Set,
  Map,
  JSON,
  parseInt,
  parseFloat,
  isFinite,
  isNaN,
  Infinity,
  NaN,
  undefined,
  localStorage: {getItem: () => null, setItem() {}, removeItem() {}},
  location: {hash: '', pathname: '/', href: 'http://localhost/'},
};
vm.createContext(sandbox);
vm.runInContext(body + `
  globalThis.calculators = calculators;
  globalThis.essentials = essentials;
  globalThis.keywords = keywords;
  globalThis.units = units;
  globalThis.icons = icons;
  globalThis.ashrae152PathGate = typeof ashrae152PathGate !== 'undefined' ? ashrae152PathGate : null;
`, sandbox);

const {calculators, essentials, keywords, units, icons} = sandbox;
const byId = Object.fromEntries(calculators.map(c => [c.id, c]));
const tests = [];
const assert = (name, cond, detail) => {
  tests.push({name, ok: !!cond, detail});
  if (!cond) console.error('FAIL', name, detail ?? '');
};

const run = (id, vals = {}) => {
  const c = byId[id];
  if (!c) throw new Error(`Unknown calculator ${id}`);
  const defaults = Object.fromEntries(c.fields.map(f => [f.key, f.value]));
  return c.calculate({...defaults, ...vals});
};

assert('calculator count', calculators.length === 112, calculators.length);
assert('unique ids', new Set(calculators.map(c => c.id)).size === calculators.length);
assert('unit groups 16', Object.keys(units).length === 16, Object.keys(units).join(', '));

const usedIcons = [...new Set(calculators.map(c => c.icon))];
assert('icon coverage', usedIcons.every(i => icons[i]), usedIcons.filter(i => !icons[i]).join(','));
assert('keyword coverage', calculators.every(c => keywords[c.id]), calculators.filter(c => !keywords[c.id]).map(c => c.id).join(','));
assert('essentials coverage', calculators.every(c => essentials[c.id]), calculators.filter(c => !essentials[c.id]).map(c => c.id).join(','));

const expectedDefaultBlockers = new Set(['condensateoverflow']);
for (const c of calculators) {
  try {
    const r = run(c.id);
    assert(`defaults:${c.id}`, !expectedDefaultBlockers.has(c.id) && r != null && r.value !== undefined, `${r?.value} ${r?.unit}`);
  } catch (e) {
    assert(`defaults:${c.id}`, expectedDefaultBlockers.has(c.id), e.message);
  }
}

assert('mrvent continuous 400/2 → 200', Math.abs(run('mrvent', {mode: 'continuous', area: 400, persons: 2}).value - 200) < 1e-9);
assert('mrvent A1 G=100 → 1000', Math.abs(run('mrvent', {mode: 'emergency', safetyGroup: 'A1', charge: 100}).value - 1000) < 1e-6);
{
  const r = run('mrvent', {mode: 'emergency', safetyGroup: 'A2L', charge: 100, designPressure: 250, area: 400, persons: 2});
  assert('mrvent A2L Level2 → 9800', Math.abs(r.value - 9800) < 1, r.value);
}
assert('mrvent UMC verify_manual', /verify_manual/.test(JSON.stringify(run('mrvent', {codeFamily: 'umc', mode: 'emergency', safetyGroup: 'A1', charge: 100}))));

assert('308 18→6', Math.abs(run('clearance308', {protection: '5', orientation: 'Above', required: 18, listingAllows: 'yes', interferes: 'no'}).value - 6) < 1e-9);
assert('308 15→5', Math.abs(run('clearance308', {protection: '5', orientation: 'Above', required: 15, listingAllows: 'yes', interferes: 'no'}).value - 5) < 1e-9);
{
  let stopped = false;
  try { run('clearance308', {protection: '5', orientation: 'Above', required: 40, listingAllows: 'yes', interferes: 'no'}); }
  catch { stopped = true; }
  assert('308 >36 hard stop', stopped);
}

assert('WHMV 2000/3 → 50', Math.abs(run('ircvent', {mode: 'whmv', codeSet: 'irc', area: 2000, bedrooms: 3, balanced_credit: 'no'}).value - 50) < 0.1);
assert('WHMV balanced → 35', Math.abs(run('ircvent', {mode: 'whmv', codeSet: 'irc', area: 2000, bedrooms: 3, balanced_credit: 'yes'}).value - 35) < 0.1);
{
  let refused = false;
  try { run('ircvent', {mode: 'local_bath', codeSet: 'imc'}); }
  catch (e) { refused = /IMC|refuse|IRC/i.test(e.message); }
  assert('ircvent refuses IMC', refused);
}

const pathCases = [
  [{building_type: 'one_two_family', system_listed: 'yes', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'no'}, '15_2_residential'],
  [{building_type: 'townhouse', system_listed: 'yes', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'no'}, '15_2_residential'],
  [{building_type: 'multifamily', system_listed: 'yes', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'no'}, '15_2_residential'],
  [{building_type: 'multifamily', system_listed: 'yes', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'yes'}, 'std15_imc_ch11'],
  [{building_type: 'commercial', system_listed: 'yes', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'no'}, 'std15_imc_ch11'],
  [{building_type: 'one_two_family', system_listed: 'no', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'no'}, 'std15_imc_ch11'],
  [{building_type: 'one_two_family', system_listed: 'unknown', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'no'}, 'blocked_need_ahj'],
];
for (const [vals, expect] of pathCases) {
  const r = run('ashrae152path', vals);
  assert(`path:${expect}:${vals.building_type}`, r.unit === expect || String(r.formula).includes(`path=${expect}`), `${r.unit} / ${r.formula}`);
}
{
  const r = run('ashrae152path', {building_type: 'commercial', system_listed: 'yes', serves_single_dwelling_or_sleeping_unit: 'yes', system_serves_common_or_multiple_units: 'no'});
  const reasons = (r.rows.find(row => row[0] === 'reasons') || [])[2] || '';
  assert('commercial reason not misleading', /commercial_building_not_15_2_residential/.test(reasons), reasons);
}

{
  const r = run('ircinstall', {});
  assert('ircinstall 8 items unknown by default', /8 unknown/.test(r.formula) || /of 8/.test(r.formula), r.formula);
  assert('ircinstall no charge fields', /not present/.test(JSON.stringify(r.rows)));
}

{
  const de = run('equivduct', {width: 12, height: 8}).value;
  assert('equivduct 12x8 ≈ 10.66', Math.abs(de - 1.30 * Math.pow(96, 0.625) / Math.pow(20, 0.25)) < 1e-9, de);
}
assert('facevelocity 1200 / 5 ft² → 240', Math.abs(run('facevelocity', {flow: 1200, width: 30, height: 24}).value - 240) < 1e-9);
assert('cfmton 1400 / 3 → ~466.67', Math.abs(run('cfmton', {flow: 1400, capacity: 36000}).value - 1400 / 3) < 1e-9);
assert('shr 28k/36k → 7/9', Math.abs(run('shr', {sensible: 28000, total: 36000}).value - 28000 / 36000) < 1e-12);
assert('tons 36000 → 3', Math.abs(run('tons', {capacity: 36000}).value - 3) < 1e-12);
assert('pumplaws half speed → half flow', Math.abs(run('pumplaws', {rpm1: 1750, rpm2: 875, flow: 40, head: 40, power: 1.5}).value - 20) < 1e-9);
assert('sheave 1750×4/6 → ~1166.67', Math.abs(run('sheave', {rpmDriver: 1750, driverDia: 4, drivenDia: 6}).value - 1750 * 4 / 6) < 1e-9);
{
  const r = run('pipevelocity', {flow: 20, diameter: 1.049});
  const area = Math.PI * Math.pow(1.049 / 12, 2) / 4;
  const expect = (20 / (7.48051948 * 60)) / area;
  assert('pipevelocity 20 gpm / 1.049 in', Math.abs(r.value - expect) < 1e-9, r.value);
}
assert('gascost 80k×8×30 / 1e5 × 1.2', Math.abs(run('gascost', {input: 80000, hours: 8, days: 30, rate: 1.2}).value - (80000 * 8 * 30 / 100000) * 1.2) < 1e-9);

{
  const r = run('intakesep', {});
  assert('intakesep defaults open flood unk', r.value >= 1, r.value);
}
assert('intakesep clear defaults with flood yes', run('intakesep', {flood: 'yes'}).value === 0);
assert('exhaustterm environmental defaults pass', run('exhaustterm', {}).value === 0);
assert('exhaustterm environmental too close to intake', run('exhaustterm', {intake: 5}).value >= 1);
{
  const r = run('greasevel', {flow: 2000, shape: 'rect', width: 18, height: 10});
  assert('greasevel 2000/1.25 → 1600', Math.abs(r.value - 1600) < 1e-9, r.value);
}
assert('greasevel below 500 fails note', /below 500|short of|is below/i.test(run('greasevel', {flow: 400, shape: 'rect', width: 18, height: 10}).note));
{
  const r = run('greaseslope', {run: 40, drop: 10, factoryBuilt: 'no'});
  assert('greaseslope 10in/40ft → 0.25 in/ft', Math.abs(r.value - 0.25) < 1e-9, r.value);
}
assert('greaseslope long run needs 1:12', /1:12/.test(run('greaseslope', {run: 80, drop: 20, factoryBuilt: 'no'}).formula));
assert('access306 defaults need attention', run('access306', {}).value >= 1);
assert('returnair defaults no flags', run('returnair', {}).value === 0);
assert('returnair closet yes flags', run('returnair', {closet: 'yes'}).value >= 1);
assert('gasshutoff flex defaults open unk', run('gasshutoff', {}).value >= 1);
assert('gasshutoff flex ok path', run('gasshutoff', {accessible: 'yes', upstream: 'yes'}).value === 0);
assert('refrigpipe defaults need attention', run('refrigpipe', {}).value >= 1);

assert('ventterm defaults clear', run('ventterm', {}).value === 0);
assert('ventterm nondirect beside needs 48 in', run('ventterm', {ventType: 'nondirect', windowRel: 'side_below', windowDist: 36}).value >= 1);
assert('dryermakeup defaults clear', run('dryermakeup', {}).value === 0);
assert('dryermakeup closet short opening fails', run('dryermakeup', {closet: 'yes', opening: 50, otherMakeup: 'na'}).value >= 1);
assert('dryermakeup high flow without makeup fails', run('dryermakeup', {exhaust: 250, closet: 'no', otherMakeup: 'na'}).value >= 1);
assert('greaseclear field defaults clear', run('greaseclear', {}).value === 0);
assert('greaseclear short combustible fails', run('greaseclear', {toCombust: 12}).value >= 1);
assert('ductseal defaults need attention', run('ductseal', {}).value >= 1);
assert('netfree 24×12×60% → 172.8', Math.abs(run('netfree', {width: 24, height: 12, freePct: 60, quantity: 1}).value - 172.8) < 1e-9);
assert('boilerhp 334750 → 10', Math.abs(run('boilerhp', {output: 334750}).value - 10) < 1e-12);
assert('kwton 70/200 → 0.35', Math.abs(run('kwton', {power: 70, capacity: 200}).value - 0.35) < 1e-12);
assert('tower 95/85/78 → 7 approach', Math.abs(run('tower', {hot: 95, cold: 85, wetbulb: 78}).value - 7) < 1e-12);
assert('compratio 250/70 → ~3.571', Math.abs(run('compratio', {suction: 70, discharge: 250}).value - 250 / 70) < 1e-12);
assert('pumphead 12 psi SG1 → ~27.727', Math.abs(run('pumphead', {dp: 12, sg: 1}).value - 12 * 2.3106) < 1e-9);
{
  const r = run('airdensity', {elevation: 5000, seaLevelCfm: 1000});
  const pr = Math.pow(1 - 6.87535e-6 * 5000, 5.2559);
  assert('airdensity 5000 ft density', Math.abs(r.value - 0.075 * pr) < 1e-9, r.value);
}
{
  const expect = 2 * 20 + 1.57 * (4 + 6) + Math.pow(2, 2) / (4 * 20);
  assert('beltlength 4/6/20', Math.abs(run('beltlength', {d1: 4, d2: 6, centers: 20}).value - expect) < 1e-9);
}

assert('greasecleanout 18 ft clear path', run('greasecleanout', {horizRun: 18, atChanges: 'yes', tight: 'yes', access: 'yes', vertical: 'na'}).value === 0);
assert('greasecleanout 25 ft fails spacing', run('greasecleanout', {horizRun: 25, atChanges: 'yes', tight: 'yes', access: 'yes', vertical: 'na'}).value >= 1);
assert('mechcombair 200k → 70 cfm', Math.abs(run('mechcombair', {input: 200000, provided: 80, interlock: 'yes', source: 'yes'}).value - 70) < 1e-12);
assert('hooddocs defaults need attention', run('hooddocs', {}).value >= 1);
assert('flexduct defaults need attention', run('flexduct', {}).value >= 1);
assert('hyddiam 12×8 → 9.6', Math.abs(run('hyddiam', {width: 12, height: 8}).value - 9.6) < 1e-12);
assert('velpress 4005 → 1', Math.abs(run('velpress', {velocity: 4005}).value - 1) < 1e-9);
{
  const expect = 7.65 * 30 * (1 / (20 + 460) - 1 / (70 + 460));
  assert('stackeffect 30 ft 70/20', Math.abs(run('stackeffect', {height: 30, indoor: 70, outdoor: 20}).value - expect) < 1e-9);
}
{
  const area = Math.PI * Math.pow(1.049 / 24, 2);
  const expect = area * 100 * 7.48051948;
  assert('pipevolume 1.049 in × 100 ft', Math.abs(run('pipevolume', {id: 1.049, length: 100, flow: 10}).value - expect) < 1e-9);
}
{
  const dt1 = 180 - 100, dt2 = 120 - 60;
  const expect = (dt1 - dt2) / Math.log(dt1 / dt2);
  assert('lmtd counterflow defaults', Math.abs(run('lmtd', {}).value - expect) < 1e-9);
}
assert('evaptd 35−25 → 10', Math.abs(run('evaptd', {box: 35, sst: 25}).value - 10) < 1e-12);
assert('condtd 110−95 → 15', Math.abs(run('condtd', {sct: 110, enter: 95}).value - 15) < 1e-12);
assert('oilpd 60−20 → 40', Math.abs(run('oilpd', {oil: 60, crank: 20}).value - 40) < 1e-12);


assert('roofaccess defaults need attention', run('roofaccess', {}).value >= 1);
assert('towerdocs defaults need attention', run('towerdocs', {}).value >= 1);
assert('dryerterm defaults clear distances with fittings yes', run('dryerterm', {backdraft: 'yes', screen: 'yes'}).value === 0);
assert('dryerterm short opening fails', run('dryerterm', {toOpening: 2, backdraft: 'yes', screen: 'yes'}).value >= 1);
assert('aspect 24×8 → 3', Math.abs(run('aspect', {width: 24, height: 8}).value - 3) < 1e-12);
assert('fanbhp 2000×1.5 / (6356×0.65)', Math.abs(run('fanbhp', {cfm: 2000, sp: 1.5, eff: 65}).value - (2000 * 1.5) / (6356 * 0.65)) < 1e-9);
assert('coilsens 1.08×1200×20 → 25920', Math.abs(run('coilsens', {cfm: 1200, dt: 20, factor: 1.08}).value - 25920) < 1e-9);
assert('heatrej 36000 + 3.5×3412.141633', Math.abs(run('heatrej', {cooling: 36000, power: 3.5}).value - (36000 + 3.5 * 3412.141633)) < 1e-6);
assert('wbdep 80−67 → 13', Math.abs(run('wbdep', {db: 80, wb: 67}).value - 13) < 1e-12);
{
  const dFt = 1.049 / 12;
  const expect = 4 * dFt / 0.0000121;
  assert('reynolds 4 fps / 1.049 in', Math.abs(run('reynolds', {velocity: 4, id: 1.049, nu: 0.0000121}).value - expect) < 1e-6);
}
assert('valvecv 10√(5/1) → ~22.361', Math.abs(run('valvecv', {cv: 10, dp: 5, sg: 1}).value - 10 * Math.sqrt(5)) < 1e-9);
assert('expansank 200×3%/0.5 → 12', Math.abs(run('expansank', {system: 200, expandPct: 3, acceptance: 0.5}).value - 12) < 1e-12);
assert('latcond 6000/1061 / 8.33', Math.abs(run('latcond', {latent: 6000, hfg: 1061}).value - (6000 / 1061) / 8.33) < 1e-9);

assert('atticaccess defaults need attention', run('atticaccess', {}).value >= 1);
assert('underfloor defaults need attention', run('underfloor', {}).value >= 1);
assert('ductsupport defaults need attention', run('ductsupport', {}).value >= 1);
assert('mrdocs defaults need attention', run('mrdocs', {}).value >= 1);
assert('oafrac 300/1200 → 0.25', Math.abs(run('oafrac', {oa: 300, supply: 1200}).value - 0.25) < 1e-12);
assert('bypassfac (55−50)/(80−50) → 1/6', Math.abs(run('bypassfac', {eat: 80, lat: 55, adp: 50}).value - (5/30)) < 1e-12);
assert('airhp 2000×1.5/6356', Math.abs(run('airhp', {cfm: 2000, sp: 1.5}).value - (2000 * 1.5) / 6356) < 1e-9);
assert('hxeff 48k/60k → 0.8', Math.abs(run('hxeff', {actual: 48000, max: 60000}).value - 0.8) < 1e-12);
{
  const d = 1.049 / 12;
  const expect = 0.02 * (100 / d) * (4 * 4) / (2 * 32.174);
  assert('darcyhead defaults', Math.abs(run('darcyhead', {}).value - expect) < 1e-9);
}
assert('steamflow 500000/970', Math.abs(run('steamflow', {load: 500000, hfg: 970}).value - 500000 / 970) < 1e-9);
assert('refrigmass 36000/70', Math.abs(run('refrigmass', {capacity: 36000, dh: 70}).value - 36000 / 70) < 1e-9);
assert('fittingel 50+15+10+5 → 80', Math.abs(run('fittingel', {}).value - 80) < 1e-12);


const failed = tests.filter(t => !t.ok);

const passed = tests.length - failed.length;
console.log(`verify: ${passed}/${tests.length} passed`);
if (failed.length) {
  for (const f of failed) console.error(' -', f.name, f.detail || '');
  process.exit(1);
}

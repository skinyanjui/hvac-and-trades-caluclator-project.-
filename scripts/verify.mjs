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

assert('calculator count', calculators.length === 56, calculators.length);
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

const failed = tests.filter(t => !t.ok);
const passed = tests.length - failed.length;
console.log(`verify: ${passed}/${tests.length} passed`);
if (failed.length) {
  for (const f of failed) console.error(' -', f.name, f.detail || '');
  process.exit(1);
}

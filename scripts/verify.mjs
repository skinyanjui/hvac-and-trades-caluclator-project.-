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
  globalThis.convert = typeof convert !== 'undefined' ? convert : null;
  globalThis.ashrae152PathGate = typeof ashrae152PathGate !== 'undefined' ? ashrae152PathGate : null;
  globalThis.sourceLinks = sourceLinks;
  globalThis.glossaryTopics = glossaryTopics;
  globalThis.glossarySymbols = glossarySymbols;
`, sandbox);

const {calculators, essentials, keywords, units, icons, convert, sourceLinks, glossaryTopics, glossarySymbols} = sandbox;
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

assert('calculator count', calculators.length === 214, calculators.length);
assert('unique ids', new Set(calculators.map(c => c.id)).size === calculators.length);
assert('unit groups 32', Object.keys(units).length === 32, Object.keys(units).join(', '));

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


assert('damperdocs defaults need attention', run('damperdocs', {}).value >= 1);
assert('hydropipedocs defaults need attention', run('hydropipedocs', {}).value >= 1);
assert('boilerdocs defaults need attention', run('boilerdocs', {}).value >= 1);
assert('economizerdocs defaults need attention', run('economizerdocs', {}).value >= 1);
assert('refrigclassdocs defaults need attention', run('refrigclassdocs', {}).value >= 1);
assert('ventconndocs defaults need attention', run('ventconndocs', {}).value >= 1);
assert('coilface 2000/500 → 4', Math.abs(run('coilface', {}).value - 4) < 1e-12);
assert('copeer 12 → ~3.517', Math.abs(run('copeer', {eer: 12}).value - 12/3.412) < 1e-12);
{
  const Tc=40+459.67, Th=105+459.67;
  assert('carnotcop 40/105', Math.abs(run('carnotcop', {}).value - Tc/(Th-Tc)) < 1e-9);
}
assert('psigpsia 70+14.7', Math.abs(run('psigpsia', {}).value - 84.7) < 1e-12);
assert('flashgas (40-25)/(80-25)', Math.abs(run('flashgas', {}).value - 15/55) < 1e-12);
assert('voleff 20/25 → 0.8', Math.abs(run('voleff', {}).value - 0.8) < 1e-12);
{
  const area=Math.PI*Math.pow(0.545/24,2);
  const expect=(500/3600)/(0.5*area);
  assert('linevel defaults', Math.abs(run('linevel', {}).value - expect) < 1e-9);
}
assert('balancept linear solve', Math.abs(run('balancept', {}).value - 24.857142857142858) < 1e-9);
assert('chillerapp evap 44-40 → 4', Math.abs(run('chillerapp', {}).value - 4) < 1e-12);
assert('chillerapp cond 105-95 → 10', Math.abs(run('chillerapp', {side:'cond', fluid:95, sat:105}).value - 10) < 1e-12);


assert('plenumdocs defaults need attention', run('plenumdocs', {}).value >= 1);
assert('kitchenexdocs defaults need attention', run('kitchenexdocs', {}).value >= 1);
assert('furnacedocs defaults need attention', run('furnacedocs', {}).value >= 1);
assert('fanpowerdocs defaults need attention', run('fanpowerdocs', {}).value >= 1);
assert('shaftpipdocs defaults need attention', run('shaftpipdocs', {}).value >= 1);
assert('chwflow 120000/(500×10) → 24', Math.abs(run('chwflow', {}).value - 24) < 1e-12);
assert('towerrange 95-85 → 10', Math.abs(run('towerrange', {}).value - 10) < 1e-12);
assert('heatofcomp 45000-36000 → 9000', Math.abs(run('heatofcomp', {}).value - 9000) < 1e-12);
assert('refeffect 110-40 → 70', Math.abs(run('refeffect', {}).value - 70) < 1e-12);
assert('vacmicron 500 → 0.5 torr', Math.abs(run('vacmicron', {}).value - 0.5) < 1e-12);
assert('partload 24000/36000 → 2/3', Math.abs(run('partload', {}).value - 24000/36000) < 1e-12);
assert('tonstokw 10 tons', Math.abs(run('tonstokw', {}).value - 10*12000/3412.141633) < 1e-9);
assert('ductleakpct 120/2000 → 6', Math.abs(run('ductleakpct', {}).value - 6) < 1e-12);
assert('filterface 2000/4 → 500', Math.abs(run('filterface', {}).value - 500) < 1e-12);
assert('oilcooler 800×0.45×20', Math.abs(run('oilcooler', {}).value - 800*0.45*20) < 1e-12);


assert('hazexdocs defaults need attention', run('hazexdocs', {}).value >= 1);
assert('smokecontroldocs defaults need attention', run('smokecontroldocs', {}).value >= 1);
assert('ventctrldocs defaults need attention', run('ventctrldocs', {}).value >= 1);
assert('ductinsdocs defaults need attention', run('ductinsdocs', {}).value >= 1);
assert('gaspipedocs defaults need attention', run('gaspipedocs', {}).value >= 1);
assert('radiantfloor defaults need attention', run('radiantfloor', {}).value >= 1);
assert('makeupheaterdocs defaults need attention', run('makeupheaterdocs', {}).value >= 1);
assert('refrigjointdocs defaults need attention', run('refrigjointdocs', {}).value >= 1);
assert('eerfromcap 36000/3000 → 12', Math.abs(run('eerfromcap', {}).value - 12) < 1e-12);
assert('cophp defaults', Math.abs(run('cophp', {}).value - ((36000/3412.141633)/(3000/1000))) < 1e-9);
assert('electricheat 34121 → ~10', Math.abs(run('electricheat', {}).value - 34121/3412.141633) < 1e-9);
assert('gasinput 80000/0.8 → 100000', Math.abs(run('gasinput', {}).value - 100000) < 1e-9);
assert('npsha 34+5-0.8-2 → 36.2', Math.abs(run('npsha', {}).value - 36.2) < 1e-12);
assert('headtopsi 40/2.31', Math.abs(run('headtopsi', {}).value - 40/2.31) < 1e-12);
assert('chwload 500×24×10 → 120000', Math.abs(run('chwload', {}).value - 120000) < 1e-12);
assert('towerload 500×300×10 → 1.5e6', Math.abs(run('towerload', {}).value - 1500000) < 1e-9);
assert('ductarea 1000/800 → 1.25', Math.abs(run('ductarea', {}).value - 1.25) < 1e-12);
assert('reheat 1.08×1000×15 → 16200', Math.abs(run('reheat', {}).value - 16200) < 1e-12);
assert('contactfac 1-0.2 → 0.8', Math.abs(run('contactfac', {}).value - 0.8) < 1e-12);
assert('flashsteam (298-180)/(1150-180)', Math.abs(run('flashsteam', {}).value - (298-180)/(1150-180)) < 1e-12);
assert('presscfm 2000-1800-0 → 200', Math.abs(run('presscfm', {}).value - 200) < 1e-12);
assert('sgflow 100×1.05 → 105', Math.abs(run('sgflow', {}).value - 105) < 1e-12);
assert('infilcfm 0.35×12000/60', Math.abs(run('infilcfm', {}).value - 0.35*12000/60) < 1e-12);
assert('manifoldkpa 3.5 inwc', Math.abs(run('manifoldkpa', {}).value - 3.5*249.089/1000) < 1e-9);

assert('cfmfromq 25920/(1.08*20) → 1200', Math.abs(run('cfmfromq', {}).value - 25920/(1.08*20)) < 1e-9);
assert('dtairfromq 25920/(1.08*1200) → 20', Math.abs(run('dtairfromq', {}).value - 25920/(1.08*1200)) < 1e-9);
assert('latent069 0.69*1200*20', Math.abs(run('latent069', {}).value - 0.69*1200*20) < 1e-9);
assert('total45 4.5*1400*8', Math.abs(run('total45', {}).value - 4.5*1400*8) < 1e-9);
assert('gpmfromq 80000/(500*20) → 8', Math.abs(run('gpmfromq', {}).value - 8) < 1e-12);
assert('airfromvp 4005*sqrt(0.2)', Math.abs(run('airfromvp', {}).value - 4005*Math.sqrt(0.2)) < 1e-9);
assert('ductcfmva 1.5*800 → 1200', Math.abs(run('ductcfmva', {}).value - 1200) < 1e-12);
assert('gascfh 100000/1000 → 100', Math.abs(run('gascfh', {}).value - 100) < 1e-12);
assert('therms 100000 → 1', Math.abs(run('therms', {}).value - 1) < 1e-12);
assert('chillgpm24 100*24/10 → 240', Math.abs(run('chillgpm24', {}).value - 240) < 1e-12);
assert('tonfrom400 1600/400 → 4', Math.abs(run('tonfrom400', {}).value - 4) < 1e-12);
assert('moistlbhr 1200*20*60/7000', Math.abs(run('moistlbhr', {}).value - 1200*20*60/7000) < 1e-9);
assert('eir 1/3.5', Math.abs(run('eir', {}).value - 1/3.5) < 1e-12);
assert('grillecfm (48/144)*500', Math.abs(run('grillecfm', {}).value - (48/144)*500) < 1e-12);
{
  const pr=Math.pow(1-6.87535e-6*5000,5.2559);
  assert('altfactor 5000 ft', Math.abs(run('altfactor', {}).value - pr) < 1e-9, run('altfactor', {}).value);
}
assert('oilgph (140000/0.8)/140000 → 1.25', Math.abs(run('oilgph', {}).value - 1.25) < 1e-12);
assert('motorfla 5hp 460V 3ph', Math.abs(run('motorfla', {}).value - (5*746)/(460*0.92*0.86*Math.sqrt(3))) < 1e-9);
assert('mixgrains 0.25*90+0.75*65', Math.abs(run('mixgrains', {}).value - (0.25*90+0.75*65)) < 1e-12);
{
  const vp1=Math.pow(1500/4005,2), vp2=Math.pow(900/4005,2);
  assert('staticregain defaults', Math.abs(run('staticregain', {}).value - (vp1-vp2)*0.75) < 1e-9);
}




assert('fluidq 40gpm 12dt water', Math.abs(run('fluidq', {}).value - 8.33*60*1*1*40*12) < 1e-6);
assert('waterdt 120000/(500*24) → 10', Math.abs(run('waterdt', {}).value - 10) < 1e-12);
assert('leaveair cool 75-36000/(1.08*1200)', Math.abs(run('leaveair', {}).value - (75-36000/(1.08*1200))) < 1e-9);
assert('scfmacfm 2000/0.85', Math.abs(run('scfmacfm', {}).value - 2000/0.85) < 1e-12);
assert('pumpbhp 120*60/(3960*0.7)', Math.abs(run('pumpbhp', {}).value - (120*60*1)/(3960*0.7)) < 1e-9);
assert('bhptokw 5*0.745699872', Math.abs(run('bhptokw', {}).value - 5*0.745699872) < 1e-12);
assert('tonhours 20*8 → 160', Math.abs(run('tonhours', {}).value - 160) < 1e-12);
assert('mcfgas 100*24/1000 → 2.4', Math.abs(run('mcfgas', {}).value - 2.4) < 1e-12);
assert('propanegal defaults', Math.abs(run('propanegal', {}).value - ((80000/0.8)/91500)*1) < 1e-9);
assert('towerevap 1000*10*0.001 → 10', Math.abs(run('towerevap', {}).value - 10) < 1e-12);
assert('blowdown 10/(4-1)', Math.abs(run('blowdown', {}).value - 10/3) < 1e-12);
assert('chillerlift 95-44 → 51', Math.abs(run('chillerlift', {}).value - 51) < 1e-12);
assert('diversity 500000*0.7', Math.abs(run('diversity', {}).value - 350000) < 1e-9);
assert('loadfactor 120/200 → 0.6', Math.abs(run('loadfactor', {}).value - 0.6) < 1e-12);
assert('uaseries 1/(0.68+13+0.45)', Math.abs(run('uaseries', {}).value - 1/(0.68+13+0.45)) < 1e-12);
assert('windpressure 0.00256*90*90', Math.abs(run('windpressure', {}).value - 0.00256*90*90) < 1e-12);
assert('heatreclaim 48000*0.4', Math.abs(run('heatreclaim', {}).value - 19200) < 1e-12);
assert('vavfraction 800*0.6 → 480', Math.abs(run('vavfraction', {}).value - 480) < 1e-12);
assert('dryerexdocs defaults need attention', run('dryerexdocs', {}).value >= 1);
assert('evapcoolerdocs defaults need attention', run('evapcoolerdocs', {}).value >= 1);
assert('thermostatdocs defaults need attention', run('thermostatdocs', {}).value >= 1);
assert('ductconstdocs defaults need attention', run('ductconstdocs', {}).value >= 1);
assert('ventingdocs defaults need attention', run('ventingdocs', {}).value >= 1);
{
  const t=(80-32)*5/9, rh=50;
  const tw=t*Math.atan(0.151977*Math.sqrt(rh+8.313659))+Math.atan(t+rh)-Math.atan(rh-1.676331)+0.00391838*Math.pow(rh,1.5)*Math.atan(0.023101*rh)-4.686035;
  const twf=tw*9/5+32;
  assert('wetbulbstull 80F 50%', Math.abs(run('wetbulbstull', {}).value - twf) < 1e-6);
}



// Accuracy regression — public HVAC identities
{
  const near = (a,b,tol=1e-6) => Math.abs(a-b) <= tol * (1+Math.abs(b));
  const cases = [
    ['airflow', {load:25920, dt:20, density:0.075, cp:0.24}, 1200, 1e-9],
    ['cfmfromq', {load:25920, dt:20, factor:1.08}, 1200, 1e-9],
    ['waterflow', {load:100000, dt:20, density:8.33, cp:1}, 100000/(60*8.33*1*20), 1e-9],
    ['gpmfromq', {load:100000, dt:20, factor:500}, 10, 1e-9],
    ['duct', {shape:'round', diameter:12, width:12, height:8, flow:400}, 400/(Math.PI*0.25), 1e-9],
    ['airfromvp', {vp:1}, 4005, 1],
    ['velpress', {velocity:4005}, 1, 1e-3],
    ['superheat', {line:52, saturation:40}, 12, 1e-9],
    ['subcooling', {saturation:110, line:100}, 10, 1e-9],
    ['eer', {capacity:36000, input:3000}, 12, 1e-9],
    ['tons', {capacity:36000}, 3, 1e-9],
    ['fan', {rpm1:1000, rpm2:2000, cfm:1000, pressure:1, power:1}, 2000, 1e-9],
  ];
  for (const [id, vals, exp, tol] of cases) {
    if (!byId[id]) { assert('accuracy:'+id+' exists', false, 'missing'); continue; }
    try {
      const r = run(id, vals);
      assert('accuracy:'+id, near(r.value, exp, tol), `got ${r.value} expected ${exp}`);
    } catch (e) {
      assert('accuracy:'+id, false, e.message);
    }
  }
  assert('convert available', typeof convert === 'function');
  assert('convert 12k BTU/h → ton', near(convert('Power / capacity', 12000, 'BTU/h', 'tons refrigeration'), 1, 1e-9));
  assert('convert 32 F → C', near(convert('Temperature', 32, '°F', '°C'), 0, 1e-12));
  assert('convert 1 bar → kPa', near(convert('Pressure', 1, 'bar', 'kPa'), 100, 1e-12));
  assert('convert 1800 rpm → Hz', near(convert('Frequency', 1800, 'rpm', 'Hz'), 30, 1e-12));
  assert('convert 1 hp → W', near(convert('Power / capacity', 1, 'hp (mechanical)', 'W'), 745.6998715822702, 1e-9));
  assert('convert °R → °F', near(convert('Temperature', 491.67, '°R', '°F'), 32, 1e-6));
  assert('convert 1 mbar → Pa', near(convert('Pressure', 1, 'mbar', 'Pa'), 100, 1e-12));
  assert('convert 1 cSt → m²/s', near(convert('Kinematic viscosity', 1, 'cSt', 'm²/s'), 1e-6, 1e-12));
  assert('convert 3600 kg/h → kg/s', near(convert('Mass flow', 3600, 'kg/h', 'kg/s'), 1, 1e-12));
  assert('convert 1 BTU/(h·ft·°F) → W/(m·K)', near(convert('Thermal conductivity', 1, 'BTU/(h·ft·°F)', 'W/(m·K)'), 1.73073467, 1e-9));
  assert('convert 1000 mV → V', near(convert('Electrical potential', 1000, 'mV', 'V'), 1, 1e-12));
  let blocked2=false; try{ run('gaspipesize',{heatContent:0}); }catch{ blocked2=true; }
  assert('gaspipesize rejects zero heat content', blocked2);
  blocked2=false; try{ run('multizoneoa',{ev:0}); }catch{ blocked2=true; }
  assert('multizoneoa rejects zero Ev', blocked2);
  blocked2=false; try{ run('equivduct',{width:0,height:8}); }catch{ blocked2=true; }
  assert('equivduct rejects zero side', blocked2);

  let blocked = false;
  try { run('duct', {shape:'round', diameter:0, width:12, height:8, flow:400}); } catch { blocked = true; }
  assert('duct rejects zero area', blocked);
  blocked = false;
  try { run('fan', {rpm1:0, rpm2:1000, cfm:1000, pressure:1, power:1}); } catch { blocked = true; }
  assert('fan rejects zero base rpm', blocked);
}



{
  const unk = run('tpdischarge', {});
  assert('tpdischarge defaults need attention', unk.unit === 'items needing attention' && unk.value >= 1, `${unk.value} ${unk.unit}`);
  const yes = Object.fromEntries(byId.tpdischarge.fields.filter(f => f.options && f.options.some(([k]) => k === 'yes')).map(f => [f.key, 'yes']));
  const ok = run('tpdischarge', yes);
  assert('tpdischarge all-yes → 0 needing attention', ok.unit === 'items needing attention' && ok.value === 0, `${ok.value} ${ok.unit}`);
}
assert('hoodcfm no fake rate-override title', !/hoodcfm:'Rate override'/.test(html));
assert('hoodcfm essentials not editable rates', !/hoodcfm:'[^']*Editable rates/.test(html));
assert('hoodcfm disclaimer exact cells', /Hood rates are exact embedded cells/.test(html));
assert('resultLabelFor attention units', /unit\.includes\('needing attention'\)/.test(html));
assert('no checklist hero hardcoded as OK', !/case '(tpdischarge|ircinstall)':return 'Checklist items marked OK'/.test(html));

{
  // NIST QICO2 published per-person generation rates (L/s) at 23 °C, 101.325 kPa.
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const gen = r => r.rows.find(([l]) => l === 'CO₂ generation per person')[1];
  assert('co2 gen: male 85 kg 30–59 y 1.3 met ≈ 0.0053 L/s', near(gen(run('co2ss', {sex:'m', age:'a30', mass:85, met:1.3})), 0.0053, 0.0001));
  assert('co2 gen: female 75 kg 30–59 y 1.3 met ≈ 0.0042 L/s', near(gen(run('co2ss', {sex:'f', age:'a30', mass:75, met:1.3})), 0.0042, 0.0001));
  assert('co2 gen: male child 23 kg 3–9 y 2 met ≈ 0.0045 L/s', near(gen(run('co2ss', {sex:'m', age:'a3', mass:23, met:2})), 0.0045, 0.0001));
  assert('co2 gen: female child 23 kg 3–9 y 2 met ≈ 0.0042 L/s', near(gen(run('co2ss', {sex:'f', age:'a3', mass:23, met:2})), 0.0042, 0.0001));
  // Steady state: Css = Cout + G/Q × 1e6 with Q in L/s.
  const ss = run('co2ss', {occupants:1, sex:'m', age:'a30', mass:85, met:1.3, ventmode:'total', oaTotal:10 / 0.4719474432, outdoorCo2:400});
  const g1 = gen(ss);
  assert('co2ss steady state matches G/Q', near(ss.value, 400 + g1 / 10 * 1e6, 0.5), ss.value);
  // Transient at t → ∞ equals steady state; at t = 0 equals initial.
  const t0 = run('co2ss', {elapsed:0, initial:500});
  assert('co2ss C(0) = initial', near(t0.rows.find(([l]) => l.startsWith('Indoor CO₂ after'))[1], 500, 1e-6));
  const tInf = run('co2ss', {elapsed:48, volume:100, initial:500});
  assert('co2ss C(∞) → Css', near(tInf.rows.find(([l]) => l.startsWith('Indoor CO₂ after'))[1], tInf.value, 1e-3));
  // Inverse tool round-trips the forward tool.
  const inv = run('co2vent', {occupants:10, sex:'m', age:'a30', mass:75, met:1.3, indoorCo2:run('co2ss', {}).value, outdoorCo2:420});
  assert('co2vent round-trips 15 CFM/person', near(inv.value, 15, 1e-6), inv.value);
  let blocked = false;
  try { run('co2vent', {indoorCo2:400, outdoorCo2:420}); } catch { blocked = true; }
  assert('co2vent rejects indoor ≤ outdoor', blocked);
  // Decay: 1500→900 over 30 min with 420 outdoor → ln(1080/480)/0.5 h.
  const dec = run('co2decay', {});
  assert('co2decay ACH', near(dec.value, Math.log(1080 / 480) / 0.5, 1e-9), dec.value);
  blocked = false;
  try { run('co2decay', {c0:900, ct:1500}); } catch { blocked = true; }
  assert('co2decay rejects rising concentration', blocked);
}
{
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const row = (r, label) => r.rows.find(([l]) => l === label)?.[1];
  // NIST Handbook 135 worked factors: d=3 %, n=15 → SPV 0.642, UPV 11.94; e=2 % → UPV* 13.89; d=3 %, e=2 %, n=5 → UPV* 4.8562.
  const r15 = run('lcc', {period:15, discount:3, escalation:2});
  assert('lcc SPV(3 %, 15 y) = 0.642', near(row(r15, 'Single present value factor (SPV)'), 0.642, 0.0005));
  assert('lcc UPV(3 %, 15 y) = 11.94', near(row(r15, 'Uniform present value factor (UPV)'), 11.94, 0.005));
  assert('lcc UPV*(3 %, 2 %, 15 y) = 13.89', near(row(r15, 'Escalating present value factor (UPV*)'), 13.89, 0.005));
  const r5 = run('lcc', {period:5, discount:3, escalation:2});
  assert('lcc UPV*(3 %, 2 %, 5 y) = 4.8562', near(row(r5, 'Escalating present value factor (UPV*)'), 4.8562, 0.0001));
  // Degenerate rates: d = e and d = 0 both collapse to n.
  const same = run('lcc', {period:10, discount:2, escalation:2});
  assert('lcc UPV* with d = e equals n', near(row(same, 'Escalating present value factor (UPV*)'), 10, 1e-9));
  const zero = run('lcc', {period:10, discount:0, escalation:0});
  assert('lcc UPV with d = 0 equals n', near(row(zero, 'Uniform present value factor (UPV)'), 10, 1e-9));
  // Net savings and SIR/AIRR consistency: NS = PV savings − net investment; AIRR = (1+d)·SIR^(1/n) − 1.
  const base = run('lcc', {});
  const pv = row(base, 'Total PV savings'), ni = row(base, 'Net investment (cost − PV residual)');
  assert('lcc NS = PV savings − net investment', near(base.value, pv - ni, 1e-6));
  const sir = row(base, 'Savings-to-investment ratio (SIR)');
  assert('lcc SIR = PV savings / net investment', near(sir, pv / ni, 1e-9));
  assert('lcc AIRR formula', near(row(base, 'Adjusted internal rate of return (AIRR)'), ((1.03) * Math.pow(sir, 1 / 20) - 1) * 100, 1e-6));
  assert('lcc simple payback 25000/4000 = 6.25', near(row(base, 'Simple payback'), 6.25, 1e-9));
  assert('lcc discounted payback is an integer year ≥ simple payback', Number.isInteger(row(base, 'Discounted payback (first year cumulative PV ≥ cost)')) && row(base, 'Discounted payback (first year cumulative PV ≥ cost)') >= 7);
  const never = run('lcc', {invest:1e9});
  assert('lcc omits discounted payback when never reached', row(never, 'Discounted payback (first year cumulative PV ≥ cost)') === undefined && /never reach/.test(never.note));
  for (const r of [base, r15, r5, same, zero, never]) assert('lcc rows finite', r.rows.every(([, n]) => Number.isFinite(n)), r.rows.filter(([, n]) => !Number.isFinite(n)).map(([l]) => l).join(', '));
}
{
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const row = (r, label) => r.rows.find(([l]) => l === label)?.[1];
  // Cooling window: qi = 2.5 W/ft² × 5000 ft² = 12500 W = 42651.8 BTU/h; ΔT = 10 °F → CFM = qi/(1.08·10).
  const cool = run('ventcool', {});
  const qi = 2.5 * 5000 * 3.412141633;
  assert('ventcool cooling airflow = qi / (1.08 ΔT)', near(cool.value, qi / 10.8, 1e-6), cool.value);
  assert('ventcool balance point = Thsp − qi/(1.08·CFMmin)', near(row(cool, 'Heating balance point'), 68 - qi / (1.08 * 750), 1e-9));
  // Envelope conduction reduces the cooling airflow requirement.
  const withUa = run('ventcool', {ua:1000});
  assert('ventcool UA lowers cooling airflow', withUa.value < cool.value && near(withUa.value, (qi - 1000 * 10) / 10.8, 1e-6));
  // Below the balance point only the minimum ventilation is needed.
  const cold = run('ventcool', {outdoor:-20});
  assert('ventcool cold hour → minimum outdoor air', near(cold.value, 750, 1e-9) && /Below heating balance point/.test(cold.note));
  let blocked = false;
  try { run('ventcool', {outdoor:78}); } catch { blocked = true; }
  assert('ventcool rejects outdoor ≥ cooling setpoint', blocked);
  blocked = false;
  try { run('ventcool', {minVent:0, ua:0}); } catch { blocked = true; }
  assert('ventcool rejects zero conductance', blocked);
  assert('ventcool flags > 5 ACH', /Above 5 air changes/.test(run('ventcool', {height:2}).note));
}
for (const id of ['co2ss', 'co2vent', 'co2decay', 'ventcool', 'lcc']) {
  assert(`${id} has keywords and essentials`, typeof keywords[id] === 'string' && typeof essentials[id] === 'string');
  const r = run(id, {});
  assert(`${id} default result finite`, Number.isFinite(r.value) && r.rows.every(([, n]) => Number.isFinite(n)));
  assert(`${id} has cites`, Array.isArray(r.cites) && r.cites.length > 0);
}

// Content completeness: every field hinted, every tool referenced, every link and glossary target resolvable.
{
  const noHint = calculators.flatMap(c => c.fields.filter(f => !f.hint).map(f => `${c.id}.${f.key}`));
  assert('every field has a hint', noHint.length === 0, noHint.slice(0, 5).join(', '));
  const noSource = calculators.filter(c => !Array.isArray(c.sources) || !c.sources.length).map(c => c.id);
  assert('every calculator has a source link', noSource.length === 0, noSource.slice(0, 5).join(', '));
  const badSource = calculators.flatMap(c => (c.sources || []).filter(k => !sourceLinks[k]).map(k => `${c.id}:${k}`));
  assert('every source key resolves', badSource.length === 0, badSource.join(', '));
  const badLink = Object.entries(sourceLinks).filter(([, v]) => !Array.isArray(v) || !/^https:\/\//.test(v[1])).map(([k]) => k);
  assert('every source link is https', badLink.length === 0, badLink.join(', '));
  const terms = glossaryTopics.flatMap(([, list]) => list);
  assert('glossary has terms and symbols', terms.length >= 150 && glossarySymbols.length >= 20, `${terms.length}/${glossarySymbols.length}`);
  const badUse = terms.flatMap(([term, , , ids]) => ids.filter(id => id !== 'references' && !byId[id]).map(id => `${term}:${id}`));
  assert('glossary "used in" ids resolve', badUse.length === 0, badUse.join(', '));
  const dupTerms = terms.map(([t]) => t.toLowerCase()).filter((t, i, a) => a.indexOf(t) !== i);
  assert('glossary terms unique', dupTerms.length === 0, dupTerms.join(', '));
  const emptyDef = terms.filter(([, , def]) => !def || def.length < 20).map(([t]) => t);
  assert('glossary definitions present', emptyDef.length === 0, emptyDef.join(', '));
}

const failed = tests.filter(t => !t.ok);

const passed = tests.length - failed.length;
console.log(`verify: ${passed}/${tests.length} passed`);
if (failed.length) {
  for (const f of failed) console.error(' -', f.name, f.detail || '');
  process.exit(1);
}

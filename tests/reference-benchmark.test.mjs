import test from "node:test";
import assert from "node:assert/strict";
import { benchmarkFormulaAgainstCatalog } from "../src/js/features/laboratory/reference-benchmark/engine.js";
import { REFERENCE_PERFUMES, REFERENCE_CATALOG_SOURCE } from "../src/js/features/laboratory/reference-benchmark/data.js";
import { renderCatalogBenchmark } from "../src/js/features/laboratory/reference-benchmark/panel.js";
test("licensed local benchmark includes all commercial categories",()=>{
 assert.equal(REFERENCE_PERFUMES.length,1479);
 for(const category of ["arabian","niche","designer"])assert.ok(REFERENCE_PERFUMES.some(p=>p.category===category));
 assert.equal(REFERENCE_CATALOG_SOURCE.license,"CC BY 4.0");
});
test("benchmark provides category-specific top matches from notes and families",()=>{
 const result=benchmarkFormulaAgainstCatalog([{id:"bergamot",points:50},{id:"jasmine",points:30},{id:"vanilla",points:20}]);
 assert.equal(result.status,"ready");
 for(const category of ["arabian","niche","designer"]){assert.equal(result.matchesByCategory[category].length,3);assert.ok(result.categoryCounts[category]>0);}
 assert.ok(result.matchesByCategory.designer.every(item=>Number.isInteger(item.score)&&item.score>=0&&item.score<=100));
});
test("empty or invalid formula is rejected and UI clarifies editorial similarity",()=>{
 assert.equal(benchmarkFormulaAgainstCatalog([]).status,"empty");
 assert.equal(benchmarkFormulaAgainstCatalog([{id:"invalid",points:100}]).status,"invalid");
 const html=renderCatalogBenchmark([{id:"bergamot",points:100}]);
 assert.match(html,/COMMERCIAL REFERENCE BENCHMARK/);
 assert.match(html,/No afirma que sea una copia/i);
 assert.match(html,/CC BY 4.0/);
});
test("benchmark panel is safe and offline catalog is included in shell",async()=>{
 const html=renderCatalogBenchmark([{id:"rose",points:100}]);
 assert.doesNotMatch(html,/<script/i);
 const {readFile}=await import("node:fs/promises");
 const sw=await readFile(new URL("../sw.js",import.meta.url),"utf8");
 assert.match(sw,/reference-benchmark\/data\.js/);
 assert.match(sw,/shell-v42/);
});

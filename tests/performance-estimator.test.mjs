import test from "node:test";
import assert from "node:assert/strict";
import { estimatePerformance } from "../src/js/features/laboratory/performance-estimator/engine.js";
import { renderPerformanceEstimate } from "../src/js/features/laboratory/performance-estimator/panel.js";
test("performance estimator distinguishes persistence potential of fresh and base-heavy profiles",()=>{
 const fresh=estimatePerformance([{id:"bergamot",points:35},{id:"marine",points:35},{id:"green-tea",points:30}]);
 const base=estimatePerformance([{id:"labdanum",points:35},{id:"leather",points:35},{id:"cedarwood",points:30}]);
 assert.equal(fresh.status,"ready");assert.equal(base.status,"ready");
 assert.ok(base.persistence.score>fresh.persistence.score);
 assert.ok(base.persistence.hours[0]>=fresh.persistence.hours[0]);
});
test("projection estimate uses separate conceptual scale and includes early/later ranges",()=>{
 const result=estimatePerformance([{id:"bergamot",points:40},{id:"rosemary",points:30},{id:"cedarwood",points:30}]);
 assert.equal(result.status,"ready");
 assert.ok(result.projection.initialMeters[1]>result.projection.initialMeters[0]);
 assert.ok(result.projection.laterMeters[1]>result.projection.laterMeters[0]);
 assert.ok(result.projection.initialMeters[0]>=result.projection.laterMeters[0]);
 const warm=estimatePerformance([{id:"bergamot",points:40},{id:"rosemary",points:30},{id:"cedarwood",points:30}],{concentration:"edt",environment:"warm"});
 const coolParfum=estimatePerformance([{id:"bergamot",points:40},{id:"rosemary",points:30},{id:"cedarwood",points:30}],{concentration:"parfum",environment:"cool"});
 assert.ok(coolParfum.persistence.score>warm.persistence.score);assert.notEqual(coolParfum.projection.score,warm.projection.score);
 assert.equal(result.confidence,"Muy baja");
});
test("performance estimator rejects empty invalid or non-normalized compositions",()=>{
 assert.equal(estimatePerformance([]).status,"empty");
 assert.equal(estimatePerformance([{id:"unknown",points:100}]).status,"invalid");
 assert.equal(estimatePerformance([{id:"bergamot",points:75}]).status,"invalid");
});
test("panel explains the heuristic and renders hours plus distance ranges",()=>{
 const html=renderPerformanceEstimate([{id:"vanilla",points:50},{id:"cedarwood",points:50}]);
 assert.match(html,/PERFORMANCE ESTIMATE/);assert.match(html,/POSIBLE PERSISTENCIA EN PIEL/);
 assert.match(html,/PROYECCIÓN INICIAL/);assert.match(html,/m/);assert.match(html,/Confianza Muy baja/);
 assert.match(html,/no concentración química/);assert.match(html,/performance-concentration/);assert.match(html,/performance-environment/);
});
test("performance estimator is integrated in app update and offline shell",async()=>{
 const {readFile}=await import("node:fs/promises");
 const app=await readFile(new URL("../src/js/app.js",import.meta.url),"utf8");
 const views=await readFile(new URL("../src/js/ui/views.js",import.meta.url),"utf8");
 const sw=await readFile(new URL("../sw.js",import.meta.url),"utf8");
 assert.match(app,/updateEvolutionSimulator/);assert.match(app,/renderPerformanceEstimate/);
 assert.match(views,/renderPerformanceEstimate/);assert.match(sw,/performance-estimator\/engine\.js/);assert.match(sw,/shell-v47/);
});

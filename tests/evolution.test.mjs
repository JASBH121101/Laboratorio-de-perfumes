import test from "node:test";
import assert from "node:assert/strict";
import { addMixNote, createMixState } from "../src/js/features/laboratory/mixing/state.js";
import { analyzeEvolutionStage, getEvolutionStage, EVOLUTION_STAGES } from "../src/js/features/laboratory/evolution/engine.js";
import { renderEvolutionSimulator } from "../src/js/features/laboratory/evolution/panel.js";

function createMix(ids) { let state=createMixState(); for(const id of ids) state=addMixNote(state,id); return state; }

test("evolution stage ids resolve to a valid stage with safe fallback",()=>{
 assert.equal(getEvolutionStage("heart").id,"heart");
 assert.equal(getEvolutionStage("unknown").id,"opening");
 assert.equal(EVOLUTION_STAGES.length,3);
});
test("opening stage selects only references tagged with opening roles",()=>{
 const result=analyzeEvolutionStage(createMix(["bergamot","rose","vanilla"]),"opening");
 assert.ok(result.references.some(n=>n.id==="bergamot"));
 assert.ok(result.references.every(n=>n.share>=0 && n.share<=100));
});
test("stage shares normalize to 100 for included references",()=>{
 for(const stage of EVOLUTION_STAGES){
  const result=analyzeEvolutionStage(createMix(["bergamot","rose","vanilla","sandalwood"] ),stage.id);
  if(result.hasStageReferences) assert.equal(result.references.reduce((s,n)=>s+n.share,0),100);
 }
});
test("empty composition is explicitly empty without invented reference",()=>{
 const result=analyzeEvolutionStage(createMix([]),"heart");
 assert.equal(result.isEmpty,true);
 assert.equal(result.references.length,0);
});
test("stage with no role matches explains missing editorial references",()=>{
 const result=analyzeEvolutionStage(createMix(["bergamot"]),"drydown");
 assert.equal(result.hasStageReferences,false);
 assert.equal(result.references.length,0);
});
test("rendered simulator contains three stages and conceptual disclaimer",()=>{
 const html=renderEvolutionSimulator(createMix(["bergamot","rose","vanilla"]),"heart");
 assert.match(html,/data-evolution-stage="opening"/);
 assert.match(html,/data-evolution-stage="heart"/);
 assert.match(html,/data-evolution-stage="drydown"/);
 assert.match(html,/No simula volatilidad/);
});


test("stage share normalization handles references with zero points safely", () => {
 const result=analyzeEvolutionStage({items:[{id:"bergamot",points:0},{id:"lemon",points:0}]}, "opening");
 assert.equal(result.references.reduce((sum,n)=>sum+n.share,0),100);
 assert.ok(result.references.every(n=>Number.isFinite(n.share)));
});

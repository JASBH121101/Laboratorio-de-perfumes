import test from "node:test";
import assert from "node:assert/strict";
import { buildClientBrief } from "../src/js/features/laboratory/client-brief/engine.js";
import { buildCreativeRecommendations } from "../src/js/features/laboratory/creative-assistant/engine.js";
import { generateFormulationProposals } from "../src/js/features/laboratory/formulation-proposals/engine.js";
import { analyzeAudienceFit } from "../src/js/features/laboratory/audience-fit/engine.js";
import { createMixState,replaceMixItems,undoMix,getMixTotal } from "../src/js/features/laboratory/mixing/state.js";
import { PERFUME_ITEMS } from "../src/js/features/perfume-library/data.js";
import { readFile } from "node:fs/promises";
test("client brief flows through assistant, A/B/C options, audience analysis and undo",()=>{
 const brief=buildClientBrief({occasion:"diario",style:"fresco",presence:"discreta",liked:"cítrico y amaderado",avoid:"sin demasiado dulzor"});
 const assistant=buildCreativeRecommendations({description:brief.description,mode:"client"});
 const proposals=generateFormulationProposals({description:brief.description,mode:"client"});
 assert.equal(brief.status,"ready");assert.equal(assistant.mode,"client");assert.equal(proposals.status,"ready");
 const known=new Set(PERFUME_ITEMS.map(item=>item.id));
 for(const proposal of proposals.proposals){
  assert.equal(proposal.totalCreativePoints,100);assert.equal(getMixTotal({items:proposal.items}),100);
  assert.ok(proposal.items.every(item=>known.has(item.id)));
  const loaded=replaceMixItems(createMixState(),proposal.items);
  assert.equal(analyzeAudienceFit(loaded.items).status,"ready");assert.deepEqual(undoMix(loaded).items,[]);
 }
});
test("integration keeps user-initiated transfer actions and local offline modules",async()=>{
 const [app,views,sw,briefEngine,audienceEngine]=await Promise.all([
  readFile(new URL("../src/js/app.js",import.meta.url),"utf8"),readFile(new URL("../src/js/ui/views.js",import.meta.url),"utf8"),
  readFile(new URL("../sw.js",import.meta.url),"utf8"),readFile(new URL("../src/js/features/laboratory/client-brief/engine.js",import.meta.url),"utf8"),
  readFile(new URL("../src/js/features/laboratory/audience-fit/engine.js",import.meta.url),"utf8")
 ]);
 assert.match(app,/send-client-brief-to-assistant/);assert.match(app,/load-formulation-proposal/);assert.match(app,/replaceMixItems/);assert.match(app,/updateAudienceFit/);
 assert.match(views,/renderAudienceFit/);assert.match(views,/id="audience-fit-root"/);assert.match(app,/root\.innerHTML = renderAudienceFit\(mixingState\.items\)/);assert.match(sw,/shell-v41/);assert.ok(sw.includes("client-brief/engine.js"));assert.ok(sw.includes("audience-fit/engine.js"));
 assert.equal(briefEngine.includes("fetch("),false);assert.equal(audienceEngine.includes("fetch("),false);
});

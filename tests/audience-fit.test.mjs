import test from "node:test";
import assert from "node:assert/strict";
import { analyzeAudienceFit } from "../src/js/features/laboratory/audience-fit/engine.js";
import { renderAudienceFit } from "../src/js/features/laboratory/audience-fit/panel.js";
const formula=ids=>{const each=Math.floor(100/ids.length);return ids.map((id,index)=>({id,points:index===ids.length-1?100-each*(ids.length-1):each}));};
test("fresh mixed structure receives a versatile positioning reading",()=>{
 const result=analyzeAudienceFit(formula(["bergamot","white-musk","marine"]));
 assert.equal(result.status,"ready");assert.equal(result.positioning,"Unisex / versátil");assert.ok(result.agePosition);assert.ok(result.families.length);
});
test("woody leather and floral compositions can lean toward different market conventions",()=>{
 const masculine=analyzeAudienceFit([{id:"cedarwood",points:50},{id:"leather",points:50}]);
 const feminine=analyzeAudienceFit([{id:"rose",points:50},{id:"peony",points:50}]);
 assert.equal(masculine.positioning,"Tendencia masculina");assert.equal(feminine.positioning,"Tendencia femenina");
 assert.match(masculine.notice,/no limita el público real/i);
});
test("age aesthetic separates fresh contemporary from structured adult profiles",()=>{
 const fresh=analyzeAudienceFit(formula(["bergamot","marine","green-tea"]));
 const mature=analyzeAudienceFit(formula(["labdanum","leather","patchouli"]));
 assert.equal(fresh.agePosition,"Juvenil / contemporáneo");assert.equal(mature.agePosition,"Adulto / sofisticado");
 assert.doesNotMatch(fresh.agePosition,/\d/);
});
test("invalid references, repeated ids and non-100 totals are rejected",()=>{
 assert.equal(analyzeAudienceFit([{id:"unknown",points:100}]).status,"invalid");
 assert.equal(analyzeAudienceFit([{id:"bergamot",points:50},{id:"bergamot",points:50}]).status,"invalid");
 assert.equal(analyzeAudienceFit([{id:"bergamot",points:70}]).status,"invalid");
});
test("audience panel hides for an empty mix and escapes reference metadata",()=>{
 assert.equal(renderAudienceFit([]),"");
 const html=renderAudienceFit([{id:"x",points:100}],[{id:"x",name:"<img>",family:"Cítrica",facets:[],profile:""}]);
 assert.match(html,/Público potencial/);assert.doesNotMatch(html,/<img>/);assert.match(html,/&lt;img&gt;/i);
});

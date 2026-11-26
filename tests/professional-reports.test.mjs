import test from "node:test";
import assert from "node:assert/strict";
import { createArchiveCreation, createArchiveVariant } from "../src/js/features/archive/model.js";
import { createSensoryExperiment } from "../src/js/features/laboratory/sensory-experiments/model.js";
import { buildProfessionalReport, toProfessionalReportCsv } from "../src/js/features/laboratory/professional-reports/engine.js";
import { renderProfessionalReports } from "../src/js/features/laboratory/professional-reports/panel.js";

function fixtures() {
  const creation = createArchiveCreation({
    name: "Jardín de Granada",
    description: "Concepto cítrico y floral",
    id: "report-creation",
    now: "2026-11-26T00:00:00.000Z",
    items: [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }]
  });
  const variant = creation.variants[0];
  const experiment = createSensoryExperiment({
    creation, variant, title: "Evaluación sobre papel",
    observedAt: "2026-11-26T01:00:00.000Z",
    impression: "Inicio cítrico y transición floral.",
    tags: ["cítrico", "floral"],
    ratings: { intensity: 4, freshness: 5 },
    id: "report-exp-1",
    now: "2026-11-26T01:10:00.000Z"
  });
  return { creation, variant, experiment };
}

test("professional dossier summarizes saved composition and matching sensory observations", () => {
  const { creation, variant, experiment } = fixtures();
  const report = buildProfessionalReport({
    creation, variant, experiments: [experiment],
    generatedAt: "2026-11-26T02:00:00.000Z"
  });
  assert.equal(report.reportType, "professional-formulation-dossier");
  assert.equal(report.summary.referenceCount, 2);
  assert.equal(report.summary.totalCreativePoints, 100);
  assert.equal(report.summary.dominantFamily, "Cítrica");
  assert.equal(report.summary.experimentCount, 1);
  assert.equal(report.sensoryExperiments[0].title, "Evaluación sobre papel");
  assert.equal(report.subjectiveRatingSummary.find((item) => item.key === "freshness").average, 5);
});

test("professional dossier excludes observations belonging to another variant", () => {
  const { creation, variant, experiment } = fixtures();
  const report = buildProfessionalReport({
    creation, variant, experiments: [{ ...experiment, variantId: "another-variant" }]
  });
  assert.equal(report.summary.experimentCount, 0);
});

test("professional dossier rejects missing, unrelated and unnormalized variants", () => {
  const { creation, variant } = fixtures();
  assert.throws(() => buildProfessionalReport({}), /creación guardada/);
  assert.throws(() => buildProfessionalReport({ creation, variant: { id: "unknown" } }), /no pertenece/);
  const invalidVariant = { ...variant, items: [{ id: "bergamot", points: 40 }] };
  const invalidCreation = { ...creation, variants: [invalidVariant] };
  assert.throws(() => buildProfessionalReport({ creation: invalidCreation, variant: invalidVariant }), /100 puntos/);
});

test("CSV export includes report sections and neutralizes spreadsheet formula prefixes", () => {
  const { creation, variant, experiment } = fixtures();
  const report = buildProfessionalReport({ creation, variant, experiments: [experiment] });
  const csv = toProfessionalReportCsv(report);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /REFERENCE/);
  assert.match(csv, /SENSORY/);
  const injected = { ...report, creation: { ...report.creation, name: "=HYPERLINK(\"x\")" } };
  assert.match(toProfessionalReportCsv(injected), /"'=HYPERLINK/);
});

test("report panel handles an empty archive and renders printable preview actions", () => {
  const empty = renderProfessionalReports({ creations: [] });
  assert.match(empty, /Guardá una creación/);
  const { creation, variant, experiment } = fixtures();
  const report = buildProfessionalReport({ creation, variant, experiments: [experiment] });
  const html = renderProfessionalReports({
    creations: [creation],
    reportSelection: JSON.stringify({ creationId: creation.id, variantId: variant.id }),
    professionalReport: report
  });
  assert.match(html, /PROFESSIONAL REPORT/);
  assert.match(html, /Dossier de/);
  assert.match(html, /print-professional-report/);
  assert.match(html, /Evaluación sobre papel/);
});

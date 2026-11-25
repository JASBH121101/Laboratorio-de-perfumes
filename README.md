# JB Virtual Perfume Lab

Personal Android-first interactive 3D virtual fragrance research and creation laboratory.

## Project goals
- Explore olfactory concepts and note combinations virtually.
- Interactive 3D laboratory with touch-first controls.
- Educational note library and conceptual fragrance analysis.
- Local-first experiment storage, versioning and export.
- Generate manufacturer-ready creative briefs for professional review.
- No chemical formulation, manufacturing instructions, or safety certification claims.

## Quality assurance
JB Expert QA 2.0 is installed as a development dependency.

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run qa:static
npm run qa:security
npm run qa:dashboard
```

Browser-based QA setup (Chromium):

```bash
npm run qa:setup-browser
```

Reports and dashboard history are local in `.jb-expert-qa/` and are ignored by Git.

## Current status
Project initialization — QA package installation configured. Next: baseline QA, architecture and 3D application scaffold.

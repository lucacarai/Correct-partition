# Correct Partition

An interactive visualization project for finite posets, order-preserving
colorings, and the step-by-step construction of the greatest color-preserving
correct partition.

## Status

The React, TypeScript, and Vite foundation, independently tested mathematical
core, SVG coloring editor, and static trace playback are implemented. The
application can inspect every alpha/beta trace state with merge explanations,
manual stepping, and adjustable-speed playback. Milestone 3 is complete;
animated bubble morphing is next.

## Local development

Requires Node.js 24 LTS or another version supported by the installed Vite
release.

```text
npm install
npm run dev
```

The development server prints its local URL, normally
`http://127.0.0.1:5173/` or `http://localhost:5173/`.

## Quality commands

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

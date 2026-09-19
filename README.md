# Correct Partition

An interactive visualization project for finite posets, order-preserving
colorings, and the step-by-step construction of the greatest color-preserving
correct partition.

## Status

The React, TypeScript, and Vite foundation and the independently tested
mathematical core are implemented. The project currently shows a minimal setup
screen; the next milestone is the SVG diagram and coloring interface described
in `docs/IMPLEMENTATION_PLAN.md`.

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

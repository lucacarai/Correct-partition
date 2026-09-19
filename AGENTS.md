# Project instructions

Read this file and the documents in `docs/` before making substantive changes.

## Current phase

The project foundation, framework-independent mathematical core, and coloring
editor are implemented and verified; Milestones 0, 1, and 2 are complete. The
next work is Milestone 3: rendering partition states and playback of the tested
alpha/beta trace. Continue to update the specifications when requirements are
clarified.

## Working agreement

- Clarify the mathematical model before implementing the interface.
- Record durable requirements in `docs/PROJECT_BRIEF.md`.
- Record definitions, invariants, and examples in `docs/MATHEMATICAL_SPEC.md`.
- Record consequential technical choices in `docs/DECISIONS.md`.
- Keep changes small, inspectable, and easy to reverse.
- Preserve user-authored changes and avoid unrelated rewrites.
- Test the mathematical core independently from the visualization.

## Provisional technical direction

Unless later requirements justify a change:

- Use TypeScript, React, and Vite.
- Render the Hasse diagram and partition boundaries with SVG.
- Keep the partition algorithm pure and independent of React, SVG, and animation.
- Have the algorithm return an ordered trace of partition states plus enough
  metadata to explain why each merge occurred.
- Treat animation as a presentation of that trace, never as algorithmic state.
- Prefer a deterministic, domain-specific layout when the poset structure makes
  one possible. Add a DAG layout dependency only if arbitrary posets require it.
- Do not let D3 own the component tree; use it only for focused calculations if
  it proves useful.
- Assume a client-only static web app unless requirements establish a need for a
  backend or persistent storage.

## Quality bar

- Favor explicit domain types and deterministic functions.
- Cover mathematical invariants and representative examples with tests.
- Include accessible controls and reduced-motion behavior in the UI plan.
- Verify behavior in the running browser before considering visual work complete.

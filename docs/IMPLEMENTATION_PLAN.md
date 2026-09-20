# Implementation plan

Implementation is authorized. Work through the milestones in order and keep
the mathematical core independent from React, SVG, and animation.

## Milestone 0: development environment — complete

- Installed Node.js 24.19.0 LTS and npm 11.17.0.
- Scaffolded Vite with React and TypeScript.
- Added Vitest, Prettier, and Oxlint.
- Established `dev`, `test`, `build`, `typecheck`, `lint`, and formatting
  commands.
- Verified an HTTP 200 response from the local development server.
- Verified formatting, linting, type checking, tests, and production build.

Exit condition: the empty application runs locally and all quality commands
pass.

## Milestone 1: mathematical core — complete

- [x] Encode the 21 elements and 37 covers from `docs/FIXED_POSET.md`.
- [x] Validate identifiers, covers, antisymmetry, and the computed transitive
      closure.
- [x] Implement upward and downward closures.
- [x] Represent the three hue-upsets and derive `c(x)`.
- [x] Generate the result and animation trace directly from identity using the
      alpha and beta quotient-class reductions in `docs/MATHEMATICAL_SPEC.md`.
- [x] Recompute the quotient order after every reduction and record its type and
      mathematical justification in the trace.
- [x] Assert after every reduction that the complete relation remains correct and
      color-preserving.
- [x] Implement stable refinement as an independent test oracle and verify that it
      produces the same final partition as the direct merge process.
- [x] Test partition invariants and hand-checked reduction examples without
      React or SVG.

Exit condition: automated tests establish that the final relation is correct,
color-preserving, and greatest, and that every trace frame is valid.

## Milestone 2: static diagram and coloring editor — complete

- [x] Render the fixed diagram in SVG using its supplied coordinates.
- [x] Draw the 37 cover edges behind the 21 point targets.
- [x] Add controls for selecting blue, red, or yellow as the active hue.
- [x] Implement closure-aware upset editing with hover previews, undo, and clear.
- [x] Render smooth hue regions and deterministic mixed overlaps according to
      `docs/VISUAL_SPEC.md`.
- [x] Make selection operable by pointer and keyboard.
- [x] Verify the responsive desktop rendering in a real browser and cover the
      pointer, keyboard, undo, clear, independent-hue, and closure behaviors in
      automated tests.
- [x] Add undoable random coloring and weighted random-poset controls.

Exit condition: the user can create every valid 3-coloring while the diagram
always displays an isotone coloring.

## Milestone 3: partition states and playback — complete

- [x] Compute the trace and immediately show its final partition when requested.
- [x] Start Replay from the identity relation, with one bubble around each point.
- [x] Add previous, next, and reset controls.
- [x] Add play, pause, and speed controls.
- [x] Render every static trace state before adding shape morphing.
- [x] Display a concise reason for each merge.

Exit condition: every trace state is inspectable and matches the tested
mathematical output.

## Milestone 4: bubble animation

Before Milestone 4, the fixed input was generalized to the confirmed layered
poset family. The user can change the number of layers and toggle optional
middle points directly in the diagram; the original 9-layer poset remains the
default. The generated order, cover relations, coloring, and trace computation
are tested independently of the interface.

- Animate class regions joining according to the trace.
- Keep color regions, Hasse edges, points, and partition boundaries readable.
- Animate the accepted pairwise merges in their deterministic order.
- Add a reduced-motion presentation that switches states without morphing.
- Tune timing and geometry in the running browser.

Exit condition: the complete computation is understandable both while playing
and while stepping manually.

## Milestone 5: polish and deployment

- Add responsive sizing, help text, legends, and empty/reset states.
- Run unit tests, type checks, production build, and visual verification.
- Deploy the static build only after the local application is accepted.

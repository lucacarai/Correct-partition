# Project brief

Status: initial behavior defined; the concrete poset and several interaction
details are still to be specified.

## Purpose

Given a fixed finite poset and a user-defined order-preserving `3`-coloring,
visually construct the greatest correct equivalence relation that identifies
only points of equal color.

## Intended users and use cases

The initial use case is exploring the mathematical construction: the user
colors a displayed poset, starts the computation, and watches equivalence
classes merge while every intermediate state remains mathematically valid.

## Inputs

- The poset is fixed by the application in the first version and is not entered
  by the user. It is the label-free 21-point diagram recorded in
  `docs/FIXED_POSET.md`.
- A coloring has exactly three independently selectable hues.
- For each hue, the user selects an arbitrary upset. Its minimal elements form
  an antichain and provide the canonical stored representation.
- A hue's upset may be empty, and two or all three hues may have identical
  upsets.
- Hue `1` is blue, hue `2` is red, and hue `3` is yellow.
- Each hue colors a spatial region around its upset, not just the interiors of
  its points. Overlapping regions mix their colors as specified in
  `docs/VISUAL_SPEC.md`.

## Outputs

- A Hasse diagram of the fixed finite poset.
- Colored regions that visualize the three hue-upsets and their overlaps.
- A visual representation of each equivalence class as a bubble.
- An animation from the identity relation to the greatest color-preserving
  correct partition.
- A sequence of mathematically valid intermediate equivalence relations.
- Optionally, a short explanation or witness for each merge; the exact content
  remains to be defined.

## Interaction and animation

Known flow:

1. Display the fixed poset as a Hasse diagram.
2. Let the user choose a hue and edit its upset directly on the diagram. The
   interface automatically preserves upward closure and marks the upset's
   minimal elements.
3. Derive and display the resulting coloring.
4. When the user presses the start button, draw one bubble around every point,
   representing the identity equivalence relation.
5. Merge bubbles step by step. Every displayed partition must remain correct
   and may identify only equally colored points.
6. Stop at the greatest equivalence relation satisfying those conditions.

Still to define:

- Confirm the proposed closure-aware click behavior: clicking an excluded point
  adds its entire principal upset; clicking an included point removes its
  principal downset from the hue's upset.
- Whether merges autoplay or advance on command.
- Play, pause, previous, next, reset, and speed behavior.
- The visual geometry of bubbles around non-adjacent points.
- Editing behavior after a result has been computed.
- Reduced-motion behavior.

## Scope boundaries

The first version does not accept arbitrary user-supplied posets. It remains to
determine whether it needs saved work, sharing, exports, a backend, accounts,
or only a client-side visualization.

## Acceptance criteria

To be written as concrete examples after the requirements are known.

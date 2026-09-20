# Project brief

Status: initial behavior defined; the concrete poset and several interaction
details are still to be specified.

## Purpose

Given a configurable layered finite poset and a user-defined order-preserving `3`-coloring,
visually construct the greatest correct equivalence relation that identifies
only points of equal color.

## Intended users and use cases

The initial use case is exploring the mathematical construction: the user
colors a displayed poset, starts the computation, and watches equivalence
classes merge while every intermediate state remains mathematically valid.

## Inputs

- The poset belongs to the three-column layered family specified in
  `docs/MATHEMATICAL_SPEC.md`. It has between 2 and 30 layers; the top layer is
  a single middle point, the next layer always has three points, and every
  later layer has left and right points plus an optional middle point.
- The 9-layer, 21-point diagram recorded in `docs/FIXED_POSET.md` is the default.
- A `Change poset` control opens a structure editor. The user enters the number
  of layers and clicks optional middle positions in the diagram to add or remove
  those points. Structural changes clear the current coloring, undo history,
  and computed trace.
- The structure editor offers a random poset. Its layer-count distribution has
  a smooth peak at 9 and decreases exponentially with distance from 9; every
  optional middle point is then selected independently with probability `1/3`.
- The coloring panel displays a versioned, URL-safe share code encoding the
  layer count, optional middle layers, and minimal generators of all three hue
  upsets. The user can copy this code or paste and load another one. Loading a
  valid code reconstructs the poset and coloring and clears undo and trace
  state; an invalid code reports an error without changing the workspace.
- A coloring has exactly three independently selectable hues.
- For each hue, the user selects an arbitrary upset. Its minimal elements form
  an antichain and provide the canonical stored representation.
- A hue's upset may be empty, and two or all three hues may have identical
  upsets.
- The coloring editor offers an undoable random coloring of the current poset.
  For each hue it samples candidate minimal generators and takes their upward
  closure, so the result always remains a valid coloring.
- Hue `1` is blue, hue `2` is red, and hue `3` is yellow.
- Each hue colors a spatial region around its upset, not just the interiors of
  its points. Overlapping regions mix their colors as specified in
  `docs/VISUAL_SPEC.md`.

## Outputs

- A Hasse diagram of the fixed finite poset.
- Colored regions that visualize the three hue-upsets and their overlaps.
- A visual representation of each equivalence class as one closed, padded
  contour containing all of its points. Bubble overlap is acceptable for now.
- An animation from the identity relation to the greatest color-preserving
  correct partition.
- A sequence of mathematically valid intermediate equivalence relations.
- An `Alpha merge` or `Beta merge` label for each merge, without an expanded
  explanation.

## Interaction and animation

Known flow:

1. Display the current layered poset as a Hasse diagram, initially using the
   original 9-layer default.
2. Let the user choose a hue and edit its upset directly on the diagram. The
   interface automatically preserves upward closure and marks the upset's
   minimal elements.
3. Derive and display the resulting coloring.
4. When the user presses `Compute correct partition`, compute the complete trace
   and immediately display the greatest correct equivalence relation.
5. When the user presses Replay, return to the identity equivalence relation,
   represented by one bubble around every point, and play the trace forward.
6. Merge bubbles step by step. Every displayed partition must remain correct
   and may identify only equally colored points.

The first partition-playback increment is manually inspectable: `Compute correct
partition` computes the tested trace and immediately displays its final frame.
Previous and Next move through static frames, Replay starts playback from the
identity frame, and Reset returns to the coloring editor.
The Left and Right arrow keys mirror Previous and Next while the trace page is
active. Pressing either arrow during playback pauses before moving one frame.
The merge-explanation box is initially blank on the computed final frame. After
the user first presses Replay, Previous, or Next, it resumes displaying the
Identity, Alpha merge, and Beta merge labels for the selected trace frames.
Coloring controls and point editing are unavailable while a computed trace is
being inspected so that the displayed trace always corresponds to the visible
coloring.

Playback advances one trace frame every 0.6 seconds at the default `1x` speed.
The available speeds are `0.5x`, `1x`, and `2x`. Previous and Next pause active
playback before stepping, Pause leaves the current frame selected, and Replay on
the final frame restarts from the identity frame. Reset stops playback and
returns to the unchanged coloring.

Every class remains a closed, connected region. The current renderer uses a
simple padded convex contour for each class and does not attempt to prevent
overlap. No class-letter labels are shown.

Still to define:

- Confirm the proposed closure-aware click behavior: clicking an excluded point
  adds its entire principal upset; clicking an included point removes its
  principal downset from the hue's upset.
- Reduced-motion behavior.

## Scope boundaries

The first version does not accept arbitrary user-supplied posets outside the
specified three-column layered family. It remains to determine whether it needs
saved work, sharing, exports, a backend, accounts, or only a client-side
visualization.

## Acceptance criteria

To be written as concrete examples after the requirements are known.

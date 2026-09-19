# Decision log

These are provisional decisions derived from the initial technical guidance.
They can change when the requirements make a different choice clearly better.

| ID    | Status      | Decision                                                                                                                                                                                                         | Reason                                                                                                                                                                       |
| ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-001 | Provisional | Build a browser-based app with React, TypeScript, and Vite.                                                                                                                                                      | A tight local edit-run-inspect loop and straightforward static deployment suit an interactive visualization.                                                                 |
| D-002 | Provisional | Use SVG for the Hasse diagram, nodes, edges, labels, and partition boundaries.                                                                                                                                   | SVG keeps mathematical objects inspectable and supports precise interaction and animation.                                                                                   |
| D-003 | Provisional | Keep mathematics, layout, and animation as separate concerns.                                                                                                                                                    | The partition algorithm must be testable independently of visual behavior.                                                                                                   |
| D-004 | Provisional | Model computation as an ordered trace of partition states with merge explanations.                                                                                                                               | This directly supports play, pause, stepping, and mathematical inspection.                                                                                                   |
| D-005 | Provisional | Prefer a custom deterministic layout; evaluate a DAG layout library only if arbitrary posets demand it.                                                                                                          | Structured posets can often be laid out more clearly from their ranks than by a generic engine.                                                                              |
| D-006 | Provisional | Start as a client-only static app.                                                                                                                                                                               | No backend or database is needed unless later requirements introduce persistence, collaboration, or server-only computation.                                                 |
| D-007 | Accepted    | Use a fixed finite poset in the first version.                                                                                                                                                                   | User-supplied posets are outside the initial scope.                                                                                                                          |
| D-008 | Accepted    | Animate from the identity relation through only correct, color-preserving equivalence relations.                                                                                                                 | Every visible state should represent a valid stage of the mathematical construction.                                                                                         |
| D-009 | Accepted    | Target the greatest relation under inclusion, equivalently the coarsest admissible partition.                                                                                                                    | This is the requested largest correct partition preserving the coloring.                                                                                                     |
| D-010 | Accepted    | Use the coordinates from the supplied TikZ diagram as a deterministic custom layout.                                                                                                                             | The fixed poset already has an intended three-column geometry, so an automatic graph-layout dependency is unnecessary.                                                       |
| D-011 | Accepted    | Treat all 37 TikZ arrows as covers and the unlabeled bottom-center source as the twenty-first element.                                                                                                           | The user explicitly confirmed both interpretations.                                                                                                                          |
| D-012 | Accepted    | Fix `n = 3`; allow empty hue-upsets and coincident hue-upsets.                                                                                                                                                   | Three fixed hue channels make every coloring visually representable while retaining all requested input cases.                                                               |
| D-013 | Accepted    | Map `1` to blue, `2` to red, and `3` to yellow; render their upsets as surrounding spatial regions with mixed overlaps.                                                                                          | The coloring should read as colored areas around the Hasse diagram, not as marks confined to individual points.                                                              |
| D-014 | Accepted    | Generate the visible trace directly from identity using same-color alpha and beta reductions on the current quotient classes.                                                                                    | This is the user-supplied constructive procedure; it avoids computing the final partition before the animation, while stable refinement remains an independent test oracle.  |
| D-015 | Accepted    | Condition 1 is the alpha reduction and uses the least strict upper class; condition 2 is the beta reduction and compares complete strict-upper-class sets.                                                       | The user confirmed both the terminology and the literal distinction between least and merely minimal.                                                                        |
| D-016 | Accepted    | Prefer alpha reductions to beta reductions, then order candidates top-to-bottom and left-to-right.                                                                                                               | This makes repeated runs produce the same mathematically valid animation trace.                                                                                              |
| D-017 | Accepted    | Build each hue region from a solid convex hull backed by wide rounded cover strokes and point disks, then multiply-composite light hue bases.                                                                    | The hull removes internal holes, the strokes retain rounded small-region geometry, and light multiply bases give deterministic, order-independent mixed colors.              |
| D-018 | Superseded  | Render Milestone 3 partition classes as deterministic padded convex SVG contours, without morphing.                                                                                                              | Superseded by D-021 because convex contours cannot guarantee that distinct class bubbles remain disjoint.                                                                    |
| D-019 | Accepted    | Freeze coloring edits while a computed trace is being inspected; Reset discards the trace and returns to the unchanged coloring.                                                                                 | A displayed trace must always correspond to the visible coloring, and returning to the editor should not destroy the user's input.                                           |
| D-020 | Accepted    | Compute and show the final partition immediately. Use 0.6 seconds per frame at `1x`, offer `0.5x`, `1x`, and `2x`, pause on manual stepping, and replay from identity when Replay is pressed on the final frame. | These deterministic controls support both immediate access to the result and inspection of its construction without introducing animation state into the mathematical trace. |
| D-021 | Superseded  | Render each class as fixed circular components around its members, repeating one stable letter badge on every component of a multi-point class.                                                                  | This guaranteed separation but made merged classes look like the identity partition; superseded by D-022.                                                                    |
| D-022 | Superseded  | Render padded merged contours, clipped to exclusive inset nearest-class territories, with no class-letter labels.                                                                                                | Exclusive territories preserve a visible merge while a fixed gap makes overlap impossible, including for interleaved classes.                                                |

D-023 (accepted): Closed connected class contours take priority over avoiding
all overlaps. Use whole-class separating lines to trim excess padding where
possible; allow overlap for interleaved convex envelopes. This supersedes D-022.
No SVG clipping masks or morphological filters are used for partition outlines.

D-024 (accepted): Restore simple padded convex class contours and defer all
overlap avoidance. This supersedes the separating-line behavior in D-023 and
keeps the bubble renderer straightforward while animation work proceeds.

D-025 (accepted): Deploy the static Vite build to GitHub Pages at
`https://lucacarai.github.io/Correct-partition/` using a GitHub Actions
workflow. Set Vite's base path to `/Correct-partition/` so generated asset URLs
work from the project-site subpath.

D-026 (accepted): Replace the fixed-poset restriction with the confirmed
three-column layered family. Keep the original 9-layer poset as the default;
allow between 2 and 30 layers and optional middle points below the mandatory
first two layers. Generate the order from the layer/column inequality in the
mathematical specification and derive its covers by transitive reduction. Poset
edits clear coloring and trace state so no state can refer to removed elements.

D-027 (accepted): Adjacent middle-column points are incomparable except for the
mandatory middle points in the top two layers. Apply this exception to the
generated order itself, not only to rendering, so every displayed edge remains
a genuine Hasse cover and partition computation uses the same poset the user
sees.

D-028 (accepted): Subtract a small circular exclusion halo from each hue-region
mask around every point outside that hue. Independent per-hue subtraction keeps
convex color regions from visually assigning a hue to an enclosed nonmember
while preserving any other hues that the point actually has.

D-029 (accepted): Encode a workspace as a versioned `CP1` base64url string
containing the layer count, optional middle layers, and the three ordered lists
of minimal hue generators. This compact representation reconstructs the full
poset and coloring without serializing derived covers or complete upsets. Reject
invalid codes before changing any application state.

D-030 (accepted): Leave the trace explanation box blank when computation first
opens on the final partition. Enable the usual Identity, Alpha merge, and Beta
merge labels after the user initiates Replay or manually navigates with Previous
or Next, so the immediate result is presented without implying a displayed
transition.

## New decision template

```text
ID:
Date:
Status: Proposed | Accepted | Superseded
Context:
Decision:
Consequences:
```

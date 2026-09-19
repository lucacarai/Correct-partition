# Visual specification

Status: initial direction established; exact contour geometry and color values
will be tuned in the running application.

## Hue mapping

The three mathematical hue indices have fixed visual meanings:

| Index | Base hue |
| ----- | -------- |
| `1`   | Blue     |
| `2`   | Red      |
| `3`   | Yellow   |

Color is not confined to the point marker. For every hue `i`, the application
draws a spatial region around the points of its upset `U_i`.

## Region behavior

- A hue region surrounds every point belonging to its upset.
- Nearby parts of the same hue region should join into a smooth, organic shape
  rather than appearing only as isolated colored point disks.
- A connected hue region has a solid interior with no uncolored holes.
- Regions sit behind Hasse edges, point markers, generator indicators, and
  equivalence-class bubbles.
- An empty hue-upset produces no region.
- Coincident hue-upsets produce coincident regions whose colors mix.
- Region boundaries should be soft enough to read as areas but precise enough
  that membership of every point remains unambiguous.

## Mixing

Where several hue regions overlap, the colors mix. The intended qualitative
results are:

| Active indices | Visual result                           |
| -------------- | --------------------------------------- |
| none           | Neutral background                      |
| `{1}`          | Blue                                    |
| `{2}`          | Red                                     |
| `{3}`          | Yellow                                  |
| `{1, 2}`       | Purple                                  |
| `{1, 3}`       | Green                                   |
| `{2, 3}`       | Orange                                  |
| `{1, 2, 3}`    | Dark mixed neutral, provisionally brown |

The implementation should use deterministic, order-independent compositing.
Exact accessible color values and opacity will be selected and visually tested
during implementation.

## Layer order

Draw from back to front:

1. Neutral background.
2. Blue, red, and yellow hue regions and their mixed overlaps.
3. Hasse cover edges.
4. Poset point markers and minimal-generator indicators.
5. Equivalence-class bubble fills and outlines.
6. Interaction previews and controls.

The coloring and equivalence-class layers express different mathematics and
must remain visually distinguishable throughout the animation.

## Partition bubbles

- Each equivalence class starts from a padded merged contour around all of its
  points.
- Every class remains one closed, connected contour, with no clipping masks
  or filter-generated outlines.
- Separate whole class envelopes where possible while preserving space around
  every member point. Allow overlap for interleaved envelopes rather than
  splitting a class or leaving an open outline.
- Use no class-letter labels.
- The current merge label states only `Alpha merge` or `Beta merge`.

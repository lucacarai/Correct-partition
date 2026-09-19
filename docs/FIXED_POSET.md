# Default poset

This document records the supplied TikZ diagram that remains the application
default. It is one member of the configurable layered family defined in
`docs/MATHEMATICAL_SPEC.md` and translates the original into label-free
internal identifiers. The visible application should not display the source
element names.

## Coordinate convention

- Rows are numbered `0` through `8` from top to bottom.
- Columns are numbered `0` through `2` from left to right.
- An internal identifier `rNcM` means row `N`, column `M`.
- Row numbers describe the supplied drawing, not a mathematical rank function.

The 21 points are positioned as follows:

| Row | Left (`c0`) | Center (`c1`) | Right (`c2`) |
| --- | ----------- | ------------- | ------------ |
| 0   |             | `r0c1`        |              |
| 1   | `r1c0`      | `r1c1`        | `r1c2`       |
| 2   | `r2c0`      |               | `r2c2`       |
| 3   | `r3c0`      |               | `r3c2`       |
| 4   | `r4c0`      | `r4c1`        | `r4c2`       |
| 5   | `r5c0`      |               | `r5c2`       |
| 6   | `r6c0`      | `r6c1`        | `r6c2`       |
| 7   | `r7c0`      |               | `r7c2`       |
| 8   | `r8c0`      | `r8c1`        | `r8c2`       |

The supplied TikZ source contains an unlabeled point at `r8c1` with two
outgoing arrows. The user confirmed that it is an element of the poset.

## Cover relations

The user confirmed that every supplied arrow is an upward cover relation. Each
line below has the form `lower < upper`:

```text
r1c0 < r0c1
r1c1 < r0c1
r1c2 < r0c1

r2c0 < r1c0
r2c0 < r1c1
r2c2 < r1c1
r2c2 < r1c2

r3c0 < r2c0
r3c0 < r1c2
r3c2 < r2c2
r3c2 < r1c0

r4c0 < r3c0
r4c0 < r2c2
r4c1 < r3c0
r4c1 < r3c2
r4c2 < r3c2
r4c2 < r2c0

r5c0 < r4c0
r5c0 < r4c1
r5c2 < r4c1
r5c2 < r4c2

r6c0 < r5c0
r6c0 < r4c2
r6c1 < r5c0
r6c1 < r5c2
r6c2 < r5c2
r6c2 < r4c0

r7c0 < r6c0
r7c0 < r6c1
r7c2 < r6c1
r7c2 < r6c2

r8c0 < r7c0
r8c0 < r6c2
r8c1 < r7c0
r8c1 < r7c2
r8c2 < r7c2
r8c2 < r6c0
```

The order relation is the reflexive-transitive closure of these 37 cover
relations.

## Display requirements

- Preserve the three-column, nine-row geometry of the source diagram.
- Draw cover relations only; do not draw all comparable pairs.
- Draw every edge behind the point markers and partition bubbles.
- Do not show element-name labels in the initial interface.
- Keep stable internal identifiers for computation, testing, and accessibility.

# Mathematical specification

Status: core definitions and the initial fixed poset are supplied; some input
conventions and worked examples are still needed.

This document should be complete enough that the algorithm can be implemented
and tested without referring to the UI.

## Poset family

Let `(X, <=)` be a finite poset. In the first version, `X` is the 21-element
poset defined by coordinates and 37 cover relations in `docs/FIXED_POSET.md`.
The order relation is the reflexive-transitive closure of those covers.

The supplied diagram also determines the initial display coordinates. Its row
numbers are layout positions rather than an assumed rank function. Every TikZ
arrow is a confirmed cover relation, and the unlabeled bottom-center source is
a confirmed element. The initial interface displays points without their source
element-name labels.

## Coloring

The application uses `n = 3`. A coloring is an isotone map

```text
c : X -> P({1, 2, 3}),
```

where the powerset is ordered by inclusion. Thus

```text
x <= y  implies  c(x) is a subset of c(y).
```

Equivalently, for every hue `i` in `{1, 2, 3}`, the carrier

```text
U_i = { x in X | i is in c(x) }
```

is an upset.

For a finite poset, every upset `U_i` is uniquely determined by its set of
minimal elements

```text
M_i = Min(U_i).
```

The set `M_i` is an antichain, and

```text
U_i = upward-closure(M_i)
    = union over m in M_i of upward-closure(m),

c(x) = { i | there exists m in M_i with m <= x }.
```

Therefore, storing `M_i` represents every possible upset, not only principal
upsets. The empty selection represents the empty upset.

Each `U_i` may be empty. Distinct hues are independent, so `U_i = U_j` is
allowed for `i != j`; in particular, two or all three hue-upsets may coincide.
The visual mapping is `1 = blue`, `2 = red`, and `3 = yellow`; this mapping does
not change the mathematical role of the indices.

The proposed direct manipulation is closure-aware. For the active hue `i`:

```text
click x outside U_i: U_i := U_i union upward-closure(x)
click x inside U_i:  U_i := U_i minus downward-closure(x)
```

These are respectively the smallest upset containing both the old upset and
`x`, and the largest upset contained in the old upset that excludes `x`. After
each edit, the application recomputes `M_i = Min(U_i)`. The UI should visibly
distinguish minimal generators from points that merely inherit the hue.

A partition preserves the coloring when

```text
x E y  implies  c(x) = c(y).
```

## Correct partitions

An equivalence relation `E` on `X` is a correct partition when

```text
x E y and y <= z  implies  there exists w >= x such that w E z.
```

Because `E` is symmetric, this condition applies in both directions between
equivalent points. A useful equivalent characterization is obtained by setting

```text
Reach_E(x) = { [z]_E | x <= z }.
```

Then `E` is correct exactly when

```text
x E y  implies  Reach_E(x) = Reach_E(y).
```

The identity equivalence relation is correct and preserves every coloring.

Equivalence relations are ordered by inclusion. A larger relation has fewer,
larger equivalence classes, so the desired result is the greatest relation, or
equivalently the coarsest partition, among all correct relations contained in
the kernel of `c`.

The intended result therefore satisfies:

```text
E is correct;
x E y implies c(x) = c(y); and
every other relation satisfying the two conditions is contained in E.
```

### Stable refinement computation

The greatest relation exists and can be computed by finite partition
refinement.

Start with the color partition

```text
P_0 = { nonempty fibers of c }.
```

For a partition `P`, define the upward block signature

```text
signature_P(x) = { B in P | there exists z in B with x <= z }.
```

Obtain `P_(k+1)` by splitting every block of `P_k` so that two elements remain
together exactly when their signatures relative to `P_k` are equal. Because
`X` is finite, this descending refinement sequence stabilizes at a partition
`P_*`.

The stable partition is correct: if `x` and `y` are in the same stable block
and `y <= z`, then `[z]` occurs in `signature_P*(y)`. Equal signatures provide
`w >= x` in `[z]`, so `w` is equivalent to `z`.

It is greatest among color-preserving correct partitions. If `E` is any such
partition, then `E` refines `P_0`. Inductively, if `E` refines `P_k`, correctness
implies that `E`-equivalent elements have equal `P_k` signatures, so `E` also
refines `P_(k+1)`. Hence `E` refines the stable partition `P_*`.

## Algorithm contract

The mathematical layer should eventually expose a pure operation conceptually
like:

```text
computeGreatestCorrectPartition(poset, coloring) -> trace
```

The trace should contain:

- The initial singleton partition.
- Every intermediate partition state.
- The final greatest color-preserving correct partition.
- A machine-readable reason or witness for every merge.
- A deterministic ordering when several pairwise merges are valid.

For every consecutive pair `E_k`, `E_(k+1)` in the trace:

```text
E_k is contained in E_(k+1),
E_k and E_(k+1) are correct, and
both preserve the coloring.
```

### Quotient order

For a correct partition `E`, its equivalence classes carry the quotient order

```text
A <=_E B
```

when some element of `A` lies below some element of `B`. Correctness ensures
that the existential choice can equivalently be made starting from any element
of `A`.

Write

```text
StrictUpper_E(A) = { C | A <_E C }.
```

Because the partition preserves coloring, its class color is well-defined:
`color(A) = c(x)` for any `x` in `A`.

### Alpha and beta reductions

Let `A` and `B` be two distinct classes of the current correct partition with
`color(A) = color(B)`. They may be merged when either condition holds.

The user confirmed the naming below and confirmed that "least" has its literal
order-theoretic meaning, not the weaker meaning "minimal."

Alpha reduction:

```text
A <_E B, and
B is the least class strictly above A;
equivalently, for every C with A <_E C, B <=_E C.
```

Beta reduction:

```text
StrictUpper_E(A) = StrictUpper_E(B).
```

For distinct classes, the beta condition implies that `A` and `B` are
incomparable: if `A <_E B`, then `B` belongs to `StrictUpper_E(A)` but not to
`StrictUpper_E(B)`.

Both reductions preserve correctness, and the equal-color requirement ensures
that they preserve the coloring.

### Direct identity-to-result algorithm

The animation computes its result without first computing `P_*`:

1. Start with the identity partition `E`.
2. Construct the current quotient order on the `E`-classes.
3. Find two same-color classes satisfying an alpha or beta reduction.
4. Merge them and emit the new partition as the next animation frame.
5. Recompute the quotient order and reduction candidates.
6. Stop when neither reduction is possible.

Every accepted merge reduces the number of classes, so the procedure performs
at most `|X| - 1` reductions. When several reductions are available, alpha
reductions take priority over beta reductions. Within a reduction type,
candidates are ordered by the first element of each class in the fixed diagram's
top-to-bottom, then left-to-right element order. Each trace step records whether
it was an alpha or beta reduction and the quotient-order facts that justified
it.

The implementation will additionally validate the full correctness condition
after every reduction. This is inexpensive for 21 elements and acts as an
internal invariant check rather than as the rule for selecting a merge.

The stable refinement computation remains useful as an independent reference
implementation in tests: its result must equal the terminal alpha/beta
partition.

## Worked examples

Add at least:

- The smallest nontrivial example.
- An example with no required merges.
- An example with several merge steps.
- An example where several merges are possible at once.
- A boundary or invalid-input example.

For each example, list the elements, order or covers, coloring, complete trace,
and expected final partition.

## Properties to test

Candidate properties, to confirm after formalization:

- Every trace state is a partition of exactly the poset elements.
- Trace states become only coarser, never finer.
- Each transition is justified by the correctness rules.
- The final partition is correct.
- The final relation contains every correct color-preserving equivalence
  relation.
- Results do not depend on incidental collection ordering.

## Open mathematical and product questions

- Confirm the proposed closure-aware direct manipulation rules for adding and
  removing points from an upset.
- Should each animation step display a mathematical reason or witness?

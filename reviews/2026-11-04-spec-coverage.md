# Specification coverage map, 4 November 2026

Scope: every learning outcome of the NCCA Junior Cycle Mathematics specification
that is examinable at Higher Level, mapped to the chapter, lesson, challenge and
toolkit-method ids of the guide. Read-only across all chapters: no chapter file was
edited for this map; content gaps are listed at the end for integration.

## Sources

- NCCA, Junior Cycle Mathematics specification (2018), PDF downloaded from
  https://www.curriculumonline.ie/getmedia/6a7f1ff5-9b9e-4d71-8e1f-6d4f932191db/JC_Mathematics_Specification.pdf
  (76 pages; learning outcomes on pages 14 to 20; Appendix B "Geometry for
  Post-Primary School Mathematics" on pages 27 to 76, with section 9 for JC Ordinary
  Level and section 10 "Additional Content for JCHL" on page 73).
- Higher-Level-only text is printed in bold in the specification (page 13: "the
  learning outcomes ... expected of students who take the Higher-level mathematics
  examination are highlighted in bold"). Bold is lost in plain text extraction, so
  the bold spans were recovered from the PDF font data (DejaVu "Bold" faces on pages
  15 to 20). The HL-only elements are marked (HL) below.
- Strand overview pages: https://www.curriculumonline.ie/Junior-cycle/Junior-Cycle-Subjects/Mathematics
  and https://www.curriculumonline.ie/Junior-cycle/Junior-Cycle-Subjects/Mathematics/Expectations-for-students
- State Examinations Commission, Formulae and Tables booklet:
  https://www.examinations.ie/misc-doc/BI-EX-7266997.pdf. UNVERIFIED: the
  examinations.ie domain could not be fetched through the review environment's
  proxy (permission not granted; the same block was reported by another reviewer).
  Nothing below about the booklet is checked against the booklet itself; see the
  "SEC conventions" section for what was checked against the specification instead.

How the map was built: the specification text was extracted with PyMuPDF; every
lesson goal, step text, step maths, quick-check question, challenge, toolkit method
and practice row in source/data was searched for the terms and notations each
outcome names (for example "lowest common multiple", "ax + by + c", "back-to-back",
"axes of symmetry", "↦", "0.0 … × 10⁻"), and the matching lessons were read to
confirm what is actually taught. Status: covered (taught in at least one lesson with
an exercise), partly (mentioned, or taught only in a toolkit method, practice row or
challenge), missing (no teaching anywhere in the guide).

## Unifying strand (U.1 to U.13)

The unifying outcomes are cross-cutting and are not mapped line by line. Evidence
that each is exercised somewhere: U.1 and U.2 in every lesson step and quick check;
U.3 (equality as a relationship) in 01-05, 10-01 and 21-03; U.4 (represent in
several ways) in 18-01, 18-07, 19-01, 20-02 and 23-01; U.5 and U.6 (connections) in
the 96 chapter challenges, which are written to combine methods, and in chapters 4,
12, 17, 20 and 23; U.7 to U.10 (problem solving, interpreting and evaluating
solutions) in the written exercises, whose "check" field asks for an independent
verification, and in 15-03 and 23-05 where impossible roots are rejected; U.11 to
U.13 (generalisation, conjecture and proof) in 08-06 to 08-12, 16-04 to 16-08 and
18-04 to 18-06. Status: covered.

## Number strand

| Outcome | HL element | Status | Where taught | Note |
| --- | --- | --- | --- | --- |
| N.1(a) models of the four operations in ℕ, ℤ, ℚ (number line, decomposition, accumulating groups) | | partly | 01-08 (number line placement), 01-04 (signed substitution) | No lesson models an operation on the number line or by decomposition. Low exam weight. |
| N.1(b) operations and their properties in ℕ, ℤ, ℚ and in ℝ∖ℚ, including operating on surds | ℝ∖ℚ and surds | covered | 01-04, 01-08, 14-04 (simplify, combine, multiply surds), 14-c02, 14-m3; distributive law in 01-02 and 02-01; commutativity in 02-04 | The words "commutative" and "associative" are only used for sets (03-03). |
| N.1(c) I, II index laws aᵖaᵠ, aᵖ/aᵠ, (aᵖ)ᵠ, n^(1/2) = √n | | covered | 14-01, 14-m0 | |
| N.1(c) III a⁰ = 1, a^(p/q), a⁻ʳ, (ab)ʳ, (a/b)ʳ | HL | covered | 14-01, 14-02, 14-03, 14-c01, 23-06 (a⁰ in context) | |
| N.1(c) IV, V generalise index relationships; order of operations with brackets and indices | | covered | 14-03, 14-07, 01-04, 21-07 | |
| N.1(d) factors, HCF, multiples, LCM, prime numbers | | partly | 02-01 (HCF of algebraic terms), 21-03 and 10-c01 (LCM of denominators) | No lesson on prime numbers, prime factorisation or the HCF and LCM of whole numbers. The word "prime" (number) does not occur in the guide. |
| N.1(e) answers to a stated accuracy (nearest hundred, decimal places, significant figures) | | covered | 14-06, 14-c03, 14-c04 | |
| N.1(f) standard form a × 10ⁿ for p ≥ 1 and for 0 < p < 1 | 0 < p < 1 | covered | 14-05 (includes 0.0… = … × 10⁻ⁿ), 14-c03 | |
| N.2(a) convert between fractions, decimals and percentages | | partly | 04-01 (percentage multipliers), 04-07, 05-c02, 21-04 (fraction word problems) | No lesson sets out the three-way conversion itself (for example 3/8 = 0.375 = 37.5%). |
| N.2(b) ratio and proportion | | covered | 12-01, 12-c02, 20-02, 06-06 | |
| N.2(c) money: bills, VAT, profit or loss and % profit or loss, cost and selling price, compound interest, income tax, net pay, value for money | | partly | 04-03 (bills, VAT), 04-02 (profit, markup, margin), 04-06, 04-07, 04-c01, 04-c03 (compound interest, interest tax), 04-04, 04-c04 (tax bands, credits, USC and PRSI), 04-05 (currency) | "Value for money calculations and judgements" is the one named item with no exercise: no task compares unit prices or pack sizes. |
| N.2(c) markup, margin, compound interest beyond 3 years, income tax and net pay with other deductions | HL | covered | 04-02, 04-04, 04-06, 04-07, 04-c04 | |
| N.3(a) absolute and relative comparison | | missing | | The guide never contrasts an absolute change (€50) with a relative one (5%). The nearest material is 04-01 and 13-05 ("the size of the actual change"), which does not name the distinction. |
| N.3(b) proportionality problems, currency conversion, average speed, distance and time | | covered | 04-05, 12-03, 12-c01, 12-c04, 20-01, 11-08 | |
| N.4 numerical patterns in tables and graphs; continue patterns | | covered | 18-01, 18-03, 18-05, 18-07, 20-02 | |
| N.5(a), (b) set concept, equality, listing and rule definitions, 2-set and 3-set Venn diagrams | 3-set | covered | 03-01, 03-02, 03-04, 03-05, 09-06 | |
| N.5(c) notation: ∅, ⊂, complement, ∈, universal set, #, ∩, ∪, ∖, ℕ, ℤ, ℚ, ℝ, ℝ∖ℚ | | covered | 03-01 (∈, ∉, ⊂, #, n( ), number families), 03-02 (U, ′, ∩, ∪), 03-03 (∖), 01-08 and 14-04 (irrationals) | ℝ∖ℚ itself is written in 01-08 and 14-04; 03-01 nests ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. |
| N.5(d) intersection, union, difference and complement on 2 and on 3 sets, with brackets for order | 3 sets | covered | 03-02, 03-03, 03-04, 03-05, 03-c01 to 03-c04 | |
| N.5(e) whether ∩, ∪ and ∖ are commutative and/or associative | HL | partly | 03-03 (set difference is not commutative), 3-m3 ("neither generally commutative nor associative") | Commutativity and associativity of ∩ and ∪ are never stated or tested; associativity of ∖ is asserted in a toolkit rule only. |

## Geometry and trigonometry strand

| Outcome | HL element | Status | Where taught | Note |
| --- | --- | --- | --- | --- |
| GT.1 units of measure and time | | covered | 12-02, 12-c04, 06-06, 06-04 (cm³ and litres), 17-04 | |
| GT.2(a) draw and interpret scaled diagrams | | covered | 06-06, 06-c04, 6-m8 | |
| GT.2(b) nets of rectangular solids, prisms (polygonal bases), cylinders | prisms and cylinders | partly | 06-04 and 6-m3 (cuboid faces and surface area), 17-02 (unrolling a cylinder's curved surface) | No task draws or interprets a net of a prism or of a cylinder as a net; the cuboid net is named in the method title only. |
| GT.2(c) perimeter and area of figures combining discs, triangles and rectangles | | covered | 06-01, 06-02, 06-03, 06-c02, 16-03 (semicircle), 22-c02 | |
| GT.2(d) volume of rectangular solids, cylinders, triangular prisms, spheres and combinations | triangular prisms, spheres | covered | 06-04, 06-05, 06-c01, 17-01, 17-03, 17-c01, 17-c04 | |
| GT.2(e) surface area and curved surface area of the same solids | triangular prisms, spheres | covered | 06-04, 06-05, 17-02, 17-03, 17-c01 | |
| GT.3(a) constructions 1 to 15 | 3 and 7 | covered | 1: 24-06; 2: 24-05; 3 (HL): 24-15; 4: 24-07; 5: 24-08; 6 and 7 (HL, any number of parts): 24-09; 8 and 9: as steps inside 24-11 and 24-c01 (compass transfer of a length; angle by protractor); 10: 24-10; 11: 24-11; 12: 24-12; 13: 24-13; 14: 24-13 step 4; 15: 24-14 | Constructions 8 and 9 have no lesson of their own; both are one-step and are performed inside the triangle constructions. |
| GT.3(b) I axioms 1 to 5 | | partly | 08-06 (what an axiom is) | The five axioms are not listed or named individually. |
| GT.3(b) II theorems 1, 2, 3, 4, 5, 6, 9, 10, 13, 14, 15 and converses | | covered | 1: 08-07; 2: 08-08 (with converse); 3 and 5: 08-09 (both directions); 4: 16-04; 6: 08-02, 16-05; 9: 08-03, 16-06; 10: 08-10; 13: 08-11, 16-01; 14: 08-05, 16-07; 15: 08-12 | |
| GT.3(b) II theorems 11, 12, 19 and converses, with square roots | HL | partly | 12: 16-02; 19: 16-03, 16-08; 11: used silently in 24-09 (equal segments on a transversal cut by parallels) | Theorem 11 is never stated. The specification (Appendix B 10.3) asks students to "make use of" theorems 11 and 12 without their proofs. |
| GT.3(b) III corollaries 3, 4 | | covered | 16-03 (angle in a semicircle; right angle on a chord gives a diameter) | |
| GT.3(b) III corollaries 1, 2, 5 and converses | HL | partly | 2 and 5: 16-03, 16-m4, 24-c04; 1: implicit in 16-06 (a diagonal gives two congruent triangles by ASA) | Corollary 1 is used but not named as a result in its own right. |
| GT.3(c) use and explain theorem, proof, axiom, corollary, converse, implies | | covered | 08-06, 8-m6; "implies" in practice 08 rows | |
| GT.3(d) create and evaluate proofs | | covered | 08-c01, 08-c04, 16-c04, 16-04 to 16-08 | |
| GT.3(e) understanding of the proofs of theorems 1, 2, 3, 4, 5, 6, 9, 10, 14, 15 and corollaries 3, 4 | | covered | as in GT.3(b); corollaries 3 and 4 derived in 16-03 and 16-08 | |
| GT.3(e) proofs of theorems 13, 19 and corollaries 1, 2, 5 | HL | covered | 08-11 (13), 16-08 (19, with corollaries 2 and 5 as consequences), 16-06 (1) | |
| GT.4 sin, cos, tan and inverses for angles between 0° and 90°, integer and decimal | decimal form | covered | 22-02, 22-03 (inverse ratios, degree mode), 22-04, 22-05, 22-06, 22-c04 | |
| GT.5(a) distance, midpoint, slope, intersection, slopes of parallel and perpendicular lines | perpendicular | covered | 11-01, 11-02, 11-05, 11-07, 11-c02, 11-c04 | |
| GT.5(b) graphs of line segments, rate of change and y-intercept in context | | covered | 11-06, 11-08, 20-01, 20-02, 23-c02 | |
| GT.5(c) equation of a line as y = mx + c | | covered | 11-04, 11-03 | |
| GT.5(c) y − y₁ = m(x − x₁) and ax + by + c = 0 | HL | partly | point-slope form: 11-03, 11-m5; general form: 11-m4 (toolkit rule "for b ≠ 0, ax + by + c = 0 gives m = −a/b"), practice 11-03-w2 ("give your answer in the form ax + by + c = 0") | No lesson step converts between y = mx + c and ax + by + c = 0 or reads slope and intercept from the general form; 11-04 rearranges 2x + 3y = 12 only as a special case. |
| GT.6(a) images under translation, central symmetry, axial symmetry and rotation | | covered | 24-01, 24-02, 24-03, 24-04, 24-c03, 24-c04 | |
| GT.6(b) draw the axes of symmetry in shapes | | partly | 24-03 (axis of symmetry of a shape is named and tested in a quick check), practice 24-03 rows, 15-c03 | No lesson step has the student draw all axes of symmetry of a given shape (rectangle, rhombus, regular polygon). |

## Algebra and functions strand

| Outcome | HL element | Status | Where taught | Note |
| --- | --- | --- | --- | --- |
| AF.1(a) patterns and relationships in tables and graphs | | covered | 18-01, 18-07, 20-02, 23-01 | |
| AF.1(b) generalised expression for linear and quadratic patterns, converting between representations | quadratic | covered | 18-04, 18-05, 18-06, 18-c01, 18-c04 | |
| AF.1(c) categorise patterns as linear, non-linear, quadratic, exponential (doubling and tripling) | quadratic and exponential | covered | 18-03, 18-07, 23-06, 23-c03 | |
| AF.2(a), (b), (c) expressions, evaluation, equations | | covered | 01-01, 01-04, 01-06, 19-03, 21-07 | |
| AF.3(a) I, II add, subtract and simplify linear and quadratic expressions | | covered | 01-01, 01-c01 | |
| AF.3(a) III expressions of the form a/(bx + c) | HL | covered | 21-01, 21-10, 21-c01 | |
| AF.3(b) I multiply a(bx + cy + d), a(bx² + cx + d), ax(bx² + cx + d) | | covered | 02-01, 01-02 | |
| AF.3(b) II (ax + b)(cx + d) and (ax + b)(cx² + dx + e) | cubic product | covered | 01-02, 01-03, 01-c01 | |
| AF.3(c) divide quadratic and cubic expressions by linear expressions, no remainder | cubic | covered | 01-07, 01-c02, 02-c02 | |
| AF.3(d) I to III factorise axy, axy + byz, sx − ty + tx − sy | | covered | 02-01, 02-02 | |
| AF.3(d) IV dx² + bx, x² + bx + c, ax² + bx + c | a ≠ 1 | covered | 02-01, 02-04, 02-05, 02-c01 | |
| AF.3(d) V x² − a² and a²x² − b²y² | two-variable form | covered | 02-03 (9x² − 25), practice 02-03-w2 (9a² − 16b²) | |
| AF.4(a) linear equations with coefficients in ℚ | | covered | 01-05, 01-06, 21-03 | |
| AF.4(b) quadratic equations with coefficients in ℤ, and in ℚ with solutions in ℝ | ℚ coefficients, ℝ solutions | covered | 15-01, 15-02 (formula, surd roots), 15-03, 15-c02 | |
| AF.4(c) simultaneous linear equations | ℚ coefficients | covered | 10-01, 10-02, 10-c01 | |
| AF.4(d) linear inequalities g(x) < k with solution sets on the number line for x ∈ ℕ, ℤ, ℝ | | partly | 01-09 (solving, reversing the sign, graphing on a number line over ℝ) | 01-09 never graphs the same solution for x ∈ ℕ or x ∈ ℤ (dots instead of a ray), which Paper 1 asks for directly. |
| AF.4 strategies: graphic, numeric, algebraic, trial and improvement, working backwards | | partly | algebraic throughout; graphic in 10-02 and 23-03; working backwards in 01-05 and 19-09 | "Trial and improvement" is not shown as a method anywhere. |
| AF.5 generate quadratic equations given integer roots | HL | covered | 15-04, 15-c04 | |
| AF.6 change the subject of a formula | HL | covered | 21-05, 21-06, 21-c01, 21-c03 | |
| AF.7(a) concept of a function | | covered | 19-01, 19-02, 19-c02 | |
| AF.7(b) represent functions graphically, diagrammatically, in words, algebraically; domain, range, co-domain, f(x) =, f : x ↦, y = ; graphs beyond linear and quadratic | exponential graphs | covered | 19-01, 19-02 (mapping diagram, domain, codomain, range, ↦), 19-09, 23-01, 23-02, 23-06 | |
| AF.7(c) graphical solutions of f(x) = g(x) | | covered | 23-03, 23-04, 19-07, 10-02 | |
| AF.7(c) approximate solution sets of f(x) < g(x) | HL | covered | 23-04 step 4 and quick check 1, 23-m5 (added in the chapter 17 to 24 review) | |
| AF.7(d) shape of a graph and the story of a phenomenon, maximum and minimum points | | covered | 20-03, 20-c04, 23-05, 23-c01 | |

## Statistics and probability strand

| Outcome | HL element | Status | Where taught | Note |
| --- | --- | --- | --- | --- |
| SP.1(a) sample spaces, tree diagrams for successive events, two-way tables | | covered | 09-01, 09-04 (table and tree), 09-07, 09-c04 | |
| SP.1(b) fundamental principle of counting | | covered | 09-01, 9-m0 | |
| SP.2(a) probability as a measure on the 0 to 1 scale | | covered | 09-02 | |
| SP.2(b) equally likely outcomes | | covered | 09-03, 09-06 | |
| SP.2(c) relative frequency as an estimate; more trials give better estimates | | covered | 09-05 | |
| SP.3(a) generate a statistical question | | covered | 05-01, 05-c01 | |
| SP.3(b) plan and source unbiased representative data; frequency table | | covered | 05-02, 05-03, 05-c03 | |
| SP.3(c) classify data | | covered | 05-01 | |
| SP.3(d) pie charts, bar charts, line plots, histograms (equal intervals), ordered stem and leaf plots | | covered | 13-01, 13-02, 13-03, 13-04, 13-c02 | 13-03 also treats unequal widths and density, flagged in its own goal as an extension beyond the specification. |
| SP.3(d) ordered back-to-back stem and leaf plots | HL | covered | 13-04, 13-c03 | |
| SP.3(e) mean, median, mode; range | | covered | 07-01, 07-02, 07-03, 07-05 | |
| SP.3(e) mean of a grouped frequency distribution | HL | covered | 07-04, 07-c02, 7-m5 | |
| SP.3(f) effectiveness of graphical displays | | covered | 13-05, 07-c04 | |
| SP.3(g) misconceptions and misuses of statistics | | covered | 13-05, 05-03 | |
| SP.3(h) assumptions and limitations of conclusions from samples | | covered | 05-03, 05-c04, 09-05 | |

## SEC conventions and notation

The Formulae and Tables booklet could not be fetched (see Sources), so the following
is what the guide's notation was checked against instead: the specification's own
notation on pages 15 to 20 and Appendix B.

- Sets: #A and n(A) both appear (03-01), ∖ for set difference, ⊂ for subset, ′ for
  complement, as in N.5(c) and Appendix B. Consistent.
- Functions: f(x) =, f : x ↦ and y = are all used (19-01, 19-02, 19-09, 23-07), as
  AF.7(b) requires; "couple" for an ordered pair (19-04) is standard Irish usage.
- Sequences: Tₙ for the nth term (chapter 18), as in Irish papers.
- Line: y = mx + c, y − y₁ = m(x − x₁) and ax + by + c = 0 match GT.5(c).
- Geometry: [AB] for a segment, |AB| for its length and the theorem numbering of
  Appendix B are used (08-01, 16-03, 16-08). Constructions are numbered as in
  Appendix B section 7.
- Finance: compound interest is written F = P(1 + i)ᵗ beside A = P(1 + r/100)ⁿ
  (04-06, 4-m7), which is the form the chapter review adopted for the booklet.
  UNVERIFIED against the booklet.
- Sphere: the guide writes V = 4πr³/3 (17-03); the booklet form 4/3 πr³ is
  UNVERIFIED (equivalent either way).
- Trigonometry: sin⁻¹ in degree mode (22-03) matches GT.4.
- Statistics: "mid-interval value" for grouped means (07-04) is the SEC wording.
  UNVERIFIED against a marking scheme.
- Narration: the build-time narration reads every one of these notations in words
  (test-spoken.py, 62 cases), including the general form, segment brackets,
  set sizes and ↦.

## Missing or partly covered outcomes, ranked by exam importance

1. N.1(d) prime numbers, prime factorisation, HCF and LCM of whole numbers: missing
   as a lesson. A short lesson in chapter 2 or 14 ("Break a number into primes; read
   HCF and LCM from the factor trees") with two quick checks and four written tasks
   would close it. Paper 1 regularly asks for a prime factorisation or an LCM.
2. GT.5(c) (HL) the general form ax + by + c = 0: partly. Add a step to 11-04 that
   rewrites 2x + 3y − 12 = 0 as y = −(2/3)x + 4 and back, and a written task that
   asks for a line "in the form ax + by + c = 0 with a, b, c ∈ ℤ".
3. N.2(a) converting between fractions, decimals and percentages: partly. A lesson in
   chapter 4 ("Three names for one number") covering 3/8 = 0.375 = 37.5%, recurring
   decimals and percentage of a quantity would close it.
4. AF.4(d) inequality solution sets for x ∈ ℕ, ℤ and ℝ: partly. 01-09 needs one more
   step drawing x > −3 as dots for x ∈ ℤ and as a ray for x ∈ ℝ, and a quick check that
   contrasts them.
5. N.3(a) absolute versus relative comparison: missing. One step in 04-01 or 13-05
   comparing a €50 rise on €200 with a €50 rise on €2,000, plus a written task.
6. N.2(c) value for money: missing. One written task in 04-03 comparing unit prices
   of two pack sizes.
7. N.5(e) (HL) commutativity and associativity of ∩, ∪ and ∖: partly. 03-03 could
   state that ∩ and ∪ are both commutative and associative, with a three-set check,
   and give a counterexample for ∖.
8. GT.2(b) (HL) nets of prisms and cylinders: partly. A net-drawing task for a
   triangular prism in 06-05 and for a cylinder in 17-02.
9. GT.6(b) axes of symmetry of shapes: partly. A step in 24-03 drawing all axes of a
   rectangle, rhombus, equilateral triangle and regular hexagon.
10. GT.3(b) (HL) theorem 11 and corollary 1 by name, and axioms 1 to 5 as a list:
    partly. A reference row in chapter 8 or 16 naming them is enough; the
    specification does not require their proofs.
11. AF.4 trial and improvement as a named strategy: partly. One worked example in
    01-05 or 15-01 would show it.
12. N.1(a) number-line and decomposition models of the operations: partly. Low
    weight at Higher Level; no change proposed.

Everything else in the specification examinable at Higher Level is taught in at
least one lesson with exercises, as listed above.

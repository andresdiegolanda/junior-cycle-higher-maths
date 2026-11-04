"""Authored formula cards. Text remains separate from the typeset formula tree."""
from copy import deepcopy
import re
from spoken import spoken

R = lambda *x: ['row', *x]
F = lambda a, b: ['frac', a, b]
S = lambda x: ['sqrt', x]
V = lambda x: ['var', x]
A, N, G, H, D = 'Algebra', 'Number', 'Graphs & patterns', 'Shape & space', 'Data & chance'
CARDS = []


def add(id, title, group, notation, math, when, letters, question, steps,
        condition, chapter, method, visual='', aliases=''):
    CARDS.append(dict(id=id, title=title, group=group, notation=notation, math=math,
        when=when, letters=[dict(symbol=s, meaning=d) for s, d in letters],
        example=dict(question=question, steps=steps), condition=condition,
        chapter=chapter, method=method, visual=visual,
        aliases=aliases.split('|') if aliases else []))


add('quadratic', 'Solve a quadratic equation', A, 'ax² + bx + c = 0; x = (−b ± √(b² − 4ac))/(2a)',
    [R(V('a'),'x² + ',V('b'),'x + ',V('c'),' = 0'), R('x = ',F(R('−',V('b'),' ± ',S(R(V('b'),'² − 4',V('a'),V('c')))),R('2',V('a'))))],
    'Find the values of x that make a quadratic equal to zero.',
    [('a','Coefficient of x², including its sign.'),('b','Coefficient of x, including its sign.'),('c','Constant term, including its sign.'),('±','Work out both the plus and minus cases.')],
    'Solve 2x² − 5x − 3 = 0.', ['Read a = 2, b = −5, c = −3.', 'Inside the root: (−5)² − 4(2)(−3) = 49.', 'x = (5 ± 7)/4, so x = 3 or x = −½.'],
    'First rearrange to zero. a ≠ 0; real answers require b² − 4ac ≥ 0.', 15, 1, 'quadratic', 'quadratic formula|ax2+bx+c|second degree|roots')
add('square-sum', 'Square of a sum', A, '(a + b)² = a² + 2ab + b²',
    [R('(',V('a'),' + ',V('b'),')² = ',V('a'),'² + 2',V('a'),V('b'),' + ',V('b'),'²')],
    'Expand a whole bracket multiplied by itself.', [('a','First term inside the bracket.'),('b','Second term inside the bracket.'),('2ab','The two cross-products added together.')],
    'Expand (x + 3)².', ['Use a = x and b = 3.', 'x² + 2(x)(3) + 3²', 'Answer: x² + 6x + 9.'],
    'The middle term is essential: (a + b)² is not a² + b².', 1, 1, 'square', 'binomial square|expand brackets|(a+b)2')
add('square-difference', 'Square of a difference', A, '(a − b)² = a² − 2ab + b²', ['(a − b)² = a² − 2ab + b²'],
    'Expand the square of a subtraction.', [('a','First term in the bracket.'),('b','Term being subtracted.'),('−2ab','The two negative cross-products added together.')],
    'Expand (2x − 3)².', ['Use a = 2x and b = 3.', '(2x)² − 2(2x)(3) + 3²', 'Answer: 4x² − 12x + 9.'],
    'The last term is positive because (−b)(−b) = b².', 1, 1, '', 'binomial square|expand subtraction|(a-b)2')
add('difference-squares', 'Difference of two squares', A, 'a² − b² = (a − b)(a + b)', ['a² − b² = (a − b)(a + b)'],
    'Factorise one square minus another.', [('a','Square root of the first squared term.'),('b','Square root of the second squared term.')],
    'Factorise 9x² − 25.', ['9x² = (3x)² and 25 = 5².', 'Use a = 3x and b = 5.', 'Answer: (3x − 5)(3x + 5).'],
    'This pattern uses subtraction between two squares.', 2, 2, '', 'factorisation|factorization|two squares')
add('distribute', 'Multiply into a bracket', A, 'a(b + c) = ab + ac', ['a(b + c) = ab + ac'],
    'Multiply every term inside a bracket by the outside factor.', [('a','Outside multiplier, including its sign.'),('b, c','Terms inside the bracket.')],
    'Expand −3(2x − 4).', ['−3 × 2x = −6x.', '−3 × −4 = +12.', 'Answer: −6x + 12.'],
    'Every term is multiplied. Keep signs with their terms.', 1, 1, '', 'distributive|expand|multiplying polynomials')
add('two-brackets', 'Multiply two brackets', A, '(a + b)(c + d) = ac + ad + bc + bd', ['(a + b)(c + d)', '= ac + ad + bc + bd'],
    'Multiply each term in the first bracket by each term in the second.', [('a, b','Terms in the first bracket.'),('c, d','Terms in the second bracket.')],
    'Expand (2x + 3)(x + 4).', ['Four products: 2x², 8x, 3x and 12.', 'Collect: 8x + 3x = 11x.', 'Answer: 2x² + 11x + 12.'],
    'Collect like terms after making every product.', 1, 1, '', 'FOIL|polynomial multiplication|expand brackets')
add('like-terms', 'Collect like terms', A, 'axⁿ + bxⁿ = (a + b)xⁿ', ['axⁿ + bxⁿ = (a + b)xⁿ'],
    'Combine terms with exactly the same variable part.', [('a, b','Numerical coefficients.'),('xⁿ','The variable and power that must match.')],
    'Simplify 3x² + 5x − x² + 2x.', ['For x²: 3 − 1 = 2.', 'For x: 5 + 2 = 7.', 'Answer: 2x² + 7x.'],
    'x and x² have different variable parts.', 1, 0, '', 'simplify|coefficients')
add('factor-quadratic', 'Factorise a quadratic', A, 'ax² + bx + c; m + n = b; mn = ac', ['ax² + bx + c', 'm + n = b     mn = ac'],
    'Find two numbers to split the middle term, then factorise by grouping.', [('a, b, c','Signed coefficients of the quadratic.'),('m, n','Numbers with sum b and product ac.')],
    'Factorise 2x² + 7x + 3.', ['ac = 6. Choose 6 and 1: their sum is 7.', '2x² + 6x + x + 3 = 2x(x + 3) + (x + 3).', 'Answer: (2x + 1)(x + 3).'],
    'Some quadratics do not factorise over the integers.', 2, 4, '', 'factorisation|factorization|ax2+bx+c|split middle term')
add('zero-product', 'Solve a product equal to zero', A, 'AB = 0 ⇒ A = 0 or B = 0', ['AB = 0', 'A = 0  or  B = 0'],
    'Find roots after an equation has been factorised.', [('A, B','Complete factors, which may be brackets.')],
    'Solve (x − 2)(x + 5) = 0.', ['Set x − 2 = 0 or x + 5 = 0.', 'Solve each equation.', 'Answer: x = 2 or x = −5.'],
    'The product must equal zero before splitting it into cases.', 15, 0, '', 'roots|zero product rule')
add('add-fractions', 'Add or subtract fractions', A, 'a/b + c/d = (ad + bc)/(bd)', [R(F('a','b'),' + ',F('c','d'),' = ',F('ad + bc','bd'))],
    'Rewrite both fractions with a common denominator.', [('a, c','Numerators.'),('b, d','Non-zero denominators.')],
    'Add 1/2 + 1/3.', ['Use denominator 6.', '1/2 = 3/6 and 1/3 = 2/6.', 'Answer: 5/6.'],
    'For subtraction, subtract the adjusted numerators. A smaller common denominator may be available.', 21, 0, 'fractions', 'algebraic fractions|common denominator')
add('divide-fractions', 'Divide fractions', A, '(a/b) ÷ (c/d) = (a/b) × (d/c)', [R(F('a','b'),' ÷ ',F('c','d'),' = ',F('a','b'),' × ',F('d','c'))],
    'Multiply by the reciprocal of the divisor.', [('a/b','The fraction being divided.'),('c/d','The divisor: turn this fraction upside down.')],
    'Calculate 3/4 ÷ 2/5.', ['Keep 3/4 and invert 2/5 to get 5/2.', 'Multiply: (3 × 5)/(4 × 2).', 'Answer: 15/8.'],
    'b, c and d must be non-zero. Keep the original restrictions.', 21, 2, '', 'reciprocal|algebraic fraction division')
add('cancel-factors', 'Cancel common factors', A, 'AC/(BC) = A/B', [R(F('AC','BC'),' = ',F('A','B'))],
    'Divide the whole numerator and denominator by the same non-zero factor.', [('C','Common factor of the whole numerator and denominator.'),('A, B','Factors that remain.')],
    'Simplify (x² − 9)/(x − 3).', ['Factorise the top: (x − 3)(x + 3).', 'Cancel the factor x − 3.', 'Answer: x + 3, with x ≠ 3.'],
    'B ≠ 0 and C ≠ 0. Cancel factors, never individual terms in a sum.', 2, 5, '', 'simplify fractions|cancellation|restrictions')
add('simultaneous', 'Eliminate an unknown', A, 'ax + by = p; cx + dy = q', ['ax + by = p', 'cx + dy = q'],
    'Solve two equations by making one variable cancel.', [('x, y','The two unknowns.'),('a, b, c, d','Coefficients of the unknowns.'),('p, q','Values on the right-hand sides.')],
    'Solve x + y = 7 and x − y = 1.', ['Add: 2x = 8, so x = 4.', 'Substitute: 4 + y = 7.', 'Answer: x = 4, y = 3.'],
    'Multiply the entire equation when matching coefficients. Check both original equations.', 10, 1, '', 'simultaneous equations|elimination|substitution')

add('percentage','Find a percentage',N,'percentage = (part/whole) × 100%', [R('percentage = ',F('part','whole'),' × 100%')],
    'Express a part as a percentage of its whole.', [('part','Amount you are comparing.'),('whole','Reference total, not zero.')],
    'What percentage of 80 is 20?', ['20/80 = 0.25.', '0.25 × 100% = 25%.'],
    'The choice of whole changes the answer.',4,0,'percentage','percent|percentage of')
add('percentage-change','Increase or decrease a value',N,'new = original × (1 ± r/100)', [R('new = original × (1 ± ',F('r','100'),')')],
    'Apply a percentage increase or reduction.', [('r','Percentage rate, such as 20 for 20%.'),('+ / −','Use + for an increase and − for a decrease.')],
    'Reduce €80 by 20%.', ['Multiplier = 1 − 20/100 = 0.8.', '80 × 0.8 = €64.'],
    'Successive changes use successive multipliers; do not simply add the rates.',4,0,'','discount|VAT|increase|decrease|multiplier')
add('reverse-percentage','Find the original amount',N,'original = final/(1 ± r/100)', [R('original = ',F('final',R('1 ± ',F('r','100'))))],
    'Work backwards after a percentage change.', [('final','Amount after the change.'),('r','Percentage change applied to the original.')],
    'A price including 20% VAT is €96. Find the price before VAT.', ['The multiplier was 1.2.', 'Original = 96 ÷ 1.2 = €80.'],
    'Divide by the multiplier that was used.',4,0,'','before VAT|original price|reverse percentages')
add('profit','Profit, markup and margin',N,'profit = selling price − cost; markup = profit/cost × 100%; margin = profit/selling price × 100%',
    ['profit = selling price − cost',R('markup = ',F('profit','cost'),' × 100%'),R('margin = ',F('profit','selling price'),' × 100%')],
    'Calculate profit and choose the correct percentage base.', [('cost','Amount paid to obtain the item.'),('selling price','Amount received from selling it.'),('profit','Selling price minus cost.')],
    'An item costs €40 and sells for €50.', ['Profit = €10.', 'Markup = (10/40) × 100% = 25%.', 'Margin = (10/50) × 100% = 20%.'],
    'Markup uses cost; margin uses selling price.',4,1,'','profit percentage|profit margin|markup')
add('compound','Repeated growth or depreciation',N,'F = P(1 + r/100)ⁿ; F = P(1 − r/100)ⁿ',
    [R('F = P(1 + ',F('r','100'),')ⁿ'),R('F = P(1 − ',F('r','100'),')ⁿ')],
    'Apply the same percentage change over several equal periods.', [('P','Starting amount.'),('F','Final amount.'),('r','Percentage rate per period.'),('n','Number of periods.')],
    'Grow €1,000 by 5% per year for 2 years.', ['Multiplier per year: 1.05.', 'F = 1000 × 1.05² = €1,102.50.'],
    'Changing rates need separate multipliers.',4,7,'','compound interest|depreciation|exponential growth')
add('ratio','Share a total in a ratio',N,'one part = T/(a+b); shares = a × one part, b × one part',
    [R('one part = ',F('T','a + b')),'shares = a × one part, b × one part'],
    'Split a total into the requested numbers of equal parts.', [('T','Total being shared.'),('a : b','Ratio of the two shares.')],
    'Share €60 in the ratio 2 : 3.', ['There are 2 + 3 = 5 parts.', 'One part = 60/5 = €12.', 'Shares: €24 and €36.'],
    'Use the sum of all ratio parts.',12,0,'ratio','ratios|proportional sample|share')
add('speed','Speed, distance and time',N,'v = d/t; d = vt; t = d/v', [R('v = ',F('d','t')),'d = vt',R('t = ',F('d','v'))],
    'Find the missing quantity using the other two.', [('v','Speed, such as km/h.'),('d','Distance, such as km.'),('t','Time in matching units, such as hours.')],
    'Travel 150 km in 2.5 h. Find average speed.', ['Use total distance ÷ total time.', 'v = 150/2.5 = 60 km/h.'],
    'Convert units first. Average speed uses the whole journey, including stops.',12,5,'','average speed|distance time|velocity')
add('proportion','Direct and inverse proportion',N,'direct: y = kx; inverse: y = k/x', ['Direct: y = kx',R('Inverse: y = ',F('k','x'))],
    'Model a constant ratio or a constant product.', [('x, y','Related quantities.'),('k','Constant of proportion.')],
    'y is directly proportional to x; y = 12 when x = 3. Find y when x = 5.', ['k = y/x = 12/3 = 4.', 'The rule is y = 4x.', 'When x = 5, y = 20.'],
    'Direct proportion has constant y/x; inverse proportion has constant xy and x ≠ 0.',12,2,'','direct proportion|inverse proportion')
add('indices','Multiply and divide powers',N,'aᵐ × aⁿ = aᵐ⁺ⁿ; aᵐ/aⁿ = aᵐ⁻ⁿ', ['aᵐ × aⁿ = aᵐ⁺ⁿ',R(F('aᵐ','aⁿ'),' = aᵐ⁻ⁿ')],
    'Combine powers with the same base.', [('a','Common base.'),('m, n','Exponents or powers.')],
    'Simplify x³ × x⁴ ÷ x².', ['Add for multiplication: 3 + 4 = 7.', 'Subtract for division: 7 − 2 = 5.', 'Answer: x⁵, with x ≠ 0.'],
    'Bases must match. The denominator must be non-zero.',14,0,'','index laws|indices|exponents|powers')
add('power-power','Raise a power to a power',N,'(aᵐ)ⁿ = aᵐⁿ; (ab)ⁿ = aⁿbⁿ', ['(aᵐ)ⁿ = aᵐⁿ','(ab)ⁿ = aⁿbⁿ'],
    'Multiply exponents when raising a power, and power every factor in a product.', [('a, b','Factors or bases.'),('m, n','Powers; use integer powers here.')],
    'Simplify (2x³)².', ['2² = 4.', 'On x, multiply powers: 3 × 2 = 6.', 'Answer: 4x⁶.'],
    'A power distributes over multiplication, not addition.',14,0,'','power of a power|exponents')
add('negative-indices','Zero and negative powers',N,'a⁰ = 1; a⁻ⁿ = 1/aⁿ', ['a⁰ = 1',R('a⁻ⁿ = ',F('1','aⁿ'))],
    'Rewrite a zero power or a negative power.', [('a','Non-zero base.'),('n','Positive integer in the reciprocal rule.')],
    'Calculate 2⁻³.', ['2⁻³ = 1/2³.', 'Answer: 1/8.'],
    'A negative exponent means reciprocal, not a negative answer. a ≠ 0.',14,1,'','negative powers|zero power')
add('surds','Simplify a square root',N,'√(ab) = √a × √b', [R(S('ab'),' = ',S('a'),' × ',S('b'))],
    'Take a perfect-square factor outside a square root.', [('a, b','Non-negative factors; choose one to be a perfect square.')],
    'Simplify √72.', ['72 = 36 × 2.', '√72 = √36 × √2 = 6√2.'],
    'This rule does not work across addition: √(a + b) is not generally √a + √b.',14,3,'','surds|square root|radicals')
add('standard-form','Write a number in standard form',N,'N = a × 10ⁿ; 1 ≤ |a| < 10', ['N = a × 10ⁿ','1 ≤ |a| < 10'],
    'Write a very large or very small non-zero number compactly.', [('a','Number with one non-zero digit before the decimal point.'),('n','Integer power of ten.'),('N','Original number.')],
    'Write 0.00045 in standard form.', ['Move the decimal to make 4.5.', '4.5 × 10⁻⁴ gives the original value.'],
    'Check the sign of the exponent by reconstructing the original value.',14,5,'','scientific notation|standard form')

add('rectangle','Rectangle: perimeter and area',H,'P = 2l + 2w; A = lw', ['P = 2l + 2w','A = lw'],
    'Find the boundary length or the space inside a rectangle.', [('l, w','Length and width in the same unit.'),('P','Perimeter in length units.'),('A','Area in square units.')],
    'A rectangle is 8 cm by 3 cm.', ['P = 2(8) + 2(3) = 22 cm.', 'A = 8 × 3 = 24 cm².'],
    'Perimeter and area use different units.',6,0,'rectangle','rectangle area|rectangle perimeter')
add('triangle-area','Triangle and parallelogram area',H,'triangle A = bh/2; parallelogram A = bh', [R('Triangle: A = ',F('bh','2')),'Parallelogram: A = bh'],
    'Use a base and its perpendicular height to find area.', [('b','Chosen base.'),('h','Height perpendicular to that base.'),('A','Area in square units.')],
    'A triangle has base 10 cm and perpendicular height 6 cm.', ['A = (10 × 6)/2.', 'Answer: 30 cm².'],
    'A sloping side is not usually the perpendicular height.',6,1,'triangle','area of triangle|parallelogram|base height')
add('trapezium','Area of a trapezium',H,'A = (a + b)h/2', [R('A = ',F('(a + b)h','2'))],
    'Average the parallel sides, then multiply by their perpendicular distance.', [('a, b','Lengths of the parallel sides.'),('h','Perpendicular distance between them.')],
    'Parallel sides are 5 cm and 9 cm; height is 4 cm.', ['A = ((5 + 9) × 4)/2.', 'Answer: 28 cm².'],
    'The two sides a and b must be parallel.',6,0,'trapezium','trapezoid|area trapezium')
add('circle','Circle: circumference and area',H,'C = 2πr = πd; A = πr²', ['C = 2πr = πd','A = πr²'],
    'Find the distance around a circle or its enclosed area.', [('r','Radius: centre to edge.'),('d','Diameter: twice the radius.'),('C, A','Circumference and area.'),('π','Pi; use the calculator’s π key.')],
    'A circle has radius 3 cm.', ['C = 2π(3) = 6π cm.', 'A = π(3²) = 9π cm².'],
    'Halve a diameter to find r. Keep π exact unless asked to round.',6,2,'circle','circle area|circumference|diameter|radius')
add('sector','Sector area and arc length',H,'A = θ/360 × πr²; L = θ/360 × 2πr', [R('A = ',F('θ','360'),' × πr²'),R('L = ',F('θ','360'),' × 2πr')],
    'Take a fraction of the full circle’s area or circumference.', [('θ','Central angle in degrees.'),('r','Radius.'),('L','Arc length along the curved edge.')],
    'Use r = 6 cm and θ = 90°.', ['Fraction of a circle: 90/360 = 1/4.', 'Area = (1/4)π(6²) = 9π cm².', 'Arc length = (1/4)2π(6) = 3π cm.'],
    'Sector perimeter also includes two radii: L + 2r.',6,2,'sector','arc length|sector area|semicircle')
add('prism','Volume of a prism or cuboid',H,'V = Aℓ; cuboid V = lwh', ['Prism: V = Aℓ','Cuboid: V = lwh'],
    'Multiply the constant cross-sectional area by the length.', [('A','Area of the constant cross-section.'),('ℓ','Length perpendicular to the end face.'),('l, w, h','Cuboid length, width and height.')],
    'A prism has cross-sectional area 12 cm² and length 5 cm.', ['V = 12 × 5.', 'Answer: 60 cm³.'],
    'Use matching units. Volume uses cubic units.',6,5,'prism','prism volume|cuboid volume')
add('cuboid-surface','Surface area of a cuboid',H,'S = 2(lw + lh + wh)', ['S = 2(lw + lh + wh)'],
    'Add the areas of all six faces of a closed cuboid.', [('l, w, h','Length, width and height.'),('S','Total surface area.')],
    'A closed box is 4 cm by 3 cm by 2 cm.', ['S = 2(4×3 + 4×2 + 3×2).', 'S = 2(12 + 8 + 6) = 52 cm².'],
    'Omit missing faces of an open box and hidden faces of joined solids.',6,3,'','surface area|cuboid net|box')
add('cylinder','Cylinder: volume and surface area',H,'V = πr²h; curved A = 2πrh; closed S = 2πrh + 2πr²', ['V = πr²h','Curved area = 2πrh','Closed surface = 2πrh + 2πr²'],
    'Choose volume, curved area or the total area of a closed cylinder.', [('r','Radius of the circular base.'),('h','Perpendicular height.'),('V','Volume inside the cylinder.')],
    'A cylinder has r = 2 cm and h = 5 cm.', ['V = π(2²)(5) = 20π cm³.', 'Curved area = 2π(2)(5) = 20π cm².', 'Closed total = 20π + 8π = 28π cm².'],
    'Count the circular ends actually present.',17,1,'cylinder','cylinder volume|cylinder surface area')
add('sphere','Sphere and hemisphere',H,'sphere V = 4πr³/3; sphere A = 4πr²; hemisphere V = 2πr³/3', [R('Sphere V = ',F('4πr³','3')),'Sphere A = 4πr²',R('Hemisphere V = ',F('2πr³','3'))],
    'Find sphere volume or area, or halve its volume for a hemisphere.', [('r','Radius, not diameter.'),('V','Volume in cubic units.'),('A','Area in square units.')],
    'A sphere has radius 3 cm.', ['V = (4/3)π(3³) = 36π cm³.', 'A = 4π(3²) = 36π cm².'],
    'Hemisphere curved area is 2πr². Including the flat base gives 3πr².',17,3,'sphere','sphere volume|hemisphere|surface area')
add('similarity','Scale lengths, areas and volumes',H,'length scale k; area scale k²; volume scale k³', ['length × k','area × k²','volume × k³'],
    'Scale corresponding measurements in similar figures or solids.', [('k','New length divided by corresponding original length.')],
    'All lengths of a similar solid are doubled.', ['Length scale k = 2.', 'Area scale = 2² = 4.', 'Volume scale = 2³ = 8.'],
    'Every length must be scaled by the same factor.',6,8,'similarity','similar triangles|scale factor|enlargement')
add('triangle-angles','Angles in a triangle',H,'α + β + γ = 180°', ['α + β + γ = 180°'],
    'Find a missing interior angle.', [('α, β, γ','Three interior angles of the same triangle.')],
    'Two interior angles are 50° and 60°.', ['Third angle = 180° − 50° − 60°.', 'Answer: 70°.'],
    'An exterior angle equals the sum of the two non-adjacent interior angles.',8,1,'angles','triangle angle sum|exterior angle')
add('pythagoras','Find a side of a right-angled triangle',H,'c² = a² + b²; c = √(a²+b²); a = √(c²−b²)', ['c² = a² + b²',R('c = ',S('a² + b²')),R('a = ',S('c² − b²'))],
    'Find a third side when two sides are known.', [('a, b','The two perpendicular sides.'),('c','Hypotenuse: opposite the right angle and the longest side.')],
    'The perpendicular sides are 3 cm and 4 cm.', ['c² = 3² + 4² = 25.', 'Take the positive square root: c = 5 cm.'],
    'Only for right-angled triangles. Subtract squares to find a shorter side.',22,0,'pythagoras','Pythagoras theorem|hypotenuse|diagonal|missing side')
add('trig','Choose sine, cosine or tangent',H,'sin θ = O/H; cos θ = A/H; tan θ = O/A', [R('sin θ = ',F('O','H')),R('cos θ = ',F('A','H')),R('tan θ = ',F('O','A'))],
    'Connect an acute angle with sides of a right-angled triangle.', [('O','Side opposite the chosen angle θ.'),('A','Adjacent side beside θ, excluding the hypotenuse.'),('H','Hypotenuse, opposite the right angle.'),('θ','Chosen angle, in degrees here.')],
    'θ = 30° and H = 10 cm. Find O.', ['sin 30° = O/10.', 'O = 10 sin 30° = 5 cm.'],
    'Label sides relative to θ. Use degree mode.',22,2,'trig','SOH CAH TOA|SOHCAHTOA|sine|cosine|tangent|trigonometry')
add('inverse-trig','Find an angle from two sides',H,'θ = sin⁻¹(O/H) or cos⁻¹(A/H) or tan⁻¹(O/A)', [R('θ = sin⁻¹(',F('O','H'),')'),R('θ = cos⁻¹(',F('A','H'),')'),R('θ = tan⁻¹(',F('O','A'),')')],
    'Choose the inverse ratio involving the two known sides.', [('O, A, H','Opposite, adjacent and hypotenuse relative to θ.'),('sin⁻¹, cos⁻¹, tan⁻¹','Inverse functions that return an angle.')],
    'O = 3 cm and A = 4 cm. Find θ.', ['tan θ = 3/4.', 'θ = tan⁻¹(0.75) ≈ 36.9°.'],
    'Use a right-angled triangle and degree mode. Inverse is not reciprocal.',22,3,'trig','inverse sine|inverse cosine|inverse tangent|find angle')
add('circle-angles','Angles in a circle',H,'angle at centre = 2 × angle at circumference; cyclic opposite angles sum to 180°', ['Centre angle = 2 × circumference angle','Cyclic opposite angles sum to 180°'],
    'Use circle-angle relationships for the same arc.', [('centre angle','Angle with its vertex at the centre.'),('circumference angle','Angle with its vertex on the circle.'),('cyclic quadrilateral','Four vertices all lie on a circle.')],
    'A circumference angle standing on an arc is 35°.', ['The centre angle on the same arc is 2 × 35°.', 'Answer: 70°.'],
    'The two angles must stand on the same arc. A semicircle gives a right angle at the circumference.',16,4,'','circle theorem|cyclic quadrilateral|angle at centre')

add('slope','Gradient of a line',G,'m = (y₂ − y₁)/(x₂ − x₁)', [R('m = ',F('y₂ − y₁','x₂ − x₁'))],
    'Measure how much y changes for each unit increase in x.', [('m','Gradient: vertical change divided by horizontal change.'),('(x₁, y₁), (x₂, y₂)','Two different points on the line.')],
    'Find the gradient through (1, 2) and (4, 8).', ['m = (8 − 2)/(4 − 1).', 'm = 6/3 = 2.'],
    'Keep the same point order in both subtractions. A vertical line has undefined gradient.',11,2,'slope','gradient|slope|rise over run')
add('line','Equation of a straight line',G,'y = mx + c; y − y₁ = m(x − x₁)', ['y = mx + c','y − y₁ = m(x − x₁)'],
    'Write a line equation from its gradient and a known point.', [('m','Gradient.'),('c','y-intercept: the value of y when x = 0.'),('(x₁, y₁)','A known point on the line.')],
    'Gradient 2; the line passes through (3, 7).', ['7 = 2(3) + c, so c = 1.', 'Equation: y = 2x + 1.'],
    'A vertical line has equation x = constant; it cannot be written as y = mx + c.',11,3,'slope','linear equation|mx+c|straight line')
add('midpoint','Midpoint of a segment',G,'M = ((x₁+x₂)/2, (y₁+y₂)/2)', [R('M = (',F('x₁ + x₂','2'),', ',F('y₁ + y₂','2'),')')],
    'Find the point halfway between two endpoints.', [('M','Midpoint.'),('(x₁, y₁), (x₂, y₂)','The two endpoints.')],
    'Find the midpoint of (2, 1) and (6, 7).', ['Average the x-values: (2 + 6)/2 = 4.', 'Average the y-values: (1 + 7)/2 = 4.', 'M = (4, 4).'],
    'Average x with x and y with y.',11,1,'','midpoint|halfway|coordinates')
add('distance','Distance between two points',G,'d = √((x₂−x₁)² + (y₂−y₁)²)', [R('d = ',S('(x₂ − x₁)² + (y₂ − y₁)²'))],
    'Find a straight-line length on a coordinate grid.', [('d','Distance, always non-negative.'),('(x₁, y₁), (x₂, y₂)','The two points.')],
    'Find the distance from (1, 2) to (4, 6).', ['d = √((4 − 1)² + (6 − 2)²).', 'd = √(9 + 16) = 5 units.'],
    'Square each difference before adding. This is Pythagoras on a grid.',11,0,'','distance formula|length of segment')
add('quadratic-vertex','Turning point of a parabola',G,'y = ax² + bx + c; h = −b/(2a); k = f(h); y = a(x−h)² + k', ['y = ax² + bx + c',R('h = ',F('−b','2a')),'k = f(h)','y = a(x − h)² + k'],
    'Locate a quadratic graph’s minimum or maximum.', [('(h, k)','Coordinates of the turning point.'),('a, b, c','Coefficients in the expanded quadratic.'),('f(h)','Substitute h for x to find the height.')],
    'Find the turning point of y = x² − 4x + 3.', ['h = −(−4)/(2×1) = 2.', 'k = 2² − 4(2) + 3 = −1.', 'Turning point: (2, −1), a minimum.'],
    'a ≠ 0. If a > 0 the graph has a minimum; if a < 0 it has a maximum.',23,2,'quadratic','vertex|turning point|axis of symmetry|parabola')
add('intercepts','Where a graph meets the axes',G,'x-intercepts: f(x) = 0; y-intercept: (0, f(0))', ['x-intercepts: solve f(x) = 0','y-intercept: (0, f(0))'],
    'Find crossings or touching points on the coordinate axes.', [('x-intercept','A point (x, 0): the output is zero.'),('y-intercept','A point (0, y): the input is zero.')],
    'Find the intercepts of y = (x − 2)(x + 3).', ['Set y = 0: x = 2 or x = −3.', 'x-intercepts: (2, 0) and (−3, 0).', 'Set x = 0: y = −6. y-intercept: (0, −6).'],
    'Give points as coordinates when asked. A graph may have no x-intercepts.',23,3,'quadratic','roots|zeros|x intercept|y intercept')
add('function','Substitute into a function',G,'f(x) = R(x); f(t) = R(t)', ['f(x) = R(x)','f(t) = R(t)'],
    'Replace every x in the rule with the given input.', [('f','Name of the function.'),('R(x)','The expression that gives the output.'),('t','The input to substitute, using brackets.')],
    'If f(x) = x² − 1, find f(−3).', ['f(−3) = (−3)² − 1.', 'f(−3) = 9 − 1 = 8.'],
    'f(x) means the output at x; it does not mean f multiplied by x.',19,3,'machine','function notation|substitution|input output|fx')
add('arithmetic-sequence','A sequence with a constant difference',G,'Tₙ = a + (n−1)d', ['Tₙ = a + (n − 1)d'],
    'Find a term without listing every term before it.', [('Tₙ','Term in position n, starting at n = 1.'),('a','First term.'),('d','Common difference: next term minus previous term.')],
    'Find the 10th term of 4, 7, 10, 13, …', ['a = 4 and d = 3.', 'T₁₀ = 4 + (10 − 1)3 = 31.'],
    'Check that the difference stays constant. A sequence starting at stage 0 needs its index adjusted.',18,3,'sequence','arithmetic sequence|nth term|linear pattern')
add('geometric-sequence','A sequence with a constant multiplier',G,'Tₙ = arⁿ⁻¹', ['Tₙ = arⁿ⁻¹'],
    'Find a term when each term is multiplied by the same number.', [('a','First term, at n = 1.'),('r','Common ratio: next term divided by previous term.'),('n','Term position.')],
    'Find the 5th term of 3, 6, 12, 24, …', ['a = 3 and r = 2.', 'T₅ = 3 × 2⁴ = 48.'],
    'Check the multiplier is constant. Do not confuse a ratio with a difference.',18,7,'','geometric sequence|exponential pattern|common ratio')
add('quadratic-sequence','A sequence with constant second differences',G,'Tₙ = an² + bn + c; second difference = 2a', ['Tₙ = an² + bn + c','second difference = 2a'],
    'Find a quadratic pattern from its terms and differences.', [('a','Half the constant second difference.'),('b, c','Find these by substituting known positions and terms.'),('n','Term position.')],
    'Find the rule for 2, 6, 12, 20, …, starting at n = 1.', ['First differences: 4, 6, 8. Second differences: 2, 2.', 'a = 1. Then b + c = 1 and 2b + c = 2.', 'b = 1, c = 0. Rule: Tₙ = n² + n.'],
    'Constant non-zero second differences identify a quadratic sequence.',18,5,'sequence','quadratic sequence|second differences')
add('translation','Translate a point',G,'(x, y) → (x+a, y+b)', ['(x, y) → (x + a, y + b)'],
    'Slide every point by the same horizontal and vertical amounts.', [('a','Horizontal change: right positive, left negative.'),('b','Vertical change: up positive, down negative.')],
    'Move (2, −1) left 3 and up 4.', ['a = −3 and b = 4.', '(2 − 3, −1 + 4) = (−1, 3).'],
    'A translation preserves lengths, angles and orientation.',24,0,'','translation|vector|transformation')
add('reflection','Reflect a point in a familiar line',G,'x-axis: (x,−y); y-axis: (−x,y); y=x: (y,x)', ['x-axis: (x, y) → (x, −y)','y-axis: (x, y) → (−x, y)','y = x: (x, y) → (y, x)'],
    'Find an image in an axis or in the line y = x.', [('(x, y)','The original point.'),('image','The reflected point, the same perpendicular distance from the mirror line.')],
    'Reflect (3, −2) in the y-axis.', ['Change the sign of x; keep y.', 'Image: (−3, −2).'],
    'For other mirror lines, use equal perpendicular distances on both sides.',24,1,'','reflection|mirror line|transformation')

add('sets','Count a union without double-counting',D,'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', ['n(A ∪ B) = n(A) + n(B) − n(A ∩ B)'],
    'Count items in A or B, including those in both.', [('n(A)','Number of elements in A.'),('A ∪ B','Union: in either or both sets.'),('A ∩ B','Intersection: in both sets.')],
    '18 play rugby, 12 swim and 5 do both. How many do at least one?', ['18 + 12 counts the 5 in both twice.', 'n(A ∪ B) = 18 + 12 − 5 = 25.'],
    'Subtract the overlap once. “Neither” is the total outside the union.',3,5,'sets','union|intersection|Venn diagram|sets')
add('mean','Mean and total',D,'mean = sum of values / number of values; total = mean × number', [R('mean = ',F('sum of values','number of values')),'total = mean × number'],
    'Find the average, or recover a total from an average.', [('sum','Add all values, including repeats.'),('number','Count every value.')],
    'Find the mean of 2, 4 and 6.', ['Sum = 2 + 4 + 6 = 12.', 'Mean = 12/3 = 4.'],
    'The mean uses every value and can be affected by an extreme value.',7,1,'','mean|average|total')
add('weighted-mean','Mean from a frequency table',D,'mean = Σfx / Σf', [R('mean = ',F('Σfx','Σf'))],
    'Use frequencies instead of writing out repeated values.', [('x','Value, or class midpoint for grouped data.'),('f','Frequency: how often the value occurs.'),('Σ','Sum: add the entries in that column.')],
    'Value 2 occurs 3 times; value 5 occurs twice.', ['Σfx = 2×3 + 5×2 = 16; Σf = 3 + 2 = 5.', 'Mean = 16/5 = 3.2.'],
    'With grouped data, using class midpoints gives an estimate.',7,4,'','frequency mean|weighted mean|grouped mean|sigma')
add('median','Middle value of ordered data',D,'odd n: position (n+1)/2; even n: average positions n/2 and n/2+1', [R('Odd n: position ',F('n + 1','2')),'Even n: average the two middle values'],
    'Find a centre that is less affected by extreme values.', [('n','Number of data values.'),('middle positions','For even n: positions n/2 and n/2 + 1.')],
    'Find the median of 9, 2, 7, 4.', ['Sort first: 2, 4, 7, 9.', 'Average the middle values: (4 + 7)/2 = 5.5.'],
    'The position tells you where to look; it is not the median value.',7,0,'','median|middle value|ordered data')
add('range','Range of a data set',D,'range = largest − smallest', ['range = largest − smallest'],
    'Describe the spread from the lowest to the highest value.', [('largest','Maximum value.'),('smallest','Minimum value.')],
    'Find the range of −2, 1, 4, 7.', ['Range = 7 − (−2).', 'Answer: 9.'],
    'Keep the sign of a negative minimum inside brackets.',7,6,'','range|spread|maximum minimum')
add('pie','Angle of a pie-chart sector',D,'sector angle = frequency / total × 360°', [R('sector angle = ',F('frequency','total'),' × 360°')],
    'Turn a category’s share into an angle in a pie chart.', [('frequency','Number in this category.'),('total','Number in all categories together.')],
    '15 of 60 students choose a category.', ['Angle = (15/60) × 360°.', 'Answer: 90°.'],
    'All sector angles add to 360°. Check rounding before drawing.',13,2,'sector','pie chart|sector angle')
add('probability','Probability with equally likely outcomes',D,'P(E) = favourable outcomes / all possible outcomes', [R('P(E) = ',F('favourable outcomes','all possible outcomes'))],
    'Count the outcomes that satisfy an event.', [('P(E)','Probability of event E.'),('favourable','Outcomes in which the event happens.')],
    'Roll a fair six-sided die. Find P(even).', ['Favourable outcomes: 2, 4, 6. There are 3.', 'P(even) = 3/6 = 1/2.'],
    'This counting formula needs equally likely outcomes. Probabilities lie between 0 and 1.',9,2,'probability','probability|chance|equally likely')
add('complement','Probability that an event does not happen',D,'P(not E) = 1 − P(E)', ['P(not E) = 1 − P(E)'],
    'Find a missing probability from its opposite event.', [('E','An event.'),('not E','Every outcome outside E: its complement.')],
    'The probability of rain is 0.3. Find P(no rain).', ['P(no rain) = 1 − 0.3.', 'Answer: 0.7.'],
    'The event and its complement cover all outcomes without overlap.',9,1,'probability','complement|not probability')
add('independent','Two independent events both happen',D,'P(A and B) = P(A) × P(B)', ['P(A and B) = P(A) × P(B)'],
    'Multiply when the first event does not change the probability of the second.', [('A, B','The two events.'),('independent','Knowing one event happened does not change the other probability.')],
    'Toss a fair coin twice. Find P(two heads).', ['P(H then H) = (1/2) × (1/2).', 'Answer: 1/4.'],
    'Without replacement, probabilities often change. Use the updated probability on each tree branch.',9,4,'','independent events|tree diagram|multiply probabilities')
add('expected','Expected number of successes',D,'expected number = np', ['expected number = np'],
    'Predict how often an event occurs over repeated trials.', [('n','Number of trials.'),('p','Probability of success on each trial.')],
    'Success probability is 0.2 over 150 trials.', ['Expected number = 150 × 0.2.', 'Answer: 30 successes.'],
    'An expected number is a long-run prediction, not a guarantee.',9,6,'','expected frequency|relative frequency|trials')
add('sampling','Allocate a proportional sample',D,'group sample = group population / total population × sample size', [R('group sample = ',F('group population','total population'),' × sample size')],
    'Keep the same group proportions in a stratified sample.', [('group population','Number in the group you are sampling.'),('sample size','Total number to select across all groups.')],
    '80 of 200 students are in a group. Select a total sample of 30.', ['Group sample = (80/200) × 30.', 'Select 12 students from this group.'],
    'Select fairly within each group. Rounded group allocations must still add to the total sample size.',5,5,'','stratified sampling|representative sample|proportional sample')

# Keep longer rules on readable lines even on a narrow phone. The notation
# remains a complete expression for search and narration.
DISPLAY_ROWS = {
    'percentage': ['percentage =', R(F('part','whole'),' × 100%')],
    'percentage-change': [R('multiplier = 1 ± ',F('r','100')), 'new = original × multiplier'],
    'profit': ['profit = selling price − cost', 'markup =', R(F('profit','cost'),' × 100%'),
               'margin =', R(F('profit','selling price'),' × 100%')],
    'distance': ['Δx = x₂ − x₁', 'Δy = y₂ − y₁', R('d = ',S('Δx² + Δy²'))],
    'sets': ['n(A ∪ B) =', 'n(A) + n(B) − n(A ∩ B)'],
    'pie': ['sector angle =', R(F('frequency','total'),' × 360°')],
    'probability': ['P(E) =', F('favourable outcomes','all possible outcomes')],
    'sampling': ['group sample =', F('group population','total population'), '× sample size'],
}
for card in CARDS:
    if card['id'] in DISPLAY_ROWS: card['math'] = DISPLAY_ROWS[card['id']]
    if card['id']=='distance': card['letters'].append(dict(symbol='Δx, Δy',meaning='Changes in x and y. Δ means “change in”.'))

EXTRA_CHAPTERS = {'speed':[20], 'line':[10,19,20,23], 'quadratic':[2,19,23],
    'factor-quadratic':[15], 'function':[23], 'pythagoras':[8,11,24],
    'similarity':[16,24], 'mean':[5,13], 'percentage':[5,9,13], 'ratio':[3,5,16],
    'indices':[18], 'rectangle':[1,21], 'triangle-area':[21], 'circle':[16,21], 'trig':[24]}


def formula_spoken(text):
    # These are authored mathematical contexts, not arbitrary prose. In
    # particular n(A) is cardinality and P(E) is probability, not multiplication.
    text=re.sub(r'\bn\(([^()]+)\)',r'the number of elements in \1',text)
    text=re.sub(r'\bP\(([^()]+)\)',r'the probability of \1',text)
    text=text.replace('Σfx','the sum of frequency times value').replace('Σf','the total frequency')
    text=re.sub(r'\bR\(([^()]+)\)',r'the rule evaluated at \1',text)
    text=re.sub(r'(?<![A-Za-z])(\d*)(ax|bx|ac|ab|ad|bc|bd|cd|mn|np|ar|lwh|lw|lh|wh|AB)(?![A-Za-z])',
                lambda m:' × '.join(([m[1]] if m[1] else [])+list(m[2])),text)
    text=re.sub(r'\ba\s*:\s*b\b','a to b',text)
    return spoken(text)


def load_formula_library(chapters):
    cards = deepcopy(CARDS)
    lookup = {c['id']:c for c in chapters}
    assert len({f['id'] for f in cards}) == len(cards)
    for f in cards:
        c = lookup[f['chapter']]
        f['lesson'] = c['toolkit']['methods'][f['method']]['lessonId']
        f['chapterTitle'] = c['title']
        f['chapters'] = sorted(set([f['chapter'], *EXTRA_CHAPTERS.get(f['id'], [])]))
        f['speech'] = formula_spoken(f['title'] + '. ' + f['when'] + ' Formula. ' + f['notation']
            + '. ' + ' '.join(v['symbol'] + ': ' + v['meaning'] for v in f['letters'])
            + ' Example. ' + f['example']['question'] + ' ' + ' '.join(f['example']['steps'])
            + ' Remember. ' + f['condition'])
    return cards

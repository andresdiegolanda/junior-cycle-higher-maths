"""Spoken forms of symbols, units and notation used across the guide."""
from spoken import spoken

cases = {
    'P(x)=(2x−1)(x²+3x−2)': 'P of x equals open bracket 2 times x minus 1 close bracket times open bracket x squared plus 3 times x minus 2 close bracket',
    'Find P(−2).': 'Find P of minus 2.',
    'Find Q(2) from both forms.': 'Find Q of 2 from both forms.',
    'A = P(1 + r/100)ⁿ': 'A equals P open bracket 1 plus r over 100 close bracket to the power n',
    'P(A ∩ B) = 6/30': 'probability of A intersection B equals 6 over 30',
    'What is P(not win)?': 'What is probability of not win?',
    'P(E) = 1/3': 'probability of E equals 1 over 3',
    'P(HH) = 1/4': 'probability of HH equals 1 over 4',
    'f⁻¹(x)': 'inverse function f of x',
    'f(x) = 2x + 3': 'f of x equals 2 times x plus 3',
    '3(−2)² − 2(−2)': '3 times open bracket minus 2 close bracket squared minus 2 times open bracket minus 2 close bracket',
    'x(x + 3) = 10': 'x times open bracket x plus 3 close bracket equals 10',
    'sin(30°)': 'sine open bracket 30 degrees close bracket',
    'tan 35°': 'tan 35 degrees',
    'aᵐaⁿ = aᵐ⁺ⁿ': 'a to the power m a to the power n equals a to the power m plus n',
    '(aᵐ)ⁿ = aᵐⁿ': 'open bracket a to the power m close bracket to the power n equals a to the power m n',
    'a¹⁄ⁿ is the nth root': 'a to the power 1 over n is the nth root',
    '2⁻³ = 1/8': '2 to the power minus 3 equals 1 over 8',
    'Tₙ = 3n + 1; T₁₀ = 31': 'T subscript n equals 3 times n plus 1; T subscript 10 equals 31',
    'Tₙ₊₁ − Tₙ = d': 'T subscript n plus 1 minus T subscript n equals d',
    'At 8 m/s for 15 s, distance is 120 m.': 'At 8 metres per second for 15 seconds, distance is 120 metres.',
    'A constant 5 km/h for 2 h 30 min': 'A constant 5 kilometres per hour for 2 hours 30 minutes',
    'r = €12/h': 'r equals 12 euros per hour',
    'Area 44 m² and volume 0.24 m³': 'Area 44 square metres and volume 0.24 cubic metres',
    'V = 72 cm³; A = 68 cm²': 'V equals 72 cubic centimetres; A equals 68 square centimetres',
    'P = 2L + 2W': 'P equals 2 times L plus 2 times W',
    '2m + 1 and 2n + 1': '2 times m plus 1 and 2 times n plus 1',
    '6r + 2s = 108': '6 times r plus 2 times s equals 108',
    'Keep both 3s.': 'Keep both 3s.',
    'A:B = 2:3': 'A:B equals 2 to 3',
    'Shares 2 : 3 : 5': 'Shares 2 to 3 to 5',
    'At x = 2: 25': 'At x equals 2: 25',
    '(a) Expand P(x). (b) Find P(−2).': 'Part a. Expand P of x. Part b. Find P of minus 2.',
    'ΔADE ∼ ΔABC': 'triangle ADE is similar to triangle ABC',
    'Δx = 6; Δy = 8': 'change in x equals 6; change in y equals 8',
    'AB ⊥ CD and AB ∥ EF': 'AB is perpendicular to CD and AB is parallel to EF',
    '−3 < x ≤ 4': 'minus 3 is less than x is less than or equal to 4',
    'x ≈ 3.2': 'x is approximately 3.2',
    'New mean 16⅔ ≈ 16.67': 'New mean 16 two thirds is approximately 16.67',
    'AB = AC ⇔ ∠ABC = ∠ACB': 'AB equals AC if and only if angle ABC equals angle ACB',
    '−2(2) + 8 = 4 ✓': 'minus 2 times open bracket 2 close bracket plus 8 equals 4 correct',
    '|AB| = 5': 'length A B equals 5',
    'e.g. 20% of €40': 'for example 20 percent of 40 euros',
    'Several terms occur.. ax + b': 'Several terms occur. ax plus b',
    'm = (y₂ − y₁)/(x₂ − x₁)': 'm equals open bracket y subscript 2 minus y subscript 1 close bracket divided by open bracket x subscript 2 minus x subscript 1 close bracket',
    '{1, 2, 3}': 'the set containing 1, 2, 3 end of set',
    'The vertex (0,0) moves to (3,1).': 'The vertex 0 comma 0 moves to 3 comma 1.',
    'A point (2,3) moves to (−2,−3).': 'A point 2 comma 3 moves to minus 2 comma minus 3.',
    'T = 18 − 0.006h with h in metres.': 'T equals 18 minus 0.006 times h with h in metres.',
    'C=15+6h': 'C equals 15 plus 6 times h',
    '2h² + 3h': '2 times h squared plus 3 times h',
    'sin 30° = 8/h': 'sine 30 degrees equals 8 over h',
    'V/h': 'V over h',
    'At €12/h for 2 h, pay is €24.': 'At 12 euros per hour for 2 hours, pay is 24 euros.',
    'Rates £15/h and $20/h': 'Rates 15 pounds per hour and 20 dollars per hour',
    '2 h 35 min; 31/12 h': '2 hours 35 minutes; 31 over 12 hours',
    'Mixed ratio 12:23; 27:45=3:5.': 'Mixed ratio 12 to 23; 27 to 45 equals 3 to 5.',
    'On a 1:25,000 map': 'On a 1 to 25,000 map',
}
failed = 0
for source, expected in cases.items():
    actual = spoken(source)
    if actual != expected:
        failed += 1
        print(f'FAIL {source!r}\n  expected {expected!r}\n  actual   {actual!r}')
assert not failed, f'{failed} spoken-form checks failed'

clock_cases = {
    'A coach leaves at 22:45 and arrives at 01:20 next day.':
        'A coach leaves at twenty-two forty-five and arrives at zero one twenty next day.',
    '14:47 → 15:00: 13 min': 'fourteen forty-seven gives fifteen hundred hours: 13 minutes',
    '23:40 to 00:15': 'twenty-three forty to zero zero fifteen',
    '00:00': 'midnight',
    '09:05': 'zero nine oh five',
    '12:00': 'twelve hundred hours',
    'At 09:00, then 10:00.': 'At zero nine hundred hours, then ten hundred hours.',
    '05:30 the next day': 'zero five thirty the next day',
    '12:23': 'twelve twenty-three',
    'A 1:25,000 map at 09:00': 'A 1 to 25,000 map at zero nine hundred hours',
    'Ratio 2:3:4': 'Ratio 2 to 3 to 4',
}
for source, expected in clock_cases.items():
    actual = spoken(source, clock_times=True)
    assert actual == expected, (source, expected, actual)
print(f'Spoken-form checks passed: {len(cases)} maths/unit cases and {len(clock_cases)} clock-context cases.')

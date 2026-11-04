"""Turn written mathematics into text that browser voices read sensibly.

The same function narrates lessons, checks, written exercises, methods and the
glossary, so every symbol here has one consistent spoken form.
"""
import re

SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿᵐᵏᵖʳˢᵗᵘᵛˣʸᶻ'
SUPER_PLAIN = '0123456789-+nmkprstuvxyz'
SUB = '₀₁₂₃₄₅₆₇₈₉ₙₖ₊₋'
SUB_PLAIN = '0123456789nk+-'
_super = str.maketrans(SUPER, SUPER_PLAIN)
_sub = str.maketrans(SUB, SUB_PLAIN)

# Units are only read as units directly after a number; "2m + 1" stays algebra.
UNITS = [
    ('km/h', 'kilometres per hour'), ('m/s', 'metres per second'), ('L/s', 'litres per second'),
    ('km²', 'square kilometres'), ('m²', 'square metres'), ('cm²', 'square centimetres'),
    ('mm²', 'square millimetres'), ('m³', 'cubic metres'), ('cm³', 'cubic centimetres'),
    ('mm³', 'cubic millimetres'), ('km', 'kilometres'), ('cm', 'centimetres'), ('mm', 'millimetres'),
    ('kg', 'kilograms'), ('mL', 'millilitres'), ('ml', 'millilitres'), ('mins', 'minutes'),
    ('min', 'minutes'), ('hrs', 'hours'), ('hr', 'hours'), ('h', 'hours'),
]
SYMBOLS = [
    ('∖', ' set difference '), ('α', ' alpha '), ('β', ' beta '), ('γ', ' gamma '), ('φ', ' phi '),
    ('θ', ' theta '), ('π', ' pi '), ('△', ' triangle '), ('≅', ' is congruent to '), ('∼', ' is similar to '),
    ('↔', ' corresponds to '), ('↦', ' maps to '), ('⊂', ' is a subset of '), ('⊆', ' is a subset of or equal to '),
    ('∠', ' angle '), ('∝', ' is proportional to '), ('½', ' one half '), ('⅓', ' one third '),
    ('⅔', ' two thirds '), ('¼', ' one quarter '), ('¾', ' three quarters '), ('′', ' prime '),
    ('≤', ' is less than or equal to '), ('≥', ' is greater than or equal to '), ('≠', ' is not equal to '),
    ('√', ' square root of '), ('∛', ' cube root of '), ('×', ' times '), ('÷', ' divided by '),
    ('−', ' minus '), ('–', ' to '), ('=', ' equals '), ('≈', ' is approximately '), ('→', ' gives '),
    ('⇒', ' therefore '), ('⇔', ' if and only if '), ('±', ' plus or minus '), ('∩', ' intersection '),
    ('∪', ' union '), ('∈', ' belongs to '), ('∉', ' does not belong to '), ('∅', ' the empty set '),
    ('ℕ', ' the natural numbers '), ('ℤ', ' the integers '), ('ℚ', ' the rational numbers '),
    ('ℝ', ' the real numbers '), ('Σ', ' the sum of '), ('°', ' degrees '), ('%', ' percent '),
    ('∞', ' infinity '), ('⊥', ' is perpendicular to '), ('⟂', ' is perpendicular to '), ('∥', ' is parallel to '),
    ('✓', ' correct '), ('£', ' pounds '), ('·', ' times '),
]

def _power(m):
    value = m.group().translate(_super)
    if value == '2':
        return ' squared '
    if value == '3':
        return ' cubed '
    value = re.sub(r'(?<=[a-z])(?=[a-z])', ' ', value)  # mn → m n
    value = value.replace('-', ' minus ').replace('+', ' plus ')
    return ' to the power ' + value.strip() + ' '

def _fraction_power(m):
    top, bottom = (part.translate(_super) for part in m.groups())
    return f' to the power {top} over {bottom} '

def _subscript(m):
    value = m.group().translate(_sub).replace('+', ' plus ').replace('-', ' minus ')
    return ' subscript ' + value.strip() + ' '

def _named_call(m):
    """P(x), Q(2) are polynomial values; P(E), P(heads), P(A ∩ B) are probabilities."""
    name, arg = m.group(1), m.group(2).strip()
    if re.fullmatch(r'[a-z]|[−-]?\d+(?:\.\d+)?', arg):
        return f'{name} of {arg}'
    if name == 'P' and (re.fullmatch(r'[A-Z]', arg) or re.search(r'[A-Za-z]{2,}|[∩∪]', arg)):
        return 'probability of ' + arg
    return m.group(0)

def spoken(t):
    t = t.replace('e.g.', 'for example').replace('i.e.', 'that is')
    for short, long in [('sin', 'sine'), ('cos', 'cosine'), ('tan', 'tan')]:
        t = t.replace(short + '⁻¹', 'inverse ' + long)
    t = re.sub(r'\b([fgh])⁻¹', r'inverse function \1', t)
    t = re.sub(r'\bsin\b', 'sine', t)
    t = re.sub(r'\bcos\b', 'cosine', t)
    t = re.sub(r'Δ(?=[A-Z]{3})', ' triangle ', t)
    t = re.sub(r'Δ(?=[a-z])', ' change in ', t).replace('Δ', ' delta ')
    t = re.sub(r'(?<![\w])\(([a-e])\)(?=\s)', r'Part \1.', t)  # (a) Expand … → Part a. Expand …
    t = re.sub(r'\b([fgh])\(([^()]+)\)', r'\1 of \2', t)
    t = re.sub(r'\b([PQ])\(([^()]+)\)', _named_call, t)
    for unit, name in UNITS:
        t = re.sub(r'(?<=\d)\s*' + re.escape(unit) + r'(?![\w²³/])', ' ' + name, t)
    t = re.sub(r'(?<=\d)\s+m(?![\w²³/])', ' metres', t)
    t = re.sub(r'(?<=\d)\s+s(?![\w])', ' seconds', t)
    t = re.sub(r'/\s*h\b', ' per hour ', t)
    t = re.sub(r'€\s*([\d,]+(?:\.\d+)?)', r'\1 euros', t)
    t = re.sub(r'£\s*([\d,]+(?:\.\d+)?)', r'\1 pounds', t)
    t = re.sub(r'\$\s*([\d,]+(?:\.\d+)?)', r'\1 dollars', t)
    t = t.replace('€x', 'x euros').replace('€', ' euros ')
    t = re.sub(r'ⁿ√', ' nth root of ', t)
    t = re.sub(f'([{SUPER}]+)⁄([{SUPER}]+)', _fraction_power, t)
    t = re.sub(f'[{SUPER}]+', _power, t)
    t = re.sub(f'[{SUB}]+', _subscript, t)
    t = re.sub(r'(?<=\d):(?=\d)', ' to ', t)          # 2:3
    t = re.sub(r'(?<=\d) : (?=\d)', ' to ', t)        # 2 : 3, but not "x = 2: 25"
    for a, b in SYMBOLS:
        t = t.replace(a, b)
    t = re.sub(r'(\d)([A-Za-rt-z])\b', r'\1 times \2', t)
    t = re.sub(r'(\d)s\b(?=\s*(?:[=+\-×÷/)]|is |equals|plus|minus|times|$))', r'\1 times s', t)  # 2s = 108, not "both 3s"
    t = re.sub(r'(\d)\s*\(', r'\1 times (', t)
    t = re.sub(r'\)\s*\(', ') times (', t)
    t = re.sub(r'\)(?=[a-z]\b)', ') times ', t)
    t = re.sub(r'(?<![A-Za-z])([a-z])\(', r'\1 times (', t)
    t = t.replace('+', ' plus ').replace('<', ' is less than ').replace('>', ' is greater than ')
    t = re.sub(r'(?<=\w)\s*/\s*(?=[\w(])', ' over ', t)
    t = re.sub(r'\^\s*\(?([^ )]+)\)?', r' to the power \1 ', t)
    t = re.sub(r'(?<!\w)-(?=\d)', 'minus ', t)
    t = t.replace('(', ' open bracket ').replace(')', ' close bracket ')
    t = t.replace('/', ' divided by ')
    t = re.sub(r'\|([A-Z])([A-Z])\|', r'length \1 \2', t)
    t = re.sub(r'#\s*([A-Z])', r'number of elements in \1', t)
    t = t.replace('{', ' the set containing ').replace('}', ' end of set ').replace('\\', ' set difference ')
    t = re.sub(r'\s+', ' ', t)
    t = re.sub(r'\s+([.,;:?!])', r'\1', t)
    t = re.sub(r'\.(\s*\.)+', '.', t)
    return t.strip()

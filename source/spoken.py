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
DIGITS = '0-9⁰¹²³⁴⁵⁶⁷⁸⁹'

# Units are only read as units directly after a number; "2m + 1" stays algebra.
# Compound rates come first so that "km/h" is never split into "km" and "/h".
UNITS = [
    ('km/h', 'kilometres per hour'), ('km/min', 'kilometres per minute'), ('m/s²', 'metres per second squared'),
    ('m/s', 'metres per second'), ('m/min', 'metres per minute'), ('cm/s', 'centimetres per second'),
    ('cm/min', 'centimetres per minute'), ('mm/s', 'millimetres per second'), ('L/min', 'litres per minute'),
    ('L/s', 'litres per second'), ('L/h', 'litres per hour'), ('mL/s', 'millilitres per second'),
    ('mL/min', 'millilitres per minute'), ('cm³/s', 'cubic centimetres per second'),
    ('cm³/min', 'cubic centimetres per minute'), ('m³/s', 'cubic metres per second'),
    ('m³/min', 'cubic metres per minute'), ('m³/h', 'cubic metres per hour'), ('kg/m²', 'kilograms per square metre'),
    ('kg/m³', 'kilograms per cubic metre'), ('g/cm³', 'grams per cubic centimetre'),
    ('km²', 'square kilometres'), ('m²', 'square metres'), ('cm²', 'square centimetres'),
    ('mm²', 'square millimetres'), ('in²', 'square inches'), ('ft²', 'square feet'), ('m³', 'cubic metres'),
    ('cm³', 'cubic centimetres'), ('mm³', 'cubic millimetres'), ('in³', 'cubic inches'), ('ft³', 'cubic feet'),
    ('km', 'kilometres'), ('cm', 'centimetres'), ('mm', 'millimetres'), ('kg', 'kilograms'), ('mL', 'millilitres'),
    ('ml', 'millilitres'), ('mins', 'minutes'), ('min', 'minutes'), ('hrs', 'hours'), ('hr', 'hours'),
    ('secs', 'seconds'), ('sec', 'seconds'), ('kWh', 'kilowatt hours'), ('kW', 'kilowatts'),
]
# Single letters are units only after a number and a space (2 h, 15 s, 12 m, 40 L, 5 g); 7h and 2s stay algebra.
LETTER_UNITS = [('h', 'hours'), ('s', 'seconds'), ('m', 'metres'), ('L', 'litres'), ('g', 'grams')]
# Units that have no other meaning are read as units even without a number ("in cm³").
BARE_UNITS = [
    ('km/h', 'kilometres per hour'), ('m/s', 'metres per second'), ('cm/s', 'centimetres per second'),
    ('L/min', 'litres per minute'), ('L/s', 'litres per second'), ('cm³/s', 'cubic centimetres per second'),
    ('km²', 'square kilometres'), ('cm²', 'square centimetres'), ('mm²', 'square millimetres'),
    ('cm³', 'cubic centimetres'), ('mm³', 'cubic millimetres'), ('km', 'kilometres'), ('cm', 'centimetres'),
    ('mm', 'millimetres'), ('kg', 'kilograms'), ('mL', 'millilitres'),
]
UNIT_WORDS = ('kilometres|metres|centimetres|millimetres|litres|millilitres|kilograms|grams|euros|pounds|dollars|cents|'
              'square kilometres|square metres|square centimetres|square millimetres|cubic metres|cubic centimetres|'
              'cubic millimetres|units|items|kilowatt hours|bytes|words|pages|steps')
RATE_DENOMINATORS = {
    'h': 'hour', 'hr': 'hour', 'hour': 'hour', 'min': 'minute', 'minute': 'minute', 's': 'second', 'sec': 'second',
    'second': 'second', 'day': 'day', 'week': 'week', 'month': 'month', 'year': 'year', 'kg': 'kilogram',
    'km': 'kilometre', 'm': 'metre', 'cm': 'centimetre', 'L': 'litre', 'litre': 'litre', 'mL': 'millilitre',
    'unit': 'unit', 'item': 'item', 'person': 'person', 'night': 'night', 'km²': 'square kilometre',
    'm²': 'square metre', 'm³': 'cubic metre', 'kWh': 'kilowatt hour', 'g': 'gram', 'ha': 'hectare',
}
SINGULAR = {'metres': 'metre', 'hours': 'hour', 'minutes': 'minute', 'seconds': 'second', 'litres': 'litre',
            'kilometres': 'kilometre', 'centimetres': 'centimetre', 'millimetres': 'millimetre',
            'kilograms': 'kilogram', 'grams': 'gram', 'euros': 'euro', 'pounds': 'pound', 'dollars': 'dollar',
            'millilitres': 'millilitre', 'days': 'day', 'weeks': 'week', 'months': 'month', 'years': 'year',
            'kilowatt hours': 'kilowatt hour'}
for _length in ('metres', 'kilometres', 'centimetres', 'millimetres'):
    for _power in ('square', 'cubic'):
        SINGULAR[f'{_power} {_length}'] = f'{_power} {SINGULAR[_length]}'
# Longest names first, so "1 square metres" is matched as one unit.
_SINGULAR_PATTERN = '|'.join(sorted(map(re.escape, SINGULAR), key=len, reverse=True))
SYMBOLS = [
    ('∖', ' set difference '), ('α', ' alpha '), ('β', ' beta '), ('γ', ' gamma '), ('φ', ' phi '),
    ('θ', ' theta '), ('π', ' pi '), ('△', ' triangle '), ('≅', ' is congruent to '), ('∼', ' is similar to '),
    ('↔', ' corresponds to '), ('↦', ' maps to '), ('⊂', ' is a subset of '), ('⊆', ' is a subset of or equal to '),
    ('∠', ' angle '), ('∝', ' is proportional to '), ('½', ' one half '), ('⅓', ' one third '),
    ('⅔', ' two thirds '), ('¼', ' one quarter '), ('¾', ' three quarters '), ('′', ' prime '),
    ('≤', ' is less than or equal to '), ('≥', ' is greater than or equal to '), ('≠', ' is not equal to '),
    ('√', ' square root of '), ('∛', ' cube root of '), ('×', ' times '), ('÷', ' divided by '),
    ('−', ' minus '), ('–', ' to '), ('—', ', '), ('=', ' equals '), ('≈', ' is approximately '), ('→', ' gives '),
    ('⇒', ' therefore '), ('⇔', ' if and only if '), ('±', ' plus or minus '), ('∩', ' intersection '),
    ('∪', ' union '), ('∈', ' belongs to '), ('∉', ' does not belong to '), ('∅', ' the empty set '),
    ('ℕ', ' the natural numbers '), ('ℤ', ' the integers '), ('ℚ', ' the rational numbers '),
    ('ℝ', ' the real numbers '), ('Σ', ' the sum of '), ('°', ' degrees '), ('%', ' percent '),
    ('∞', ' infinity '), ('⊥', ' is perpendicular to '), ('⟂', ' is perpendicular to '), ('∥', ' is parallel to '),
    ('✓', ' correct '), ('£', ' pounds '), ('·', ' times '),
]
NOT_PRODUCTS = {'th', 'st', 'nd', 'rd', 'am', 'pm', 'mins', 'min', 'hrs', 'hr', 'sec', 'secs', 'cm', 'mm', 'km', 'kg',
                'ml', 'mL', 'deg', 'ha', 'kW', 'kWh'}

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

def _clock_time(m):
    """Read a marked clock time in 24-hour form, without ratio ambiguity."""
    hour, minute = map(int, m.groups())
    words = ('zero one two three four five six seven eight nine ten eleven '
             'twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen').split()
    def number(n):
        if n < 20:
            return words[n]
        tens = {2: 'twenty', 3: 'thirty', 4: 'forty', 5: 'fifty'}
        return tens[n // 10] + ('-' + words[n % 10] if n % 10 else '')
    if hour == minute == 0:
        return 'midnight'
    hours = ('zero ' if hour < 10 else '') + number(hour)
    minutes = 'hundred hours' if minute == 0 else ('oh ' if minute < 10 else '') + number(minute)
    return hours + ' ' + minutes

def _rate(m):
    unit, denominator = m.group(1), m.group(2)
    return f'{unit} per {RATE_DENOMINATORS[denominator]}'

def _product(m):
    number, letters = m.group(1), m.group(2)
    if letters in NOT_PRODUCTS:
        return m.group(0)
    return f'{number} times {letters}'

def spoken(t, *, clock_times=False):
    # An arrow between words is an implication; between quantities it is "gives".
    t = re.sub(r'\b([fgh])\s*:\s*x\s*→', r'\1: x maps to', t)
    # A chain of two or more word arrows is a sequence of steps: Table → pairs → plot.
    word_arrow = r'(?:(?<=[A-Za-z]{2})|(?<=\)))\s*→\s*(?=[A-Za-z]{2}|\()'
    t = ''.join(re.sub(word_arrow, ', then ', part) if len(re.findall(word_arrow, part)) > 1 else part
                for part in re.split(r'([.;])', t))
    t = re.sub(r'(?<=[A-Za-z]{2})\s*→\s*(?=[A-Za-z]{2})', ' so ', t)   # Parallel lines → equal angles
    # The author supplies context: 12:23 can be a clock time OR a valid ratio.
    # Protect times before the general colon-to-ratio conversion below.
    if clock_times:
        t = re.sub(r'(?<![\w:])([01]?\d|2[0-3]):([0-5]\d)(?!\d|,\d)', _clock_time, t)
    t = t.replace('e.g.', 'for example').replace('i.e.', 'that is')
    t = re.sub(r'(\d)(sin|cos|tan)', r'\1 \2', t)
    t = re.sub(r'\b(sin|cos|tan)(?=[\dθαβ])', r'\1 ', t)
    for short, long in [('sin', 'sine'), ('cos', 'cosine'), ('tan', 'tan')]:
        t = t.replace(short + '⁻¹', 'inverse ' + long)
    t = re.sub(r'\b([fgh])⁻¹', r'inverse function \1', t)
    t = re.sub(r'\bsin\b', 'sine', t)
    t = re.sub(r'\bcos\b', 'cosine', t)
    t = re.sub(r'Δ(?=[A-Z]{3})', ' triangle ', t)
    t = re.sub(r'Δ(?=[a-z])', ' change in ', t).replace('Δ', ' delta ')
    t = re.sub(r'(?<![\w])\(([a-e])\)(?=\s)', r'Part \1.', t)  # (a) Expand … → Part a. Expand …
    if re.search(r'[∩∪∖{}]|\\|\bsets?\b|\bcomplement\b|universal|Venn|elements?\b', t):
        t = re.sub(r'([A-Z])′', r'\1 complement', t)   # A′ in set work; P′ stays an image point in geometry
    t = re.sub(r'\b([fgh])\(([^()]+)\)', r'\1 of \2', t)
    t = re.sub(r'\b([PQ])\(([^()]+)\)', _named_call, t)
    t = re.sub(r'(?<![A-Za-z])n\(([A-Z][^()]*)\)', r'number of elements in \1', t)   # n(A ∩ B)
    t = re.sub(r'#\s*\(([^()]+)\)', r'number of elements in \1', t)
    t = re.sub(r'#\s*([A-Z])', r'number of elements in \1', t)
    t = re.sub(r'\|([A-Z])([A-Z])\|', r'length \1 \2', t)
    t = re.sub(r'\|([a-z]+|[−-]?\d+(?:\.\d+)?)\|', r'the absolute value of \1', t)
    t = re.sub(r'(segment\s+)?\[([A-Z])([A-Z])\]', lambda m: (m.group(1) or 'segment ') + m.group(2) + ' ' + m.group(3), t)
    t = re.sub(r'\[([^\[\]]+?),\s*([^\[\]]+?)\)', r'from \1 up to \2', t)   # the interval [10,20)
    t = re.sub(r'(\d)h(?=\s+\d+\s*min)', r'\1 h', t)   # 2h 30min
    for unit, name in UNITS:
        t = re.sub(f'(?<=[{DIGITS}])\\s*' + re.escape(unit) + r'(?![\w²³])', ' ' + name, t)
        # 4x m², x² cm², 160π cm³, (3/5)x m³: a unit after a variable, π, bracket or superscript.
        t = re.sub(f'(?<=[A-Za-zπ)⁰¹²³⁴⁵⁶⁷⁸⁹])\\s+' + re.escape(unit) + r'(?![\w²³])', ' ' + name, t)
    for unit, name in LETTER_UNITS:
        t = re.sub(f'(?<=[{DIGITS}])\\s+' + unit + r'(?![\w²³/(])', ' ' + name, t)
        if unit in 'mLg':   # (80 + 20π) m, 3π L; h and s after a bracket stay variables
            t = re.sub(r'(?<=[)π])\s+' + unit + r'(?![\w²³/(])', ' ' + name, t)
    for unit, name in BARE_UNITS:
        t = re.sub(r'(?<![\w/])' + re.escape(unit) + r'(?![\w²³/])', name, t)
    t = re.sub(r'°\s*C\b', ' degrees Celsius ', t)
    money = r'(\d+(?:,\d{3})*(?:\.\d+)?)'   # €6, €18 keeps its comma outside the amount
    t = re.sub(r'€\s*' + money, r'\1 euros', t)
    t = re.sub(r'£\s*' + money, r'\1 pounds', t)
    t = re.sub(r'\$\s*' + money, r'\1 dollars', t)
    t = t.replace('€x', 'x euros').replace('€', ' euros ')
    t = re.sub(r'\b(' + UNIT_WORDS + r')\s*/\s*(' + '|'.join(sorted(map(re.escape, RATE_DENOMINATORS), key=len, reverse=True)) + r')(?![\w²³/])', _rate, t)
    # 1 euro, per kilometre, to the nearest centimetre: a single unit is singular.
    t = re.sub(r'((?<![\d.])1|\bper|\bnearest) (' + _SINGULAR_PATTERN + r')\b', lambda m: m.group(1) + ' ' + SINGULAR[m.group(2)], t)
    t = re.sub(r'ⁿ√', ' nth root of ', t)
    t = t.replace('⁴√', ' fourth root of ')
    t = re.sub(f'([{SUPER}]+)⁄([{SUPER}]+)', _fraction_power, t)
    t = re.sub(f'[{SUPER}]+', _power, t)
    t = re.sub(f'[{SUB}]+', _subscript, t)
    t = re.sub(r'\((−?\d+(?:\.\d+)?),\s*(−?\d+(?:\.\d+)?)\)', r' \1 comma \2 ', t)   # the point (3,1)
    t = re.sub(r'(?<=\d):(?=\d)', ' to ', t)          # 2:3
    t = re.sub(r'(?<=\d) : (?=\d)', ' to ', t)        # 2 : 3, but not "x = 2: 25"
    t = re.sub(r'(?<=\d)\s?:\s?(?=√)', ' to ', t)      # 1:√3:2 side ratios
    for a, b in SYMBOLS:
        t = t.replace(a, b)
    t = re.sub(r'(\d)([A-Za-rt-z])\b', r'\1 times \2', t)
    t = re.sub(r'(\d)([a-zA-Z]{2,3})\b', _product, t)   # 3ab, 18xy, 4ac
    t = re.sub(r'(\d)s\b(?=\s*(?:[=+\-×÷/)]|is |equals|plus|minus|times|squared|cubed|$))', r'\1 times s', t)  # 2s = 108, not "both 3s"
    t = re.sub(r'(\d)\s*\(', r'\1 times (', t)
    t = re.sub(r'\)\s*\(', ') times (', t)
    t = re.sub(r'\)(?=[a-z]\b)', ') times ', t)
    t = re.sub(r'(?<![A-Za-z])([a-z])\(', r'\1 times (', t)
    t = t.replace('+', ' plus ').replace('<', ' is less than ').replace('>', ' is greater than ')
    t = re.sub(r'(?<=\w)\s*/\s*(?=[\w(])', ' over ', t)
    # Preserve the complete exponent and its brackets after fractions/signs
    # have become words. Consuming one token left orphan closing brackets.
    t = re.sub(r'\^\s*', ' to the power ', t)
    t = re.sub(r'(?<!\w)-(?=\d)', 'minus ', t)
    t = t.replace('(', ' open bracket ').replace(')', ' close bracket ')
    t = t.replace('[', ' open bracket ').replace(']', ' close bracket ')
    t = t.replace('/', ' divided by ')
    t = t.replace('{', ' the set containing ').replace('}', ' end of set ').replace('\\', ' set difference ')
    t = re.sub(r'(?<=\d)\s*\|\s*(?=\d)', ' bar ', t)    # the stem-and-leaf key 2 | 3
    t = re.sub(r'\s+', ' ', t)
    t = re.sub(r'\s+([.,;:?!])', r'\1', t)
    t = re.sub(r',(\s*,)+', ',', t)
    t = re.sub(r'\.(\s*\.)+', '.', t)
    return t.strip()

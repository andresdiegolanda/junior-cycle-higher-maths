"""Independent symbolic check of the generated skill-drill questions.

The JavaScript generators state, for every question, what should be true of its
answer (an identity, the solutions of an equation, a statistic of a data set).
This test recomputes each claim with sympy or plain Python, so an arithmetic slip
in a generator cannot reach a student unnoticed.
"""
import json, re, subprocess, sys, tempfile, statistics
from collections import Counter
from fractions import Fraction
from pathlib import Path
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application, convert_xor, split_symbols

ROOT = Path(__file__).parent
TRANSFORMS = standard_transformations + (split_symbols, implicit_multiplication_application, convert_xor)

def call_parts(s, start):
    depth, part, parts = 0, '', []
    for i in range(start, len(s)):
        c = s[i]
        if c == '(':
            if depth: part += c
            depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0:
                parts.append(part.strip()); return parts, i + 1
            part += c
        elif c == ',' and depth == 1:
            parts.append(part.strip()); part = ''
        else:
            part += c
    raise ValueError('Unclosed call in ' + s)

def plain(text):
    s = str(text).replace('−', '-').replace('×', '*').replace('÷', '/').replace('{', '(').replace('}', ')')
    while 'frac(' in s:
        at = s.index('frac(')
        parts, end = call_parts(s, at + 4)
        assert len(parts) == 2, text
        s = s[:at] + '((' + parts[0] + ')/(' + parts[1] + '))' + s[end:]
    return s

def expr(text):
    return parse_expr(plain(text), transformations=TRANSFORMS)

def number(text):
    return sp.nsimplify(expr(text), rational=True)

def fill(text, sample):
    """Replace ANSWER, ANSWER0, ANSWER1... by the question's own answer."""
    answer = sample['answerText']
    def one(m):
        if m.group(1):
            assert isinstance(answer, list), ('ANSWERn needs a fields answer', sample['skill'])
            return '(' + answer[int(m.group(1))] + ')'
        if sample['answer']['type'] == 'inequality':
            return '(' + str(sample['answer']['value']) + ')'
        assert isinstance(answer, str), ('ANSWER needs a single answer', sample['skill'])
        return '(' + answer + ')'
    return re.sub(r'ANSWER(\d?)', one, str(text))

def uses_answer(claim):
    return 'ANSWER' in json.dumps(claim)

def check(claim, sample):
    op, where = claim['op'], f"{sample['skill']} level {sample['level']+1} seed {sample['seed']}: {sample['prompt']} {sample['math'] or ''}"
    f = lambda t: fill(t, sample)
    if op == 'none':
        assert claim.get('reason'), where + ' needs a reason for op none'
        return 'none'
    if op not in ('inequality', 'factorised'):
        assert uses_answer(claim), where + ': the claim must mention ANSWER'
    if op == 'identity':
        assert sp.simplify(expr(f(claim['a'])) - expr(f(claim['b']))) == 0, where
    elif op == 'factorised':
        target = sp.expand(expr(claim['expr']))
        assert sp.expand(expr(f('ANSWER')) - target) == 0, where
        _, factors = sp.factor_list(target)
        assert sum(power for _, power in factors) == sample['factorCount'], where + ': not fully factorised'
    elif op == 'solve':
        left, right = f(claim['eq']).split('=')
        v = sp.Symbol(claim.get('variable', 'x'))
        found = sp.solveset(sp.Eq(expr(left), expr(right)), v, sp.S.Reals)
        wanted = sp.FiniteSet(*[number(f(s)) for s in claim['solutions']])
        assert found == wanted, f'{where}: solutions {found}, stated {wanted}'
    elif op == 'system':
        eqs = [sp.Eq(expr(e.split('=')[0]), expr(e.split('=')[1])) for e in claim['eqs']]
        names = sorted(claim['solution'])
        found = sp.solve(eqs, [sp.Symbol(n) for n in names], dict=True)
        assert len(found) == 1, where
        for n in names:
            assert sp.simplify(found[0][sp.Symbol(n)] - number(f(claim['solution'][n]))) == 0, where
    elif op == 'value':
        value = expr(f(claim['expr']))
        for name, v in (claim.get('subs') or {}).items():
            value = value.subs(sp.Symbol(name), number(f(v)))
        stated = number(f(claim['equals']))
        if 'round' in claim:
            assert abs(float(value) - float(stated)) <= 0.5 * 10 ** -claim['round'] + 1e-9, f'{where}: {value} against {stated}'
            assert round(float(stated), claim['round']) == float(stated) or sample['answer'].get('round') == claim['round'], where
        else:
            assert sp.simplify(value - stated) == 0, f'{where}: {sp.simplify(value)} against {stated}'
    elif op == 'inequality':
        v = sp.Symbol(claim.get('variable', 'x'))
        text = plain(claim['ineq'])
        m = re.match(r'^(.*?)(<=|>=|<|>)(.*)$', text)
        rel = {'<': sp.Lt, '>': sp.Gt, '<=': sp.Le, '>=': sp.Ge}
        found = sp.solve_univariate_inequality(rel[m.group(2)](expr(m.group(1)), expr(m.group(3))), v, relational=False)
        a = sample['answer']
        bound = number(str(a['value']))
        wanted = {'<': sp.Interval.open(-sp.oo, bound), '<=': sp.Interval(-sp.oo, bound), '>': sp.Interval.open(bound, sp.oo), '>=': sp.Interval(bound, sp.oo)}[a['op']]
        assert found == wanted, f'{where}: solution {found}, stated {wanted}'
    elif op == 'stat':
        data = [Fraction(str(x)) for x in claim['data']]
        if 'freq' in claim:
            data = [x for x, n in zip(data, claim['freq']) for _ in range(int(n))]
        fn = claim['fn']
        if fn == 'mean': value = sum(data) / len(data)
        elif fn == 'median': value = statistics.median(data)
        elif fn == 'range': value = max(data) - min(data)
        elif fn == 'mode':
            counts = Counter(data); top = max(counts.values())
            modes = [x for x, n in counts.items() if n == top]
            assert len(modes) == 1, where + ': the mode is not unique'
            value = modes[0]
        else: raise AssertionError(where + ': unknown statistic ' + fn)
        stated = Fraction(str(sp.nsimplify(number(f(claim['equals'])), rational=True)))
        if 'round' in claim:
            assert abs(float(value) - float(stated)) <= 0.5 * 10 ** -claim['round'] + 1e-9, f'{where}: {value} against {stated}'
        else:
            assert value == stated, f'{where}: {value} against {stated}'
    else:
        raise AssertionError(where + ': unknown claim ' + op)
    return op

def main():
    with tempfile.TemporaryDirectory() as folder:
        out = Path(folder) / 'samples.json'
        subprocess.run(['node', str(ROOT / 'test-skills.cjs'), '--export', str(out)], check=True, stdout=subprocess.DEVNULL)
        samples = json.loads(out.read_text(encoding='utf-8'))
    counts = Counter()
    unchecked = Counter()
    for sample in samples:
        for claim in sample['verify']:
            kind = check(claim, sample)
            counts[kind] += 1
            if kind == 'none': unchecked[sample['skill']] += 1
        # Worked steps must end on the stated answer when the answer is a single number.
    assert samples, 'No samples exported'
    skills = {s['skill'] for s in samples}
    limit = 0.35 * len(samples)
    assert counts['none'] <= limit, f"Too many questions without an independent check: {counts['none']} of {len(samples)}"
    detail = ', '.join(f'{k} {v}' for k, v in sorted(counts.items()))
    print(f'Skill answers verified independently: {len(samples)} questions from {len(skills)} skills ({detail}).')

if __name__ == '__main__':
    main()

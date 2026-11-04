"""Check authored intermediate maths, not only final answers.

Symbolic checks cover complete expression chains, equation solution sets and
simultaneous systems. The remaining prose, models, geometry and constructions
need editorial review; these checks do not claim to prove every explanation.
"""
from pathlib import Path
import ast
import json
import re
import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations, implicit_multiplication_application,
    convert_xor, rationalize,
)

ROOT = Path(__file__).parent
data = json.loads((ROOT / 'compiled-data.json').read_text(encoding='utf-8'))
questions = {q['id']: q for c in data for l in c['lessons'] for q in l['exercises']}
challenges = {q['id']: q for c in data for q in c['challenges']}

# Reuse the independently authored original expressions, not generated working.
tree = ast.parse((ROOT / 'test-practice.py').read_text(encoding='utf-8'))
references = {}
for node in tree.body:
    if isinstance(node, ast.Assign):
        for name in node.targets:
            if isinstance(name, ast.Name) and name.id in ('identities', 'equations'):
                references[name.id] = ast.literal_eval(node.value)

def expression(text):
    text = text.strip().replace('−', '-').replace('×', '*').replace('÷', '/')
    text = text.replace('[', '(').replace(']', ')').replace('π', 'pi')
    table = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺', '0123456789-+')
    text = re.sub(r'[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+', lambda m: '^(' + m[0].translate(table) + ')', text)
    # Convert a root sign with one complete operand, preserving its scope.
    while '√' in text or '∛' in text:
        match = re.search(r'[√∛]', text)
        start = match.start(); end = start + 1
        if text[end] == '(':
            depth = 1; end += 1
            while depth:
                depth += (text[end] == '(') - (text[end] == ')'); end += 1
        else:
            operand = re.match(r'\d+(?:\.\d+)?|[a-z]', text[end:])
            assert operand, text
            end += len(operand[0])
        radicand = text[start+1:end]
        root = 'sqrt(' + radicand + ')' if match[0] == '√' else '(' + radicand + ')^(1/3)'
        text = text[:start] + root + text[end:]
    return parse_expr(text, transformations=standard_transformations + (
        implicit_multiplication_application, convert_xor, rationalize))

def body(text):
    text = re.split(r', (?:with|for|x ≠)|;|\. ', text)[0].rstrip('.')
    if ':' in text:
        text = text.split(':', 1)[1].strip()
    return text

checked = 0
identity_cases = dict(references['identities'])
identity_cases.update({
    '01-07-w4': '(2x**3+3x**2-8x-12)/(x+2)',
    '21-01-w2': '(2x+1)/4+(x-3)/2',
    '21-01-w4': '(x-1)/2+(2x+3)/3-(x+5)/6',
    '21-02-w4': '(x+6)/x',
    '14-02-w1': '5', '14-02-w2': '9', '14-02-w3': '1/8',
    '14-04-w4': '4sqrt(2)', '14-05-w3': '1200',
    '14-07-w1': '6', '14-07-w2': '2',
})
for key, original in identity_cases.items():
    count = 0
    for step in questions[key]['solution']:
        if re.match(r'At |First square:|Bounds:|Zeros:|To find zeros:|Counterexample|Polynomial identity:|x = −1 still', step):
            continue  # A labelled additional subpart, not the simplification chain.
        text = body(step)
        if key.startswith('19-03'):
            text = text.split('=', 1)[1]  # Keep the full function output RHS.
        for part in text.split('='):
            assert sp.simplify(expression(part) - expression(original)) == 0, (key, step, original)
            checked += 1
        count += 1
    assert count >= 2, (key, 'Expected multiple complete expressions')

def roots(line, variable):
    result = sp.EmptySet
    for alternative in line.split(' or '):
        left, right = alternative.split('=')
        result = result.union(sp.solveset(expression(left) - expression(right), variable, domain=sp.S.Reals))
    return result

x = sp.Symbol('x')
for key, (equation, _) in references['equations'].items():
    expected = sp.solveset(expression(equation), x, domain=sp.S.Reals)
    for step in questions[key]['solution']:
        text = body(step)
        assert roots(text, x) == expected, (key, step, expected)
        checked += 1

# Every elimination step still carries a full system with the same unique pair.
for key, names, expected in [
    ('10-01-w1', 'x y', (9, 4)), ('10-01-w2', 'x y', (4, 2)),
    ('10-01-w3', 'x y', (8, 3)), ('10-01-w4', 'a c', (10, 7)),
]:
    variables = sp.symbols(names)
    for step in questions[key]['solution']:
        text = body(step).replace('€', '')
        equations = [expression(a) - expression(b) for a, b in
                     (s.split('=') for s in text.split(' and '))]
        assert len(equations) == 2, (key, step)
        assert sp.solve(equations, variables) == dict(zip(variables, expected)), (key, step)
        checked += 1

# Cancellation must not silently restore excluded inputs.
for key, exclusion in {
    '02-06-w2': 'x ≠ 4', '02-06-w3': 'x ≠ 2, −2',
    '21-08-w4': 'x ≠ −2, 2, −1/2', '21-09-w4': 'x ≠ −1, 1, −2',
    '21-10-w4': 'x ≠ −1, 1',
}.items():
    chain = [s for s in questions[key]['solution'] if not s.startswith('Zeros:')]
    assert all(exclusion in s for s in chain), key

# A whole quotient must survive each challenge division/factorisation step.
for key, original, count in [
    ('01-c02', '(2x**3+5x**2-4x-3)/(x+3)', 3),
    ('02-c03', '(x**3-2x**2-9x+18)/(x**2-5x+6)', 3),
]:
    for step in challenges[key]['solution'][:count]:
        for part in body(step['math']).split('=')[1:]:
            assert sp.simplify(expression(part) - expression(original)) == 0, (key, step)
            checked += 1

# Regression for the requested presentation, and retained function context.
assert questions['01-01-w1']['solution'] == ['8x + 3 − 5x + 6', '8x − 5x + 3 + 6', '3x + 9']
assert questions['19-03-w4']['solutionHelp'][0]['id'] != 'square-difference'
assert questions['19-03-w4']['solutionHelp'][1]['id'] == 'square-difference'
assert questions['19-03-w4']['solutionHelp'][2]['id'] == 'negative-bracket'
assert questions['21-01-w4']['solutionHelp'][-1]['reminder'] is True
assert questions['08-05-w3']['solution'][-1].endswith('8 m.')
assert questions['22-05-w2']['solution'][-1].endswith('14.00 m.')
print(f'Working-line checks passed: {checked} intermediate expressions, equations and systems; domains and rule placement retained.')

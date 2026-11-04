"""Check rule coverage and the explanations actually shipped in each HTML."""
import json
from pathlib import Path
import re
from rule_help import square_application, specific_rule

ROOT = Path(__file__).resolve().parent.parent


def read_data(path):
    text = path.read_text(encoding='utf-8')
    return json.loads(re.search(r'<script>const DATA=(.*?);</script>', text, re.S)[1])


data = read_data(ROOT / 'site/index.html')
library = data['ruleLibrary']
chapters = {c['id']: c for c in data['chapters']}
counts = {'teaching': 0, 'choice': 0, 'written': 0, 'challenge': 0}


def check_help(h, kind):
    assert h['id'] in library, h
    assert library[h['id']]['kind'] in ('rule', 'method')
    if 'bindings' in h:
        assert h['id'] in ('square-sum', 'square-difference')
        assert [b['symbol'] for b in h['bindings']] == ['a', 'b']
        assert 'application' in h
    counts[kind] += 1


for rule in library.values():
    for field in ('title', 'formula', 'why', 'condition'):
        assert rule[field].strip(), (field, rule)
    method = chapters[rule['chapter']]['toolkit']['methods'][rule['method']]
    assert method['lessonId'] == rule['lesson'], rule
    assert any(l['id'] == rule['lesson'] for l in chapters[rule['chapter']]['lessons'])

for c in chapters.values():
    for lesson in c['lessons']:
        for step in lesson['steps']:
            check_help(step['stepHelp'], 'teaching')
            assert step['stepHelp']['note'] == step['why']
        for q in lesson['exercises']:
            if q['type'] == 'choice':
                check_help(q['explanationHelp'], 'choice')
            else:
                assert len(q['solutionHelp']) == len(q['solution']), q['id']
                for h in q['solutionHelp']:
                    check_help(h, 'written')
    for q in c['challenges']:
        for step in q['solution']:
            check_help(step['stepHelp'], 'challenge')
            assert step['stepHelp']['note'] == step['reason']

assert counts == {'teaching': 646, 'choice': 316, 'written': 960, 'challenge': 445}, counts
assert sum(counts.values()) == 2367
# Standalone pages must retain the complete rule library (cross-chapter links)
# and exactly the same step associations as the full guide.
for path in sorted((ROOT / 'site').glob('[0-9]*.html')):
    standalone = read_data(path)
    assert standalone['ruleLibrary'] == library, path
    assert standalone['chapters'] == [chapters[standalone['chapters'][0]['id']]], path

# Regression: a shifted parabola is not automatically an expansion step.
assert square_application('y = (x − 2)²; vertex (2, 0)', title='Move the vertex') is None
assert square_application('x = 2', question='Expand (x + 3)²') is None
assert specific_rule('Domain = {1, 2}; range = {3, 5}', title='Read the domain') is None
assert specific_rule('The denominator must be non-zero.', title='Apply domain restrictions')['id'] == 'domain'
for expression, a, b, key in [
    ('(x + 3)²', 'x', '3', 'square-sum'),
    ('(2x - 5)^2', '2x', '5', 'square-difference'),
    ('(3 + 4)²', '3', '4', 'square-sum'),
]:
    help_item = square_application(expression, title='Expand the square')
    assert help_item['id'] == key
    assert help_item['bindings'] == [{'symbol': 'a', 'value': a}, {'symbol': 'b', 'value': b}]

functions = next(l for l in chapters[19]['lessons'] if l['id'] == '19-03')
actual = functions['steps'][2]['stepHelp']
assert actual['id'] == 'square-sum'
assert actual['bindings'] == [{'symbol': 'a', 'value': 'k'}, {'symbol': 'b', 'value': '1'}]
assert actual['application'] == '(k + 1)² = (k)² + 2 × (k) × (1) + (1)²'
written = next(q for q in functions['exercises'] if q['id'] == '19-03-w4')
# The square appears in step 1; the identity belongs beside its expansion in step 2.
assert written['solutionHelp'][0]['id'] != 'square-difference'
assert written['solutionHelp'][1]['id'] == 'square-difference'
assert written['solutionHelp'][1]['bindings'] == [{'symbol': 'a', 'value': '2k'}, {'symbol': 'b', 'value': '1'}]
assert written['solutionHelp'][2]['id'] == 'negative-bracket'
assert library['zero-product']['formula'] == 'AB = 0 ⇒ A = 0 or B = 0'
assert 'non-zero' in library['cancel']['why']
assert 'right-angled' in library['pythagoras']['condition']
assert 'equally likely' in library['probability']['condition']
quadratic = next(q for q in chapters[19]['challenges'] if q['id'] == '19-c03')
assert [s['stepHelp']['id'] for s in quadratic['solution']] == [
    'method-19-8', 'intercepts', 'nonnegative-square', 'zero-product']
print(f'Rule content passed: {sum(counts.values())} step helpers, {len(library)} reminders, 25 pages, valid Toolkit links and square-identity substitutions.')

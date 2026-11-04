"""Attach local rule explanations without exposing unrevealed solution steps.

Long problems have an authored method for every step. Teaching and topic
practice inherit their lesson's method; only narrow, explicit operation cues
replace that reminder with a specific rule. A reminder is labelled as such,
not presented as a claim that a general formula was applied in this exact step.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).parent / 'data'
LESSON_METHODS = {
    '01-02': 1, '01-07': 7, '04-04': 4, '04-07': 7, '08-06': 6,
    '19-01': 0, '19-06': 4, '21-01': 'fraction-add', '21-02': 'cancel',
}
TERM = r'(?:\d+(?:\.\d+)?[a-z]?|[a-z])'
BINOMIAL = re.compile(r'\(\s*(' + TERM + r')\s*([+−-])\s*(' + TERM + r')\s*\)\s*(?:²|\^2)')


def square_application(text, question='', title=''):
    """Recognise an actual expansion, not just a shifted quadratic graph."""
    for source in (text, question):
        match = BINOMIAL.search(source)
        if not match:
            continue
        a, sign, b = match.groups()
        # A different square elsewhere in the SAME expression is not evidence
        # that this binomial was expanded. Look after the next equality/arrow,
        # or compare against the immediately preceding revealed line.
        if source == text:
            transition = re.search(r'=|→|⇒', text[match.end():])
            outside = (text[match.end() + transition.end():]
                       if transition else '')
        else:
            outside = text if not BINOMIAL.search(text) else ''
        expands = re.search(r'expand|cross.product|middle term|false expansion', title + ' ' + text, re.I)
        has_expanded_square = re.search(r'[a-z]²|[a-z]\^2', outside)
        if not (expands or has_expanded_square):
            continue
        minus = sign != '+'
        symbol = '−' if minus else '+'
        return {
            'id': 'square-difference' if minus else 'square-sum',
            'bindings': [{'symbol': 'a', 'value': a}, {'symbol': 'b', 'value': b}],
            'application': f'({a} {symbol} {b})² = ({a})² {symbol} 2 × ({a}) × ({b}) + ({b})²',
        }
    return None


def specific_rule(text, title='', question=''):
    square = square_application(text, question, title)
    if square:
        return square
    # Only use explicit cues in the current step, never a later answer.
    action = (title or text).strip().lower()
    if re.match(r'(?:check|verify)\b', action) or re.search(r'check (?:in|both) (?:the )?original', text, re.I):
        return {'id': 'check'}
    if re.search(r'\b(?:substitute|back-substitute)\b', action):
        return {'id': 'substitute'}
    if (re.search(r'\b(?:restrictions?|excluded|exclusions?)\b', action)
            or (re.search(r'\bdomain\b', action)
                and re.search(r'denominator|admissible|allowed|restrict', title + ' ' + text, re.I))):
        return {'id': 'domain'}
    if re.search(r'\bdiscriminant\b', action):
        return {'id': 'discriminant'}
    if re.search(r'\b(?:collect|combine) (?:the )?(?:like terms|coefficients|by degree)\b', title + ' ' + text, re.I):
        return {'id': 'like-terms'}
    if re.search(r'subtract the whole expression using brackets|minus (?:sign )?before (?:the )?bracket', text, re.I):
        return {'id': 'negative-bracket'}
    if re.search(r'\b(?:cancel|cancelling) (?:the )?(?:common|complete|whole|non.zero) factors\b', title + ' ' + text, re.I):
        return {'id': 'cancel'}
    if re.search(r'\bround (?:at the end|the requested|to \d)', title + ' ' + text, re.I):
        return {'id': 'round'}
    return None


def attach_rule_help(chapters):
    library = json.loads((ROOT / 'step-rules.json').read_text(encoding='utf-8'))
    challenge_map = json.loads((ROOT / 'challenge-rule-map.json').read_text(encoding='utf-8'))
    chapter_by_id = {c['id']: c for c in chapters}
    for rule in library.values():
        rule['kind'] = 'rule'
        method = chapter_by_id[rule['chapter']]['toolkit']['methods'][rule['method']]
        rule['lesson'] = method['lessonId']
    for c in chapters:
        for i, m in enumerate(c['toolkit']['methods']):
            library[f'method-{c["id"]:02}-{i}'] = {
                'kind': 'method', 'title': m['title'], 'formula': m['rule'],
                'why': m['when'], 'condition': m['trap'],
                'chapter': c['id'], 'method': i, 'lesson': m['lessonId'],
            }

    count = 0
    def help_for(chapter, default, text, title='', question='', note='', explicit=False):
        nonlocal count
        key = f'method-{chapter:02}-{default}' if isinstance(default, int) else default
        assert key in library, ('Unknown rule', key)
        recognised = None if explicit else specific_rule(text, title, question)
        help_item = recognised or {'id': key}
        if not explicit and not recognised and library[key]['kind'] == 'rule':
            # A lesson-wide fallback is useful context, not evidence that the
            # same operation was performed on every newly expanded working line.
            help_item['reminder'] = True
        if key in ('square-sum', 'square-difference'):
            help_item = square_application(text, question, title) or help_item
        # A supplied reason explains this particular step. Never copy the
        # question's final answer or any unrevealed future working into a card.
        if note:
            help_item['note'] = note
        count += 1
        return help_item

    for c in chapters:
        methods = c['toolkit']['methods']
        for l in c['lessons']:
            matching = [i for i, m in enumerate(methods) if m['lessonId'] == l['id']]
            default = LESSON_METHODS.get(l['id'], matching[0] if matching else None)
            assert default is not None, ('Missing lesson method', l['id'])
            for s in l['steps']:
                s['stepHelp'] = help_for(c['id'], default, s['math'], s['title'], note=s['why'])
            for q in l['exercises']:
                if q['type'] == 'choice':
                    q['explanationHelp'] = help_for(c['id'], default, q['explanation'], question=q['question'])
                else:
                    # The preceding line is already revealed. It can contain
                    # the square that the CURRENT line expands, without being
                    # repeated in that line or in the question itself.
                    q['solutionHelp'] = [help_for(c['id'], default, s,
                        question=q['solution'][i-1] if i else q['question'])
                        for i, s in enumerate(q['solution'])]
        for q in c['challenges']:
            rules = challenge_map[q['id']]
            assert len(rules) == len(q['solution']), ('Missing challenge step', q['id'])
            for s, rule in zip(q['solution'], rules):
                s['stepHelp'] = help_for(c['id'], rule, s['math'], s['title'], q['question'], s['reason'], explicit=True)
    assert set(challenge_map) == {q['id'] for c in chapters for q in c['challenges']}
    return library, count

"""Authored conceptual bridges and presentation-only working segmentation.

The mathematical source strings and question IDs remain authoritative. This
module adds reading structure; it never invents an algebraic transformation.
"""
from pathlib import Path
import re,json

ROOT = Path(__file__).parent

def load_coaches():
    result = {}
    for line in (ROOT/'data/learning-coaches.txt').read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        key, hook, idea, start, why = line.split('|')
        assert key not in result, key
        result[key] = dict(hook=hook, idea=idea, start=start, why=why)
    return result

def reading_parts(text):
    """Break only at explicit prose boundaries, never inside a formula.

    Semicolons separate complete clauses in the authored workings. Keep
    restrictions attached to the formula they qualify. Mathematical equality,
    implication and set membership are deliberately not treated as separators.
    """
    parts = re.split(r';\s+(?!with\b|for\b|still\b)|(?<=[.!?])\s+(?=[A-Z])', text.strip())
    return [p.strip() for p in parts if p.strip()]

def add_learning_design(chapters, narrator, rule_library):
    coaches = load_coaches()
    worked_notes=json.loads((ROOT/'data/worked-coaching.json').read_text(encoding='utf-8'))
    written={q['id']:q for c in chapters for l in c['lessons'] for q in l['exercises'] if q['type']=='written'}
    assert set(worked_notes)<=set(written), 'Unknown worked-coaching question'
    assert all(len(notes)==len(written[key]['solution']) for key,notes in worked_notes.items()), 'Every tailored note must match its worked step'
    assert set(coaches) == {l['id'] for c in chapters for l in c['lessons']}, 'Every lesson needs an authored conceptual bridge'
    for c in chapters:
        c['explorerLesson'] = c['lessons'][0]['id']
        for l in c['lessons']:
            coach = dict(coaches[l['id']])
            say = narrator(l['id'])
            coach['speech'] = say(coach['hook']+' '+coach['idea'])
            coach['speechPlan'] = say('Make a plan. '+coach['start']+' '+coach['why'])
            l['coach'] = coach
            for s in l['steps']:
                s['textParts'] = reading_parts(s['text'])
                s['whyParts'] = reading_parts(s['why'])
            for q in l['exercises']:
                q['questionParts'] = reading_parts(q['question'])
                if q['type'] == 'choice':
                    q['explanationParts'] = reading_parts(q['explanation'])
                    continue
                q['workedReading'] = []
                for i, text in enumerate(q['solution']):
                    help_item = q['solutionHelp'][i]
                    rule = rule_library[help_item['id']]
                    # Only a specifically recognised rule may explain this step.
                    # A lesson-wide fallback remains a labelled method reminder.
                    reason = rule['why'] if rule['kind']=='rule' and not help_item.get('reminder') else ''
                    if q['id'] in worked_notes:
                        reason=worked_notes[q['id']][i]
                    q['workedReading'].append(dict(parts=reading_parts(text), reason=reason))
                    if reason:
                        q['speechSolution'][i] = narrator(l['id'],q['id'])(text+' Why this move works. '+reason)
        for q in c['challenges']:
            q['questionParts'] = re.split(r'\s+(?=\([a-f]\))', q['question'])
            for s in q['solution']:
                s['mathParts'] = reading_parts(s['math'])
                s['reasonParts'] = reading_parts(s['reason'])
